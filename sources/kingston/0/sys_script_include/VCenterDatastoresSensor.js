/* jshint -W030 */

var VCenterDatastoresSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery,
	_this, enableCmpApi,
	vmMap = { },
	datastoreSchema = {
		cmdb_ci_vcenter_datastore: {
			index: [ 'morid', 'vcenter_uuid' ],
			fixup: fixupDatastore,
			preWriteRels: preWriteDatastoreRels,
			parentOf: {
				cmdb_ci_vmware_instance: 'Provides storage for::Stored on',
				cmdb_ci_vmware_template: 'Provides storage for::Stored on',
				cmdb_ci_esx_server: 'Used by::Uses',
				cmdb_ci_vcenter_datastore: 'Cluster of::Cluster',
				hostedOn: 'Hosted on::Hosts'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by'
			}
		},
		vcenter_datastore_hostmount: {
			index: [ 'datastore', 'esx_server' ],
			fixup: fixupHostmount,
			preWrite: preWriteHostMount
		},
		cmdb_ci_vcenter_datastore_disk: {
			index: [ 'vcenter_uuid', 'name', 'datastore' ],
			fixup: fixupDatastoreDisk,
			childOf: {
				cmdb_ci_vcenter_datastore: 'Provided by::Provides'
			},
			parentOf: {
				cmdb_ci_storage_device: 'Exports to::Imports from'
			}
		}
	},
	args = {
		schema: datastoreSchema
	};

VCenterDatastoresSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity, so possibly inconsistent:
	{
	  "cmdb_ci_vcenter_datastore": [
		{
		  "type": "VMFS",
		  "morid": "datastore-490",
		  "thin": true,
		  "vm": [

		  ],
		  "host": [
			{
			  "host": "host-381",
			  "accessible": true,
			  "access_mode": "readWrite",
			  "datastore": "<reference to datastore-490>"
			}
		  ],
		  "accessible": false,
		  "capacity": 1024,
		  "freespace": 768,
		  "name": "SANLAB1DS_DC0_C7_H1_0",
		  "url": "ds:\/\/\/vmfs\/volumes\/52f01bf4-637d-bf51-2f00-f06cdf6c2984\/"
		}
	  ],
	  "vcenter_datastore_hostmount": [
		{
		  "host": "host-381",
		  "accessible": true,
		  "access_mode": "readWrite",
		  "datastore": "<reference to datastore-490>"
		}
	  ],
	  "cmdb_ci_vcenter_datastore_disk": [
		{
		  "datastore": "<reference to datastore-490>",
		  "name": "mpx.vmhba1:C0:T0:L0",
		  "correlation_id": "0000000000766d686261313a303a30",
		  "size_bytes": 587128266752
		}
	  ]
	}
*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	var datastores, hosts, networks, vms,
		parms,
		parentOf = datastoreSchema.cmdb_ci_vcenter_datastore.parentOf;

	_this = this;

	getProbeParms();

	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');
	args.mutexPrefix = datacenterMorId;

	// If we're doing a full discovery, assume relationships will be built
	// from the other side for networks and datastores
	if (fullDiscovery) {
		delete parentOf.cmdb_ci_vmware_instance;
		delete parentOf.cmdb_ci_vmware_template;
	}

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	args.results = JSON.parse(output);
	args.results = JsonCi.prepare(args);

	VMUtils.triggerNextPage(_this, args.results.leftOverMors);

	JsonCi.writeJsObject(args);

	// Trigger probes configured to run after the datastores sensor.
	VMUtils.triggerProbes(_this, { datastore: args.results.cmdb_ci_vcenter_datastore });

	args.results.cmdb_ci_vcenter_datastore_disk.forEach(
		function(dsd) {
			dsd.cmdb_ci_vcenter_datastore = dsd.datastore;
		});
	JsonCi.updateRelationships(args, vCenterUuid);

	enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);
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
function fixupHostmount(hm) {
	hm.esx_server = VMUtils.lookupSysIds(hm.host, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
	hm.vcenter_ref = vCenterSysId;
}

//////////////////////////////////////////////////////////////////////////
function preWriteHostMount(hm) {
	// Normally this function would call the default preWrite function to set first & last
	// discovered, etc.  The hostmount table, though, doesn't extend cmdb_ci, so it doesn't
	// have any of those fields.
	return !!hm.esx_server;
}

//////////////////////////////////////////////////////////////////////////
function fixupDatastore(ds) {
	ds.vcenter_ref = vCenterSysId;
	ds.vcenter_uuid = vCenterUuid;
	ds.accessible = !!ds.accessible;

	ds.object_id = ds.morid;

	ds.cmdb_ci_vcenter_datacenter = datacenterSysId;

	if (DiscoveryCMPUtils.isCmpActive())
		ds.hostedOn = datacenterSysId;
}

//////////////////////////////////////////////////////////////////////////
function preWriteDatastoreRels(ds) {

	ds.cmdb_ci_esx_server = [ ];
	ds.host.forEach(
		function(host) {
			var sysId = VMUtils.lookupSysIds(host.host, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
			if (sysId)
				ds.cmdb_ci_esx_server.push(sysId);
		});

	ds.cmdb_ci_vcenter_datastore = VMUtils.lookupSysIds(ds.stores, 'cmdb_ci_vcenter_datastore', vCenterSysId);

	if (!fullDiscovery) {
		ds.cmdb_ci_vmware_instance = VMUtils.lookupSysIds(ds.vm, 'cmdb_ci_vmware_instance', vCenterSysId);
		ds.cmdb_ci_vmware_template = VMUtils.lookupSysIds(ds.vm, 'cmdb_ci_vmware_template', vCenterSysId);
	}
}

//////////////////////////////////////////////////////////////////////////
function fixupDatastoreDisk(dsd) {
	var gr,
		hosts = [];
	
	dsd.vcenter_uuid = vCenterUuid;

	dsd.datastore.host.forEach(function(host) { hosts.push(host.host); });
	hosts = VMUtils.lookupSysIds(hosts, 'cmdb_ci_esx_server', vCenterSysId, 'morid');

	dsd.cmdb_ci_storage_device = [ ];
	gr = new GlideRecord('cmdb_ci_storage_device');
	gr.addQuery('computer.sys_class_name', 'cmdb_ci_esx_server');
	gr.addQuery('device_id', dsd.name);
	gr.addQuery('computer', 'IN', hosts);
	gr.query();
	while (gr.next())
		dsd.cmdb_ci_storage_device.push('' + gr.sys_id);
}

})();
