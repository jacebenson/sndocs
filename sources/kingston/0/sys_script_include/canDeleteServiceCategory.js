function canDeleteServiceCategory(category) {
	if (category.category.nil())
		return true;
	
	var m2m = new GlideRecord("sc_cat_item_category");
	m2m.addQuery("sc_category", category.category);
	m2m.query();
	if (m2m.hasNext())
		return false; // cannot delete a Service Category that has Published Services
		
	var stagedServices = new GlideRecord("sc_ic_item_staging");
	stagedServices.addQuery("sc_categories", "CONTAINS", category.category);
	stagedServices.query();
	if (stagedServices.hasNext())
		return false; // cannot delete a Service Category that has Draft Services
	
	return true;
}