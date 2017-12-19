(function(){
	// build menus
	var menu_id = $sp.getValue('sys_id'); // instance sys_id
	var gr = new GlideRecord('sp_instance_menu');
	gr.get(menu_id);
	data.menu = {};
	data.menu.name = gr.name.getDisplayValue();
	data.menu.items = $sp.getMenuItems(menu_id);

	data.isLoggedIn = GlideSession.get().isLoggedIn();
	if (data.isLoggedIn)
		data.cartWidget = $sp.getWidget("sc-shopping-cart", {cartTemplate: "small_shopping_cart.html"});
})();