/* jshint -W030 */

var VCenterClustersSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, _this,
	enableCmpApi,
	clusterMap = { },
	schema = {
		cmdb_ci_vcenter_cluster: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupCluster,
			preWriteRels: preWriteClusterRels,
			parentOf: {
				cmdb_ci_esx_server: 'Members::Member of',
				hostedOn: 'Hosted on::Hosts'
			},
			childOf: {
				cmdb_ci_vcenter_folder: 'Contains::Contained by',
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by'
			}
		},
		cmdb_ci_esx_resource_pool: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupResourcePool,
			preWriteRels: preWriteResourcePoolRels,
			parentOf: {
				cmdb_ci_esx_server: 'Defines resources for::Gets resources from',
				cmdb_ci_vcenter_cluster: 'Defines Resources for::Gets resources from',
				cmdb_ci_vmware_instance: 'Members::Member of',
				hostedOn: 'Hosted on::Hosts'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by'
			}
		}
	},
	args = {
		schema: schema
	};

VCenterClustersSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity, so possibly inconsistent:
{
  "hosts": [
    "host-1025"
  ],
  "pools": [
    {
      "morid": "resgroup-106",
      "name": "Resources",
      "owner": "DC0_C14",
      "owner_morid": "domain-c105",
      "cpu_reserved_mhz": 95968,
      "cpu_limit_mhz": 95968,
      "cpu_expandable": true,
      "mem_reserved_mb": 119744,
      "mem_limit_mb": 119744,
      "mem_expandable": true,
      "cpu_shares": 4000,
      "mem_shares": 163840,
      "fullpath": "DC0 | DC0_C14 | Resources"
    }
  ],
  "clusters": [
    {
      "morid": "domain-c105",
      "name": "DC0_C14",
      "cmdb_ci_vcenter_folder": "group-h4",
      "cmdb_ci_esx_server": [
        "host-1025",
        "host-113",
        "host-1205",
        "host-1387",
        "host-1564",
        "host-476",
        "host-654",
        "host-835"
      ],
      "effectivecpu": 95968,
      "effectivememory": 119744,
      "effectivehosts": 8,
      "numhosts": 8,
      "totalcpu": 95968,
      "totalmemory": 137402155008,
      "numcpucores": 32,
      "numcputhreads": 32
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

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	this.root = g_probe.getDocument().getDocumentElement();
	this.statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	output = JSON.parse(output);

	VMUtils.triggerNextPage(_this, output.leftOverMors, [ 'disable_host_storage_probe', 'disable_host_probe' ]);

	args.results = { cmdb_ci_vcenter_cluster: output.clusters };
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);
	enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);
	
	args.results = { cmdb_ci_esx_resource_pool: output.pools };
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);
	enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);

	VMUtils.triggerProbes(_this, { host: output.hosts });
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
function fixupCluster(cluster) {
	cluster.vcenter_ref = vCenterSysId;
	cluster.vcenter_uuid = vCenterUuid;
	cluster.object_id = cluster.morid;

	clusterMap[cluster.object_id] = cluster;
}

//////////////////////////////////////////////////////////////////////////
function preWriteClusterRels(cluster) {
	cluster.cmdb_ci_esx_server = VMUtils.lookupSysIds(cluster.cmdb_ci_esx_server, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
	cluster.cmdb_ci_vcenter_folder = VMUtils.lookupSysIds(cluster.cmdb_ci_vcenter_folder, 'cmdb_ci_vcenter_folder', vCenterSysId);

	if (!cluster.cmdb_ci_vcenter_folder)
		cluster.cmdb_ci_vcenter_datacenter = datacenterSysId;
	
	if (DiscoveryCMPUtils.isCmpActive())
		cluster.hostedOn = datacenterSysId;
}

//////////////////////////////////////////////////////////////////////////
function fixupResourcePool(pool) {
	pool.vcenter_ref = vCenterSysId;
	pool.vcenter_uuid = vCenterUuid;
	pool.object_id = pool.morid;
}

//////////////////////////////////////////////////////////////////////////
function preWriteResourcePoolRels(pool) {
	if (pool.host_morid)
		pool.cmdb_ci_esx_server = VMUtils.lookupSysIds(pool.host_morid, 'cmdb_ci_esx_server', vCenterSysId, 'morid');

	if (!pool.cmdb_ci_esx_server)
		pool.cmdb_ci_vcenter_cluster = VMUtils.lookupSysIds(pool.owner_morid, 'cmdb_ci_vcenter_cluster', vCenterSysId);
	if (!pool.cmdb_ci_vcenter_cluster && !pool.cmdb_ci_esx_server)
		pool.cmdb_ci_vcenter_datacenter = datacenterSysId;

	if (DiscoveryCMPUtils.isCmpActive())
		pool.hostedOn = datacenterSysId;

	pool.cmdb_ci_vmware_instance = pool.cmdb_ci_vmware_instance || VMUtils.lookupSysIds(pool.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
}

})();
