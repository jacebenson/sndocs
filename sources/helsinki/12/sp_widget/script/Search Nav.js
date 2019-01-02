// populate the 'data' object
data.t = $sp.getParameter('t');
data.q = encodeURIComponent($sp.getParameter('q'));
data.isLoggedIn = gs.isLoggedIn();
data.sqandaEnabled = gs.getProperty('glide.sp.socialqa.enabled', false) === 'true';
data.hasKB = !GlideStringUtil.nil($sp.getValue('kb_knowledge_base'));
data.hasCatalog = !GlideStringUtil.nil($sp.getValue('sc_catalog'));
// add in additional search tables from sp_search_groups
data.searchGroups = [];
var portalGR = $sp.getPortalRecord();
var portalID = portalGR.getDisplayValue('sys_id');
var sg = GlideRecord('sp_search_group');
sg.addQuery('sp_portal',portalID);
sg.addQuery('active',true);
sg.orderBy('order');
sg.query();
while (sg.next()) {
	var group = {};
	group.table = sg.getValue('name');
	group.label = sg.getDisplayValue('label') || new GlideRecord(group.table).getPlural();
	data.searchGroups.push(group);
}