var AssetUtils = Class.create();
AssetUtils.prototype = {
    initialize: function() {
    },
    
    // The substatus that we consider available is different for FSM returns
    determineAvailableStatus : function(tol) {
        var availableStatus = 'available';
        if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') &&
            !tol.return_from_tol.nil() &&
        !tol.return_from_tol.transfer_order.service_order_task.nil()) {
            availableStatus = 'received'==tol.return_from_tol.stage?'pending_transfer':'reserved';
        } else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management') &&
        !tol.return_from_tol.nil() &&
        !tol.return_from_tol.transfer_order.service_order.nil()) {
            availableStatus = 'received'==tol.return_from_tol.stage?'pending_transfer':'reserved';
        }
        if (tol.transfer_order.drop_off == true) {
            availableStatus = 'defective';
        }
        
        return availableStatus;
    },
    
	doesCiExist : function(sysId) {
		var gr = new GlideRecord('cmdb_ci');
		gr.addQuery('sys_id', sysId);
		gr.query();
		return gr.hasNext();
	},
	
    getFirstItem : function(model, stockroom, status, substatus) {
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('model', model.sys_id);
        gr.addQuery('stockroom', stockroom);
        gr.addQuery('install_status', status);
        gr.addQuery('substatus', substatus);
        gr.query();
        gr.next();
        return gr.sys_id;
    },
    
    getItemCount : function(model, status, substatus) {
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('model', model.sys_id);
        gr.addQuery('install_status', status);
        gr.addQuery('substatus', substatus);
        gr.query();
        return gr.getRowCount();
    },
 
    getStockRooms : function(model) {
        var stock = [];
        var gr = new GlideAggregate('alm_asset');
        gr.addQuery('model', model);
        gr.addQuery('install_status', '6');
        gr.addQuery('substatus', 'available');
        gr.groupBy('stockroom');
        gr.query();
        while (gr.next()) {
            stock.push(gr.stockroom.toString());
        }
        return stock;
    },
	
    getVendors : function(model) {
        var vendors = [];
		var checkRepeat = [];
        var field = '';
        var price = 0;
		var stock = ' ';
        var currency = '';
		var found = false;
		var gr = new GlideRecord('pc_vendor_cat_item');
        gr.addQuery('model', model);
		gr.addQuery('active', true);
		gr.addQuery('vendor.vendor', true);
        gr.addNotNullQuery('vendor');
        gr.orderBy('vendor.name');
        gr.query();
        if(gr.getRowCount() != 0){
            while (gr.next()){
                field = gr.vendor.name.toString();
                price = gr.price.getCurrencyDisplayValue();
				stock = gr.out_of_stock.toString();
				checkRepeat.push( field + ' (' + price +')');
                vendors += '^'+ field + ' (' + price +')^' + stock +'^pc_vendor_cat_item|' + gr.sys_id;
            }
        }
        gr = new GlideRecord('sc_cat_item');
        gr.addQuery('model', model);
		gr.addQuery('active', true);
        gr.addNotNullQuery('vendor');
		gr.addQuery('vendor.vendor', true);
        gr.orderBy('vendor.name');
        gr.query();
        if(gr.getRowCount() != 0){
			while (gr.next()){
				field = gr.vendor.name.toString();
				price = gr.price.getCurrencyDisplayValue();
				found = false;
				// preventing duplicates
				for(var i=0; i <  checkRepeat.length; i++)
					if(checkRepeat[i] == field + ' (' + price +')')
					found = true;
				if (!found)
					vendors += '^'+field + ' (' + price +')^' + 'N/A' +'^sc_cat_item|' + gr.sys_id;
			}
		}
        return vendors;
    },
    
    getAvailableQuantity : function(modelSid, stockroomSid) {
        var gr = new GlideAggregate('alm_asset');
        var counter = 0;
        gr.addQuery('model', modelSid);
        gr.addQuery('install_status', '6');
        gr.addQuery('substatus', 'available');
        gr.addQuery('stockroom', stockroomSid);
        gr.addAggregate('SUM', 'quantity');
        gr.groupBy('stockroom');
        gr.query();
        if (gr.next())
            counter = gr.getAggregate('SUM', 'quantity');
        return counter;
    },
    
    getAssetOrConsumable : function(model) {
        if(model.sys_class_name == 'cmdb_consumable_product_model' || model.asset_tracking_strategy == 'track_as_consumable')
            return 'consumable';
        else if (model.sys_class_name == 'cmdb_software_product_model')
            return 'software';
        else
            return 'asset';
    },
    
    canConsume : function(asset) {
    	if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management')) {
    		var record = new GlideRecord('sm_asset_usage');
    		record.addQuery('asset',asset.sys_id);
    		record.query(); 
    		return !record.hasNext() && asset.install_status == '6' && (asset.substatus == 'available' || asset.substatus == 'reserved') && asset.quantity > 0;
    	} else {
    		return asset.install_status == '6' && (asset.substatus == 'available' || asset.substatus == 'reserved') && asset.quantity > 0;
    	}
    },
	
	mergeLicenses: function(licenseId, type) {
		var gr = new GlideRecord('alm_license');
		gr.get(licenseId);
		
		//Get all matching licenses that have not been merged already
		var mergeable = new GlideRecord('alm_license');
		mergeable.addQuery('model', gr.model);
		mergeable.addQuery('entitlement_condition', gr.entitlement_condition);
		mergeable.addQuery('assigned_condition', gr.assigned_condition);
		mergeable.addQuery('company', gr.company);
		mergeable.addQuery('location', gr.location);
		mergeable.addQuery('department', gr.department);
		mergeable.addQuery('cost_center', gr.cost_center);
		mergeable.addQuery('state', gr.state);
		mergeable.addQuery('merged_into', '');
		mergeable.orderBy('sys_id');
		//Join queries for upgrade/downgrade and assets covered matching
		var updowngrades = new GlideRecord('cmdb_m2m_downgrade_model');
		updowngrades.addQuery('license', gr.getUniqueValue());
		updowngrades.query();
		var numUpDowns = updowngrades.getRowCount();
		var mergeableSQ;
		while(updowngrades.next()) {
			mergeableSQ = mergeable.addJoinQuery('cmdb_m2m_downgrade_model', 'sys_id', 'license');
			mergeableSQ.addCondition('downgrade_child', updowngrades.downgrade_child);
			mergeableSQ.addCondition('upgrade_parent', updowngrades.upgrade_parent);
			mergeableSQ.addCondition('start_date', updowngrades.start_date);
			mergeableSQ.addCondition('end_date', updowngrades.end_date);
		}
		var assetsCovered = new GlideRecord('clm_m2m_contract_asset');
		assetsCovered.addQuery('asset', gr.getUniqueValue());
		assetsCovered.query();
		var numAssetsCovered = assetsCovered.getRowCount();
		while(assetsCovered.next()) {
			mergeableSQ = mergeable.addJoinQuery('clm_m2m_contract_asset', 'sys_id', 'asset');
			mergeableSQ.addCondition('contract', assetsCovered.contract);
			mergeableSQ.addCondition('added', assetsCovered.added);
			mergeableSQ.addCondition('removed', assetsCovered.removed);
		}
		mergeable.query();
		if(mergeable.getRowCount() <= 1)
			return 'There are no eligible licenses to merge.';
		var mergeCost = 0;
		var mergeRights = 0;
		var mergedLicenseId = '';
		var mergingLicenses = '';
		
		var updowns = new GlideAggregate('cmdb_m2m_downgrade_model');
		updowns.addQuery('license.model', gr.model);
		updowns.addQuery('license.entitlement_condition', gr.entitlement_condition);
		updowns.addQuery('license.assigned_condition', gr.assigned_condition);
		updowns.addQuery('license.company', gr.company);
		updowns.addQuery('license.location', gr.location);
		updowns.addQuery('license.department', gr.department);
		updowns.addQuery('license.cost_center', gr.cost_center);
		updowns.addQuery('license.state', gr.state);
		updowns.addQuery('license.merged_into', '');
		updowns.orderBy('license.sys_id');
		updowns.groupBy('license');
		updowns.addAggregate('COUNT');
		updowns.query();
		updowns.next();
		
		var assets = new GlideAggregate('clm_m2m_contract_asset');
		assets.addQuery('asset.model', gr.model);
		assets.addQuery('asset.entitlement_condition', gr.entitlement_condition);
		assets.addQuery('asset.assigned_condition', gr.assigned_condition);
		assets.addQuery('asset.company', gr.company);
		assets.addQuery('asset.location', gr.location);
		assets.addQuery('asset.department', gr.department);
		assets.addQuery('asset.cost_center', gr.cost_center);
		assets.addQuery('asset.state', gr.state);
		assets.addQuery('asset.merged_into', '');
		assets.orderBy('asset.sys_id');
		assets.groupBy('asset');
		assets.addAggregate('COUNT');
		assets.query();
		assets.next();
		
		while(mergeable.next()) {
			//Continue if count do not match
			while(updowns.license < mergeable.sys_id && updowns.hasNext())
				updowns.next();	  
			if(updowns.license != mergeable.sys_id) {
				if(numUpDowns != 0)
					continue;
			} else if(updowns.getAggregate('COUNT') != numUpDowns)
				continue;
			while(assets.asset < mergeable.sys_id && assets.hasNext())
				assets.next();	  
			if(assets.asset != mergeable.sys_id) {
				if(numAssetsCovered != 0)
					continue;
			} else if(assets.getAggregate('COUNT') != numAssetsCovered) 
				continue;
			
			if(type == 'check') {
				if(mergeable.sys_id != licenseId)
					return true;
			} else {
				mergeCost += parseFloat(mergeable.cost.getReferenceValue());
				mergeRights += mergeable.rights;
				if(mergeable.is_merged_license && mergedLicenseId == '')
					mergedLicenseId = mergeable.sys_id + '';
				else {
					if(mergingLicenses != '')
						mergingLicenses += ',';
					mergingLicenses += mergeable.sys_id;
				}
			}
		}
		if(type == 'check')
			return false;
		//Create or update merged license
		if(mergedLicenseId != '') {
			gr.get(mergedLicenseId);
			gr.cost = gr.cost.getReferenceCurrencyCode() + ';' + mergeCost;
			gr.rights = mergeRights;
			gr.update();
		} else {
			gr.is_merged_license = true;
			gr.cost = gr.cost.getReferenceCurrencyCode() + ';' + mergeCost;
			gr.rights = mergeRights;
			gr.asset_tag = '';
			mergedLicenseId = gr.insert();
			//Add upgrade downgrades and assets covered
			var updownsgr = new GlideRecord('cmdb_m2m_downgrade_model');
			updownsgr.addQuery('license', licenseId);
			updownsgr.query();
			while(updownsgr.next()) {
				updownsgr.setValue('license', mergedLicenseId);
				updownsgr.insert();
			}
			var assetsgr = new GlideRecord('clm_m2m_contract_asset');
			assetsgr.addQuery('asset', licenseId);
			assetsgr.query();
			while(assetsgr.next()) {
				assetsgr.setValue('asset', mergedLicenseId);
				assetsgr.insert();
			}
		}
		var transfer = new GlideRecord('alm_license');
		transfer.addQuery('sys_id', 'IN', mergingLicenses);
		transfer.setValue('merged_into', mergedLicenseId);
		transfer.setValue('install_status', 7);
		transfer.updateMultiple();
		
		transfer = new GlideRecord('alm_entitlement');
		transfer.addQuery('licensed_by', 'IN', mergingLicenses);
		transfer.setValue('licensed_by', mergedLicenseId);
		transfer.updateMultiple();
		
		transfer = new GlideRecord('fm_expense_line');
		transfer.addQuery('asset', 'IN', mergingLicenses);
		transfer.setValue('asset', mergedLicenseId);
		transfer.setValue('source_id', mergedLicenseId);
		transfer.updateMultiple();
        
		transfer = new GlideRecord('clm_m2m_rate_card_asset');
		if(transfer.isValid()) {
			transfer.addQuery('asset', 'IN', mergingLicenses);
			transfer.setValue('asset', mergedLicenseId);
			transfer.updateMultiple();
		}

		//Return merged record id
		return 'id'+mergedLicenseId;
	},
	
	calculateDisplayName : function(asset) {
		var display_name = "";
		if (asset.asset_tag)
			display_name += asset.asset_tag + " - ";
		if (asset.model)
			display_name += asset.model.display_name;
		
		if (asset.display_name == display_name)
			return false;
		
		asset.display_name = display_name.trim();
		return true;
	},
	
    /* Very given CI satisfy the license's assigned condition or not */
	verifyDeviceEntitlement: function(license, ci) {
        var licenseGR = new GlideRecord('alm_license');
        licenseGR.get(license);
        var gr = new GlideRecord('cmdb_ci');
        gr.addEncodedQuery(licenseGR.entitlement_condition);
        gr.addQuery('sys_id', ci);
        gr.query();
        var queryRows = gr.getRowCount();
        if (queryRows != 1) {
                return false;
        }
        return true;
    },
    
    /* Very given user satisfy the license's assigned condition or not */
    verifyUserEntitlement: function (license, user) {
        var licenseGR = new GlideRecord('alm_license');
        licenseGR.get(license);
        var gr = new GlideRecord('sys_user');
        gr.addEncodedQuery(licenseGR.assigned_condition);
        gr.addQuery('sys_id', user);
        gr.query();
        var queryRows = gr.getRowCount();
        if (queryRows != 1) {
            return false;
        }
        return true;
    },
	
	hasVendors : function(model) {
        var hasVendor = false; 
		var gr = new GlideRecord('pc_vendor_cat_item');
        gr.addQuery('model', model);
		gr.addQuery('active', true);
        gr.addNotNullQuery('vendor');
		gr.addQuery('vendor.vendor', true);
        gr.setLimit(1);
        gr.query();
        if(gr.getRowCount() != 0){
           hasVendor = true;
        }
        if(!hasVendor) {
            gr = new GlideRecord('sc_cat_item');
            gr.addQuery('model', model);
            gr.addQuery('active', true);
            gr.addNotNullQuery('vendor');
			gr.addQuery('vendor.vendor', true);
            gr.setLimit(1);
            gr.query();
            if(gr.getRowCount() != 0){
                hasVendor = true;
            }
        }
     
        return hasVendor;
    },
    
    type: 'AssetUtils'
};