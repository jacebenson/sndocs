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

	function getItems(cat) {
		var gr = new GlideRecord('sc_cat_item');
		gr.addQuery('sc_catalogs', cat);
		gr.addActiveQuery();
		gr.orderBy('name');
		gr.query();
		var items = [];
		while (gr.next()) {
			if (!$sp.canReadRecord("sc_cat_item", gr.getUniqueValue()))
				continue;

			var c = {};
			$sp.getRecordValues(c,gr,'sys_id,name,short_description,category,sys_class_name');
			$sp.getRecordDisplayValues(c, gr, 'picture');
			c.page = 'sc_cat_item';
			if (c.sys_class_name == 'sc_cat_item_guide') 
				c.page = 'sc_cat_item_guide';
			items.push(c);
		}
		return items;
	}

	function getCategories(cat) {
		var gr = new GlideRecord('sc_category');
		gr.addQuery('sc_catalog', cat);
		gr.addActiveQuery();
		gr.orderBy('title');
		gr.query();
		var cats = [];
		while (gr.next()) {
			if (!$sp.canReadRecord("sc_category", gr.getUniqueValue()))
				continue;

			var c = {};
			$sp.getRecordValues(c,gr,'sys_id,title,parent');
			cats.push(c);
		}
		return cats;
	}
})();