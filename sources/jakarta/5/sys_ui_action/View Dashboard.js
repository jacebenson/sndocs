// if there are changes to the form then save before redirecting.
if (current.changes()) {
	current.update();
}
// redirect to view dashboard
gs.setRedirect("$pa_dashboard.do?sysparm_dashboard=" + current.sys_id);