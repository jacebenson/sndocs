function customKnowledgeSearch(searchText, elementName) {
	var url = 'kb_find.do?sysparm_search=' + escape(searchText);
	url += "&sysparm_nameofstack=kbpop";
	url += "&sysparm_kb=bb0370019f22120047a2d126c42e7073";
	url += "&sysparm_kb_search_table=sn_hr_core_case";
	url += "&sysparm_operator=IR_AND_OR_QUERY";
	popupOpenStandard(url);
}
