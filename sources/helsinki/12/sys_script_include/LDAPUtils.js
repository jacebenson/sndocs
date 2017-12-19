gs.include("PrototypeServer");

var LDAPUtils = Class.create();

LDAPUtils.prototype = {
    initialize : function() {
       this.log = null;
       this.logset = false;
       this.groups = 'u_memberof';
       this.members = 'u_member';
       this.manager = 'u_manager';
       this.ldapUserUpdate = null;
    },

    setLog : function(log) {
       this.log = log;
       this.logset = true;
    },

    setGroupField: function(field) {
       this.groups = field;
    },

    setMemberField: function(field) {
       this.members = field;
    },

    setManagerField: function(field) {
       this.manager = field;
    },

    setManager: function(source, target) {
       var ge = source.getElement(this.manager);
       if (!ge || ge.isNil())
          return;

       this._getLdapUserUpdate();
       var ldap = new GlideLDAPUserUpdate();
       var mid =  this.ldapUserUpdate.getManagerValue(target, ge.toString());
       if (mid == null)
          return;

       target.manager = mid;
    },

    processManagers: function() {
       if (this.ldapUserUpdate == null)
          return;
       
       this.ldapUserUpdate.processManagers();
    },

    addGroups : function(source, target) {
       var ge = source.getElement(this.groups);
       if (!ge || ge.isNil())
          return;
       
       this._log(ge.toString());
       var groups = new GlideLDAPGroups();
       groups.processGroups(target.sys_id.toString(), ge.toString());
       return;
    },

    addMembers : function(source, target) {
       var ge = source.getElement(this.members);
       var geString = null;
		if (ge && !ge.isNil()) {
			this._log(ge.toString());
			geString =  ge.toString();
		}
	   var group = new GlideLDAPGroups(target, geString);
       group.setMembers(); 
    },

    _getLdapUserUpdate : function() {
       if (this.ldapUserUpdate != null)
          return;

       this.ldapUserUpdate = new GlideLDAPUserUpdate();
    },

    getTargets: function(serverID) {
       var answer = new Array();
       var targets = new GlideRecord('ldap_ou_config');
       targets.addQuery('server', serverID);
       targets.query();
       while (targets.next())
          answer.push(targets.sys_id.toString());
       return answer;
    },

    _log : function(msg) {
       msg = "LDAPUtils: " + msg;
       if (this.logset)
          this.log.info(msg);
       else
          gs.log(msg);
    },

    createOUDefinition: function(serverID, serverType) {
        if (serverType == 'ActiveDirectory')
           this.createActiveDirectoryOU(serverID);
        else
           this.createOtherDirectoryOU(serverID);
    },

    createActiveDirectoryOU: function(serverID) {
       var ou = this.initUserOU(serverID);
       ou.insert();
       this.createDataSource(ou);

       ou = this.initGroupOU(serverID);
       ou.insert();
       this.createDataSource(ou);
    },

    createOtherDirectoryOU: function(serverID) {
       var ou = this.initUserOU(serverID);
       ou.query_field = "cn";
       ou.filter = "(objectClass=person)";
       ou.insert();
       this.createDataSource(ou);

       ou = this.initGroupOU(serverID);
       ou.query_field = "cn";
       ou.insert();
       this.createDataSource(ou);
    },

    initUserOU: function(serverID) {
       var ou = new GlideRecord("ldap_ou_config");
       ou.name = "Users";
       ou.ou = "CN=Users";
       ou.server = serverID;
       ou.table = "sys_user";
       ou.query_field = "sAMAccountName";
       ou.filter = "(&(objectClass=person)(sn=*)(!(objectClass=computer))(!(userAccountControl:1.2.840.113556.1.4.803:=2)))";
       return ou;
    },

    initGroupOU: function(serverID) {
       ou = new GlideRecord("ldap_ou_config");
       ou.name = "Groups";
       ou.ou = "CN=Users";
       ou.server = serverID;
       ou.table = "sys_user_group";
       ou.query_field = "sAMAccountName";
       ou.filter = "(objectClass=group)";
       return ou;
    },

    // create a data source and a scheduled import for current record
    createDataSource: function(target) {
       var ds = new GlideRecord('sys_data_source');
       ds.type = "LDAP";
       ds.ldap_target = target.sys_id.toString();
       ds.name = target.server.name + "/" + target.name;
       if (target.table == 'sys_user')
           ds.import_set_table_name = "ldap_import";
       else
           ds.import_set_table_name = "ldap_group_import";
       var dsID = ds.insert();
       var im = new GlideRecord('scheduled_import_set');
       im.name = ds.name + " Import";
       im.data_source = dsID;
       im.run_type = 'daily';
       im.active = false;
       im.insert();
    },

    // test the connection for the current record
    testOUConnection: function(target) {
       var ldap = new GlideLDAP();
       ldap.setConfigID(target.server.toString());
       var env = ldap.setup();
       if (env == null) { 
          gs.addErrorMessage("Environment not set, missing server URL");
          return false;
       }

		var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(target.server.toString(), target.getUniqueValue());
		try {
			return ldapConnectionTester.testConnection();
		}catch(e) {
			gs.addErrorMessage(e.getMessage());
			return false;
		}
    },

    _logenv: function(env) {
          env.put("java.naming.security.credentials", "*****");
          gs.addErrorMessage(env.toString());
    },

    testServerConnection: function(server) {
		var ldap = new GlideLDAP();
		ldap.setConfigID(server.sys_id.toString());
		var env = ldap.setup();
		if (env == null) {
			gs.addErrorMessage("Environment not set, missing server URL");
			return false;
		}

		var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(server.sys_id.toString(), null);
		try {
			return ldapConnectionTester.testConnection();
		}catch(e) {
			gs.addErrorMessage(e.getMessage());
			return false;
		}
    },

    refreshGroup: function(groupName) {
       var ldapConfigs = new GlideLDAPConfigurations();
       var ldapServers = ldapConfigs.getActiveSet();
       while (ldapServers.next()) {
          if (this.checkGroupsForServer(ldapServers))
             return true;
       }
       return false;
    },

    checkGroupsForServer: function (currentServer) {
       var ldapConfig = GlideLDAPConfig.get(currentServer.sys_id);
       var groupList = ldapConfig.getGroupOUList();
       if (groupList.size() == 0) {
           if (this.checkGroupForServer(ldapConfig, ''))
             return true;
       }
       for (var i = 0; i < groupList.size(); i++) {
          if (this.checkGroupForServer(ldapConfig, groupList.get(i)))
             return true;
       }
       return false;
    },

    checkGroupForServer: function(ldapConfig, groupOU) {
       var ldapTarget = ldapConfig.getGroupTarget(groupOU);
       if (ldapTarget == null) {
          ldapTarget = ldapConfig.getGroupTarget('');
          if (ldapTarget == null)
             return false;
       }
       gs.addInfoMessage("Checking " + ldapConfig.getName() + " OU " + ldapTarget.getRDN() + " Field " + ldapTarget.getQueryField());
       var ldap = ldapConfig.getLDAP();
       var result = ldap.getMatching(ldapTarget.getRDN(), ldapTarget.getQueryField() + "=" + current.name, true, 1);
       if (!result.hasMore())
          return false;

       var record = result.next();
       var ldapQueue = new GlideLDAPTransformQueue();
       ldapQueue.add(ldapTarget.getID(), record.get('dn'));
       ldapQueue.transform(ldapConfig.getServerID());
       return true;
    },

    hasListener:function(server) {
      var ldapConfig = new GlideLDAPConfig(server);
      return ldapConfig.hasListener();
    },

    isListenerNode:function(server) {
      var ldapConfig = new GlideLDAPConfig(server);
      if (ldapConfig.isListenerNode())
         return true;

      return false;
    },

    startListener:function(server) {
      if (this.isListenerNode(server)) {
          var ldapConfig = new GlideLDAPConfig(server);
          ldapConfig.startListener();

          return;
      }

      GlideClusterMessage.postDirected("script", 
          "var ldapConfig = new GlideLDAPConfig.get('" + server.sys_id + "'); ldapConfig.startListener();", 
          server.system_id);
    },

    stopListener:function(server) {
      if (this.isListenerNode(server)) {
          var ldapConfig = new GlideLDAPConfig(server);
          ldapConfig.stopListener();

          return;
      }

      GlideClusterMessage.post("script", 
          "var ldapConfig = new GlideLDAPConfig.get('" + server.sys_id + "'); ldapConfig.stopListener();");
    },
    
    startStopMonitoringIf: function(){
        var grLdapConfig = new GlideRecord("ldap_server_config");
        grLdapConfig.addActiveQuery();
        grLdapConfig.query();
        var gr = new GlideRecord("sysauto");
        gr.addQuery("name","LDAP Connection Test");
        gr.query();

        if(grLdapConfig.next()) {
            // Start monitoring if there is atleast one active LDAP server, by enabling the ScheduledJob.
            if ( gr.next() && gr.getValue('active') == 0) {
                gs.log("Activating Scheduled Job - LDAP Connection Test");
                gr.setValue('active', true);
                gr.update();
            }
        } else {
            // If we do not have atleast one active LDAP server, we stop monitoring by disabling the ScheduledJob.
            if ( gr.next() && gr.getValue('active') == 1) {
                gs.log("Deactivating Scheduled Job - LDAP Connection Test");
                gr.setValue('active', false);
                gr.update();
            }
        }
    },

    z : function() {
    }
}