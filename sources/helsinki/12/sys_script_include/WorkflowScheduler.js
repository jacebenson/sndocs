var WorkflowScheduler = Class.create();

WorkflowScheduler.prototype = {
  initialize : function() {
  },

  run: function() {
    var vars = this._getWorkflowVariables(current.workflow);
    new Workflow().startFlow(current.workflow, null, 'insert', vars);
  },

  _getWorkflowVariables: function(workflow) {
       var vars = {};

       var varNames = workflow.vars.getVariableNames();
       for(var i = 0; i < varNames.length; i++) {
           var name = varNames[i];
           var value = workflow.vars.getVariableValue(name);
           vars[name] = value;
       }

       return vars;
  },

  type: "WorkflowScheduler"
}