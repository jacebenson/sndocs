var GlideMultifactorAuthenticator = Class.create();
GlideMultifactorAuthenticator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	validateResponse: function () {
		var response = this.getParameter("sysparm_response").toString();
		var valid = SNC.MultifactorAuthUtil.isResponseValid(response);
		var result = this.newItem("result");
		result.setAttribute("validated", valid);
		if(valid)
			SNC.SecurityEventSender.sendMultifactorAuthEventData("multifactor.auth.setup.success", null, null, false);
	},
	
	isEnabled: function() {
		var enabled = SNC.MultifactorAuthUtil.isEnabled();
		var result = this.newItem("result");
		result.setAttribute("enabled", enabled);
	},
	
	isValidated: function() {
		var validated = SNC.MultifactorAuthUtil.isValidated();
		var result = this.newItem("result");
		result.setAttribute("validated", validated);
	},
	
	resetCode: function(){
		SNC.MultifactorAuthUtil.reset(false);
		return this.loadPopupContent();
	},
	
	disableMFA: function(){
		SNC.MultifactorAuthUtil.reset(true);
	},
	
	loadPopupContent: function(){
		var contentMap = new Packages.java.util.HashMap();
		var result = this.newItem("result");
		contentMap = SNC.MultifactorAuthUtil.loadPopupContent();
		if(contentMap != null) {
			result.setAttribute("validated", contentMap.get("validated").toString());
			result.setAttribute("qrCodeURL", contentMap.get("qrCodeURL").toString());
			result.setAttribute("qrCodeText", contentMap.get("qrCodeText").toString());
			result.setAttribute("canDisable", contentMap.get("canDisable").toString());
		}
	},
	
	loadPageContent: function(){
		var contentMap = new Packages.java.util.HashMap();
		var result = this.newItem("result");
		contentMap = SNC.MultifactorAuthUtil.loadPageContent();
		if(contentMap != null) {
			result.setAttribute("qrCodeURL", contentMap.get("qrCodeURL").toString());
			result.setAttribute("qrCodeText", contentMap.get("qrCodeText").toString());
			result.setAttribute("canBypass", contentMap.get("canBypass").toString());
		}
	},

	type: 'GlideMultifactorAuthenticator'
});