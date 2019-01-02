surveyResponses();

function surveyResponses() {
	var sys_id = current.sys_id;

	var url = "asmt_metric_result_list.do?sysparm_query=metric.metric_type.name=" + encodeURIComponent(current.name) 
		+ "%5EGROUPBYmetric&sysparm_view=Survey";
	action.setRedirectURL(url);
}