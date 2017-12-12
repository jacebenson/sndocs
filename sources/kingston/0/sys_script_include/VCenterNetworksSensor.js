/* jshint -W030 */

var VCenterNetworksSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery,
	_this, enableCmpApi,
	dvsMap = { },
	networkDvpgDvsSchema = {
		index: [ 'object_id', 'vcenter_uuid' ],
		fixup: fixup,
		preWriteRels: preWriteRels,
		parentOf: {
			cmdb_ci_esx_server: 'Provided by::Provides',
			cmdb_ci_vcenter_dv_port_group: 'Connected by::Connects',
			hostedOn: 'Hosted on::Hosts'

		},
		childOf: {
			cmdb_ci_vcenter_datacenter: 'Contains::Contained by',
			cmdb_ci_vmware_instance: 'Connected by::Connects',
			cmdb_ci_vmware_template: 'Connected by::Connects'
		}
	},
	networkSchema = {
		cmdb_ci_vcenter_network: Object.create(networkDvpgDvsSchema),
		cmdb_ci_vcenter_dv_port_group: Object.create(networkDvpgDvsSchema),
		cmdb_ci_vcenter_dvs: Object.create(networkDvpgDvsSchema)
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
	  "dvs_ref": "dvs-2500",
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

	getProbeParms();

	_this = this;

	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');
	args.mutexPrefix = datacenterMorId;

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	this.root = g_probe.getDocument().getDocumentElement();
	this.statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	args.results = JSON.parse(output);

	VMUtils.triggerNextPage(_this, args.results.leftOverMors);

	args.results.cmdb_ci_vcenter_dvs.forEach(
		function(dvs) {
			dvsMap[dvs.morid] = dvs;
		});

	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);
	enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);

	// Trigger probes configured to run after the networks sensor.
	VMUtils.triggerProbes(_this, {
		network: args.results.cmdb_ci_vcenter_network,
		portGroup: args.results.cmdb_ci_vcenter_dv_port_group,
		dvs: args.results.cmdb_ci_vcenter_dvs
	});
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

//////////////////////////////////////////////////////////////////////////
function fixup(networkDvpgDvs) {
	var dvsMorId = networkDvpgDvs.dvs_ref;

	networkDvpgDvs.cmdb_ci_vcenter_datacenter = datacenterSysId;

	if (DiscoveryCMPUtils.isCmpActive())
		networkDvpgDvs.hostedOn = datacenterSysId;

	networkDvpgDvs.vcenter_ref = vCenterSysId;
	networkDvpgDvs.vcenter_uuid = vCenterUuid;
	networkDvpgDvs.object_id = networkDvpgDvs.morid;
	networkDvpgDvs.accessible = !!networkDvpgDvs.accessible;

	// We may or may not have the DVS for a port group in this payload and/or in the database.
	// We've mapped the DVSs in the payload into dvsMap.  Try to use one of those first.  If
	// the DVS isn't in this payload then try to look it up in the database.
	if (dvsMorId)
		networkDvpgDvs.dvs_ref = dvsMap[dvsMorId] || VMUtils.lookupSysIds(dvsMorId, 'cmdb_ci_vcenter_dvs', vCenterSysId);

	// The DVS isn't in this payload or the DB.  Create a placeholder for it.
	if (dvsMorId && !networkDvpgDvs.dvs_ref)
		networkDvpgDvs.dvs_ref = {
			vcenter_uuid: vCenterUuid,
			vcenter_ref: vCenterSysId,
			object_id: dvsMorId,
			morid: dvsMorId
		};
}

//////////////////////////////////////////////////////////////////////////
function preWriteRels(networkDvpgDvs) {

	var instanceSysMor = [],
		templateSysMor = [];

	networkDvpgDvs.cmdb_ci_esx_server = VMUtils.lookupSysIds(networkDvpgDvs.cmdb_ci_esx_server, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
	networkDvpgDvs.cmdb_ci_vmware_instance = VMUtils.lookupSysIds(networkDvpgDvs.vm, 'cmdb_ci_vmware_instance', vCenterSysId, 'object_id', instanceSysMor);
	networkDvpgDvs.cmdb_ci_vmware_template = VMUtils.lookupSysIds(networkDvpgDvs.vm, 'cmdb_ci_vmware_template', vCenterSysId, 'object_id', templateSysMor);
	
	if (networkDvpgDvs.portgroup)
		networkDvpgDvs.cmdb_ci_vcenter_dv_port_group = VMUtils.lookupSysIds(networkDvpgDvs.portgroup, 'cmdb_ci_vcenter_dv_port_group', vCenterSysId);
}
	
})();
