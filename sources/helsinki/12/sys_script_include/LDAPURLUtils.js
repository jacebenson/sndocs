var LDAPURLUtils = Class.create();
LDAPURLUtils.prototype = {
    initialize: function() {
    },

    type: 'LDAPURLUtils',
	
	getAccumURL: function(server_sys_id) {
		var allURLs  = new Array();
		var ldap_url = new GlideRecord('ldap_server_url');
		ldap_url.addActiveQuery();
		ldap_url.addQuery('server', server_sys_id);
		ldap_url.orderByDesc('operational_status');
		ldap_url.orderBy('order');
		ldap_url.query();
		while (ldap_url.next())
			allURLs.push(ldap_url.url.toString());
		return allURLs.join(' ');
    },

    getAccumURLExclude: function(server_sys_id, exclude_sys_id) {
       var answer = new Array();
       var ldap_url = new GlideRecord('ldap_server_url');
       ldap_url.addQuery('server', server_sys_id);
       ldap_url.addQuery('sys_id', '!=', exclude_sys_id);
       ldap_url.orderBy('order');
       ldap_url.query();
       while (ldap_url.next())
          answer.push(ldap_url.url.toString());
       return answer.join(' ');
    },

	runSubJobScript: function(ldapServerId, retestURLIDs) {
		var ldapServer = new GlideRecord("ldap_server_config");
		ldapServer.get(ldapServerId);
		var errMsg = "";
		// Test Connection
		errMsg = "Go to LDAP server record and perform a manual connection test for additional information. ";
		try {
			var opStatusTrueAuthoritative  = true;
			var opStatusFalseAuthoritative = true;
			var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(ldapServerId, null, opStatusTrueAuthoritative, opStatusFalseAuthoritative);
			
			// Retest failed URLs
			// If the supplied URL connection failed again, the server url operaional_status will be set to false
			// and 'ldap.operational_status.down' event will be fired
			ldapConnectionTester.testServerURLConnections(GlideStringUtil.split(retestURLIDs));
			
			var allURLConnResults = gs.getSession().getProperty("ldap_test.all_urls.result");
			// Clear results in session
			gs.getSession().clearProperty("ldap_test.all_urls.result");
			
			// Nothing more to do here
			
		} catch(e) {
			// Fire event to trigger email notification
			errMsg += e.message;
			gs.eventQueue("ldap.connection_failed",  ldapServer, ldapServer.getDisplayValue(), errMsg);
			gs.logError("LDAP Server: " + ldapServer.getDisplayValue() + " failed scheduled connection test. " + errMsg, "LDAP");
		}
	},

	createLdapServerUrl: function(serverID, serverUrls) {
       if (!serverUrls)
		   return;
	   SNC.LDAPFixer.createLdapServerUrl(serverID, serverUrls);
    }
};