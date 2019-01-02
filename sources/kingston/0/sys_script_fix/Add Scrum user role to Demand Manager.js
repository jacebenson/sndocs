if(GlidePluginManager.isActive('com.snc.demand_management')){
	var dmnManager =  new GlideRecord('sys_user_role');
	dmnManager.addQuery('name', 'demand_manager');
	dmnManager.query();
	dmnManager.next();
	
	var scrumUser =  new GlideRecord('sys_user_role');
	scrumUser.addQuery('name', 'scrum_user');
	scrumUser.query();
	scrumUser.next();
	
	
	var userRoleContains = new GlideRecord('sys_user_role_contains');
	userRoleContains.initialize();
	userRoleContains.setValue('role', dmnManager.getValue('sys_id'));
	userRoleContains.setValue('contains', scrumUser.getValue('sys_id'));
	
	userRoleContains.insert();
	
}