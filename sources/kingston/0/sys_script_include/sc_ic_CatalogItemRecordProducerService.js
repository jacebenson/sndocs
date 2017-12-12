var sc_ic_CatalogItemRecordProducerService = Class.create();
sc_ic_CatalogItemRecordProducerService.prototype = Object.extendsObject(sc_ic_CatalogItemRecordProducer,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	refresh: function(item) {
		sc_ic_CatalogItem.prototype.refresh.call(this,item);
		this._createEntitlements(item, true);
	},
	
	_copyFields: function(item) {
		sc_ic_CatalogItemRecordProducer.prototype._copyFields.call(this,item);  // Do the default copy
		
		// Copy specific things for the producer service
		this._gr.submission_message = item.submission_message;
		this._gr.processing_workflow = item.workflow;
		return this;
	},
	
	_createEntitlements: function(item, deleteOldCriteria) {
		var loc = new GlideRecord("sc_cat_item_location_mtom");
		loc.addQuery("sc_cat_item", this._gr.getUniqueValue());
		loc.deleteMultiple();
		var dept = new GlideRecord("sc_cat_item_dept_mtom");
		dept.addQuery("sc_cat_item", this._gr.getUniqueValue());
		dept.deleteMultiple();
		var group = new GlideRecord("sc_cat_item_group_mtom");
		group.addQuery("sc_cat_item", this._gr.getUniqueValue());
		group.deleteMultiple();
		if (deleteOldCriteria) {
			var criteria = new GlideRecord("sc_cat_item_user_criteria_mtom");
			criteria.addQuery("sc_cat_item", this._gr.getUniqueValue());
			criteria.deleteMultiple();
		}
		var json = new JSON();
		var o = json.decode(item.entitlements || {});
		var locations = o.cmn_location;
		var departments = o.cmn_department;
		var groups = o.sys_user_group;
		var uc = new GlideRecord("user_criteria");
		var arr = [];
		for (var i = 0; i < locations.length; i++) {
			loc = new GlideRecord("sc_cat_item_location_mtom");
			loc.sc_cat_item = this._gr.getUniqueValue();
			loc.sc_avail_location = locations[i].value;
			loc.insert();
			arr.push(locations[i].value);
		}
		uc.location = arr.join(",");
		arr = [];
		for (i = 0; i < departments.length; i++) {
			dept = new GlideRecord("sc_cat_item_dept_mtom");
			dept.sc_cat_item = this._gr.getUniqueValue();
			dept.sc_avail_dept = departments[i].value;
			dept.insert();
			arr.push(departments[i].value);
		}
		uc.department = arr.join(",");
		arr = [];
		for (i = 0; i < groups.length; i++) {
			group = new GlideRecord("sc_cat_item_group_mtom");
			group.sc_cat_item = this._gr.getUniqueValue();
			group.sc_avail_group = groups[i].value;
			group.insert();
			arr.push(groups[i].value);
		}
		uc.group = arr.join(",");
		uc.name = this._gr.name;
		if (!uc.group.nil() || !uc.location.nil() || !uc.department.nil()) {
			var criterion = uc.insert();
			var uc_m2m = new GlideRecord("sc_cat_item_user_criteria_mtom");
			uc_m2m.sc_cat_item = this._gr.getUniqueValue();
			uc_m2m.user_criteria = criterion;
			uc_m2m.insert();
		}
	},
	
    type: 'sc_ic_CatalogItemRecordProducerService'
});

/**
 * Creates a regular Catalog Item from a Item Creator definition.
 *
 * Parameters: simpleItem - The GlideRecord of the Item to use as a base.
 * Returns: GlideRecord("sc_cat_item") that represents the new catalog item.
 */
sc_ic_CatalogItemRecordProducerService.create = function(item) {
	if (item == null || item.getRowCount() == 0 || item.getTableName()+"" !== sc_ic.ITEM_STAGING)
		return null;
	
	var ci = new GlideRecord("sc_cat_item_producer_service");
	var catItem = sc_ic_Factory.wrap(ci);
	catItem._copyFields(item);
	ci.insert();
	catItem._copyTranslations(item);
	catItem._copyCategories(item);
	catItem._copyAttachments(item);
	catItem._copyApprovals(item);
	catItem._copyTasks(item);
	catItem._copyVariables(item);
	catItem._createEntitlements(item);
	ci.update();
	return ci;
};

sc_ic_CatalogItemRecordProducerService.createFrom = sc_ic_CatalogItemRecordProducerService.create;