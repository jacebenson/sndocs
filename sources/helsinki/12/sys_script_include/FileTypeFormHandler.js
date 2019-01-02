var FileTypeFormHandler = function(appId) {

	function viewsForApp() {
		var sections = getSections();
		
		var tablesAndViews = _.chain(sections)
			.map(function(section) {
				return {
					view : section.view,
					table : section.table
				}
			})
			.unique(function(entry) { return entry.table + entry.view })
			.value();
		
		var viewNameById = getViewNames(_.pluck(tablesAndViews, 'view'));
		var tableLabelsByName = TableLabelMap.labelsForTables(_.pluck(tablesAndViews, 'table'));
		
		return _.chain(tablesAndViews)
			.map(function(entry) {
				return {
					table : entry.table,
					tableLabel : tableLabelsByName[entry.table] || entry.table,
					view : viewNameById[entry.view] || entry.view,
					sysId : entry.view
				};
			})
			.sortBy(function(entry) { return entry.table + entry.view; })
			.value();
	}
	
	function getSections() {
		var gr = new GlideRecord('sys_ui_section');
		gr.addQuery('sys_scope', appId);
		gr.query();
		return _gr(gr).map(function(row) {
			return {
				sysId : row.getUniqueValue(),
				view : row.getValue('view'),
				table : row.getValue('name')
			}
		});
	}
	
	function getViewNames(viewIds) {
		var gr = new GlideRecord('sys_ui_view');
		gr.addQuery('sys_id', 'IN', viewIds);
		gr.query();
		return _gr(gr).reduce(function(memo, row) {
			memo[row.getUniqueValue()] = row.getValue('title');
			return memo;
		}, {});
	}
		
	function filesForKey() {
		var tablesAndViews = viewsForApp();
		return _.map(tablesAndViews, function(entry) {
			var name = entry.tableLabel + ' [' + entry.view + ']';
			return FileTypeFileBuilder.newFile()
				.withId('form.' + name)
				.withName(name)
				.withSysId(entry.sysId)
				.addCustom('tableName', entry.table)
				.build();
		});
	}
	
	return {
		filesForKey : filesForKey
	}
};