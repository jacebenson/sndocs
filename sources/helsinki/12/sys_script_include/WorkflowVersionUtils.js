var WorkflowVersionUtils = Class.create();
WorkflowVersionUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isWorkflowNameUnique: function() {
		var name = this.getParameter('sysparm_workflow_name');
		var id = new Workflow().getWorkflowFromName(name) + '';
		if (id == 'null')
			return 'true'; // Did not find a sys_id, the name is unique, it does not yet exist in the database
		
		return 'false'; // We found a sys_id, the name is not unique, it is a duplicate 
	},
	
	// get the wf_workflow id given a wf_workflow_version id 
	getWorkflow: function() {
		var version = new GlideRecord("wf_workflow_version");
		var id =  this.getParameter('sysparm_id');
		
		if (version.get(id)) {
			gs.log("Cannot locate workflow version: " + id);
			return "-1";
		}
	
		return version.workflow+"";
	},
	
	/** Return 'true' if the given table has a type=workflow field
	 *  or 'false' it does not.
	 */
	hasStageField: function (tableName) {
		return this.getStageFields(tableName).length == 0 ? 'false' : 'true';
	},
	
	/** Return array of any type=workflow field for the given table.
	 *  It is empty if there are none.
	 *
	 * Call this either as Client Ajax or public script
	 */
	getStageFields: function (table) {
		var tbl = table ? table : this.getParameter('sysparm_table');		
		if (!tbl)
		    return [];
		
	    var gr = tbl instanceof String ? loadRecord(tbl) : tbl;
		var elements = gr.getElements();
		
		var fieldNames = [];
		for (var i = 0; i < elements.size(); i++) 
			if (elements.get(i).getED().getInternalType()+'' == 'workflow')
				fieldNames.push(elements.get(i).name);
		
		return fieldNames;

		
		function loadRecord(tableName) {
			var gr = new GlideRecord(tableName);
			gr.initialize();
			return gr;
		}
	},
	
    type: 'WorkflowVersionUtils'
});