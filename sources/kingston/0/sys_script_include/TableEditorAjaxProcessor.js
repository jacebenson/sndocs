var TableEditorAjaxProcessor = Class.create();
TableEditorAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	_formPath: 'ui/configure.personalize_form/read',
	_listPath: 'ui/configure.personalize_list/read',
	
	process: function() {
		if (this.getType() == "loadDefaultFormSection")
			return this.loadDefaultFormSection();
		if (this.getType() == "loadDefaultList")
			return this.loadDefaultList();
		
	},
	
	/* Returns sys_id of the default section for a given table */
	loadDefaultFormSection: function() {
		var tableName = this.getParameter("sysparm_tableName");
		if (!GlideTableDescriptor.isValid(tableName))
			return "";
		
		var sectionId = SncTableEditor.getDefaultFormSectionId(tableName);
		if (sectionId == null)
			sectionId = GlideSysForm.generateDefaultForm(tableName);
		
		if(sectionId == null)
			sectionId = SncTableEditor.getDefaultFormSectionId(tableName);
		
		return this._hasAccess(this._formPath, sectionId) ? sectionId : "";
	},
	
	/* Returns sys_id of the default list of a given table */
	loadDefaultList: function() {
		var tableName = this.getParameter("sysparm_tableName");
		if (!GlideTableDescriptor.isValid(tableName))
			return "";
		
		var sysList = new GlideSysList(tableName);
		var listId = sysList.getStandardListID();

		if (listId != null)
			return this._hasAccess(this._listPath, listId) ? listId : "";
		
		/* Creates a default list if there are no existing list views for a table */
		sysList.getAccessList('');

		/* Return the sys_id of the default list */
		var grList = new GlideRecord("sys_ui_list");
		grList.addQuery('name', tableName);
		grList.addQuery('view', 'Default view');
		grList.query();
		if (grList.next())
			listId = grList.getUniqueValue();
		
		return this._hasAccessForContext(this._listPath, grList) ? listId : "";
	},
	
	_hasAccess: function (resourcePath, contextId) {
		var contextTable = (this._listPath == resourcePath) ? 'sys_ui_list' : 'sys_ui_section';
		var contextRecord = new GlideRecord(contextTable);
		contextRecord.get('sys_id', contextId);
		return this._hasAccessForContext(resourcePath, contextRecord);
	},
	
	_hasAccessForContext: function (resourcePath, contextRecord) {
		if (this._formPath != resourcePath && this._listPath != resourcePath)
			return false;
		if (!contextRecord.isValidRecord())
			return false;
		var sm = GlideSecurityManager.get();
		return sm.hasRightsTo(resourcePath, contextRecord);
	},
	
	type: 'TableEditorAjaxProcessor'
});


