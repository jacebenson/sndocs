/* jshint -W030 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterVMNICsSensor;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, debug, _this,
	dsMap = { },
	args = {
		schema: {
			cmdb_ci_vmware_nic: {
				index: [ 'cmdb_ci', 'mac_address' ],
				fixup: fixupNic
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

	var datastores, hosts, networks,
		probeParms = getProbeParms();

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

	args.results = JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
}

function getProbeParms() {
	vCenterSysId = '' + g_probe.getParameter('vcenter_sys_id');
	vCenterUuid = '' + g_probe.getParameter('vcenter_uuid');
	datacenterSysId = '' + g_probe.getParameter('datacenter_sys_id');
	datacenterMorId = '' + g_probe.getParameter('datacenter_mor_id');
	fullDiscovery = ('' + g_probe.getParameter('full_discovery')) == 'true';
	debug = '' + g_probe.getParameter('debug');

	return {
		vcenter_sys_id: vCenterSysId,
		vcenter_uuid: vCenterUuid,
		datacenter_mor_id: datacenterMorId,
		datacenter_sys_id: datacenterSysId,
		full_discovery: fullDiscovery,
		debug: debug
	};
}

function fixupNic(nic) {
	nic.cmdb_ci = VMUtils.lookupSysIds(nic.cmdb_ci, 'cmdb_ci_vm_object', vCenterSysId);
	nic.vcenter_ref = vCenterSysId;
	nic.vcenter_uuid = vCenterUuid;
}

})();
