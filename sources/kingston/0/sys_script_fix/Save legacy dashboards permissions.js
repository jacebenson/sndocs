var ROLE_TYPE_PERMISSION = 1;
var GROUP_TYPE_PERMISSION = 2;
var USER_TYPE_PERMISSION = 3;
var VISIBLE_TO_EVERYONE = 2;
var VISIBLE_TO_GROUPS_AND_USERS = 3;

//By default all the entities (group, users and roles) which currently have an entry in pa_dashboards, will receive read access on the specified dashboards;
//Pa power users roles (pa_admin and pa_power_user) will receive edit rights to all existing dashboards
function saveDashboardPermissions(identitiesList, permissionType, dashboardSysId, canView, canEdit) {
	for (var i = 0; i < identitiesList.length; i++) {
		var identitySysId = identitiesList[i];
		var dashboardPermissions = new GlideRecord('pa_dashboards_permissions');
		dashboardPermissions.addQuery('type', permissionType);
		dashboardPermissions.addQuery('identity', identitySysId);
		dashboardPermissions.addQuery('dashboard', dashboardSysId);
		dashboardPermissions.query();
		if (dashboardPermissions.next()) { //Update if exists
			dashboardPermissions.setValue('read', canView);
			if (canEdit) {
				dashboardPermissions.setValue('write', true);
				dashboardPermissions.setValue('delete', true);
			}

			dashboardPermissions.update();
			//gs.log("Update permission identity (canEdit:" + canEdit + "): " + identitySysId + ", dashboard - " + dashboardSysId + ", permissionsType: " + permissionType);
		} else { //Save
			dashboardPermissions.initialize();
			dashboardPermissions.setValue('identity', identitySysId);
			dashboardPermissions.setValue('type', permissionType);
			dashboardPermissions.setValue('dashboard', dashboardSysId);
			dashboardPermissions.setValue('read', canView);
			if (canEdit) {
				dashboardPermissions.setValue('write', true);
				dashboardPermissions.setValue('delete', true);
			}

			dashboardPermissions.insert();
			//gs.log("Save permission identity (canEdit:" + canEdit + "): " + identitySysId + ", dashboard - " + dashboardSysId + ", permissionsType: " + permissionType);
		}
	}
}

