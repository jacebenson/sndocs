(function() {

	//if (!input) return;

	data.addOptionMsg = gs.getMessage("Add option");
	data.optionLabelMsg = gs.getMessage("Option label");
	data.nameMsg = gs.getMessage("Name (field name syntax)");
	data.oneLinePerChoiceMsg = gs.getMessage("One line per choice");
	data.hintOptionalMsg = gs.getMessage("Hint");
	data.referencedTableMsg = gs.getMessage("Referenced table");
	data.selectTableMsg = gs.getMessage("Select table...");
	data.labelMsg = gs.getMessage("Label");
	data.typeMsg = gs.getMessage("Type");
	data.removeOptionMsg = gs.getMessage("Remove option");
  data.defaultValueMsg = gs.getMessage("Default value");
	data.formSectionMsg = gs.getMessage("Form section")
	data.saveMsg = gs.getMessage("Save");

	var gr;
	data.sys_id = options.sys_id || input.sys_id;
	if (input.action == 'save') {
		gr = new GlideRecord('sp_widget');
		gr.get(data.sys_id);
		gr.setValue('option_schema', JSON.stringify(input.options));
		gr.update();
	}

	data.options = [];
	if (!data.sys_id)
		return;

	gr = new GlideRecord('sp_widget');
	gr.get(data.sys_id);
	data.title = gr.getValue('name');
	data.widgetID = gr.getValue('id');
	var o = gr.getValue('option_schema') || '[]';
	try {
		data.options = JSON.parse(o);
	} catch(e) {
		data.options = [];
		data.optionsError = true;
	}
	data.canWrite = gr.option_schema.canWrite();
	data.data_table = gr.getValue('data_table');
	data.section_options = [];
	
	var sec = new GlideRecord("sys_ui_section");
	sec.addEncodedQuery("view=0ce54027b33232007a6de81816a8dca1^name=" + data.data_table);
	sec.query();
	while(sec.next()) {
		data.section_options.push(sec.getValue('sys_name'));
	}
})()