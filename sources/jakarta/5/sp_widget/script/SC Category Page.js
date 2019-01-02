(function() {
	data.category_id = $sp.getParameter("sys_id");
	if (options && options.sys_id)
		data.category_id = options.sys_id;

	if (GlideStringUtil.nil(data.category_id)) {
		data.error = gs.getMessage("No category specified");
		return;
	}

	data.showPrices = $sp.showCatalogPrices();
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	// Does user have permission to see this category?
	var categoryId = '' + data.category_id;
	var categoryJS = new sn_sc.CatCategory(categoryId);
	if (!categoryJS.canView()) {
		data.error = gs.getMessage("You do not have permission to see this category");
		return;
	}
	data.category = categoryJS.getTitle();

	var categoryItemIds = categoryJS.getItemIds();
	var items = data.items = [];
	for (var i = 0; i < categoryItemIds.length; i++) {
		var catalogItemJS = new sn_sc.CatItem(categoryItemIds[i]);
		if (!catalogItemJS.canView(gs.isMobile()))
			continue;
			var catItemDetails = catalogItemJS.getItemSummary();
		if (catItemDetails.type == 'wizard_item')
			continue;
		var item = {};
		item.name = catItemDetails.name;
		item.short_description = catItemDetails.short_description;
		item.picture = catItemDetails.picture;
		item.price = catItemDetails.price;
		item.sys_id = catItemDetails.sys_id;
		item.hasPrice = catItemDetails.show_price;
		item.page = 'sc_cat_item';
		item.type = catItemDetails.type;
		item.order = catItemDetails.order;
		item.sys_class_name = catItemDetails.sys_class_name;
		if (item.type == 'order_guide') {
			item.page = 'sc_cat_item_guide';
		} else if (item.type == 'content_item') {
			item.content_type = catItemDetails.content_type;
			item.url = catItemDetails.url;
			if (item.content_type == 'kb') {
				item.kb_article = catItemDetails.kb_article;
				item.page = 'kb_article';
				item.sys_id = item.kb_article;
			} else if (item.content_type == 'external') {
				item.target = '_blank';
			}
		}
		items.push(item);

	}
})();
