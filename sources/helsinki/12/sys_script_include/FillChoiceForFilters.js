var FillChoiceForFilters = Class.create();
FillChoiceForFilters.prototype = {
	initialize: function() {
	},
 
	fillChoice:function() {
		var gp = [];
 
		var grp = new GlideRecord('sys_choice');

		var tables = new TableUtils(current.source_table).getTables();
		tables = tables.toString();
		tables = tables.replace("[","");
		tables = tables.replace("]","");
		tables = tables.replace(" ","");
		
		grp.addQuery('name', 'IN', tables);
		grp.addQuery('element', current.source_field);
		grp.query();
		while(grp.next()) {
			gp.push('' + grp.sys_id);
		}
		return 'sys_idIN' + gp.toString();
	},
	type: 'FillChoiceForFilters'
};