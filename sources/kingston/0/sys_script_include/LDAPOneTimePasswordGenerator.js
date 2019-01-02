var LDAPOneTimePasswordGenerator = Class.create();
LDAPOneTimePasswordGenerator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	 isPublic: function() {
        return true;		
    },
	
	generateOneTimePassword: function() {
	    var userSysId = GlideSession.get().getProperty("glide.authenticate.onetime.user.id");
	    var result = this.newItem("result");
	    if(GlideStringUtil.nil(userSysId)) 
	    	result.setAttribute("msg", gs.getMessage("Failed to generate one time password. Please contact your administrator to login"));
	    else {
		    var success = SNC.AuthenticationHelper.generateOneTimePassword(userSysId, "LDAPAuth");
			
			if (success) {
				var validity = GlideProperties.get("glide.authenticate.onetime.password.validity", "10");
				result.setAttribute("msg", gs.getMessage("The one time password was sent to your email address, and is valid for the next {0} minutes.", validity));
			} else {
				result.setAttribute("msg", gs.getMessage("Failed to generate one time password. Please contact your administrator to login"));
			}
		}
	},
	
	type: 'LDAPOneTimePasswordGenerator'
});