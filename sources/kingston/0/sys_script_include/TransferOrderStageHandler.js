var TransferOrderStageHandler = Class.create();

TransferOrderStageHandler.prototype = {
	initialize : function() {
	},

	/*
	 * Determines whether a specific staging button should be visible or not.
	 * Note: transferOrder can refer to a transfer order or a transfer order
	 * line
	 */
	isUIActionAllowed : function(transferOrder, requestedUIAction) {
		if (transferOrder.stage == 'draft' &&
				requestedUIAction == 'requested' &&
				this._getChildrenInStage(transferOrder, 'draft') > 0)
			return true;
		else if ((transferOrder.stage == 'shipment_preparation' ||
				transferOrder.stage == 'requested' || transferOrder.stage == 'draft') &&
				requestedUIAction == 'cancellation' &&
				transferOrder.asset.nil() == false) {
			return true;
		} else if (requestedUIAction == 'shipment_preparation') {
			if ((transferOrder.stage == 'requested' ||
					this._getChildrenInStage(transferOrder, 'requested') > 0))
				return true;
		} else if ((transferOrder.stage == 'shipment_preparation' || transferOrder.stage == 'partially_shipped') &&
				(requestedUIAction == 'ship')) {
			if (this._getChildrenInStage(transferOrder, 'shipment_preparation') > 0 &&
					this._getChildrenInStage(transferOrder, 'requested') === 0)
				return true;
		} else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') &&
				requestedUIAction == 'delivered' &&
				!transferOrder.transfer_order.service_order_task.nil() &&
				!transferOrder.transfer_order.service_order_task.assigned_to.nil() &&
				',17,18,'.indexOf(','+transferOrder.transfer_order.service_order_task.state+',') != -1) {
			if (transferOrder.stage == 'in_transit' &&
					transferOrder.transfer_order.to_stockroom.type.value == 'field_agent')
				return true;
			else if (transferOrder.stage == 'received' &&
					transferOrder.quantity_received > transferOrder.quantity_returned)
				return true;
			else
				return false;
			
		} else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management') &&
				requestedUIAction == 'delivered' &&
				!transferOrder.transfer_order.service_order.nil() &&
				!transferOrder.transfer_order.service_order.assigned_to.nil() &&
				transferOrder.transfer_order.service_order.state != 16) {
			if (transferOrder.stage == 'in_transit' &&
					transferOrder.transfer_order.to_stockroom.type.value == 'field_agent')
				return true;
			else if (transferOrder.stage == 'received' &&
					transferOrder.quantity_received > transferOrder.quantity_returned)
				return true;
			else
				return false;
		} else
			return false;
	},

	/*
	 * Determines if the receive button with no dialog should pop up or not
	 */
	isReceivingAllowed : function(transferOrderLine) {
		if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') &&
				transferOrderLine.transfer_order.to_stockroom.type.value == 'field_agent') {
			return false;
		} else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management') &&
				transferOrderLine.transfer_order.to_stockroom.type.value == 'field_agent') {
			return false;
		} else if (transferOrderLine.stage == 'in_transit') {
			if (transferOrderLine.quantity_remaining == 1 || transferOrderLine.asset.substatus == 'pre_allocated')
				return true;
			else
				return false;
		}
	},

	/*
	 * Determines if the receive button with dialog should pop up or not
	 */
	isReceivingAllowedDialog : function(transferOrderLine) {
		if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') &&
				transferOrderLine.transfer_order.to_stockroom.type.value == 'field_agent') {
			return false;
		} else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management') &&
				transferOrderLine.transfer_order.to_stockroom.type.value == 'field_agent') {
			return false;
		} else if (transferOrderLine.stage == 'in_transit') {
			if (transferOrderLine.quantity_remaining != 1 &&
					(transferOrderLine.model.sys_class_name == 'cmdb_consumable_product_model' || transferOrderLine.model.asset_tracking_strategy == 'track_as_consumable'))
				return true;
			else
				return false;
		}
	},

	/*
	 * Propagates the Transfer Order Stages among its Transfer Order Line Stages
	 */
	pushStageFromTO : function(transferOrder, action) {
		var newTOLStage = 0;
		var newTOStage = 0;
		if (action == 'requested') {
			newTOLStage = 1;
			newTOStage = 1;
		} else if (action == 'shipment_preparation') {
			newTOLStage = 2;
			newTOStage = 2;
			if (transferOrder.stage == 'partially_shipped')
				newTOStage = 3;
		} else if (action == 'ship') {
			newTOLStage = 3;
			newTOStage = 4;
		}

		var helper = new TransferOrderStageHelper();
		var grTOL = new GlideRecord('alm_transfer_order_line');
		grTOL.addQuery('transfer_order', transferOrder.sys_id);
		grTOL.addQuery('stage', helper.getStageTOL(newTOLStage - 1).stage);
		grTOL.query();

		while (grTOL.next()) {
			grTOL.stage = helper.getStageTOL(newTOLStage).stage;
			if (action == 'requested')
				grTOL.quantity_remaining = grTOL.quantity_requested;
			grTOL.update();
		}

		transferOrder.stage = helper.getStageTO(newTOStage).stage;
		transferOrder.update();
	},

	/*
	 * When all the Transfer Order Lines change to specific stages, it pushes
	 * the Transfer Order to change its stage.
	 */
	pushStageFromTOL : function(transferOrderLine, action) {
		var totalChildren = this._getChildrenCount(transferOrderLine.transfer_order);
		var stageChildren = this._getChildrenInStage(transferOrderLine.transfer_order, transferOrderLine.stage);

		var grTO = new GlideRecord('alm_transfer_order');
		grTO.addQuery('sys_id', transferOrderLine.transfer_order.sys_id);
		grTO.query();

		if (grTO.next()) {
			if (action == 'in_transit') {
				if (totalChildren == stageChildren)
					grTO.stage = 'fully_shipped';
				else
					grTO.stage = 'partially_shipped';
			} else if (action == 'cancelled') {
				if (totalChildren == stageChildren)
					grTO.stage = 'cancelled';
			} else if ((action == 'received' || action == 'delivered') &&
					totalChildren == stageChildren)
				grTO.stage = action;
			else if (action == 'shipment_preparation' &&
					grTO.stage != 'partially_shipped')
				grTO.stage = action;
			grTO.update();
		}
	},

	_getChildrenInStage : function(transferOrder, stage) {
		var grTOL = new GlideRecord('alm_transfer_order_line');
		grTOL.addQuery('transfer_order', transferOrder.sys_id);
		grTOL.addQuery('stage', 'IN', stage);
		grTOL.query();

		return grTOL.getRowCount();
	},

	_getChildrenCount : function(transferOrder) {
		var grTOL = new GlideRecord('alm_transfer_order_line');
		grTOL.addQuery('transfer_order', transferOrder.sys_id);
		grTOL.query();

		return grTOL.getRowCount();
	},

	type : 'TransferOrderStageHandler'
};