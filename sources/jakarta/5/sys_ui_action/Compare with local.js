/**
 * Compare Update Set Preview Problem with local record, using standard Compare
 * modal tool, called from glide_action_list element on update set preview problem's list/form.
 */
function compareWithLocal() {
	var ga = new GlideAjax("DiffAjax");
	ga.addParam("sysparm_name", "diffCompareLocalInfo");
	ga.addParam("sysparm_preview_problem_id", rowSysId);
	ga.getXML(function(response) {
		var result = response.responseXML.getElementsByTagName("result");
		var localUpdateId = result[0].getAttribute("local_update");
		var remoteUpdateId = result[0].getAttribute("remote_update");
		showDiff(rowSysId, remoteUpdateId, localUpdateId);
	});
}

function showDiff(rowSysId, remoteUpdateId, localUpdateId) {
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			if (isUISupported !== 'true' ) {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffUpdateSetPreviewProblem");
				ga.addParam("sysparm_sys_id", rowSysId);
				ga.getXMLAnswer(createDiffViewPane);
			} else {
				var returnUrl = gel('sysparm_referring_url');
				window.location = "merge_form_select_update_ro.do?sysparm_compare_with_local=true&sysparm_update_id1=" + remoteUpdateId + "&sysparm_update_id2=" + localUpdateId + "&sysparm_referring_url=" + returnUrl;
			}
		});
	});
}

function createDiffViewPane(answer) {
	var dialog = new GlideBox({
		body: answer,
		title:"Compare to Local",
		height: "95%",
		width: "95%",
		autoDimensionOnLoad: 'false'
	});
	answer.evalScripts(true);
	dialog.render();
}
