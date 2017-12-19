var sc_ic_CatalogTask = Class.create();
sc_ic_CatalogTask.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },

	/**
	 * Returns true if the set of tasks on the same sequence as this task are all complete
	 */
	isTaskSequenceComplete: function() {
		//Get all the tasks on the same requested item, for the same order that are still active.
		var scTask = new GlideRecord(sc_.TASK);
		scTask.addQuery("request_item",this._gr.request_item);
		scTask.addQuery("order",this._gr.order);
		scTask.addNotNullQuery("wf_activity");
		scTask.addActiveQuery();
		scTask.query();
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[isTaskSequenceComplete] Found " + scTask.getRowCount() + " active tasks");
		
		return (scTask.getRowCount() == 0 ? true : false);
	},
	
	/**
	 * Copies the fields from the source to this wrappers GlideRecord
	 */
	_copyFields: function(source) {
		this._gr.short_description = source.short_description;
		this._gr.assigned_to = source.assignment_user;
		this._gr.assignment_group = source.assignment_group;
		this._gr.description = source.description;
		this._gr.request = (JSUtil.notNil(source.request) ? source.request : source.sc_request)+"";
		this._gr.request_item = (JSUtil.notNil(source.request_item) ? source.request_item : source.sc_req_item)+"";
		this._gr.parent = this._gr.request_item;
		this._gr.requested_for = source.requested_for+"";
		this._gr.sc_catalog = source.sc_catalog+"";
		this._gr.order = source.order;
		//Deal with workflow activity info.
		this._gr.wf_activity = source.wf_activity;
	},
	
    type: 'sc_ic_CatalogTask'
});

sc_ic_CatalogTask.create = function(source) {
	var ct = new GlideRecord(sc_.TASK);
	var catalogTask = sc_ic_Factory.wrap(ct);
	catalogTask._copyFields(source);
	ct.insert();
	return ct;
};