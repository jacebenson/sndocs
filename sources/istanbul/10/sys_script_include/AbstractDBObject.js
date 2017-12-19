// Discovery class

/**
 * Provides common methods for classes based on records in the database.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var AbstractDBObject = Class.create();

AbstractDBObject._getCachedFromArrayList = function(list, tableName, className, cache){
	var result = [];
	
	for(var i = 0; i < list.size(); i++){
		var entry = cache.getEntry(list.get(i) + "");
		if(entry != null)
			result.push(new className(entry))
	}

    if (result.length != list.size())
        gs.log("*** Warning: " + (new className()).type + " could not find the list it\'s looking for in " + tableName);
    
    return result;
}

AbstractDBObject._getFromArrayList = function(list, tableName, className) {
    // some setup...
    var result = [];
    
    // if our list is empty, avoid the query...
    if (list.isEmpty())
        return result;
        
    // query for the records on the list...
    var gr = new GlideRecord(tableName);
    gr.addQuery('sys_id', list);
    gr.addActiveQuery();
    gr.query();
    
    // now iterate through our records, building our result list...
    while (gr.next()) {
        var le = new className(gr);
        if (le.isValid())
            result.push(le);
    }

    if (result.length != list.size())
        gs.log("*** Warning: " + (new className()).type + " could not find the list it\'s looking for in " + tableName);
    
    
    // and finally skedaddle with our results...
    return result;
};

AbstractDBObject.prototype = {
    /*
     * Gets the record specified by the given source and table name.  If the source is an instance of GlideRecord, it is 
     * simply returned.  If the source is a string, then it is used as a sysID to find the correct record, which is then
     * returned.  If anything is wrong, a null will be returned.
     */
    _getRecord: function(source, tableName) {
        if (!source) 
            return null;
        else if (source instanceof GlideRecord)
            return (source.getTableName() == tableName) ? source : null;
        else {
            var gr = new GlideRecord(tableName);
            return gr.get(source) ? gr : null;
        }
    },
    
    isValid: function() {
        return this.valid;
    },
    
    type: "AbstractDBObject"
};
