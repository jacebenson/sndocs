function openCmdbCIServiceList(){
	var gajax = new GlideAjax("AssociateCIToTask");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_id", g_form.getUniqueValue());
	gajax.addParam("sysparm_add_to", "task_cmdb_ci_service");
	
	gajax.getXMLAnswer(openServicesList);
}

function openServicesList(answer) {
	var url, cmdbciOverlay;
	
	url = answer;
	var cmdbciOverlay = new GlideOverlay({
		id : "cm_add_affected_cis",
		title : getMessage("Add Impacted Services"),
		iframe : url,
		closeOnEscape : true,
		showClose : true,
		onAfterClose: refreshImpactedServices,
		onAfterLoad: resizeIframe,	//Once PRB632264 is fixed by platform we can comment this line
		height : "90%",
		width : "90%"
	});

	cmdbciOverlay.center();
	cmdbciOverlay.render();
}

function refreshImpactedServices(){
	GlideList2.get(g_form.getTableName() + '.' + g_list.getRelated()).setFilterAndRefresh('');
}

function resizeIframe(){
    var x = g_glideBoxes.cm_add_affected_cis;
	x.autoDimension();
    x.autoPosition();
	x._createIframeShim();
}