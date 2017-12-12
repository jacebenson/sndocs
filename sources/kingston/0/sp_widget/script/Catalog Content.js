(function() {
	var cat = $sp.getParameter('sc_catalog');
	if (!cat)
		cat = $sp.getValue("sc_catalog");  // portal catalog
	var gr = new GlideRecord('sc_catalog', cat);
	gr.get(cat);
	data.cat = cat;
	data.title = gr.getValue("title");
	data.categories = getCategories(cat);
	data.items = getItems(cat);
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";

	function getItems(cat) {
		var gr = new GlideRecord('sc_cat_item');
		gr.addQuery('sc_catalogs', cat);
		gr.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
		gr.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
		gr.addActiveQuery();
		gr.orderBy('order');
		gr.orderBy('name');
		gr.query();
		var items = [];
		while (gr.next()) {
			var catalogItemJS = new sn_sc.CatItem(gr.getUniqueValue() + '');
			
			if (!catalogItemJS.canView())
						continue;
			
			var catItemDetails = catalogItemJS.getItemSummary();

			var item = {};
			item.name = catItemDetails.name;
			item.short_description = catItemDetails.short_description;
			item.picture = catItemDetails.picture;
			item.price = catItemDetails.price;
			item.sys_id = catItemDetails.sys_id;
			item.hasPrice = catItemDetails.show_price;
			item.type = catItemDetails.type;
			item.order = catItemDetails.order;
			item.category = catItemDetails.category.sys_id;
			item.sys_class_name = catItemDetails.sys_class_name;
			
			item.page = 'sc_cat_item';
			
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
		return items;
	}

	function getCategories(cat) {
		var gr = new GlideRecord('sc_category');
		gr.addQuery('sc_catalog', cat);
		gr.addActiveQuery();
		gr.addQuery("sys_class_name", "sc_category");
		gr.orderBy('title');
		gr.query();
		var cats = [];
		while (gr.next()) {
			var categoryJS = new sn_sc.CatCategory(gr.getUniqueValue() + '');
			if (!categoryJS.canView())
				continue;

			var c = {};
			$sp.getRecordValues(c,gr,'sys_id,title,parent');
			cats.push(c);
		}
		return cats;
	}
})();