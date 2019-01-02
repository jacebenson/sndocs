var MobileCatalogUIPolicyBuilder = Class.create();
MobileCatalogUIPolicyBuilder.prototype = {
	initialize: function() {
	},
	
	getUIPolicy: function(item, sets, table) {
		var builder = new CatalogUIPolicyBuilder();
		builder.setUIScriptType(1); // set compatibility to smartphone
		
		var tableColumnObj = {sc_cat_item:"applies_catalog", sc_cat_item_guide:"applies_catalog", sc_req_item:"applies_req_item", sc_task:"applies_sc_task"};
		var gr = new GlideRecord('catalog_ui_policy');
		gr.addQuery('applies_to', 'item');
		gr.addQuery('catalog_item', item);
		gr.addQuery(tableColumnObj[table], true);
		gr.addActiveQuery();
		gr.orderBy('order');
		gr.query();
		builder.process(gr);
		
		if (sets) {
			sets = sets.split(',');
			for (var i = 0; i != sets.length; i++) {
				var gr = new GlideRecord('catalog_ui_policy');
				gr.addQuery('applies_to', 'set');
				gr.addQuery('variable_set', sets[i]);
				gr.addQuery(tableColumnObj[table], true);
				gr.addActiveQuery();
				gr.orderBy('order');
				gr.query();
				builder.process(gr);
			}
		}
		
		builder.updateValues();
		
		var mobileUIPolicyBuilder = new MobileUIPolicyBuilder();
		return mobileUIPolicyBuilder.mergeScriptsWithPolicies(builder.getFieldPolicies(), builder.getScripts());
	},
	
	type: 'MobileCatalogUIPolicyBuilder'
}