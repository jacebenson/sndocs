var WFApprovalStages = Class.create();
WFApprovalStages.prototype = {
    initialize: function() {
    },

   getApprovalState: function(current, stageValue, activity) {
      // Only do this for tables that have an approval field
      if (!current.isValidField('approval'))
         return "error - not approval table";
			  
	  if (activity.result == 'skipped')
		  return "skipped";
	   
	  if (activity.result == 'rejected')
		  return "rejected";
	   
	   // The first choice is the approval information
      if ((current.approval == "rejected") || (stageValue == "Request Cancelled")) 
         return "approval_rejected";
      
	  if ((stageValue == "closed_incomplete") && (current.approval == 'requested')) 
         return "rejected";

      if (current.approval == 'not requested')
            return activity.state == 'waiting' ? 'waiting' :"requested";
	   
	  if (current.approval == 'requested') 
           //   WARNING - HOVER and titles removed. 
		  return activity.state == 'waiting' ? 'waiting' : 'complete';  
	   
	  if (current.approval == 'approved') 
           return activity.state == 'waiting' ? 'active' : 'approved';
	
	   return 'error - no approval state found';
   },
   	

    type: 'WFApprovalStages'
}