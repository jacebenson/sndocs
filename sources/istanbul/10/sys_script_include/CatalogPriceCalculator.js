// If this script include is modified to customize price calculation then the following property: glide.sc.use_custom_pricegenerator must be set to: true
var CatalogPriceCalculator = Class.create();

CatalogPriceCalculator.prototype = {
	initialize : function(/* GlideRecord */ gr) {
		this.cpc = new SNC.CatalogPriceCalculator(gr);
	},
	
	calcPrice : function() {
		return this.cpc.calcPrice();
	}
};