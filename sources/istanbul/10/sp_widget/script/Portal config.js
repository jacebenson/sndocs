(function(){
	data.tagLineMsg = gs.getMessage("Tag Line");
	data.tagLineColorMsg = gs.getMessage("Tag Line color");
	data.homepageBkgdColorMsg = gs.getMessage("Homepage background color");
	data.bkgdImageMsg = gs.getMessage("Background Image");
	data.quickSetupMsg = gs.getMessage("Quick Setup");
	data.themeColorsMsg = gs.getMessage("Theme Colors");
	data.portalTitleMsg = gs.getMessage("Portal title");
	var portalId, portalGr, qsConfig;
	var backupImageSuffix = "_sp_bak";
	data.portalTable = "sp_portal";
	data.fieldModel = {};
	data.undoModel = {};
	
	if (input) {
		portalId = input.portal_id;
		portalGr = $sp.getRecord(data.portalTable, portalId);
		gs.getUser().setPreference('sp.portal', portalGr.getValue("url_suffix"));
		qsConfig = portalGr.getValue('quick_start_config');

		if (input.doUndo === true)
			processUndo(portalGr, input, qsConfig);

	} else {
		// Query for the portal using preference
		portalGr = new GlideRecord(data.portalTable);
		portalGr.addQuery('url_suffix', gs.getUser().getPreference('sp.portal'));
		portalGr.query();
		
		if (!portalGr.hasNext()) {
			portalGr.initialize();
			portalGr.query();
		}
			
		if (portalGr.next()) {
			portalId = portalGr.getUniqueValue();
			qsConfig = portalGr.getValue('quick_start_config');
		} else {
			gs.error("Portal config - Could not find any Service Portals");
		}				
	}
	
	main(data, portalGr, qsConfig);

	function main(data, portalGr, qsConfig) {
		
		var portalForm = $sp.getForm(data.portalTable, portalId);
		data.hasQsConfig = (qsConfig) ? true : false;
		data.portal_id = portalGr.getUniqueValue();
		data.portal = {
			theme: portalGr.getValue('theme'),
			homepage: portalGr.getDisplayValue("homepage"),
			url_suffix: portalGr.getValue("url_suffix"),
			displayValue: portalGr.getDisplayValue(),
			value: portalGr.getUniqueValue()
		};

		data.colorModel = getQuickStartColorModel();
		data.cssVariables = getVariableValues(data.colorModel, data.portal_id);
		data.fieldModel.title = getFieldModel(portalForm._fields.title, data.portalTable, portalId);
		data.fieldModel.logo = getImageModel(portalForm._fields.logo, data.portalTable, portalId);
		if (qsConfig) {
		    qsConfig = JSON.parse(qsConfig)[0];
			var homepageSearchRect = $sp.getForm(qsConfig.tagline.table, qsConfig.tagline.sys_id);
			data.fieldModel.tagline = getFieldModel(homepageSearchRect._fields[qsConfig.tagline.field], qsConfig.tagline.table, qsConfig.tagline.sys_id);
			data.undoModel.tagline = homepageSearchRect._fields[qsConfig.tagline.field].value;
			data.fieldModel.hero = getHeroModel(qsConfig.hero_background);
			data.fieldModel.homepageBackgroundColor = data.colorModel[0].variables[1];
			data.fieldModel.taglineColor = data.colorModel[0].variables[0];
			prepUserImageForUndo(qsConfig.hero_background.table, qsConfig.hero_background.sys_id, qsConfig.hero_background.field);
		}

		// Prep the undo model
		prepUserImageForUndo(data.portalTable, portalId, 'logo');
		data.undoModel.title = portalForm._fields.title.value;
		data.undoModel.cssVariables = portalGr.getValue('css_variables');
	}

	function processUndo(portalGr, input, qsConfig) {
		// Undo title
		portalGr.setValue('title', input.undoModel.title);
		// Undo css_variables
		portalGr.setValue('css_variables', input.undoModel.cssVariables);
		portalGr.update();
				
		if (typeof(qsConfig) === "string") {
			qsConfig = JSON.parse(qsConfig)[0];		
		}
				
		if (qsConfig) {
			// Undo tagline
			var taglineGr = new GlideRecord(qsConfig.tagline.table);
			taglineGr.get(qsConfig.tagline.sys_id);
			taglineGr.setValue(qsConfig.tagline.field, input.undoModel.tagline);
			taglineGr.update();			
			
			// Undo logo
			restoreUserImageFromBackup(portalGr.getTableName(), portalGr.getUniqueValue(), 'logo');

			// Undo hero background
			restoreUserImageFromBackup(qsConfig.hero_background.table, qsConfig.hero_background.sys_id, qsConfig.hero_background.field);		
		}
	}

	function getFieldModel(fieldModel, table, sys_id) {
		// Don't show mandatory markers because they are ugly
		fieldModel = fieldModel || {};
		fieldModel.sys_mandatory = false;
		fieldModel.mandatory = false;
		return {field: fieldModel, table: table, sys_id: sys_id };
	}

	function getImageModel(fieldModel, table, sys_id) {
		var m = getFieldModel(fieldModel, table, sys_id);
		m.field.table = table;
		m.field.sys_id = sys_id;
		return m;
	}

	function getHeroModel(heroConfig) {
		var homepageMainContainer = $sp.getForm(heroConfig.table, heroConfig.sys_id);
		var heroGr = $sp.getRecord(heroConfig.table, heroConfig.sys_id);
		var m = getImageModel(homepageMainContainer._fields[heroConfig.field], heroConfig.table, heroConfig.sys_id);
		m.container = {
			background_color: heroGr.getValue('background_color'),
			background_style: heroGr.getValue('background_style'),
			sys_id: heroGr.getUniqueValue()
		};
		return m;
	}

	function deleteBackupImages(tableSysId) {
		var attachment = new GlideSysAttachment();
		var gr = new GlideRecord('sys_attachment');
		var grThumb;
		gr.addQuery('table_name', 'CONTAINS', backupImageSuffix);
		gr.addQuery('table_sys_id', tableSysId);
		gr.query();
		deleteAttachmentsAndThumbnails(gr);
	}

	function deleteAttachmentsAndThumbnails(attachmentGR) {
		while (attachmentGR.next()) {
			gs.print('Service Portal Branding Editor deleting temporary sys_attachment and thumbnails: ' + attachmentGR.getUniqueValue());
			attachmentGR.deleteRecord();
		}
	}
	
	function prepUserImageForUndo(tableName, tableSysId, fieldName) {
		deleteBackupImages(tableSysId);
		var attachment = new GlideSysAttachment();
		attachment.copy(tableName, tableSysId, tableName + backupImageSuffix, tableSysId);

		// rename so it doesn't get deleted when a new image is uploaded
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_sys_id', tableSysId);
		gr.addQuery('table_name', 'CONTAINS', backupImageSuffix);
		gr.addQuery('file_name', 'CONTAINS', fieldName);
		gr.query();
		while(gr.next()){
			var f = gr.getValue('file_name') + backupImageSuffix;
			gr.setValue('file_name', f);
			gr.update();
		}
	}

	function restoreUserImageFromBackup(tableName, tableSysId, fieldName) {
		// Delete file_name and its thumbnails
		var attachment = new GlideSysAttachment();
		var gr = new GlideRecord('sys_attachment');
		var grThumb, f, t;
		gr.addQuery('file_name', fieldName);
		gr.addQuery('table_sys_id', tableSysId);
		gr.query();
		deleteAttachmentsAndThumbnails(gr);
		
		// this renames the attachments:
		//   file_name_sp_bak -> file_name
		// and
		//   table_name_sp_bak -> table_name
		gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_sys_id', tableSysId);
		gr.addQuery('table_name', 'CONTAINS', backupImageSuffix);
		gr.addQuery('file_name', 'CONTAINS', fieldName);
		gr.query();
		while(gr.next()){
			f = gr.getValue('file_name').replace(backupImageSuffix, '');
			t = gr.getValue('table_name').replace(backupImageSuffix, '');
			gr.setValue('file_name', f);
			gr.setValue('table_name', t);
			gr.update();
		}
	}

	function getQuickStartColorModel(){
		var varModel = [
			{title: "", variables: [
				{label: "${Tagline color}", name: "$sp-tagline-color", type: "color"},
				{label: "${Homepage background color}", name: "$sp-homepage-bg", type: "color"}
			]},
			{title: "${Navbar}", variables: [
				{label: "${Navbar background}", name: "$navbar-inverse-bg", type: "color"},
				{label: "${Navbar divider}", name: "$sp-navbar-divider-color", type: "color"},
				{label: "${Navbar link color}", name: "$navbar-inverse-link-color", type: "color"},
				{label: "${Navbar link hover}", name: "$navbar-inverse-link-hover-color", type: "color"}
			]},
			{title: "${Brand}", variables: [
				{label: "${Page background}", name: "$body-bg", type: "color"},
				{label: "${Panel background}", name: "$panel-bg", type: "color"},
				{label: "${Button default background}", name: "$btn-default-bg", type: "color"},
				{label: "${Primary}", name: "$brand-primary", type: "color"},
				{label: "${Success}", name: "$brand-success", type: "color"},
				{label: "${Info}", name: "$brand-info", type: "color"},
				{label: "${Warning}", name: "$brand-warning", type: "color"},
				{label: "${Danger}", name: "$brand-danger", type: "color"}
			]},
			{title: "${Text}", variables: [
				{label: "${Text color}", name: "$text-color", type: "color"},
				{label: "${Text success}", name: "$state-success-text", type: "color"},
				{label: "${Text muted}", name: "$text-muted", type: "color"},
				{label: "${Link color}", name: "$link-color", type: "color"}
			]}
		];
		return varModel;
	}

	function getVariableValues(colorModel, portalId){
		var keys = ["$sp-logo-margin-y","$sp-logo-margin-x"];
		var g, v, group, variable;
		for(g in colorModel) {
			group = colorModel[g];
			for (v in group.variables){
				variable = group.variables[v];
				keys.push(variable.name);
			}
		}
		var variableValues = $sp.buildThemeVariableModel(portalId, keys.join(","));

		// Put the values into the colorModel
		for(g in colorModel) {
			group = colorModel[g];
			for(v in group.variables) {
				variable = group.variables[v];
				variable.value = variableValues[variable.name];
			}
		}

		return variableValues;
	}

	function restoreTheme(themeSysId, variables) {
		var gr = new GlideRecord("sp_theme");
		if (gr.get(themeSysId)) {
			gr.setValue("css_variables", variables);
			gr.update();
		}
	}

})()

