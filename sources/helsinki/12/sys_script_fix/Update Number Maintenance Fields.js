//update the category to a reference to sys_db_object
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_number");
gr.addQuery("element", "category");
gr.query();
if (gr.next()) {
	gr.setValue("internal_type", "reference");
	gr.setValue("reference", "sys_db_object");
	gr.setValue("reference_key", "name");
	gr.update();
}

//set the default value to 0 for number and update label
gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_number");
gr.addQuery("element", "number");
gr.query();
if (gr.next()) {
	gr.setValue("default_value", "1000");
	gr.update();
}
gr = new GlideRecord("sys_documentation");
gr.addQuery("name", "sys_number");
gr.addQuery("element", "number");
gr.addQuery("language", "en");
gr.query();

if (gr.next()) {
	gr.setValue("hint", "Starting number for any counter based on this numbering scheme");
	gr.update();
}

//set the default value to 0 for number
gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_number");
gr.addQuery("element", "maximum_digits");
gr.query();
if (gr.next()) {
	gr.setValue("default_value", "7");
	gr.update();
}