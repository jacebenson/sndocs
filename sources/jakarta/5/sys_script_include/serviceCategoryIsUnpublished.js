function serviceCategoryIsUnpublished() {
	var catRequest = new GlideRecord("catalog_category_request");
	catRequest.addQuery("category", current.category);
	catRequest.addQuery("state", "created");
	catRequest.setLimit(1);
	catRequest.query();
	return catRequest.hasNext();
}