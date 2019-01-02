var CategoryUtil = Class.create();
CategoryUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getCatalog: function() {
		return GlideappCategory.get(this.getParameter('sysparm_category_sysid')).getCatalog();
	},
	
	type: 'CategoryUtil'
});