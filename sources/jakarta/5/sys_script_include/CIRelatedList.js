// Discovery class
gs.include("PrototypeServer");

/**
 * Utility class for working with CI related lists. Each instance of this class contains the details of a single list 
 * that is related to a particular CI. The details of this list AND the contents of the list are included.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var CIRelatedList = Class.create();

CIRelatedList.prototype = { 
    /*
     * Initializes a new instance of this class.  With no arguments, simply constructs an empty instance.
     * 
     * table: the table containing the related list (if many-to-many, the many-to-many table)
     * ref_field: the reference field in the table for this related list
     * cmdb_ci: The sys_id of the CI this list is related to.
     * debug_flag: true if debug logging is enabled.
     */
    initialize: function(table, ref_field, cmdb_ci, debug_flag) {
        this.GlideRecordUtil = new GlideRecordUtil();
        this.ignoreFields = {
            'sys_created_by' : true,
            'sys_updated_by' : true,
            'sys_mod_count'  : true
            };

        // array of hashmaps, one for each record in the related list...
        this.records = [];

        // array of hashmaps, one for each record in the m2m list (if there is one)...
        this.m2m_records = [];

        this.table_name = (arguments.length >= 1) ? table : null;
        this.field_name = (arguments.length >= 2) ? ref_field : null;
        this.cmdb_ci =    (arguments.length >= 3) ? cmdb_ci : null;
        this.debug_flag = (arguments.length >= 4) ? debug_flag : null;
		
		// Fields and flag to be set if the table is m2m
        this.isM2M = false;
        this.target_table_name = null;
        this.target_ref_field_name = null;
		
        // false for one-to-many; true for many-to-many...
		// this.isM2M, target_table_name and target_ref_field_name are all set in the following two calls
        if (!this.checkSysM2M()) 
            this.checkSysCollection();
		
		// If there's no cmdb_ci record, don't populate!
		if (this.cmdb_ci == null)
			return;
		
        // now get our data...
        this.populate();
    },

    /*
     * Populates the this.records field of this instance.
     */
    populate: function() {
		if (this.cmdb_ci == null) {
			gs.log("Unable to load records from CIRelatedList script include due to invalid ci");
			return;
		}
		
        // no matter what happens, we need our related list...
        var relTable = new GlideRecord(this.table_name);
        relTable.addQuery(this.field_name, this.cmdb_ci);
        relTable.query();

        // if this isn't a many-to-many list, just load the records and skedaddle...
        if (!this.isM2M) {
            this._loadRecords(relTable, this.records);
            return;
        }

        // it's a many-to-many list, so first load the m2m records...
        this._loadRecords(relTable, this.m2m_records);

        // now load the target records, in chunks so our query doesn't get too darned big...
        var sys_ids = new Packages.java.util.ArrayList();
        for (var i = 0; i < this.m2m_records.length; i++) {
            sys_ids.add(this.m2m_records[i][this.target_ref_field_name]);
            if (sys_ids.size() >= 50)
                this._loadChunk(sys_ids);
        }
        if (sys_ids.size() > 0)
            this._loadChunk(sys_ids);
    },

    /*
     * Remove all the related list items.
     */
    remove: function() {
        var rlgr = new GlideRecord(this.table_name);
        rlgr.addQuery(this.field_name, this.cmdb_ci);
        rlgr.deleteMultiple();
        this.records = [];
        this.m2m_records = [];
    },

    /*
     * Adds the given record to the related list.
     */
    addRec: function(record) {
        this.records.push(record);
    },

    /*
     * Sets the given records to the related list.
     */
    addRecs: function(records) {
        this.records = records;
    },

    /*
     * Populates a chunk of the target table when it's a many-to-many table.
     * 
     * sys_ids: a Java ArrayList of the sys_ids of the target table to load
     */
    _loadChunk: function(sys_ids) {
        // query our real related list for the record in sys_ids...
        var relTable = new GlideRecord(this.target_table_name);
        relTable.addQuery('sys_id', sys_ids);
        relTable.query();

        // finally - load our records...
        this._loadRecords(relTable, this.records);
        sys_ids.clear();
    },

    /*
     * Loads the related list records in the given GlideRecord instance into the given array.
     * 
     * relTable: a GlideRecord initialized to the records for a related list.
     * records: the array to add records to.
     */
    _loadRecords: function(relTable, records) {
        while (relTable.next()) {
            var hm = {};
            this.GlideRecordUtil.populateFromGR(hm, relTable, this.ignoreFields);
            records.push(hm);
        }
    },

    /*
     * Check to see if this is a Sys many-to-many table.  If it is, set the target table name and reference field name.
     */
    checkSysM2M: function() {
        // use some existing Java code to do the actual check...
        var my_many = new GlideSYSMany2Many();
        this.isM2M = my_many.isMtm(this.table_name);
        if (!this.isM2M)
            return false;

        // ok, we are a Sys many-to-many -- so set the target table name and reference field name...
        if (my_many.getFromField() == this.field_name) {
            this.target_table_name = my_many.getTargetTable();
            this.target_ref_field_name = my_many.getTargetField();
        } else {
            this.target_table_name = my_many.getFromTable();
            this.target_ref_field_name = my_many.getFromField();
        }

        // and skedaddle indicating what we are...
        return true;
    },

    /*
     * Check to see if this is a SysCollection table.  If it is, set the target table name and reference field name.
     */
    checkSysCollection: function() {
        // see if any record in the sys_collection table has this table's name...
        var scGR = new GlideRecord('sys_collection');
        scGR.addQuery('collection', this.table_name);
        scGR.query();
        var tables = [];
        var fields = [];
        while (scGR.next()) {
            tables.push(scGR.getValue('name'));
            fields.push(scGR.getValue('join_field'));
        }

        // if we didn't find exactly two records (one parent, one child), then bail out...
        if (tables.length != 2)
            return false;

        // ok, we are a SysCollection table -- so set the target table name and reference field name...
        this.isM2M = true;
        var src = (fields[0] == this.field_name) ? 1 : 0;
        this.target_table_name = tables[src];
        this.target_ref_field_name = fields[src];

        // and skedaddle indicating what we are...
        return true;
    },

    /*
     * Initializes this instance from the given XML element.
     */
    fromXML: function(element) {
        var xml_util = GlideXMLUtil;

        // look through our children for fields or list records...
        var it = xml_util.childElementIterator(element);
        while (it.hasNext()) {
            var el = it.next();
            var el_name = '' + el.getTagName();
            switch (el_name) {
                case 'fld':
                    var val = XMLUtilJS.stringToValue(xml_util.getText(el));
                    var fld_name = el.getAttribute('name');
                    if (fld_name == 'isM2M')
                        val = (val == 'true');
                    this[fld_name] = val;
                    break;
                case 'rl_rec':
                    this.xmlToRecord(this.records, el);
                    break;
                case 'm2m_rec':
                    this.xmlToRecord(this.m2m_records, el);
                    break;
            }
        }
    },

    xmlToRecord: function(records, el) {
        var xml_util = GlideXMLUtil;
        var record = {};
        var flds = xml_util.getChildrenByTagName(el, 'fld');
        for (var i = 0; i < flds.size(); i++) {
            var fld_el = flds.get(i);
            var fld_name = fld_el.getAttribute('name');
            var fld_value = XMLUtilJS.stringToValue(xml_util.getText(fld_el));
            record[fld_name] = fld_value;
        }
        records.push(record);
    },

    /*
     * serializes this instance to XML in the given document and <rl> element.
     */
    toXML: function(doc, el) {
        // first we dump our singleton fields...
        this.appendXMLChildFld(el, 'isM2M',                 this.isM2M                );
        this.appendXMLChildFld(el, 'table_name',            this.table_name           );
        this.appendXMLChildFld(el, 'field_name',            this.field_name           );
        this.appendXMLChildFld(el, 'target_table_name',     this.target_table_name    );
        this.appendXMLChildFld(el, 'target_ref_field_name', this.target_ref_field_name);

        // now our array of related list records...
        for (var i = 0; i < this.records.length; i++)
            this.appendXMLChildRecord(el, 'rl_rec', this.records[i]);

        // and finally, our list of m2m records (only, of course, if this is an m2m list)...
        for (var i = 0; i < this.m2m_records.length; i++)
            this.appendXMLChildRecord(el, 'm2m_rec', this.m2m_records[i]);
    },

    appendXMLChildRecord: function(parent, name, rec) {
        var xml_util = GlideXMLUtil;
        var rec_el = xml_util.newElement(parent, name);
        for (var name in rec)
            this.appendXMLChildFld(rec_el, name, rec[name]);
    },

    appendXMLChildFld: function(parent, name, datum) {
        var xml_util = GlideXMLUtil;
        var el = XMLUtilJS.valueToString(datum);
        var data_el = xml_util.newElement(parent, 'fld');
        data_el.setAttribute('name', name);
        xml_util.setText(data_el, el);
    },

    /*
     * Makes a string representation of this instance, pushing each line onto the end of the given result array. This 
     * method is called from CIData.toString(), and assumes related list lines are to be indented two spaces.
     */
    toString: function(result) {
        result.push('  CIRelatedList: ' + this.table_name + ':' + this.field_name + '; ' + this.records.length 
                + ' entries');
        for (var i = 0; i < this.records.length; i++) {
            var record = this.records[i];
            result.push('    Record ' + i);
            for (var name in record)
                result.push('      ' + name + ': ' + record[name]);
        }
    },

    type: 'CIRelatedList'
}