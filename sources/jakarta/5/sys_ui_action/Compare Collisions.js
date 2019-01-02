function compareTwoUpdatesRO2() {
	var ga = new GlideAjax('CompareCollisionAjax');
	ga.addParam('sysparm_name','getCollision');
	ga.addParam('sysparm_problem_id', rowSysId);
	ga.getXML(collisionResponse);
} 

function collisionResponse(response) {
	var result = response.responseXML.getElementsByTagName("result");
	if (result[0] == undefined) {
		alert("Unable to compare conflicts");
		return;
	}

	var update_filename = result[0].getAttribute("sysparm_update_filename");
	var updateSetXML1 = result[0].getAttribute("sysparm_update_id1");
	var updateSetXML2 = result[0].getAttribute("sysparm_update_id2");
	var rbus = result[0].getAttribute("sysparm_rbus");
	
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			window.location = "merge_form_select_update_ro.do?" +
				"sysparm_update_id1=" + updateSetXML1 + 
				"&sysparm_update_id2=" + updateSetXML2 + 
				"&sysparm_update_filename=" + update_filename + 
				"&sysparm_rbus=" + rbus;
		});
	});
}
