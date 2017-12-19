//
// Set the Last login time field on the user record, DO NOT update sys_updated_on, sys_updated_by, or sys_mod_count
//
var gr = new GlideRecord("sys_user");
gr.addQuery("user_name", event.parm1);
gr.query();
if (gr.next()) {
	gr.last_login_time = event.sys_created_on;
	gr.last_login_device = event.parm2;
	gr.autoSysFields(false);
	gr.update();
}