data.sys_id = input.sys_id || options.record_id || $sp.getParameter("sys_id");
data.table = input.table || options.record_table || $sp.getParameter("table");
data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "24MB");

if (!data.table || !data.sys_id)
	return;

var gr = new GlideRecord(data.table);
if (!gr.get(data.sys_id))
	return;

if (input && input.action == "deleted") {
  gr.comments = input.action + " an attachment";
  gr.update();
}

data.canWrite = gr.canWrite();
data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
data.canRead = gr.canRead();