var GuidedSetupAjaxProcessor = Class.create();
GuidedSetupAjaxProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	decideVisibilityOfRolesField: function() {
		var gswUtil = new GuidedSetupUtilSNC();
		var parentId = this.getParameter('sysparm_parent_content');
		var gr = new GlideRecord(gswUtil.TABLE_CONTENT_GROUP);
		if (gr.get(parentId)) {
			if (gswUtil._getBoolValue(gr, gswUtil.ATTR_IS_ROOT_CONTENT, false)) {
				if (gswUtil._getBoolValue(gr, gswUtil.ATTR_CHILD_CAN_HAVE_ROLES, false)) {
					return true;
				}
			}
		}
		return false;
	},

    type: 'GuidedSetupAjaxProcessor'
});