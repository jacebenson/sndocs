var SPWidgetCloneUtils = Class.create();
SPWidgetCloneUtils.prototype = {
	initialize: function() {
	},

	createCloneRelationship: function(oldID, newID) {
		var oldWidgetGR = new GlideRecord("sp_widget");
		oldWidgetGR.query("sys_id", oldID);
		if (!oldWidgetGR.next())
			return;

		if (this.isServiceNowWidget(oldWidgetGR)) {
			var newRelGR = new GlideRecord("sp_rel_widget_clone");
			newRelGR.payload = new GlideRecordSimpleSerializer().serialize(oldWidgetGR);
			newRelGR.parent = oldID;
			newRelGR.child = newID;
			newRelGR.cloned = gs.nowDateTime();
			newRelGR.last_validated = gs.nowDateTime();
			newRelGR.insert();
		} else {
			var cloneRel = this.getExistingCloneRelationshipGR(oldID);
			if (cloneRel != null) {
				cloneRel.child = newID;
				cloneRel.insert();
			}
		}
	},

	isServiceNowWidget: function(oldWidgetGR) {
		if (oldWidgetGR.servicenow)
			return true;

		if (oldWidgetGR.sys_package.source.nil())
			return false;

		if (oldWidgetGR.sys_package.source.startsWith("sn_") || oldWidgetGR.sys_package.source.startsWith("com."))
			return true;

		return false;
	},

	getExistingCloneRelationshipGR: function(oldID) {
		var relGR = new GlideRecord("sp_rel_widget_clone");
		if (!relGR.get("child", oldID))
			return null;

		return relGR;
	},

	type: 'SPWidgetCloneUtils'
};