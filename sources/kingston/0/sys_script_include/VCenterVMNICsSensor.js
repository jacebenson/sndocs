/* jshint -W030 */

var VCenterVMNICsSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery,
	debug, _this, avoidIe,
	dsMap = { },
	blockEndpoints = [ ],
	nicEndpoints = [ ],
	args = {
		schema: {
			cmdb_ci_storage_volume: {
				index: [ [ 'computer', 'vdisk_id' ],
						 [ 'computer', 'object_id' ]
						],
				fixup: fixupDisk,
				parentOf: { cmdb_ci_vcenter_datacenter: 'Hosted on::Hosts' }
			},
			cmdb_ci_vmware_nic: {
				index: [ 'cmdb_ci', 'mac_address' ],
				fixup: fixupNic,
				parentOf: { cmdb_ci_vcenter_datacenter: 'Hosted on::Hosts' }
			},
			cmdb_ci_endpoint_block: {
				index: [ 'object_id', 'host' ],
				childOf: {
					host: 'Use End Point To::Use End Point From',
					volume: 'Implement End Point To::Implement End Point From'
				}
			},
			cmdb_ci_endpoint_vnic: {
				index: [ 'object_id', 'host' ],
				childOf: {
					host: 'Use End Point To::Use End Point From',
					nic: 'Implement End Point To::Implement End Point From'
				}
			}
		}
	};

VCenterVMNICsSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity.
	{
		"cmdb_ci_storage_volume": [
		{
		  "computer":"vm-2136",
		  "label":"Hard disk 1",
		  "name":"450-2000",
		  "size_bytes":53687091200
		}
		],
		"cmdb_ci_vmware_nic": [
		{
		  "mac_address": "00:50:56:a7:c2:27",
		  "cmdb_ci": "vm-2394",
		  "dns_server": [
		  ],
		  "ip_address": "172.16.4.135",
		  "subnet_mask": "255.255.255.0"
		},
		{
		  "mac_address": "00:50:56:a7:0d:c9",
		  "cmdb_ci": "vm-2305",
		  "dns_server": [
		  ],
		  "ip_address": "172.16.4.45",
		  "subnet_mask": "255.255.255.0"
		}
	  ]
	}
*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	getProbeParms();

	_this = this;

	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');
	args.mutexPrefix = datacenterMorId;
	args.ignoreStaleness = true;

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	output = JSON.parse(output);
	args.results = output;

	args.results.cmdb_ci_endpoint_block = blockEndpoints;
	args.results.cmdb_ci_endpoint_vnic = nicEndpoints;
	args.results = JsonCi.prepare(args);
	JsonCi.writeJsObject(args);

	if (DiscoveryCMPUtils.isCmpActive()) {
		JsonCi.updateRelationships(args);
		avoidIe || DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);
	}
}

function getProbeParms() {
	vCenterSysId = '' + g_probe.getParameter('vcenter_sys_id');
	vCenterUuid = '' + g_probe.getParameter('vcenter_uuid');
	datacenterSysId = '' + g_probe.getParameter('datacenter_sys_id');
	datacenterMorId = '' + g_probe.getParameter('datacenter_mor_id');
	fullDiscovery = ('' + g_probe.getParameter('full_discovery')) == 'true';
	debug = '' + g_probe.getParameter('debug');
	avoidIe = DiscoveryCMPUtils.isCmpActive() && (('' + g_probe.getParameter('avoid_id_engine')) != 'false');
}

function fixupDisk(disk) {
	// Save what we need to call the cloud API
	disk.vm_object_id = disk.computer;
	disk.vm_table = 'cmdb_ci_vmware_instance';
	disk.storage_type = 'VMware vdisk';

	disk.computer = VMUtils.lookupSysIds(disk.vm_object_id, 'cmdb_ci_vmware_instance', vCenterSysId);
	if (!disk.computer) {
		disk.computer = VMUtils.lookupSysIds(disk.vm_object_id, 'cmdb_ci_vmware_template', vCenterSysId);
		disk.vm_table = 'cmdb_ci_vmware_template';
	}

	if (DiscoveryCMPUtils.isCmpActive()) {
		disk.cmdb_ci_vcenter_datacenter = datacenterSysId;
		disk.state = 'in_use';
		if (avoidIe) {
			blockEndpoints.push({
				object_id: disk.object_id,
				name: disk.name,
				host: disk.computer,
				volume: disk
			});
		}
	}
}

function fixupNic(nic) {
	nic.vm_object_id = nic.cmdb_ci;
	nic.vm_table = 'cmdb_ci_vmware_instance';

	nic.cmdb_ci = VMUtils.lookupSysIds(nic.vm_object_id, 'cmdb_ci_vmware_instance', vCenterSysId);
	if (!nic.cmdb_ci) {
		nic.cmdb_ci = VMUtils.lookupSysIds(nic.vm_object_id, 'cmdb_ci_vmware_template', vCenterSysId);
		nic.vm_table = 'cmdb_ci_vmware_template';
	}

	nic.vcenter_ref = vCenterSysId;
	nic.vcenter_uuid = vCenterUuid;
	
	nic.name = nic.mac_address;
	nic.object_id = nic.mac_address;

	if (DiscoveryCMPUtils.isCmpActive()) {
		nic.cmdb_ci_vcenter_datacenter = datacenterSysId;
		if (avoidIe) {
			nicEndpoints.push({
				object_id: nic.object_id,
				name: nic.name,
				host: nic.cmdb_ci,
				nic: nic
			});
		}
	}
}
})();
