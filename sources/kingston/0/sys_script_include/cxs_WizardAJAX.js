var cxs_WizardAJAX = Class.create();

cxs_WizardAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getWizardConfigJSON: function() {
		return new JSON().encode(this.getWizardConfig());
	},
	
	getWizardConfig: function() {
		var searchConfig = {};

		var wizardId = this.getParameter("sysparm_wizard_id");

		if (!wizardId)
			return searchConfig;
		
		var wizardConfigGr = new GlideRecord('cxs_wizard_config');
		wizardConfigGr.addQuery('expert', wizardId);
		wizardConfigGr.addActiveQuery();
		wizardConfigGr.query();
		if (!wizardConfigGr.next())
			return searchConfig;
		
		searchConfig = cxs_App.getBusiness(wizardConfigGr).getWizardConfigObject();

		return searchConfig;
    },
	
    getDefaultLimit: function() {
        return gs.getProperty("com.snc.contextual_search.result.default.limit", 10);
    },	
	
	isPublic: function() {
		return false;
	},
	
	type: 'cxs_WizardAJAX'
});