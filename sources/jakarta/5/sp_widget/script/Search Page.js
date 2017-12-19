// populate the 'data' variable
data.showPrices = $sp.showCatalogPrices();
data.q = $sp.getParameter('q');
data.t = $sp.getParameter('t');
data.results = [];

if (data.t)
	data.limit = options.max_group || 15;
else
	data.limit = options.max_all || 30;

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

data.resultTemplates = {};

if (useDefaultPortals) {
	var defaultSearchSourceGR = new GlideRecord("sp_search_source");
	var defaultSearchSourceIDList = gs.getProperty("glide.service_portal.default_search_sources", "");
	defaultSearchSourceGR.addQuery("sys_id", "IN", defaultSearchSourceIDList);
	if (data.t)
		defaultSearchSourceGR.addQuery("id", data.t);
	defaultSearchSourceGR.query();
	while(defaultSearchSourceGR.next()) {
		data.resultTemplates["sp-search-source-" + defaultSearchSourceGR.getValue("id") + ".html"] = $sp.translateTemplate(defaultSearchSourceGR.getValue("search_page_template"));
		getResults(defaultSearchSourceGR);
	}
} else {
	var m2mSearchSourceGR = new GlideRecord("m2m_sp_portal_search_source");
	if (data.t)
		m2mSearchSourceGR.addQuery("sp_search_source.id", data.t);
	m2mSearchSourceGR.addQuery("sp_portal", $sp.getPortalRecord().getUniqueValue());
	m2mSearchSourceGR.query();
	while(m2mSearchSourceGR.next()) {
		var searchSourceGR = m2mSearchSourceGR.getElement("sp_search_source").getRefRecord();
		data.resultTemplates["sp-search-source-" + searchSourceGR.getValue("id") + ".html"] = $sp.translateTemplate(searchSourceGR.getValue("search_page_template"));
		getResults(searchSourceGR);
	}
}

function getResults(gr) {
	//Check if the user is allowed to see this source.
	var userCriteria = new GlideSPUserCriteria();
	if (userCriteria.isEnabled()) {
		if (!userCriteria.userCanSeeSearchSource(gr.getUniqueValue()))
			return;
	} else {
		var gs = GlideSession.get();
		var searchSourceRoles = gr.getValue("roles");
		if (searchSourceRoles && !gs.hasRole(searchSourceRoles))
			return;
	}

	if (gr.is_scripted_source) {
		var input = {};
		input.query = data.q;
		var evaluator = new GlideScopedEvaluator();
		var results = evaluator.evaluateScript(gr, "data_fetch_script", input);

		results.forEach(function(item) {
			item.templateID = "sp-search-source-" + gr.getValue("id") + ".html";
			data.results.push(item);
		});
	} else {
		var primaryField = gr.getValue("primary_display_field");
		var displayFields = gr.getValue("display_fields");

		var resultGR = new GlideRecordSecure(gr.getValue("source_table"));
		var condition = gr.getValue("condition");
		if (condition)
			resultGR.addEncodedQuery(condition);
		if (data.q)
			resultGR.addQuery('123TEXTQUERY321', data.q);
		resultGR.query();

		var searchTableCount = 0;
		while (resultGR.next() && searchTableCount < data.limit) {
			if (!resultGR.canRead())
				continue;

			var secondaryValues = {};

			if (displayFields)
				displayFields.split(",").forEach(function(field) {
					var obj = getField(resultGR, field);
					secondaryValues[field] = obj;
				});

			data.results.push({
				primary: (primaryField) ? resultGR.getValue(primaryField) : resultGR.getDisplayValue(),
				sys_id: resultGR.getUniqueValue(),
				table: resultGR.getTableName(),
				templateID: "sp-search-source-" + gr.getValue("id") + ".html",
				fields: secondaryValues
			});
			searchTableCount++;
		}
	}
}

function getField(gr, name) {
	var f = {};
	f.display_value = gr.getDisplayValue(name);
	f.value = gr.getValue(name);
	var ge = gr.getElement(name);
	if (ge == null)
		return f;

	f.type = ge.getED().getInternalType()
	f.label = ge.getLabel();
	return f;
}
