var MidServerDashboardUtil;

(function() {

MidServerDashboardUtil = {
	getIdForDisplay: getIdForDisplay,
	getVersionStatus: getVersionStatus,
	getUserStatus: getUserStatus,
	COMPAT_EQUAL: 'EQUAL',
	COMPAT_COMPATIBLE: 'COMPATIBLE',
	COMPAT_INCOMPATIBLE: 'INCOMPATIBLE',
	COMPAT_UNKNOWN: 'UNKNOWN'
};

//Get the MID Server sys_id for e.g. field styles. Only allowed for ecc_agent and ecc_agent_status.
function getIdForDisplay(gr) {
	if (JSUtil.nil(gr))
		return null;
	
	switch (gr.getTableName()) {
		case 'ecc_agent':
			return gr.sys_id;
		case 'ecc_agent_status':
			return gr.agent;
	}
	
	return null;
}

//Get an object to report on MID Server/Instance version compatibility and if a MID Server is pinned
function getVersionStatus(agentId) {
	var gra = new SNC.ECCAgentCache().getBySysId(agentId);
	if (JSUtil.nil(gra) || !gra.isValidRecord())
		return {instance_version:'', mid_version:'', compatibility:MidServerDashboardUtil.COMPAT_UNKNOWN, pinned:false, pinned_version:''};
	
	var o = {};
	o.instance_version = gs.getProperty('mid.buildstamp', null);
	o.mid_version = gra.version;
	o.pinned_version = getPinnedVersion(agentId);
	o.pinned = (o.pinned_version != '');
	o.compatibility = getCompatibility(o.instance_version, o.mid_version);
	
	return o;
}

//Compatibility definitions:
//  'EQUAL': MID and Instance versions are identical
//  'COMPATIBLE': MID and Instance versions are in same release family
//  'INCOMPATIBLE': MID and Instance versions are in different release families
//  'UNKNOWN': Insufficient information to determine compatibility
function getCompatibility(instance, mid) {
	var releaseRegex = /[^__]*/;
	if (JSUtil.nil(instance) || JSUtil.nil(mid))
		return MidServerDashboardUtil.COMPAT_UNKNOWN;
	if (instance == mid)
		return MidServerDashboardUtil.COMPAT_EQUAL;
	if (''+instance.match(releaseRegex) == ''+mid.match(releaseRegex))
		return MidServerDashboardUtil.COMPAT_COMPATIBLE;
	
	return MidServerDashboardUtil.COMPAT_INCOMPATIBLE;
}

function getPinnedVersion(agentId) {
	var gr = new GlideRecord('ecc_agent_config');
	gr.addQuery('ecc_agent', agentId);
	gr.addQuery('param_name', 'mid.pinned.version');
	gr.query();
	
	return gr.next() ? gr.value : '';
}

//Get an object to report on MID Server user state
function getUserStatus(agentId) {
	var gra = new SNC.ECCAgentCache().getBySysId(agentId);
	if (JSUtil.nil(gra) || !gra.isValidRecord())
		return {logged_user:'', config_user:'', matches_config:false, is_missing_roles:false, missing_roles:[]};

	var o = {};
	o.logged_user = ''+gra.user_name;
	o.config_user = getConfigUser(gra);
	o.matches_config = (o.logged_user.toLowerCase() == o.config_user.toLowerCase());
	o.missing_roles = getMissingRoles(gra);
	o.is_missing_roles = (o.missing_roles.length > 0);
	
	return o;
}

//Get user from ecc_agent_config
function getConfigUser(gra) {
	var grc = new GlideRecord('ecc_agent_config');
	grc.addQuery('ecc_agent', gra.sys_id);
	grc.addQuery('param_name', 'mid.instance.username');
	grc.query();

	return grc.next() ? ''+grc.value : '';
}

//Determine if ecc_agent.user is missing the 'mid_server' role (does not check for any other inherited roles)
//Returns an array to allow addition of more roles over time
function getMissingRoles(gra) {
	var role = 'mid_server';
	var user = GlideUser.getUser(gra.user_name);
	if (JSUtil.nil(user))
		return [role];
	
	return user.hasRole(role) ? [] : [role];
}

})();
