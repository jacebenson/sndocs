var StorageReconciler = Class.create();

StorageReconciler.prototype = {
    initialize: function() {},
		
	/**
	 * Searches the CMDB for the Storage Volume (LU - Logical Unit) that is exporting the specified
	 * network disk via Fibre Channel (SAN). The SAN target exports a volume to the host client. The host client
	 * (Windows, Linux) imports the volume as a SAN Disk (cmdb_ci_san_disk). Creates a relationship if match found.
	 *
	 * 
	 * @param cmdb_ci_fc_disk sys_id The disk on the Host machine that is importing the volume.
	 * @param array targetWWPNs The target world-wide-port-names to search for.
	 */	
	createFCDiskToVolumeRel: function(diskSysId, lun, targetWWPNs, initiatorWWPN) {
		// Find the fc export so we can find the volume
		var exportsGr = this.findFCExports(lun, targetWWPNs, initiatorWWPN);
						
		// Finally create the relationship
		return this._createDiskToVolumeRel(diskSysId, exportsGr);
	}, 
	
	/**
	 * Searches the CMDB for the Storage Volume (LU - Logical Unit) that is exporting the specified
	 * network disk via ISCSI (SAN). The ISCSI target exports a volume to the host client. The host client
	 * (Windows, Linux) imports the volume as a SAN Disk (cmdb_ci_iscsi_disk). Creates a relationship if match found.
	 *
	 * 
	 * @param cmdb_ci_iscsi_disk sys_id The disk on the Host machine that is importing the volume.
	 */		
	createISCSIDiskToVolumeRel: function(diskSysId, lun, targetIQN, initiatorIQN) {
		// Find the iscsi export so we can find the volume
		var exportsGr = this.findISCSIExports(targetIQN, lun, initiatorIQN);

		// Finally create the relationship			
		return this._createDiskToVolumeRel(diskSysId, exportsGr);
	},
	
	/**
	 * Find FC Exports based an array of targetWWPNs and lun
	 */
	findFCExports: function(lun, targetWWPNs, initiatorWWPNs) {
		// Find the controller
		var controllerSysIds = this._findControllers(targetWWPNs);
		if (controllerSysIds.length == 0) 
			throw 'Controller is empty for FC Port' + targetWWPNs.toString(); 
		
		// Find the fc exports
		var gr = new GlideRecord('cmdb_ci_fc_export');
		gr.addQuery('exported_by', controllerSysIds);
		
		// Just in case we don't have lun, maybe we get lucky and only one export otherwise we will create relationships with all, better than none.
		if (JSUtil.notNil(lun))
			gr.addQuery('lun', ""+ lun);

		if (initiatorWWPNs instanceof Array) {
			if (initiatorWWPNs.length == 1)
				gr.addQuery("initiator_wwpn", initiatorWWPNs[0]);
			else
				gr.addQuery("initiator_wwpn", 'IN', initiatorWWPNs);
		}
		else
			gr.addQuery("initiator_wwpn", initiatorWWPNs);

		gr.query();
		if (!gr.hasNext())
			throw "FC Export not found for targetWWPNs: " + targetWWPNs + " lun: " + lun + " controllerSysIds: " + controllerSysIds.toString() + " initiatorWWPN: " + JSON.stringify(initiatorWWPNs);
			
		return gr;
	}, 
	
	/**
	 * Find ISCSI Exports based on IQN and lun
	 */
	findISCSIExports: function(targetIQN, lun, initiatorIQN) {
		var gr = new GlideRecord('cmdb_ci_iscsi_export');
		gr.addQuery('iqn', targetIQN);
		
		// Just in case we don't have lun, maybe we get lucky and only one export
		if (lun || (lun === 0))
			gr.addQuery('lun', lun);			
		
		gr.addQuery('initiator_iqn', initiatorIQN);

		gr.query();
		if (!gr.hasNext())
			throw "ICSI Export not found for targetIQN: " + targetIQN + " lun: " + lun;
		
		return gr;
	},
	
	queryFcPorts: function(wwpns) {
		// query for Fibre Channel Ports that match wwpns
		var gr = new GlideRecord('cmdb_ci_fc_port');
		gr.addQuery('wwpn', wwpns);
		gr.query();
		return gr;
	},
	
	/**
	 * Get volume sys id from storage exports
	 */	
	getVolumesFromExports: function(exportsGr) {
		var seenVolumes = {};

		while (exportsGr.next()) {
			// Make sure we have not seen same volume just in case
			var volumeSysId = ''+exportsGr.storage.sys_id;
			if (!seenVolumes[volumeSysId]) 
				seenVolumes[volumeSysId] = true;	
		}
		
		return seenVolumes;
	},

	/**
	 * Find controller sysIds from an array of targetWWPNs.
	 */ 
	_findControllers: function(targetWWPNs) {
		var portsGr = this.queryFcPorts(targetWWPNs);
		var controllerSysIds = []; 
		var portSysIds = [];

		// Get all port sysIds
		while (portsGr.next()) 
				portSysIds.push('' + portsGr.sys_id);
		
		
		// Get controllers from cmdb_rel_ci
		var df = new DiscoveryFunctions();
		var typeId = df.findCIRelationshipType("cmdb_rel_type", "Controller for::Controlled by");
		var rels = new GlideRecord("cmdb_rel_ci");
		rels.addQuery("child", portSysIds);
		rels.addQuery("type", typeId + '');		
		rels.query();
		
		while (rels.next()) {
			controllerSysIds.push('' + rels.parent);
		}
		
		return controllerSysIds;
	},

	/**
	 * Create a cmdb_rel_ci relationship between disk sys_id and volume with all values in exportsGr.
	 */
	_createDiskToVolumeRel: function(diskSysId, exportsGr) {
		// Get volumes and create relationship
		var seenVolumes = this.getVolumesFromExports(exportsGr);
		var df = new DiscoveryFunctions();
		for (var volumeSysId in seenVolumes) {
			df.createRelationshipIfNotExists(volumeSysId, diskSysId, 'Exports to::Imports from');
		}

		return seenVolumes;
	},	

    type: 'StorageReconciler'
};