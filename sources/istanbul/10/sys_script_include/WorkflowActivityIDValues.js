var WorkflowActivityIDValues = Class.create();

WorkflowActivityIDValues.prototype = {
  initialize : function(stageID, activityID) {
     this.stageID = stageID;
     this.activityID = activityID;
  },

  getStageID : function() {
     return this.stageID;
  },

  getActivityID: function() {
     return this.activityID;
  },

  type: "WorkflowActivityIDValues"
}