/**
 * API class for accessing the sys_object_source table
 *
 * Aleck Lin aleck.lin@servicenow.com
 * updated by Marjan Marzban marjan.marzban@servicenow.com
 *
 *  Example 1: To see if an entry exists...
 *	var ob = new ObjectSource("SomeName", "cmdb_ci_win_server", "0748b4d6ef41210098d5925495c0fbb9");
 *	if (ob.exist())
 *	    gs.log("Yes it does exist!");
 *
 *  Example 2: To create an entry... 
 *    var ob = new ObjectSource("SomeName", "cmdb_ci_win_server", "0748b4d6ef41210098d5925495c0fbb9",source);
 *    ob.setValue("last_scan", new GlideDateTime().getDisplayValue());	// optional
 *    ob.process();
 */

var ObjectSource = Class.create();
ObjectSource.prototype = {
SYS_OBJECT_SOURCE: "sys_object_source",

/**
 * @param source_name, name that will be appeared in 'sys_object_source' table for the record
 * @param table, name of the table related to the Ci.
 * @param table_id, sys_id of the ci in its table 
 * @param source, who triggers discovery. Its default value is "Discovery"
 **/
initialize: function(source_name, table, table_id, source) {
    this.name = source_name;
    this.table = table;
    this.table_id = table_id;
    this.attributes = {};
	if (source){
		if (source == 'Schedule_Discovery' || source == 'Quick_Discovery' || source == 'Discover_now_ci' || source == 'Discover_now_schedule')
			this.id = 'Discovery';
		else
			this.id = source + '';
	} else {
		this.id = 'Discovery'; 
		// PRB642152: the warning message was removed since there are many places that discovery was run without 
		// passing the source and they don't care about the source, so this message doesn't give them any helpful 
		// information. 
		//gs.warn("No discovery source passed to ObjectSource for " + table + ":" + table_id + ", the ID is set Discovery by default.");
	}
    this.sourceGr = null;
},
    
	
setValue: function(name, value) {
    this.attributes[name] = value;
},
	
getRecord: function() {
    this.sourceGr = this._getRecord();
    
    return this.sourceGr;
},
    
process: function() {
    // If the record didn't exist, we'd create an entry with all the attributes defined through setValue(). However,
    // if the record already exits, then we'll pull back the record and we need to update them.
    if (JSUtil.nil(this.sourceGr))
        this.sourceGr = this._getRecord();
    
    for (var prop in this.attributes)
        this.sourceGr[prop] = this.attributes[prop];
    
    this.sourceGr.update();
},
    
exist: function() {
    this.sourceGr = this._doGetRecord();
    if (JSUtil.notNil(this.sourceGr))
        return true;
    
    return false;
},
	
	/***************************************************
     * Private functions
     ****************************************************/
    
_getRecord: function() {
    // Look for it... if we found it, just return it!
    var gr = this._doGetRecord();
    if (JSUtil.notNil(gr))
        return gr;
    
    // Since we didn't find it, we need to create it. Set up the mutex to be safe...
    var mutexName = "OBJECT_SOURCE_LOCK:" + this.table + ":" + this.table_id ;
    var rl = new GlideRecordLock(this.table, this.table_id);
    // limit our attempt to get a mutex to 60 seconds...
    rl.setSpinWait(50);
    rl.setMaxSpins(1200);
    
    if (rl.get()) {
        //this.debug("Obtained a lock on mutex => " + mutexName);
        try {
            return this._createRecord();
        } finally {
            rl.release();
        }
    }
    
    // Log lock failed... but do it anyways...
    gs.log("Unable to lock on to " + mutexName);
    
    return this._createRecord();
},
    
_doGetRecord: function() {
    var gr = new GlideRecord(this.SYS_OBJECT_SOURCE);
    gr.addQuery("name", this.name);
    gr.addQuery("target_table", this.table);
    gr.addQuery("target_sys_id", this.table_id);
    gr.addQuery("id",this.id);
    gr.query();
    if (gr.next())
        return gr;
    
    return;
},
	
_createRecord: function() {
    var gr = this._doGetRecord();
    if (JSUtil.notNil(gr))
        return gr;
    
    // TODO: Verify that name is not empty, and also target_table and target_sys_id are valid values
    gr = new GlideRecord(this.SYS_OBJECT_SOURCE);
    gr.name = this.name;
    gr.target_table = this.table;
    gr.target_sys_id = this.table_id;
	gr.id = this.id;
    for (var prop in this.attributes)
        gr[prop] = this.attributes[prop];
    
    gr.insert();
    
    return gr;
},	
    
type: 'ObjectSource'
};
