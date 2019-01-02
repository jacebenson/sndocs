function openStepDialog(){
	var dialogWindow = new GlideModal("sys_atf_step_creator");
	dialogWindow.setSize(900);
	dialogWindow.setPreference("sysparm_test", g_form.getUniqueValue());
	dialogWindow.setTitle(getMessage('Add Test Step'));
	dialogWindow.render();	
}