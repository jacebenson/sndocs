/* jshint -W030 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterVMsSensor;

(function() {

var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId, fullDiscovery, debug, _this,
	dsMap = { },
	vmSchema = {
		cmdb_ci_vmware_instance: {
			index: [ 'object_id', 'vcenter_uuid' ],
			fixup: fixupVM,
			preWrite: preWriteVm,
			preWriteRels: preWriteVmRels,
			parentOf: {
				cmdb_ci_esx_server: 'Registered on::Has registered',
				cmdb_ci_vcenter_network: 'Connected by::Connects'
			},
			childOf: {
				cmdb_ci_vcenter_datacenter: 'Contains::Contained by',
				cmdb_ci_vcenter_folder: 'Contains::Contained by',
				cmdb_ci_vcenter_datastore: 'Provides storage for::Stored on',
				cmdb_ci_esx_resource_pool: 'Members::Member of'
			}
		},
		cmdb_ci_vmware_nic: {
			index: [ 'cmdb_ci', 'mac_address' ],
			fixup: fixupNic
		}
	},
	args = {
		schema: vmSchema
	};

vmSchema.cmdb_ci_vmware_template = Object.create(vmSchema.cmdb_ci_vmware_instance);
	
VCenterVMsSensor = {
	process: process,
    type: "DiscoverySensor"
};

/*
Sample data.  Truncated for brevity, so possibly inconsistent:
	{
	  "cmdb_ci_vmware_instance": [
		{
		  "type": "VirtualMachine",
		  "morid": "vm-4373",
		  "name": "DC0_C1_RP2_VM11",
		  "cmdb_ci_vcenter_network": [
			"dvportgroup-11"
		  ],
		  "cmdb_ci_vcenter_datastore": [
			"datastore-93"
		  ],
		  "correlation_id": "42273e88-343c-9bda-96e1-9bd9680081f2",
		  "vm_instance_uuid": "5027ad3b-f66e-fe70-ab41-5d2dcdc52521",
		  "template": false,
		  "guest_id": "winNetStandardGuest",
		  "cpus": 1,
		  "memory": 64,
		  "cmdb_ci_esx_morid": "host-1078",
		  "state": "off",
		  "cmdb_ci_vcenter_folder": "group-v3",
		  "object_id": "vm-4373",
		  "image_path": "[SANLAB1GlobalDS_4] DC0_C1_RP2_VM11\/DC0_C1_RP2_VM11.vmx",
		  "disks": 1,
		  "disks_size": 0,
		  "nics": 1
		}
	  ],
	  "cmdb_ci_vmware_template": [
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

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	this.root = g_probe.getDocument().getDocumentElement();
	this.statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	output = JSON.parse(output);
	args.results = output;

	args.results = JsonCi.prepare(args);

	if (args.results.leftOverMors && args.results.leftOverMors.length) {
		probeParms.mor_ids = JSON.stringify(args.results.leftOverMors);
		this.triggerProbe('VMWare - vCenter VMs', probeParms);
	}

	JsonCi.writeJsObject(args);
	
	probeParms.mor_ids = [ ];
	args.results.cmdb_ci_vmware_instance.forEach(pushMorId);
	args.results.cmdb_ci_vmware_template.forEach(pushMorId);
	probeParms.mor_ids = JSON.stringify(probeParms.mor_ids);
	
	if ('' + g_probe.getParameter('disable_vm_nic_probe') != 'true')
		_this.triggerProbe('VMWare - vCenter VM NICs', probeParms);

	JsonCi.updateRelationships(args);

	function pushMorId(vm) { probeParms.mor_ids.push(vm.morid); }
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
function fixupVM(vm) {
	vm.bios_uuid = vm.correlation_id;
	vm.correlation_id = VMUtils.turnUuidToCorrelationId(vm.correlation_id);

	vm.vcenter_ref = vCenterSysId;
	vm.vcenter_uuid = vCenterUuid;
	vm.object_id = vm.morid;
}

//////////////////////////////////////////////////////////////////////////
function preWriteVm(obj, gr) {

	try {
		obj.cmdb_ci_esx_server = VMUtils.lookupSysIds(obj.cmdb_ci_esx_morid, 'cmdb_ci_esx_server', vCenterSysId, 'morid');
		gr = VmwareVmCorrelator.processVmInstanceOrTemplate(obj, obj.macs, obj.sys_class_name == 'cmdb_ci_vmware_template', addCiStuff, obj.cmdb_ci_esx_server);
	} catch (e) {
		DiscoveryLogger.warn(e.msg || e.toString(), 'VCenterVMsSensor', _this.getEccQueueId());
		return false;
	}

	obj.sys_id = '' + gr.sys_id;
	JsonCi.discoveryPostWrite(obj, gr);
	
	return false;
	
	function addCiStuff(gr) {
		JsonCi.discoveryPreWrite(obj, gr);
	}
}

//////////////////////////////////////////////////////////////////////////
function preWriteVmRels(vm) {
	// We tried to look up the esx server when writing the VM (so we could create the guest->ESX relationship.)  The ESX
	// server record may not have been created yet, so we'll try again here if we need to.  If this happens we won't correlate
	// guest->ESX in this sensor, even on rediscovery (because the guest_reconciled flag will be set.)  That's OK because
	// we'll do it in the ESX sensor (which will happen even during rediscovery).
	vm.cmdb_ci_esx_server = vm.cmdb_ci_esx_server || VMUtils.lookupSysIds(vm.cmdb_ci_esx_morid, 'cmdb_ci_esx_server', vCenterSysId, 'morid');

	vm.cmdb_ci_vcenter_folder = VMUtils.lookupSysIds(vm.cmdb_ci_vcenter_folder, 'cmdb_ci_vcenter_folder', vCenterSysId);
	vm.cmdb_ci_vcenter_datastore = VMUtils.lookupSysIds(vm.cmdb_ci_vcenter_datastore, 'cmdb_ci_vcenter_datastore', vCenterSysId);
	vm.cmdb_ci_vcenter_network = VMUtils.lookupSysIds(vm.cmdb_ci_vcenter_network, 'cmdb_ci_vcenter_network', vCenterSysId);
	
	if (vm.cmdb_ci_esx_resource_pool)
		vm.cmdb_ci_esx_resource_pool = VMUtils.lookupSysIds(vm.cmdb_ci_esx_resource_pool, 'cmdb_ci_esx_resource_pool', vCenterSysId);
	else if (vm.vapp)
		vm.cmdb_ci_esx_resource_pool = VMUtils.lookupSysIds(vm.vapp, 'cmdb_ci_esx_resource_pool', vCenterSysId);

	if (!vm.cmdb_ci_vcenter_folder && !vm.cmdb_ci_esx_resource_pool)
		vm.cmdb_ci_vcenter_datacenter = datacenterSysId;
}

//////////////////////////////////////////////////////////////////////////
function fixupNic(nic) {
	nic.vcenter_ref = vCenterSysId;
	nic.vcenter_uuid = vCenterUuid;
}

})();
