var MobileCatalogUIPolicyBuilder = Class.create();
MobileCatalogUIPolicyBuilder.prototype = {
	initialize: function() {
	},
	
	getUIPolicy: function(item, sets, table) {
		var builder = new CatalogUIPolicyBuilder();
		builder.setUIScriptType(1); // set compatibility to smartphone
		
		if ((gs.getProperty("glide.sc.ui_policy.variable_set_run_first") == "true")) {
			this._buildPoliciesForVariableSets(builder, sets, table);
			this._buildPoliciesForCatalogItem(builder, item, table);
		} else {
			this._buildPoliciesForCatalogItem(builder, item, table);
			this._buildPoliciesForVariableSets(builder, sets, table);
		}
		
		builder.updateValues();
		
		var mobileUIPolicyBuilder = new MobileUIPolicyBuilder();
		return mobileUIPolicyBuilder.mergeScriptsWithPolicies(builder.getFieldPolicies(), builder.getScripts());
	},

	_buildPoliciesForCatalogItem : function (builder, item, table) {
		var tableColumnObj = {sc_cat_item:"applies_catalog", sc_cat_item_guide:"applies_catalog", sc_req_item:"applies_req_item", sc_task:"applies_sc_task"};
		var gr = new GlideRecord('catalog_ui_policy');
		gr.addQuery('applies_to', 'item');
		gr.addQuery('catalog_item', item);
		gr.addQuery(tableColumnObj[table], true);
		gr.addActiveQuery();
		gr.orderBy('order');
		gr.query();
		builder.process(gr);
	},

	_buildPoliciesForVariableSets : function(builder, sets, table) {
		if (!sets)
			return;

		var tableColumnObj = {sc_cat_item:"applies_catalog", sc_cat_item_guide:"applies_catalog", sc_req_item:"applies_req_item", sc_task:"applies_sc_task"};
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
	},
	
	type: 'MobileCatalogUIPolicyBuilder'
}