var ScopedAppPackageSuppressor = Class.create();
ScopedAppPackageSuppressor.prototype = {
    initialize: function (sys_app) {
        this.app = sys_app;
        this.log = true;
    },

    suppress: function (gr) {
		var className = gr.getRecordClassName();
        if (className === 'wf_workflow')
            return this._workflowHasNoPublishedVersions(gr);
        if (className === 'sys_choice_set')
            return this._choicesOnElementNotInherited(gr);
        if (className === 'sys_scope_privilege')
            return this._screenInvalidCrossScopePrivileges(gr);
		if (className === 'sys_ui_list' || className == 'sys_ui_form')
			return this._screenRecordIsUserConfig(gr);

        return false;
    },

    setQuiet: function (quiet) {
        this.log = !quiet;
    },

    _workflowHasNoPublishedVersions: function (workflow) {
        var workflowVersion = new GlideRecord('wf_workflow_version');
        workflowVersion.addQuery('workflow', workflow.getUniqueValue());
        workflowVersion.addQuery('published', true);
        workflowVersion.query();
        var numPublishedVersions = workflowVersion.getRowCount();
        if (numPublishedVersions > 0)
            return false;

        if (this.log)
            gs.info("The '{0}' workflow will not be published with the '{1}' application. The workflow has no published versions.", [workflow.sys_name.toString(), this.app.name.toString()]);

        return true;
    },

    _choicesOnElementNotInherited: function (choiceSet) {
        var cs = new GlideRecord('sys_choice_set');
        if (!cs.get(choiceSet.getUniqueValue()))
            return false;

        // if dictionary entry exists then the choice set element is not inherited
        // and its choices will be unloaded as part of the table's bootstrap XML file
        var dictionary = new GlideRecord('sys_dictionary');
        dictionary.addQuery('name', cs.name.toString());
        dictionary.addQuery('element', cs.element.toString());
        dictionary.query();
        return dictionary.hasNext();
    },

    _screenInvalidCrossScopePrivileges: function (metadata) {
        var privilege = this._getChildClassRecord('sys_scope_privilege', metadata);
        var appId = this.app.getUniqueValue();
        if (privilege.isValidRecord()) {
            if (privilege.getValue('sys_scope') != appId)
                return true;
            if (privilege.getValue('source_scope') != appId)
                return true;
            if (privilege.getValue('status') != 'allowed')
                return true;
        }
        return false;
    },
	
	_screenRecordIsUserConfig : function (ui_record) {
		if (ui_record.isValidField('sys_user'))
			return ui_record.getValue('sys_user') != '';
		if (ui_record.isValidField('user'))
			return ui_record.getValue('user') != '';
		
		return false;
	},

    _getChildClassRecord: function (childClass, gr) {
        if (gr.getTableName() == childClass)
            return gr;
        var childClassRecord = new GlideRecord(childClass);
        childClassRecord.get('sys_id', gr.getUniqueValue());
        return childClassRecord;
    },

    type: 'ScopedAppPackageSuppressor'
};