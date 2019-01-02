data.sc_catalog = $sp.getValue('sc_catalog');
data.showPrices = $sp.showCatalogPrices();

var items = [];

var count = new GlideAggregate('sc_req_item');
count.addAggregate('COUNT','cat_item');
count.groupBy('cat_item');
count.addQuery('cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_guide,sc_cat_item_wizard,sc_cat_item_content');
count.addQuery('cat_item.sc_catalogs', data.sc_catalog);
count.orderByAggregate('COUNT', 'cat_item');
count.query();
while (count.next() && items.length < 9) {
  if (!$sp.canReadRecord("sc_cat_item", count.cat_item.sys_id.getDisplayValue()))
    continue; // user does not have permission to see this item

  var item = {};
  item.count = count.getAggregate('COUNT', 'cat_item');
  item.name = count.cat_item.name.getDisplayValue();
  item.short_description = count.cat_item.short_description.getDisplayValue();
  item.picture = count.cat_item.picture.getDisplayValue();
  item.price = count.cat_item.price.getDisplayValue();
  item.sys_id = count.cat_item.sys_id.getDisplayValue();
  items.push(item);
}

data.items = items;