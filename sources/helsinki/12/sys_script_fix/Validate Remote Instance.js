
        if(!pm.isZboot()) {
	var gusw = new GlideUpdateSetWorker();
	var gr = new GlideRecord("sys_update_set_source");
	if(gr.isValid()) {
		gr.query();
		gr.setWorkflow(false);
		while(gr.next()) {
			var instanceId = gusw.validateConnection(gr.sys_id,gr.url, gr.username, gr.password, false, false);
			if(instanceId != null) {
				gr.instance_id = instanceId;
				gr.update();
			}
		}
	}
}