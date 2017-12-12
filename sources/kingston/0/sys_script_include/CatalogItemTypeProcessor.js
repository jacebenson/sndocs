var CatalogItemTypeProcessor = Class.create();

CatalogItemTypeProcessor.prototype =  Object.extendsObject(AbstractTransaction, {
    
    canAddItemToRequest: function(class_name) {
        return this.checkProperty("glide.sc.item.cannot_add_to_request", class_name);
    },
    
    canTryIt: function(class_name) {
        return this.checkProperty("glide.sc.item.cannot_try_it", class_name);
    },
    
    canShowSearchField: function(class_name) {
        return this.checkProperty("glide.sc.item.cannot_show_search", class_name);
    },
	
    canCreateNormalCartItem: function(class_name) {
        return this.checkProperty("glide.sc.item.not_normal_cart_item", class_name);
    },
	
    canViewPrice: function(class_name) {
        return this.checkProperty("glide.sc.item.cannot_show_price", class_name);
    },
	
	checkProperty: function(prop, class_name) {
		var parts = gs.getProperty(prop, '').split(/\s*,\s*/);
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] == class_name)
				return false;
		}
		return true;
	}
});