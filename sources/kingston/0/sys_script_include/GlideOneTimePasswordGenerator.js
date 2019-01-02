var GlideOneTimePasswordGenerator = Class.create();
GlideOneTimePasswordGenerator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	 isPublic: function() {
        return true;		
    },
	
	generateOneTimePassword: function() {
	    var userSysId = GlideSession.get().getProperty("mfa.code.needed.user.id");
	    var result = this.newItem("result");
	    if(GlideStringUtil.nil(userSysId)) 
	    	result.setAttribute("msg", gs.getMessage("Failed to generate one time code. Please contact your administrator to login"));
	    else {
		    var success = SNC.MultifactorAuthUtil.generateOneTimePassword(userSysId);
			
			if (success) {
				var validity = GlideProperties.get("glide.multifactor.onetime.code.validity", "10");
				result.setAttribute("msg", gs.getMessage("The one time code was sent to your email address, and is valid for the next {0} minutes.", validity));
			} else {
				result.setAttribute("msg", gs.getMessage("Failed to generate one time code. Please contact your administrator to login"));
			}
		}
	},
	
	type: 'GlideOneTimePasswordGenerator'
});