var GlobalServiceCatalogUtil = Class.create();
GlobalServiceCatalogUtil.prototype = {
    initialize: function() {
    },
	_mergeScriptsInPolicies: function(policies, scripts) {
		for(var i=0; i<policies.length; i++) {
			var policy = policies[i];
			var name = policy['script_true'];
			if(name) {
				policy['script_true'] = {
					'name': name,
					'script': scripts[name]
				};
			}
			name = policy['script_false'];
			if(name) {
				policy['script_false'] = {
					'name': name,
					'script': scripts[name]
				};
			}
		}
		return policies;
	},
	getCatalogUIPolicy: function(item, sets) {
		var builder = new CatalogUIPolicyBuilder();
		
		var gr = new GlideRecordSecure('catalog_ui_policy');
		gr.addActiveQuery();
		gr.addQuery('applies_to', 'item');
		gr.addQuery('catalog_item', item);
		gr.addQuery('applies_catalog', true);
		gr.orderBy('order');
		gr.query();
		builder.process(gr);

		if(sets) {
			sets = sets.split(',');
			for(var i=0; i<sets.length; i++) {
				gr = new GlideRecord('catalog_ui_policy');
				gr.addActiveQuery();
				gr.addQuery('applies_to', 'set');
				gr.addQuery('catalog_item', item);
				gr.addQuery('applies_catalog', true);
				gr.orderBy('order');
				gr.query();
				builder.process(gr);
			}
		}
		builder.updateValues();
		return this._mergeScriptsInPolicies(builder.getFieldPolicies(), builder.getScripts());
	},

	stripScriptComments: function(script) {
		var sc = new global.JavaScriptCommentStripper().stripComments(script);
		sc.replaceAll('\r', '');
		return sc;

	},

	isWishListEnabled : function(catalogId) {
		//Checks if an item in a catalog can be added to wish list
		if (!catalogId) return false;
		var catalogGr = new GlideRecordSecure('sc_catalog');
		if (catalogGr.get(catalogId))
			return catalogGr.getValue('enable_wish_list') == 1 ? true: false;
		return false;
	},

    type: 'GlobalServiceCatalogUtil'
};