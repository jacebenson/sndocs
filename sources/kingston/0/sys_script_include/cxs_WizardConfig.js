var cxs_WizardConfig = Class.create();

cxs_WizardConfig.prototype = {
    EXCLUDE_FIELDS_FROM_OBJECT: {
        "sys_created_by": true,
        "sys_created_on": true,
        "sys_domain": true,
        "sys_mod_count": true,
        "sys_updated_by": true,
        "sys_updated_on": true,
        "sys_package": true,
        "sys_update_name": true
    },

    WIZARD_MACRO: "cxs_wizard_search",

    initialize: function(gr) {
        this._gr = gr;
        this._gru = new GlideRecordUtil();
    },

    setName: function(configName) {
        if (!this._gr || !this._gr.getUniqueValue())
            return false;

        if (configName) {
            this._gr.name = configName;
            return true;
        }

        this._gr.name = this._gr.expert.getDisplayValue();

        return true;
    },

    isDuplicate: function() {
        if (!this._gr)
            return false;

        // If this record is being updated and sc_cat_item has not changed
        // we don't need to check if we're creating a duplicate
        if (!this._gr.isNewRecord() && (!this._gr.expert.changes() && !this._gr.active.changes()))
            return false;

        // Search for an existing record that matches the one we're trying to create/update
        var wizardConfigGr = new GlideRecord("cxs_wizard_config");
        wizardConfigGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
        wizardConfigGr.addQuery("expert", this._gr.expert);
		wizardConfigGr.addActiveQuery();
        wizardConfigGr.query();

        return wizardConfigGr.hasNext();
    },

    getWizardVariableIds: function() {
        var sysIds = [];

        if (!this._gr)
            return sysIds;

        var wizardId = this._gr.expert + "";
        if (!wizardId)
            return sysIds;

        var wizardGr = new GlideRecord("expert");
        if (!wizardGr.get(wizardId))
            return sysIds;

        var searchableTypes = new cxs_WizardVarTypes().getTypeMap();

        var varsGr = new GlideRecord("expert_variable");
		varsGr.addQuery('expert',wizardId);
		varsGr.query();
		
        while (varsGr.next())
            if (searchableTypes[varsGr.type])
                sysIds.push(varsGr.getUniqueValue());

        return sysIds;
    },

    getWizardConfigObject: function() {
        var wizardConfig = {};
        this._gru.populateFromGR(wizardConfig, this._gr, this.EXCLUDE_FIELDS_FROM_OBJECT);
		wizardConfig.result_action_label = this._gr.getDisplayValue("result_action_label"); 
        wizardConfig.resultsHeaderText = this._gr.getDisplayValue("results_header_text");
        wizardConfig.configURL = this._gr.getLink(true);
        wizardConfig.configDisplayValue = this._gr.getDisplayValue();
        wizardConfig.search_field = {};
        this._gru.populateFromGR(wizardConfig.search_field, this._gr.search_variable.getRefRecord(), this.EXCLUDE_FIELDS_FROM_OBJECT);

        return wizardConfig;
    },
	
	isOnWizard: function() {
        var varGr = new GlideRecord("expert_variable");
        varGr.addQuery("expert", this._gr.expert);
        varGr.addQuery("macro.name", this.WIZARD_MACRO);
        varGr.query();

        return varGr.hasNext();
    },

    addToWizard: function() {
        if (this.isOnWizard())
            return false;
    
        var varGr = new GlideRecord("expert_variable");
        varGr.type = 14 // Macro;
        varGr.expert = this._gr.expert;
        varGr.macro.setDisplayValue(this.WIZARD_MACRO);
        varGr.question_text = "Contextual Search Results";
        varGr.name = "contextual_search_results";
        varGr.insert();

		this.addToWizardPanel(varGr);
		
        return true;
    },
	
	addToWizardPanel: function(exp_var) {
		var varGr = new GlideRecord('expert_panel_variable');
		varGr.addQuery('expert_variable',this._gr.search_variable);
		varGr.addQuery('expert_panel.expert',this._gr.expert);
		varGr.query();
		
		if (varGr.next()) {
			var varPan = new GlideRecord('expert_panel_variable');
			varPan.expert_panel = varGr.expert_panel;
			varPan.expert_variable = exp_var.getUniqueValue();
			varPan.order = varGr.order + 1;
			varPan.insert();
		}
		
		return true;
	},

    removeFromWizard: function() {
        if (!this.isOnWizard())
            return false;
    
        var varGr = new GlideRecord("expert_variable");
        varGr.addQuery("expert", this._gr.expert);
        varGr.addQuery("macro.name", this.WIZARD_MACRO);
        varGr.query();

        if (varGr.next()) {
			this.removeFromWizardPanel(varGr);

            return varGr.deleteRecord();
		}

        return false;
    },
	
	removeFromWizardPanel: function(exp_var) {
		var varGr = new GlideRecord('expert_panel_variable');
		varGr.addQuery('expert_variable', exp_var.getUniqueValue());
		varGr.addQuery('expert_panel.expert',this._gr.expert);
		varGr.query();
		
		if (varGr.next())
			return varGr.deleteRecord();
		
		return false;
	},
	
    type: 'cxs_WizardConfig'
}