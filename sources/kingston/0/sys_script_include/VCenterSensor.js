// Discovery & Runbook

ArrayPolyfill;
FunctionPolyfill;

var VCenterSensor;

(function() {

var vCenterId, _this, multipathInfo,
	locationID,
	vCenterHosts = [ ],
	datastoreDisks = { },
	nodeMap = { };

// We sometimes ask for the same XML node inside a loop.
// selectSingleNode() can be very slow.  This function exists to cache
// the result so we can avoid the call.
//
// The pattern varies somewhat, but we'll do
//   1. getChildByTagName(vCenter, name) (sometimes)
//   2. selectSingleNode(previousNode, selector)
//   3. getChildByTagName(previousNode, child) (sometimes)
//
// Nodes are cached based on name but not rootNode.  This
// function should always be called with the root vCenter node.
function getSingleNode(rootNode, name, selector, child) {
	var map = nodeMap[name] = nodeMap[name] || { };
	if (!map[selector]) {

		// Step 1 from above, if requested
		if (name)
			rootNode = XMLUtil.getChildByTagName(rootNode, name);

		// Step 2 from above.
		map[selector] = { node: rootNode ? XMLUtil.selectSingleNode(rootNode, selector) : null };
	}

	map = map[selector];

	// If we haven't asked for a child or if we didn't find a node
	// we're done.
	if (!child || !map.node)
		return map.node;

	// Step 3, if requested
	if (!map.hasOwnProperty(child))
		map[child] = XMLUtil.getChildByTagName(map.node, child);

	return map[child];
}

VCenterSensor = {

    CONVERT_TO_GIGA: 1073741824,  // (1024^3)
    CONVERT_TO_MEGA: 1048576,     // (1024^2)

    process: function(result) {
		_this = this;

		locationID = this.getLocationID();

		this.root = g_probe.getDocument().getDocumentElement();
		this.statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

        this.processedHosts = {};
        this.processedVMs = {};
		this.processedTemplates = {};
        this.processedNetworks = {};
        this.processedDatastores = {};
        this.processedClusters = {};
        this.processedFolders = {};
        this.processedDatacenters = {};
        this.processedResourcePools = {};
        this.processedItems = {};

        this.processvCenter();

        this.processDatacenters();
        this.processFolders();
        this.processClusters();
        this.processHosts();
        this.processDatastores();
		this.processDatastoreHostMounts();
        this.processVirtualMachines();
        this.processResourcePools();
        this.processNetworks();
        this.processHostDisks();
        this.processNetworkHostRel();
        this.processDatastoreVmRel();
        this.processHostVmRel();
        this.processNetworkVmRel();
        this.processDatacenterVmRel();
        this.processDatastoreHostRel();
        this.processClusterHostRel();
        this.processResourcePoolClusterRel();
        this.processResourcePoolHostRel();
        this.processFolderRel();
        this.processDatacenterNetworkRel();
        this.processDatacenterHostRel();
        this.processDatacenterDatastoreRel();
        this.processDatacentervCenterRel();

        this.cleanupResourcePools();
    },
	

    processvCenter: function() {
		var vcGr;

		this.vCenter = XMLUtil.selectSingleNode(this.root, '//vCenter');
        if (!this.vCenter)
            return;
		
		if(current) {
			current.url = this.getXmlAttribute(this.vCenter, 'url');
			current.fullname = this.getXmlAttribute(this.vCenter, 'content.about.fullName');
			current.api_version = this.getXmlAttribute(this.vCenter, 'content.about.apiVersion');
			current.instance_uuid = this.getXmlAttribute(this.vCenter, 'content.about.instanceUuid');
		}
		
		vCenterId = current.instance_uuid;

		// Check for the vCenter CI
		var ip = g_probe.getSource();
		var thisCmdbRecord = this.getCmdbRecord();

		if(!thisCmdbRecord) {
			//We got here via port probe; we don't have a CI.  Let's find one or make one
			vcGr = new GlideRecord('cmdb_ci_vcenter');
			vcGr.addQuery('instance_uuid', current.instance_uuid);
			vcGr.query();
			if (!vcGr.next()) {
				//There's no existing vcenter record for this uuid... check ip address
				vcGr.initialize();
				vcGr.addQuery('ip_address', ip);
				vcGr.query();
				
				if(!vcGr.next()) {
					vcGr.initialize();
					vcGr.ip_address = g_probe.getSource();
					vcGr.instance_uuid = current.instance_uuid;
					vcGr.name = "vCenter@"+ip;
					vcGr.insert();
				}
			}
			
			//vcGr now points to the vcenter record corresponding to this uuid
			if (JSUtil.notNil(g_device))
				g_device.setCISysID(vcGr.getUniqueValue());
		}
		else {
			//We got here via process classifier; make sure we don't have a duplicate vcenter CI 
			// from a previous port-probe disco, or a manually entered one
			vcGr = new GlideRecord('cmdb_ci_vcenter');
			var qc = vcGr.addQuery('instance_uuid', current.instance_uuid);
			qc.addOrCondition('ip_address', ip);
			vcGr.query();
			while(vcGr.next()) {
				if(vcGr.sys_id != thisCmdbRecord.sys_id)
					vcGr.deleteRecord();
			}
			
		}
	},

    processDatacenters: function() {
        var dataMap = {'name' : 'name', 
                       'morid' : 'morid',
					   'vmFolder' : 'folder_morid',
					   'hostFolder' : 'host_morid'};

        this.handleObjectType('datacenters', 
                              'cmdb_ci_vcenter_datacenter',
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              null,
                              this.processedDatacenters);
    },

    processFolders: function() {
        var dataMap = {'name':'name', 
                       'morid':'morid'};
        this.handleObjectType('folders', 
                              'cmdb_ci_vcenter_folder', 
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              this.processExtraFolderFields,
                              this.processedFolders);
    },

    processClusters: function() {
        var dataMap = {'name' : 'name', 
                       'summary.effectiveCpu' : 'effectivecpu',
                       'summary.effectiveMemory' : 'effectivememory',
                       'summary.numEffectiveHosts' : 'effectivehosts',
                       'summary.numHosts' : 'numhosts',
                       'summary.totalCpu' : 'totalcpu',
                       'summary.totalMemory' : 'totalmemory',
					   'summary.numCpuCores' : 'numcpucores',
					   'summary.numCpuThreads' : 'numcputhreads',					   
                       'morid':'morid'};
        this.handleObjectType('clusters',
                              'cmdb_ci_vcenter_cluster', 
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              null,
                              this.processedClusters);
    },

    processHosts: function() {
        var dataMap = {'summary.hardware.uuid' : 'correlation_id',
                       'morid':'morid'};
        this.handleCIObjectType('hostSystems',
                                'cmdb_ci_esx_server',
                                dataMap,
                                this.processExtraHostFields,
                                this.processedHosts);
    },

    processDatastores: function() {
        var dataMap = {'summary.name' : 'name', 
                       'summary.accessible' : 'accessible',
                       'summary.type' : 'type',
                       'summary.url' : 'url',
                       'morid' : 'morid'};
        this.handleObjectType('dataStores', 
                              'cmdb_ci_vcenter_datastore',
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              this.processExtraDatastoreFields,
                              this.processedDatastores);
    },
		
	processDatastoreHostMounts: function() {
        var dataMap = {'mountInfo.accessMode' : 'access_mode',
					   'mountInfo.accessible' : 'accessible'};

        this.handleHostMounts('datastoreHostMounts',
            'vcenter_datastore_hostmount',
            dataMap,
            ['datastore', 'esx_server'],
            null);
    },

    processVirtualMachines: function() {
        var dataMap = {'name' : 'name', 
                       'config.files.vmPathName' : 'image_path',
                       'config.hardware.numCPU' : 'cpus',
                       'config.hardware.memoryMB' : 'memory',
                       'config.template' : 'template',
					   'config.guestId' : 'guest_id',
					   'config.instanceUuid': 'vm_instance_uuid',
                       'morid' : 'object_id'};

        this.handleVMs('virtualMachines', 
                       dataMap,
                       this.processExtraVirtualMachineFields);
    },

    processResourcePools: function() {
        var dataMap = {'config.cpuAllocation.expandableReservation' : 'cpu_expandable', 
                       'config.cpuAllocation.limit' : 'cpu_limit_mhz',
                       'config.cpuAllocation.reservation' : 'cpu_reserved_mhz',
                       'config.cpuAllocation.shares.shares' : 'cpu_shares',
                       'config.memoryAllocation.expandableReservation' : 'mem_expandable',
                       'config.memoryAllocation.limit' : 'mem_limit_mb',
                       'config.memoryAllocation.reservation' : 'mem_reserved_mb',
                       'config.memoryAllocation.shares.shares' : 'mem_shares',
                       'name' : 'name',
                       'owner' : 'owner',
                       'owner_morid' : 'owner_morid',
                       'morid' : 'morid'};
        this.handleObjectType('resourcePools', 
                              'cmdb_ci_esx_resource_pool', 
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              this.processExtraResourePoolFields,
                              this.processedResourcePools);
    },

    processNetworks: function() {
        var dataMap = {'name' : 'name',
                       'summary.accessible' : 'accessible',
                       'morid' : 'morid'};
        this.handleObjectType('networks', 
                              'cmdb_ci_vcenter_network',
                              dataMap,
                              ['morid', 'vcenter_uuid'],
                              null,
                              this.processedNetworks);
    },

	processHostDisks: function() {

		// Storage info may be disabled by a probe parameter
		if (!multipathInfo)
			return;

		var sysId,
			empty_lun,
			_this = this,
			scsiLuns = { },
			hbas = { },
			hbaRecs = { },
			initiators = { },
			diskCorrelation = [ 'device_id' ],
			iScsiCorrelation = [ 'name', 'initiator_iqn' ],
			fcCorrelation = [ 'device_id'],
			hbaCorrelation = [ 'device_id', 'computer' ],
			portCorrelation = [ 'wwpn' ],
			createPnic = createNic.bind(0, false),
			createVnic = createNic.bind(0, true), 
			storageReconciler = new StorageReconciler();
		
		// Map LUN ID to iSCSI initiator(s) across all hosts
		vCenterHosts.forEach(function(host) { sysId = host.gr && host.gr.sys_id; host.mpi.HostBusAdapter.forEach(createHba); });
		vCenterHosts.forEach(function(host) { host.mpi.MultipathInfo.Lun.forEach(mapLun); });
		// Now find which initiator is the correct one
		findInitiatorToStorage();

		vCenterHosts.forEach(function(host) {

			var mpi = host.mpi,
				network = mpi.Network,
				pnic = network.Pnic || [],
				vnic = network.Vnic || [],
				cnic = network.ConsoleVnic || [];

			sysId = host.gr && host.gr.sys_id;

			// First, map scsi luns so we can get capacity & canonical name
			mpi.ScsiLun.forEach(function(scsiLun) { scsiLuns[scsiLun.Uuid] = scsiLun; });

			// Map HBAs so we can get iqn, wwn, port & target info
			mpi.HostBusAdapter.forEach(createHba);

			pnic.forEach(createPnic);
			vnic.forEach(createVnic);
			cnic.forEach(createVnic);

			// Now walk the multipath info & pull out the info we want
			host.mpi.MultipathInfo.Lun.forEach(function(lun) {
				var transport, adapter, hba, table, iqn, wwnn, wwpn, rec, mm,
					paths = lun.Path,
					scsiLun = scsiLuns[lun.Id],
					capacity = scsiLun && scsiLun.Capacity,
					wwInfo = {},
					isFc = false,
					correlation = diskCorrelation;
					table = 'cmdb_ci_disk';

				// The vSphere API uses one of two object types to represent a SCSI logical unit, depending on the device type.
				// * Disks containing file system volumes or parts of volumes for hosts or raw disks for virtual machines.
				//   To represent disks, the ESX Server creates a HostScsiDisk object, which inherits properties from the ScsiLun base class.
				// * Other SCSI devices, for example SCSI passthrough devices for virtual machines. To represent one of these devices,
				//   the ESX Server creates a ScsiLun object.
				// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.host.ScsiLun.html
				if (!capacity || !capacity.BlockSize)            // Capacity is on HostScsiDisk, meaning the device isn't a SCSI passthrough device.
					return;

				mm = MakeAndModel.fromNames(scsiLun.Vendor, scsiLun.Model);

				capacity = capacity.Block * capacity.BlockSize;
				if (paths && paths[0]) {

					rec = {
						computer: sysId,
						size_bytes: capacity,
						device_id: scsiLun.CanonicalName,
						device_lun: lun.Lun,
						name: scsiLun.DisplayName || scsiLun.CanonicalName,
						model_id: mm.getModelNameSysID(),
						vendor: mm.getManufacturerSysID()
					};

					paths.forEach(function(path) {
						if (!path) return;                // Just in case...

						transport = path.Transport;
						adapter = path.Adapter;
						hba = hbas[adapter];
						iqn = transport.IScsiName;
						wwnn = transport.NodeWorldWideName;

						if (iqn)
							prepareIScsiDisk();
						else if (wwnn) {
							// Collect wwnn and wwpn for existing paths
							wwnn = new StorageWWN(wwnn).toString();
							wwpn = new StorageWWN(transport.PortWorldWideName).toString();
							if (wwInfo[wwnn] == undefined)
								wwInfo[wwnn] = {};
							wwInfo[wwnn][wwpn] = wwpn;
							isFc = true; 
							
						}
						else {
							rec.storage_type = 'Disk';
							rec.device_interface = 'SCSI';
						}
					});
					
					// If there are FC storages, prepare corresponding information 
					if (isFc)
						prepareFcDisk();

					_this.writeObjectToCMDB(table, rec, _this.isUpdate(table, rec, correlation));
					
					// Add the disk to volume relationship and add target info for FC
					// Currently the lun comes in a different format for vCenter, so we are going to pass in blank until we can figure out getting right lun
					if (isFc) {
						// Get allWWPNs has to be before reconciling target info since reconcile deletes from the wwInfo object
						var targetWWPNs = getAllWWPNs();
						reconcileTargetInfo();
						
						var initWWPN = StorageWWN.parse(hba.PortWorldWideName);
						var initWWNN = StorageWWN.parse(hba.NodeWorldWideName);
						reconcileInitiatorInfo();
						
						try {
							storageReconciler.createFCDiskToVolumeRel(rec.sys_id, empty_lun, targetWWPNs, initWWPN);
						} catch (e) {
							// This exception is possible since the storage side could be not yet discovered
						}
					}
					else if (iqn) {
						
						try {
							storageReconciler.createISCSIDiskToVolumeRel(rec.sys_id, empty_lun, rec.iqn, initiators[lun.Id] || rec.initiator_iqn);
						} catch (e) {
							// This exception is possible since the storage side could be not yet discovered
						}
					}
					
					_this.createDatastoreDisk(rec, scsiLun.CanonicalName);

				} else
					DiscoveryLogger.warn('No path to disk' + scsiLun.DisplayName, 'VCenterSensor', _this.getEccQueueId());

				function prepareIScsiDisk() {
					var target;

					table = 'cmdb_ci_iscsi_disk';
					rec.iqn = iqn;
					rec.device_lun = lun.Lun;                    // Documented as 'SCSI device corresponding to logical unit. '
					rec.device_interface = 'iSCSI';
					rec.storage_type = 'Network';
					if (hba) {
						rec.initiator_iqn = hba.IScsiName;
						target = hba.ConfiguredStaticTarget;
						target = target && target[0];
						rec.target_ip = target && target.Address;
					}
					correlation = iScsiCorrelation;
				}
				
				// Get all WWPNs generated from the wwInfo object in form of an array
				function getAllWWPNs() {
					var wwpns = [];
					
					for (var nName in wwInfo) {
						var curInfo = wwInfo[nName];
						for (var pName in curInfo) {
							wwpns.push(pName);
						}
					}
					
					return wwpns;
				}
				
				// Populate wwnn and wwpn for the paths from this server to FC disks in cmdb_fc_initiator table 
				function reconcileInitiatorInfo() {
					var gr = new GlideRecord('cmdb_fc_initiator');
					gr.addQuery('fc_disk', rec.sys_id);
					gr.query();
					
					if (gr.next()) {
						gr.wwnn = initWWNN;
						gr.wwpn = initWWPN;
						gr.update(); // no op if nothing changes
					}
					else {
						gr.initialize();
						gr.fc_disk = rec.sys_id;
						gr.wwnn = initWWNN;
						gr.wwpn = initWWPN;
						gr.insert();
					}	
				}
				
				// Populate wwnn and wwpn for the paths from this server to FC disks in cmdb_fc_target table
				function reconcileTargetInfo() {
					var gr = new GlideRecord('cmdb_fc_target');
					gr.addQuery('fc_disk', rec.sys_id);
					gr.query();
					
					// Go through what's in the db and reconcile it with what we found
					while (gr.next()) {
						if (wwInfo[gr.wwnn] && wwInfo[gr.wwnn][gr.wwpn])
							delete wwInfo[gr.wwnn][gr.wwpn];
						else
							gr.deleteRecord();
					}

					// Insert whats left over
					for (var nName in wwInfo) {
						var curInfo = wwInfo[nName];
						for (var pName in curInfo) {
							gr.initialize();
							gr.fc_disk = rec.sys_id;
							gr.wwnn = nName;
							gr.wwpn = pName;
							gr.insert();
						}
					}
				}
				
				// This will get called multiple times for the same disk - once for each path to the disk.
				// We only need to find the wwnn and provider_by once
				function prepareFcDisk() {
					table = 'cmdb_ci_fc_disk';
					rec.device_interface = 'Fibre Channel';
					rec.storage_type = 'Network';
					rec.provided_by = '';
					correlation = fcCorrelation;
				}

				function findProvider(wwn) {
					return _this.findSysId('cmdb_ci_storage_controller', { wwnn: wwn }, ['wwnn']);
				}
			});
		});

		function createHba(hba) {
			var hostWwnn, hostWwpn, hbaRec, portRec, mm,
				key = hba.Key;

			// We only want to create an HBA record for FC, but we still need to map it for iScsi
			if (!hba.NodeWorldWideName) {
				hbas[key] = hba;
				return;
			}

			hostWwnn = new StorageWWN(hba.NodeWorldWideName).toString();
			hostWwpn = new StorageWWN(hba.PortWorldWideName).toString();

			// 1. Make sure we have an HBA
			// VMWare's HBA data structure only allows for a single port.  Avoid doing anything if they're
			// passing in the same HBA for multiple ports
			if (!hbas[key]) {
				hbas[key] = hba;

				mm = MakeAndModel.fromNames(null, hba.Model);
				hbaRec = {
					name: hba.Device,
					device_id: hba.Device,
					wwnn: hostWwnn,
					computer: sysId,
					model_id: mm.getModelNameSysID()
				};
				_this.writeObjectToCMDB('cmdb_ci_storage_hba', hbaRec, _this.isUpdate('cmdb_ci_storage_hba', hbaRec, hbaCorrelation));

				hbaRecs[key] = hbaRec;
			}

			hbaRec = hbaRecs[key];

			// 2. find/create the port
			portRec = {
				name: 'FC Port ' + hostWwpn,
				wwpn: hostWwpn,
				wwnn: hostWwnn,
				speed: new DiscoveryDataRate(hba.Speed, DiscoveryDataRate.Units.GBps).to(DiscoveryDataRate.Units.GFC) + ' GFC',
				computer: sysId,
				controller: hbaRec.gr.sys_id
			};

			_this.writeObjectToCMDB('cmdb_ci_fc_port', portRec, _this.isUpdate('cmdb_ci_fc_port', portRec, portCorrelation));
		}

		// lun.Id uniquely identifies a disk across all ESX hosts being managed by this vCenter.  For shared
		// iSCSI disks, only one ESX has a connection to the storage server, so that's the only initiator IQN
		// the storage server knows about.  This function creates a mapping from lun IDs to objects containing
		// the target IQN and all initiator IQNs.
		function mapLun(lun) {
			var adapter,
				path = lun.Path,
				id = lun.Id;

			path = path && path[0];
			adapter = path && hbas[path.Adapter];
			if (adapter) {
				var target = path.Transport.IScsiName;
				if (target) {
					if (!initiators[id])
						initiators[id] = { target_iqn: target, init_iqn: [ ] };
					initiators[id].init_iqn.push(adapter.IScsiName);
				}
			}
		}

		// Use the object created by mapLun() to search for an iSCSI export that corresponds to each
		// of our initiator IQNs.
		function findInitiatorToStorage() {
			var name, iqns, initiator, gr;

			for (name in initiators) {
				iqns = initiators[name];
				initiator = iqns.init_iqn;
				if (initiator.length == 1)
					initiators[name] = initiator[0];        // Only one IQN - just use it
				else {

					// Search for the export that knows about any of my initiators
					gr = new GlideRecord('cmdb_ci_iscsi_export');
					gr.addQuery('iqn', iqns.target_iqn);

					// Just in case we don't have lun, maybe we get lucky and only one export
					if (iqns.lun || (iqns.lun === 0))
						gr.addQuery('lun', iqns.lun);

					gr.addQuery('initiator_iqn', 'IN', initiator);

					gr.query();
					if (gr.next())
						initiators[name] = gr.initiator_iqn;
					else
						initiators[name] = '';
				}
			}
		}

		function createNic(virtual, nic) {

			var spec = nic.Spec,
				ip = spec && spec.Ip,
				dhcp = ip && ip.Dhcp,
				nicRec = {
					name: nic.Device,
					mac_address: nic.Mac || (spec && spec.Mac),  // Ugh. Data is different for virtual vs. physical
					ip_address: ip && ip.IpAddress,
					netmask: ip && ip.SubnetMask,
					cmdb_ci: sysId,
					virtual: virtual,
					status: 1
				};

			dhcp = (!dhcp || (dhcp == 'false')) ? 0 : 1;
			nicRec.dhcp_enabled = dhcp;

			_this.writeObjectToCMDB('cmdb_ci_network_adapter', nicRec, _this.isUpdate('cmdb_ci_network_adapter', nicRec, [ 'name', 'mac_address' ]));
		}
	},
	
	// Given a disk (a host mount), create a cmdb_ci_datastore_disk and create a relationships
	// for datastore::datastore_disk and datastore_disk::disk
	createDatastoreDisk: function(disk, canonicalName) {
			var rec,                          // holds the record for the datastore_disk table
				ds = datastoreDisks[canonicalName],
				dsId = ds && ds.gr && ds.gr.sys_id,
				table = 'cmdb_ci_vcenter_datastore_disk';

		if (dsId) {          // We won't have a datastore for disks that aren't being used by any datastore
			rec = {
				vcenter_uuid: vCenterId,
				name: canonicalName,
				datastore: dsId,
				size_bytes: disk.size_bytes
			};

			this.writeObjectToCMDB(table, rec, this.isUpdate(table, rec, [ 'name', 'vcenter_uuid' ]));

			g_disco_functions.createRelationshipIfNotExists(rec.sys_id, disk.gr.sys_id, 'Exports to::Imports from');
			g_disco_functions.createRelationshipIfNotExists(dsId, rec.sys_id, 'Provided by::Provides');
		}
	},

    processExtraHostFields: function(object, objectData, ciDataObject, thisObj) {
        var hn = new HostnameJS();
        objectData.name = hn.format(thisObj.getXmlAttribute(object, 'name'));

        var dname = hn.getDomainName();
        if (JSUtil.notNil(dname))
            objectData.dns_domain = dname;

        objectData.os = 'ESX';

        var mm = MakeAndModel.fromNames(thisObj.getXmlAttribute(object, 'summary.hardware.vendor'),
                                        thisObj.getXmlAttribute(object, 'summary.hardware.model'));
        objectData.manufacturer      = '' + mm.getManufacturerSysID();
        objectData.model_id          = '' + mm.getModelNameSysID();

        objectData.sys_class_name    = 'cmdb_ci_esx_server';
		objectData.ram               = parseInt(parseInt(thisObj.getXmlAttribute(object, 'summary.hardware.memorySize'), 10) / thisObj.CONVERT_TO_MEGA, 10);
        objectData.cpu_count         = parseInt(thisObj.getXmlAttribute(object, 'summary.hardware.numCpuPkgs'), 10);
		objectData.cpu_core_count    = parseInt(parseInt(thisObj.getXmlAttribute(object, 'summary.hardware.numCpuCores'), 10) / objectData.cpu_count, 10);
        objectData.cpu_speed         = parseInt(thisObj.getXmlAttribute(object, 'summary.hardware.cpuMhz'), 10);
        objectData.cpu_type          = thisObj.getXmlAttribute(object, 'summary.hardware.cpuModel');

		mm = MakeAndModel.fromNames(thisObj.getXmlAttribute(object, 'hardware.cpuPkg.vendor'), null);
		objectData.cpu_manufacturer  = '' + mm.getManufacturerSysID();
        
        objectData.ip_address        = ''+thisObj.getXmlAttribute(object, 'ip'); 

        // Get disk space from datastore relationships
		var datastores = getSingleNode(thisObj.vCenter, 'datastoreHostRels', 'host[@hostMORid=\'' + objectData.morid + '\']', 'datastores');
        if (datastores) {
            var capacity = 0;
            for (var i = 0; i < datastores.length; i++) {
                var ds = datastores.item(i);
                var id = thisObj.getXmlAttribute(ds, 'datastoreMORid');
				var datastore = getSingleNode(thisObj.vCenter, 'dataStores', 'dataStore[@morid=\'' + id + '\']');
                capacity += parseInt(thisObj.getXmlAttribute(datastore, 'summary.capacity'), 10);
            }

            objectData.disk_space = parseInt(capacity / thisObj.CONVERT_TO_GIGA, 10);
        } else
            objectData.disk_space = 0;
		
		// Is the host in maintenance mode?
		objectData.install_status = "" + thisObj.getXmlAttribute(object, 'runtime.inMaintenanceMode') == 'true' ? '3' : '1'; // Maintenance = 3, Installed = 1

		mpi = thisObj.getXmlAttribute(object, 'mpi');
		if (mpi) {
			multipathInfo = true;
			objectData.mpi = new JSON().decode(mpi);
		}

		addOsAndSerialNumber(new JSON().decode(thisObj.getXmlAttribute(object, 'sn')));
		
		var cmdbobj = thisObj.getCmdbRecord();
        objectData.vcenter_ref = cmdbobj ? cmdbobj.sys_id : '';

		vCenterHosts.push(objectData);

        return true;

		// Add OS, serial number & asset tag to the host record
		function addOsAndSerialNumber(sn) {
			var glideName,
				hardware = sn.Hardware,
				si = hardware && hardware.SystemInfo,
				oi = si && si.OtherIdentifyingInfo,
				config = sn.Config,
				product = config && config.Product,
				version = product && product.FullName;

			if (version)
				objectData.os_version = version;

			if (oi) {
				oi.forEach(function(id) {
					var val = id.IdentifierValue,
						key = id.IdentifierType;

					if (val && key && (key.Key == 'ServiceTag'))
						current.serial_number = objectData.serial_number = val;
				});
			}
		}
    },
    
    processExtraDatastoreFields: function(object, objectData, thisObj) {
        var capacity = parseInt(thisObj.getXmlAttribute(object, 'summary.capacity'), 10);
        var freespace = parseInt(thisObj.getXmlAttribute(object, 'summary.freeSpace'), 10);
        objectData.freespace = parseInt(freespace / thisObj.CONVERT_TO_GIGA, 10);
        objectData.capacity = parseInt(capacity / thisObj.CONVERT_TO_GIGA, 10);
		objectData.thin_provisioning_supported = thisObj.getXmlAttribute(object, 'capability.perFileThinProvisioningSupported') == 'true';

		var disks = XMLUtil.getChildByTagName(object, 'datastoreDisks');

		// Datastores don't have to have disks
		if (disks) {
			for (var i = 0; i < disks.length; i++) {
				var disk = disks.item(i),
					diskName = thisObj.getXmlAttribute(disk, 'name');
				datastoreDisks[diskName] = objectData;
			}
		}
        return true;
    },

    processExtraVirtualMachineFields: function(object, objectData, thisObj) {
        objectData.bios_uuid = '' + thisObj.getXmlAttribute(object, 'config.uuid');
        objectData.state = thisObj.powerState('' + thisObj.getXmlAttribute(object, 'runtime.powerState'));
		
		//populate VMware Instance model
		var vmmodel = new GlideRecord('cmdb_model');
		if (vmmodel.get('name', 'VMware Instance'))
        	objectData.model_id = vmmodel.sys_id;
		
        var virtualDisks = XMLUtil.getChildByTagName(object, 'virtualDisks');

        if (virtualDisks) {
            objectData.disks = virtualDisks ? virtualDisks.length : 0;

            var diskCapacityKB = 0;
            for (var n = 0; n < virtualDisks.length; n++) {
                var virtualDisk = virtualDisks.item(n);
                diskCapacityKB += parseInt(thisObj.getXmlAttribute(virtualDisk, 'capacityInKB'), 10); // base 10
            }

            objectData.disks_size = (diskCapacityKB / 1048576) | 0; // Convert to GB from KB - 1048576 = 1024 * 1024, make sure it's an integer
            virtualDisks = null;
        } else {
            objectData.disks = 0;
            objectData.disks_size = 0;
        } 

		// We could also process MAC addresses here and get the number of NICs.  However, we need the MACs in
		// handleVms() and there's no good way to return them.  So I'm just processing MACs in handleVms() and
		// setting objectData.nics there.

        return true;
    },

    processExtraFolderFields: function(object, objectData, thisObj) {				
        return (thisObj.processFullPath(object, objectData, thisObj)) && (thisObj.processFolderTypes(object, objectData, thisObj)); 					
    },
		
	processFolderTypes: function(object, objectData, thisObj) {
		var parent = thisObj.getXmlAttribute(object, 'parent');
        var foldername = '' + thisObj.getXmlAttribute(object, 'name');

        if (!parent || (parent.indexOf('datacenter') === 0 && thisObj.ignoreFolder(foldername)))
            return false;
		
		// set folder child type
		var folderTypes = XMLUtil.getChildByTagName(object, 'folderTypes');
		if (folderTypes) {
			objectData.folderTypes = [];
			
			for (var n = 0; n < folderTypes.length; n++) {
				var folderType = folderTypes.item(n);
				var childType = thisObj.getXmlAttribute(folderType, 'childType');
				objectData.folderTypes.push(childType);				
			}
		}
				
		return true; 	
		
	},

    processExtraResourePoolFields: function(object, objectData, thisObj) {
        return thisObj.processFullPath(object, objectData, thisObj);
    },

    processFullPath: function(object, objectData, thisObj) {
        var parent = thisObj.getXmlAttribute(object, 'parent');
        var foldername = '' + thisObj.getXmlAttribute(object, 'name');

        if (!parent || (parent.indexOf('datacenter') === 0 && thisObj.ignoreFolder(foldername)))
            return false;

        var fullPath = foldername;
        var typeMap = {'group' : 'folder', 'datacenter' : 'datacenter', 'domain' : 'cluster', 'resgroup' : 'resourcePool'};
        var node = null;
        var typeFound = false;

        while (JSUtil.notNil(parent)) {
            typeFound = false;
            for (var name in typeMap) {
                if (parent.indexOf(name) === 0) {
					node = getSingleNode(thisObj.vCenter, 0, typeMap[name] + 's/' + typeMap[name] + '[@morid=\'' + parent + '\']');
                    parent = '' + thisObj.getXmlAttribute(node, 'parent');
                    var currentname = '' + thisObj.getXmlAttribute(node, 'name');
                    if (!thisObj.ignoreFolder(currentname))
                        fullPath = currentname + ' | ' + fullPath;
                    typeFound = true;
                    break;
                }
            }

            if (!typeFound)
                break;
        }

        objectData.fullpath = fullPath;        

        return true;
    },

    processDatastoreVmRel: function() {
        var staleVms,
			_this = this,
			staleGuests = { },
			staleCount = 0;

		staleVms = this.processObjVmRel('datastoreVmRels', 'datastore', 'vm', this.processedDatastores,
							 this.processedVMs, 'Provides storage for::Stored on', false, 'cmdb_ci_vcenter_datastore', 'cmdb_ci_vmware_instance');

		// If any stale VMs have guests, mark them stale too.
		CloudCIReconciler.updateVmwareGuestStaleness(staleVms);
    },

    processHostVmRel: function() {
		this.processObjVmRel('hostVmRels', 'host', 'vm', this.processedHosts, this.processedVMs,
										'Registered on::Has registered', true, 'cmdb_ci_vmware_instance', 'cmdb_ci_esx_server');
    },

    processNetworkVmRel: function() {
		this.processObjVmRel('networkVmRels', 'vm', 'network', this.processedVMs,
							 this.processedNetworks, 'Connected by::Connects', false, 'cmdb_ci_vmware_instance', 'cmdb_ci_vcenter_network');
    },

    processDatacenterVmRel: function() {
		this.processObjVmRel('datacenterVmRels', 'datacenter', 'vm', this.processedDatacenters,
						this.processedItems, 'Contains::Contained by', false, 'cmdb_ci_vcenter_datacenter','cmdb_ci_vmware_instance');
	},

	processObjVmRel: function(xmlRelName, type1, type2, parents, children, relationship, flipRels, parentTable, childTable) {

		var _this = this,
			stale = writeRels();

		if (parents == this.processedVMs)
			parents = this.processedTemplates;
		if (children == this.processedVMs)
			children = this.processedTemplates;
		if (parentTable == 'cmdb_ci_vmware_instance')
			parentTable = 'cmdb_ci_vmware_template';
		if (childTable == 'cmdb_ci_vmware_instance')
			childTable = 'cmdb_ci_vmware_template';

		writeRels();

		return stale;

		function writeRels() {
			var rels = _this.processRels(xmlRelName, type1, type2);

			return _this.writeRelationshipToCMDB(rels, parents, children,
												relationship, flipRels, parentTable, childTable);
		}
	},

    processNetworkHostRel: function() {
        var rels = this.processRels('networkHostRels', 'network', 'host');

		this.writeRelationshipToCMDB(rels,
                                     this.processedNetworks,
                                     this.processedHosts,
                                     'Provided By::Provides',
                                     false,
									 'cmdb_ci_vcenter_network',
									 'cmdb_ci_esx_server');
    },

    processDatastoreHostRel: function() {
        var rels = this.processRels('datastoreHostRels', 'host', 'datastore');

		this.writeRelationshipToCMDB(rels,
                                     this.processedHosts,
                                     this.processedDatastores,
                                     'Used by::Uses',
                                     true,
									 'cmdb_ci_vcenter_datastore',
									 'cmdb_ci_esx_server');
    },

    processClusterHostRel: function() {
        var rels = this.processRels('clusterHostRels', 'host', 'cluster');

		this.writeRelationshipToCMDB(rels,
                                     this.processedHosts,
                                     this.processedClusters,
                                     'Members::Member of',
                                     true,
									 'cmdb_ci_vcenter_cluster',
									 'cmdb_ci_esx_server');
    },

    processResourcePoolClusterRel: function() {
        var rels = this.processRels('resourcePoolClusterRels', 'resourcePool', 'cluster');

		this.writeRelationshipToCMDB(rels,
                                     this.processedResourcePools,
                                     this.processedClusters,
                                     'Defines resources for::Gets resources from',
                                     false,
									 'cmdb_ci_esx_resource_pool',
									 'cmdb_ci_vcenter_cluster');
    },

    processResourcePoolHostRel: function() {
        var rels = this.processRels('resourcePoolHostRels', 'resourcePool', 'host');

		this.writeRelationshipToCMDB(rels,
                                     this.processedResourcePools,
                                     this.processedHosts,
                                     'Defines resources for::Gets resources from',
                                     false,
									 'cmdb_ci_esx_resource_pool',
									 'cmdb_ci_esx_server');
    },

    processFolderRel: function() {
        var rels = this.processRels('folderRels', 'folder', 'folderitem');
		
		var folderSubFolders = [];
		var folderVms = [];
		var folderDatastores = [];
		var folderNetworks = [];
		var folderClusters = [];
		
		// sort the folderItems into different buckets
		for (var fMORid in rels) {
			// even if folder does not contain items, need to create the mapping for reconciliation
			folderSubFolders[fMORid] = [];
			folderVms[fMORid] = [];
			folderNetworks[fMORid] = [];
			folderDatastores[fMORid] = [];
			folderClusters[fMORid] = [];
			
			for (var i = 0; i < rels[fMORid].length; i++) {
				var fItem = rels[fMORid][i];
				
				var morVal = fItem.split('-');
				
				switch (morVal[0]) {
					case 'group':
						folderSubFolders[fMORid].push(fItem);
						break;
					case 'vm':
						folderVms[fMORid].push(fItem);
						break;
					case 'network':
						folderNetworks[fMORid].push(fItem);
						break;
					case 'datastore':
						folderDatastores[fMORid].push(fItem);
						break;
					case 'domain':
						folderClusters[fMORid].push(fItem);
						break;						
				}
			}
		}
		
		// copy folders for datacenters.  currently only vmFolders and hostFolders are of interest.
		var datacenters = XMLUtil.getChildByTagName(this.vCenter, 'datacenters');
		for (var j = 0; j < datacenters.length; j++) {
            var dc = datacenters.item(j);
			var morid = this.getXmlAttribute(dc, 'morid');
            var vmFolder = this.getXmlAttribute(dc, 'vmFolder');
			var hostFolder = this.getXmlAttribute(dc, 'hostFolder');
			
			var datacenterFolder = [];
			
			if (JSUtil.notNil(folderSubFolders[vmFolder]))
				datacenterFolder = datacenterFolder.concat(folderSubFolders[vmFolder]);
			
			if (JSUtil.notNil(folderSubFolders[hostFolder]))
				datacenterFolder = datacenterFolder.concat(folderSubFolders[hostFolder]);
			
			if (datacenterFolder.length > 0)
				folderSubFolders[morid] = datacenterFolder;
			
        }
		
		// save each bucket of folderItems separately so that reconciliation is also handled properly
		this.writeRelationshipToCMDB(folderSubFolders,
                                     this.processedItems,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_folder',
									 'cmdb_ci_vcenter_folder');
		
		this.writeRelationshipToCMDB(folderVms,
                                     this.processedItems,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_folder',
									 'cmdb_ci_vmware_instance');
		
		this.writeRelationshipToCMDB(folderNetworks,
                                     this.processedItems,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_folder',
									 'cmdb_ci_vcenter_network');
		
		this.writeRelationshipToCMDB(folderDatastores,
                                     this.processedItems,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_folder',
									 'cmdb_ci_vcenter_datastore');
		
		this.writeRelationshipToCMDB(folderClusters,
                                     this.processedItems,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_folder',
									 'cmdb_ci_vcenter_cluster');		
    },
	
    processDatacenterNetworkRel: function() {
        var rels = this.processRels('datacenterNetworkRels', 'datacenter', 'network');

		this.writeRelationshipToCMDB(rels,
                                     this.processedDatacenters,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_datacenter',
									 'cmdb_ci_vcenter_network');
    },

    processDatacenterHostRel: function() {
        var rels = this.processRels('datacenterHostRels', 'datacenter', 'host');

        // Handle weird parenting of hosts directly to datacenter - appears they go through some weird domain parent
        for (var name in rels) {
            for (var i = 0; i < rels[name].length; i++)
                if (!this.processedItems[rels[name][i]]) {
					var node = getSingleNode(this.vCenter, 0, 'hostSystems/hostSystem[@parent=\'' + rels[name][i] + '\']');
                    var id = '' + this.getXmlAttribute(node, 'morid');
                    rels[name][i] = id;
                }
        }
        
        this.writeRelationshipToCMDB(rels,
                                     this.processedDatacenters,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_datacenter',
									 'cmdb_ci_esx_server');
    },

    processDatacenterDatastoreRel: function() {
        var rels = this.processRels('datacenterDatastoreRels', 'datacenter', 'datastore');

        this.writeRelationshipToCMDB(rels,
                                     this.processedDatacenters,
                                     this.processedItems,
                                     'Contains::Contained by',
                                     false,
									 'cmdb_ci_vcenter_datacenter',
									 'cmdb_ci_vcenter_datastore');
    },
    
    processDatacentervCenterRel: function() {
        if (!current)
            return;
		
		var old_relationship = 'Managed by::Manages';
		var new_relationship = 'Manages::Managed by';
        
        for (var name in this.processedDatacenters) {			
			/* At the request of VMware, they would like to see the relatinoship between vCenter and Datacenters in the way it's represented in
			*  the vCenter application. The following section code is to rebuild the relationship as requested. It can be removed when no customer is
			*  on the Dublin release.
			*/
			/******* Beginning section of code to fix old relationship patter ********/
			var rel_gr = g_disco_functions.relationshipExists(this.processedDatacenters[name], this.getCmdbRecord(), old_relationship);
			if (JSUtil.notNil(rel_gr))
				rel_gr.deleteRecord();
			/******* End section of code to fix old relationship patter ********/				
				
            g_disco_functions.createRelationshipIfNotExists(this.getCmdbRecord(), this.processedDatacenters[name], new_relationship);
			
		}
    },

    processRels: function(relName, type1, type2) {
        var relObj = {};
        var rels = XMLUtil.getChildByTagName(this.vCenter, relName);

        if (rels) {
            for (var i = 0; i < rels.length; i++) {
                var obj1 = rels.item(i);
                var type1MORid = this.getXmlAttribute(obj1, type1 + 'MORid');

                relObj[type1MORid] = [];

                var obj2 = XMLUtil.getChildByTagName(obj1, type2 + 's');
                if (obj2)
                    for (var j = 0; j < obj2.length; j++)
                        relObj[type1MORid].push(this.getXmlAttribute(obj2.item(j), type2 + 'MORid'));
            }
        }

		return relObj;
    },

    ignoreFolder: function(foldername) {
        return foldername == 'vm' || foldername == 'host' || foldername == 'network' || foldername == 'datastore';
    },

    handleObjectType: function(type, table, dataMap, correlationFields, computedFieldsFunc, processedList) {
        var objects = XMLUtil.getChildByTagName(this.vCenter, type);
        if (!objects)
            return;

        for (var i = 0; i < objects.length; i++) {
            var object = objects.item(i);
            var objectData = this.fetchObjectData(object, dataMap, computedFieldsFunc);
            if (objectData) {
                var cmdbobj = this.getCmdbRecord();
                objectData.vcenter_ref = cmdbobj ? cmdbobj.sys_id : '';
                this.writeObjectToCMDB(table, objectData, this.isUpdate(table, objectData, correlationFields), processedList);
            }
        }
    },

    handleCIObjectType: function(type, table, dataMap, computedFieldsFunc, processedList) {
        var objects = XMLUtil.getChildByTagName(this.vCenter, type);
        if (!objects)
            return;

        for (var i = 0; i < objects.length; i++) {
            var object = objects.item(i);
            var ciObjectData = this.fetchCIObject(object, dataMap, computedFieldsFunc);

            if (DiscoveryCMDBUtil.useCMDBIdentifiers()) {
                var idResult = DiscoveryCMDBUtil.insertOrUpdate(ciObjectData, new DiscoveryLogger());
                if (!idResult.success)
                    continue;

                var gr = new GlideRecord(table);
                gr.get(idResult.sysId);
                var ciData = ciObjectData.getData();
                ciData.gr = gr;
                ciData.sys_id = idResult.sysId;

                //Add/update the sys_object_source
                if(JSUtil.notNil(idResult.sysId))
                    this.updateObjectSource(table, idResult.sysId);

                //FIXME temporary one-off until all vmware objects get converted to use object_id (extending the generic virtualization schema)
                if(!ciData.morid)
                    ciData.morid = ciData.object_id;

                if (processedList)
                    processedList[ciData.morid] = idResult.sysId;

                this.processedItems[ciData.morid] = idResult.sysId;

            } else {
                var CIID = new CIIdentification(ciObjectData, new DiscoveryLogger());
                var idResult = CIID.process();
                if (!idResult.explore)
                    continue;

                var update = false;
                if (JSUtil.notNil(idResult.sys_id))
                    update = true;

                this.writeObjectToCMDB(table, ciObjectData.getData(), {'update' : update, 'sys_id' : update ? idResult.sys_id : ''}, processedList);
            }
        }
    },
	
	// Handle host mounts by parsing the Datastore objects and extracting host mount information from each one
    handleHostMounts: function(type, table, dataMap, correlationFields, computedFieldsFunc) {
        var dStoreObjs = XMLUtil.getChildByTagName(this.vCenter, 'dataStores');
        if (!dStoreObjs)
            return;

        // iterate thru datastores and get datastore host mounts for each
        for (var i = 0; i < dStoreObjs.length; i++) {

            var dsobject = dStoreObjs.item(i),
				datastoremorid = this.getXmlAttribute(dsobject, 'morid');

            var hmObjs = XMLUtil.getChildByTagName(dsobject, type); // type is passed in as datastoreHostMounts
            for (var n = 0; n < hmObjs.length; n++) {

                var object = hmObjs.item(n);
                var objectData = this.fetchObjectData(object, dataMap, computedFieldsFunc);
                if (objectData) {
                    var cmdbobj = this.getCmdbRecord();
                    objectData.vcenter_ref = cmdbobj ? cmdbobj.sys_id : '';
					
					var hostmorid = this.getXmlAttribute(object, 'hostSystemMorId');

                    if (hostmorid) { // should have got it
                        // add host and datastore references
                        // hosts and datastores should have been processed before hostmounts
                        objectData.esx_server = this.processedHosts[hostmorid];
                        objectData.datastore = this.processedDatastores[datastoremorid];

                        this.writeObjectToDB(table, objectData, this.isUpdate(table, objectData, correlationFields), null);
                    }
                }
            }
        }
    },

	// Added to handle both VMs and VM templates from the same set of fetched objects - essentially instances and templates are the same except
	// for what table they get written to
	handleVMs: function(type, dataMap, computedFieldsFunc) {
        var i, j, objectData, gr, template, virtualMacs, virtualMac, macs, sys_id, object, name,
			vmwareNic, v, vmwareNics, rels, esx,
			vmEsxMap = { },
			cmdbobj = this.getCmdbRecord(),
			vcenter_ref = cmdbobj ? '' + cmdbobj.sys_id : '',
			objects = XMLUtil.getChildByTagName(this.vCenter, type);

        if (!objects)
            return;

		rels = _this.processRels('hostVmRels', 'host', 'vm');
		for (name in rels) {
			esx = rels[name];
			esx.forEach(
				function(vm) {
					vmEsxMap[vm] = name;
				});
		}

		for (i = 0; i < objects.length; i++) {
            object = objects.item(i);
            objectData = this.fetchObjectData(object, dataMap, computedFieldsFunc);
            if (objectData) {
				if (!objectData.bios_uuid)
					DiscoveryLogger.warn('No BIOS UUID available for ' + objectData.object_id, 'VCenterSensor', this.getEccQueueId());
				else {
					template = ('' + this.getXmlAttribute(object, 'config.template')) == 'true';

					objectData.vcenter_ref = vcenter_ref;

					// Get the MAC addresses of the virtual NICs in the VM.  Used for guest correlation
					// in processVmInstance.
					macs = [ ];
					vmwareNics = [ ];
					virtualMacs = XMLUtil.getChildByTagName(object, 'virtualMacs');
					if (virtualMacs) {
						for (j = 0; j < virtualMacs.length; j++) {
							vmwareNic = { };
							virtualMac = virtualMacs.item(j);
							v = this.getXmlAttribute(virtualMac, 'mac_address');
							if (!v)
								continue;
							vmwareNic.mac_address = '' + v;
							vmwareNics.push(vmwareNic);
	
							v = this.getXmlAttribute(virtualMac, 'dns_server');
							if (v)
								vmwareNic.dns_server = '' + v;

							v = this.getXmlAttribute(virtualMac, 'ip_address');
							if (v)
								vmwareNic.ip_address = '' + v;

							v = this.getXmlAttribute(virtualMac, 'ip_default_gateway');
							if (v)
								vmwareNic.ip_default_gateway = '' + v;

							v = this.getXmlAttribute(virtualMac, 'subnet_mask');
							if (v)
								vmwareNic.subnet_mask = '' + v;

							v = this.getXmlAttribute(virtualMac, 'dhcp_enabled');
							if (v !== undefined)
								vmwareNic.dhcp_enabled = '' + v;
							
							macs.push(vmwareNic.mac_address);
						}
					}

					objectData.nics = macs.length;

					try {
						var hostmorid = vmEsxMap[objectData.object_id];
						gr = VmwareVmCorrelator.processVmInstanceOrTemplate(objectData, macs, template,
																			this.addDiscoveryCiStuff,
																			this.processedHosts[hostmorid]);
					} catch (e) {
						DiscoveryLogger.warn(e.msg || e.toString(), 'VCenterSensor', this.getEccQueueId());
						continue;
					}

					sys_id = objectData.sys_id = '' + gr.sys_id;

					if (template)
						this.processedTemplates[objectData.object_id] = sys_id;
					else
						this.processedVMs[objectData.object_id] = sys_id;
					this.processedItems[objectData.object_id] = sys_id;

					this.updateObjectSource(template ? 'cmdb_ci_vmware_template' : 'cmdb_ci_vmware_instance', sys_id);

					vmwareNics.forEach(
						function(nic) {
							gr = new GlideRecord('cmdb_ci_vmware_nic');
							gr.addQuery('cmdb_ci', sys_id);
							gr.addQuery('mac_address', nic.mac_address);
							gr.query();
							gr.next();
							_this.addDiscoveryCiStuff(gr);
							for (name in nic)
								gr[name] = nic[name];
							gr.cmdb_ci = sys_id;
							gr.update();
							_this.updateObjectSource('cmdb_ci_vmware_nic', '' + gr.sys_id);
						});
				}
            }
        }
	},
	
    fetchObjectData: function(object, dataMap, computedFieldsFunc) {
        var objectData = {};
        var returnObj = null;

        var vcenterUuid = this.getXmlAttribute(this.vCenter, 'content.about.instanceUuid');
        objectData.vcenter_uuid = vcenterUuid ? '' + vcenterUuid : '';
        
        for (var name in dataMap)
            objectData[dataMap[name]] = this.getXmlAttribute(object, name);

        if (!computedFieldsFunc || computedFieldsFunc(object, objectData, this))
            returnObj = objectData;

        return returnObj;
    },

    fetchCIObject: function(object, dataMap, computedFieldsFunc) {
        var returnObj = null;
        var ciDataObj = new CIData();
        var ciData = ciDataObj.getData();

        for (var name in dataMap)
            ciData[dataMap[name]] = this.getXmlAttribute(object, name);

        if (computedFieldsFunc(object, ciData, ciDataObj, this))
            returnObj = ciDataObj;

        return returnObj;
    },

    isUpdate: function(table, objectData, fieldsToCorrelate) {
		var gr = objectData.gr;
		
		if (gr) return { update: true, sys_id: gr.sys_id };

		gr = new GlideRecord(table);

        for (var i = 0; i < fieldsToCorrelate.length; i++)
            gr.addQuery(fieldsToCorrelate[i], objectData[fieldsToCorrelate[i]]);
        gr.query(); 
        var update = gr.next();

		if (update)
			objectData.gr = gr;

        return {'update' : update, 'sys_id' : update ? gr.sys_id : ''};
    },
	
	findSysId: function(table, objectData, fieldsToCorrelate) {
		var gr = objectData.gr;

		if (!gr) {

			gr = new GlideRecord(table);

			for (var i = 0; i < fieldsToCorrelate.length; i++)
				gr.addQuery(fieldsToCorrelate[i], objectData[fieldsToCorrelate[i]]);
			gr.query();

			if (gr.next())
				objectData.gr = gr;
		}

		return gr.sys_id;
	},

    writeObjectToCMDB: function(table, objectData, updateState, processedList) {      
		var gr = new GlideRecord(table);

		if (updateState.update)
            gr.get(updateState.sys_id);

		objectData.gr = gr;

        for (var name in objectData) {
            if ((name == 'sys_class_name') || (name == 'folderTypes'))
			      continue;		

            gr[name] = objectData[name];
        }

		//Update the discovery fields
		this.addDiscoveryCiStuff(gr);
		
		var ciSysId;
        if (updateState.update)
            ciSysId = gr.update();
        else
            ciSysId = gr.insert();
		
		objectData.sys_id = ciSysId;
		
		//Add/update the sys_object_source 
		if(JSUtil.notNil(ciSysId)) 
			this.updateObjectSource(table,ciSysId);
			
	   
	   //FIXME temporary one-off until all vmware objects get converted to use object_id (extending the generic virtualization schema)
	   if(!objectData.morid)
		  objectData.morid = objectData.object_id;

        if (processedList)
            processedList[objectData.morid] = '' + gr.sys_id;

        this.processedItems[objectData.morid] = '' + gr.sys_id;

		// For folder CIs need to create folder - type relationship
		if (table == 'cmdb_ci_vcenter_folder') {
			var folderTypes = objectData.folderTypes;
			
			// insert record in m2m relationship table
			for (var i = 0; i < folderTypes.length; i++) {
				var typegr = new GlideRecord('vmware_folder_type');
				typegr.addQuery('foldertype', folderTypes[i]);
				typegr.query();
				if (! typegr.next()) 
					continue; 				
			
				var m2mgr = new GlideRecord('vmware_vcenter_folder_type_m2m');
				m2mgr.addQuery('folder', gr.sys_id);
				m2mgr.addQuery('type', typegr.sys_id);
				m2mgr.query(); 
				if (! m2mgr.next()) {
					m2mgr.folder = gr.sys_id;
					m2mgr.type = typegr.sys_id;
					m2mgr.insert();
				}	
			}		
		}
    },
	
	// write non-CI vCenter object to DB
    writeObjectToDB: function(table, objectData, updateState, processedList) {

        var gr = new GlideRecord(table);
        if (updateState.update)
            gr.get(updateState.sys_id);

		objectData.gr = gr;

        for (var name in objectData) {
            if ((name == 'sys_class_name') || (name == 'folderTypes'))
                continue;

            gr[name] = objectData[name];
        }

        var ciSysId;
        if (updateState.update)
            ciSysId = gr.update();
        else
            ciSysId = gr.insert();

		objectData.sys_id = ciSysId;

        if (processedList)
            processedList[objectData.morid] = '' + gr.sys_id;

    },
	
	/**
	* Populate discovery_source, first_discovered, last_discovered, location fields for 
	* CI's we're creating.
	*/
	addDiscoveryCiStuff: function(ciData) {
		var currDateTime = ''+new GlideDateTime();
		
		ciData.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
		ciData.setValue('last_discovered', currDateTime);
		if(!ciData.getValue('first_discovered'))
			ciData.setValue('first_discovered', currDateTime);

		if(locationID)
			ciData.location = locationID;
	},
	
	/**
	 * Create/update the sys_object_source record for the vcenter ci;
	 * add the discovered timestamps, location, and discovery source.
	 */
	after: function() {
		var cigr = this.getCmdbRecord();
		if(cigr) {
			this.addDiscoveryCiStuff(cigr);
			cigr.update();
			this.updateObjectSource(cigr.sys_class_name, cigr.sys_id);
			
		}
	},
	/**
	 * Add/update the sys_object_source
	 * 
	 **/
	 updateObjectSource: function(table, ciSysID){
		 var sourceName = gs.getProperty('glide.discovery.source_name', "ServiceNow");
		 if (JSUtil.notNil (this.statusID)){
			 var os = new ObjectSource(sourceName, table, ciSysID, this.statusID.source);
			 os.process();
		 }

	 },
	/**
	 * Allow a mechanism for skipping ESX discovery via CIM probes (e.g. for runbook-only discovery of vCenter)
	 *
	 * @return true if ESX discovery should proceed, false otherwise
	 */
	discoverEsx: function() {
		return true;
	},
	
	/**
	 * Provides a mechanism for creating relationships (cmdb_rel_ci) between CMDB CI records
	 *
	 * @param rels is an associative array of morids.  The index is the keys are morids and the values are arrays of associated morids.
	 * @param processedList1 is an associative array mapping key morids to sys_ids of the respective CI records
	 * @param processedList2 is an associative array mapping value morids to sys_ids of the respective CI records
	 * @param relationship is a string value indicating the relationship to associate
	 * @param flipRelObjs determines the direction to build the relationship. If flipRelObjs=false, key morids are parents.  Else, key morids are the children.
	 * @param className is a string value of sys_class_name of relValues
	 *
	 * sample parameters:
	 * rels => [network-12]=host-9,host-16 [network-13]=host-9,host-16 [network-7079]=host-9
	 * processedList1 => [network-12]=c76e24b2c30311002d031f051eba8f1a [network-13]=8b6e24b2c30311002d031f051eba8f1a [network-7079]=4f6e24b2c30311002d031f051eba8f1a
	 * processedList2 => [host-9]=c26ee0b2c30311002d031f051eba8fed [host-16]=3d6ee0b2c30311002d031f051eba8feb
	 * relationship=Provided By::Provides 
	 * flipRelObjs=false
	 * className=cmdb_ci_esx_server
	 *
	 * In the above example, morid network-12 is Provided By morids host-9 and host-16.
	 *
	 */
    writeRelationshipToCMDB: function(rels, processedList1, processedList2, relationship, flipRelObjs, parentTable, childTable) {
		var name,
			cloudRel,
			cloudRels = [ ],
			parentMap =   { };

		// Convert the data we get into the form the CloudCIReconciler wants.
		if (flipRelObjs) {
			// CloudCIReconciler requires that each parent have a list of its
			// children, so we've got to flip the relationships around if
			// flipRelObjs is set.
			for (name in rels) {
				rels[name].forEach(
					function(child) {
						var parent = processedList2[child];
							child = processedList1[name];
						if (!parent || !child)
							return;

						if (!parentMap[parent]) {
							cloudRel = parentMap[parent] = {
								parent: parent,
								children: [ ]
							};
							cloudRels.push(cloudRel);
						}
	
						cloudRel = parentMap[parent];
						cloudRel.children.push(child);
					});
			}
		}
		else {
			for (name in rels) {
				if (!processedList1[name])
					continue;
				cloudRel = {
					parent: processedList1[name],
					children: [ ]
				};
				cloudRels.push(cloudRel);
				rels[name].forEach(
					function(child) {
						var childSysId = processedList2[child];
						if (childSysId)
							cloudRel.children.push(childSysId);
					});
			}
		}

		return CloudCIReconciler.updateStalenessWithRelationships(cloudRels, parentTable, childTable, relationship);
    },

	/**
     * The cmdb_ci_vm_instance table defines more states, but the VMWare API only returns these 3
     */
    powerState: function(state) {
        var ciState = 'paused';

        if (state == 'poweredOn')
            ciState = 'on';
        else if (state == 'poweredOff')
            ciState = 'off';

        return ciState;
    },

    /**
     * This is primarily to delete legacy old resource pools before we pulled their MOR ids - these should
     * get pulled into new records that will make using them in VM provisioning much easier.  This is likely
     * not to do much in most cases
     */
    cleanupResourcePools: function() {
        var gr = new GlideRecord('cmdb_ci_esx_resource_pool');
        gr.addNullQuery('morid');
        gr.query();

        while (gr.next())
            gr.deleteRecord();
    },

    getXmlAttribute: function(node, attribute) {
        if (!node)
            return '';

        var attrib = XMLUtil.getAttribute(node, attribute);
        return attrib ? '' + attrib : '';
    },

    type: "DiscoverySensor"
};

})();