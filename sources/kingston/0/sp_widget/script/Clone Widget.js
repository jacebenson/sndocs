data.pageIDRequiredMsg = gs.getMessage("Page ID (Required)");
data.widgetNameMsg = gs.getMessage("Widget name");
data.widgetIDMsg = gs.getMessage("Widget ID");

var widgetCopyFields = ["template", "script", "client_script", "link", "data_table", "field_list", "controller_as", "public", "css", "documentation", "demo_data", "has_preview", "option_schema"];

if (input) {
	var widgetGR = new GlideRecord("sp_widget");
	widgetGR.addQuery("id", input.id);
	widgetGR.query();
	if (widgetGR.next()) {
		// Error Message
	} else {
		var copyFromWidget = new GlideRecord("sp_widget");
		copyFromWidget.addQuery("sys_id", input.copyFromWidgetSysID);
		copyFromWidget.query();

		if (copyFromWidget.next()) {
			widgetGR.setValue("id", input.id);
			widgetGR.setValue("name", input.name);

			widgetCopyFields.forEach(function(field) {
				widgetGR.setValue(field, copyFromWidget.getValue(field));
			});

			var newSysID = widgetGR.insert();
			data.sys_id = newSysID;

			// dependencies
			var depGR = new GlideRecord('m2m_sp_widget_dependency');
			depGR.query("sp_widget", input.copyFromWidgetSysID);
			while (depGR.next()) {
				depGR.sp_widget = newSysID;
				depGR.insert();
			}

			// providers
			proGR = new GlideRecord('m2m_sp_ng_pro_sp_widget');
			proGR.query("sp_widget", input.copyFromWidgetSysID);
			while (proGR.next()) {
				proGR.sp_widget = newSysID;
				proGR.insert();
			}
			
			// save cloned widget's relationship to OOB parent
			new SPWidgetCloneUtils().createCloneRelationship(copyFromWidget.getUniqueValue(), newSysID);

			if (input.createTestPage) {
				var pageGR = new GlideRecord("sp_page");
				pageGR.addQuery("id", input.test_page_id);
				pageGR.query();
				if (pageGR.next()) {
					//error
				} else {
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

					var instanceGR = new GlideRecord(widgetGR.getValue("data_table"));
					instanceGR.initialize();
					instanceGR.sp_column = colGR.getUniqueValue();
					instanceGR.sp_widget = widgetGR.getUniqueValue();
					instanceGR.insert();
				}
			}
		}
	}
}

data.copyFromWidgetSysID = options.sys_id;