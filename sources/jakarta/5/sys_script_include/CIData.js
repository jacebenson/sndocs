// Discovery class
gs.include("PrototypeServer");

/**
 * Utility class for working with CI data structures.  Instances of this class represent a CI (both its base record and 
 * any related lists), and the provided methods allow loading from or storing both the base record and related lists.
 * 
 * Note that this class acts as a container for simple classes acting as maps of property name/value pairs.  This class 
 * contains three kinds of such maps:
 *   1.  A single map representing the base CI table entry (such as one row cmdb_ci_linux_server and its superclasses). 
 *       This map can be retrieved with the getData() method.
 *   2.  Arrays of maps representing the instances of related lists, with each array representing a single related list 
 *       and each element of such an array representing a single row of that related list. These arrays can be 
 *       retrieved with the getRelatedList() method.
 *   3.  Arrays of maps representing the instances of many-to-many tables, with each array representing a single 
 *       many-to-many table and each element of such an array representing a single row of that many-to-many table. 
 *       These arrays can be retrieved with the getM2MTable() method.
 *       
 * Tom Dilatush tom.dilatush@service-now.com
 */
var CIData = Class.create();
CIData.prototype = {
    /*
     * Initializes a new instance of this class.
	 * @param {} data The initial data
     * @param boolean debug True if debug logging is enabled.
     */
    initialize: function(data, debug) {
        this.ignoreFields = {
            'sys_created_by' : true,
            'sys_updated_by' : true,
            'sys_mod_count'  : true
		};
		
        this.GlideRecordUtil = new GlideRecordUtil();
		this.debug_flag = ( !!debug );
        this.init(data);
    },

    /*
     * Initialize this instance in preparation for loading a new CI.
     */
    init: function(data) {
        // the map of data in the base CI record...
        this.data = ( !gs.nil(data) ? data : {} );

        // the map of CIRelatedList instances, keyed as table:ref_field...
        this.rl_map = {};

        // the sys_id of the CI this instance represents...
        this.cmdb_ci = null;
		
		/* @var { relationshipDescriptor: CIData } */
		this.related = {};
    },

    /*
     * Returns the map of data in the base CI record.
     */
    getData: function() {
        return this.data;
    },
	
    /**
     * Adds a related list. Does not create dupes.
	 * Pass an instantiated CIRelatedList as the sole parameter to overwrite.
	 * @param string table
	 * @param string refField
     */
    addRelatedList: function(table, refField) {
		var list = null;
		if (typeof refField !== 'undefined') { // replace behavior
			var key = table + ':' + refField;
			if (typeof this.rl_map[key] === 'undefined') {
				list = new CIRelatedList(table, refField);
				this.rl_map[key] = list;
			} else { // don't overwrite
				list = this.rl_map[key];
			}
		} else { // overwrite behavior
			list = table;
			this.rl_map[list.table_name + ':' + list.field_name] = list;
		}
		
		return list;
    },

    /*
     * Returns an array of maps of data in the given related list (to this CI). The array is not in any particular 
     * order. Note that in the case of a many-to-many list, this will be an array of instances of the target table, not 
     * the many-to-many table. For example, given 'cmdb_software_instance' and 'installed_on' (a many-to-many table and 
     * the field that refers to a CI), this method will return an array of maps representing cmdb_ci_spkg (the target 
     * table) instances.
     * 
     * table: the name of the table containing the related list. Note that in the case of a many-to-many list, this 
     *        will be the name of the many-to-many table, NOT the target table.
     * ref_field: the name of the field in the related list that refers to this CI. Note that in the case of a 
     *            many-to-many list, this will be the name of the referring field in the many-to-many table, NOT in the 
     *            target table.
     */
    getRelatedList: function(table, ref_field) {
		var rl = this.getRelatedListInstance(table, ref_field);
		if (rl != null)
			return rl.records;

        return [];
    },

    /*
     * Returns an array of maps of data in the given many-to-many list (to this CI). The array is not in any particular 
     * order. If this is not a many-to-many list, returns an empty array.
     * 
     * table: the name of the table containing the related list. Note that in the case of a many-to-many list, this 
     *        will be the name of the many-to-many table, NOT the target table.
     * ref_field: the name of the field in the related list that refers to this CI. Note that in the case of a 
     *            many-to-many list, this will be the name of the referring field in the many-to-many table, NOT in the 
     *            target table.
     */
    getM2MTable: function(table, ref_field) {
		var rl = this.getRelatedListInstance(table, ref_field);
		if (rl != null)
	        return rl.m2m_records;

		return [];
    },

    /*
     * Returns the instance of CIRelatedList for the given list.
     * 
     * table: the name of the table containing the related list. Note that in the case of a many-to-many list, this 
     *        will be the name of the many-to-many table, NOT the target table.
     * ref_field: the name of the field in the related list that refers to this CI. Note that in the case of a 
     *            many-to-many list, this will be the name of the referring field in the many-to-many table, NOT in the 
     *            target table.
     */
    getRelatedListInstance: function(table, ref_field) {
        // see if we already have the list
        var key = this._make_rl_key(table, ref_field);
        var rl = this.rl_map[key];

        // if yes, retrieve and return
        if (rl !== undefined) 
            return rl;

		// Normally if this was a constructed CI (such as in identification phase of Discovery), we would not reach here because 
		// if it had a related list, it would've been a constructed list and returned earlier. 
		// The point here is that if someone had accidentally requested a related list that didn't exist and needed it to be loaded from the db,
		// the "this.cmdb_ci" variable has to exist, otherwise it would query the entire related table; which is very bad thing to do!		
		if (this.cmdb_ci == null)
			return null;
		
        // if no, create a new related list...
        rl = new CIRelatedList(table, ref_field, this.cmdb_ci, this.debug_flag);

        this.rl_map[key] = rl;

        // retrieve and return
        return rl;
    },

    /*
     * Load this.data from the given sys_id.
     * 
     * cmdb_ci: the sys_id of the CI we're to load from
     */
    loadFromCI: function(cmdb_ci) {
        this.init();
        this.cmdb_ci = cmdb_ci;
        var baseGR = this.GlideRecordUtil.getCIGR(cmdb_ci);
        if (!baseGR)
            return;

        var ourTable = baseGR.getTableName();

        // get our base record...
        this.GlideRecordUtil.populateFromGR(this.data, baseGR, this.ignoreFields);

        // skedaddle with our data...
        return this.data;
    },

    /*
     * Returns the key for this.rl_map, given a table name and reference field.
     * 
     * table: the related list table name.
     * ref_field: the reference field in the related list.
     */    
    _make_rl_key: function(table, ref_field) {
        return table + ':' + ref_field;
    },

    /*
     * Returns an XML string containing a serialized version of this instance (including any related lists).
     */
    toXML: function() {
        var xml_util = GlideXMLUtil;
        var doc = xml_util.newDocument('CIData');
        var root = doc.getDocumentElement();

        // add the base CI's data elements...
        var data = xml_util.newElement(root, 'data');
        for (var field_name in this.data) {
            var el = XMLUtilJS.valueToString(this.data[field_name]);
            var data_el = xml_util.newElement(data, 'fld');
            data_el.setAttribute('name', field_name);
            xml_util.setText(data_el, el);
        }

        // now add our related lists...
        for (var name in this.rl_map) {
            var rl = this.rl_map[name];
            var rl_el = xml_util.newElement(root, 'rl');
            rl_el.setAttribute('name', name);
            rl.toXML(doc, rl_el);
        }

        return xml_util.toFragmentString(doc);
    },

    /*
     * Initializes this instance from the given XML string.
     */
    fromXML: function(xml) {
        this.init();
        if (gs.nil(xml))
            return;

        var xml_util = GlideXMLUtil;
        var doc = xml_util.parse(xml);
        if (!doc)
            return;

        var root = doc.getDocumentElement();
        if (root.getTagName() != 'CIData')
            return;

        // look through our children for data or related-list elements...
        var it = xml_util.childElementIterator(root);
        while (it.hasNext()) {
            var el = it.next();

            // if we've got a data element, slurp up the fields...
            if (el.getTagName() == 'data') {
                var flds = xml_util.getChildrenByTagName(el, 'fld');
                for (var i = 0; i < flds.size(); i++) {
                    var fld_el = flds.get(i);
                    var fld_name = fld_el.getAttribute('name');
                    var fld_value = XMLUtilJS.stringToValue(xml_util.getText(fld_el));
                    this.data[fld_name] = fld_value;
                }
            }

            // if we've got a related list element, go get it...
            else if (el.getTagName() == 'rl') {
                var rl = new CIRelatedList();
                rl.fromXML(el);
                if (JSUtil.has(rl)) {
                    var rl_key = rl.table_name + ':' + rl.field_name;
                    this.rl_map[rl_key] = rl;
                }
            }
        }
    },

    toString: function() {
        var result = [];
        result.push('CIData instance:');
        for (var name in this.data)
            result.push('  ' + name + ': ' + this.data[name]);
        for (var name in this.rl_map)
            this.rl_map[name].toString(result);
		
		result.push(this.related.toString());
        return result.join('\n');
    },

    /*
     * Converts the specific given related list to a related list in the given sensor.
     */
    convertRelatedList: function(sensor, table_name, ref_field, keyName) {
        var ourKey = table_name + ':' + ref_field;
        var rl = this.rl_map[ourKey];
        if (typeof rl == 'undefined')
            return;

        sensor.addToRelatedList(table_name, rl.records, ref_field, keyName);
    },
	
    type: 'CIData'
};