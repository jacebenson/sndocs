var KnowledgeSecurityManager = Class.create();
KnowledgeSecurityManager.prototype = {
	initialize: function() {
	},
	
	updateKnowledgeManagers: function(currentManagers, previousManagers){
		var manager_role = new GlideRecord("sys_user_role");
		manager_role.get("name", "knowledge_manager");
		
		// Grant knowledge_manager role to currently selected managers if needed
		for(var i = 0; i < currentManagers.length; i ++)
			this.addRole(currentManagers[i], manager_role.getUniqueValue());
		
		// Revoke knowledge_manager role from previously selected managers if needed
		for(var i = 0; i < previousManagers.length; i ++)
			this.removeRole(previousManagers[i], manager_role.getUniqueValue());
	},
	
	addRole: function(userId, roleId){
		// Skip this elelemnt if empty
		if(JSUtil.nil(userId))
			return;
		
		// Check if the user has knowledge_manager role
		var role = new GlideRecord("sys_user_has_role");
		role.addQuery("user", userId);
		role.addQuery("role", roleId);
		role.query();
		
		// return if the user already has the knowledge_manager role
		if(role.hasNext())
			return;
		
		// otherwise grant the knowledge_manager role to the user
		role.initialize();
		role.user = userId;
		role.role = roleId;
		role.state = "active";
		role.insert();
		
		// and add info message indicating what has happened
		var msgArray = new Array();
		msgArray.push(role.role.name + "");
		msgArray.push(role.user.name + "");
		gs.addInfoMessage(gs.getMessage('Adding role {0} to {1}', msgArray));
	},
	
	removeRole: function(userId, roleId){
		if(JSUtil.nil(userId) || JSUtil.nil(roleId))
			return;
		
		// Make sure that the user is not a manager of another KB 
		// before revoking the knowledge_manager role
		var encodedQuery = "kb_managersLIKE" + userId + "^ORowner=" + userId;
		var isManager = new GlideRecord("kb_knowledge_base");
		isManager.addEncodedQuery(encodedQuery);
		isManager.query();
		
		if(isManager.hasNext())
			return;
		
		// Revoke the knowledge_manager role
		var userHasRole = new GlideRecord("sys_user_has_role");
		userHasRole.addQuery("user", userId);
		userHasRole.addQuery("role", roleId);
		userHasRole.deleteMultiple();
		
		// and add info message indicating what has happened
		var msgArray = new Array();
		msgArray.push(userHasRole.role.name + "");
		msgArray.push(userHasRole.user.name + "");
		gs.addInfoMessage(gs.getMessage('Removing role {0} from {1}', msgArray));
	},
	
	type: 'KnowledgeSecurityManager'
}