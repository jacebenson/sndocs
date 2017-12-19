var LDAPListenerDiagnostics = Class.create();

LDAPListenerDiagnostics.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function () {
		if (this.getType() == "loadDiagnostics") {
			var ldap_id = this.getParameter("sysparm_ldap_id");
			return this.loadDiagnostics(ldap_id);
		}
	},
	
	loadDiagnostics: function(ldap_id) {
		var ldapDiag = new GlideLDAPDiagnostics(ldap_id);
		return ldapDiag.loadDiagnostics();
	},
	
	type: 'LDAPListenerDiagnostics'
});