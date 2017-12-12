var HRCoe = Class.create();

HRCoe.prototype = {
    initialize: function() {
    },
	
	process: function() {
		var tables = [];
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables","").split(",");
		
		// Add non-inactive sn_hr_core_case tables
		var caseTables = hr.TABLE_CASE_EXTENSIONS;
		for (var i = 0; i < caseTables.length; i++)
			if (inactiveTables.indexOf(caseTables[i]) == -1)
				tables.push(caseTables[i].toString());
		
		return tables;
	},
	
	getThisScopeCOEs : function (scope) {
		var result = [];
		var caseTables = hr.TABLE_CASE_EXTENSIONS; 
		for (var t in caseTables) {
			var table = new GlideRecord('sys_db_object');
			table.addQuery('name', caseTables[t]);
			if (scope != 'global')
				table.addQuery('sys_scope',scope);
			table.query();
			if (table.next())
				result.push(table.name);
		}
		return result.join(',');
	},

    type: 'HRCoe'
};