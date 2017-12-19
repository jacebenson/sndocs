/* jshint -W030, -W083 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterESXHostsSensor;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, debug, _this,
	parallelStorage,
	hostname = new HostnameJS(),
	esxVmMap = { },
	hostMounts = [ ],
	hostmount_schema = {
		index: [ 'datastore', 'esx_server' ]
	},
	schema = {
		cmdb_ci_esx_server: {
			fixup: fixupEsx,
			preWriteRels: preWriteEsxRels,
			index: [ 'morid', 'correlation_id' ],
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by',
				cmdb_ci_esx_resource_pool: 'Defines resources for::Gets resources from',
				cmdb_ci_vmware_instance: 'Registered on::Has registered',
				cmdb_ci_vmware_template: 'Registered on::Has registered',
				cmdb_ci_vcenter_cluster: 'Members::Member of',
				cmdb_ci_vcenter_network: 'Provided by::Provides',
				cmdb_ci_vcenter_datastore: 'Used by::Uses'
			}
		}
	},
	args = {
		schema: schema
	};

VCenterESXHostsSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity, so possibly inconsistent:
	{
	  "cmdb_ci_esx_server": [
		{
		  "type": "HostSystem",
		  "morid": "host-1025",
		  "name": "DC0_C14_H4",
		  "install_status": false,
		  "os_version": "VMware ESX 5.0.0 build-5.0.0.19",
		  "network": [
			"network-7",
			"dvportgroup-9"
		  ],
		  "datastore": [
			"datastore-63",
			"datastore-1177"
		  ],
		  "vm": [
			"vm-5812",
			"vm-4443"
		  ],
		  "correlation_id": "33393138-3335-5553-4537-32324e35394b",
		  "cpu_speed": 2999,
		  "model_id": "ProLiant DL380 G5",
		  "ram": 16379,
		  "cpu_count": 2,
		  "cpu_core_count": 2,
		  "manufacturer": "HP",
		  "cpu_type": "Intel(R) Xeon(R) CPU            5160  @ 3.00GHz",
		  "cpu_manufacturer": "intel",
		  "cluster": [
			"domain-c105"
		  ],
		  "disk_space": 20480
		}
	  ]
	}
*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	var datastores, hosts, networks, vms, esx, batch, numInGroup,
		probeParms = getProbeParms();

	_this = this;
	
	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');
	args.mutexPrefix = datacenterMorId;

	// If we're doing a full discovery, assume relationships will be built
	// from the other side for everything
	if (fullDiscovery) {
		delete schema.cmdb_ci_esx_server.childOf;
		delete schema.cmdb_ci_esx_server.preWriteRels;
	}

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	this.root = g_probe.getDocument().getDocumentElement();

	output = JSON.parse(output);

	if (output.leftOverMors && output.leftOverMors.length) {
		probeParms.mor_ids = JSON.stringify(output.leftOverMors);
		this.triggerProbe('VMWare - vCenter ESX Hosts', probeParms);
	}

	output.vcenter_datastore_hostmount = hostMounts;

	args.results = output;

	JsonCi.iterate(createHostMounts, args);
	schema.vcenter_datastore_hostmount = hostmount_schema;

	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);

	if ('' + g_probe.getParameter('disable_host_storage_probe') == 'true')
		return;

	esx = output.cmdb_ci_esx_server;
	while (esx.length) {
		numInGroup = Math.ceil(esx.length/parallelStorage);
		parallelStorage--;
		probeParms.mor_ids = [ ];
		batch = esx.splice(0, numInGroup);
		batch.forEach(
			function(esx) {
				probeParms.mor_ids.push(esx.morid);
			});
		probeParms.mor_ids = JSON.stringify(probeParms.mor_ids);
		_this.triggerProbe('VMWare - vCenter ESX Hosts Storage', probeParms);
	}

	fixVirtualizes();
}

//////////////////////////////////////////////////////////////////////////
/*
   We try to create the Virtualized by::Virtualizes relationship between guest and
   ESX in 3 places: here, in the VMs sensor and in a business rule that runs when
   the guest is discovered.  The business rule only runs when the serial number
   has changed and the VMs sensor code only runs when the guest is unreconciled,
   making both those paths unreliable, even on re-discovery.  This code will always
   run, guaranteeing that the relationship will be created (although it may take
   two runs of ESX host discovery.)
*/
function fixVirtualizes() {
	var esx, vms;
	for (esx in esxVmMap) {
		vms = esxVmMap[esx];
		vms.forEach(
			function(vm) {
				var rel = new GlideRecord('cmdb_rel_ci');
				rel.addQuery('type', g_disco_functions.findCIRelationshipType('Instantiates::Instantiated by'));
				rel.addQuery('child', vm);
				rel.query();
				if (rel.next())
					g_disco_functions.createRelationshipIfNotExists(rel.parent, esx, 'Virtualized by::Virtualizes');
		});
	}
}

