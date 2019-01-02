var SearchableTablesForDefaultGroup = Class.create();
SearchableTablesForDefaultGroup.prototype = {
    initialize: function() {
    },
	
	process : function() {
		return CodeSearch().getAllSearchableTables();
	},
	
    type: 'SearchableTablesForDefaultGroup'
};