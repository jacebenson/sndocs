var ExternalScopeConfigFinder = Class.create();
ExternalScopeConfigFinder.prototype = {
	initialize: function() {
	},
	
	find: function(sys_app) {
		
		return findUpdates(sys_app);
		
		function findUpdates(sys_app) {
			var updates = [];
			
			try {
				var scopeTables = findScopeTables(sys_app);
				var sysMetadataChildren = findMetadataReferencingTables();
				while(next(sysMetadataChildren)) {
					var tableName = sysMetadataChildren.name;
					var columnName = sysMetadataChildren.element;
					
					var externalConfig = findExternalConfig(tableName, columnName, sys_app, scopeTables);
					while(next(externalConfig)) {
						updates.push({
							sys_id: externalConfig.getValue('sys_id'),
							sys_class_name: externalConfig.getValue('sys_class_name'),
							sys_name: externalConfig.getValue('sys_name'),
							external_table_name: externalConfig.getValue(columnName),
							sys_update_name: externalConfig.getValue('sys_update_name')
						});
					}
				}
				
				return updates;
			} catch(e) {
				gs.error('Error finding external scope configuration', e);
				return [];
			}
		}
		
		function findScopeTables(sys_app) {
			var tblQuery = new GlideRecord('sys_db_object');
			tblQuery.addQuery('sys_scope', sys_app.getUniqueValue());
			query(tblQuery);
			
			var tableIdsNames = [];
			while(next(tblQuery)) {
				var sysId = tblQuery.getValue('sys_id');
				var name = tblQuery.getValue('name');
				tableIdsNames.push(sysId);
				tableIdsNames.push(name);
			}
			return tableIdsNames;
		}
		
		function findMetadataReferencingTables() {
			// retrieve all tables that extend sys_metadata and reference a table
			var internalTypes = ['table, table_name'];
			var sysMetadataChildren = new GlideRecord('sys_dictionary');
			sysMetadataChildren.addQuery('internal_type', 'IN', internalTypes);
			var sysDbObjectJoin = sysMetadataChildren.addJoinQuery('sys_db_object', 'name', 'name');
			sysDbObjectJoin.addCondition('super_class.name', 'sys_metadata');
			
			var tables = {};
			query(sysMetadataChildren);
			return sysMetadataChildren;
		}
		
		function findExternalConfig(tableName, columnName, sys_app, scopeTables) {
			var tableRecord = new GlideRecord(tableName);
			tableRecord.addQuery('sys_scope', sys_app.getUniqueValue());
			tableRecord.addQuery(columnName, 'NOT IN', scopeTables);
			query(tableRecord);
			return tableRecord;
		}
		
		function query(record) {
			if (typeof record.query == 'function')
				record.query();
			else if (typeof record._query == 'function')
				record._query();
		}
		
		function next(record) {
			return (typeof record.next == 'function' && record.next()) || (typeof record._next == 'function' && record._next());
		}
	},
	
	type: 'ExternalScopeConfigFinder'
};