//////////////////////////////////////////////////////////////////////////
function createHostMounts(esx) {
	esx.cmdb_ci_vcenter_datastore = VMUtils.lookupSysIds(esx.datastore, 'cmdb_ci_vcenter_datastore', vCenterSysId);
	esx.cmdb_ci_vcenter_datastore.forEach(
		function(ds) {
			var hm = {
				datastore: ds,
				esx_server: esx,
				vcenter_ref: vCenterSysId
			};

			hostMounts.push(hm);
		});
}

//////////////////////////////////////////////////////////////////////////
function fixupEsx(esx) {
	var mm, cluster;

	esx.name = hostname.format(esx.name);
	esx.dns_domain = hostname.getDomainName();
	
	esx.vcenter_ref = vCenterSysId;
	esx.vcenter_uuid = vCenterUuid;
	
	esx.os = 'ESX';
	
	mm = MakeAndModel.fromNames(esx.manufacturer, esx.model_id);
	esx.manufacturer = '' + mm.getManufacturerSysID();
	esx.model_id = '' + mm.getModelNameSysID();
	
	mm = MakeAndModel.fromNames(esx.cpu_manufacturer, null);
	esx.cpu_manufacturer = '' + mm.getManufacturerSysID();

	esx.object_id = esx.morid;
}

//////////////////////////////////////////////////////////////////////////
function preWriteEsxRels(esx) {
	esx.cmdb_ci_vcenter_network = VMUtils.lookupSysIds(esx.network, 'cmdb_ci_vcenter_network', vCenterSysId);
	esx.cmdb_ci_vmware_instance = VMUtils.lookupSysIds(esx.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
	esx.cmdb_ci_vmware_template = VMUtils.lookupSysIds(esx.vm, 'cmdb_ci_vmware_template', vCenterSysId);
	cluster = VMUtils.lookupSysIds(esx.cluster, 'cmdb_ci_vcenter_cluster', vCenterSysId);

	esxVmMap[esx.sys_id] = esx.cmdb_ci_vmware_instance;

	if (!cluster) {
		esx.cmdb_ci_vcenter_datacenter = datacenterSysId;

		gr = new GlideRecord('cmdb_ci_esx_resource_pool');
		gr.addQuery('vcenter_ref', vCenterSysId);
		gr.addQuery('owner_morid', esx.cluster[0]);
		gr.query();
		if (gr.next())
			esx.cmdb_ci_esx_resource_pool = '' + gr.sys_id;
	}
	esx.cmdb_ci_vcenter_cluster = cluster;
}

//////////////////////////////////////////////////////////////////////////
function getProbeParms() {
	vCenterSysId = '' + g_probe.getParameter('vcenter_sys_id');
	vCenterUuid = '' + g_probe.getParameter('vcenter_uuid');
	datacenterSysId = '' + g_probe.getParameter('datacenter_sys_id');
	datacenterMorId = '' + g_probe.getParameter('datacenter_mor_id');
	fullDiscovery = ('' + g_probe.getParameter('full_discovery')) == 'true';
	debug = '' + g_probe.getParameter('debug');

	parallelStorage = parseInt(g_probe.getParameter('parallel_storage_probes')) || 1;

	return {
		vcenter_sys_id: vCenterSysId,
		vcenter_uuid: vCenterUuid,
		datacenter_mor_id: datacenterMorId,
		datacenter_sys_id: datacenterSysId,
		full_discovery: fullDiscovery,
		debug: debug
	};
}

})();
