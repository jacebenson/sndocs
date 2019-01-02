var FileTypeNameOverrides = (function() {
	var nameOverrides = {	
		sys_ui_module: {
			name: 'Module (Mobile)', 
			pluralName: 'Modules (Mobile)'
		}, 
		sys_ui_application: {
			name: 'Application Menu (Mobile)', 
			pluralName: 'Application Menus (Mobile)'
		}, 
		sys_ui_list: {
			name: 'List Layout', 
			pluralName: 'List Layouts'
		}, 
		sys_dictionary: {
			name: 'Table Column', 
			pluralName: 'Table Columns'
		},
		sys_ui_macro: {
			name: 'UI Macro',
			pluralName: 'UI Macros'
		},
		wf_workflow: {
			name: 'Workflow', 
			pluralName: 'Workflows'
		},
		content_block_detail: {
			name: 'Content Block - Detail', 
			pluralName: 'Content Blocks - Detail'
		},
		content_block_flash: {
			name: 'Content Block - Flash', 
			pluralName: 'Content Blocks - Flash'
		},
		content_block_header: {
			name: 'Content Block - Header', 
			pluralName: 'Content Blocks - Header'
		},
		content_block_iframe: {
			name: 'Content Block - iFrame', 
			pluralName: 'Content Blocks - iFrame'
		},
		content_block_lists: {
			name: 'Content Block - List', 
			pluralName: 'Content Blocks - List'
		},
		content_block_menu: {
			name: 'Content Block - Menu', 
			pluralName: 'Content Blocks - Menu'
		},
		content_block_programmatic: {
			name: 'Content Block - Programmatic', 
			pluralName: 'Content Blocks - Programmatic'
		},
		content_block_static: {
			name: 'Content Block - Static', 
			pluralName: 'Content Blocks - Static'
		},
		sc_cat_item_guide: {
			name: 'CNS:Order Guide',
			pluralName: 'CNS:Order Guides'
		},
		sp_page: {
			name: 'Service Portal Page',
			pluralName: 'Service Portal Pages'
		},
		sp_instance: {
			name: 'Widget Instance',
			pluralName: 'Widget Instances'
		},
		v_ws_creator: {
			name: 'Import Set Web Service',
			pluralName: 'Import Set Web Services'
		},
		v_ws_editor: {
			name: 'Import Set Web Service',
			pluralName: 'Import Set Web Services'
		}
	};
	
	var translated = {};
	
	function getTranslatedOverrides() {
		if (_.isEmpty(translated)) {
			translated = _.mapObject(nameOverrides, function(record) {
				return {
					name: gs.getMessage(record.name),
					pluralName: gs.getMessage(record.pluralName)
				};
			});
		}
		return translated;
	}
	
	return {
		apply: function(fileType) {
			if (!_.has(nameOverrides, fileType.id))
				return fileType;
			return _.extendOwn({}, fileType, getTranslatedOverrides()[fileType.id]);
		}
	};
})();