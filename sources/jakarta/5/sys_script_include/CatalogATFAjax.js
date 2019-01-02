var CatalogATFAjax = Class.create();
CatalogATFAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	checkTargetRecordGeneration : function () {
		var target_id = this.getParameter("item_guid");
		var cat_item_id = this.getParameter("item_id");
		var catItemGr = new GlideRecord("sc_cat_item_producer");
		if (!catItemGr.get(cat_item_id))
			return false;
		var targetGr = new GlideRecord(catItemGr.table_name);
		if (!targetGr.get(target_id))
			return false;
		return true;
	},
    type: 'CatalogATFAjax'
});