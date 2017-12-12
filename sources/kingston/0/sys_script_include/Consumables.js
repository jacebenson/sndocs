var Consumables = Class.create();
Consumables.prototype = {
	initialize : function() {
	},

	splitForeground : function(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to) {
		this.split(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to);
		if (asset != '') {
			var assetRecord = new GlideRecord('alm_asset');
			if (assetRecord.get(asset)) {
				if (qty == 1)
					gs.addInfoMessage(gs.getMessage('One item has been consumed and attached to {0}', assetRecord.getDisplayValue()));
			    else if (qty > 1)
		            gs.addInfoMessage(gs.getMessage('{0} items have been consumed and attached to {1}', [qty + '', assetRecord.getDisplayValue()]));
		    }
	    }
		if (assigned_to != '') {
			var userRecord = new GlideRecord('sys_user');
			if (userRecord.get(assigned_to)) {
				if (qty == 1)
					gs.addInfoMessage(gs.getMessage('One item has been consumed and attached to {0}', userRecord.getDisplayValue()));
			    else if (qty > 1)
		            gs.addInfoMessage(gs.getMessage('{0} items have been consumed and attached to {1}', [qty + '', userRecord.getDisplayValue()]));
		    }
	    }
	},
		
	split : function(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to) {
		var consumable = this._getConsumable(sys_id);
		if (parseInt(qty,10) > parseInt(consumable.quantity,10)) {
			gs.addErrorMessage(gs.getMessage(
					'Trying to split {0} when only {1} exist', [ qty + '',
							consumable.quantity + '' ]));
			return consumable;
		}
		var split = (parseInt(consumable.quantity,10) != parseInt(qty,10));
		if (split) {
			cost = consumable.cost / consumable.quantity;
			consumable.quantity = consumable.quantity - qty;
			consumable.update();
			consumable.quantity = qty;
			consumable.cost = cost * qty;
		}
		consumable.install_status = status;
		consumable.substatus = substatus;
		if (asset != '') {
			// Asset is being split and associated with real asset.
			consumable.parent = asset;
			consumable.assigned_to = assigned_to;
		} else {
			// Only setting these fields when the split consumable is
			// not associated with a real asset. For real-assets,
			// downstream BRs manage these assignments.
			consumable.stockroom = stockroom;
			consumable.location = location;
			consumable.assigned_to = assigned_to;
		}
		if (split)
			return consumable.insert();
		else
			return consumable.update();
	},

	getMaxInState : function(model, stockroom, status, substatus, asset) {
		var qty = 0;
		var gr = new GlideRecord('alm_asset');
		gr.addQuery('stockroom', stockroom);
		gr.addQuery('install_status', status);
		gr.addQuery('substatus', substatus);
		gr.addQuery('model', model);
		if (asset != '')
			gr.addQuery('sys_id', asset);
		gr.query();
		if (gr.next())
			qty = gr.quantity;

		return qty;
	},

	_getConsumable : function(sys_id) {
		var consumable = new GlideRecord('alm_consumable');
		consumable.addQuery('sys_id', sys_id);
		consumable.query();
		consumable.next();
		return consumable;
	},

	mergeConsumable : function(current) {
		
		var doRedirect = false;
		if ((!current.nil()) && (!current.doRedirect.nil()))
			doRedirect = current.doRedirect;
		
		var gr = new GlideRecord('alm_consumable');
		gr.addQuery('model', current.model);
		gr.addQuery('location', current.location);
		gr.addQuery('model_category', current.model_category);
		gr.addQuery('stockroom', current.stockroom);
		gr.addQuery('install_status', current.install_status);
		gr.addQuery('substatus', current.substatus);
		gr.addQuery('parent', current.parent);
		gr.addQuery('assigned_to', current.assigned_to);
		if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.procurement')) {
			if (current.install_status == 2)
				gr.addQuery('purchase_line', current.purchase_line);
		}
		if (current.active_to == true)
			gr.addQuery('active_to', true);
		else
			gr.addQuery('active_to', false).addOrCondition('active_to', null);
		
		gr.query();

		while (gr.next()) {
			if (gr.sys_id != current.sys_id) {
				gs.addInfoMessage(gs.getMessage('Merged updated record with previous record with similar attributes'));
				gr.quantity = parseInt(gr.quantity,10) + parseInt(current.quantity,10);
				gr.cost = parseFloat(gr.cost) + parseFloat(current.cost);
				gr.update();
				current.deleteRecord();
				current = gr;
				if (doRedirect == true)
					action.setRedirectURL(gr);
				break;
			}
		}
	},

	type : 'Consumables'
};