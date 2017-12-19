var gr = new GlideRecord('sys_sync_change');
gr.addNullQuery('changed_by');
gr.query();
var num = 0;
while(gr.next()) {
	var user = GlideUser.getUser(gr.updated_by);
	if (user != null) {
		gr.changed_by = user.getID();
		if (gr.update() != null)
			num++;
	}
}
gs.log("Populated " + num + " sys_sync_change.changed_by fields");