function saveLegacyDashboardsPermissions(dashboardsWithNewPermissions) {
	//Get all dashboards that have no owner and no new permissions
	var dashboards = new GlideRecord('pa_dashboards');
	dashboards.addNullQuery('owner');
	dashboards.addQuery('sys_id', 'NOT IN', dashboardsWithNewPermissions);
	dashboards.query();
	while (dashboards.next()) {
		//Pa roles definition
		var paPowerUsersRoles = ['pa_admin', 'pa_power_user'];
		var paViewersRoles = ['pa_viewer', 'pa_contributor'];
		var noExplicitDashboardPermissions = false;

		dashboards.setValue('restrict_to_roles', 'pa_viewer, pa_contributor');
		dashboards.setValue('should_migrate_permissions', false);
		dashboards.update();

		//Step 1: Give read access to all the entities (groups, users and roles) are currently defined in pa_dashboards; if none defined - give read access to pa viewers
		var dashboardSysId = dashboards.getUniqueValue();
		var dashboardVisibility = dashboards.getValue('visible_to'); //2-everyone; 3-groups and users; [1-was me, but it is now obsolete]

		if (dashboardVisibility == VISIBLE_TO_GROUPS_AND_USERS) { //Dashboard visible to certain groups and users
			var groupsList = dashboards.groups ? dashboards.groups.split(',') : '';
			var usersList = dashboards.users ? dashboards.users.split(',') : '';
			//Save read access for all defined groups if any
			if (groupsList != '')
				saveDashboardPermissions(groupsList, GROUP_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/false);
			//Save read access for all defined users if any
			if (usersList != '')
				saveDashboardPermissions(usersList, USER_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/false);
			//If there are any groups or users defined
			if (groupsList != '' || usersList != '')
				//Give also pa power users roles (pa_admin and pa_power_user) – read and write rights
				saveDashboardPermissions(paPowerUsersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/true);
			else  // No groups or users defined
				noExplicitDashboardPermissions = true;
		} else if (dashboardVisibility == VISIBLE_TO_EVERYONE) { //Dashboard visible by everyone
			var rolesList = dashboards.roles ? dashboards.roles.split(',') : '';
			if (rolesList.length > 0) { //Dashboard shared with specific roles
				//Save read access for all defined roles in Dashboard Permissions table
				saveDashboardPermissions(rolesList, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/false);
				//Save write access for pa power users [pa_admin and pa_power_user] in Dashboard Permissions table
				saveDashboardPermissions(paPowerUsersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/true);
			} else { //Dashboard was shared with all pa viewers
				noExplicitDashboardPermissions = true;
			}
		}

		if (noExplicitDashboardPermissions) {
			//Check if dashboard is associated with a group
			var dashboardGroupSysId = dashboards.getValue('group');
			var hasGroupPermissions = false;
			if (dashboardGroupSysId != null) { //If dashboard belongs to a group
				var dashboardGroup = new GlideRecord('pa_dashboards_group');
				if (dashboardGroup.get(dashboardGroupSysId)) {
					//Check dashboard's group permissions
					var dashboardGroupVisibility = dashboardGroup.getValue('visible_to'); //2-Everyone; 3-Groups and Users
					hasGroupPermissions = (dashboardGroupVisibility == VISIBLE_TO_EVERYONE && dashboardGroup.getValue('roles') != null) || (dashboardGroupVisibility == VISIBLE_TO_GROUPS_AND_USERS && (dashboardGroup.getValue('groups') != null || dashboardGroup.getValue('users') != null));
				}
				if (!hasGroupPermissions) { //No group permissions defined
					//Transfer pa viewers rights to Dashboard table
					saveDashboardPermissions(paViewersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/false);
					//Save write permissions for pa power users in Dashboard Permissions table; read is given by Dashboard Group (pa_dashboards_group) ACLs
					saveDashboardPermissions(paPowerUsersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/true);
				}  else
					//Follow Dashboard Group permissions
					//And give pa power users write access only; read is given by pa_dashboards_group ACLs
					saveDashboardPermissions(paPowerUsersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/false, /*canEdit*/true);
			} else { //No explicit permissions set and dashboard belongs to no group
				//Give read access to all pa viewers roles and pa power users R&W access on Dashboard table
				saveDashboardPermissions(paViewersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/false);
				saveDashboardPermissions(paPowerUsersRoles, ROLE_TYPE_PERMISSION, dashboardSysId, /*canView*/true, /*canEdit*/true);
			}
		}
	}
}

// This script should run only during an upgrade
if (!pm.isZboot()) {
	if (pm.isActive('com.glideapp.canvas') && gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') { // Responsive dashboards enabled
		// Check if any dashboards were already migrated
		var dashboardsWithNewPermissions = [];
		var grDashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
		grDashboardsPermissions.query();
		while(grDashboardsPermissions.next()) {
			var dashSysId = grDashboardsPermissions.getValue('dashboard');
			if (dashboardsWithPermissions.indexOf(dashSysId) < 0) {
				dashboardsWithNewPermissions.push(dashSysId);
			}
		}

		// If there are dashboards that were migrated, make sure that migrated field reflects that
		if (dashboardsWithNewPermissions.length) {
			var grDashboards = new GlideRecord('pa_dashboards');
			grDashboards.addQuery('sys_id', 'IN', dashboardsWithNewPermissions);
			grDashboards.addQuery('should_migrate_permissions', true);
			grDashboards.setValue('should_migrate_permissions', false);
			grDashboards.updateMultiple();
		}

		// Save legacy dashboard permissions and exclude any possible already migrated ones.
		saveLegacyDashboardsPermissions(dashboardsWithNewPermissions);
	} else { // If canvas is off we need to make sure no dashboards permissions are stored in the new dashboard table and that all dashboards are ready for future migration
		var grPermissions = new GlideRecord('pa_dashboards_permissions');
		grPermissions.query();
		grPermissions.deleteMultiple();

		var grDashboards = new GlideRecord('pa_dashboards');
		grDashboards.addQuery('should_migrate_permissions', false);
		grDashboards.setValue('should_migrate_permissions', true);
		grDashboards.updateMultiple();
	}
}
