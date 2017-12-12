var endpointTypes = ['cmdb_ci_endpoint_iis',
					 'cmdb_ci_endpoint_j2ee_ear',
					 'cmdb_ci_endpoint_wmb_flow',
					 'cmdb_ci_endpoint_ebs',
					 'cmdb_ci_endpoint_oracle_db_schema',
					 'cmdb_ci_endpoint_jrun',
					 'cmdb_ci_endpoint_jms_queue',
					 'cmdb_ci_endpoint_jboss',
					 'cmdb_ci_endpoint_ssis_job',
					 'cmdb_ci_endpoint_ems_queue',
					 'cmdb_ci_endpoint_tibco_bw_proc',
					 'cmdb_ci_endpoint_ms_sql',
					 'cmdb_ci_endpoint_ucs',
					 'cmdb_ci_endpoint_aq_queue',
					 'cmdb_ci_endpoint_xenapp_citrx',
					 'cmdb_ci_endpoint_glassfish_war',
					 'cmdb_ci_endpoint_sharepoint_service',
					 'cmdb_ci_endpoint_biztalk_orch',
					 'cmdb_ci_endpoint_oracle_tns',
					 'cmdb_ci_endpoint_mq_queue',
					 'cmdb_ci_endpoint_weblogic_module',
					 'cmdb_ci_endpoint_ldap_db',
					 'cmdb_ci_endpoint_oracle_ias',
					 'cmdb_ci_endpoint_tomcat_war',
					 'cmdb_ci_endpoint_ad_service_in',
					 'cmdb_ci_endpoint_app',
					 'cmdb_ci_endpoint_sap_bo_servers',
					 'cmdb_ci_endpoint_sim_inc',
					 'cmdb_ci_endpoint_storefront_comp'
					];
var dbom = GlideDBObjectManager.get();
var gr;
var gtpc;
var parentType;

gs.log('Check included endpoints parenting...');
for (var i = 0; i < endpointTypes.length; i++) {
	gs.log('Reparenting endpoint of type ' + endpointTypes[i] + '...');
    gr = new GlideRecord(endpointTypes[i]);
	if (!gr.isValid()) {
		gs.log('Not exists in current configuration.');
		continue;
	}
	parentType = dbom.getBase(endpointTypes[i]);
	if (parentType == 'cmdb_ci_endpoint_inclusion') {
		gs.log('Already has proper parent.');
		continue;
	}

	gtpc = new GlideTableParentChange(endpointTypes[i]);
	gtpc.setLiftTuplesToParent(false);
	if (gtpc.change(parentType, 'cmdb_ci_endpoint_inclusion'))
		gs.log('Reparented successfully.');
	else
		gs.log('Failed to reparent.');

}

