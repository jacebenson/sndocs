function showEmailTemplate(){
	var id = g_form.getUniqueValue();
	var name = g_form.getValue('name');
	var url = 'email_client.do?sysparm_table=asmt_metric_type&sysparm_sys_id='+id+'&email_client_template=public_survey_template';
	popupOpenEmailClient(url);
}