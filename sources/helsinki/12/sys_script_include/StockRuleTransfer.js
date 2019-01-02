var StockRuleTransfer = Class.create();
StockRuleTransfer.prototype = {
	initialize : function() {
	},

	/**
	 * creates transfer order with a single consumable transfer order line
	 */
	consumableTransfer : function(parent, stockroom, model, amount) {
		var to = new GlideRecord("alm_transfer_order");
		to.initialize();
		to.from_stockroom = parent;
		to.to_stockroom = stockroom;
		to.from_location = parent.location;
		to.to_location = stockroom.location;
		var transferId = to.insert();

		var tol = new GlideRecord("alm_transfer_order_line");
		tol.initialize();
		tol.transfer_order = transferId;
		tol.model = model;
		tol.quantity_requested = amount;
		tol.insert();
	},

	/**
	 * creates transfer order with multiple asset transfer order line
	 */
	assetTransfer : function(parent, stockroom, model, amount) {
		var to = new GlideRecord("alm_transfer_order");
		to.initialize();
		to.from_stockroom = parent;
		to.to_stockroom = stockroom;
		to.from_location = parent.location;
		to.to_location = stockroom.location;
	   
	    var transferId = "";

		var gr = new GlideRecord("alm_asset");
		gr.addQuery("model", model);
		gr.addQuery("stockroom", parent);
		gr.addQuery("install_status", "6");
		gr.addQuery("substatus", "available");
		gr.query();

		for ( var i = 0; i < amount; ++i) {
			if (gr.next()) {

				if (i == 0) {
					transferId = to.insert();
				}

				var tol = new GlideRecord("alm_transfer_order_line");
				tol.initialize();
				tol.transfer_order = transferId;
				tol.model = model;
				tol.asset = gr.sys_id;
				tol.insert();
			} else {
				gs.addErrorMessage(gs.getMessage("Parent stockroom ran out of assets to transfer. Aborting transfer"));
				break;
			}
		}
	},

	checkStockroomAvailability : function(stockroom, model) {
		// retrieve all matching assets in the stockroom
		var gr = new GlideRecord("alm_asset");
		gr.addQuery("stockroom", stockroom);
		gr.addQuery("model", model);
		gr.addQuery("install_status", "6");
		gr.addQuery("substatus", "available").addOrCondition("substatus",
				"reserved");
		gr.addQuery('active_to', 'false').addOrCondition('active_to', null);
		gr.query();

		// count quantity
		var count = 0;
		while (gr.next())
			count += parseInt(gr.quantity,10);

		return count;
	},

	checkStockroomTransferAvailability : function(stockroom, model) {
		// retrieve all matching assets in the stockroom
		var gr = new GlideRecord("alm_asset");
		gr.addQuery("stockroom", stockroom);
		gr.addQuery("model", model);
		gr.addQuery("install_status", "6");
		gr.addQuery("substatus", "available");
		gr.addQuery('active_to', 'false').addOrCondition('active_to', null);
		gr.query();

		// count quantity
		var count = 0;
		while (gr.next())
			count += parseInt(gr.quantity,10);

		return count;
	},

	getTotalRecordCount : function(stockroom, model) {
		return this.checkStockroomAvailability(stockroom, model) +
				this.transferOrderAvailability(stockroom, model);
	},

	/**
	 * retrieves record count for assets that are currently in a transfer order
	 * going to that stockroom
	 */
	transferOrderAvailability : function(stockroom, model) {

		var tols = new GlideRecord('alm_transfer_order_line');
		tols.addQuery('transfer_order.to_stockroom', stockroom);
		tols.addQuery('model', model);
		tols.addQuery('stage', '!=', 'received');
		tols.query();

		var count = 0;
		while (tols.next()) {

			if (!tols.quantity_remaining.nil())
				count += parseInt(tols.quantity_remaining,10);
			else
				count += parseInt(tols.quantity_requested,10);

			count -= parseInt(tols.quantity_returned,10);
		}

		return count;
	},

	type : 'StockRuleTransfer'
};