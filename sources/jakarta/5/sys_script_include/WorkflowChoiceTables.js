var WorkflowChoiceTables = Class.create();
WorkflowChoiceTables.prototype = {
	initialize: function() {
	},
	
	process: function(tableName) {
		var sysMeta = GlideDBObjectManager.get().getAllExtensions("sys_metadata");
		var isMaint = gs.hasRole("maint")
		
		var gr = new GlideRecord('sys_db_object');
		gr.query();

		answer = [];
		while (gr.next()) 
			if (isTableOkForWorkflow(gr.name+''))
				answer.push(gr.label+'');
		
		return answer;
		
		
		function isTableOkForWorkflow(tableName) {
			 return !sysMeta.contains(tableName) || isMaint;
		}
	},
	
	type: 'WorkflowChoiceTables'
}