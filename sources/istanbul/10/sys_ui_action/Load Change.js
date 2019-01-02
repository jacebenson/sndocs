function showConfirmDialog() {
    // ..if this is a list choice action
	var sysId = g_list.getChecked();
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("load_remote_version_confirm");
    gdw.setTitle("Confirmation");
    gdw.setPreference('sysparm_sys_id', sysId);
    gdw.setWidth(400);
    gdw.render();
}