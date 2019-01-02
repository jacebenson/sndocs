// form functionality - URL parameter driven
(function($sp, input, data, options, gs) {
  /* "use strict"; -linter issues */
  // populate the 'data' variable
	data.attachmentUploadSuccessMsg = gs.getMessage("Attachment upload was successful");
	data.recordAddedMsg = gs.getMessage("Record Added");
	data.updatedMsg = gs.getMessage("updated_uppercase");
	data.exportPDFMsg = gs.getMessage("Export to PDF");
	data.exportPDFLandMsg = gs.getMessage("Export to PDF (landscape)");
	data.addAttachmentMsg = gs.getMessage("Add an attachment");
	data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "24MB");

	data.isAdmin = gs.hasRightsTo('sp/configure.all/execute', null);
	data.emptyStateTemplate = options.empty_state_template;
	data.disableUIActions = options.disableUIActions || false;
	data.hideRelatedLists = options.hideRelatedLists || false;

	if (input) {
		data.table = input.table;
		data.sys_id = input.sys_id;
		data.view = input.view;
		var result = {};
		if (input._fields)
			result = $sp.saveRecord(input.table, input.sys_id, input._fields);

		if (input.sys_id == '-1'){
			data.sys_id = result.sys_id;
			data.isNewRecord = true;
		}
	} else {
		data.table = $sp.getParameter("t") || $sp.getParameter("table") || $sp.getParameter("sl_table") || options.table;
		data.sys_id = $sp.getParameter("sys_id") || $sp.getParameter("sl_sys_id") || options.sys_id;
		data.view = $sp.getParameter("v") || $sp.getParameter("view") || options.view; // no default
	}

	data.query = $sp.getParameter("query") || options.query;
	data.f = {};
	if (!data.table)
		return;
	
	// Form widget is not a supported way to view an attachment
	if (data.table == "sys_attachment") {
		data.tableUnsupported = true;
		return;
	}

	if (!GlideTableDescriptor.isValid(data.table))
		return;

	if (!data.sys_id)
		return;

	var rec = $sp.getRecord(data.table, data.sys_id);
	data.isValid = rec.isValid() || data.sys_id == "-1";
	if (!data.isValid)
		return;

	data.table = rec.getRecordClassName();
	data.tableHierarchy = GlideDBObjectManager.getTables(data.table).toArray().join();
	data.canWrite = rec.canWrite();
	data.canAttach = data.canWrite && gs.hasRole(gs.getProperty('glide.attachment.role')) && !GlideTableDescriptor.get(data.table).getED().getBooleanAttribute("no_attachment");
	data.f = $sp.getForm(data.table, data.sys_id, data.query, data.view);

	// Activity formatter is hardcoded to set specific options
	for (var f in data.f._formatters) {
		var fm = data.f._formatters[f];
		if (fm.formatter == "activity.xml") {
			fm.hardcoded = true;
			fm.widgetInstance = $sp.getWidget('widget-ticket-conversation',
																{table: data.table,
																 sys_id: data.sys_id,
																 includeExtended: true,
																 title: "${Activity}",
																 placeholder: "${Add a comment}",
																 btnLabel: "${Post}"});
		} else
			fm.widgetInstance = $sp.getWidget(fm.widget, data);
	}
})($sp, input, data, options, gs);