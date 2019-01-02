/* jshint -W030, -W083 */

var VCenterESXHostsSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, _this,
	enableCmpApi,
	hostname = new HostnameJS(),
	esxVmMap = { },
	hostMounts = [ ],
	serialNumbers = [ ],
	hostmount_schema = {
		index: [ 'datastore', 'esx_server' ]
	},
	schema = {
		cmdb_ci_esx_server: {
			fixup: fixupEsx,
			preWriteRels: preWriteEsxRels,
			index: [ 'morid', 'correlation_id' ],
			parentOf: {
				hostedOn: 'Hosted on::Hosts'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by',
				cmdb_ci_esx_resource_pool: 'Defines resources for::Gets resources from',
				cmdb_ci_vmware_instance: 'Registered on::Has registered',
				cmdb_ci_vmware_template: 'Registered on::Has registered',
				cmdb_ci_vcenter_cluster: 'Members::Member of',
				cmdb_ci_vcenter_network: 'Provided by::Provides',
				cmdb_ci_vcenter_dvs: 'Provided by::Provides',
				cmdb_ci_vcenter_dv_port_group: 'Provided by::Provides',
				cmdb_ci_vcenter_datastore: 'Used by::Uses'
			}
		},
		cmdb_serial_number: {
			index: [ 'cmdb_ci' ]
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

	_this = this;

	getProbeParms();

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

	VMUtils.triggerNextPage(_this, output.leftOverMors, [ 'disable_host_storage_probe' ]);

	output.vcenter_datastore_hostmount = hostMounts;
	output.cmdb_serial_number = serialNumbers;

	args.results = output;

	JsonCi.iterate(createHostMounts, args);
	schema.vcenter_datastore_hostmount = hostmount_schema;

	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);
	enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);

	// Trigger probes configured to run after the ESX host sensor.
	// I'm passing an object that contains the host list twice.  The member
	// names in this object are used to construct the parameter name for
	// parallel probes.  In Jakarta the parameter name for the Host Storage probe
	// was 'parallel_storage_probes', so I have to have a member named 'storage'
	// to support it.  I don't want other conditional scripts to have to refer
	// to 'storage', so I'm passing the list as 'host' also.
	VMUtils.triggerProbes(_this, {
		storage: output.cmdb_ci_esx_server,
		host: output.cmdb_ci_esx_server
	});

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

	var serialNumber = {
		cmdb_ci: esx,
		serial_number: esx.serial_number,
		serial_number_type: 'chassis',
		valid: SncSerialNumber().isValid(esx.serial_number)
	};
	serialNumbers.push(serialNumber);
}

//////////////////////////////////////////////////////////////////////////
function preWriteEsxRels(esx) {
	esx.cmdb_ci_vcenter_network = VMUtils.lookupSysIds(esx.network, 'cmdb_ci_vcenter_network', vCenterSysId);
	esx.cmdb_ci_vcenter_dv_port_group = VMUtils.lookupSysIds(esx.network, 'cmdb_ci_vcenter_dv_port_group', vCenterSysId);
	esx.cmdb_ci_vcenter_dvs = VMUtils.lookupSysIds(esx.cmdb_ci_vcenter_dvs, 'cmdb_ci_vcenter_dvs', vCenterSysId);
	esx.cmdb_ci_vmware_instance = VMUtils.lookupSysIds(esx.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
	esx.cmdb_ci_vmware_template = VMUtils.lookupSysIds(esx.vm, 'cmdb_ci_vmware_template', vCenterSysId);
	cluster = VMUtils.lookupSysIds(esx.cluster, 'cmdb_ci_vcenter_cluster', vCenterSysId);

	esxVmMap[esx.sys_id] = esx.cmdb_ci_vmware_instance;

	if (DiscoveryCMPUtils.isCmpActive())
		esx.hostedOn = datacenterSysId;

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
	enableCmpApi = DiscoveryCMPUtils.isCmpActive() && (('' + g_probe.getParameter('enable_cmp_qa')) == 'true');
}

})();
