// populate the 'data' variable
(function () {
	data.showPrices = $sp.showCatalogPrices();
	var m = data.msgs = {};
	m.submitMsg = gs.getMessage("Submit");
	m.submittedMsg = gs.getMessage("Submitted");
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");

	data.sys_id = $sp.getParameter("sys_id");
	
	// portal can specify a catalog home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";

	var validatedItem = new GlideappCatalogItem.get(data.sys_id);
  var canViewItem = validatedItem.canView();
  if (!canViewItem) 
    return; 

  data.sc_cat_item = $sp.getCatalogItem(data.sys_id, true);
	if (data.sc_cat_item.category) {
		var categoryGR = new GlideRecord('sc_category');
		categoryGR.get(data.sc_cat_item.category);
		data.category = {
			name: categoryGR.getDisplayValue('title'),
			url: '?id=sc_category&sys_id=' + categoryGR.sys_id
		}
	}

	$sp.logStat('Catalog Order Guide View', data.sc_cat_item.sys_class_name, data.sys_id);
})()
