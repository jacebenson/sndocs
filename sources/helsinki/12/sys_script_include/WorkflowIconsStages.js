gs.include("PrototypeServer");

var WorkflowIconsStages = Class.create();
WorkflowIconsStages.prototype = {

   initialize: function() {
   },

   process: function(c) {
	  this.approvalUtils = new WorkflowApprovalUtils();
      var choices = c.clone();
      for (var i = 0; i < choices.getSize(); i++) {
         var c = choices.getChoice(i);
         this._processChoice(c);
      }

      return choices;
   },

   _processChoice: function(choice) {

      choice.label = choice.getParameter("name");

	  this._appendDuration(choice);

      // Based on the state, update the text and set the image
      var state = choice.getParameter("state");

	  if (state == "complete") {
         choice.image = "icon-check-circle color-positive";
         if (choice.value != "complete")
		    choice.setParameter("title", choice.label);
		    choice.label +=  " (" + gs.getMessage("Completed") + ")";

      } else if (state == "requested") {

		 var hover = gs.getProperty('glide.sc.approval.hover', false);
		 choice.image = "icon-ellipsis color-accent";
		 choice.setParameter("title", choice.label);

		  if (hover && hover+'' == 'true') {
			  var titleMsg = gs.getMessage("Waiting for Approval");
              choice.setParameter("title", titleMsg);
		 }
		 choice.label += " (" + gs.getMessage("In progress") + ")";

      } else if (state == "approved") {
         choice.image = "icon-check-circle color-positive";
		 choice.setParameter("title", gs.getMessage("Waiting for Approval"));
		 choice.label +=  " (" + gs.getMessage("Approved") + ")";

      } else if (state == "rejected") {
         choice.image = "icon-cross-circle color-negative";
         if (choice.value != "rejected")
		    choice.setParameter("title", choice.label);
		    choice.label +=  " (" + gs.getMessage("Rejected") + ")";

      } else if (state == "approval_rejected") {
         choice.image = "icon-cross-circle color-negative";
         if (choice.value != "rejected")
		    choice.setParameter("title", choice.label);
		    choice.label +=  " (" + gs.getMessage("Rejected") + ")";

      } else if (state == "pending") {
         choice.image = "icon-empty-circle wf-stageicons";
         // if (choice.value != "complete")
		    choice.setParameter("title", choice.label);
		    choice.label +=  " (" + gs.getMessage("Pending - has not started") + ")";

      } else if (state == "incomplete") {
         choice.image = "icon-cross-circle color-negative";

      } else if (state == "active") {
         choice.image = "icon-arrow-right color-accent";
		 choice.setParameter("title", choice.label);
		 choice.label +=  " (" + gs.getMessage("In progress") + ")";


      } else if (state == "skipped") {
         choice.image = "icon-step-over";
		 choice.setParameter("title", choice.label);
		 choice.label +=  " (" + gs.getMessage("Skipped") + ")";

      } else if (state == "overdue") {
         choice.image = "icon-alert color-negative";
		 choice.setParameter("title", choice.label);
		 choice.label +=  " (" + gs.getMessage("Overdue") + ")";

      } else if (state == "on_hold") {
         choice.image = "icon-clear color-warning";
		 choice.setParameter("title", choice.label);
		 choice.label +=  " (" + gs.getMessage("On hold") + ")";
      }

	  function approvalId(current) {
	      if  (current.getRecordClassName() == 'sc_req_item')
			  if (current.stage != 'request_approved')
				  return current.request;
		  return current.sys_id;
	  }
   },

   _appendDuration: function(choice) {
      var duration = choice.getParameter("duration");
      if (duration)
         choice.label += " - " + duration;
   },

   _appendStateText: function(choice, text) {
      if (text)
     	choice.label += " " + gs.getMessage(text);
   },

   type: "WorkflowIconsStages"
};