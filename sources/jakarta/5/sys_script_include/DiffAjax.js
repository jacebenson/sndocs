var DiffAjax = Class.create();

DiffAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/**
	 *  Get retrieve the diff for an Upgrade History Entry
	 *  Called by sys_upgrade_history_log's client script DiffSkipped
	 */
	ajaxFunction_diffUpgradeHistory: function () {
		var diffHelper = new DiffHelper();
		// Get the current Upgrade Detail
		var sys_id = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord("sys_upgrade_history_log");
		gr.query("sys_id", sys_id + "");
		gr.next();

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffUpgradeHistory");
			return;
		}
		var name = gr.file_name + "";

		if (name && name.endswith(".xml")) {
			name = name.substring(0, name.length - 4);
		}

		// Get the most recent update xml and use its payload for the diff
		var gr2 = new GlideRecord("sys_update_xml");
		gr2.addQuery("name", name);
		gr2.orderByDesc("sys_updated_on");
		gr2.query();
		var payload2;
		gr2.next();
		payload2 = gr2.payload;
		if (JSUtil.nil(payload2)) {
			return diffHelper.noCompare();
		}
		var diff = diffHelper.diffXMLString(payload2, gr.getValue("payload"));
		if (diff == null) {
			return diffHelper.noCompare();
		}

		gr.payload_diff = diffHelper.getTemplate(diff, "Customized", "Base System");
		gr.update();
		return gr.payload_diff;
	},

	/**
	 * Returns the local update Id and the remote update Id for the preview problem record
	 * Called by Compare with local UI action for update set preview problem
	 */
	ajaxFunction_diffCompareLocalInfo: function() {
		var previewProblemSysId = this.getParameter("sysparm_preview_problem_id");
		var gr = new GlideRecord("sys_update_preview_problem");
		gr.get(previewProblemSysId);
		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffCompareLocalInfo");
			return;
		}
		var remoteUpdateId = gr.getValue("remote_update");

		var localUpdateId = "";
		var customerUpdate = new GlideRecord("sys_update_preview_xml");
		customerUpdate.orderByDesc("sys_updated_on");
		customerUpdate.addQuery("remote_update", remoteUpdateId);
		customerUpdate.query();
		if (customerUpdate.next()) {
			localUpdateId = customerUpdate.getValue("local_update");
		}

		var result = this.newItem("result");
		result.setAttribute("remote_update", remoteUpdateId);
		result.setAttribute("local_update", localUpdateId);
		return result;
	},

	/**
	 *  diff and Committed Update Set in sys_upgrade_history_log
	 */
	ajaxFunction_diffUpdateHistory: function () {

		// Get the current Upgrade Detail
		var table = this.getParameter("sysparm_table_name");
		var sys_id = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord(table);
		gr.query("sys_id", sys_id + "");
		gr.next();
		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffUpdateHistory");
			return;
		}

		return this._getPayloadDiff(gr);
	},

	_getPayloadDiff: function(gr) {
		var diffHelper = new DiffHelper();
		var payload2 = diffHelper.getXMLFromSysUpdate(gr.update_set, gr.file_name);
		var left = "Previous Version";
		var right = "Update Set Version";
		if (payload2 == null) {
			return diffHelper.noCompare();
		}
		var diff = diffHelper.diffXMLString(gr.getValue("payload"), payload2, gr.target_name);
		gr.payload_diff = diffHelper.getTemplate(diff, left, right);
		if (diff == null) {
			return diffHelper.noCompare();
		}

		gr.update();
		return gr.payload_diff;
	},

	ajaxFunction_diffUpdateSetPreview: function () {
		var diffHelper = new DiffHelper();
		var sys_id = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord("sys_update_preview_xml");
		gr.query("sys_id", sys_id + "");
		gr.next();

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffUpdateSetPreview");
			return;
		}

		// get update sets payload
		var name = gr.remote_update;
		var customerUpdate = new GlideRecord("sys_update_xml");
		customerUpdate.orderByDesc("sys_updated_on");
		customerUpdate.addQuery("sys_id", name + "");
		customerUpdate.query();
		var xmlString;
		if (customerUpdate.next()) {
			xmlString = customerUpdate.payload;
		}

		var diff;
		if (gr.local_update.isNil()) {
			diff = diffHelper.diffUpdateSet(xmlString);
		}
		else {
			diff = diffHelper.diffXMLString(gr.local_update.payload, xmlString, gr.target_name);
		}

		if (diff == null) {
			gr.payload_diff = diffHelper.noCompare();
		}
		else if (this.getParameter("sysparm_table_name")) {
			gr.payload_diff = diffHelper.getTemplate(diff, "Base System", "Customized");
		}
		else {
			gr.payload_diff = diffHelper.getTemplate(diff, "Current Version", "Update Set Version");
		}

		gr.update();
		return gr.payload_diff;
	},

	diffTwoRecordPayloads: function () {
		var diffHelper = new DiffHelper();
		var record1 = this.getParameter("sysparm_record1");
		var record2 = this.getParameter("sysparm_record2");
		var table = this.getParameter("sysparm_table");
		var version1 = new GlideRecord(table);
		version1.addQuery("sys_id", record1);
		version1.query();
		if (!version1.next()) {
			return;
		}

		// Secured.
		if (!version1.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffTwoRecordPayloads");
			return;
		}

		var version2 = new GlideRecord(table);
		version2.addQuery("sys_id", record2);
		version2.query();
		if (!version2.next()) {
			return;
		}

		if (version1.name != version2.name) {
			return "different names";
		}

		var diff = diffHelper.diffXMLString(version1.payload, version2.payload);
		var html = diffHelper.getVersionTemplate(diff, version1, version2, false);
		return html;
	},

	/**
	 *  Retrieve the diff for an Update Set Preview Problem
	 *  Called by sys_update_preview_problem's client script 'Compare with local'
	 */
	ajaxFunction_diffUpdateSetPreviewProblem: function () {
		// get record from update set preview problem table given sys_id
		var diffHelper = new DiffHelper();
		var sys_id = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord("sys_update_preview_problem");
		gr.query("sys_id", sys_id + "");
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffUpdateSetPreviewProblem");
			return;
		}

		// get update sets payload from problem's related preview
		var remote_update = gr.remote_update;
		var customerUpdate = new GlideRecord("sys_update_preview_xml");
		customerUpdate.orderByDesc("sys_updated_on");
		customerUpdate.addQuery("remote_update", remote_update + "");
		customerUpdate.query();
		var xmlString;
		if (customerUpdate.next()) {
			xmlString = customerUpdate.local_update.payload;
		}

		var diff;
		if (gr.local_update.isNil()) {
			diff = diffHelper.diffUpdateSet(xmlString);
		}
		else {
			diff = diffHelper.diffXMLString(xmlString, gr.remote_update.payload, gr.target_name);
		}

		if (diff === null) {
			gr.payload_diff = diffHelper.noCompare();
		}
		else {
			gr.payload_diff = diffHelper.getTemplate(diff, "Current Version", "Update Set Version");
		}

		gr.update();
		return gr.payload_diff;
	},

	diffToCurrentVersion: function () {
		var version = this.getParameter("sysparm_version");
		var gr = new GlideRecord("sys_update_version");
		gr.addQuery("sys_id", version);
		gr.query();
		if (!gr.next()) {
			return gs.getMessage("Version record does not exist");
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffToCurrentVersion");
			return gs.getMessage("Security restricted: cannot read version record");
		}

		var cgr = new GlideRecord("sys_sync_history_version");
		if (cgr.isValid()) {
			cgr.addQuery("version", version);
			cgr.addQuery("state", "collision");
			cgr.query();
			if (cgr.next())
				return this._createDiffStringForConflictingVersions(gr);
		}

		return this._createDiffString(gr);
	},

	diffHistoryLogToCurrentUpdate: function () {
		var hlSysId = this.getParameter("sysparm_history_log");
		var gr = new GlideRecord("sys_upgrade_history_log");
		gr.addQuery("sys_id", hlSysId);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffHistoryLogToCurrentVersion");
			return;
		}

		var cgr = new GlideRecord("sys_update_xml");
		cgr.addQuery("name", gr.getValue("file_name"));
		cgr.orderByDesc("sys_updated_on");
		cgr.query();
		cgr.next();

		return this._createDiffStringForUpgradeSkip(gr, cgr);
	},

	diffBackOutProblemToCurrentVersion: function () {
		var problemVersion = this.getParameter("sysparm_version");
		var backout = new SNC.BackOutAPI();
		var version = backout.findBackOutTargetVersionId(problemVersion);
		if (version == null)
			return gs.getMessage("Unable to find an earlier version than this committed version. Go to the record to see revert options.");

		var gr = new GlideRecord("sys_update_version");
		gr.addQuery("sys_id", version);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffBackOutProblemToCurrentVersion");
			return;
		}

		return this._createDiffStringForBackOutProblem(gr);
	},

	diffPushedVersionToCurrentVersion: function () {
		var version = this.getParameter("sysparm_version");
		var gr = new GlideRecord("sys_update_version");
		gr.addQuery("sys_id", version);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffPushedVersionToCurrentVersion");
			return;
		}

		var cgr = new GlideRecord("sys_sync_history_version");
		if (cgr.isValid()) {
			cgr.addQuery("version", version);
			cgr.addQuery("state", "collision");
			cgr.query();
			if (cgr.next())
				return this._createDiffStringForConflictingVersions(gr);
		}

		return this._createDiffStringForPushedVersion(gr);
	},

	diffPreviewToCurrentVersion: function () {
		var sysId = this.getParameter("sysparm_preview");
		var gr = new GlideRecord("sys_sync_preview_remote");
		gr.addQuery("sys_id", sysId);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffPreviewToCurrentVersion");
			return;
		}

		return this._createDiffString(gr);
	},


	diffConflictingVersions: function () {
		var version = this.getParameter("sysparm_version");
		var gr = new GlideRecord("sys_update_version");
		gr.addQuery("sys_id", version);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffConflictingVersions");
			return;
		}

		return this._createDiffStringForConflictingVersions(gr);
	},

	useLocalVersion: function () {
		var version = this.getParameter("sysparm_version");
		var lgr = new GlideRecord("sys_sync_history_version");
		lgr.addQuery("version", version);
		lgr.addQuery("state", "collision");
		lgr.query();
		lgr.next();

		var vca = new GlideVersionConflictAction(lgr);
		vca.useLocalVersion();
		return;
	},

	usePulledVersion: function () {
		var version = this.getParameter("sysparm_version");
		var lgr = new GlideRecord("sys_sync_history_version");
		lgr.addQuery("version", version);
		lgr.addQuery("state", "collision");
		lgr.query();
		lgr.next();

		var vca = new GlideVersionConflictAction(lgr);
		vca.usePulledVersion();
		return;
	},

	diffUpdateToCurrentVersion: function () {
		var update = this.getParameter("sysparm_update");
		var gr = new GlideRecord("sys_update_xml");
		gr.addQuery("sys_id", update);
		gr.query();
		if (!gr.next()) {
			return;
		}

		// Secured.
		if (!gr.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffUpdateToCurrentVersion");
			return;
		}

		return this._createDiffString(gr);
	},

	/**
	 * Compare the Local Change (sys_sync_change) to the last
	 * push/pull version
	 */
	diffChangedVersionToLastPushOrPullVersion: function () {
		var diffHelper = new DiffHelper();
		var diff;
		var localChangeSysID = this.getParameter("sysparm_localchange");

		//get the local change record
		var lcGR = new GlideRecord("sys_sync_change");
		lcGR.addQuery("sys_id", localChangeSysID);
		lcGR.query();
		if (!lcGR.next()) {
			return gs.getMessage("Unable to compare to last push/pull because local change is invalid");
		}

		//get the version attached to the local change
		var vGR = new GlideRecord("sys_update_version");
		vGR.addQuery("sys_id", lcGR.version);
		vGR.query();
		if (!vGR.next()) {
			return gs.getMessage("Unable to compare to last push/pull because version is invalid");
		}

		//get the last sync history version
		var hGR = new GlideRecord("sys_sync_history_version");
		hGR.addQuery("sync_history.instance", lcGR.instance);
		hGR.addQuery("version.name", vGR.name);
		hGR.addQuery("state", "IN", "pulled, pushed, resolved");
		hGR.orderByDesc("sys_created_on");
		hGR.setLimit(1);
		hGR.query();
		if (!hGR.next()) {
			return gs.getMessage("Unable to compare to last push/pull because version was never pushed or pulled. All changes are new.");
		}

		var record1 = vGR.sys_id;
		var record2 = hGR.version;

		var version1 = new GlideRecord("sys_update_version");
		version1.addQuery("sys_id", record1);
		version1.query();
		if (!version1.next()) {
			return;
		}

		// Secured.
		if (!version1.canRead()) {
			gs.logWarning("Security restricted: cannot read", "DiffAjax.diffTwoRecordPayloads");
			return;
		}

		var version2 = new GlideRecord("sys_update_version");
		version2.addQuery("sys_id", record2);
		version2.query();
		if (!version2.next()) {
			return;
		}

		if (version1.name != version2.name) {
			return "different names";
		}

		diff = diffHelper.diffXMLString(version1.payload, version2.payload);
		var html = diffHelper.getVersionTemplate(diff, version1, version2, false);
		return html;
	},

	_createDiffString: function (gr) {
		var diffHelper = new DiffHelper();
		var grHead = GlideappUpdateVersion.getHeadVersion(gr.name);
		var head = new GlideRecord("sys_update_version");
		if (grHead.isValidRecord())
			head = GlideappUpdateVersion.replacePayloadWithPreviewXML(grHead);
		gr = GlideappUpdateVersion.replacePayloadWithPreviewXML(gr);

		if (head.isValidRecord()) {
			diff = diffHelper.diffXMLString(gr.payload, head.payload);
			if (gr.getTableName() == "sys_update_xml") {
				return diffHelper.getTemplate(diff, gr.sys_created_on, "Current");
			}
			else // For sys_update_version
			{
				return diffHelper.getVersionTemplate(diff, gr, head, true);
			}
		} else {
			diff = diffHelper.diffXMLString(gr.payload, gr.payload);
			if (gr.getTableName() == "sys_update_xml") {
				return diffHelper.noCompare() + diffHelper.getTemplate(diff, gr.sys_created_on, "Current");
			}
			else {
				return diffHelper.getVersionTemplate(diff, gr, gr, true);
			}
		}
	},

	//making another copy of the diff code because we want to add user action on this diff page later
	_createDiffStringForBackOutProblem: function (gr) {
		var diffHelper = new DiffHelper();
		var grHead = GlideappUpdateVersion.getHeadVersion(gr.name);
		var head = new GlideRecord("sys_update_version");
		if (grHead.isValidRecord()) {
			head = GlideappUpdateVersion.replacePayloadWithPreviewXML(grHead);
		}
		gr = GlideappUpdateVersion.replacePayloadWithPreviewXML(gr);

		if (head.isValidRecord()) {
			diff = diffHelper.diffXMLString(gr.payload, head.payload);
		} else {
			diff = diffHelper.diffXMLString(gr.payload, gr.payload);
		}
		return diffHelper.getTemplate(diff, "Version after Back Out","Current");
	},

	_createDiffStringForPushedVersion: function (gr) {
		var diffHelper = new DiffHelper();
		var grHead = GlideappUpdateVersion.getHeadVersion(gr.name);
		var head = new GlideRecord("sys_update_version");
		if (grHead.isValidRecord()) {
			head = GlideappUpdateVersion.replacePayloadWithPreviewXML(grHead);
		}
		gr = GlideappUpdateVersion.replacePayloadWithPreviewXML(gr);

		if (head.isValidRecord()) {
			diff = diffHelper.diffXMLString(gr.payload, head.payload);
		} else {
			//Pushed version is a new file created on child. It does 
			// not exist on parent yet.
			diff = diffHelper.diffXMLString(gr.payload, gr.payload);
		}
		return diffHelper.getTemplate(diff, "Selected Version","Current");
	},

	_createDiffStringForConflictingVersions: function (gr) {
		var diffHelper = new DiffHelper();
		var grHead = GlideappUpdateVersion.getHeadVersion(gr.name);
		var head = GlideappUpdateVersion.replacePayloadWithPreviewXML(grHead);
		var diff;
		gr = GlideappUpdateVersion.replacePayloadWithPreviewXML(gr);

		if (head.isValidRecord()) {
			diff = diffHelper.diffXMLString(gr.payload, head.payload);
			return diffHelper.getConflictVersionTemplate(diff, gr, head, true);
		} else {
			diff = diffHelper.diffXMLString(gr.payload, gr.payload);
			return diffHelper.getConflictVersionTemplate(diff, gr, gr, true);
		}
	},

	_createDiffStringForUpgradeSkip: function (gr, head) {
		var diffHelper = new DiffHelper();
		var head = GlideappUpdateVersion.replacePayloadWithPreviewXML(head);
		var diff;
		gr = GlideappUpdateVersion.replacePayloadWithPreviewXML(gr);

		if (head.isValidRecord()) {
			diff = diffHelper.diffXMLString(gr.payload, head.payload);
		} else {
			diff = diffHelper.diffXMLString(gr.payload, gr.payload);
		}
		return diffHelper.getTemplate(diff, "Base System", "Current");
	}

});