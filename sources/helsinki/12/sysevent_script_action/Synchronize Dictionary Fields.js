synchronizeDictionaryFields();

function synchronizeDictionaryFields() {
	var gr = new GlideRecord("sys_dictionary");
	gr.setWorkflow(false);
	gr.autoSysFields(false);
	gr.query();
	while (gr.next()) {
		syncAttributes(gr);
		var synchronizedDependent = syncDependent(gr);
		var synchronizedDefaultValue = syncDefaultValue(gr);
		var refQualUSync = updateRefQual(gr);
			if (synchronizedDependent || synchronizedDefaultValue || refQualUSync)
				gr.update();

	}
}

function syncDependent(gr) {
	if (gr.dependent != '' && (gr.dependent.indexOf(',') == -1) && gr.dependent_on_field != gr.dependent) {
		gr.dependent_on_field = gr.dependent;
		gr.use_dependent_field = true;
		return true;
	}
	
	return false;
}

function syncDefaultValue(gr) {
	if (gr.default_value.trim().indexOf("javascript:") != 0)
		return false;
	
	var defaultValue = gr.default_value.trim();
	defaultValue = defaultValue.substring("javascript:".length);
	if (defaultValue == "")
		return false;

	if (defaultValue.endsWith(";"))
		defaultValue = defaultValue.substring(0, defaultValue.length - 1);
	
	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", defaultValue).addOrCondition("script", defaultValue + ";");
	dyn.query();
	if (!dyn.next())
		return false;
	
	if (gr.dynamic_default_value == dyn.sys_id && gr.use_dynamic_default == true)
		return false;
	
	gr.dynamic_default_value = dyn.sys_id;
	gr.use_dynamic_default = true;
	
	return true;
}

function syncAttributes(gr) {
	SNC.DictionaryAttribute.updateFromDictionaryAttributesField(gr.name, gr.element);
}

function updateRefQual(gr){
	var update = false;
	if (gr.reference_qual.trim().indexOf("javascript:") != 0 ) {
		gr.use_reference_qualifier = 'simple';
		gr.reference_qual_condition = gr.reference_qual.trim();
		update = true;
		return update;
	}
	currentRefQual = gr.reference_qual;
	var currentReferenceQual = gr.reference_qual.trim();
	currentReferenceQual = currentReferenceQual.substring("javascript:".length);
	if (currentReferenceQual == "")
		return update;
	
	if (currentReferenceQual.endsWith(";"))
		currentReferenceQual = currentReferenceQual.substring(0, currentReferenceQual.length - 1);
		
	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", currentReferenceQual).addOrCondition("script", currentReferenceQual + ";");
	dyn.query();
	if (dyn.next()) {
		gr.use_reference_qualifier = 'dynamic';
		gr.dynamic_ref_qual = dyn.sys_id;
		update = true;
	} else {
		gr.use_reference_qualifier = 'advanced';
		update = true;
	}
	return update;
}

