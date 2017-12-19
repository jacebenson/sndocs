/**
 * Return the list of workflow stages for a Request Item as a choice list
 *
 * To use:
 *    var wfs = new WorkflowStages();
 *    wfs.setWorkflowVersion(id_of_workflow_version_for_current, id_of_active_context_for_current_or_blank);
 *    wfs.getChoices(currentStageValue, answer);		// where answer is a ChoiceList
 *
 * The creation of the stages list will take into account the 'approval' field
 * if there is one.  To ignore the approval field use:
 *
 *    wfs.ignoreApproval();
 */

// when building a list, the choice list generation code gets called 3 times for each row (getDisplayValue, getStyles and ChoiceListTag)
// since the results of building the list will be the same for each of the calls, we save the last choice list we built and reuse it
// if it is the same list.
gs.include("WorkflowStageDef");
gs.include("WorkflowActivityDef");
var workflowStagesLastChoiceList = {};

var WorkflowStages = Class.create();
WorkflowStages.prototype = {

   FINISHERS: { complete: true, completed: true, cancelled: true, closed_incomplete : true, "Request Cancelled" : true },

   initialize: function() {
      this.isRejected = false;
      this.workflowVersion = "";
      this.context = "";
      this.expectedActivities = null;
      this.sequences = [];
      this.useApprovals = true;
      this.actives = null;
   },

   /**
    * Set the workflow version and active context that we will use to get the stages
    */
   setWorkflowVersion: function(version, context) {
      this.workflowVersion = version;
      this.context = context;
      var gr = GlideRecordCache.get('wf_workflow_version', version);
      if (gr == null) {
         var gr = new GlideRecord('wf_workflow_version');
         if (gr.get(version))
            GlideRecordCache.put(gr);
         else
			gr == null;
      }
	   
	  // Check for PRB664759
	  // Workflow Versions created before Istanbul contain pipes in the sequence fields
	  // They could have been exported and imported into an Istanbul or newer release
	  this._sanatizeSequences(gr);

      if (gr)
         this.setActivitySequences(gr.expected_sequences.toString(), gr.full_sequences.toString());
   },

   /**
    * Set the activity sequences that are used to determine if an activity is expected to be executed and
    * to determine if an activity has been skipped
    */
   setActivitySequences: function(expectedSeq, fullSeq) {
      this.sequences = [];
      this.expectedActivities = null;

      if (expectedSeq) {
         this.expectedActivities = {};
         var sequence = expectedSeq.split(',');
         for (var j = 0; j < sequence.length; j++)
              this.expectedActivities[sequence[j]] = true;
      }

      if (fullSeq) {
		 var sequence = fullSeq.split(',');
         for (var i = 0; i < sequence.length; i++)
            this.sequences.push(sequence);
      }
   },

   /**
    * Call this to ignore the approval stages
    */
   ignoreApproval: function() {
      this.useApprovals = false;
   },

   /**
    * Create the choices from the workflow stages based on the workflow activity states
    */
   getChoices: function(stageValue, answer) {
      if ((workflowStagesLastChoiceList.stageValue == stageValue)
      	&& (workflowStagesLastChoiceList.workflowVersion == this.workflowVersion)
      	&& (workflowStagesLastChoiceList.context != '')
      	&& (workflowStagesLastChoiceList.context == this.context)) {

         var cl = workflowStagesLastChoiceList.answer;
         for (var i = 0; i < cl.getSize(); i++) {
            var c = cl.getChoice(i);
            answer.add(c);
         }
         return;
      }

      this.stageValue = stageValue;
      this.choice = answer;
      this._getApprovalChoices();
      this._getStages();
      this._getFinalizers();
      this._selectAChoice();

      // save the list we just built
      workflowStagesLastChoiceList.stageValue = stageValue;
      workflowStagesLastChoiceList.workflowVersion = this.workflowVersion;
      workflowStagesLastChoiceList.context = this.context;
      workflowStagesLastChoiceList.answer = this.choice;
   },

	/**
	 * Get a choice list of all wf_stage entries for the given table.
	 */
	getSimpleChoiceList: function(tableName, fieldName, cl) {
		var addedThese = {};

		var gr = new GlideAggregate('wf_stage');
		gr.addQuery('workflow_version.table', tableName);
		gr.orderBy('workflow_version.table');
		gr.orderBy('value');
		gr.orderBy('name');
		gr.query();
		while (gr.next())
			addThis(gr);

		function addThis(choice) {
			if (alreadyAdded(choice))
				return;

			addedThese[choice.value+''] = true;
			var label = gs.nil(choice.label) ? choice.name : choice.label+'';
			cl.add( choice.value+'', gs.getMessage(label)).setParameter('title', safeStr(choice.hint));
		}

		function alreadyAdded(grChoice) {
			return addedThese[grChoice.value+''];
		}

		function safeStr(s) {
			return gs.nil(s) ? '' : s+'';
		}
	},


   _getApprovalChoices: function() {
      // Only do this for tables that has an approval field
      if (!this.useApprovals || !current.isValidField('approval'))
         return;

	  var c = this._getApprovalChoice();
      this._saveLabel(c);
   },

   _isRequestStage: function() {
      return this.choice.size() == 0;
   },

   _getApprovalChoice: function() {
						
		var approverMap = this._getApproverMap();
		// The first choice is the Request approval information
	    if (current.request.approval == 'approved' && current.approval == 'requested') {
			var c = this.choice.add('approved', gs.getMessage('Approved'));
			c.setParameter('state', 'approved');
			c.setParameter('approvers', approverMap);
			return c;
		}
	
		if (current.approval == 'rejected') {
			var c = this.choice.add('rejected', gs.getMessage('Request Rejected'));
			c.setParameter('state', 'approval_rejected');
			c.setParameter('approvers', approverMap);
			this.isRejected = true;
			return c;
		}

		if (this.stageValue == "Request Cancelled") {
			var c = this.choice.add("Request Cancelled", gs.getMessage("Request Cancelled"));
			c.setParameter("state", "rejected");
			c.setParameter("approvers", approverMap);
			this.isRejected = true;
			return c;
		}

		if (current.approval == 'requested') {
			var hover = gs.getProperty('glide.sc.approval.hover', false);
			if (current.stage == 'request_approved')
				return this.choice.add('request_approved', gs.getMessage("Waiting for Approval")).setParameter("approvers", approverMap);

			if (hover && hover == 'true') {
				var titleMsg = gs.getMessage("Waiting for Approval");
				var utils = new WorkflowApprovalUtils();
				titleMsg += utils.getRequestedApproversAsString(current.sys_id);

				// passing in titleMsg here sets the label value to match the
				// hover value.
				// though not the intention of this flag, the execution plans do
				// it
				// setting the label to the value of the title to be consistent
				// with the execution plans
				var c = this.choice.add('waiting_for_approval', gs.getMessage("Waiting for Approval"));

				// title is the tool tip value in item_workflow.xml that renders
				// the icon list
				c.setParameter("title", titleMsg);
				c.setParameter("state", "requested");
				c.setParameter("approvers", approverMap);
				return c;
			}

			var c = this.choice.add('waiting_for_approval', gs.getMessage("Waiting for Approval"));
			c.setParameter("state", "requested");
			c.setParameter("approvers", approverMap);
			return c;
		}

	    if (this._isRequestStage() && current.request.approval == 'approved') {
			// If closed incomplete while still in an approving state, consider
			// the request item rejected
			var c = this.choice.add("request_approved", gs.getMessage("Request Approved"));
			c.setParameter("state", "approved");
			c.setParameter("approvers", approverMap);
			return c;
		}

	    // following the first choice are all Requested Item states
		if (current.approval == 'not requested') {
			var c = this.choice.add('waiting_for_approval', gs.getMessage("Waiting for Approval"));
			if (current.getRecordClassName() == 'sc_req_item')
				c.setParameter("state", "requested");
			else
				c.setParameter("state", "pending");
			
			c.setParameter("approvers", approverMap);
			return c;

		}

		if (current.approval == 'approved') {
			var c = this.choice.add('approved', gs.getMessage("Approved"));
			c.setParameter("state", "approved");
			c.setParameter("approvers", approverMap);
			return c;
		}
   },
	
   _getApproverMap: function() { 
	   var utils = new WorkflowApprovalUtils();
	   var gatingApprovers = utils.getApprovalRecord(current.request);
	   
	   var map = [];
	   while (gatingApprovers.next()) {
		   var approver = {};
		   approver.name = gatingApprovers.approver.name.getDisplayValue();
		   approver.sys_id = gatingApprovers.approver.toString();
		   approver.state = gatingApprovers.state.toString();
		   approver.label = gatingApprovers.getDisplayValue('approver') + ' (' + gatingApprovers.getDisplayValue('state') + ')';
		   map.push(approver);
	   }
		   
	   return map;
   },

   _getStages: function() {
      if (!this.workflowVersion)
         return;

	  var inProcess = current.request.request_state == 'in_process';
      this._getWorkflowStages();
      this._getWorkflowActivities();
      this._getWorkflowCompleted();
      this._getWorkflowActive();
      this._getWorkflowSkipped();

      for (var i = 0; i < this.stages.length; i++) {
         var stage = this.stages[i];

         if (stage.state == 'skipped' && stage.value != this.stageValue)
            continue;

         var c = this.choice.add(stage.value, gs.getMessage(stage.label));
         this._saveLabel(c);
         c.setParameter("duration", stage.duration);
		 if (stage.approvers.length > 0)
			 c.setParameter("approvers", stage.approvers);
		  
         if (this.isRejected && ((stage.state != "complete") && (stage.state != "rejected")))
            c.setParameter("state", "rejected");
         else
            c.setParameter("state", stage.state);
      }

   },

   // Get the stages that are referenced by this workflow
   _getWorkflowStages: function() {
      var def = WorkflowStageDefGet(this.workflowVersion);

      this.stageIds = def.getStageIds();
      this.stages = def.getStages();
   },

   _getWorkflowActivities: function() {
      var actdef = WorkflowActivityDefGet(this.workflowVersion);
      var acts = actdef.getActivity();
      this.activityToStage = {};

      for (var i = 0; i < acts.length; i++) {
         var act = acts[i];
         var stageId = act.getStageID();
         var activityId = act.getActivityID();
         this.activityToStage[activityId] = this.stageIds[stageId];

         if (!this._isActivityExpected(activityId))
            continue;
		  
		 var activityAtts = act.getActivityAttributes();
		 if ((activityAtts != null) && (activityAtts.indexOf("approval=true") >= 0))
			 this._setStageApprovers(stageId, activityId);

         this._setStageState(stageId, "pending");
      }
   },

   /**
    * Find the stages that are complete
    */
   _getWorkflowCompleted: function() {
      if (!this.context) {
         // not running against a workflow context yet
         return;
      }

      var gr = new GlideRecord('wf_history');
      gr.addQuery('context', this.context);
      //gr.setQueryReferences(true);
      gr.onePassQuery();
      while (gr.next()) {
         var activityID = gr.activity.toString();
         if (!activityID)
            continue;

         var stage = this.activityToStage[activityID];
         if (!stage)
            continue;

         if ((gr.result == "rejected") || (gr.result == "cancelled"))
            stage.state = "rejected";
         else if ((gr.state ==  "restart") && (stage.state == "complete"))
            stage.state = "active";
         else
            stage.state = "complete";
      }
   },

   /**
    * Find the stages that are active
    */
   _getWorkflowActive: function() {
      if (!this.context) {
         // not running against a workflow context yet
         return;
      }

      this.actives = {};
      var gr = new GlideRecord('wf_executing');
      gr.addQuery('context', this.context);
      //gr.setQueryReferences(true);
      gr.onePassQuery();
      while (gr.next()) {
         var activityID = gr.activity.toString();
         if (!activityID)
            continue;

         this.actives[activityID] = true;
         var stage = this.activityToStage[activityID];
         if (!stage)
            continue;

         stage.state = "active";
      }
   },

   /**
    * Find any stages that have been skipped and will never be executed
    */
   _getWorkflowSkipped: function() {

	   if (!this.context) {
         // not running against a workflow context yet
         return;
      }

      for (var activityID in this.activityToStage) {
         var stage = this.activityToStage[activityID];
         if (!stage)
            continue;

         if (stage.state != "pending" || !this._isActivitySkipped(activityID))
            continue;

         stage.state = "skipped";
      }
   },

   _getFinalizers: function() {
      var c;
      var end = false;

      if (this.stageValue == 'closed_incomplete') {
         c = this.choice.add("closed_incomplete", gs.getMessage("Closed Incomplete"));
         c.setParameter("state", "rejected");
         end = true;
      }

      if (this.stageValue == 'cancelled') {
         c = this.choice.add("cancelled", gs.getMessage("Request Cancelled"));
         c.setParameter("state", "rejected");
         end = true;
      }
      
      if (this.stageValue == "Request Cancelled") {
		 c = this.choice.add("Request Cancelled", gs.getMessage("Request Cancelled"));
		 c.setParameter("state", "rejected");
		 end = true;
	  }

      if (!this.isRejected) {
         c = this.choice.add("complete", gs.getMessage("Completed"));
         if (current.active)
            c.setParameter("state", "pending");
         else
            c.setParameter("state", "complete");
      } else if (!end) {
         c = this.choice.add("closed_incomplete", gs.getMessage("Rejected"));
         c.setParameter("state", "rejected");
      }

      this._saveLabel(c);
   },

   // Determine the choice to select as the current value
   _selectAChoice: function() {
      var ndx = 0;
      if (!current.active || this.isRejected) {
         // item is closed - complete is the selected choice
         ndx = this.choice.getSize() - 1;
      } else {
         // select the last active state
         for (var i = 0; i < this.choice.getSize(); i++) {
            var c = this.choice.getChoice(i);
            if (c.getParameter("state") == "active")
               ndx = i;
         }
      }
      var c = this.choice.getChoice(ndx);
      c.setSelected(true);
   },

   _setActivitySequences: function() {
      this.activitySequences = null;
      if (!this.context)
         return;

      var seqs = this.context
   },

   _setStageState: function(stageId, state) {
      var stage = this.stageIds[stageId];
      if (!stage)
         return;

      stage.state = state;
   },
	
	_setStageApprovers: function(stageId, activityId) {
		 var stage = this.stageIds[stageId];
		 if (!stage)
			 return;

		var map = [];
		var approversGR = this._getApprovalRecordsByActivity(activityId);	
		while (approversGR.next()) {
			var approver = {};
			approver.name = approversGR.approver.name.getDisplayValue();
		    approver.sys_id = approversGR.approver.toString();
		    approver.state = approversGR.state.toString();
		    approver.label = approversGR.getDisplayValue('approver') + ' (' + approversGR.getDisplayValue('state') + ')';
		    map.push(approver);
		}
		   
	    stage.approvers = map;
	},
	
	/**
     * Get approval record for a given task/record id
     */
    _getApprovalRecordsByActivity: function(activityId) {
        var apRecords = new GlideRecord('sysapproval_approver');
		if (GlideStringUtil.nil(current.sys_id))
			return apRecords;
		var isTask = new WorkflowApprovalUtils().isTask(current.getRecordClassName());
        if (isTask) {
            apRecords.addQuery('sysapproval', current.sys_id);
			apRecords.addQuery("wf_activity", activityId);
			apRecords.query();
		}

		if (apRecords.hasNext())
			return apRecords;
		
        apRecords.addQuery('document_id', current.sys_id);
		apRecords.addQuery("wf_activity", activityId);
        apRecords.query();
        return apRecords;
    },

   /**
    * Is this activity expected to be executed (ie, not part of a 'skipped' transition)?
    */
   _isActivityExpected: function(actId) {
      if ((this.expectedActivities == null) || this.expectedActivities[actId]) {
         return true;
      }
      return false;
   },

   /**
    * Has this activity been skipped during processing and has no chance of being executed?
    */
   _isActivitySkipped: function(actId) {
      if (!this.actives || this.sequences.length == 0)
         return false;

      var len = this.sequences.length;
      for (var i = 0; i < len; i++) {
         var isActive = false;
         var seq = this.sequences[i];
         var seqLen = seq.length;
         for (var seqNdx = 0; seqNdx < seqLen; seqNdx++) {
            var id = seq[seqNdx];
            if (this.actives[id])
               isActive = true;

            if (isActive && id == actId)
               return false;
         }
      }
      return true;
   },
	
   _sanatizeSequences: function(wfVersion) {
	   if (!wfVersion.isValidRecord() || wfVersion.sys_id.nil())
		   return;
	   
	   if ((wfVersion.expected_sequences.indexOf('|') == -1) && 
		   (wfVersion.full_sequences.indexOf('|') == -1))
		   return;

	   var workflowPaths = new SNC.WorkflowPaths(wfVersion);
	   var fullPath = workflowPaths.getAllPaths();
	   var expectedPath = workflowPaths.getPositivePaths();

	   wfVersion.full_sequences = fullPath.toArray().join(',');
	   wfVersion.expected_sequences = expectedPath.toArray().join(',');
	   wfVersion.setWorkflow(false);
	   wfVersion.update();
   },

   /**
    * Set the label as a parameter since we change the label when we display it by appending text
    * and we need to start over at the base label each time or we get duplicate text appended (the
    * appending happens in WorkflowIconsSCR
    */
   _saveLabel: function(/*Choice*/ c) {
      c.setParameter("name", c.label);
   },

   type: 'WorkflowStages'
}

// support old.stages from Workflow glide object
function legacyGetChoices() {
    var context = new Workflow().getContexts(current);
    if (context.next())
       _WorkflowChoices(context);
    else
       _defaultChoices();
 }

 function _WorkflowChoices(context) {
    var wfs = new WorkflowStages();
    wfs.setWorkflowVersion(context.workflow_version.toString(), context.sys_id.toString());
    wfs.getChoices(current.u_teststage, answer);
 }

 function _defaultChoices() {
    c = this.choice.add('waiting_for_approval', gs.getMessage("Waiting for Approval"));
    c.setParameter("state", "requested");
 }