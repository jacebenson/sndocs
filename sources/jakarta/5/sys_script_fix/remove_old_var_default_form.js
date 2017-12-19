(function() {
	var gr = new GlideRecord("sys_ui_section");
	gr.addQuery("name", "var_dictionary");
	gr.addQuery("view", "Default view");
	gr.deleteMultiple();
})();