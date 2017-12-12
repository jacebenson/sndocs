var MergeSaveAjax = Class.create();

MergeSaveAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	saveMergedVersion: function () {
		var versionPayload = this.getParameter("sysparm_version_payload");
		if (!versionPayload || versionPayload.isNil())
			return;

		var version = this.getParameter("sysparm_version");
		var lgr = new GlideRecord("sys_sync_history_version");
		lgr.addQuery("version", version);
		lgr.addQuery("state", "collision");
		lgr.query();
		if (lgr.next()) {
			var vca = new GlideVersionConflictAction(lgr);
			vca.useMergedVersion(versionPayload);
		}
		return;
	}
});