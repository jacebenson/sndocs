// If this script include is modified to customize price calculation then the following property: glide.sc.use_custom_pricegenerator must be set to: true
var CatalogRecurringPriceCalculator = Class.create();

CatalogRecurringPriceCalculator.prototype = Object.extendsObject(CatalogPriceCalculator, {
   initialize : function(/* GlideRecord */ gr) {
		this.cpc = new SNC.CatalogRecurringPriceCalculator(gr);
	},
	
	calcPrice : function() {
		return this.cpc.calcPrice();
	}
});