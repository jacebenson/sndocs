// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.sysUserID = $sp.getParameter("sys_id");
if (!data.sysUserID)
         data.sysUserID = gs.getUser().getID();
var sysUserGR = new GlideRecord("sys_user");
data.userExists = sysUserGR.get(data.sysUserID) && sysUserGR.canRead();

if (data.userExists) {
	data.name = sysUserGR.getValue("name");
	var loggedInSysUserID = gs.getUser().getID();
	data.connectEnabled = GlidePluginManager().isActive('com.glide.connect');
	data.liveProfileID = "";

	//get live profile id for sending connect messages
	if (GlidePluginManager().isActive('com.glideapp.live_common')) {
		var liveProfileGR = new GlideRecord("live_profile");
		liveProfileGR.addQuery("document", data.sysUserID);
		liveProfileGR.query();
		if (liveProfileGR.next()) {
			data.liveProfileID = liveProfileGR.getValue("sys_id");
			data.liveProfileModel = $sp.getForm("live_profile", data.liveProfileID)._fields;
		} else
			data.connectEnabled = false; //can't find a live profile for this user, so lets not integrate Connect
	}

	data.isLoggedInUsersProfile = loggedInSysUserID.equals(data.sysUserID);
	var sysUserForm = $sp.getForm("sys_user", data.sysUserID);
	data.sysUserView = sysUserForm._view;
	data.sysUserModel = sysUserForm._fields;
	data.sysUserModelList = [];

	for (var i = 0; i < data.sysUserView.length; i++) {
		data.sysUserModelList.push(data.sysUserModel[data.sysUserView[i].name]);
	}

	data.directReports = [];
	data.teamData = {};
	data.teamData.direct_reports = [];
	data.teamData.members = [];

	if (!data.isLoggedInUsersProfile) {
		data.teamData.user = {
			sys_id: data.sysUserID
		}
	}

	//Calculate manager
	var managerGR = new GlideRecord("sys_user");
	if (managerGR.get(sysUserGR.getValue("manager"))) {
		data.teamData.manager = buildUser(managerGR);
	}

	//Calculate team
	if (data.teamData.manager) {
		var teamGR = new GlideRecord("sys_user");
		teamGR.addActiveQuery();
		teamGR.addQuery("manager", data.teamData.manager.sys_id);
		teamGR.query();
		while(teamGR.next()) {
			if (!teamGR.getValue("sys_id").equals(data.sysUserID))
				data.teamData.members.push(buildUser(teamGR));
		}
	}

	//Calculate direct reports
	var directReportGR = new GlideRecord("sys_user");
	directReportGR.addActiveQuery();
	directReportGR.addQuery("manager", data.sysUserID);
	directReportGR.query();

	while(directReportGR.next())
		data.teamData.direct_reports.push(buildUser(directReportGR));

	data.teamWidget = $sp.getWidget('sp-my-team', {glyph: 'user', color: 'primary'});

	//get state preferences
	data.preferencesEnabled = getPreferencesEnabled();

	//get the user Preferences of the user
	data.userPreferences = getUserPreferences(data.sysUserID);
}

function buildUser(userGR) {
	return {
		email: userGR.getValue("email") || "",
		first_name: userGR.getValue("first_name"),
		last_name: userGR.getValue("last_name"),
		name: userGR.getValue("name"),
		phone: userGR.getValue("phone") || "",
		sys_id: userGR.getValue("sys_id")
	}
}

// returns the user preferences from the platform
function getUserPreferences(userID){
	var user = GlideUser.getUserByID(userID);
	return {
		accessibility: {
			key: 'glide.ui.accessibility',
			value: user.getPreference('glide.ui.accessibility') == 'true'
		}
	}
}

// read the proper state so we can show/hide preferences in the preferences table
function getPreferencesEnabled(){
	return {
		// show preferences only if the sys_id of the url is the same user that is logged on
	  preferencesPanelEnabled : GlideStringUtil.nil($sp.getParameter('sys_id')) || $sp.getParameter('sys_id') == gs.getUserID(),

		//certain properties are visible in some cases
		languageEnabled : pm.isActive('com.glide.i18n') && gs.getProperty('glide.ui.language_picker.enabled', 'true') == 'true',
		timezoneEnabled: gs.hasRole(gs.getProperty('glide.timezone_changer.roles'))
	}
}

