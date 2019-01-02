data.sys_id = input.sys_id || options.record_id || $sp.getParameter("sys_id");
data.table = input.table || options.record_table || $sp.getParameter("table");
data.checkAttachedByUser = input.check_attached_by || options.check_attached_by;

if (data.table && data.sys_id) {
	var gr = new GlideRecord(data.table);
	if (gr.get(data.sys_id)) { 

		if (input && input.action == "deleted") {
			gr.comments = input.action + " an attachment";
			gr.update();
		}

		data.canWrite = gr.canWrite();
		data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
		data.canRead = gr.canRead();
	}
}