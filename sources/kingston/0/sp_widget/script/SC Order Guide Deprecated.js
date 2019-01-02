(function () {
	// portal can specify a catalog and category home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";

	var m = data.msgs = {};
	m.submitMsg = gs.getMessage("Submit");
	m.submittedMsg = gs.getMessage("Submitted");
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	m.scHomeMsg = gs.getMessage("Service Catalog");

	data.sys_id = $sp.getParameter("sys_id");

	if (options.sys_id)
		data.sys_id = options.sys_id;

	if (!data.sys_id)
		return;

	var validatedItem = new sn_sc.CatItem('' + data.sys_id);
	if (!validatedItem.canView() || !validatedItem.isVisibleServicePortal())
		return;

	data.showPrices = $sp.showCatalogPrices();
  data.sc_cat_item = $sp.getCatalogItem(data.sys_id, true);
	if (data.sc_cat_item.category) {
		var categoryGR = new GlideRecord('sc_category');
		categoryGR.get(data.sc_cat_item.category);
		data.category = {
			name: categoryGR.getDisplayValue('title'),
			url: '?id='+data.sc_category_page+'&sys_id=' + categoryGR.sys_id
		}
	}

	$sp.logStat('Catalog Order Guide View', data.sc_cat_item.sys_class_name, data.sys_id);
})()
