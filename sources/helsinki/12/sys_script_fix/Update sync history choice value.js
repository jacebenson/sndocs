var choice = new GlideRecord("sys_choice");
choice.addQuery("name", "sys_sync_history");
choice.addQuery("element", "type");
choice.addQuery("value", "staging");
choice.query();
if (choice.next()) {
	choice.setWorkflow(false);
	choice.deleteRecord();
}