/**
 * Compare Update Set Preview Problem with local record, using standard Compare
 * modal tool, called from glide_action_list element on update set preview problem's list/form.
 */
function compareWithLocal() {
	var sys_id = rowSysId;
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga = new GlideAjax("DiffAjax");
		ga.addParam("sysparm_name", "diffUpdateSetPreviewProblem");
		ga.addParam("sysparm_sys_id", sys_id);
		ga.getXMLAnswer(createDiffViewPane);
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
