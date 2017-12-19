/**
 * Workflow approval support utilities
 */
 
/* global gs, current, GlideRecord, GlideDBObjectManager, Workflow, GlideUser, GlideGroup, GlideController */
/* eslint-disable no-trailing-spaces, curly, strict, no-multi-spaces */

var WorkflowApprovalUtils = Class.create();
WorkflowApprovalUtils.prototype = {
   
   PENDING_STATES: [ 'not requested', 'not_required', 'requested' ],
   
   initialize: function() {
      this.debugFlag = gs.getProperty('glide.workflow_approval_utils.log') == 'true';
   },

   /** 
    * this tests whether or not a table is a Task table. If it is a task table then
    * still set the sysapproval column that references the task table. In doing this
    * we will preserve all the sc_XXX ui_macros for now.
    */ 
   isTask: function(tableName) {
       var base = '' + GlideDBObjectManager.get().getAbsoluteBase0(tableName);
       var task = ( base != null && base == 'task' ) ? true : false;
       return task;
   },
   
   /**
    * Cancel all approvals for a task
    */
   cancelAll: function(/*GlideRecord*/ task, /*optional*/ comment) {
      this.setAllApprovalsByTask(task, "cancelled", comment);
   },
	
	/**
    * Set all User approvals for a target record (task or non-task) to the specified state.
    */
   setAllApprovalsByTask: function(/*GlideRecord*/ target, approvalState, /*optional*/ comment) {
      this.setGroupApprovalsByTask(target.sys_id, approvalState, comment, []);
      this.setUserApprovalsByTask(target.sys_id, approvalState, comment, []);
   },
	
   /**
    * Reset all approvals by deleting all of them along with any
    * workflow associated with the task so that the workflows get
    * rerun and recalculated.
    */
   reset: function(/*GlideRecord*/ task, /*optional*/ comment) {
      // delete users first so that business do not run on cascade deletes of user approvals from group approval deletes
      gr = new GlideRecord('sysapproval_approver');
      gr.setWorkflow(false);
      gr.addQuery('sysapproval', task.sys_id);
      gr.deleteMultiple();
      
      var gr = new GlideRecord('sysapproval_group');
      gr.setWorkflow(false);
      gr.addQuery('parent', task.sys_id);
      gr.deleteMultiple();
      
      new Workflow().deleteWorkflow(task);
      if (comment)
         this.addApprovalHistoryGR(task, comment);
      else
         this.addApprovalHistoryGR(task, gs.getMessage("Approvals have been reset"));
   },
   
   /**
    * Restart workflows (this is deprecated and only exists to support legacy
    * calls to this method - use new Workflow().restartWorkflow(task, true)
    * instead)
    */
   deleteWorkflows: function(/*GlideRecord*/ task, /*optional*/ comment) {
      new Workflow().restartWorkflow(task, true);
      if (comment)
         this.addApprovalHistoryGR(task, comment);
   },
   
   /**
    * Create user approvals for a sysapproval_group approval
    */
   createUserApprovals: function(groupApproval) {
      if (groupApproval.assignment_group.nil())
         return;
      
      var ids = this.getMembersOfGroup(groupApproval.assignment_group);
      var state = groupApproval.approval + '';
      var taskId = groupApproval.parent + '';
      var approvalId = groupApproval.sys_id + '';

      for (var i = 0; i < ids.length; i++) {
      	 var approval = new GlideRecord('sysapproval_approver');
         approval.initialize();
         approval.sysapproval = taskId;
         // fill out reference to task with the in-memory GlideRecord. 
         // When "Approval Events (Task)" runs it will be able to obtain the task type even though it doesn't yet exist in DB
         var target = groupApproval.parent.getRefRecord();
         approval.sysapproval.setRefRecord(target);
         approval.source_table = target.getRecordClassName();
         approval.document_id = target.sys_id +'';
         approval.group = approvalId;
         approval.approver = ids[i];
         approval.wf_activity = groupApproval.wf_activity;
         approval.state = state;
         if (state == 'approved')
            approval.setValue('comments', gs.getMessage('Automatic approval'));
         
         approval.expected_start = groupApproval.expected_start;
         approval.due_date = groupApproval.due_date;
         approval.insert();
      }
   },
   
   /**
    * Get the list of user sys_ids for each member of a group
    */
   getMembersOfGroup: function(groupID) {
      var ids = [];
      if (!groupID)
         return ids;
      
      var gr = new GlideRecord('sys_user_grmember');
      gr.addQuery('group', groupID);
      gr.query();
      while (gr.next()) {
         var id = gr.getValue('user');
		 var grUserRec =  new GlideRecord('sys_user');  
         if (grUserRec.get(id) && grUserRec.getValue('active') == 1)
            ids.push(id);
      }
      
      return ids;
   },
   
   /**
    * Get an object of group approvals that were created by all of the children of
    * an approval manager activity (we use this to determine if we are about to
    * create a duplicate and to determine if we are reusing an approval that
    * we previously created)
    *
    * We return an object that has:
    *       key -> sys_id for the group approval
    *       value -> { sys_id: sys_id of the approval record
    *                  state: current approval state
    *                  group_id: sys_id of the group on the approval record
    *                  activity_id: sys_id of the activity that created the approval record
    *                }
    */
   getGroupApprovalsByApprovalManager: function(taskId, amId) {
      var activityIds = this._getActivitiesForAM(amId);
      if (activityIds.length == 0)
         return {};
      
      return this._buildApprovalObject(false, taskId, true, activityIds);
   },
   
   /**
    * Get an object of group approvals that were created by all of the children of
    * an approval manager activity (we use this to determine if we are about to
    * create a duplicate and to determine if we are reusing an approval that
    * we previously created)
    *
    * We return an object that has:
    *       key -> sys_id for the group approval
    *       value -> { sys_id: sys_id of the approval record
    *                  state: current approval state
    *                  group_id: sys_id of the group on the approval record
    *                  activity_id: sys_id of the activity that created the approval record
    *                }
    */
   getGroupApprovalsByApprovalManagerWithoutActivity: function(taskId, amId) {
      var activityIds = this._getActivitiesForAM(amId);
      if (activityIds.length == 0)
         return {};
      
      return this._buildApprovalObject(false, taskId, false);
   },

   /**
    * Get an object of user approvals that were created by all of the children of
    * an approval manager activity (we use this to determine if we are about to
    * create a duplicate and to determine if we are reusing an approval that
    * we previously created)
    *
    * We return an object that has:
    *       key -> sys_id for the user approval
    *       value -> { sys_id: sys_id of the approval record
    *                  state: current approval state
    *                  user_id: sys_id of the user on the approval record
    *                  activity_id: sys_id of the activity that created the approval record
    *                }
    */
   getUserApprovalsByApprovalManager: function(taskId, amId) {
      var activityIds = this._getActivitiesForAM(amId);
      if (activityIds.length == 0)
         return {};
      
      return this._buildApprovalObject(true, taskId, true, activityIds);
   },

   /**
    * Get an object of user approvals that were created by all of the children of
    * an approval manager activity (we use this to determine if we are about to
    * create a duplicate and to determine if we are reusing an approval that
    * we previously created), this is used when manual approval is presented,
    * which has no activity sys id attached.
    *
    * We return an object that has:
    *       key -> sys_id for the user approval
    *       value -> { sys_id: sys_id of the approval record
    *                  state: current approval state
    *                  user_id: sys_id of the user on the approval record
    *                  activity_id: sys_id of the activity that created the approval record
    *                }
    */
   getUserApprovalsByApprovalManagerWithoutActivity: function(taskId, amId) {
	  var activityIds = this._getActivitiesForAM(amId);
      if (activityIds.length == 0)
         return {};
      
      return this._buildApprovalObject(true, taskId, false);
   },
   
   /**
    * create a approval object based on given approval type.
    * if it has activity attached, then activityIds are used to filter out approval records.
    */
   _buildApprovalObject: function(isUserApproval, taskId, hasActivity, activityIds) {
   	   var ids = {};
	   var approvalType = isUserApproval ? 'sysapproval_approver' : 'sysapproval_group';

	   var gr = new GlideRecord(approvalType);
	   if (hasActivity)
		   gr.addQuery('wf_activity', activityIds);
	   else
		   gr.addNullQuery('wf_activity');
	   
	   if (isUserApproval) {
		   gr.addQuery('sysapproval', taskId);
		   gr.addNullQuery('group');
	   } else {
		   gr.addQuery('parent', taskId);
	   }

	   gr.query();
	   while (gr.next()) {
		   var approver_id = null;
		   var state = null;
		   if (isUserApproval) {
			   approver_id = gr.approver.toString();
			   state = gr.state.toString();
		   }
		   else {
			   approver_id = gr.assignment_group.toString();
			   state = gr.approval.toString();
		   }
			   
		   ids[gr.sys_id.toString()] = {
                sys_id: gr.sys_id.toString(),
                state: state,
                approver_id: approver_id,
                activity_id: gr.wf_activity.toString()
		   };
	   }
	   return ids;
   },
   
   _getActivitiesForAM: function(amId) {
      // get the list of activities associated with this activity manager
      var activityIds = [];
      var gr = new GlideRecord('wf_activity');
      gr.addQuery('parent', amId);
      gr.query();
      while (gr.next())
         activityIds.push(gr.sys_id.toString());
      
      return activityIds;
   },
   
   /**
    * Get the counts for the user approvals of a task
    */
   getUserApprovalCounts: function(taskID) {
      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('sysapproval', taskID);
      gr.query();
      return this._getApprovalCounts(gr, 'state', 'approver');
   },
   
   /**
    * Get the counts for the user approvals of a group approval
    */
   getUserGroupApprovalCounts: function(groupID) {
      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('group', groupID);
      gr.query();
      return this._getApprovalCounts(gr, 'state', 'approver');
   },
   
   /**
    * Get the counts for the group approvals of a task
    */
   getGroupApprovalCounts: function(taskID) {
      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('parent', taskID);
      gr.query();
      return this._getApprovalCounts(gr, 'approval', 'assignment_group');
   },
   
   /**
    * Get the counts for the list of user approvals
    *
    * ids is an array of user approval sys_ids
    */
   getUserIdListApprovalCounts: function(ids) {
      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('sys_id', ids);
      gr.query();
      return this._getApprovalCounts(gr, 'state', 'approver');
   },
   
   /**
    * Get the counts for the list of group approvals
    *
    * ids is an array of group approval sys_ids
    */
   getGroupIdListApprovalCounts: function(ids) {
      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('sys_id', ids);
      gr.query();
      return this._getApprovalCounts(gr, 'approval', 'assignment_group');
   },
   
   /**
    * Return an object with counts and (optionally) user ids of the
    * approval states of the passed in records
    *
    * The returned object is:
    *
    *       obj.counts{key = state, value = count}
    *          .approvalIDs{key = state, value = array of ids}
    */
   _getApprovalCounts: function(gr, approvalField, idField) {
      var counts = {
         total : 0,
         not_requested : 0,
         requested : 0,
         approved : 0,
         rejected : 0,
         cancelled : 0,
         not_required : 0,
         duplicate: 0
      };
      var approvalIDs = {
         not_requested: [],
         requested: [],
         approved: [],
         rejected: [],
         cancelled: [],
         not_required: [],
         duplicate: []
      }
      
      while (gr.next()) {
         var state = gr.getValue(approvalField);
         state = state.replace(/\s/g, "_");
         if (!counts[state])
            counts[state] = 0;
         
         counts[state] = counts[state] + 1;
         counts.total++;
         
         if (idField) {
            if (!approvalIDs[state])
               approvalIDs[state] = [];
            
            approvalIDs[state].push(gr.getValue(idField));
         }
      }
      
      if (this.debugFlag) {
         var debugString = "Approvals for: " + gr.getDisplayValue();
         for (var s in counts)
            debugString += " " + s + "=" + counts[s];
         this.debug(debugString);
      }
      
      var ret = {};
      ret.counts = counts;
      ret.approvalIDs = approvalIDs;

      return ret;
   },
   
   /**
    * Set all group approvals of a parent task to the specified state
    */
   setGroupApprovalsByTask: function(taskID, approvalState, /*optional*/ comment, /*optional []*/ currentStates) {
      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('parent', taskID);
      if (currentStates && currentStates.length > 0)
         gr.addQuery('approval', currentStates);
      
      gr.query();
      this._setGroupApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all group approvals of a parent task to the specified state
    */
   setPendingGroupApprovalsByTask: function(taskID, approvalState, /*optional*/ comment) {
      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('parent', taskID);
      gr.addQuery('approval', this.PENDING_STATES);
      gr.query();
      this._setGroupApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all specified group approvals to the specified state
    */
   setGroupApprovalsByIds: function(ids, approvalState, /*optional*/ comment, /*optional []*/ currentStates) {
      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('sys_id', ids);
      if (currentStates && currentStates.length > 0)
         gr.addQuery('approval', currentStates);
      
      gr.query();
      this._setGroupApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set specified pending group approvals to the specified state
    */
   setPendingGroupApprovalsByIds: function(ids, approvalState, /*optional*/ comment) {
      if (!ids || ids.length == 0)
         return;

      var gr = new GlideRecord('sysapproval_group');
      gr.addQuery('sys_id', ids);
      gr.addQuery('approval', this.PENDING_STATES);
      gr.query();
      this._setGroupApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all User approvals of a task to the specified state
    * - modified to look at document_id for all non-task tables
    */
   setUserApprovalsByTask: function(taskID, approvalState, /*optional*/ comment, /*optional []*/ currentStates) {
      var gr = new GlideRecord('sysapproval_approver');
      var base = '' + GlideDBObjectManager.get().getAbsoluteBase0(current.getRecordClassName());
      var isTask = 'task' == base;
      if( isTask )
         gr.addQuery('sysapproval', taskID);
      else
         gr.addQuery('document_id', taskID);
      if (currentStates && currentStates.length > 0)
         gr.addQuery('state', currentStates);
      
      gr.query();
      this._setUserApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all pending user approvals of a task to the specified state
    * - modified to look for document_id when approving a non-task table
    */
   setPendingUserApprovalsByTask: function(taskID, approvalState, /*optional*/ comment) {
      var gr = new GlideRecord('sysapproval_approver');
  
      if( this.isTask( current.getRecordClassName() ) )
         gr.addQuery('sysapproval', taskID);
      else
         gr.addQuery('document_id', taskID);
      gr.addQuery('state', this.PENDING_STATES);
      gr.query();
      this._setUserApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all user approvals of a group approval to the specified state
    */
   setUserApprovalsByGroup: function(groupID, approvalState, /*optional*/ comment, /*optional []*/ currentStates) {
      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('group', groupID);
      if (currentStates && currentStates.length > 0)
         gr.addQuery('state', currentStates);
      
      gr.query();
      this._setUserApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set all pending user approvals of a group approval to the specified state
    */
   setPendingUserApprovalsByGroup: function(groupID, approvalState, /*optional*/ comment) {
      if (!groupID)
         return;

      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('group', groupID);
      gr.addQuery('state', this.PENDING_STATES);
      gr.query();
      this._setUserApprovals(gr, approvalState, comment, true);
   },
   
   /**
    * Set all specified user approvals to the specified state
    */
   setUserApprovalsByIds: function(ids, approvalState, /*optional*/ comment, /*optional []*/ currentStates) {
      if (!ids || ids.length == 0)
         return;

      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('sys_id', ids);
      if (currentStates && currentStates.length > 0)
         gr.addQuery('state', currentStates);
      
      gr.query();
      this._setUserApprovals(gr, approvalState, comment);
   },
   
   /**
    * Set specified pending user approvals to the specified state
    */
   setPendingUserApprovalsByIds: function(ids, approvalState, /*optional*/ comment) {
      if (!ids || ids.length == 0)
         return;

      var gr = new GlideRecord('sysapproval_approver');
      gr.addQuery('sys_id', ids);
      gr.addQuery('state', this.PENDING_STATES);
      gr.query();
      this._setUserApprovals(gr,  approvalState, comment);
   },
   
   /**
    * Set group approvals to a specific state and, optionally, add an
    * approval history comment
    */
   _setGroupApprovals: function(gr, approvalState, /*optional*/ comment) {
      while (gr.next()) {
         if (gr.approval != approvalState) {
            gr.setValue('approval', approvalState);
            if (comment)
               this.addApprovalHistoryGR(gr, comment);
			 
			 // If we are coming from a Reset Approvals with a state of Cancelled
			 // we do not want to progress the workflow further
			 if (approvalState === 'cancelled')
				 gr.setWorkflow(false);
            
            gr.update();
         }
      }
   },
   
   /**
    * Set user approvals to a specific state and, optionally, add a comment
    *
    */
   _setUserApprovals: function(gr, approvalState, /*optional*/ comment, /*optional*/ syncDatesFlag) {
      while (gr.next()) {
		  // If this is running in an Approval Coordinator with Duplicates Deleted
		  // This approval may still be required
		  if (approvalState == 'not_required' && this._runningAMApproval(gr))
			  continue;
		  
          if (gr.state != approvalState) {
            gr.setValue('state', approvalState);
			 
            if (comment)
               gr.comments = comment;
            
            if (syncDatesFlag && gr.group) {
               gr.expected_start = gr.group.expected_start;
               gr.due_date = gr.group.due_date;
            }
            gr.update();
         }
      }
   },
	
	/**
    * Check for another Executing activity that is relying on this user approval
    *
    */
	_runningAMApproval: function(approvalGR) {
		var taskID = approvalGR.sysapproval.notNil() ? approvalGR.sysapproval : approvalGR.document_id;
		// Get all executing activities for this context
		var executing = new GlideRecord('wf_executing');
		executing.addQuery('context.id', taskID);
		executing.addQuery('activity', '!=', approvalGR.wf_activity);
		executing.addQuery('state', 'waiting');
		executing.addQuery('scratchpad', 'CONTAINS', approvalGR.sys_id);
		executing.query();
		return executing.hasNext();
	},
   
   /**
    * Add a list of ids to the approval list
    */
   addIdsToApprovalList: function(approvals, o) {
      if (!o)
         return;

      if (typeof o == 'string') {
         o = o.split(',');
      }

      for (var i = 0; i < o.length; i++) {
         var ids = this._checkFieldNameInId(o[i]);
         if (!ids)
            continue;
         
         ids = ids.split(',');
         for(var j=0; j < ids.length; j++) {
            approvals[ids[j]] = true;
         }
      }
   },
   
   /**
    * Add a list of user or group ids to the appropriate approval list
    */
   addUsersAndGroupsToApprovalList: function(users, groups, o) {
      if (!o)
         return;
      
      if (typeof o == 'string')
         o = o.split(',');
      
      for (var i = 0; i < o.length; i++) {
         // handle ${name}
         var id = this._checkFieldNameInId(o[i]);
         if (!id)
            continue;
         
         id = id.toString().split(',');
         for(var j=0; j < id.length; j++) {
            // determine if this is a user or a group
            if (this._isValidUser(id[j]))
               users[id[j]] = true;
            else if (this._isValidGroup(id[j]))
               groups[id[j]] = true;
         }
      }
   },
   
   /**
    * Handle ${field_name} replacement
    */
   _checkFieldNameInId: function(id) {
      if (!id)
         return "";
      
      if ((id.indexOf("${") == 0) && (id.substring(id.length - 1) == "}")) {
         id = this._evaluateScript("current." + id.substring(2, id.length - 1));
      }
      return id;
   },
   
   _isValidUser: function(id) {
      var user = GlideUser.getUserByID(id);
      return user.exists();
   },
   
   _isValidGroup: function(id) {
      var group = GlideGroup.get(id);
      return group.isValid();
   },
   
   /**
    * Evaluate the script for this group approval rule, returning
    * the group id or group list
    */
   _evaluateScript: function(script) {
      if (!script)
         return '';
      
      return GlideController.evaluateString(script);
   },
   
   /**
    * Create the group approvals from the group list
    */
   createGroupApprovers: function(groups, order, state) {
      if (!state)
         state = 'not requested';
      
      var gr = new GlideRecord('sysapproval_group');
      for (var id in groups) {
         gr.initialize();
         gr.short_description = current.short_description;
         gr.parent = current.sys_id;
         gr.assignment_group = id;
         gr.approval = state;
         gr.addDomainQuery(current);
         gr.insert();
      }
   },
   
   /**
    * Add an approval history journal entry for a task record
    */
   addApprovalHistoryGR: function(taskGR, msg) {
      taskGR.setDisplayValue('approval_history', msg);
   },
   
   /**
    * Add an approval history journal entry for a task id (read the task record,
    * add the journal entry and update the task record)
    */
   addApprovalHistoryID: function(taskID, msg) {
      var gr = new GlideRecord('task');
      if (gr.get(taskID)) {
         gr.setDisplayValue('approval_history', msg);
         gr.update();
      }
   },
   
   /**
    * Get the user name from a user sys_id
    */
   getUserName: function(userSysId) {
      if (!userSysId)
         return '';
      
      var userInfo = GlideUser.getUserByID(userSysId);
      if (!userInfo)
         return '';
      
      return userInfo.getDisplayName() + '';
   },


    /**
     * Get approval record for a given task/record id
     */
    getApprovalRecord: function(taskID) {
        var apRecords = new GlideRecord('sysapproval_approver');
		if (GlideStringUtil.nil(taskID))
			return apRecords;

        var task =   this.isTask(current.getRecordClassName());
        if (task) {
            apRecords.addQuery('sysapproval', taskID);
			apRecords.query();
		}

		if (apRecords.hasNext())
			return apRecords;

        apRecords.addQuery('document_id', taskID);
        apRecords.query();
        return apRecords;
    },

    getRequestedApproversAsString: function(taskID) {
        var apRecords = new GlideRecord('sysapproval_approver');
        apRecords.addQuery('state', 'requested');
       
        var task = this.isTask(current.getRecordClassName());
        if(task)
            apRecords.addQuery('sysapproval', taskID);
        else
            apRecords.addQuery('document_id', taskID);       
        apRecords.query();

        var list = '';
        var comma = false;
        while (apRecords.next()) {
            var id   = apRecords.getValue('approver');
            var name = this.resolveUserIdToName(id);
            if (comma)
                list+= ', ';
            list+= name;
            comma = true;			
        }

        list = list.length > 0 ? ' ' + gs.getMessage('by') + ' ' +  list : list;

        return list;      
    },

    resolveUserIdToName: function (userID) {
        var userGR = new GlideRecord('sys_user');
        var name = '';
        if (userGR.get(userID)) {
            name+= userGR.first_name + ' ' + userGR.last_name;
        }
   
        return name;
    },
    
    debug: function(msg) {
       if (this.debugFlag)
           gs.print("WorkflowApprovalUtils: " + msg);
    },
   
    type: 'WorkflowApprovalUtils'
};