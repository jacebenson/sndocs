(function() {
	
data.pageIDRequiredMsg = gs.getMessage("Page ID (Required)");
data.widgetNameRequiredMsg = gs.getMessage("Widget Name (Required)");
data.widgetIDRequiredMsg = gs.getMessage("Widget ID (Required)");

function saveWidget(input) {
	var widgetGR = new GlideRecord("sp_widget");
	widgetGR.addQuery("id", input.id);
	widgetGR.query();
	if (widgetGR.next()) {
		// Error Message
		return;
	}

	widgetGR.setValue("id", input.id);
	widgetGR.setValue("name", input.name);
	widgetGR.insert();

	if (input.createTestPage) {
		var pageGR = new GlideRecord("sp_page");
		pageGR.addQuery("id", input.test_page_id);
		pageGR.query();
		if (pageGR.next())
			return;

		pageGR.setValue("id", input.test_page_id);
		pageGR.setValue("title", input.name + " - Test Page");
		pageGR.insert();

		var containerGR = new GlideRecord("sp_container");
		containerGR.initialize();
		containerGR.sp_page = pageGR.getUniqueValue();
		containerGR.insert();

		var rowGR = new GlideRecord("sp_row");
		rowGR.initialize();
		rowGR.sp_container = containerGR.getUniqueValue();
		rowGR.insert();

		var colGR = new GlideRecord("sp_column");
		colGR.initialize();
		colGR.sp_row = rowGR.getUniqueValue();
		colGR.insert();

		var instanceGR = new GlideRecord("sp_instance");
		instanceGR.initialize();
		instanceGR.sp_column = colGR.getUniqueValue();
		instanceGR.sp_widget = widgetGR.getUniqueValue();
		instanceGR.insert();
	}

	data.sys_id = widgetGR.getValue("sys_id");
}

if (input)
	saveWidget(input);	
	
})();