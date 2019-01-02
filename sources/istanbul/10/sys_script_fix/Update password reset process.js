updateProcess();

function updateProcess() {
	var gr = new GlideRecord('pwd_process');
	if (!gr.isValid())
		return;
	
	gr.query();
	while (gr.next()) {
		gr.setValue('reset', 'true');
		if(!gr.update()) {
			gs.log("[Fix Script] [Update password reset process]" +
				"Unable to update the reset option for process. Id: " + 
				gr.getValue(sys_id) + ", Name: " + gr.getValue("name"));
		}
	}
	return;
}