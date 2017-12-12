var HRBenefitTables = Class.create();
HRBenefitTables.prototype = {
    initialize: function() {
    },
	
	process: function() {
		var tables = [];

		var definition = new GlideRecord("sys_db_object");
		definition.query("super_class.name", "sn_hr_core_benefit");
		while (definition.next())
			tables.push(definition.name.toString());

		return tables;
	},
	
    type: 'HRBenefitTables'
};