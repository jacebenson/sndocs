// populate the 'data' variable with catalog item, variables, and variable view
(function() {
	if (input && input.action == 'init_item') {
		data._generatedItemGUID = gs.generateGUID();
		return;
	}
	else if (input && input.action === "order_item") {
		data.orderItemModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc-checkout', embeddedWidgetOptions: {cart: {name: input.cart}, action: 'order_now', item: input.itemDetails, requested_for: {id:options.requested_for_id, displayValue:options.requested_for_display}
																																																								 }, backdrop: 'static', keyboard: false, size: 'md'});
		return;
	} else if (input && input.action == "order_wishlist_item") {
		data.orderItemModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc-checkout', embeddedWidgetOptions: {cart: {name: input.cart}, action: 'order_now_wishlisted_item', item: input.itemDetails, requested_for: {id:options.requested_for_id, displayValue:options.requested_for_display}
																																																								 }, backdrop: 'static', keyboard: false, size: 'md'});
		return;
	} else if (input && input.action === 'log_request') {
		 $sp.logStat('Cat Item Request', input.itemDetails.sys_class_name, input.itemDetails.sys_id, input.itemDetails.name);
		 return;
	}
	
	// portal can specify a catalog and catalog category home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";
	data.sc_catalog = $sp.getDisplayValue('sc_catalog');
	var edit_parm = $sp.getParameter('edit');
	data.is_cart_item = edit_parm == 'cart';
	data.is_wishlist_item = edit_parm == 'wishlist';
	data.show_wishlist_msg = false;
	data.recordFound = true;

	options.show_add_cart_button = (options.show_add_cart_button == "true");

	if (options.page) {
		var pageGR = new GlideRecord("sp_page");
		options.page = (pageGR.get(options.page)) ? pageGR.getValue("id") : null;
	}

	if (options.table) {
		var tableGR = new GlideRecord("sys_db_object");
		options.table = (tableGR.get(options.table)) ? tableGR.getValue("name") : null;
	}

	options.url = options.url || "?id={page}&is_new_order=true&table={table}&sys_id={sys_id}";
	data.showPrices = $sp.showCatalogPrices();
	var m = data.msgs = {};
	m.submitMsg = gs.getMessage("Submit");
	m.orderNowMsg = gs.getMessage("Order Now");
	m.submittedMsg = gs.getMessage("Submitted");
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	m.dialogTitle = gs.getMessage("Delete Attachment");
	m.dialogMessage = gs.getMessage("Are you sure?");
	m.dialogOK = gs.getMessage("OK");
	m.dialogCancel = gs.getMessage("Cancel");
	
	m.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
	m.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");
	m.wishlistMsg = gs.getMessage('Wish List');
	m.cartMsg = gs.getMessage('Cart');
	m.itemWishlistMsg = gs.getMessage('This item is already in your Wish List. If you attempt to add this item to your Wish List it will overwrite the existing item.');
	m.invalidRecordMsg = gs.getMessage('You are either not authorized or record is not valid.');
	m.wishlistUpdateMsg = gs.getMessage('Your Wish List has been updated.');
	m.wishlistAddMsg = gs.getMessage('Your item has been added to your Wish List.');
	m.cartAddMsg = gs.getMessage('Your item has been added to your Cart. To make changes to the items in your cart, click ');
	m.viewWishListMsg = gs.getMessage('View Wish List');
	m.viewCartMsg = gs.getMessage('View Cart');

	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	m.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");
	
	var cartName = data.is_cart_item ? 'DEFAULT' : 'saved_items';
	var cart = new sn_sc.CartJS(cartName);

	data.showWishlist = new sn_sc.Catalog('' + $sp.getValue('sc_catalog')).isWishlistEnabled();
	
	if (edit_parm) {
		var cart_item_id = $sp.getParameter("sys_id");
		var gr = new GlideRecord("sc_cart_item");
		if (!gr.get(cart_item_id) || gr.cart != cart.getCartID()) {
			data.recordFound = false;
			return;
		}
		var catItemData = {};
		catItemData.sys_id = gr.getValue('cat_item');
		catItemData.cart_item_id = gr.getUniqueValue();
		catItemData.table = "sc_cart_item";
		catItemData.is_ordering = !!options.isOrdering;

		data.sc_cat_item = $sp.getCatalogItem(catItemData);
		data.sc_cat_item.isCartItem = true;
		var values = getValues(cart_item_id);

		for(var f in data.sc_cat_item._fields) {
			// Put the values into the cat item fields
			var field = data.sc_cat_item._fields[f];
			if (typeof values[f] != "undefined" && typeof values[f].value != "undefined") {
				if (values[f].type == 9 || values[f].type == 10)
					field.value = values[f].displayValue;
				else
					field.value = values[f].value;
				field.displayValue = values[f].displayValue;
				field.display_value_list = values[f].display_value_list;
			}
			updatePriceOnField(field);
				
		}
		data._generatedItemGUID = cart_item_id;
		data.quantity = '' + gr.quantity;
	} else {
	
		if (input)
			data.sys_id = input.sys_id;
		else if (options.sys_id)
			data.sys_id = options.sys_id;
		else
			data.sys_id = $sp.getParameter("sys_id") || $sp.getParameter('sl_sys_id');
	
		if (!data.sys_id) {
			data.recordFound = false;
			return;
		}
	
		data._generatedItemGUID = gs.generateGUID();
		var validatedItem = new sn_sc.CatItem('' + data.sys_id);
		if (!validatedItem.canView() || !validatedItem.isVisibleServicePortal()) {
			data.recordFound = false;
			return;
		}
	
		data.sc_cat_item = $sp.getCatalogItem(data.sys_id, true);
		if (data.sc_cat_item.category) {
			var categoryJS;
			var categoryID = data.sc_cat_item.category;
			if ($sp.getParameter("sysparm_category")) {
				categoryJS = new sn_sc.CatCategory($sp.getParameter("sysparm_category") + "");
				categoryID = $sp.getParameter("sysparm_category") + "";
			}
			else {
				categoryJS = new sn_sc.CatCategory(data.sc_cat_item.category);
			}
			data.category = {
				name: categoryJS.getTitle(),
				url: categoryJS.canView() ? '?id=' + data.sc_category_page + '&sys_id=' + categoryID : "#"
			}
			data.categories = [];
			data.categories.push({
				label: categoryJS.getTitle(),
				url: categoryJS.canView() ? '?id=' + data.sc_category_page + '&sys_id=' + categoryID : "#"
			});
			while(categoryJS && categoryJS.getParent()) {
				var parentId =  categoryJS.getParent();
				categoryJS = new sn_sc.CatCategory(parentId);
				var category = {
					label: categoryJS.getTitle(),
					url: categoryJS.canView() ? '?id=' + data.sc_category_page + '&sys_id=' + parentId : "#"
				};
				data.categories.unshift(category);
			}
		}
		var gr = new GlideRecord('sc_cart_item');
		gr.addQuery('cart', cart.getCartID());
		gr.addQuery('cat_item', data.sys_id);
		gr.query();
		if (gr.next())
			data.show_wishlist_msg = true;
	}

	data.sys_properties = {
		twostep: gs.getProperty("glide.sc.sp.twostep", "true") == 'true'
	};

	var athTblName = 'sc_cart_item';
	var className = data.sc_cat_item.sys_class_name;
	if (!new global.CatalogItemTypeProcessor().canCreateNormalCartItem(className)) {
		if (className == 'sc_cat_item_producer') {
				var gr = new GlideRecord('sc_cat_item_producer');
				gr.get(data.sc_cat_item.sys_id);
				if (gr.isValidRecord())
					athTblName = gr.getValue('table_name');
		}
	}
	data._attachmentTable = athTblName;

	$sp.logStat('Cat Item View', data.sc_cat_item.sys_class_name, data.sc_cat_item.sys_id, data.sc_cat_item.name);
	
	function getValues(sys_id) {
		var qs = new sn_sc.VariablePoolQuestionSetJS();
		qs.setCartID(sys_id);
		qs.load();
		var values = {};
		var questions = qs.getFlatQuestions();
		for (var i = 0; i < questions.length; i++)
			values["IO:" + questions[i].sys_id] = questions[i];
		return values;
	}

	function setPrice(field, p, rp) {
		if (p != undefined)
			field.price = p;
		if (rp != undefined)
			field.recurring_price = rp;
	}

	function updatePriceForReferenceTable(field) {
		var tableName = field.refTable + '';
		if (tableName != undefined && tableName != null && tableName != '') {
			var gr = new GlideRecord(tableName);
			if (gr.isValid()) {
				if (gr.get(field.value) && gr.isValidRecord()) {
					updatePrice(gr, field);
					updateRecurringPrice(gr, field);
				}
			}
		}
	}

	function updatePriceForListCollector(field) {
		var tableName = field.refTable + '';
		if (tableName != undefined && tableName != null && tableName != '') {
			var gr = new GlideRecord(tableName);
			if (gr.isValid()) {
				var values = field.value.split(',');
				gr.addQuery('sys_id', values);
				gr.query();
				var p = 0.0;
				var rp = 0.0;
				var price_value_list = [];
				while(gr.next()) {
						var price_field = {};
						updatePrice(gr, price_field);
						updateRecurringPrice(gr, price_field);
						if (price_field.price)
							p += Number(price_field.price);
						else
							price_field.price = 0.0;
						if (price_field.recurring_price)
							rp += Number(price_field.recurring_price);
						else
							price_field.recurring_price = 0.0;
						price_value_list.push(price_field);
				}
				field.price = p;
				field.recurring_price = rp;
				field.price_value_list = price_value_list;
			}
		}
	}

	function updatePrice(gr, field) {
		if (gr.isValidField('price'))
			field.price = gr.getValue('price');
		else if (gr.isValidField('u_price'))
			field.price = gr.getValue('u_price');
	}

	function updateRecurringPrice(gr, field) {
		if (gr.isValidField('recurring_price'))
			field.recurring_price = gr.getValue('recurring_price');
		else if (gr.isValidField('u_recurring_price'))
			field.recurring_price = gr.getValue('u_recurring_price');
	}

	function updatePriceOnField(field) {
		if (field.type == 'boolean' || field.type == 'boolean_confirm') {
			if (field.value == 'true' || field.value == true)
				setPrice(field, field._pricing.price_if_checked, field._pricing.recurring_price_if_checked);
			else
				setPrice(field, 0, 0);
		} else if (field.choices) {
			field.choices.forEach( function(choice) {
				if (choice.value +'' == field.value + '')
					 setPrice(field, choice.price, choice.recurring_price);
			});
		} else if (field._pricing && field._pricing.pricing_implications === true) {
			if (field.type == 'reference') 
				updatePriceForReferenceTable(field);
			else if (field.type == 'glide_list')
				updatePriceForListCollector(field);
		}
	}
})()