(function($sp, input, data, options, gs) {
	
	// Translations
	data.i18n = {
		no_table_supplied: gs.getMessage("There was no table name supplied for this form"),
		table_no_exist: gs.getMessage("That table does not exist"),
		record_not_found: gs.getMessage("Record not found"),
		table_unsupported: gs.getMessage("Form view not supported for requested table")
	};
	
	// input will be supplied if we're reloading the form after a UI action processing
	if (input) {
		
		// Get config from the input
		data.table = input.table;
		data.sys_id = input.sys_id;
		data.view = input.view;
		data.show_headings = input.show_headings;
		data.primary_only = input.primary_only;
		data.show_actions = input.show_actions;
		
	} else {
		
		// Get config from options/URL params
		data.table = options.table || $sp.getParameter('table') || false;
		data.sys_id = options.sys_id || $sp.getParameter('sys_id') || '-1';
		data.view = options.view || $sp.getParameter('view') || 'service_portal';
		data.show_headings = options.show_headings || true;
		data.primary_only = options.primary_only || false;
		data.show_actions = options.show_actions;
		
	}
	
	// Check for errors before going further
	data.errors = [];
	
	function addError(message) {
		data.errors.push(message);
		data.hasError = true;
	}
	
	if (!data.table) {
		addError(data.i18n.no_table_supplied);
		return;
	}
	
	if (data.table === 'sys_attachment') {
		addError(data.i18n.table_unsupported);
		return;
	}
	
	var gr = new GlideRecord(data.table);
	
	if (!gr.isValid()) {
		addError(data.i18n.table_no_exist);
		return;
	}
	
	if ((data.sys_id !== '-1') && (!gr.get(data.sys_id))) {
		addError(data.i18n.record_not_found);
		return;
	}
	
	// No errors, let's proceed!
	
	// Get some details about the current record/table
	data.can_write = gr.canWrite();
	
	// Get the form model, with the additional properties supplied by the FormDecoratorAPI
	var $fd = new fdAPI($sp);
	data.form = $fd.getDecoratedForm(data.table, data.sys_id, null, data.view, data.primary_only);
	
})($sp, input, data, options, gs);