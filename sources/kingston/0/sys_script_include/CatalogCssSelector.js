var CatalogCssSelector = Class.create();
CatalogCssSelector.prototype = {
	
    initialize: function() {
    },
	
	getVariableCss: function() {
		return "js_includes_catalog_v2.css";
	},
	
	getCatalogCss: function() {
		return "sc_cat_only_v2.css";
	},

    type: 'CatalogCssSelector'
};