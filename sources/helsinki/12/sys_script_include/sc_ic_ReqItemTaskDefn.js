var sc_ic_ReqItemTaskDefn = Class.create();
sc_ic_ReqItemTaskDefn.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	getAssignment: function() {
		var assignment = {"user": '', "group":''};
		// Assignment directly in the task definition.
		if (this._gr.assignment_type+"" == sc_ic.CUSTOM_ASSIGNMENT) {
			assignment.user = this._gr.assignment_user+"";
			assignment.group = this._gr.assignment_group+"";
			
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[getAssignment] Custom assignment user: " + this._gr.assignment_user.getDisplayValue() +
								", group: " + this._gr.assignment_group.getDisplayValue());	
		}
		else
			assignment = sc_ic_Factory.wrap(this._gr[sc_ic.TASK_ASSIGN_DEFN].getRefRecord()).getAssignment();
		
		return assignment;
	},
	
	/**
	 * Returns a Javascript JSON compatible version of the wrapped GlideRecord.
	 * Populated the assignment fields on time of calling.
	 */
	getJSObj: function() {
		var taskDef = {};
		taskDef.short_description = this._gr.short_description + "";
		taskDef.description = this._gr.description + "";
		taskDef.assignment_details = this._gr.assignment_details + "";
		taskDef.order = (isNaN(parseInt(this._gr.order,10)) ? 0 : parseInt(this._gr.order,10));
		
		// Sort out the assignment when this is created.
		var assignment = this.getAssignment();
		taskDef.assignment_user = assignment.user;
		taskDef.assignment_group = assignment.group;
		
		taskDef.sc_req_item = this._gr.sc_req_item + "";
		taskDef.sc_request = this._gr.sc_req_item.request + "";
		// For when we start storing 'requested from catalog' information against the item.
		//taskDef.sc_Catalog = this._gr.
		
		return taskDef;
	},
	
	_copyFields: function(source) {
		this._gr.assignment_type = source.assignment_type;
		this._gr.short_description = source.short_description;
		this._gr.description = source.description;
		this._gr.assignment_details = source.assignment_details;
		this._gr.assignment_user = source.assignment_user;
		this._gr.assignment_group = source.assignment_group;
		//Use the assignment definition as published at the point in time this request was created.
		this._gr[sc_ic.TASK_ASSIGN_DEFN] = source[sc_ic.TASK_ASSIGN_DEFN_STAGING][sc_ic.TASK_ASSIGN_DEFN];
		this._gr.order = source.order;
		return this;
	},
	
	_copyReferences: function(source) {
		//No references to copy for this type of record.  Included so customers can overload in future.
		return this;
	},
	
    type: 'sc_ic_ReqItemTaskDefn'
});

/**
 * Creates a task definition for a requested item from a published task definition
 */
sc_ic_ReqItemTaskDefn.create = function(reqItem, source) {
	var ritd = new GlideRecord(sc_ic.REQ_ITEM_TASK_DEFN);
	ritd.sc_req_item = reqItem.getUniqueValue();
	
	var reqItmTaskDefn = sc_ic_Factory.wrap(ritd);
	reqItmTaskDefn._copyFields(source);
	ritd.insert();
	reqItmTaskDefn._copyReferences(source);
	
	return ritd;
};