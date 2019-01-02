function getMyCatalogCategories() {
	var gr = new GlideRecord("catalog_category_request");
	gr.addEncodedQuery("manager=" + gs.getUserID() + "^OReditorsLIKE" + gs.getUserID());
	gr.addNotNullQuery("category");
	gr.query();
	var answer = [];
	var i = 0;
	while (gr.next())
		answer[i++] = new String(gr.category);
	
	return answer;
}