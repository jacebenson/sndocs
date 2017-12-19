/**
 * Choose a workflow based on some criteria.
 * 
 * @author: John Maher
 */

var WorkflowChooser = Class.create();

WorkflowChooser.prototype = {

	initialize: function() {
    },


    /**
     * Choose a workflow from a task_action_workflow record that matches
     * the given action and tablename of the given record.
     */
    chooseWorkflowForAction: function(action, current) {                
        if (!(current && (typeof current['getTableName'] == 'function')))
            return '';
                
        actionWf = this.chooseWorkflowForActionByTable(action, current.getTableName());
        gs.log('Next action: ' + actionWf);
        return actionWf;
    },
    
    /**
    * Find a workflow from task_action_workflow for the specified 
    * action against a given table.
    */    
    chooseWorkflowForActionByTable : function(action, tableName) {
        var actionMappings = new GlideRecord('task_action_workflow');
        //actionMappings.addQuery('table', current.sys_class_name);
        // Using GlideRecord.getTableName is more robust than relying on sys_class_name field
        actionMappings.addQuery('table', tableName);
        actionMappings.addQuery('action', action);
        actionMappings.query();
        if (!actionMappings.next()) 
            return '';
                                
        return '' + actionMappings.workflow.name;
    },

    
    /**
     * Run the workflow that is mapped to the designated action passing it the
     * given current record and optional workflow variables.
     * 
     * @param action - the name of the action as mapped in the task_action_workflow table.
     * @param current - a vm instance record (e.g. My Services portal)
     * @param wfVars - [optional] workflow variables to pass into the flow. 
     * 
     */
    runWorkflowForAction: function(action, current, wfVars) {     
	    var wfName = this.chooseWorkflowForAction(action, current);
	    if (gs.nil(wfName))
	    	return;
	   
	    var vars = wfVars == undefined ? {} : wfVars;
	    vars.u_action = action;
	    return this.runWorkflowForName(wfName, current, vars);
    },
    
    runWorkflowForName: function(wfName, current, wfVars) {
	   var wf = new Workflow();  
	    var workflowId = wf.getWorkflowFromName( wfName );
	    if (gs.nil(workflowId)) {
		    gs.log('workflow: ' + wfName + ' not found');
		    return;
	    }
	    var contextId = wf.startFlow(workflowId, current, '', wfVars);
	    current.update();
		return contextId;
	},
	
    type: 'WorkflowChooser'
};