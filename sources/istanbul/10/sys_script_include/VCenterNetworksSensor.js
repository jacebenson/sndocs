/* jshint -W030 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterNetworksSensor;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, debug, _this,
	vmMap = { },
	networkSchema = {
		cmdb_ci_vcenter_network: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupNetwork,
			preWriteRels: preWriteNetworkRels,
			parentOf: {
				cmdb_ci_esx_server: 'Provided by::Provides'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by',
				cmdb_ci_vmware_instance: 'Connected by::Connects',
				cmdb_ci_vmware_template: 'Connected by::Connects'
			}
		}
	},
	args = {
		schema: networkSchema
	};

VCenterNetworksSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity, so possibly inconsistent:
{
  "cmdb_ci_vcenter_network": [
    {
      "type": "DistributedVirtualPortgroup",
      "morid": "dvportgroup-28",
      "accessible": true,
      "name": "DC1_DVPG0",
      "vm": [
        "vm-1612",
        "vm-9068"
      ],
      "cmdb_ci_esx_server": [
        "host-5624",
        "host-7452"
      ]
    }
  ]
}
*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	var datastores, hosts, networks, vms,
		childOf = networkSchema.cmdb_ci_vcenter_network.childOf,
		probeParms = getProbeParms();

	_this = this;

	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');
	args.mutexPrefix = datacenterMorId;

	// If we're doing a full discovery, assume relationships will be built
	// from the other side for networks and datastores
	if (fullDiscovery) {
		delete childOf.cmdb_ci_vmware_instance;
		delete childOf.cmdb_ci_vmware_template;
	}
	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	this.root = g_probe.getDocument().getDocumentElement();
	this.statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	args.results = JSON.parse(output);

	if (args.results.leftOverMors && args.results.leftOverMors.length) {
		probeParms.mor_ids = JSON.stringify(args.results.leftOverMors);
		this.triggerProbe('VMWare - vCenter Networks', probeParms);
	}

	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);
}

//////////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////////
function fixupNetwork(network) {
	network.cmdb_ci_vcenter_datacenter = datacenterSysId;

	network.vcenter_ref = vCenterSysId;
	network.vcenter_uuid = vCenterUuid;
	network.object_id = network.morid;
	network.accessible = !!network.accessible;
}

//////////////////////////////////////////////////////////////////////////
function preWriteNetworkRels(network) {
	network.cmdb_ci_esx_server = VMUtils.lookupSysIds(network.cmdb_ci_esx_server, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
	network.cmdb_ci_vmware_instance = VMUtils.lookupSysIds(network.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
	network.cmdb_ci_vmware_template = VMUtils.lookupSysIds(network.vm, 'cmdb_ci_vmware_template', vCenterSysId);
}
	
})();
