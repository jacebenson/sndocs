function redirectToVersionCompare(){
	var url = "merge_form_select_version_ro.do?sysparm_source_table=sys_backout_problem&";
	url += "sysparm_source_id=" + current.sys_id + "&";
	url += "sysparm_update_set_id=" + current.set_id;
	action.setRedirectURL(url);
}
redirectToVersionCompare();