var WorkflowStageDef = Class.create();

WorkflowStageDef.prototype = {

  FINISHERS: { complete: true, completed: true, cancelled: true, closed_incomplete : true, "Request Cancelled" : true },

  initialize : function(version) {
     this.workflowVersion = version;
  },

  load : function() {
      this.stageIds = {}
      this.stages = [];
      var gr = new GlideRecord('wf_stage');
      gr.addQuery('workflow_version', this.workflowVersion);
      gr.orderBy('order');
      gr.queryNoDomain();
      while (gr.next()) {
         var stageId = gr.sys_id.toString();
         var value = gr.value.toString();
         if (!value)
            value = gr.name.toString().toLowerCase();
         
         if (this.FINISHERS[value])
            continue;
         
         var stage = {};
         stage.label = gr.name.getDisplayValue();
         stage.value = value;
         stage.state = "skipped";
         if (gr.ola.getGlideObject().getNumericValue() > 0)
            stage.duration = gr.ola.getDisplayValue();
         else
            stage.duration = "";
         
         this.stages.push(stage);
         this.stageIds[stageId] = stage;
      }
  },

  getStages : function() {
      return this.stages;
  },

  getStageIds : function() {
      return this.stageIds;
  },

  type: "WorkflowStageDef"
}

var workflowLoadedStages = new Object();

function WorkflowStageDefPut(version, def) {
    workflowLoadedStages[version] = def;
}

function WorkflowStageDefGet(version) {
    var answer = workflowLoadedStages[version];
    if (answer)
       return answer;
    
    answer = new WorkflowStageDef(version);
    answer.load();
    WorkflowStageDefPut(version, answer);
    return answer;
}