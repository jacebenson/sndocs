/* jshint -W030 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterDatacentersSensor;

(function() {

var vCenterSysId, vCenterUuid, _this, locationID, statusID,
	parallelVMs, parallelNets, parallelStores, parallelClusters, fullDiscovery,
	allFolders = [ ],
	allVms = [ ],
	allDatastores = [ ],
	allNetworks = [ ],
	allClusters = [ ],
	allHosts = [ ],
	allPools = [ ],
	allDatacenters = [ ],
	folderSchema = {
		cmdb_ci_vcenter_folder: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupFolder,
			parentOf: {
				cmdb_ci_vcenter_folder: 'Contains::Contained by'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by'
			}
		}
	};

VCenterDatacentersSensor = {
	process: process,
	after: function() { this.updateObjectSource(current); },
    type: "DiscoverySensor"
};

/*
Sample data:
{
  "vcenter": {
    "type": "ServiceInstance",
    "morid": "ServiceInstance",
    "name": "VMware vCenter Server",
    "version": "5.5.0",
    "fullname": "VMware vCenter Server 5.5.0 build-3252642 (Sim)",
    "api_version": "5.5",
    "instance_uuid": "D877AC10-0803-40C2-AE74-F66F99671D64",
    "url": "https:\/\/10.11.128.135\/sdk"
  },
  "cmdb_ci_vcenter_datacenter": [
    {
      "type": "Datacenter",
      "morid": "datacenter-2",
      "name": "DC0",
      "folder_morid": "group-v3",
      "host_morid": "group-h4",
      "folders": {
        "type": "Datacenter",
        "morid": "datacenter-2",
        "name": "DC0",
        "datastoreFolder": {
          "type": "Folder",
          "morid": "group-s5",
          "name": "datastore",
          "childEntity": [
            {
              "type": "Datastore",
              "morid": "datastore-170",
              "name": "SANLAB1DS_DC0_C0_0"
            }
          ]
        },
        "hostFolder": {
          "type": "Folder",
          "morid": "group-h4",
          "name": "host",
          "childEntity": [
            {
              "type": "ClusterComputeResource",
              "morid": "domain-c105",
              "name": "DC0_C14"
            }
          ]
        },
        "networkFolder": {
          "type": "Folder",
          "morid": "group-n6",
          "name": "network",
          "childEntity": [
            {
              "type": "Network",
              "morid": "network-7",
              "name": "VM Network"
            }
          ]
        },
        "vmFolder": {
          "type": "Folder",
          "morid": "group-v3",
          "name": "vm",
          "childEntity": [
            {
              "type": "VirtualMachine",
              "morid": "vm-4373",
              "name": "DC0_C1_RP2_VM11"
            }
          ]
        }
      }
    }
  ],
  "hosts": [
    "host-1025"
  ],
  "pools": [
    "resgroup-106"
  ]
}
*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	var vCenter, vcGr,
		args = {
			leaveCurrent: 1,
			schema: {
				cmdb_ci_vcenter_datacenter: {
					index: [ 'morid', 'vcenter_uuid' ],
					fixup: fixupDatacenter,
					reverseRelations: {
						managedBy: 'Manages::Managed by'
					}
				}
			}
		};

	_this = this;
	locationID = this.getLocationID();
	statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	parallelVMs = parseInt(this.getParameter('parallel_vm_probes')) || 1;
	parallelNets = parseInt(this.getParameter('parallel_network_probes')) || 1;
	parallelStores = parseInt(this.getParameter('parallel_datastore_probes')) || 1;
	parallelClusters = parseInt(this.getParameter('parallel_cluster_probes')) || 1;
	
	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	output = JSON.parse(output);

	args.results = output;
	args.location = locationID;
	args.statusId = statusID;

	vCenter = output.vcenter;
	vCenterUuid = vCenter.instance_uuid;

	// fullDiscovery defaults to false (meaning things are going to act like we're
	// not doing a full discovery, i.e. we'll attempt to created relationships from
	// both sides).  It can be overridden by a probe parameter, otherwise it will
	// be set to true only when first_discovered does not equal last_discovered
	fullDiscovery = this.getParameter('full_discovery');
	if (fullDiscovery !== null)
		fullDiscovery = (('' + fullDiscovery) == 'true');
	else {
		fullDiscovery = false;
		vcGr = new GlideRecord('cmdb_ci_vcenter');
		vcGr.addQuery('instance_uuid', vCenterUuid);
		vcGr.query();
		if (vcGr.next() && vcGr.last_discovered && ('' + vcGr.first_discovered != '' + vcGr.last_discovered))
			fullDiscovery = true;
	}

	if (current) {
		current.url = vCenter.url;
		current.fullname = vCenter.fullname;
		current.api_version = vCenter.api_version;
		current.instance_uuid = vCenterUuid;
		this.addDiscoveryCiStuff(current);
	}

	// Check for the vCenter CI
	var ip = g_probe.getSource();
	var thisCmdbRecord = this.getCmdbRecord();

	if (!thisCmdbRecord) {
		// We got here via port probe; we don't have a CI.  Let's find one or make one
		vcGr = new GlideRecord('cmdb_ci_vcenter');
		vcGr.addQuery('instance_uuid', vCenterUuid);
		vcGr.query();
		if (!vcGr.next()) {
			// There's no existing vcenter record for this uuid... check ip address
			vcGr.initialize();
			vcGr.addQuery('ip_address', ip);
			vcGr.query();

			if(!vcGr.next()) {
				vcGr.initialize();
				vcGr.ip_address = g_probe.getSource();
				vcGr.instance_uuid = current.instance_uuid;
				vcGr.name = "vCenter@"+ip;
			}
		}
		this.addDiscoveryCiStuff(vcGr);
		vcGr.update();
		
		vCenterSysId = '' + vcGr.getUniqueValue();

		// vcGr now points to the vcenter record corresponding to this uuid
		if (JSUtil.notNil(g_device))
			g_device.setCISysID(vCenterSysId);
	} else {
		vCenterSysId = '' + thisCmdbRecord.sys_id;

		// We got here via process classifier; make sure we don't have a duplicate vCenter CI 
		// from a previous port-probe disco, or a manually entered one
		vcGr = new GlideRecord('cmdb_ci_vcenter');

		var qc = vcGr.addQuery('instance_uuid', current.instance_uuid);
		qc.addOrCondition('ip_address', ip);
		vcGr.query();
		while(vcGr.next()) {
			if(vcGr.sys_id != '' + thisCmdbRecord.sys_id)
				vcGr.deleteRecord();
		}
	}

	// This writes only the datacenter records.
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.writeRelationships(args);

	JsonCi.iterate(processDatacenter, args);

	updateStaleness();
}

//////////////////////////////////////////////////////////////////////////
function updateStaleness() {

	var allObjects,
		childTables = [ 'cmdb_ci_vcenter_datacenter', 'cmdb_ci_vmware_template', 'cmdb_ci_vmware_instance',
					 'cmdb_ci_vcenter_datastore', 'cmdb_ci_vcenter_network', 'cmdb_ci_vcenter_cluster',
					 'cmdb_ci_vcenter_folder', 'cmdb_ci_esx_server', 'cmdb_ci_esx_resource_pool' ],
		resourcePoolTable = 'cmdb_ci_esx_resource_pool';

	allObjects = VMUtils.lookupSysIds(allDatacenters, 'cmdb_ci_vcenter_datacenter', vCenterSysId, 'morid');
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allVms, 'cmdb_ci_vmware_template', vCenterSysId));
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allVms, 'cmdb_ci_vmware_instance', vCenterSysId));
	
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allDatastores, 'cmdb_ci_vcenter_datastore', vCenterSysId));
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allNetworks, 'cmdb_ci_vcenter_network', vCenterSysId));
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allClusters, 'cmdb_ci_vcenter_cluster', vCenterSysId));
	
	allObjects = allObjects.concat(VMUtils.lookupSysIds(allFolders, 'cmdb_ci_vcenter_folder', vCenterSysId));
	allObjects = allObjects.concat(VMUtils.lookupSysIds(output.hosts, 'cmdb_ci_esx_server', vCenterSysId, 'morid'));
	allObjects = allObjects.concat(VMUtils.lookupSysIds(output.pools, 'cmdb_ci_esx_resource_pool', vCenterSysId));

	// resource pool (parent of server and/or cluster but child of none) needs special handling for staleness

	CloudCIReconciler.updateStaleness(allObjects, childTables, allObjects, resourcePoolTable);
}

//////////////////////////////////////////////////////////////////////////
function fixupDatacenter(dc) {
	dc.managedBy = { sys_id: vCenterSysId };
	dc.vcenter_uuid = vCenterUuid;
	dc.vcenter_ref = vCenterSysId;
}

//////////////////////////////////////////////////////////////////////////
function fixupFolder(folder) {
	folder.vcenter_ref = vCenterSysId;
	folder.vcenter_uuid = vCenterUuid;
	folder.object_id = folder.morid;
}

//////////////////////////////////////////////////////////////////////////
function processDatacenter(dc) {
	var datastores, clusters, networks, vms,
		folders = [ ],
		dcFolders = dc.folders,
		args = {
			leaveCurrent: 1,
			location: locationID,
			statusId: statusID,
			mutexPrefix: dc.morid,
			schema: folderSchema,
			results: { cmdb_ci_vcenter_folder: folders }
		};

	allHosts = allHosts.concat(dc.hosts);
	allPools = allPools.concat(dc.pools);
	allDatacenters.push(dc.morid);

	datastores = extractFoldersAndChildren(dcFolders.datastoreFolder, folders, dc);
	clusters = extractFoldersAndChildren(dcFolders.hostFolder, folders, dc);
	networks = extractFoldersAndChildren(dcFolders.networkFolder, folders, dc);
	vms = extractFoldersAndChildren(dcFolders.vmFolder, folders, dc);

	// Prepare & write the folders
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);

	allVms = allVms.concat(vms);
	allDatastores = allDatastores.concat(datastores);
	allNetworks = allNetworks.concat(networks);
	allClusters = allClusters.concat(clusters);
	allFolders = allFolders.concat(folders);

	// Trigger probes
	if ('' + g_probe.getParameter('disable_vm_probe') != 'true')
		fireParallelProbes('VMWare - vCenter VMs', dc, vms, parallelVMs);
	if ('' + g_probe.getParameter('disable_datastore_probe') != 'true')
		fireParallelProbes('VMWare - vCenter Datastores', dc, datastores, parallelStores);
	if ('' + g_probe.getParameter('disable_network_probe') != 'true')
		fireParallelProbes('VMWare - vCenter Networks', dc, networks, parallelNets);
	if ('' + g_probe.getParameter('disable_cluster_probe') != 'true')
		fireParallelProbes('VMWare - vCenter Clusters', dc, clusters, parallelClusters);

	JsonCi.updateRelationships(args);
}

//////////////////////////////////////////////////////////////////////////
function fireParallelProbes(name, dc, all, parallel) {

	var numInGroup;

	while (all.length) {
		numInGroup = Math.ceil(all.length/parallel);
		setMorsAndTrigger(name, dc, all.splice(0, numInGroup));
		parallel--;
	}
}

//////////////////////////////////////////////////////////////////////////
function extractFoldersAndChildren(root, folders, dc) {
	var children = [ ];

	extractChildrenFromFolder(root, dc.name);

	root.cmdb_ci_vcenter_folder.forEach(function(c) { c.cmdb_ci_vcenter_datacenter = dc.sys_id; });
	delete root.cmdb_ci_vcenter_folder;

	return children;

	function extractChildrenFromFolder(parent, fullpath) {
		parent.cmdb_ci_vcenter_folder = [ ];
		parent.childEntity.forEach(
			function(child) {
				if (child.type == 'Folder' || child.type == 'StoragePod') {
					parent.cmdb_ci_vcenter_folder.push(child);
					child.fullpath = fullpath + ' | ' + child.name;
					folders.push(child);
					extractChildrenFromFolder(child, child.fullpath);
				}
				else if (child.type == 'VirtualApp')
					extractChildrenFromFolder(child, child.fullpath);
				else
					children.push(child);
			});
		delete parent.childEntity;
	}
}

//////////////////////////////////////////////////////////////////////////
function setMorsAndTrigger(probe, dc, mors) {
	var parms = {
			vcenter_sys_id: vCenterSysId,
			vcenter_uuid: vCenterUuid,
			datacenter_mor_id: dc.morid,
			datacenter_sys_id: dc.sys_id,
			full_discovery: '' + fullDiscovery,
			debug: '' + g_probe.getParameter('debug')
		};

	parms.mor_ids = JSON.stringify(mors, function(key, value) { if (key != 'name') return value; });
	_this.triggerProbe(probe, parms);
}

})();
