// Discovery class
gs.include("PrototypeServer");

/**
 * Utility class for working with GlideRecords.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var GlideRecordUtil = Class.create();

GlideRecordUtil.prototype = {
    
    initialize: function() {},
    
    /*
     * Returns a GlideRecord instance positioned to the given CI sys_id, and of the right class (table).
     * 
     * sys_id: the sys_id of the CI desired
     */
    getCIGR: function(sys_id) {
        return this.getGR('cmdb_ci', sys_id);
    },
    
    
    /*
     * Returns a GlideRecord instance for the given table, positioned to the given sys_id, and of the right class (table).  This 
     * method is useful when you need to load a GlideRecord from a sys_id, but you don't know what the actual table is (because it
     * may be extended from the base table).  This method always returns a GlideRecord of the correct type.
     * 
     * base_table: the name of the base table that the given sys_id is in
     * sys_id: the sys_id of the CI desired
     */
    getGR: function(base_table, sys_id) {
        // first query the base table, and bail out if we can't find it...
        var gr = new GlideRecord(base_table);
        if (!gr.get(sys_id)) {
            return null;
        }
            
        // now see what class this CI really is...
        var klass = gr.getRecordClassName();
        
        // if it's actually the base class, we're done...
        if (klass == base_table) {
            return gr;
        }
            
        // re-query, but now using the right table, and bail out if we can't find it...
        gr = new GlideRecord(klass);
        if (!gr.get(sys_id)) {
            return null;
        }
            
        // made it, so skedaddle with our results...
        return gr;
    },
    
    /*
     * Get a list of all the fields in the given GlideRecord...
     * 
     * gr: the GlideRecord instance, positioned to a valid record
     * returns: an array with the field names in the given GlideRecord
     */
    getFields: function(gr) {
       var gf = gr.getFields();  // returns a Java ArrayList...
       var flds = [];
       
       // we do sys_id manually because GlideRecord.getFields() excludes it, for reasons unknown...
       flds.push('sys_id');
       
       // move the field names into a JavaScript Array...
       for (var i = 0; i < gf.size(); i++) { 
           flds.push(gf.get(i).getName());
       }
       // skedaddle with our results...
       return flds;
    },
    
    /*
     * Populate the given hashmap from the given GlideRecord instance.  Each field in the GlideRecord becomes a property
     * in the hashmap.
     * 
     * hashmap: an Object instance (being used as a hashmap)
     * gr: a GlideRecord instance, positioned to a valid record
     * ignore: an optional hashmap of field names to NOT populate
     */
    populateFromGR: function(hashmap, gr, ignore) {
        var flds = this.getFields(gr);
        for (var i = 0; i < flds.length; i++) {
            var fldName = flds[i];
            var fldValue = gr.getValue(fldName);
            
            // don't set the property for any field in the "ignore fields" list...
            if (ignore && ignore[fldName]) {
                continue;
            }
            
            // don't set the property for a field with no value...
            if (!fldValue) {
                continue;
            }
              
            // finally! set our value...  
            hashmap[fldName] = fldValue.toString();
        }
    },
    
    /*
     * Set the fields in the given GlideRecord with the field values contained in the given hashmap, unless that field name 
     * is in the ignore hashmap.
     * 
     * hashmap: an Object instance (being used as a hashmap), with properties named for fields and containing the fields' value
     * gr: the GlideRecord instance to set field values in.
     * ignore: an optional hashmap of field names to ignore.
     */
    mergeToGR: function(hashmap, gr, ignore) {
        for (var fld_name in hashmap) {
            if (ignore && ignore[fld_name]) {
                continue;
            }
            var fld = hashmap[fld_name];
            gr.setValue(fld_name, fld);
         }
    },
    
    /*
     * Returns a Java ArrayList of the ancestors of the given table name.  For example, given cmdb_ci_linux_server, this would
     * return cmdb_ci, cmdb_ci_computer, cmdb_ci_server, and cmdb_ci_linux_server.
     * 
     * table: the name of the table to get the ancestors for.
     */
    getTables: function(table) {
        return GlideDBObjectManager.getTables(table);  // returns ArrayList...
    },
    
    
    type: 'GlideRecordUtil'
};