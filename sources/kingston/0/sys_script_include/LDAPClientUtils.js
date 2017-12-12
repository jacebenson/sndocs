gs.include("LDAPUtils");

var LDAPClientUtils = Class.create();
LDAPClientUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    testOUConnection: function() {
        var ouSysId = this.getParameter("sysparm_ouSysId");
        var ldapOu = new GlideRecord("ldap_ou_config");
        ldapOu.get(ouSysId);
        
        var result = this.newItem("result");
        var error = this.newItem("error");
        result.appendChild(error);
        
        var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(ldapOu.server.toString(), ouSysId);
        var testResult = false;
        try {
            testResult = ldapConnectionTester.testConnection();
            error.setAttribute('code', gs.getSession().getProperty("ldap_test.errorCode"));
            
            var message = this.newItem('message');
            message.setAttribute('value', GlideXMLUtil.removeInvalidChars(gs.getSession().getProperty("ldap_test.errorMessage")));
            error.appendChild(message);
        }catch(e) {
            error.setAttribute('code', "41000");
            var message = this.newItem('message');
            message.setAttribute('value', GlideXMLUtil.removeInvalidChars(e.getMessage()));
            error.appendChild(message);
        }
        
        return testResult;
    },
    
    testServerConnection: function() {
        var serverSysId = this.getParameter("sysparm_serverSysId");
        
        var result = this.newItem("result");
        var error = this.newItem("error");
        result.appendChild(error);
        
        var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(serverSysId, null);
        var testResult = false;
        try {
            testResult = ldapConnectionTester.testConnection();
            error.setAttribute('code', gs.getSession().getProperty("ldap_test.errorCode"));
            
            var message = this.newItem('message');
            message.setAttribute('value', GlideXMLUtil.removeInvalidChars(gs.getSession().getProperty("ldap_test.errorMessage")));
            error.appendChild(message);
        }catch(e) {
            error.setAttribute('code', "41000");
            var message = this.newItem('message');
            message.setAttribute('value', GlideXMLUtil.removeInvalidChars(e.getMessage()));
            error.appendChild(message);
        }
        
        return testResult;
    },
    
    testServerURLConnections: function() {
        var serverSysId = this.getParameter("sysparm_serverSysId");
        
        var result = this.newItem("result");
        var errors = this.newItem("errors");
        result.appendChild(errors);

	    var markUpAuthoritative    = true;
	    var markDownAuthoritative  = true;        
        var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(serverSysId, null, markUpAuthoritative, markDownAuthoritative);
        var testResult = false;
        try {
            testResult = ldapConnectionTester.testServerURLConnections();
            var allURLConnResults = gs.getSession().getProperty("ldap_test.all_urls.result");
            // Clear results in session
            gs.getSession().clearProperty("ldap_test.all_urls.result");
            
            var urlresultIterator = allURLConnResults.iterator();
            var allSuccessful = true;
            while(urlresultIterator.hasNext()) {
				var ldapURL = urlresultIterator.next();
				if(ldapURL.getTestErrorCode() == 0)
					continue;// Do not show successful messages
				
                var error = this.newItem("error");
                errors.appendChild(error);
                
                error.setAttribute('id', ldapURL.getID());
                error.setAttribute('url', ldapURL.getURL());
                error.setAttribute('code', ldapURL.getTestErrorCode());
                
                if(ldapURL.getTestErrorCode() != 0)
                    allSuccessful = false;
                
                var message = this.newItem('message');
                message.setAttribute('value', GlideXMLUtil.removeInvalidChars(ldapURL.getURL() + ' ' + ldapURL.getTestErrorMessage()));
                error.appendChild(message);
            }
            if(allSuccessful == true) {
                result.removeChild(errors);
                errors = this.newItem("errors");
                result.appendChild(errors);
                var error = this.newItem("error");
                errors.appendChild(error);
                error.setAttribute('code', 0);
                
                var message = this.newItem('message');
                message.setAttribute('value', "Connected Successfully");
                error.appendChild(message);
            }
        } catch(e) {
            var error = this.newItem("error");
            errors.appendChild(error);
            error.setAttribute('code', "41000");
            var message = this.newItem('message');
            message.setAttribute('value', GlideXMLUtil.removeInvalidChars(e.getMessage()));
            error.appendChild(message);
        }
        
        return testResult;
    },
    
    type: 'LDAPClientUtils'
});