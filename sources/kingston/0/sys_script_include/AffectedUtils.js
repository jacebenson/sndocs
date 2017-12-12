var AffectedUtils = Class.create();
AffectedUtils.prototype = {
    initialize: function() {
    },
	
	hasAffected : function(taskGR, table, field) {
		var affectedGR = new GlideRecord(table);
		affectedGR.setLimit(1);
		affectedGR.addQuery(field, taskGR.sys_id);
		affectedGR.query();
		if (affectedGR.getRowCount() > 0)
			return true;
		
		return false;
	},
	
    type: 'AffectedUtils'
};