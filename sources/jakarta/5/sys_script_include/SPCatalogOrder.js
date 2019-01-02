gs.include("PrototypeServer");

var SPCatalogOrder = Class.create();

SPCatalogOrder.prototype = {

    initialize: function() {
    },

    _getValueForVariable: function(value, type) {
        if (type == "glide_date") {
            var d = new GlideDate();
            d.setDisplayValue(value);
            value = d.getValue();
        } else if (type == "glide_date_time") {
            var dt = new GlideDateTime();
            dt.setDisplayValue(value);
            value = dt.getValue();
        }
        return value;
    },

    orderOne: function() {
		var cartId = GlideGuid.generate(null);
		var cart = new Cart(cartId);
		var item = cart.addItem(input.sys_id, input.quantity);
		var vars = input._fields;
		for ( var k in vars) {
			if (vars.hasOwnProperty(k)) {
				var value = this._getValueForVariable(vars[k].value, vars[k].type);
				cart.setVariable(item, vars[k].sys_id, value);
			}
		}
		var requestGR = cart.placeOrder();
		cart.deleteCart();
		return requestGR;
    },

    orderSome: function() {
		var cartId = GlideGuid.generate(null);
		var cart = new Cart(cartId);
		for (var i = 0; i < input.length; i++) {
			var arrItem = input[i];
			var item = cart.addItem(arrItem.sys_id);
			this.setGuideOnCartItem(item);
			var vars = arrItem._fields;
			for (var k in vars) {
				if (vars.hasOwnProperty(k)) {
                    var value = this._getValueForVariable(vars[k].value, vars[k].type);
					cart.setVariable(item, vars[k].sys_id, value);
                }
			}
		}
		var requestGR = cart.placeOrder();
		cart.deleteCart();
		return requestGR;
    },

	setGuideOnCartItem: function(cartItemID) {
		if (typeof sp_order_guide == "undefined")
			return;
		
		var cartItem = new GlideRecord("sc_cart_item");
		if (!cartItem.get(cartItemID))
			return;
		
		cartItem.order_guide = sp_order_guide;
		cartItem.update();
	},
	
	addItemToCart: function() {
		var userID = gs.getUser().getID();
		var cart = new SPCart("DEFAULT", userID);
		var itemID = cart.addItem(input.sys_id, input.quantity);
		var vars = input._fields;
		for ( var k in vars) {
			if (vars.hasOwnProperty(k)) {
				var value = vars[k].value;
				if (vars[k].type == "glide_date") {
					var d = new GlideDate();
					d.setDisplayValue(value);
					value = d.getValue();
				} else if (vars[k].type == "glide_date_time") {
					var dt = new GlideDateTime();
					dt.setDisplayValue(value);
					value = dt.getValue();
				}
				cart.setVariable(itemID, vars[k].sys_id, value);
			}
		}

		var cartItemGR = new GlideRecord("sc_cart_item");
		return (cartItemGR.get(itemID)) ? cartItemGR : null;
	}
};
