var sc_ic_TaskDefn = Class.create();
sc_ic_TaskDefn.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	_copyFields: function(src) {
		this._gr.short_description = src.short_description;
		this._gr.description = src.description;
		this._gr.assignment_type = src.assignment_type;
		this._gr.assignment_details = src.assignment_details;
		this._gr.assignment_user = src.assignment_user;
		this._gr.assignment_group = src.assignment_group;
		this._gr[sc_ic.TASK_ASSIGN_DEFN_STAGING] = src[sc_ic.TASK_ASSIGN_DEFN_STAGING];
		this._gr[sc_ic.TASK_DEFN_STAGING] = src.getUniqueValue();
		this._gr.order = src.order;
	},
	
    type: 'sc_ic_TaskDefn'
});

sc_ic_TaskDefn.create = function(prnt,src) {
	var td = new GlideRecord(sc_ic.TASK_DEFN);
	td[sc_.CATALOG_ITEM] = prnt.getUniqueValue();
	var taskDefn = sc_ic_Factory.wrap(td);
	taskDefn._copyFields(src);
	td.insert();
	return td;
};