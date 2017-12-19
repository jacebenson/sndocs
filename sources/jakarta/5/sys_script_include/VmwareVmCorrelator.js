var VmwareVmCorrelator;

(function() {
	_debug('BEGIN VmwareVmCorrelator outer wrapper');
	var g_disco_functions = new DiscoveryFunctions();
	var debugLog = false;
	var instantiatedByRelationshipTypeId = g_disco_functions.findCIRelationshipType('cmdb_rel_type', 'Instantiates::Instantiated by');

	// public functions
	VmwareVmCorrelator = {
		processVmInstanceOrTemplate: processVmInstanceOrTemplate,
		getVmInstance: getVmInstance,
		getVmInstances: getVmInstances
};
	

// Called by vCenter sensor.
// Input:
//   columns -- props where key = VM instance table column name:
//     bios_uuid
//     vm_instance_uuid
//     vcenter_uuid
//     object_id (moRef)
//   macs -- array of MAC address strings.  Must have at least one element.  <<<< ADD CHECK FOR THIS
//   isVmTemplateRec -- false if VM instance rec
//   processGlideRec -- callback for additional processing on glide record
//   esx -- optional sys_id of the ESX server the VM runs on.  We'll create a Virtualized by::
//          Virtualizes relationship between the VM record and the ESX record.
// Output: VM instance gliderec
// Throws MultVMFoundNewStyle, MultVMFoundOldStyle, duplicateGuestsFound
function processVmInstanceOrTemplate(columns, macs, isVmTemplateRec, processGlideRec, esx) {
	try {
		_debug_refresh();
		_debug('BEGIN processVmInstanceOrTemplate');
		var vmGr;
		var guestGr;
		var addVmInstanceRec;   // bool
		var tableName = isVmTemplateRec ? 'cmdb_ci_vmware_template' : 'cmdb_ci_vmware_instance';
		var correlation_id = VMUtils.turnUuidToCorrelationId(columns.bios_uuid);

		vmGr = _getVmInstanceOrTemplate(tableName, columns.vm_instance_uuid, columns.vcenter_uuid, correlation_id, columns.object_id);
		addVmInstanceRec = !vmGr;
		if (addVmInstanceRec) {
			vmGr = new GlideRecord(tableName);

			// newRecord() sets gr.sys_id so can add relationship recs to Vm guest recs below *before*
			// doing gr.insert(), because vmGr.guest is also used as a flag below to decide
			// if need to check/update guest relationship.
			vmGr.newRecord();
			vmGr.correlation_id = correlation_id;
		}

		if (processGlideRec)
			processGlideRec(vmGr);

		// merge in column values to vmGr
		for (var prop in columns) {
			if (prop != 'sys_id')
				vmGr[prop] = columns[prop];
		}

		// If a VM Instance rec, and rec not related to guest (or existing relationship rec needs update),
		// verify/resolve relationship to guest and resolve NIC's on guest.
		if (!isVmTemplateRec) {
			_debug("processVmInstanceOrTemplate  vmGr.guest_reconciled: "+  vmGr.guest_reconciled);
			if (!vmGr.guest_reconciled)
				_resolveVmGuest(vmGr, macs, esx);
		}
		if (addVmInstanceRec) {
			_debug('processVmInstanceOrTemplate -- added new rec');
			vmGr.insert();
		} else {
			_debug('processVmInstanceOrTemplate -- updated existing rec');
			vmGr.update();
		}
		return vmGr;
	} finally {
		_debug('END processVmInstanceOrTemplate');
	}
}
	
// In:
//   4 IDs: must pass 1) vmInstanceUuid, vCenterInstanceUuid  OR 2) vCenterInstanceUuid, correlationId, vmObjectId.
//   Ok to pass in all.
// 
// Returns:
//   vmGr if rec found, else return undefined
// Throws MultVMFoundNewStyle, MultVMFoundOldStyle, duplicateGuestsFound
function getVmInstance(vmInstanceUuid, vCenterInstanceUuid, correlationId, vmObjectId) {
	_debug_refresh();
	return _getVmInstanceOrTemplate('cmdb_ci_vmware_instance', vmInstanceUuid, vCenterInstanceUuid, correlationId, vmObjectId);
}

// In:
//   vCenterInstanceUuid, vmObjectId
//
// Returns:
//   Array of sys_ids of matching records.  Usually 1 item in array, but it may be
//   more if MOR IDs have been recycled.
function getVmInstances(vCenterInstanceUuid, vmObjectId) {
	_debug_refresh();
	_debug('BEGIN getVmInstances: vCenterInstanceUuid: ' + vCenterInstanceUuid + ', vmObjectId: ' + vmObjectId);

	var sysIds = [ ];

	var vmGr = new GlideRecord('cmdb_ci_vmware_instance');
	vmGr.addQuery('vcenter_uuid', vCenterInstanceUuid);
	vmGr.addQuery('object_id', vmObjectId);
	vmGr.query();

	while (vmGr.next())
		sysIds.push('' + vmGr.sys_id);

	_debug('Found VM instances: ' + sysIds.join(', '));
	_debug('END getVmInstances');

	return sysIds;
}

// In:
//   4 IDs: must pass 1) vmInstanceUuid, vCenterInstanceUuid OR 2) vCenterInstanceUuid, correlationId, vmObjectId
//   Ok to pass in all.
// 
// Returns:
//   vmGr if rec found, else return undefined
// Throws MultVMFoundNewStyle, MultVMFoundOldStyle, duplicateGuestsFound
function _getVmInstanceOrTemplate(tableName, vmInstanceUuid, vCenterInstanceUuid, correlationId, vmObjectId) {
	try {
		_debug('BEGIN _getVmInstanceOrTemplate: ' + correlationId + ", vCenterInstanceUuid: " + vCenterInstanceUuid + ", vmObjectId: " + vmObjectId + ", vmInstanceUuid: " + vmInstanceUuid);
		var vmGr;
		
		// if have non-blank mvInstanceUuid and vCenterInstanceUuid, try to find match to DB new-style rec
		if (!JSUtil.nil(vmInstanceUuid) && !JSUtil.nil(vCenterInstanceUuid)) {
			vmGr = new GlideRecord(tableName);
			vmGr.addQuery('vm_instance_uuid', vmInstanceUuid);
			vmGr.addQuery('vcenter_uuid', vCenterInstanceUuid);
			vmGr.query();
			if (vmGr.getRowCount() > 1)
				throw  {
					error: "VmwareVmCorrelator.MultVMFoundNewStyle",
					msg: "Multiple VM " + tableTypeName(tableName) + " CIs found.  VM Instance UUID: "
							+ vmInstanceUuid + ", vCenter UUID: " + vCenterInstanceUuid
				};

			if (vmGr.next()) {
				_debug('new-style match for ' + vmGr.name);
				return vmGr;
			}
		}

		// No match, may be old style rec.  Try match by vCenter UUID, vmObjectId, and BIOS UUID
		if (findByObjectId(correlationId))
			return vmGr;

		// See if we have a record that doesn't have a correlation ID.  This checks for both
		// erroneously inserted records (without a correlation_id) and records created by the
		// event collector which don't yet have a correlation_id.
		if (findByObjectId())
			return vmGr;

		// Last try.  Try again with correlation ID.  The event collector will create VMs with
		// vCenter UUID and VM object ID but no correlation ID.  The findObjectId(correlationId)
		// call above may fail because the collector created a record without a correlation ID.
		// It's possible for the record to be updated on another thread before the 2nd call to
		// findObjectById() gets made.  That call will then fail because the record now has a
		// correlation ID, so we have to check one more time with correlation ID to make sure
		// that hasn't happened.
		if (findByObjectId(correlationId))
			return vmGr;

		_debug('no match for correlationId: ' + correlationId + ", vCenterInstanceUuid: " + vCenterInstanceUuid + ", vmObjectId: " + vmObjectId + ", vmInstanceUuid: " + vmInstanceUuid);
	} finally {
		_debug('END _getVmInstanceOrTemplate');
	}

	// This function uses the outer function's variables for everything except correlationId.  This allows
	// us to (1) not pass in a bunch of parameters, and (2) return the value of vmGr that gets set by this
	// function.
	function findByObjectId(correlationId) {
		if (!JSUtil.nil(vCenterInstanceUuid) && !JSUtil.nil(vmObjectId)) {
			vmGr = new GlideRecord(tableName);
			if (correlationId)
				vmGr.addQuery('correlation_id', correlationId);
			else
				vmGr.addNullQuery('correlation_id');
			vmGr.addQuery('vcenter_uuid', vCenterInstanceUuid);
			vmGr.addQuery('object_id', vmObjectId);
			vmGr.query();
			if (vmGr.getRowCount() > 1)
				throw  {
					error: "VmwareVmCorrelator.MultVMFoundOldStyle",
					msg: "Multiple VM " + tableTypeName(tableName) + " CIs found.  Correlation ID (BIOS UUID): " + correlationId
							+ ", vCenter UUID: " + vCenterInstanceUuid + ", Object Id (VMWare MoRef): " + vmObjectId
				};

			if (vmGr.next()) {
				_debug('old-style match for ' + vmGr.name);
				return vmGr;
			}
		}
	}
}

// Create vm instance <-> guest relationship and reference, cleanup bad ones.
// Also create and cleanup vmGr <-> nic relationship.
// Input
//   vmGr - glide rec for cmdb_ci_vmware_instance
//   macs - array of MAC address strings
//   esx -- optional sys_id of the ESX server the VM runs on.  We'll create a Virtualized by::
//          Virtualizes relationship between the VM record and the ESX record.
// Output: none, may fill in vmGr.guest
// Throws duplicateGuestsFound
function _resolveVmGuest(vmGr, macs, esx) {
	try {
		_debug("BEGIN _resolveVmGuest");

		var nics;
		var relGr;
		var serial = '' + vmGr.correlation_id;
		var guestGr = new GlideRecord('cmdb_ci_computer');
		guestGr.addQuery('serial_number', ['zone-' + serial, 'vmware-' + serial]);
		guestGr.query();

		var guestCiSysId;
		var duplicateCIs = [];
		// find the guest CI that contains a mac address belonging to this vm
		while (guestGr.next()) {
			_debug("_resolveVmGuest  guestGr.name: " + guestGr.name);
			// get the NIC's associated with this guest
			nics = new GlideRecord('cmdb_ci_network_adapter');
			nics.addQuery('cmdb_ci', guestGr.sys_id);
			nics.addQuery('mac_address', 'IN', macs);
			nics.query();
			if (nics.getRowCount() > 0) {
				duplicateCIs.push(guestGr.sys_id);
				if (JSUtil.nil(guestCiSysId))
					guestCiSysId = guestGr.getValue('sys_id');
			}
		}

		if (JSUtil.nil(guestCiSysId))
			return;

		if (duplicateCIs.length > 1)
			throw {
				"error": "VMCorrelator.DuplicateGuestsFound",
				"msg": "Multiple Guest CI's existing on this VM instance.  serial_number " + serial + ", Mac addresses: " + macs,
				"duplicateCis": duplicateCIs
			};

		// if any existing guestCi<->vmGr rel recs for grVm points to wrong guest
		// remove these relationships
		var instantiatedByRelationshipTypeId = g_disco_functions.findCIRelationshipType('cmdb_rel_type', 'Instantiates::Instantiated by');
		var gr = new GlideRecord('cmdb_rel_ci');
		gr.addQuery('child', vmGr.sys_id);
		gr.addQuery('type', instantiatedByRelationshipTypeId);
		gr.addQuery('parent', '!=', guestCiSysId);
		gr.deleteMultiple();

		// add guestCi<->vmGr rel recs if not present
		g_disco_functions.createRelationshipIfNotExists(guestCiSysId, vmGr.sys_id, 'Instantiates::Instantiated by');
		esx && g_disco_functions.createRelationshipIfNotExists(guestCiSysId, esx, 'Virtualized by::Virtualizes');

		_debug("_resolveVmGuest now reconciled to guest sys_id " + guestCiSysId);
		vmGr.guest_reconciled = true;
	} finally {
		_debug('END _resolveVmGuest');
	}
}
	
function tableTypeName(tableName) {
	return tableName == 'cmdb_ci_vmware_template' ? 'Template' : 'Instance';
}
	
function _debug_refresh() {
	debugLog = JSUtil.toBoolean(gs.getProperty("vmware_vm_correlator.debug", "false"));
}
	
function _debug(msg) {
	if (debugLog)
		gs.log("*** VmwareVmCorrelator *** " + msg);
}
	
})();