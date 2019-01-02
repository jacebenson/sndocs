// populate the 'data' object
data.t = $sp.getParameter('t');
data.q = encodeURIComponent($sp.getParameter('q'));
data.searchSources = [];

//Gotta decide if we want to use the portal's sources, or use the defaults declared by
//the sys property
var useDefaultPortals;
if (!$sp.getPortalRecord()) {
	useDefaultPortals = true;
} else {
	var searchSourcesForPortalGR = new GlideRecord("m2m_sp_portal_search_source");
	searchSourcesForPortalGR.addQuery("sp_portal", $sp.getPortalRecord().getUniqueValue());
	searchSourcesForPortalGR.query();
	useDefaultPortals = searchSourcesForPortalGR.getRowCount() == 0;
}

if (useDefaultPortals) {
	var defaultSearchSourceGR = new GlideRecord("sp_search_source");
	var defaultSearchSourceIDList = gs.getProperty("glide.service_portal.default_search_sources", "");
	defaultSearchSourceGR.addQuery("sys_id", "IN", defaultSearchSourceIDList);
	defaultSearchSourceGR.query();
	while(defaultSearchSourceGR.next()) {
		data.searchSources.push({
			name: defaultSearchSourceGR.getValue("name"),
			id: defaultSearchSourceGR.getValue("id"),
			order: defaultSearchSourceIDList.split(",").indexOf(defaultSearchSourceGR.getUniqueValue())
		});
	}
} else {
	var m2mSearchSourceGR = new GlideRecord("m2m_sp_portal_search_source");
	m2mSearchSourceGR.addQuery("sp_portal", $sp.getPortalRecord().getUniqueValue());
	m2mSearchSourceGR.orderBy('order');
	m2mSearchSourceGR.query();
	var index = 0;
	while(m2mSearchSourceGR.next()) {
		var searchSourceGR = m2mSearchSourceGR.getElement("sp_search_source").getRefRecord();
		data.searchSources.push({
			name: searchSourceGR.getValue("name"),
			id: searchSourceGR.getValue("id"),
			order: index
		});
		index += 1;
	}
}