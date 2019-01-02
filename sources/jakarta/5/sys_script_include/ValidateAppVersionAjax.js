var ValidateAppVersionAjax = Class.create();
ValidateAppVersionAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	isPulishableVersion : function() {
		var version = this.getParameter("sysparm_version");
		var app_id = this.getParameter("sysparm_app_id");
		var publish_to_store = this.getParameter("sysparm_publish_to_store");
		
		var obtainer = new ScopedAppVendorInfoObtainer();
		var info = new obtainer.obtainDisplayVersionFromAppRepo(app_id, version, publish_to_store);
		
		if (info) {
			if (info.allowed)
				return;
		
			if (info.errorMessage)
				return info.errorMessage;	
		}

		if (obtainer.getErrorMessage())
			return obtainer.getErrorMessage();		
		
		return gs.getMessage("Unable to validate this version for an unspecified reason. Please contact your administrator.");
	},
	
    type: 'ValidateAppVersionAjax'
});