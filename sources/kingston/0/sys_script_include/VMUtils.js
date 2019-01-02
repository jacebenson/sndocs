var VMUtils;

(function() {

var morMap = { },
	uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i,
	correlationIdRegex = /^([0-9a-f]{2} ){7}[0-9a-f]{2}-[0-9a-f]{2}( [0-9a-f]{2}){7}$/i,
	spaceRegex = / /g,
	dashRegex = /-/g,
	hexByteRegex = /[0-9a-f]{2}/ig,
	morTypeToTable = {
		VirtualMachine: 'cmdb_ci_vmware_instance',
		Network: 'cmdb_ci_vmware_network',
		VmwareDistributedVirtualSwitch: 'cmdb_ci_vmware_dvs',
		DistributedVirtualPortgroup: 'cmdb_ci_network',
		HostSystem: 'cmdb_ci_esx_server',
		ClusterComputeResource: 'cmdb_ci_vcenter_cluster',
		ComputeResource: 'cmdb_ci_esx_server',
		VirtualApp: 'cmdb_ci_esx_resource_pool',
		ResourcePool: 'cmdb_ci_esx_resource_pool',
		Datastore: 'cmdb_ci_vcenter_datastore',
		Datacenter: 'cmdb_ci_vcenter_datacenter',
		StoragePod: 'cmdb_ci_vcenter_datastore',
		Folder: 'cmdb_ci_vcenter_folder'
	},
	copiedParms = [ 'debug', 'isTriggered','fixed_credential_id',
				   'priority', 'mid_selector_details',
				   'vcenter_sys_id', 'vcenter_uuid', 'datacenter_sys_id', 'datacenter_mor_id', 'full_discovery',
				   'ignoreCert', 'vcenter_port', 'avoid_id_engine', 'enable_cmp_qa' ];

VMUtils = {
	turnUuidToCorrelationId: turnUuidToCorrelationId,
	turnCorrelationIdToUuid: turnCorrelationIdToUuid,
	isChangeRequestRequired: isChangeRequestRequired,
	lookupSysIds: lookupSysIds,
	getRecForMor: getRecForMor,
	triggerNextPage: triggerNextPage,
	triggerProbes: triggerProbes
};

/**
 * Given a managed object reference (or any object of the same form) return the
 * GlideRecord for it.  Returns undefined if the record can't be found.
 */
function getRecForMor(mo, table, vCenterInstanceUuid) {
	table = table || morTypeToTable[mo.type];

	var gr = checkTable(table);
	if (!gr && (table == 'cmdb_ci_vmware_instance'))
		gr = checkTable('cmdb_ci_vmware_template');

	return gr;

	function checkTable(table) {
		var gr = new GlideRecord(table);
		gr.addQuery('instance_uuid', vCenterInstanceUuid);
		gr.addQuery('object_id', mo.val);
		gr.query();
		if (gr.getRowCount() == 1) {
			gr.next();
			return gr;
		}
	}
}

/**
 * Convert the UUID to a format that matches the original format in our system.  vCenter works with UUIDs
 * where the ESX Linux console worked with this format
 */
function turnUuidToCorrelationId(uuid) {

    // The format of the uuid returned from vCenter is fixed to match this reg exp, according
    // to the documentation, so it should match, but verify anyway and return an empty string 
    // if it doesn't match
	var verify = uuidRegex.exec(uuid);

    if (verify) {
        var stripped = uuid.replace(dashRegex, '');

        var match = hexByteRegex.exec(stripped);
        var id = '';

        while (match) {
            if (id.length > 0)
                id += ' ';
            id += match;
            match = hexByteRegex.exec(stripped);
        }

        // Based on the expected format, currently will always be in the same spot 
        return id.substr(0, 23) + '-' + id.substr(24);
    }

    return '';
};

/**
 * Turn a correlation ID into a UUID for a virtual machine in our system
 */
function turnCorrelationIdToUuid(correlation_id) {
    var verify = correlationIdRegex.exec(correlation_id);
    if (verify) {
        var collapsed = correlation_id.replace(spaceRegex, '');
        var uuid = collapsed.substr(0,8) + "-" + collapsed.substr(8,4) + "-" 
            + collapsed.substr(12,9) + "-" + collapsed.substr(21);
        return uuid;
    }

    return '';
};
	
	
function isChangeRequestRequired(action) {
	
};

/*
 * Given a list of MORs, look up their sys_ids.
 * @param mors: Array of MORs or a single MOR.
 * @param table: Table name to search
 * @param vcenter: sys_id of the vCenter that owns the objects
 * @param morColumn: Optional, defaults to 'object_id'.  Name of the MOR id column in 'table'.
 * @param morsResult: Optional, array to contain matching mor ids.
 * @return: an array or single sys_id depending on the type of the 'mors' parameter
 *
 * sys_ids will be cached, so invalid sys_ids could be returned for deleted records.
 */
function lookupSysIds(mors, table, vcenter, morColumn, morsResult) {
	
	var gr, returnOne,
		morsToLookup = [ ],
		sysIds = [ ],
		found = 0;

	morColumn = morColumn || 'object_id';
	morMap[table] = morMap[table] || { };

	if (typeof mors == 'string') {
		returnOne = true;
		mors = [ mors ];
	}

	// See which mors I haven't looked up yet
	mors.forEach(
		function(mor) {
			if (!morMap[table][mor.morid || mor])
				morsToLookup.push(mor.morid || mor);
		});

	// Look them up
	if (morsToLookup.length) {
		gr = new GlideRecord(table);
		gr.addQuery('vcenter_ref', vcenter);
		gr.addQuery(morColumn, 'IN', morsToLookup);
		gr.query();

		while (gr.next()) {
			found++;
			morMap[table][gr[morColumn]] = '' + gr.sys_id;
		}
	}

	mors.forEach(
		function(mor) {
			var sysId = morMap[table][mor.morid || mor];
			if (sysId)
				sysIds.push(sysId);
				if (morsResult)
					morsResult.push(mor.morid || mor);
		});

	return returnOne ? sysIds[0] : sysIds;
}

// Utility to trigger discovery of the next page of objects.  Used by
// vCenter sensors.
//////////////////////////////////////////////////////////////////////////
function triggerNextPage(_this, leftovers, additionalParms) {

	// If there's no next page then we don't have anything to do.
	if (!leftovers || !leftovers.length)
		return;

	var parms = { mor_ids: JSON.stringify(leftovers) };

	additionalParms = (additionalParms || [ ]).concat(copiedParms);
	additionalParms.forEach(copyParm);

	_this.triggerProbe(g_probe.getParameter('probe_name'), parms);

	function copyParm(name) {
		if (g_probe.getParameter(name))
			parms[name] = g_probe.getParameter(name);
	}
}

// Get parameters for the next probe to trigger
// _this {DiscoverySensor}     this object, required to call DiscoverySensor.triggerProbes.
// ids {Object}                MOR IDs of vCenter objects processed by the sensor.  Usually
//                             contains a single type of object, but will contain all object
//                             types when called by the datacenters sensor.
// parms {Object}              Optional parameters to pass.  Used by datacenters sensor.  Other
//                             sensors just copy parameters from the previous probe, but the
//                             previous probe doesn't have the required parameters for the
//                             datacenters sensor.
//////////////////////////////////////////////////////////////////////////
function triggerProbes(_this, ids, parms) {
	var name, objects,
		remaining = { };

	parms = parms || { };

	initForNextProbe();

	_this.triggerProbes(prepFn, parms, copiedParms);

	// Prepare to call the discovery_sensor_probe_conditional condition script.
	// Called repeatedly for each probe until it returns falsey.
	function prepFn(parms) {
		var numInGroup,
			data = { };

		// Prepare to be called for another probe type
		if (!Object.keys(remaining).length) {
			initForNextProbe();
			return;
		}

		// Chop off the correct number of items, based on the number of
		// parallel probes for each type of probe.
		for (name in remaining) {
			numInGroup = Math.ceil(objects[name].length/remaining[name]);
			data[name] = objects[name].splice(0, numInGroup);
			remaining[name]--;
			if (!objects[name].length || !remaining[name])
				delete remaining[name];
		}

		return data;
	}

	function initForNextProbe() {
		objects = { };

		for (name in ids) {
			objects[name] = [ ];

			// Copy the identifying information out of the objects that were passed in.
			ids[name].forEach(function(obj) { if (obj.morid) objects[name].push( { type: obj.type, morid: obj.morid }); else objects[name].push(obj); });
			// The number of parallel probes remaining to trigger
			remaining[name] = parseInt(_this.getParameter('parallel_' + name + '_probes')) || 1;
		}
	}
}


})();
