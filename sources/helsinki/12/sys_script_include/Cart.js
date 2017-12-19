gs.include("PrototypeServer");

var Cart = Class.create();

Cart.prototype = {
    /**
     * @param cartName - name to use when creating/retrieving a cart. If the name is not passed in
     *            (or if it's null/undefined) the default cart will be used
     * @param userID - sys_id of the user to use when creating/retrieving a cart. It's also the user
     *            that will be used as the openedBy user on the request when an order is placed. If
     *            the user is not passed in (or if it's null/undefined) current user will be used.
     */
    initialize: function(cartName, userID) {
        this.cartName = !cartName ? null : cartName;
        this.userID = !userID ? null : userID;

        this.cart = this.getCart();
        this.clearCart();
    },

    getCart: function() {
        var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
        return cart.getGlideRecord();
    },

    clearCart: function() {
        var id = this.cart.sys_id;
        var kids = new GlideRecord('sc_cart_item');
        kids.addQuery('cart', id);
        kids.deleteMultiple();
    },
    
    deleteCart: function() {
        var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
        cart.empty();
    },

    addItem: function(itemID, quantity) {
        if (typeof (quantity) == 'undefined')
            quantity = 1;
        var gr = new GlideRecord('sc_cart_item');
        gr.initialize();
        gr.cart = this.cart.sys_id;
        gr.cat_item = itemID;
        gr.quantity = quantity;
        var rc = gr.insert();
        this.prepVariables(itemID, rc);
        return rc;
    },

    prepVariables: function(itemID, cart_id) {
        var ci = GlideappCatalogItem.get(itemID);
        var gr = ci.getStandaloneVariables();
		var seq = ci.getKeySequence();
        while (gr.next()) {
            var variable = new GlideRecord('sc_item_option');
            variable.initialize();
            variable.value.setValue(null);
            variable.item_option_new = gr.sys_id;
            variable.cart_item = cart_id;
			for (var i = 0; i < seq.size(); i++) {
				if (seq.get(i) + "" == gr.sys_id + "")
		            variable.order = i + "";
			}
            variable.insert();
        }
    },

    setVariable: function(cartID, variable_name, value) {
        var variable = new GlideRecord('sc_item_option');
        variable.addQuery('cart_item', cartID);
        variable.addQuery('item_option_new', variable_name).addOrCondition('item_option_new.name', variable_name);
        variable.query();
        if (variable.next()) {
			variable.value.setValue(value);
            variable.update();
        }
    },

    placeOrder: function() {
        var req = new GlideappRequestNew();
        var rc = req.copyCart(this.cartName, this.userID);
        this.clearCart();
        return rc;
    }
};
