var DiscoveryCMPUtils;

(function() {
 
DiscoveryCMPUtils = {
	isCmpActive: isCmpActive,
	callCmpApi: callCmpApi
};

var vCenterUuid, datacenterMorId, cmpScript,
	objectIdMap = { },
	cmpRecs = [ ],
	validators = {
		cmdb_ci_vmware_instance: 'vm_instance_create_validator',
		cmdb_ci_vmware_template: 'compute_template_create_validator',
		cmdb_ci_vcenter_network: 'network_create_update_validator'
	},
	referenceTo = {
		cmp_cmdb_ci_vmware_instance: 'cmdb_ci_vmware_instance',
		cmp_cmdb_ci_virtualization_server: 'cmdb_ci_virtualization_server'
	},
	builders = {
		cmdb_ci_vmware_instance: getCmpVmInstance,
		cmdb_ci_vmware_template: getCmpVmTemplate,
		cmdb_ci_storage_volume: getCmpStorageVolume,
		cmdb_ci_vmware_nic: getCmpNic,
	};

function isCmpActive() {
	return GlidePluginManager.isActive('com.snc.cloud.mgmt');
}

/*
 * Call CMP's API for creation of service account and endpoints.
 */
function callCmpApi(results, vcenterId, datacenterId) {
	var name;
	
	if (!isCmpActive())
		return;

	cmpScript = sn_cmp_api.CloudModelProcessorScript && new sn_cmp_api.CloudModelProcessorScript();
	vCenterUuid = vcenterId;
	datacenterMorId = datacenterId;

	for (name in results)
		builders[name] && results[name].forEach(builders[name]);

	try {
		cmpScript.createOrUpdateCI(vCenterUuid, datacenterMorId, cmpRecs);
	} catch (e) {
		gs.error(e.toString());
	}

}

function getCmpVmInstance(vm) {
	var cmpVm = getCmpStub(vm, 'cmdb_ci_vmware_instance'),
		bindings = cmpVm.cmdb_ci_vmware_instance.bindings;
	
	cmpRecs.push(cmpVm);
}

function getCmpVmTemplate(template) {
	var cmpVm = getCmpStub(template, 'cmdb_ci_vmware_template'),
		bindings = cmpVm.cmdb_ci_vmware_template.bindings;
	
	cmpRecs.push(cmpVm);
}

function getCmpNetwork(network) {
	cmpRecs.push(getCmpStub(network, 'cmdb_ci_vcenter_network'));
}
	
function getCmpDvs(dvs) {
	var dvsRec = getCmpStub(dvs, 'cmdb_ci_vcenter_dvs'),
		bindings = dvsRec.bindings;
	cmpRecs.push(dvsRec);
}

function getCmpDvPortGroup(dvpg) {
	var dvpgRec = getCmpStub(dvpg, 'cmdb_ci_vcenter_dv_port_group'),
		bindings = dvpgRec.bindings;
	cmpRecs.push(dvpgRec);
}

function getCmpDatastore(datastore) {
	var dsRec = getCmpStub(datastore, 'cmdb_ci_vcenter_datastore'),
		bindings = dsRec.bindings;
	cmpRecs.push(dsRec);
}

function getCmpCluster(cluster) {
	var dsRec = getCmpStub(cluster, 'cmdb_ci_vcenter_cluster'),
		bindings = dsRec.bindings;
	cmpRecs.push(dsRec);
}

function getCmpResourcePool(rp) {
	var dsRec = getCmpStub(rp, 'cmdb_ci_esx_resource_pool'),
		bindings = dsRec.bindings;
	cmpRecs.push(dsRec);
}

function getCmpEsxServer(esx) {
	var dsRec = getCmpStub(esx, 'cmdb_ci_esx_server'),
		bindings = dsRec.bindings;
	cmpRecs.push(dsRec);
}

// Build the CMP structure for cmdb_ci_storage_volume bindings
function getCmpStorageVolume(volume) {
	volume.name = '' + volume.name;
//var vm = getStorageVolumeFromComponent(volume),
var vol = getCIFromComponent(volume,'cmdb_ci_storage_volume',volume.object_id),
bindings = vol.bindings,
		binding = {
			attach_to: {
implemented_by: {
endpoint_ci: 'cmdb_ci_endpoint_block',
endpoint_identification: {
						object_id: volume.object_id,
				},
					attributes: {
						object_id: volume.object_id,
						name: volume.name
					}
				}
			}
		};
bindings.push(binding);
var cmpVm = getCmpVmInstanceFromComponent(volume),
bindingforVM = {
attach_to: {
used_by: {
endpoint_ci:'cmdb_ci_endpoint_block',
endpoint_identification:{object_id:volume.object_id},
attributes: {
			object_id: volume.object_id,
			name: volume.name
		}
		}
		}
	};
cmpVm.bindings.push(bindingforVM);
		}
// function getStorageVolumeFromComponent(rec) {
// var cmpObj,
// objectId = rec.object_id,
// table = 'cmdb_ci_storage_volume';

// if (!objectIdMap[objectId]) {
// cmpObj = { };
// cmpObj[table] = {
// attributes: { },
// bindings: [ ]
// };

// objectIdMap[objectId] = cmpObj[table];

// objectIdMap[objectId].identification = getCmpIdentifier({ object_id: rec.object_id,}, table);
// cmpRecs.push(cmpObj);
// }
// return objectIdMap[objectId];
// }

function getCIFromComponent(rec,tableName,object_id) {
var cmpObj,
objectId = object_id,
table = tableName;

if (!objectIdMap[objectId]) {
cmpObj = { };
cmpObj[table] = {
attributes: { },
bindings: [ ]
	};

objectIdMap[objectId] = cmpObj[table];

objectIdMap[objectId].identification = getCmpIdentifier({ object_id: object_id,}, table);
cmpRecs.push(cmpObj);
}
return objectIdMap[objectId];
}


// Build the CMP structure for a cmdb_ci_vmware_nic binding
function getCmpNic(nic) {
	nic.object_id = nic.mac_address;
//var vnics = getNICInstanceFromComponent(nic),
var vnics = getCIFromComponent(nic,'cmdb_ci_vmware_nic',nic.mac_address),
bindings=vnics.bindings;
var binding = {
			attach_to: {
implemented_by: {
endpoint_ci:'cmdb_ci_endpoint_vnic',
endpoint_identification:{object_id:nic.mac_address},
					attributes: {
						object_id: nic.mac_address,
						name: nic.name
					}
					}
				}
		};

bindings.push(binding);
var cmpVm = getCmpVmInstanceFromComponent(nic);
var bindingforVM = {
attach_to: {
used_by: {
endpoint_ci:'cmdb_ci_endpoint_vnic',
endpoint_identification:{object_id:nic.mac_address},
attributes: {
			object_id: nic.mac_address,
name: nic.name
		}
		}
		}
	};
cmpVm.bindings.push(bindingforVM);
//cmpRecs.push(cmpVm);
		}
// function getNICInstanceFromComponent(rec) {
// var cmpObj,
// objectId = rec.mac_address,
// table = 'cmdb_ci_vmware_nic';

// if (!objectIdMap[objectId]) {
// cmpObj = { };
// cmpObj[table] = {
// attributes: { },
// bindings: [ ]
// };

// objectIdMap[objectId] = cmpObj[table];

// objectIdMap[objectId].identification = getCmpIdentifier({ object_id: rec.mac_address}, table);
// cmpRecs.push(cmpObj);
// }
// return objectIdMap[objectId];
// }

function getCmpStub(obj, table) {
	var name, tableName, objectId,
		cmpRec = { },
		stub = {
			validator: validators[table],
			validator_overrides: {
				cmdb_ci_cloud_service_account: 'INSERT,UPDATE',
				cmdb_ci_vmware_instance: 'INSERT,UPDATE',
				cmdb_ci_vmware_template: 'INSERT,UPDATE',
				cmdb_ci_network: 'INSERT,UPDATE',
				cmdb_ci_endpoint_block: 'INSERT,UPDATE',
				cmdb_ci_storage_volume: 'INSERT,UPDATE',
//				cmdb_ci_datastore: 'INSERT,UPDATE'
			},
			identification: getCmpIdentifier(obj, table),
			attributes: { object_id: obj.object_id },
			references: { }
		};
	for (name in obj) {
		if (referenceTo.hasOwnProperty(name)) {
			tableName = referenceTo[name];
			objectId = obj[name];
			stub.references[tableName] = {
				identification: getCmpIdentifier(objectId, tableName),
				attributes: {
					object_id: objectId
				}
			};
		}
	}
	cmpRec[table] = stub;
	return cmpRec;
}

// 
function getCmpIdentifier(obj, table) {
	var identifier = {
		cmdb_ci_cloud_service_account: {
			criterion: {
				account_id: vCenterUuid,
				object_id: vCenterUuid
			}
		},
		cmdb_ci_vcenter_datacenter: {
			criterion: {
				object_id: datacenterMorId
			}
		}
	};

	if (typeof obj == 'object')
		obj = obj.object_id;

	identifier[table] = { criterion: { object_id: obj } };
	return identifier;
}

function getCmpVmInstanceFromComponent(rec) {
	var cmpObj,
		objectId = rec.vm_object_id,
		table = rec.vm_table;

	if (!objectIdMap[objectId]) {
		cmpObj = { };
		cmpObj[table] = {
			validator: 'vm_instance_create_validator',
			validator_overrides: {
				cmdb_ci_cloud_service_account : "INSERT,UPDATE",
				cmdb_ci_vmware_instance: "INSERT,UPDATE",
				cmdb_ci_vmware_nic: "INSERT,UPDATE",
			},
			attributes: { },
			bindings: [ ]
		};

		objectIdMap[objectId] = cmpObj[table];

		objectIdMap[objectId].identification = getCmpIdentifier({ object_id: rec.vm_object_id }, table);

		if (table != 'cmdb_ci_vmware_template')
			cmpRecs.push(cmpObj);
	}
	return objectIdMap[objectId];
}

})();