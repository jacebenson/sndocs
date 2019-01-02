var ModelCategoryCheck = Class.create();

ModelCategoryCheck.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_checkCategory : function() {
		var gr = new GlideAggregate('cmdb_model_category');
		gr.groupBy('asset_class');
		gr.addQuery('sys_id', 'IN', this.getParameter('sysparm_ids'));
		gr.query();

		if (gr.next()) {
			return gr.getRowCount();
		}
	   return 0;
	}
});