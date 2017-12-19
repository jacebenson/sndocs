/* jshint -W030 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterClustersSensor;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, debug, _this,
	parallelHosts,
	clusterMap = { },
	schema = {
		cmdb_ci_vcenter_cluster: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupCluster,
			preWriteRels: preWriteClusterRels,
			parentOf: {
				cmdb_ci_esx_server: 'Members::Member of',
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
				cmdb_ci_vmware_instance: 'Members::Member of'
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

	var datastores, hosts, networks, vms,
		probeParms = getProbeParms();

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

	output = JSON.parse(output);

	if (output.leftOverMors && output.leftOverMors.length) {
		probeParms.mor_ids = JSON.stringify(output.leftOverMors);
		this.triggerProbe('VMWare - vCenter Clusters', probeParms);
	}

	args.results = { cmdb_ci_vcenter_cluster: output.clusters };
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);

	args.results = { cmdb_ci_esx_resource_pool: output.pools };
	JsonCi.prepare(args);
	JsonCi.writeJsObject(args);
	JsonCi.updateRelationships(args);

	if ('' + g_probe.getParameter('disable_host_probe') != 'true')
		fireParallelProbes('VMWare - vCenter ESX Hosts', probeParms, output.hosts, parallelHosts);
}

//////////////////////////////////////////////////////////////////////////
function fireParallelProbes(name, probeParms, all, parallel) {

	var numInGroup;

	while (all.length) {
		numInGroup = Math.ceil(all.length/parallel);
		probeParms.mor_ids = JSON.stringify(all.splice(0, numInGroup), replacer);
		_this.triggerProbe('VMWare - vCenter ESX Hosts', probeParms);
		parallel--;
	}

	function replacer(key, value) {
		if (key != 'name')
			return value;
	}
}

//////////////////////////////////////////////////////////////////////////
function getProbeParms() {
	vCenterSysId = '' + g_probe.getParameter('vcenter_sys_id');
	vCenterUuid = '' + g_probe.getParameter('vcenter_uuid');
	datacenterSysId = '' + g_probe.getParameter('datacenter_sys_id');
	datacenterMorId = '' + g_probe.getParameter('datacenter_mor_id');
	fullDiscovery = ('' + g_probe.getParameter('full_discovery')) == 'true';
	debug = '' + g_probe.getParameter('debug');

	parallelHosts = parseInt(g_probe.getParameter('parallel_host_probes')) || 1;

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

	pool.cmdb_ci_vmware_instance = pool.cmdb_ci_vmware_instance || VMUtils.lookupSysIds(pool.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
}

})();
