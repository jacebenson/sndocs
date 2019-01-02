(function() {  
	var excludeTables = [
		'clone_log',
		'discovery_log',
		'global',
		'import_log',
		'plan_execution',
		'plan_mysql',
		'plan_oracle',
		'pa_job_log_rows',
		'sla_repair_log_entry',
		'sysevent',
		'syslog',
		'syslog_email',
		'syslog_cancellation',
		'syslog_transaction',
		'sys_attachment_doc',
		'sys_querystat',
		'sys_coalesce_strategy_deferred',
		'sys_export_set_log',
		'sys_email_log',
		'sys_geocoding_request',
		'sys_index_explain',
		'sys_metadata',
		'sys_rw_action',
		'sys_rw_amb_action',
		'sys_rollback_log',
		'sys_schema_change',
		'sys_storage_alias',
		'sys_storage_table_alias',
		'sys_table_partition',
		'sys_upgrade_blame',
		'sys_upgrade_history_log',
		'sys_update_version',
		'sys_user_session',
		'sys_user_token',
		'sys_user_token_network',
		'sys_upgrade_blame',
		'wf_log'
	];
	if(input && input.searchTerm && input.searchTerm.length===32){
		try {
			data.urls = [];
			var check;
			var tableName;
			var table = new GlideRecord('sys_db_object');
			//Make sure we're not looking at a ts (text search) table.
			var query = '';
			query += 'sys_update_nameISNOTEMPTY^';
			for(var i=0;i<excludeTables.length;i++){
				query += 'name!=' + excludeTables[i] + '^'
			}
			query += 'nameISNOTEMPTY^';
			query += 'nameNOT LIKEts_^';
			query += 'nameNOT LIKEv_^';
			table.addEncodedQuery(query); 
			data.query = table.getEncodedQuery();
			table.query();
			while (table.next()) {
				var url = gs.getProperty('glide.servlet.uri');
				tableName = table.getValue('name');
				check = new GlideRecord(tableName);
				check.addQuery('sys_id', input.searchTerm);
				check.query();
				if (check.hasNext()) {
					check.next();
					url += tableName + '.do?sys_id=' + input.searchTerm;
					data.urls.push({
						url: url,
						displayValue: check.getDisplayValue() || "(empty)",
						table: tableName.toString()
					});
				}
			}
		} catch (error){
			// 
		}
	}
})();