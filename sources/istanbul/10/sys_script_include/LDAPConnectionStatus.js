var LDAPConnectionStatus = Class.create();
LDAPConnectionStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function () {
		if (this.getType() == "getConnectionStatus") {
			var ldap_id = this.getParameter("sysparm_ldap_id");
			return this.getConnectionStatus(ldap_id);
		}
	},
	
	getConnectionStatus: function(ldap_id) {
		var ldap = new GlideLDAP();
		ldap.setConfigID(ldap_id);
		var env = ldap.setup();
		if (env == null) {
			gs.addErrorMessage("Environment not set, missing server URL");
			return false;
		}
		var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(ldap_id, null);
		try {
			return ldapConnectionTester.testConnection();
		}catch(e) {
			gs.addErrorMessage(e.getMessage());
			return false;
		}
	},
	
	type: 'LDAPConnectionStatus'
});