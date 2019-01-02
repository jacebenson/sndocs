(function() {
	data.category_id = $sp.getParameter("sys_id");
	data.showPrices = $sp.showCatalogPrices();
	if (options && options.sys_id)
		data.category_id = options.sys_id;

	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	// Does user have permission to see this category?
	if (!$sp.canReadRecord("sc_category", data.category_id)) {
		data.error = "You do not have permission to see this category";
		return;
	} 

	var cat = new GlideRecord('sc_category');
	cat.get(data.category_id);
	data.category = cat.getDisplayValue('title');
	var items = data.items = [];
	var sc = new GlideRecord('sc_cat_item_category');
	if (data.category_id) 
		sc.addQuery('sc_category', data.category_id);

	sc.addQuery('sc_cat_item.active',true);
	sc.addQuery('sc_cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
	sc.orderBy('sc_cat_item.order');
	sc.orderBy('sc_cat_item.name');
	sc.query();
	while (sc.next()) {
		// Does user have permission to see this item?
		if (!$sp.canReadRecord("sc_cat_item", sc.sc_cat_item.sys_id.getDisplayValue()))
			continue;

		var item = {};
		var gr = new GlideRecord('sc_cat_item');
		gr.get(sc.sc_cat_item);
		gr = GlideScriptRecordUtil.get(gr).getRealRecord();
		$sp.getRecordDisplayValues(item, gr, 'name,short_description,picture,price,sys_id');
		item.sys_class_name = sc.sc_cat_item.sys_class_name + "";
		item.page = 'sc_cat_item';
		if (item.sys_class_name == 'sc_cat_item_guide')
			item.page = 'sc_cat_item_guide';
		else if (item.sys_class_name == 'sc_cat_item_content') {
			$sp.getRecordValues(item, gr, 'url,content_type,kb_article');
			if (item.content_type == 'kb') {
				item.page = 'kb_article';
				item.sys_id = item.kb_article;
			} else if (item.content_type == 'literal') {
				item.page = 'sc_cat_item';
			} else if (item.content_type == 'external')
				item.target = '_blank';
		}

		items.push(item);
	}
})()
