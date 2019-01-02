(function(){
	data.depsMsg = gs.getMessage("Dependencies");
	data.templatesMsg = gs.getMessage("Templates");
	
	data.htmlBlockMsg = gs.getMessage("HTML Template");
	data.cssBlockMsg = gs.getMessage("CSS - SCSS");
	data.clientScriptMsg = gs.getMessage("Client Script");
	data.serverScriptMsg = gs.getMessage("Server Script");
	data.linkMsg = gs.getMessage("Link Function");
	data.demoDataMsg = gs.getMessage("Demo Data (JSON)");
	data.previewMsg = gs.getMessage("upper_preview");
	data.docMsg = gs.getMessage("Documentation");
	data.errorMsg = gs.getMessage("Error when saving the widget");
	
	data.angularProviders = [];
	data.sys_id = (input) ? input.sys_id : $sp.getParameter('sys_id');
	data.layoutPref = gs.getPreference("wep-layout");
	data.providersPref = gs.getPreference("wep-provider-" + data.sys_id);
	data.templatesPref = gs.getPreference("wep-template-" + data.sys_id);
	
	var gr = new GlideRecord('sp_widget');
	data.canCreate = gr.canCreate();
	// save the contents
	if (input && input.action == "save") {
		result = $sp.saveRecord(input.f.table, input.f.sys_id, input.f._fields);
		
		input.angularProviders.map(function(provider) {
			$sp.saveRecord(provider.f.table, provider.f.sys_id, provider.f._fields);
		});
		
		data.angularProviders = input.angularProviders;
		
		input.ngTemplates.map(function(template) {
			$sp.saveRecord(template.f.table, template.f.sys_id, template.f._fields);
		});
		
		data.ngTemplates = input.ngTemplates;
		
		if (input.updatedDocContent && input.updatedDocContent != input.docContent) {
			var widgetGR = new GlideRecord("sp_widget");
			if (widgetGR.get(data.sys_id)) {
				var documentationGR;

				if (widgetGR.getValue("docs")) {
					documentationGR = widgetGR.getElement("docs").getRefRecord();
					documentationGR.setValue("content", input.updatedDocContent);
					documentationGR.update();
				} else {
					documentationGR = new GlideRecord("sp_documentation");
					documentationGR.initialize();
					documentationGR.setValue("content", input.updatedDocContent);
					documentationGR.setValue("title", widgetGR.getValue("name"));
					var documentationID = documentationGR.insert();
					widgetGR.setValue("docs", documentationID);
					widgetGR.update();
				}
			}
		}

		return result;
	}

	// add new modal
	data.widgetAddNew = $sp.getWidget('widget-add-new', {});
	if (!data.sys_id)
		return;

	// Nested Widgets - clone and option schema
	data.widgetClone = $sp.getWidget('widget-clone', {sys_id: data.sys_id});
	data.widgetOptionSchemaModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'we20', embeddedWidgetOptions: {sys_id: data.sys_id}});

	// the target widget
	gr = new GlideRecordSecure('sp_widget');
	var q = gr.addQuery('sys_id', data.sys_id);
	gr.query();
	if (!gr.next()) {
		gs.addErrorMessage("cannot find widget " + data.sys_id);
		return;
	}

	data.outOfScope = !gr.isInSelectedScope();
	data.recordScopeLabel = gs.getScopeLabelByRecordId(gr.getUniqueValue());
	data.currentScopeLabel = gs.getCurrentApplicationName();
	data.canRead = gr.canRead();
	data.canWrite = gr.canWrite() && gr.getDisplayValue("read_only") !== "true";
	data.title = gr.getValue("name");
	// get the model for the widget from spForm
	data.f = $sp.getForm('sp_widget', gr.getUniqueValue());
	data.docContent = (data.f._fields.docs.value) ?
		gr.getElement("docs").getRefRecord().getValue("content") :
		getDocs("948bab53d721120023c84f80de61034e");
	
	// Get any related angular providers
	var m2mProviderGR = new GlideRecord("m2m_sp_ng_pro_sp_widget");
	m2mProviderGR.addQuery("sp_widget", data.sys_id);
	m2mProviderGR.query();
	while (m2mProviderGR.next()) {
		var providerGR = m2mProviderGR.getElement("sp_angular_provider").getRefRecord();
		if (!providerGR.canRead())
			continue;

		var provider = {
			show: false,
			name: providerGR.getValue("name"),
			f: $sp.getForm('sp_angular_provider', providerGR.getUniqueValue()),
			type: 'provider'
		};
		data.angularProviders.push(provider);
	}
		
	var ngTemplates = new GlideRecord("sp_ng_template");	
	ngTemplates.addQuery("sp_widget", data.sys_id);
	ngTemplates.query();
	
	data.ngTemplates = []
	
	while (ngTemplates.next()) {		
		data.ngTemplates.push({
			show: false,
			name: ngTemplates.getValue("id"),
			f: $sp.getForm('sp_ng_template', ngTemplates.getUniqueValue()),
			type: 'template'
		});		
	}
		
	function getDocs(id) {
		var gr = new GlideRecord('sp_documentation');
		gr.get(id);
		return gr.getValue("content");
	}	
})()