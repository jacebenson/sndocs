var AssetUtilsAJAX = Class.create();
AssetUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getQuantity: function() {
		var model = this.getParameter('sysparm_model');
		var stockroom = this.getParameter('sysparm_stockroom');
        return (new AssetUtils()).getAvailableQuantity(model, stockroom);
    },
	
	needMore: function() {
	    var model = this.getParameter('sysparm_model');
        return (new AssetUtils()).getStockRooms(model).toString();
	
    },
	
	findVendor: function() {
		var model = this.getParameter('sysparm_model');
		return (new AssetUtils()).getVendors(model).toString();
	},
	
	mergeLicenses: function() {
		return (new AssetUtils()).mergeLicenses(this.getParameter('sysparm_licenseId'));
	},
});