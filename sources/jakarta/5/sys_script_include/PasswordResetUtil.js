var PasswordResetUtil = Class.create();
PasswordResetUtil.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {

	isPublic: function() {
		return true;
	},
	
	validatePassword : function() {
	    var validateErr = SNC.PasswordResetUtil.validateStrongerPassword();
		if ("true" != validateErr) 
			this.setAnswer("false");
		else
			this.setAnswer("true");
	},
	
	sendResetEmail: function() {
	    if(!this._validateSecurity()){
			return;
		}
		
		var result = this.newItem("result");
		var userId = gs.getSession().getProperty('sysparm_sys_user_id');
		// We get the requestId from the trustworthy session so no need to sanitize
		var requestId = gs.getSession().getProperty('sysparm_request_id');
		
		this._sendResetEmail(userId,requestId, result);
	},
	
	_sendResetEmail: function(userId, requestId, result) {
		var usr = new GlideRecord('sys_user');
		usr.addQuery('sys_id', userId);
		usr.addQuery('active', 'true');
		usr.queryNoDomain();
		if(!usr.next()){
			gs.log("User : " + userId + " is eiter inactive or doesn't exist on the instance");
			result.setAttribute("result","false");
			return;
		}
		var resetPasswordURL = '';
		var token = SNC.PasswordResetUtil.generateUniqueUserToken(usr.sys_id);
		if(GlideStringUtil.notNil(token))
			resetPasswordURL = this.getInstanceURL() + '/passwordreset.do?sysparm_id=' + usr.sys_id + '&sysparm_request_id=' + requestId + '&sysparm_nostack=true&sysparm_token=' + token;
		else {
			logError("Failed to generate unique token for user. Password reset failed for user : " + usr.user_name);
			result.setAttribute("result","false");
			return;
		}
		var eventName = 'password.reset.url';
		var param1 = GlideProperties.get("glide.pwd_reset.onetime.token.validity","12");
		var param2 = resetPasswordURL;
		gs.eventQueue(eventName, usr, param1, param2);
		result.setAttribute("result","true");
	},
	
	 getInstanceURL: function() {
        var url = gs.getProperty("glide.servlet.uri");
        if (GlideStringUtil.nil(url)) {
            gs.log("glide.servlet.url is empty!");
            return "";
        }
        url = url.trim();
        var len = url.length;
        if (url[len-1] == '/')
            return url.substring(0, len-1);
        
        return url;
	},
	
    type: 'PasswordResetUtil'
});