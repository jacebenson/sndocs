var AssetAndCISynchronizer = Class.create();
AssetAndCISynchronizer.prototype = {
	initialize : function() {
	},

	ASSET_CI_FIELD_MAPPING_TABLE : 'alm_asset_ci_field_mapping',
	ASSET_BASE_CI_STATE_MAPPING_TABLE : 'alm_asset_ci_state_mapping',
	ASSET_HARDWARE_CI_STATE_MAPPING_TABLE : 'alm_hardware_state_mapping',

	/*
	 * Synchronize data between related asset and CI records Record linked to
	 * source record in the destination table will get updated
	 */
	syncRecords : function(source, destinationBaseTable) {
		var destination = new GlideRecord(destinationBaseTable);
		var foreignKey = (destinationBaseTable == 'alm_asset') ? 'asset' : 'ci';
		var destinationId = source[foreignKey].toString();
		destination = null;
		if ('cmdb_ci' == destinationBaseTable) {
			// when synchronizing to a CI, we have to check first for hardware
			// because
			// some status fields exist only on hardware table
			destination = new GlideRecord('cmdb_ci_hardware');
			// fast forward glide record to proper destination ci,
			// reset to null if no hardware ci found and proceed with base ci
			destination.query("sys_id", destinationId);
			if (!destination.next())
				destination = null;
		}
		if (destination == null) {
			destination = new GlideRecord(destinationBaseTable);
			// fast forward glide record to proper destination record
			// abandon processing if no such record found
			destination.query("sys_id", destinationId);
			if (!destination.next())
				return;
		}

		var changes = this.syncRecordsWithoutUpdate(source, destination,
				destinationBaseTable, false);
		if (changes > 0) {
			destination.skip_sync = true;
			destination.update();
		}
	},

	/*
	 * Update the fields of destination record with information from source
	 * record but do not trigger an update of the destination record itself
	 * if asynchUpdate, destination will be modified even if source hasn't changed
	 */
	syncRecordsWithoutUpdate : function(source, destination,
			destinationBaseTable, asyncUpdate) {
		var changes = 0;
		// Sanity protection
		var me = source.getValue('sys_id') + '';
		if ('cmdb_ci' == destinationBaseTable) {
			// Check that we are pointing at ourselves
			var back = destination.getValue('asset') + '';
			if ( back != me) {
				gs.log('Aborting Asset to CI sync due to pointer mismatch');
				return 0;
			}
		}
		if ('alm_asset' == destinationBaseTable) {
			// Check that we are pointing back at ourselves
			var back = destination.getValue('ci') + ''; 
			if ( back != me) {
				gs.log('Aborting CI to Asset sync due to pointer mismatch');
				return 0;
			}
		}

		// synchronize data for fields that have active mapping defined in 'alm_asset_ci_field_mapping' 
		changes += this._syncFields(source, destination, destinationBaseTable);

		// fields that differ slightly
		changes += this._syncCost(destinationBaseTable, source, destination, asyncUpdate);

		// fields that differ wildly
		changes += this._syncState(destinationBaseTable, source, destination, asyncUpdate);

		return changes;
	},

	/*
	 * Synchronization of the fields which have active mappings defined in 'alm_asset_ci_field_mapping'
	 */
	_syncFields : function(source, destination, destinationBaseTable) {

		var sourceFieldName;
		var destinationFieldName;
		var mappingFieldName;
		var changes = 0;
		var srcField;
		var destField;

		if(destinationBaseTable == 'cmdb_ci') {
			sourceFieldName = 'asset_field';
			destinationFieldName = 'configuration_item_field';
			mappingFieldName = 'asset_mapping_condition';
		} else {
			sourceFieldName = 'configuration_item_field';
			destinationFieldName = 'asset_field';
			mappingFieldName = 'ci_mapping_condition';
		}

		var fieldGR = new GlideRecord(this.ASSET_CI_FIELD_MAPPING_TABLE);
		fieldGR.addActiveQuery();
		fieldGR.query();

		while(fieldGR.next()) {
			if(this._isSourceRecordMatching(source, fieldGR[mappingFieldName])) {
				srcField = fieldGR[sourceFieldName];
				destField = fieldGR[destinationFieldName];

				if (!source.getElement(srcField).hasValue())
					destination.setValue(destField, '');
				else
					destination.setValue(destField, source.getValue(srcField));

				changes = changes + 1;
			}
		}

		return changes;
	},

	// Check if the Source record matches the condition defined for Field mapping
	_isSourceRecordMatching : function (sourceGR, encodedQuery){

		if(JSUtil.notNil(encodedQuery)) {
			 return GlideFilter.checkRecord(sourceGR, encodedQuery);
		}
		else
			return true;

	},

	/*
	 * Cost synchronization: cost fields are named differently and have
	 * different data format
	 */
	_syncCost : function(destinationBaseTable, source, destination, asyncUpdate) {
		if ('alm_asset' == destinationBaseTable) {
			if (source.cost.changes() || source.cost_cc.changes() || asyncUpdate) {
				//cost fields are informational only on ci side and cannot be modified
				return 0;
			}
			return 0;
		}
		if ('cmdb_ci' == destinationBaseTable) {
			if (source.cost.changes() || asyncUpdate) {
				var field = source.getElement('cost');
				destination.cost = field.getCurrencyValue();
				destination.cost_cc = field.getCurrencyCode();
				return 2;
			}
			return 0;
		}
		return 0;
	},

	/*
	 * State fields are a different in name, number and data format. Careful
	 * mapping needs to be done.
	 */
	_syncState : function(destinationBaseTable, source, destination, asyncUpdate) {
		if (destinationBaseTable == 'alm_asset')
			return this._inferAssetStatuses(source, destination, asyncUpdate);
		else if (destinationBaseTable == 'cmdb_ci')
			return this._inferCIStatuses(source, destination, asyncUpdate);
		return 0;
	},

	/*
	 * Infer asset state fields from ci state fields and update as appropriate
	 */
	_inferAssetStatuses : function(ci, asset, asyncUpdate) {
		// HW statuses take precedence over CI statuses
		if (this._isHardwareCI(ci)) {
			if (!ci.hardware_status.changes() && !ci.hardware_substatus.changes() && !asyncUpdate)
				return 0;
			return this._inferAssetStatusesHardware(ci, asset);
		} else {
			if (!ci.install_status.changes() && !asyncUpdate)
				return 0;
			return this._inferAssetStatusesBase(ci, asset);
		}
	},

	/*
	 * Infer asset ci fields from asset state fields and update as appropriate
	 */
	_inferCIStatuses : function(asset, ci, asyncUpdate) {
		if (!asset.install_status.changes() && !asset.substatus.changes() && !asyncUpdate)
			return 0;

		var changes = this._inferCIStatusesBase(asset, ci);
		if (this._isHardwareCI(ci))
			changes += this._inferCIStatusesHardware(asset, ci);
		return changes;
	},

	/*
	 * Look for clues that the ci is a hardware ci
	 */
	_isHardwareCI : function(ci) {
		return (ci.hardware_status != undefined);
	},

	/*
	 * Figure out what CI install status should be based on asset's state and
	 * substate
	 */
	_inferCIStatusesBase : function(asset, ci) {
		var status = asset.install_status.toString();
		var substatus = asset.substatus.toString();
		var changes = 0;

		var baseCIgr = new GlideRecord(this.ASSET_BASE_CI_STATE_MAPPING_TABLE);
		baseCIgr.addActiveQuery();
		baseCIgr.addQuery('asset_state', status);
		baseCIgr.addQuery('asset_substate', substatus);
		baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=asset_to_ci');
		baseCIgr.orderBy('synch_direction');
		baseCIgr.setLimit(1);
		baseCIgr.query();

		if(baseCIgr.next()){
			if(JSUtil.notNil(baseCIgr.configuration_item_status)) {
				ci.install_status = baseCIgr.configuration_item_status;
				changes = changes+1;
			}
		}
		return changes;
	},

	/*
	 * Figure out what hardware CI status and substatus should be based on
	 * asset's state and substate
	 */
	_inferCIStatusesHardware : function(asset, ci) {
		var status = asset.install_status.toString();
		var substatus = asset.substatus.toString();
		var changes = 0;
		var baseCIgr = new GlideRecord(this.ASSET_HARDWARE_CI_STATE_MAPPING_TABLE);
		baseCIgr.addActiveQuery();
		baseCIgr.addQuery('asset_state', status);
		baseCIgr.addQuery('asset_substate', substatus);
		baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=asset_to_ci');
		baseCIgr.orderBy('synch_direction');
		baseCIgr.setLimit(1);
		baseCIgr.query();

		if(baseCIgr.next()){
			if(JSUtil.notNil(baseCIgr.hardware_ci_status)){
				ci.hardware_status = baseCIgr.hardware_ci_status;
				ci.hardware_substatus = baseCIgr.hardware_ci_substatus;
				changes = changes+2;
			}
		}
		return changes;
	},

	/*
	 * Figure out what asset state and substate should be based on ci's install
	 * status
	 */
	_inferAssetStatusesBase : function(ci, asset) {
		var status = '';
		var changes = 0;
		status = ci.install_status.toString();

		var baseCIgr = new GlideRecord(this.ASSET_BASE_CI_STATE_MAPPING_TABLE);
		baseCIgr.addActiveQuery();
		baseCIgr.addQuery('configuration_item_status', status);
		baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=ci_to_asset');
		baseCIgr.orderByDesc('synch_direction');
		baseCIgr.setLimit(1);
		baseCIgr.query();

		if(baseCIgr.next()){
			if(JSUtil.notNil(baseCIgr.asset_state)) {
				asset.install_status = baseCIgr.asset_state;
				asset.substatus = baseCIgr.asset_substate;
				changes = changes+2;
			}
		}

		return changes;
	},

	/*
	 * Figure out what asset state and substate should be based on hardware ci's
	 * state and substate
	 */
	_inferAssetStatusesHardware : function(ci, asset) {
		var hwStatus = ci.hardware_status.toString();
		var hwSubstatus = ci.hardware_substatus.toString();
		var changes = 0;
		status = ci.install_status.toString();

		var baseCIgr = new GlideRecord(this.ASSET_HARDWARE_CI_STATE_MAPPING_TABLE);
		baseCIgr.addActiveQuery();
		baseCIgr.addQuery('hardware_ci_status', hwStatus);
		baseCIgr.addQuery('hardware_ci_substatus', hwSubstatus);
		baseCIgr.addEncodedQuery('synch_direction=both^ORsynch_direction=ci_to_asset');
		baseCIgr.orderByDesc('synch_direction');
		baseCIgr.setLimit(1);
		baseCIgr.query();

		if(baseCIgr.next()){
			if(JSUtil.notNil(baseCIgr.asset_state)) {
				asset.install_status = baseCIgr.asset_state;
				asset.substatus = baseCIgr.asset_substate;
				changes = changes+2;
			}		
		}

		return changes;
	},

	type : 'AssetAndCISynchronizer'
};