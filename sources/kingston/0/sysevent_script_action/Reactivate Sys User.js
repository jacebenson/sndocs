reactivateUser();

function reactivateUser() {
	var gr = new GlideRecord('sys_user');
	gr.get(current.user);
	gr.setValue("active", true);
	gr.update();
}