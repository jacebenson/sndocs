var WorkflowActivityIDValues = Class.create();

WorkflowActivityIDValues.prototype = {
  initialize : function(stageID, activityID, activityAttributes) {
     this.stageID = stageID;
     this.activityID = activityID;
	 this.activityAtt = activityAttributes;
  },

  getStageID : function() {
     return this.stageID;
  },

  getActivityID : function() {
     return this.activityID;
  },
	
  getActivityAttributes : function() {
	  return this.activityAtt;
  },

  type: "WorkflowActivityIDValues"
}