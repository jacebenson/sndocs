var sc_ic_ApprovalDefnStaging = Class.create();
sc_ic_ApprovalDefnStaging.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },

	/**
	 * Sets the detail field to the display value of the type config field
	 */
	setDetail: function() {
		var detail = "";
		
		var type = this._gr[sc_ic.TYPE]+"";
		
		if (type == sc_ic.USER || type == sc_ic.GROUP) {
			this._gr[sc_ic.DETAIL] = this._gr[type].getDisplayValue();
			return this;
		}
		
		// If we've got here it must be a predefined approval
		this._gr[sc_ic.DETAIL] = this._gr[sc_ic.APRVL_TYPE_DEFN_STAGING].getDisplayValue();
		
		return this;
	},
	
	activate: function() {
		this._gr.active = true;
		this._gr.update();
	},
	
	deactivate: function() {
		this._gr.active = false;
		this._gr.update();
	},
		
	setAprvlDefnChangedOnItem: function() {
		var itemStagingGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (itemStagingGr.get(this._gr[sc_ic.ITEM_STAGING])) {
			this._log.debug("[setAprvlDefnChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			sc_ic_Factory.wrap(itemStagingGr).approvalDefinitionChanged();
		}
	},
	
    type: 'sc_ic_ApprovalDefnStaging'
});

sc_ic_ApprovalDefnStaging.getNextOrderNumber = function(itemSysId) {
	if (JSUtil.nil(itemSysId))
		return 100;
	
	var approvalDefnGr = new GlideAggregate(sc_ic.APRVL_DEFN_STAGING);
	approvalDefnGr.addAggregate("MAX", "order");
	approvalDefnGr.addQuery(sc_ic.ITEM_STAGING, itemSysId);
	approvalDefnGr.groupBy(sc_ic.ITEM_STAGING);
	approvalDefnGr.query();
	
	if (approvalDefnGr.next()) {
		return "" + (100 + parseInt(approvalDefnGr.getAggregate("MAX", "order"), 10));
	}
	
	return 100;
};