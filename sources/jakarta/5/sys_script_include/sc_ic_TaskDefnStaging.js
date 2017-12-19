var sc_ic_TaskDefnStaging = Class.create();
sc_ic_TaskDefnStaging.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	setAssignmentDetails: function() {
		if (this._gr.assignment_type+"" == sc_ic.CUSTOM_ASSIGNMENT) {
			this._gr.assignment_details = "Group: " + this._gr.assignment_group.getDisplayValue();
			if (JSUtil.notNil(this._gr.assignment_user)) {
				var usrDet = "User: " + this._gr.assignment_user.getDisplayValue();
				
				if (JSUtil.notNil(this._gr.assignment_details))
					this._gr.assignment_details = this._gr.assignment_details + ", " + usrDet;
				
				this._gr.assignment_details = usrDet;
			}
		}
		else
			this._gr.assignment_details = this._gs.getMessage("Predefined") + ": " + this._gr[sc_ic.TASK_ASSIGN_DEFN_STAGING].short_description;
	},
	
	setTaskDefnChangedOnItem: function() {
		var itemStagingGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (itemStagingGr.get(this._gr[sc_ic.ITEM_STAGING])) {
			
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[setTaskDefnChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			
			sc_ic_Factory.wrap(itemStagingGr).taskDefinitionChanged();
		}
	},
	
    type: 'sc_ic_TaskDefnStaging'
});

sc_ic_TaskDefnStaging.getNextOrderNumber = function(itemSysId) {
	if (JSUtil.nil(itemSysId))
		return 100;
	
	var taskDefnGr = new GlideAggregate(sc_ic.TASK_DEFN_STAGING);
	taskDefnGr.addAggregate("MAX", "order");
	taskDefnGr.addQuery(sc_ic.ITEM_STAGING, itemSysId);
	taskDefnGr.groupBy(sc_ic.ITEM_STAGING);
	taskDefnGr.query();
	
	if (taskDefnGr.next()) {
		return "" + (100 + parseInt(taskDefnGr.getAggregate("MAX", "order"), 10));
	}
	
	return 100;
};