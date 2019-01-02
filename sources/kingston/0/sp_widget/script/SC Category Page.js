(function() {
	data.category_id = $sp.getParameter("sys_id");
	if (options && options.sys_id)
		data.category_id = options.sys_id;

	data.showPrices = $sp.showCatalogPrices();
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";
	data.sc_catalog = $sp.getDisplayValue("sc_catalog");
	
	if (GlideStringUtil.nil(data.category_id)) {
		 data.items = getPopularItems();
		 data.show_popular_item = true;
		 data.all_cat_msg = gs.getMessage("All Categories");
		 data.category = {title: gs.getMessage("Popular Items"),
									 description: ''};
		return;
	}
	
	data.show_popular_item = false;

	// Does user have permission to see this category?
	var categoryId = '' + data.category_id;
	var categoryJS = new sn_sc.CatCategory(categoryId);
	if (!categoryJS.canView()) {
		data.error = gs.getMessage("You do not have permission to see this category");
		return;
	}
	data.category = {title: categoryJS.getTitle(),
									 description: categoryJS.getDescription()};
    
	var catalog = $sp.getValue('sc_catalog');
	var scRecord = new sn_sc.CatalogSearch().search(catalog, categoryId, '', false, options.show_items_from_child != 'true');
	scRecord.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
	scRecord.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
	scRecord.orderBy('order');
	scRecord.orderBy('name');
	scRecord.query();

	var items = data.items = [];
	var count = 1;
	
	data.limit = 9;
	if (input && input.new_limit)
		data.limit = input.new_limit;
	else if (options.limit_item)
		data.limit = options.limit_item;
	
	while (scRecord.next() && count <= data.limit) {
		var catalogItemJS = new sn_sc.CatItem(scRecord.getUniqueValue());
		if (!catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
			continue;
		var catItemDetails = catalogItemJS.getItemSummary();
		
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
		count ++;
	}
	
	data.total_item = scRecord.getRowCount();
    
	data.more_msg = gs.getMessage("{0} of {1}", [data.limit, data.total_item]);
    
	data.categories = [];
	while(categoryJS && categoryJS.getParent()) {
		var parentId =  categoryJS.getParent();
		categoryJS = new sn_sc.CatCategory(parentId);
		var category = {
			label: categoryJS.getTitle(),
			url: '?id='+data.sc_category_page+'&sys_id=' + parentId
		};
		data.categories.unshift(category);
	}
	
	function getPopularItems () {
			var catalog = $sp.getValue('sc_catalog');
			var limit = 6;	
			var items = [];
		
			var count = new GlideAggregate('sc_req_item');
			count.addAggregate('COUNT','cat_item');
			count.groupBy('cat_item');
			count.addQuery('cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_guide,sc_cat_item_wizard,sc_cat_item_content');
			count.addQuery('cat_item.sc_catalogs', 'IN', catalog);
			count.addEncodedQuery('cat_item.hide_sp=false^ORcat_item.hide_spISEMPTY');
			count.orderByAggregate('COUNT', 'cat_item');
			count.query();
			while (count.next() && items.length < limit) {
				var catalogItemJS = new sn_sc.CatItem(count.cat_item.sys_id.getValue());
					if (!catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
						continue;
				var item = {};
				var catItemDetails = catalogItemJS.getItemSummary();
				
				item.order = 0 - count.getAggregate('COUNT', 'cat_item');
				item.name = catItemDetails.name;
				item.short_description = catItemDetails.short_description;
				item.picture = catItemDetails.picture;
				item.price = catItemDetails.price;
				item.sys_id = catItemDetails.sys_id;
				item.hasPrice = item.price != 0;
				item.page = 'sc_cat_item';
				items.push(item);
			}


			var producers = 0;
			count = new GlideAggregate('sc_item_produced_record');
			count.addQuery('producer.sc_catalogs', 'IN', catalog);
			count.addEncodedQuery('producer.hide_sp=false^ORproducer.hide_spISEMPTY');
			count.addAggregate('COUNT', 'producer');
			count.groupBy('producer');
			count.orderByAggregate('COUNT', 'producer');
			count.query();
			while (count.next() && producers < limit) {
					var catalogItemJS = new sn_sc.CatItem(count.getValue('producer'));
					if (!catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
						continue;
					var catItemDetails = catalogItemJS.getItemSummary();
					var item = {};

					item.order = 0 - count.getAggregate('COUNT', 'producer');
					item.name = catItemDetails.name;
					item.short_description = catItemDetails.short_description;
					item.picture = catItemDetails.picture;
					item.price = catItemDetails.price;
				  item.hasPrice = item.price != 0;
					item.sys_id = catItemDetails.sys_id;
					item.page = 'sc_cat_item';
					items.push(item);
					producers++;
			}
			return items;
	}
	
})();
