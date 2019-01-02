var PwdAjaxRequestProcessor = Class.create();
PwdAjaxRequestProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  
  /**
  * Tests if the security is good enough.
  */
  _validateSecurity: function() {
    
    //check if there's any csrf violation or not.
    //now, we have only csrf validation.
    if (!this._validateCSRF())
      return false;
    
    // if csrf violation didn't get detected, then set response attributes and return.
	var token = this.getParameter("sysparam_pwd_csrf_token");
	this._setSecurityResponseMessage('ok','',token);
    return true;
  },

    
  /**
  * Validates CSRF violation.
  */
  _validateCSRF: function() {
    
    var csrf_token = this.getParameter("sysparam_pwd_csrf_token");
    var securityMgr = new SNC.PwdSecurityManager();
    var result = securityMgr.validateSecureToken(csrf_token);
    
    
    // if the result turns out bad, set the response and return the result. 
    if (!result) {
      //remove the stored security token.
      securityMgr.removeSecurityToken();
      
      var msg = gs.getMessage('Security violation');
      this._setSecurityResponseMessage('error',msg,'');
    }
    return result;
  },
	
  
  /**
  * Sets a security response and send it back.
  */
  _setSecurityResponseMessage: function(status, msg, token) {
    
    var response = this.newItem("security");
    response.setAttribute("status", status);
    response.setAttribute("message", msg);
    response.setAttribute("pwd_csrf_token", token);
  }
});