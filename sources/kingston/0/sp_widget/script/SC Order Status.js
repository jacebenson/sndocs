(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	var request_id = $sp.getParameter('sys_id');
	if (!request_id)
		return;
	var sc_request = GlideappRequestNew.get(request_id);
	if (!sc_request || !sc_request.getRequestNumber())
		return;
	data.request = {};
	data.msg = {};
    data.is_new_order = $sp.getParameter("is_new_order");
    if (JSUtil.nil(data.is_new_order)) {
        data.is_new_order = false;
    } else {
        data.is_new_order = (($sp.getParameter("is_new_order") + '') === "true")
    }
	data.showPrices = $sp.showCatalogPrices();
	data.request.id = sc_request.getID();
	data.request.order_placed_on = sc_request.getOpenedAt();
	data.request.number = sc_request.getRequestNumber();
	data.request.esimated_delivery = sc_request.getLongestDueDate();
	var reqItemGr = new GlideRecord('sc_req_item');
	reqItemGr.addQuery('request', request_id);
	reqItemGr.query();
	data.request.requestItems = [];
	var spCurrencyFormatter = new SPCurrencyFormatter();
	data.totalPrice = 0;
	data.frequencyMap = {};
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', 'sys_frequency');
	gr.orderBy('sequence');
	gr.query();
	while(gr.next()) {
		data.frequencyMap[gr.value] = {
			display_value: gr.label.getDisplayValue(),
			value: 0,
			sequence: gr.getValue('sequence')
		};
	}
	var recurringPrice = {}
	while(reqItemGr.next()) {
		var catItem = new sn_sc.CatItem(reqItemGr.cat_item).getItemSummary();
		var frequency = reqItemGr.recurring_frequency.getValue();
		var frequency_dv  = reqItemGr.recurring_frequency.getDisplayValue();
		var itemTotalPrice = reqItemGr.price * reqItemGr.quantity.getValue();
		data.totalPrice += itemTotalPrice;
		var itemTotalReccuringPrice = reqItemGr.recurring_price * reqItemGr.quantity.getValue();
		if (recurringPrice[frequency])
			recurringPrice[frequency] += itemTotalReccuringPrice;
		else
			recurringPrice[frequency] = itemTotalReccuringPrice;

		var ritm = new SNC.RequestItem(reqItemGr);
		
		data.request.requestItems.push({
			sys_id: reqItemGr.sys_id.getValue(),
			name: catItem.name,
			delivery_date: ritm.getDeliveryDueDate(),
			stage: reqItemGr.stage.getValue(),
			number: reqItemGr.number.getValue(),
			quantity: reqItemGr.quantity.getValue(),
			show_quantity: catItem.show_quantity,
			price: parseFloat(reqItemGr.price.getValue()),
			price_dv: reqItemGr.price.getDisplayValue(),
			recurring_price: parseFloat(reqItemGr.recurring_price.getValue()),
			recurring_price_dv: reqItemGr.recurring_price.getDisplayValue() + ' ' + frequency_dv,
			total_price: itemTotalPrice,
			total_price_dv: spCurrencyFormatter.format(itemTotalPrice),
			total_reccuring_price: itemTotalReccuringPrice,
			total_reccuring_price_dv: spCurrencyFormatter.format(itemTotalReccuringPrice)  + ' ' + frequency_dv,
			stageWidget : $sp.getWidget("cb6631d39f2003002899d4b4232e7030", {req_item_id: reqItemGr.sys_id.getValue(), onload_expand_request_item_stages: false})
		});
	}
	data.totalPrice = spCurrencyFormatter.format(data.totalPrice);
	data.request.recurringPrice = [];
	for (var property in recurringPrice) {
    if (recurringPrice.hasOwnProperty(property) && data.frequencyMap[property]) {
			var val = recurringPrice[property];
			if (val > 0) {
				data.request.recurringPrice.push({
						sequence: parseInt(data.frequencyMap[property].sequence),
						val: spCurrencyFormatter.format(val),
						val_dv: data.frequencyMap[property].display_value
					});
      }
    }
	}
	data.request.recurringPrice.sort(function(a, b){return a.sequence - b.sequence;});
	
	$sp.logStat('Order Status View', 'sc_request', request_id);
})();