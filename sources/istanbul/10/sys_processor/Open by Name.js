makeResponse(g_request, g_processor);

function makeResponse(g_request, g_processor) {
	CacheBuster.addNoCacheHeaders(g_response);
	
    var name = g_request.getParameter("name");
	var searchResults = [];
	var searchType = "STARTSWITH";
	
    if (!name)
		g_processor.writeOutput("application/json", new global.JSON().encode(searchResults));
	
	var search = new GlideRecord("sys_metadata");
	if (name.startsWith("*")) {
		name = name.slice(1);
		searchType = "CONTAINS";
	}
		
	search.addQuery("sys_name",searchType,name);
	search.query();
	
	while (search.next()) {
		searchResults.push(makeResultObject(search));
	}
	
	g_processor.writeOutput("application/json", new global.JSON().encode(searchResults));
}

function makeResultObject(record) {
    var obj = {};
    var className = record.getRecordClassName();
    var fullRecord = new GlideRecord(className);
    fullRecord.get(record.getUniqueValue());

    obj.className = className;
    obj.tableLabel = record.getClassDisplayValue();
    obj.title = record.getDisplayValue();
    obj.sysid = record.getUniqueValue();

    return obj;
}	
