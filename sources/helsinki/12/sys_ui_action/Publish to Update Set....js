function publishIt() {
	var sysId = gel('sys_uniqueValue').value;	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("publish_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Publish to Update Set'));
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setWidth(500);
	dd.render();
}
