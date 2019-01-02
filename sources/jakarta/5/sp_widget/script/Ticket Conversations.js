(function() {
	data.uploadingAttachmentMsg = gs.getMessage("Uploading attachment...");
	data.sharingLocMsg = gs.getMessage("Sharing location...");
	data.scanBarcodeMsg = gs.getMessage("Scan barcode");
	data.checkInLocMsg = gs.getMessage("Check in location");
	data.messagePostedMsg = gs.getMessage("Message has been sent");
	data.viewMsg = gs.getMessage("View");
	data.attachAddedMsg = gs.getMessage("Attachment added");
	data.attachFailMsg = gs.getMessage("Failed to add attachment");
	data.sys_id = input.sys_id || options.sys_id || $sp.getParameter("sys_id");
	data.table = input.table || options.table || $sp.getParameter("table");
	// don't use options.title unless sys_id and table also come from options
	if (options && options.sys_id && options.table)
		data.ticketTitle = options.title;
	data.placeholder = options.placeholder || gs.getMessage("Type your message here...");
	data.placeholderNoEntries = options.placeholderNoEntries || gs.getMessage("Type your message here...");
	data.btnLabel = options.btnLabel || gs.getMessage("Send");
	data.includeExtended = options.includeExtended || false;
	data.use_dynamic_placeholder = options.use_dynamic_placeholder;
	data.isNewRecord = data.sys_id == -1 || gr.isNewRecord();

	var gr = new GlideRecord(data.table);
	if (!gr.isValid())
		return;

	gr.get(data.sys_id);
	if (!gr.canRead())
		return;

	options.no_readable_journal_field_message = options.no_readable_journal_field_message || gs.getMessage("No readable comment field");
	data.number = gr.getDisplayValue('number');
	data.created_on = gr.getValue('sys_created_on');

	if (input) { // if we have input then we're saving
		if (input.journalEntry && input.journalEntryField){
			if (gr.canWrite(input.journalEntryField)){
				gr.setDisplayValue(input.journalEntryField, input.journalEntry);
				gr.update();
				$sp.logStat('Comments', data.table, data.sys_id, input.journalEntry);
			}
		}
		data.ticketTitle = input.ticketTitle;
		data.placeholder = input.placeholder;
		data.btnLabel = input.btnLabel;
		data.includeExtended = input.includeExtended;
	} else {
		if (!data.ticketTitle) {
			if (gr.short_description.canRead())
				data.ticketTitle = gr.getDisplayValue("short_description");
			if (!data.ticketTitle)
				data.ticketTitle = data.number;
		}

		$sp.logStat('Task View', data.table, data.sys_id);
	}

	data.canWrite = gr.canWrite();
	data.canAttach = gs.hasRole(gs.getProperty("glide.attachment.role")) && GlideTableDescriptor.get(data.table).getED().getAttribute("no_attachment") != "true";
	data.canRead = gr.canRead();
	data.hasWritableJournalField = false;
	data.hasReadableJournalField = false;
	if (data.canRead && !data.isNewRecord) {
		data.stream = $sp.getStream(data.table, data.sys_id);
		// Journal fields come in correct order already
		// so grab the first 2 writeable fields
		if ('journal_fields' in data.stream) {
			var jf = data.stream.journal_fields;
			for(var i=0; i < jf.length; i++){
				if (jf[i].can_read === true)
					data.hasReadableJournalField = true;
				if (jf[i].can_write === true){
					data.hasWritableJournalField = true;
					if (!data.primaryJournalField)
						data.primaryJournalField = jf[i];
					else if (data.includeExtended && !data.secondaryJournalField)
						data.secondaryJournalField = jf[i];
					else
						break;
				}
			}
		}

	}

	data.tableLabel = gr.getLabel();

})()