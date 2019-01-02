var WorkflowActivityDef = Class.create();

WorkflowActivityDef.prototype = {

  initialize : function(version) {
     this.workflowVersion = version;
  },

  load : function() {
      this.activities = new Array();
      
      var gr = new GlideRecord('wf_activity');
      gr.initialize();
      gr.addQuery('workflow_version', this.workflowVersion);
      gr.queryNoDomain();
      while (gr.next()) {
         var stageId = gr.stage.toString();
         if (!stageId)
            continue;
         
         var activityId = gr.sys_id.toString();
         var waid = new WorkflowActivityIDValues(stageId, activityId);
         this.activities.push(waid);
      }
  },

  getActivity : function() {
      return this.activities;
  },

  type: "WorkflowActivityDef"
}

var workflowLoadedActivityDefs = new Object();

function WorkflowActivityDefPut(version, def) {
    workflowLoadedActivityDefs[version] = def;
}

function WorkflowActivityDefGet(version) {
    var answer = workflowLoadedActivityDefs[version];
    if (answer)
       return answer;
    
    answer = new WorkflowActivityDef(version);
    answer.load();
    WorkflowActivityDefPut(version, answer);
    return answer;
}