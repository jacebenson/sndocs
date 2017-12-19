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
  data.defaultValueMsg = gs.getMessage("Default Value");
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
	data.options = JSON.parse(o);
	data.canWrite = gr.option_schema.canWrite();
})()