var gr = $sp.getRecord();
if (gr == null)
	return;

if (input && input.action == "deleted") {
  gr.comments = input.action + " an attachment";
  gr.update();
}

data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "24MB");
data.table = gr.getTableName();
data.sys_id = gr.getUniqueValue();
data.canWrite = gr.canWrite();
data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
data.canRead = gr.canRead();