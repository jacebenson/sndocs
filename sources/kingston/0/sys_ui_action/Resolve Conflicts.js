function mergeFormUpgrade() {

	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	var ua = new GlideRecord("u_ws_ua_history_log");
	ua.addQuery("sys_id", sysId);
	ua.query();
	if (!ua.next())
		return;

	var gr = new GlideRecord("sys_upgrade_history_log");
	gr.addQuery("sys_id", ua.u_upgrade_details);
	gr.query();
	
	if (!gr.next())
		return;

	if (gr.getValue("disposition") != "4") {
		alert(getMessage("Compare to current is for skipped records"));
		return;
	}
	
	var gr_id = gr.sys_id + '';
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			var tableName = (new RecordPayloadUtil()).getTableNameFromUpdateName(gr.getValue("file_name"));
			if (isUISupported !== 'true' || (new RecordPayloadUtil()).isMergeBlackListed(tableName)) {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffHistoryLogToCurrentUpdate");
				ga.addParam("sysparm_history_log", gr_id);
				ga.getXMLAnswer(createDiffPane);
			} else {
				var returnUrl = gel('sysparm_referring_url');
				window.location = "merge_form_upgrade.do?sysparm_upgrade_history_log_id=" + 
				                   gr_id + "&sysparm_referring_url=" + returnUrl;
			}
		});
	});
}

function createDiffPane(answer) {
	var dialog = new GlideBox({
		body: answer,
		title:"Compare to Current",
		height: "95%",
		width: "95%",
		autoDimensionOnLoad: 'false'
	});
	answer.evalScripts(true);
	dialog.render();
}