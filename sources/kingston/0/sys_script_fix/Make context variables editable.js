var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "wf_context");
gr.addQuery("element", "workflow");
gr.query();
if (gr.next()) {
	gr.setValue("read_only", false);
	gr.update();
}