data.sc_catalog = $sp.getValue('sc_catalogs') || $sp.getValue('sc_catalog');
data.showPrices = $sp.showCatalogPrices();
data.limit = options.limit || 9;
var items = [];

var count = new GlideAggregate('sc_req_item');
count.addAggregate('COUNT','cat_item');
count.groupBy('cat_item');
count.addQuery('cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_guide,sc_cat_item_wizard,sc_cat_item_content');
count.addQuery('cat_item.sc_catalogs', 'IN', data.sc_catalog);
count.addEncodedQuery('cat_item.hide_sp=false^ORcat_item.hide_spISEMPTY');
count.orderByAggregate('COUNT', 'cat_item');
count.query();
while (count.next() && items.length < data.limit) {
  if (!$sp.canReadRecord("sc_cat_item", count.cat_item.sys_id.getDisplayValue()))
    continue; // user does not have permission to see this item

  var item = {};
  item.count = count.getAggregate('COUNT', 'cat_item');
  item.name = count.cat_item.name.getDisplayValue();
  item.short_description = count.cat_item.short_description.getDisplayValue();
  item.picture = count.cat_item.picture.getDisplayValue();
  item.price = count.cat_item.price.getDisplayValue();
  item.hasPrice = count.cat_item.price != 0;
  item.sys_id = count.cat_item.sys_id.getDisplayValue();
  items.push(item);
}

if (options.include_record_producers == 'true' || options.include_record_producers == true) {
	var producers = 0;
	count = new GlideAggregate('sc_item_produced_record');
	count.addQuery('producer.sc_catalogs', 'IN', data.sc_catalog);
	count.addEncodedQuery('producer.hide_sp=false^ORproducer.hide_spISEMPTY');
	count.addAggregate('COUNT', 'producer');
	count.groupBy('producer');
	count.orderByAggregate('COUNT', 'producer');
	count.query();
	while (count.next() && producers < data.limit) {
		
		var catalogItemJS = new sn_sc.CatItem(count.getValue('producer'));
		if (!catalogItemJS.canView(gs.isMobile()) || !catalogItemJS.isVisibleServicePortal())
			continue;
		var catItemDetails = catalogItemJS.getItemSummary();

		var item = {};
		item.count = count.getAggregate('COUNT', 'producer');
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
}

data.items = items;