var WorkflowModelManager = Class.create();


WorkflowModelManager.prototype = {
    initialize : function( /*context*/ context) {
        this.wfContext = context; /** wf_context sys_id of the context associated with the workflow being played back **/
        this.begin = ''; /** the  ActivityHistoryRecord that begins the workflow, stored here to ease the start of playback **/
        this.executedActivities = {};  /** hash of ActivityHistoryRecord javascript objects, hashed by sys_id of the wf_history record **/
        this.executedTransitions = {}; /** hash of ExecutedTransition javascript objects, hashed by sys_id of the wf_transition_history record **/       
        this.executionOrder = [];      /** array of ActivityHistoryRecord ordered by the activity_index that is set in the ActivityManager class **/
        this.joinsByWfActivityId = {};  /** hash of ActivityHistoryRecords that are Join activities, used in playback. This hash is by the wf_activity.sys_id **/
        this.joinsByHistoryRecordIndex = [];  /** array of ActivityHistoryRecords that are Join activities, used in playback locate next appropriate join **/
        this.executedPaths = [];
        this.toActivityFound = false;
        this.fromActivityFound = false;
        this._grUtil=new GlideRecordUtil(); 
		//for nested rollback fix -- STRY0127051 
		this.rollbackactivityIndex = 0; /** activity index of Roll BackTo activity which is in execution currently **/
		
    },

//==========================================================================================
// BUILDING MODEL AND PLAYBACK LOGIC
//==========================================================================================

    /**
     *  This list returns a fully initialized list of 
     *  javascript object(s) ActivityHistoryRecord.
     *  
     *  Each instance reports the to/from activity
     *  as well as relevant wf_activity and activity definition
     *  details used in display of workflow.
     *
     * var model = new WorkflowModelManager('myContextId');
     * var activities = model.getExecutedHistory();
     *  
     */
    getExecutedHistory: function() {
        this._getExecutedActivities();
        this._getExecutedTransitions();
        this.playBack();
        return this.executionOrder;
    },

   /**
    * The purpose of this function is to retrieve the history activity that
    * is cached by the  wf_history.sys_id provided in the argument. 
    **/
   getActivityHistoryRecordById: function(haRecordSysId /**  String wf_history.sys_id **/) {
       haRecordSysId.isNil()
     
       var haRecord =  haRecordSysId.isNil() ? null : this.executedActivities[haRecordSysId];      
       return haRecord;
   },  

    /**
     * common validity test to make sure an operation won't error out
     **/
    _sanityCheck : function(haRecord /** ActivityHistoryRecord javascript object **/) {
        
        var result = JSUtil.notNil(this.executionOrder) && 
                     this.executionOrder.length>0; //there is some executionOrder
        
        //haRecord exists and its index makes sense for this executionOrder
        result = result && 
                 JSUtil.notNil(haRecord) && 
                 Number(haRecord.index)>=0 && 
                 Number(haRecord.index)<this.executionOrder.length; 
       

        return result;
    },

  /**
    * The purpose of this function is to retrieve the history activity that
    * is cached by the  wf_history.sys_id provided in the argument. It then 
    * calls to getPreviousByExecutedOrder() with the retrieved javascript object.
    * see comments below.
    *
    * Sample use:

    * var model = new WorkflowModelManager('contextId');
    * model.getExecutedHistory();
    * var current = model.getActivityHistoryRecordById('wf_history.sys_id');
    * current.debugDump();

    * var results = model.getPreviousByExecutedOrderId(current.sys_id);
    * results.debugDump();
    *
    **/
   getPreviousByExecutedOrderId: function(haRecordSysId /**  String wf_history.sys_id **/) {
       var haRecord = this.executedActivities[haRecordSysId];      
       return this.getPreviousByExecutedOrder( haRecord );
   },  

   /**
    * The purpose of this function is to retrieve the history activity that
    * executed just previous to the one provided in the argument. The
    * 'previous' status is based on the activity index reflecting the
    *  nearest prior activity in time and not necessarily the nearest
    *  prior activity with a valid transition to this activity. To
    *  get the nearest prior activity that transitioned to this haRecord
    *  passed in use getPreviousByTransition( haRecord )
    *
    * Note: in the process of assembling the execution order array, blanks are left
    * in the array where history objects have been deleted. This is done to 
    * ensure the index in the array and the activity_index of the object remain in synch.
    * For that reason, all objects coming out of the execution order array should be
    * tested for nil() and not assumed to be the previous record based on activity_index  or array index value alone.
    *
    **/
    getPreviousByExecutedOrder: function(haRecord /** ActivityHistoryRecord javascript object **/) {
        var previous = null;
        if (this._sanityCheck(haRecord)) {
            if (Number(haRecord.index)>0) { //not the first activity
                for (var i = (Number(haRecord.index) - 1); i >= 0; i--) {
                    previous = this.executedActivities[this.executionOrder[i]];
                    if (previous != null && previous.index != null) {
                        break;
                    }
                }
            }
        }  
        return previous;
    },
       
  /**
    * The purpose of this function is to retrieve the history activity that
    * is cached by the  wf_history.sys_id provided in the argument and then 
    * call into getNextByExecutedOrder() with the retrieved javascript object.
    * to find the previously executed activity (see comments below)
    *
    * Sample use:

    * var model = new WorkflowModelManager('7b3e01573b130000dada82c09ccf3dcf');
    * model.getExecutedHistory();
    * var current = model.getActivityHistoryRecordById('d6681d573b130000dada82c09ccf3d10');
    * current.debugDump();

    * var results = model.getNextByExecutedOrderId(current.sys_id);
    * results.debugDump();

    *
    **/
   getNextByExecutedOrderId: function(haRecordSysId /**  String wf_history.sys_id **/) {

       var haRecord = this.executedActivities[haRecordSysId];      
       return this.getNextByExecutedOrder(haRecord);
   },  

   /**
    * The purpose of this function is to retrieve the history activity that
    * executed just after to the one provided in the argument. The
    * 'next' status is based on the activity index reflecting the
    *  nearest prior activity in time and not necessarily the nearest
    *  next wf_activity the provided activity transitioned to. To
    *  get the nearest next activity that transitioned to this haRecord
    *  passed in use getNextByTransitionOrder( haRecord )
    *
    * Note: in the process of assembling the execution order array, blanks are left
    * in the array where history objects have been deletfsed. This is done to 
    * ensure the index in the array and the activity_index of the object remain in synch.
    * For that reason, all objects coming out of the execution order array should be
    * tested for nil() and not assumed to be the previous record based on index value alone.
    *
    * Note: in the process of assembling the execution order array, blanks are left
    * in the array where history objects have been deleted. This is done to 
    * ensure the index in the array and the activity_index of the object remain in synch.
    * For that reason, all objects coming out of the execution order array should be
    * tested for nil() and not assumed to be the previous record based on activity_index  or array index value alone.
    * 
    *
    **/
    getNextByExecutedOrder: function(haRecord /** ActivityHistoryRecord javascript object **/) {
        var next = null; 
        if (this._sanityCheck(haRecord)) {
           for (var i = Number(haRecord.index) + 1; i < this.executionOrder.length; i++) {
               next = this.executedActivities[this.executionOrder[i]];
               if (next != null && next.index != null) {
                   break;
               }
           }
        }
        return next;
    },

  /**
    * The purpose of this function is to retrieve the history activity that
    * executed just after to the one identified by the sys_id provided in the argument. 
    *
    * This function retreives the cached history record associated with the provided wf_history.sys_id
    * and then calls getNextByTransition - see notes below for details
    *
    * The return values are based on what transitions came before the haRecord
    * sumbitted and not not necessarily the activities that executed just prior
    * to the haRecord in time. To get the activity that executed prior to this
    * activity in time use getNextByExecutedOrder
    *
    * Sample use:
    * var model = new WorkflowModelManager('7b3e01573b130000dada82c09ccf3dcf');
    * model.getExecutedHistory();
    * model.playBack();
    *
    * var current = model.getActivityHistoryRecordById('d6681d573b130000dada82c09ccf3d10');
    * current.debugDump();
    * var results = model.getNextByTransitionId(current.sys_id);
    * gs.print('COMPLETED NEXT' + results.length );
    * for( var i = 0; i < results.length; i++){
    *     results[i].debugDump();
    * }
    **/
   getNextByTransitionId: function(haRecordSysId /** ActivityHistoryRecord sys_id **/) {
       var haRecord = this.executedActivities[haRecordSysId];      
       return this.getNextByTransition(haRecord);
   },    

   /**
    * The purpose of this function is to retrieve the history activity that
    * executed just after to the one provided in the argument. The
    * 'next' status is based on the .to value of all the transitions that
    * are associated with the activity represented in the haRecord.
    *
    * The return value is a collection of ActivityHistoryRecords that identify
    * the argument haRecord.wfaId as their TO activity.
    *
    * The return values are based on what transitions came before the haRecord
    * sumbitted and not not necessarily the activities that executed just prior
    * to the haRecord in time. To get the activity that executed prior to this
    * activity in time use getNextByExecutedOrder
    *
    *
    **/
   getNextByTransition: function(haRecord /** ActivityHistoryRecord javascript object **/) {
       if (!this.executionOrder || !haRecord || haRecord.getTransitionCount() == 0) {
         return null;
       }

       var next = []; 
       var count = haRecord.getTransitionCount();
       for (var i = 0; i < count; i++) {
           var nextActivity = this._getNextInstanceOfActivity(haRecord.index, haRecord.transitions[i].to);    
           if (nextActivity != null)
               next.push(nextActivity);           
       }  

       return next;
   }, 


 /**
    * The purpose of this function is to retrieve the history activit(y)ies that
    * executed just prior to the one provided in the argument. The
    * 'next' status is based on the wf_activity.sys_id associated with the activity 
    * represented in the haRecord existing as a TO in a transition associated with
    * any ActivityHistoryRecords that come before the haRecord in the execution sequence
    *
    * The return value is a collection of ActivityHistoryRecords that identify
    * the argument haRecord.wfaId as their TO activity.
    *
    * The return values are based on what transitions came before the haRecord
    * sumbitted and not not necessarily the activities that executed just prior
    * to the haRecord in time. To get the activity that executed prior to this
    * activity in time use getPreviousByExecutedOrder
    *
    *  see sample use below
    *
    **/
    getPreviousByTransitionId: function(haRecordSysId /** ActivityHistoryRecord sys_id **/) {
       var haRecord = this.executedActivities[haRecordSysId];      
       return this.getPreviousByTransition(haRecord);
   },           
   

  /**
    * The purpose of this function is to retrieve the history activit(y)ies that
    * executed just prior to the one provided in the argument. The
    * 'next' status is based on the wf_activity.sys_id associated with the activity 
    * represented in the haRecord existing as a TO in a transition associated with
    * any ActivityHistoryRecords that come before the haRecord in the execution sequence
    *
    * (Differing from getAllTransitionedIntoActivity which will all return TO transitions that
    * to the given haRecord in the execution sequence )
    *
    * The return value is a collection of ActivityHistoryRecords that identify
    * the argument haRecord.wfaId as their TO activity.
    *
    * The return values are based on what transitions came before the haRecord
    * sumbitted and not not necessarily the activities that executed just prior
    * to the haRecord in time. To get the activity that executed prior to this
    * activity in time use getPreviousByExecutedOrder

    *  sample use 

    *  var model = new WorkflowModelManager('7b3e01573b130000dada82c09ccf3dcf');
    *  model.getExecutedHistory();
    *  var current = model.getActivityHistoryRecordById('d6681d573b130000dada82c09ccf3d10');
    *  current.debugDump();
    *  model.playBack();
    *
    * var results = model.getPreviousByTransitionId(current.sys_id);
    * gs.print('COMPLETED PREVIOUS' + results.length );
    * for( var i = 0; i < results.length; i++){
    *    gs.print('PRINTING ' +  results[i].sys_id );
    *    results[i].debugDump();
    * }
    *
    **/
   getPreviousByTransition: function(haRecord /** ActivityHistoryRecord javascript object **/) {
	  
       if (!this.executionOrder || 
           !haRecord || 
           haRecord.index > this.executionOrder.length || 
           (Number(haRecord.index) - 1 < 0)) {
           return null;
       }
      var previousList = [];

      for (var i = Number(haRecord.index) - 1; i >= 0; i--) { 
           
           var ahdPrevious = this.executedActivities[this.executionOrder[i]];
		  // Nested RollBack Fix --PRB583844
		   if (ahdPrevious != null) {
		       ahdPrevious.rollingBackBy = this.rollbackactivityIndex;
		   }
		  
		  
           if (ahdPrevious != null && 
               !ahdPrevious.isRolledBack() &&
               ahdPrevious.isIdADestination( haRecord.wfaId )  && 
               !this._isWFActivityInList( previousList, ahdPrevious.wfaId)) {                 
 
                  previousList.push(ahdPrevious);
                   
                   /** 
                    *                       -- G Turnstile(3)  ^ - End
                    *                       |                  |
                    *  A -  B              
                    *         - D (join) - E task    -    F script  
                    *   -  C 
                    * A B C D E F G E F G E F G End
                    *
                    *  when going back and haRecord is E Task with inputs from is G Turnstile, 
                    *  then we can break and not continue to search for previous tasks as
                    *  (in good form) there should be only one entry to a loop.
                    * 
                    *
                    */                   
                    if (ahdPrevious.isTurnstile() || ahdPrevious.isARollback() ) {
                      break;
                    }     
           }
       }

      /** 
       *  Join may not be have been satisfied prior to rollback, but it may have been
       *  and if so, could have one of it's TO: activities ahead of it, instead of behind
       *  it. So in that case, look ahead in time until join is satisfied or execution path
       *  ends  ==== doesJoinContainActivity
       *  Note: this was added as part of STRY0028839 (FDT)
       **/ 
      if (haRecord.isJoin() && (previousList.length < haRecord.getJoinExpectedTransitionCount()) ) {

          for (var i = Number(haRecord.index); i < this.executionOrder.length; i++) {
           var ahdJoinTo = this.executedActivities[this.executionOrder[i]];
                  
            if (ahdJoinTo != null && 
                !ahdJoinTo.isRolledBack() &&
                ahdJoinTo.isIdADestination( haRecord.wfaId )  && 
               !this._isWFActivityInList( previousList, ahdJoinTo.wfaId)) { 
  
               previousList.push(ahdJoinTo);

               // if this is all there could have been for a single execution then stop now
               if (previousList.length == haRecord.getJoinExpectedTransitionCount() )
                   break;
            }
          }
       }

       return previousList;
   }, 


   /**
    * The purpose of this function is to retrieve the history activit(y)ies that
    * executed and transitioned into the one represented by the sys_id in the argument. The
    * 'next' status is based on the wf_activity.sys_id associated with the activity 
    * represented in the haRecord existing as a TO in a transition associated with
    * any ActivityHistoryRecords that executed in the workflow's history (Differing
    * from getPreviousByTransition which will only return TO transitions that
    * come before the haRecord in the execution sequence (by time) )
    *
    * The return value is a collection of ActivityHistoryRecords that identify
    * the argument haRecord.wfaId as their TO activity.
    **/
    getAllTransitionedIntoActivityId: function( haRecordSysId /** ActivityHistoryRecord sys_id **/) {
    
        var haRecord = this.executedActivities[haRecordSysId];   
        return this.getAllTransitionedIntoActivity(haRecord);
    
    },

   /**
    * The purpose of this function is to retrieve the history activit(y)ies that
    * executed and transitioned into the one provided in the argument. The
    * 'next' status is based on the wf_activity.sys_id associated with the activity 
    * represented in the haRecord existing as a TO in a transition associated with
    * any ActivityHistoryRecords that executed in the workflow's history (Differing
    * from getPreviousByTransition which will only return TO transitions that
    * come before the haRecord in the execution sequence (by time) )
    *
    * The return value is a collection of ActivityHistoryRecords that identify
    * the argument haRecord.wfaId as their TO activity.
    *
    * The return values are based on all transitions in the executed history collection that transition
    * To get the activity that executed prior to this activity in time use getPreviousByExecutedOrder
    *
    *  sample use 
    *
    *  var model = new WorkflowModelManager('a143585c3b001000dada82c09ccf3d44');
    *  model.getExecutedHistory();
    *  var activity = model.begin;
    *  gs.print('activity: ' + activity.wfaName + ', transitions: ' + activity.transitions.length);
    *  while( activity != null){    
    *      gs.print('activity: ' + activity.wfaName + ', transitions: ' + activity.transitions.length);    
    *      var parents = model.getAllTransitionedIntoActivity(activity);
    *      for( var i = 0; i < parents.length; i++ ){
    *          gs.print(' ---------------  parent activity: ' + parents[i].wfaName );
    *      }
    *  
    *      activity = model.getNextByExecutedOrder( activity );
    *  }
    *
    **/
   getAllTransitionedIntoActivity: function(haRecord /** ActivityHistoryRecord javascript object **/) {

       var toTransitionList = [];
       if (!this.executionOrder || !haRecord) {
           return toTransitionList;
       }     
       
       for (var i = 0; i < this.executionOrder.length; i++) { 
           var ahdToRecord = this.executedActivities[this.executionOrder[i]];

           if (ahdToRecord != null && 
               ahdToRecord.isIdADestination( haRecord.wfaId )  && 
               !this._isWFActivityInList( toTransitionList, ahdToRecord.wfaId)) {
              
               toTransitionList.push(ahdToRecord);
           }
       }   
       return toTransitionList;
   }, 
   
   /**
    *  the purpose of this funciton is to return the list
    *  of wf_history.sys_ids of all activities that successfully 
    *  executed and were not rolled back or skipped up to the moment the 
    *  function was called.
    *
    *  sample use
    *  var model = new WorkflowModelManager('ee3e0a053b101000dada82c09ccf3d7c');
    *  model.getExecutedHistory();
    *  var finals = model.getFinalExecutedActivityIdList();
    *   gs.print(' EXECUTION PATH IDs --------------- : '  + finals.length);
    *  
    *  for ( var x = 0; x < finals.length; x++ ) {
    *     gs.print(finals[x] );
    *  }
    * 
    *  
    **/
   getFinalExecutedActivityIdList: function() {
   
       var executedIds = [];
       
       var executedActivities = this.getFinalExecutedActivityList();
       
       if (executedActivities.isNil()) 
           return executedIds;
           
       for (var i=0; i < executedActivities.length; i++) {
           if (executedIds[i].isNil())
               continue;
           executedIds.push(executedActivities[i].sys_id);       
       }
       
       return executedIds;   
   },
   
   /**
    *  the purpose of this funciton is to return the list
    *  of wf_history activities of all activities that successfully 
    *  executed and were not rolled back or skipped up to the moment the 
    *  function was called.
    *
    *  sample use
    *  var model = new WorkflowModelManager('ee3e0a053b101000dada82c09ccf3d7c');
    *  model.getExecutedHistory();
    *  var finals = model.getFinalExecutedActivityList();
    *   gs.print(' EXECUTION PATH ACTIVITIES --------------- : '  + finals.length);
    *  
    *  for ( var x = 0; x < finals.length; x++ ) {
    *    gs.print(finals[x].index + ' - ' + finals[x].wfaName );
    *  }
    * 
    *  
    **/
   getFinalExecutedActivityList: function() {
   
     var executedCompletes = [];
     
     for (var i=0; i < this.executionOrder.length; i++) {
     
         if ( this.executionOrder[i].isNil() )
             continue;
             
         var activity = this.executedActivities[this.executionOrder[i]];
         
         if (activity != null && !activity.isRolledBack() ) 
             executedCompletes.push(activity);      
     }  
   
    return executedCompletes;
   
   },

   /** 
    * Queries the wf_history table by context and retrieves all the 
    * activities executed in the workflow given by the context
    * set in the construction of this object. 
    *
    * This function will produce a list of executed activities in the
    * exact order each activity passed through the server side
    * ActivityManager.java using the new activity_index to force the order
    * coming out of the database.
    *
    * On its this call will not give the full picture, it needs to load
    * and map the transitions. 
    *
    * to get the fully initialized list of executed activities use the
    * following code snippet
    *
    * var model = new WorkflowModelManager('myContextId');
    * var activities = model.getExecutedHistory();
    *
    **/
    _getExecutedActivities: function() {
        var grA=this._queryExecutedActivities(this.wfContext);
        while (grA.next()) {			
            if (!this.executedActivities[grA.sys_id.toString()]) { 
                var activityHistory = new ActivityHistoryRecord(grA);
                this.executedActivities[ grA.sys_id.toString() ] = activityHistory;  
                if (grA.activity.activity_definition.name == 'Begin')
                   this.begin = activityHistory;

                // activities are deleted on Joins, so there could be a break in sequence
                while (this.executionOrder.length != activityHistory.index && 
                       this.executionOrder.length < activityHistory.index ) {
                    this.executionOrder.push('');
                }

                this.executionOrder.push(activityHistory.sys_id.toString());
                if (activityHistory.isJoin()) {
                    if (!this.joinsByWfActivityId[activityHistory.wfaId])
                        this._defineJoinParameters( activityHistory );
                    activityHistory.addJoinFromActivityIds(this.joinsByWfActivityId[activityHistory.wfaId]);
                    /** count on being pushed into array in order **/
                    this.joinsByHistoryRecordIndex.push(activityHistory);
                }
              
            }
        }
    },
    
    _queryExecutedActivities : function(contextId) {
        var grA = new GlideRecord('wf_history');
        grA.addQuery('context', this.wfContext);
        grA.addNotNullQuery('activity_index');
        grA.orderBy('activity_index');
        grA.query();
        return grA;
    },
    

    /** 
     *  The purpose of this function is to get the get the sys_ids of the
     *  wf_activity records that will transition to the ActivityHistoryRecord 
     *  passed in as the argument, assuming that the toActivity has tested to be a Join
     *  activity.
     *
     *  This functions hashes the Join activity by it's wf_activity.sys_id so that
     *  it can be accessed during playback.
     *
     *  This function is called during the build up of the cached model, prior to 
     *  playback.
     **/

    _defineJoinParameters: function(toActivity /** ActivityHistoryRecord javascript object **/) {

        var joinIds = [];
        var grJT = new GlideRecord('wf_transition');
        grJT.addQuery('to', toActivity.wfaId);
        grJT.query();
        while (grJT.next()) {
             joinIds.push(grJT.from.toString());
        }
        /* store join in name:value pair where name = the wf_activity.sys_id of the Join activity
         * and the value is an array of all the sys_ids of wf_activities that are expected to arrive
         * at the Join activity in the execution of the workflow 
         */
        this.joinsByWfActivityId[toActivity.wfaId] = joinIds;
    },

    /**
     *  The purpose of this function is to initialize the hash
     *  of ExecutedTransition javascript objects that contain
     *  the relevant transitions executed during a workflow
     *  and to map the transitions to the wf_history record
     *  that the transition executed FROM. This mapping is
     *  originally set in the workflow's ActivitManager class
     *  on the serverside. 
     *
     *
     **/
    _getExecutedTransitions: function() {
      
        var grT = new GlideRecord('wf_transition_history');
        grT.addQuery('context', this.wfContext);
        grT.query();

        while (grT.next()) {
            if (!this.executedTransitions[grT.sys_id.toString()]) {
                var transition = new ExecutedTransition( grT );

                this.executedTransitions[grT.sys_id.toString()] = transition;
                this.executedActivities[ grT.from_activity_history.toString() ].addTransition(transition);
                               
            }
       }
    },


    /**
     *  Starting with begin, and assuming that getExecutedHistory() has been previously called,
     *  this function will playback the execution of a workflow using the activity_index
     *  of the wf_history object (set in the workflow ActivityManager) to ensure that the order
     *  of playback is the order that the activities passed through the workflow engine. This
     *  is a more reliable execution order than relying on the precision timestamp out of the database.
     *
     *  var model = new WorkflowModelManager('myContextId');
     *  var activities = model.getExecutedHistory();
     *  model.playBack();
     *
     *  NOTE: this is used to replay the workflow at this time to fill in executed transitions from timeline.
     *  this required for rollback to a specific activity. For now all it does is walk the execution and
     *  print it out, but it will define execution paths as part of the rollback activities.
     **/    
    playBack: function() {
        
        this._log('============================================================================================================');
        this._log('WORK FLOW PLAY BACK ');
       
        if (this.begin.isNil())
            return;
        /** starting with Begin, recurse through cached model to playback execution of workflow **/
        this._findExecutionPath(this.begin);
        
    },

    /**
     *  Beginning with the activity passed in, this function traverses the actvities indicated 
     *  by the transitions in each activity and progresses to the end End. Of the workflow.
     *
     *  This is called from rollback and assumes the following initializing functions have
     *  already been successfully called. 
     *
     *  var model = new WorkflowModelManager('myContextId');
     *  var activities = model.getExecutedHistory();
     *  
     *  This function collects the IDs of all activities from the point of the start activity
     *  
     */
    _findLegOfExecutionPath: function(startActivity /** ActivityHistoryRecord **/, 
                                      activityTransitionPath) {
         for (var i = 0; i < startActivity.getTransitionCount(); i++) {

         var nextHistoryRecord = ( this.joinsByWfActivityId[startActivity.transitions[i].to] ) ?
               this._findWhereActivityJoinedByWfActivityId(startActivity.transitions[i].from  ) :
               this._getNextInstanceOfActivity( startActivity.index, startActivity.transitions[i].to );  
			 
            if (nextHistoryRecord) {
                activityTransitionPath.push(nextHistoryRecord);
                /** recurse from current record **/
                this._findLegOfExecutionPath( nextHistoryRecord, activityTransitionPath );
            }
         }
    },

    /**
     *  Beginning with the activity passed in, this function traverses the actvities indicated 
     *  by the transitions in each activity and progresses to the end End. Of the workflow.
     *
     *  This is called from playback and is assumes the following initializing functions have
     *  already been successfully called. 
     *
     *  var model = new WorkflowModelManager('myContextId');
     *  var activities = model.getExecutedHistory();
     *  
     */
    _findExecutionPath: function(startActivity /** ActivityHistoryRecord **/) {

         for (var i = 0; i < startActivity.getTransitionCount(); i++) {

             var nextHistoryRecord = ( this.joinsByWfActivityId[startActivity.transitions[i].to] ) ?
                 this._findClosestJoinToWfActivityId(startActivity.transitions[i].from  ) :
                 this._getNextInstanceOfActivity( startActivity.index, startActivity.transitions[i].to );  
     
             if (nextHistoryRecord) {

             if (nextHistoryRecord.isJoin()) {                   
                 if (!nextHistoryRecord.isJoinSatisfied())
                     continue;  
             }

              /**  gs.print('BEGIN ==== FROM - TO');
                startActivity.debugDump();
                nextHistoryRecord.debugDump();
                gs.print('=======================');
                gs.print(''); **/
                /** recurse from current record **/
                this._findExecutionPath( nextHistoryRecord );
            }
         }
    },

    /**
     * In the instances of loops and rollbacks, it is possible for the same
     * wf_activity.sys_id to be identified as a TO or a FROM activity.
     * 
     * This functions uses the activity_index(ed) execution history to 
     * identify the specific instance of the wf_activity given the 
     * current index of activity being output in a playback. 
     *
     * While not explicitly called in the following example, the 
     * function is a called from inside the playBack() call below
     * and does require the first two initialization functions to have
     * successfully run
     *
     *  var model = new WorkflowModelManager('myContextId');
     *  var activities = model.getExecutedHistory();
     *  activities.playBack(); ==> calls _getNextInstanceOfActivity in it's recursion.
     *
     **/
    _getNextInstanceOfActivity: function(currentIndex, nextActivityId) {

        var nextHistoryRecord = null;
        for (var i=currentIndex; i < this.executionOrder.length; i++) {


            var activity = this.executedActivities[this.executionOrder[i]];
            if (activity.isNil())
               continue; 

       if (activity.wfaId.isNil())
                continue;
            if (activity.wfaId == nextActivityId) {
              nextHistoryRecord = activity;
              break;
            }
        } 
       return nextHistoryRecord;
    },

   /**
    *  When building the cache of an executed(ing)'s workflow history, the 
    *  function _defineJoinParameters() caches all the instances Joins executed in the workflow
    *  in the order in which they were executed and caches it by the wf_history.sys_id of
    *  the Join history record.
    *
    *  In the process of progressing through a workflow that has a join that could have been 
    *  rolled back or that may occur in a loop and using the cache described above.
    *  This function looks through the activities cached as Joins and submits the id
    *  of the from activity. If it finds the join that 
    *
    *
    **/
   _findWhereActivityJoinedByWfActivityId: function(fromActivityId /** wf_activity sys_id **/) {

        var selectedJoinActivity = null;
        for (var i = 0; i < this.joinsByHistoryRecordIndex.length; i++) {
          if (this.joinsByHistoryRecordIndex[i].isJoinSatisfied())
              continue;
       
           if (this.joinsByHistoryRecordIndex[i].isJoinWaitingForActivity(fromActivityId)) {
               this.joinsByHistoryRecordIndex[i].addArrivedActivityToJoin(fromActivityId);
               selectedJoinActivity = this.joinsByHistoryRecordIndex[i];
               break;
           }
        }
        return selectedJoinActivity;          
    },


   /**
    *  When building the cache of an executed(ing)'s workflow history, the 
    *  function _defineJoinParameters() caches all the instances Joins executed in the workflow
    *  in the order in which they were executed and caches it by the wf_history.sys_id of
    *  the Join history record.
    *
    *  In the process of progressing through a workflow that has a join that could have been 
    *  rolled back or that may occur in a loop and using the cache described above.
    *  This function looks through the activities cached as Joins and submits the id
    *  of the from activity. If the Join is waiting for that sys_id, then it is added
    *  and the state of the join is adjusted. If there are multiple Joins or multiple instances
    *  of the same Join due to loop or rollback, the join that is closest in time, that is 
    *  not satisfied when the fromActivity passes through is assumed to be the correct Join
    *
    *
    **/
   _findClosestJoinToWfActivityId: function(fromActivityId /** wf_activity sys_id **/) {

        var selectedJoinActivity = null;
        for (var i = 0; i < this.joinsByHistoryRecordIndex.length; i++) {
           if (this.joinsByHistoryRecordIndex[i].doesJoinContainActivity(fromActivityId)) {
               selectedJoinActivity = this.joinsByHistoryRecordIndex[i];
               break;
           }
        }
        return selectedJoinActivity;          
    },

 
//================================================================================================================================================
//ROLLBACK LOGIC - Rolls back from a specific activity to a specific activity instead of rolling all the way back to the last rolled back activity
//================================================================================================================================================
    rollbackTransitionHistory: function(fromHistoryRecord      /** wf_history.sys_id **/, 
                                        toMostRecentWfaId      /** wf_activity.sys_id **/,
                                        rollBackactivityIndex  /** index of the wf_executing rollback **/) {
		

        this._log('============================================================================================================');
        this._log('ROLLING BACK TRANSITIONS BEGIN FROM INDEX ' + rollBackactivityIndex);
		
		
        var toIds = this._getRollbackToActivityIds( toMostRecentWfaId );
        var rollBackActivities  = [];
        var rollBackTransitions = [];
        var rollbackConditionCriteria = [];
		//fix for Nested RollBack -- PRB583844 (SYT)
		this.rollbackactivityIndex = rollBackactivityIndex;

        if (toIds != null) {          
            for (var i = 0; i < toIds.length; i++) { 
                this._rollHistoryBackFromTo( fromHistoryRecord, toIds[i], rollBackActivities, rollBackTransitions );
            }

            this._updateTransitionRecords( rollBackTransitions, rollBackactivityIndex );
            this._updateWfHistoryRecords( rollBackActivities, rollBackactivityIndex );
           
            rollbackConditionCriteria = this._buildRollbackQueryCondition(rollBackActivities);
            this._updateExecuting( rollBackActivities, rollBackactivityIndex, rollbackConditionCriteria );
            this._resetApprovalsAndTasks( rollBackActivities, rollbackConditionCriteria );
        
            this._log('============================================================================================================');
            this._log('ROLLING BACK TRANSITIONS - COMPLETE ' );
               
        }
    },


    _updateWfHistoryRecords: function(rollBackActivities, rollBackactivityIndex ) {
    
       this._log('UPDATING HISTORY RECORDS');   
 
       var activityIds = [];
       for (var i = 0; i < rollBackActivities.length; i++) {
		   //To fix nested rollback issue STRY0127051 (SYT)
		   /** Need to consider only history records with no rolledBackBy value in it. */
		   if(rollBackActivities[i].rolledBackBy == 0 || rollBackActivities[i].rolledBackBy.isNil()) {
           activityIds.push( rollBackActivities[i].sys_id );
           rollBackActivities[i].rolledBackBy =  rollBackactivityIndex; 
		   }
       }
		
        var gr = new GlideRecord('wf_history');
        gr.addQuery('sys_id', "IN", activityIds);
        gr.query();
        while (gr.next()) {
            gr.setValue('rolled_back_by', rollBackactivityIndex);
            gr.setValue('state', 'restart');
            gr.update();
        }

   },

   /**
    * This was added as part of STRY0028839 to have a common place to 
    * build the "IN"A criteria on for getting executing and glide records
    * by activity definition id
    *
    */
   _buildRollbackQueryCondition: function( rollBackActivities ) { 
       var activityIds = [];
       for (var i = 0; i < rollBackActivities.length; i++) {
           activityIds.push(rollBackActivities[i].wfaId);    
       }
       return activityIds;
  },

   _updateExecuting: function( rollBackActivities, rollBackactivityIndex, activityIds ) {
       this._log('UPDATING EXECUTING RECORDS'); 
       this._cancelExecuting(activityIds, rollBackactivityIndex);
   },

   _updateTransitionRecords: function(rollBackTransitions, rollBackactivityIndex) {
       
       var transitionIds = [];
       for (var i = 0; i < rollBackTransitions.length; i++) {
           transitionIds.push(rollBackTransitions[i].sys_id);
           rollBackTransitions[i].rolledBackBy =  rollBackactivityIndex; 
       }
             
        var gr = new GlideRecord('wf_transition_history');
        gr.addQuery('sys_id', "IN", transitionIds);
        gr.query();
        while (gr.next()) {
            gr.setValue('rolled_back', true);
            gr.setValue('rolled_back_by', rollBackactivityIndex);
            gr.update();
        }

   },

   _getRollbackToActivityIds: function( wfaId /** wf_activity.sys_id **/){

        var toActivityIds = [];
        var grT = new GlideRecord('wf_transition');
        grT.addQuery('from', wfaId);
        grT.query();
        
        while (grT.next()) {
           toActivityIds.push( grT.to.toString() );                           
        }      
        return toActivityIds;
    },

    _rollHistoryBackFromTo: function( fromActivityId /** wf_history_id **/, 
                                      toWfActivityId /** wf_activity_id **/,
                                      rollBackActivities,
                                      rollBackTransitions ) {		
       this._log('ESTABLISHING ROLLBACK PATH - rollHistoryBackFromTo'); 
 
       var fromActivity = this.executedActivities[fromActivityId]
		   
       if (fromActivity != null) {
           rollBackActivities.push(fromActivity);
           this._collectRollBackActivities(fromActivity, toWfActivityId, rollBackActivities);
           this._collectRollBackTransitions(rollBackActivities, rollBackTransitions);                          
       }

    },

    _collectRollBackTransitions: function(rollBackActivities, rollBackTransitions) {
    
        this._log('COLLECTING ELIGIBLE TRANSITIONS');  

        for (var i = 0; i < rollBackActivities.length; i++) { 
           
            for (var t = 0; t < rollBackActivities[i].transitions.length; t++) {
                rollBackTransitions.push(rollBackActivities[i].transitions[t]);                         
             }
     
        }
    },

    _getIndentLevel: function() {

       if (!this.level)
          this.level = 0;

       this.level++; 

       var indent = '-';
       for (var i=0; i < this.level; i++ ) {
        indent = indent + '-';
       }
      return indent;
    },

    /**
     *  Starting from the the result of _findRollbackToDestination
     *
     */
    _collectRollBackActivities: function(fromActivity, toWfActivityId, rollBackActivities) {
		
     // find the nearest instance of the toWfActivity look back through transitions
     var foundActivity = []; 
     this._findRollbackToDestination(fromActivity, toWfActivityId, foundActivity);

     // if not found return
		if (foundActivity.length == 0) {  
      	  return;
		}
		
      var activityTransitionPath = [];
      activityTransitionPath.push(foundActivity[0]);

      this._findLegOfExecutionPath(foundActivity[0], activityTransitionPath);

      if (activityTransitionPath) {
          for (var i=0; i < activityTransitionPath.length; i++) {                     
              this.fromActivityFound =  activityTransitionPath[i].wfaId.toString() == this.fromActivity.toString(); 
			  
              if (!activityTransitionPath[i].isRolledBack()) {				  
                  this._addToRolledBackList(activityTransitionPath[i], rollBackActivities);
                  if (activityTransitionPath[i].isParent()) {
                       this._addChildrenToRollback(activityTransitionPath[i], rollBackActivities);                    
                  }
              } 

              // this was modified as part of STRY0028839 to stop looking in history if we have walked
              // back far enough to find the TO activity of the Rollback Transition arrow
              if (this.fromActivityFound) {				  
                  break;
			  }
			  			 
           }
        }
    },

    /**  Walks back through all the transitions that have happened between the Rollback To activity
      *  and the destination, to find the nearest instance of the To: activity in the execution path
      *  relative to the current instance of Rollback To: activity. 
      * 
      *  Added for STRY0028839 (FDT)
      *   returns null if activity was not found in rollback path 
      */
    _findRollbackToDestination: function(fromActivity, toWfActivityId, foundActivity) {		
      var level =   this._getIndentLevel();
      this._log(level);
      this._log( level + ' LOCATING ROLLBACK TO ACTIVITY FOR ' + fromActivity.wfaName + ' AT INDEX ' + fromActivity.index + ' toActivity Found ' + this.toActivityFound);  
  
       if (this.toActivityFound)
           return;

      var previousActivities = this.getPreviousByTransition(fromActivity);		

      if (previousActivities != null ) {

          for (var i=0; i < previousActivities.length; i++) {                     
              this.toActivityFound =  previousActivities[i].wfaId.toString() == toWfActivityId.toString(); 

              // this was modified as part of STRY0028839 to stop looking in history if we have walked
              // back far enough to find the TO activity of the Rollback Transition arrow
              if (this.toActivityFound) {
                 foundActivity.push(previousActivities[i]);
                 return;

              }
              this._findRollbackToDestination(previousActivities[i], toWfActivityId, foundActivity);
           }
        }
       // activity was not found in rollback path
       return null;
    },

    _addToRolledBackList: function(hraRecord, rollBackActivities) {
           var alreadyAdded = false;
        for (var i = 0; i < rollBackActivities.length; i++) {
            alreadyAdded = hraRecord.sys_id == rollBackActivities[i].sys_id; 
            if (alreadyAdded)
                break;
        }
        if (!alreadyAdded) 
           rollBackActivities.push(hraRecord); 
   },
   
    /**
     * get the sys_id of the wf_history record for the rollback activity that is associated with hraSys_id. 
     * Associated meaning "was rolled back by" or "is the rollback itself".
     * In other words, you can pass it either any record that got rolled back, or the rollback itself, and it will give you the rollback sys_id.
     */
    getRollBack : function(hraSys_id /** wf_history.sys_id **/) {
        var hraRecord = this.executedActivities[hraSys_id]; 
        var index=hraRecord.index;
		/**
		 * Fix for Nested Rollback STRY0127051 (SYT)
		 *Needed to store rolledBackBy value into rollingBackBy of ActivityHistoryRecord object to pass the condition in isRolledBack() function.
		 *While Highlighting paths,isRolledBack() function should return true, when rolledBackBy is set to activity index. 
		 */
		hraRecord.rollingBackBy = hraRecord.rolledBackBy;
		
        if (hraRecord.isRolledBack()) {
			
            index=hraRecord.rolledBackBy;
			
        }
        var rbId=this.executionOrder[index];
        gs.log('rollBack = '+index + '(' + rbId+')');
        return rbId;
    },

/**
 *  The purpose of this function is to return a list of sys_ids that represent activities
 *  that have been rolled back by the wf_history record sys_id passed in as the argument.
 *
 *  the use of this activity is demonstrated in the following example.
 *
 * var model = new WorkflowModelManager('cf555c823b330000dada82c09ccf3d96')
 * model.getExecutedHistory();
 * var activities = model.getRolledBackActivityIdList('e7569c823b330000dada82c09ccf3d4a' );
 *
 * for( var i = 0; i < activities.length; i++ ){
 *    var record = model.getActivityHistoryRecordById( activities[i]);
 *    record.debugDump();
 * }
 *
 */
   getRolledBackActivityIdList: function( hraSys_id /** wf_history.sys_id **/){

       var rolledBackActivities = [];
       var hraRecord = this.executedActivities[hraSys_id];
       for (var i = 0; i < this.executionOrder.length; i++) {
          var act = this.executedActivities[ this.executionOrder[i] ];

          if (act.rolledBackBy == hraRecord.index) {
              rolledBackActivities.push(this.executionOrder[i]);
          }
       }

    return rolledBackActivities;

  },


  /** 
    *  when rolling back, we want to stop at the instance of
    *  the wfaId closest to the point of rollback, and once
    *  found, stop looping to find it. In the case where there is
    *  things have rolledback and re-executed over and over the rollback 
    *  will not rollback the entire loop. If the whole loop needs to
    *  rollback, insert and activity before the entry to the loop when
    *  designing the workflow.
    *
    *
    */
   _isWFActivityInList: function(list /** history record **/,
                                 wfaId /** wf_activity.sys_id **/){

       if (list == null || wfaId.isNil())
           return;

       var isInList = false;
       for (var i =0; i< list.length; i++) {
           isInList = list[i].wfaId == wfaId;
           if (isInList)
               break; 
       }

       return isInList;
   },


 /** 
    * When a workflow uses a turnstile to loop, 
    *
    *
    */
   _isWFActivityInALoop: function(list /** history record **/,
                                 wfaId /** wf_activity.sys_id **/){

       if (list == null || wfaId.isNil())
           return;

       var isInList = false;
       for (var i =0; i< list.length; i++) {
           isInList = list[i].wfaId == wfaId;
           if (isInList)
               break; 
       }

       return isInList;
   },

   /**
    * Activities like ApprovalCoordinator have children that do not
    * have transitions, those children need to be rolled back if the
    * parent is rolling back, so search for them in the executed activities
    * and add them to the rollbackActivities list
    * this was modified as part of STRY0028839 (FDT) to not go to the wf_history table
    * but to walk through executed and select the activities closest to the
    * parent in history using the activity_index.
    **/
    _addChildrenToRollback: function(parent, rollbackActivities) {
        if (this.activityIds.length == 0) 
            return;

        for (var i = 0; i < this.executionOrder.length; i++) {
            // joins can leave blanks in order, as can activities that were deleted like timers
           if (this.executionOrder[i].isNil())
                continue;
            
           var activity = this.executedActivities[this.executionOrder[i]];

           if (activity.parent == parent.wfaId && !activity.isRolledBack())         
              rollbackActivities.push(activity);

       }
    },
    
    _cancelExecuting: function( rollBackWfActivityIds, rollBackactivityIndex ) {
    this._log('====== SET CANCEL EXECUTING ============================== ');  
      if (rollBackWfActivityIds.length == 0) 
            return;
        var rollBackSysId = rollBackactivityIndex > 0 && rollBackactivityIndex < this.executionOrder.length ?
                            this.executionOrder[rollBackactivityIndex] : null;

        if (rollBackSysId == null)
            return;

        var gr = new GlideRecord('wf_executing');
        gr.addQuery('context', activity.context);
        gr.addQuery('sys_id', '!=', rollBackSysId); // don't delete the rollback activity we are executing
        gr.addQuery('activity', "IN", rollBackWfActivityIds);
        gr.deleteMultiple();
    },
    
    
    _resetApprovalsAndTasks: function( rollBackWfActivityIds, activityIds ) {
       this._log('====== SET APPROVALS ============================== ');
       if (this.activityIds.length == 0) 
            return;
 
        var gr = new GlideRecord('sysapproval_group');
        gr.addQuery('parent', current.sys_id);
        gr.addQuery('wf_activity', "IN", activityIds);
        gr.addQuery('approval', '!=', 'not requested');
        gr.query();
        while (gr.next()) {
            gr.setValue('approval', 'not requested');
            gr.update();
        }
        var mu = new GlideMultipleUpdate('sysapproval_approver');
        var qc = mu.addQuery('sysapproval', current.sys_id);
        qc.addOrCondition('document_id', current.sys_id);
        mu.addQuery('wf_activity', "IN", activityIds);
        mu.addQuery('state', '!=', 'not requested');
        mu.setValue('state', 'not requested');
        mu.execute();
        
        mu = new GlideMultipleUpdate('task');
        mu.addQuery('parent', current.sys_id);
        mu.addQuery('wf_activity', "IN", activityIds);
        mu.addQuery('state', '!=', '-5');
        mu.setValue('state', '-5');
        mu.setValue('work_end', '');
        mu.setValue('active', 'true');
        mu.execute();
    },
 
//==========================================================================================
// DEBUG TOOLS
//========================================================================================== 


    _log: function(message) {
        if (typeof workflow == "undefined" || message == null)
            return;
         workflow.debug(message);
    },
  
    /**
     *  Intended as a debug assist when working with an executed(ing) workflow. This
     *  call is useful from the scripts - background window to see the 
     *  output of and relationships between cached values of a workflow's execution.
     *
     *  to see the output
     *
     *  var model = new WorkflowModelManager('myContextId');
     *  model.getExecutedHistory();
     *  model.dump();
     *
     */
    dump: function() {
        this.dumpTransitions();
        this.dumpActivities();
        this.dumpExecutionOrder();
        this.dumpJoins();
    },

    dumpJoins: function() {
    gs.print('============================================================================================================');
    gs.print('JOINS ' + this.joinsByHistoryRecordIndex.length);
        for (var i=0; i < this.joinsByHistoryRecordIndex.length; i++) {
           this.joinsByHistoryRecordIndex[i].debugDump();
        }
    },

    dumpTransitions: function() {
    gs.print('============================================================================================================');
    gs.print('TRANSITIONS ');
        for (var sys_id in this.executedTransitions) {
            this.executedTransitions[sys_id].debugDump();
        }
    },

   dumpActivities: function(){
    gs.print('============================================================================================================');
    gs.print('HISTORY RECORDS ');
     for (var sys_id in this.executedActivities) {
         this.executedActivities[sys_id].debugDump();
     }
    },
   
   dumpExecutionOrder: function(){

     gs.print('============================================================================================================');
     gs.print('ACTIVITY EXECUTION ORDER');
     for ( var i = 0; i < this.executionOrder.length; i++) {
         gs.print('i = ' + i + ' = ' + this.executionOrder[i] );
     }

   },
   
    type: WorkflowModelManager
}

//==========================================================================================
// JAVASCRIPT OBJECTS FOR CAPTURING MODEL AND STATE
//==========================================================================================

/** class that captures the relevant information
    about the activity represented in an wf_history 
    glide record
**/
var ActivityHistoryRecord = Class.create();
ActivityHistoryRecord.prototype = {
    
    initialize: function( grA /** GlideRecord('wf_history) **/){
        
        this.sys_id     = grA.sys_id.toString(); 
        this.index      = grA.activity_index.toString();
        this.startTime  = grA.started.getGlideObject().getNumericValue();
        this.endTime    = grA.ended.getGlideObject().getNumericValue();
        this.wfaId      = grA.activity.toString();            /* wf_activity id field */
        this.wfaIsParent  = grA.activity.is_parent;  /* wf_activity parent field, added as part of STRY0028839 (FDT) */
        this.parent     = grA.activity.parent.toString();  /* wf_activity parent field, added as part of STRY0028839 (FDT) */
        this.wfaName    = grA.activity.name;                  /* wf_activity name field */
        this.adId       = grA.activity.activity_definition.sys_id.toString();   /* activity definition id */
        this.adName     = grA.activity.activity_definition.name;  /* activity definition name */
        this.transitions = [];                                /* transitions from this activity */
        this.rolledBackBy = grA.rolled_back_by.toString(); /* Activity index that rolled this back */

        /**************** JOIN MANAGEMENT **************************/
        this.ARRIVED = true;
        this.NOT_ARRIVED = false;    /* constant used for joinFromActivity.arriveState value */
        this.joinFroms = [];     /* an array of javascript objects constructed as  joinFromActivity.id and joinFromActivity.arriveState **/
        this.joinSatisfied = false; /* constant used for joinFromActivity.arriveState value */
		// fix for Nested RollBack PRB583844
		this.rollingBackBy = 0; /* used to store the activity index of the Roll BackTo activity which is in execution currently **/
    },
     
    isJoin: function() {
        return this.adName=='Join';
    },

    isTurnstile: function() {
        return this.adName=='Turnstile';
    },
    
    isARollback: function() {
        return this.adName.indexOf('Rollback') != -1 ;
    },
    // added as part of STRY0028839 to support managing child activities (i.e. approvals in approval coordinator)
    // that will not have their own transitions
    isParent: function() {
        return (this.wfaIsParent) ? this.wfaIsParent : false;
    },

    isRolledBack: function() {
        var rolledBack = false;
		// fix for Nested RollBack -- PRB583844
        if (this.rolledBackBy.isNil() || this.rolledBackBy == 0 || this.rollingBackBy != this.rolledBackBy)  {
           rolledBack = false;
        } else {
           rolledBack = true;
        }
        return rolledBack;
    },

    /**
     *  As model is cached by _getExecutedTransitions(), this
     *  function adds transitions that have gone FROM this 
     *  activity towards the .to activity
     * 
     */
    addTransition: function(inTransition /** ExecutedTransition **/) {
        this.transitions.push(inTransition);
    },

    getTransitionCount: function() {
        return (this.transitions) ? this.transitions.length : 0;
    },

    getJoinExpectedTransitionCount: function() {
        return (this.joinFroms) ? this.joinFroms.length : 0;
    },

   /** 
    * This is called as part of building the cached model in memory. It is
    * not called during playBack. This seeds all the expected
    * wf_activity sys_ids that are expected to pass through
    * this join and sets their arriveState = false. This state
    * is flipped to true as each expected activity transitions
    * to this instance of the Join.
    **/
    addJoinFromActivityIds: function(activityIds /* array of wf_activity.sys_ids that are headed towards join*/) {
        
        for (var i = 0; i < activityIds.length; i++) {  
               var joinFromActivity = {};
               joinFromActivity.id = activityIds[i];
               joinFromActivity.arriveState = this.NOT_ARRIVED;
               this.joinFroms.push(joinFromActivity);
        }
    },
   /** 
    * This is called during playback, as expected wf_activities
    * flow to the join. This changes the arrivedState of already known
    * ids  to true. As soon as it does, it tests to see if the join
    * is satisfied, if it is, the model walk can continue, if not
    * it should continue to next appropriate transition
    **/
    addArrivedActivityToJoin: function(activityId) {
        for (var i=0; i < this.joinFroms.length; i++) {
            if (this.joinFroms[i].id == activityId)
                this.joinFroms[i].arriveState = this.ARRIVED;
        }
        return this.isJoinSatisfied();
    },
    /**
     * This function tests the incoming wf_activity sys_id, presumed to
     * be seeded in this history record. If it is,
     * it is tested to see if it has already been through, if it has
     * then this join is not waiting on this activity and it should look
     * further downstream for the one that is waiting. This test is
     * is called in sequence as the model is walked, so it does presume
     * in the instances of rollbacks and loops, if the sys_id is in here
     * and the flag is true, this waiting Join is further up the sequence
     * this sort of check is required as the history records of Joins
     * are removed from the history table, and so it is possible for a 
     * record to be in transition table with no match in the corresponding
     * history table, but is still an appropriate match for an earlier executed
     * instance of the same Join.
     */
    isJoinWaitingForActivity: function(activityId) {
        /* FDT STRY0028839 defaulted to false instead of true */
        var isWaiting = false;
        for (var i=0; i < this.joinFroms.length; i++) {     
            if (this.joinFroms[i].id == activityId) {
                /* if it has not arrived arriveState = false, then we're waiting isWaiting = true */
                isWaiting = !this.joinFroms[i].arriveState;
                break;
            }
        }
        return isWaiting;
    },
    /**
     * This function tests the incoming wf_activity sys_id, presumed to
     * be seeded in this history record. If it is,
     * it is tested to see if it is an activity that would come through this join.
     * If it has
     */
   doesJoinContainActivity: function(activityId) {
        
        var contains = false;
        for (var i=0; i < this.joinFroms.length; i++) {     
            if (this.joinFroms[i].id == activityId) {
                contains = true
                break;
            }
        }
        return contains;
    },

    /**
     * This function returns the sys_ids of the history
     * records that transition to this Join activity
     * that have already come through
     */
    getSatisfiedJoinActivities: function(){ 
        var ids = [];
        for (var i=0; i < this.joinFroms.length; i++) {     
            if (this.joinFroms[i].arriveState) {
                ids.push(this.joinFroms[i].id );
            }
        }
        return ids;
    },

    /**
     * This function returns the sys_ids of the history
     * records that transition to this Join activity
     * that the join is still waiting for
     */
    getUnSatisfiedJoinActivities: function() {
        
        var ids = [];
        for (var i=0; i < this.joinFroms.length; i++) {     
            if (!this.joinFroms[i].arriveState) {
                ids.push(this.joinFroms[i].id);
            }
        }
        return contains;
    },

    /**
     * As model is cached the transitions that
     * Called during playback when the transition.to sys_id of a transition
     * points to an activity that is a join. This function examines the value 
     * of the arriveState 
     *
     */
    isJoinSatisfied: function() {
       var satisfied = false;
       for (var i=0; i < this.joinFroms.length; i++) {
             satisfied = this.joinFroms[i].arriveState;
             if (!satisfied)
                 break;
        }
        return satisfied;
    },

    /**
     * The purpose of this function is 
     * to determine if the sys_id passed in
     * is a destination of any of the
     * transitions associated with this
     * instance of an ActivityHistoryRecord
     *
     **/
     isIdADestination: function(ahrSys_id) {
         var isDestination = false;
  
         if (this.getTransitionCount() == 0 || ahrSys_id.isNil())
            return isDestination;

         for (var i = 0; i < this.transitions.length; i++) {
             if (this.transitions[i].to == ahrSys_id) {
                 isDestination = true;
                 break;   
             }
         }
        return isDestination;
     },
    
    debugDump: function(){
        gs.print('');
        gs.print('WF HISTORY RECORD:');
        gs.print('          History ID: ' + this.sys_id);
        gs.print('       History INDEX: ' + this.index);
        gs.print('  History START TIME: ' + this.startTime);
        gs.print('    History END TIME: ' + this.endTime);
        gs.print('       History INDEX: ' + this.index);
        gs.print('      WF Activity ID: ' + this.wfaId);
        gs.print('    WF Activity NAME: ' + this.wfaName);
        gs.print('  WF Activity DEF ID: ' + this.adId);
        gs.print('WF Activity DEF NAME: ' + this.adName);
        gs.print('    Transition Count: ' + this.getTransitionCount());
        gs.print('Roll Back Originator: ' +    this.rolledBackBy );
        gs.print(' Is Turnstile (loop): ' +    this.isTurnstile() );
        gs.print('             Is Join: ' + this.isJoin());
        for (var i=0; i < this.joinFroms.length; i++) {
             gs.print('               joined activities ' + this.joinFroms[i].id +  ' : ' + this.joinFroms[i].arriveState);
        }
    },

    getLogString: function(){
        var logStatement =  'HISTORY RECORD:' + 
               '  History ID:' + this.sys_id + 
               '  History INDEX:' + this.index + 
               '  History START TIME:' + this.startTime + 
               '  History END TIME:' + this.endTime +
               '  WF Activity ID:' + this.wfaId + 
               '  WF Activity NAME:' + this.wfaName + 
               '  WF Activity DEF ID:' + this.adId + 
               '  WF Activity DEF NAME:' + this.adName +
               '  Transition Count: ' + this.getTransitionCount() +
               '  Is Turnstile (loop) : ' + this.isTurnstile() +
               '  Is Join: ' + this.isJoin();
               if (this.isJoin()) {
                   '  Joined Activities: ';
                   var joins = ' : ';
                   for (var i=0; i < this.joinFroms.length; i++) {
                       joins+=    this.joinFroms[i].id  + ' - Executed ' + this.joinFroms[i].arriveState + ' : ';        
                   }
                   logStatement += joins;
               }
          return logStatement;

    },

    type:ActivityHistoryRecord 
}

var ExecutedTransition = Class.create();
ExecutedTransition.prototype = {

    initialize: function(grT  /** new GlideRecord('wf_transition_history' **/) {

        this.sys_id     = grT.sys_id.toString();     /* sys_id of transition  record **/
        this.ahrId      = grT.from_activity_history.toString(); 
        this.to         = grT.transition.to.toString();       /* wf_activity reference in the TO slot of this transition **/
        this.from       = grT.transition.from.toString();   /* wf_activity reference in the FROM slot of this transition **/
        this.rolledBack = grT.rolled_back.toString();       /* true or false state of rolled back */
        this.rolledBackBy = grT.rolled_back_by.toString();  /*activityRecord that rolled back this record */
    },

    debugDump: function() {
        gs.print('');
        gs.print('  TRANSITION RECORD:');
        gs.print('         Transition ID: ' + this.sys_id);
        gs.print('     WF History RECORD: ' + this.ahrId);
        gs.print('         FROM Activity: ' + this.from);
        gs.print('           TO Activity: ' + this.to);
        gs.print('           Rolled Back: ' + this.rolledBack);
        gs.print('  Roll Back Originator: ' + this.rolledBackBy );
    },

    type:ExecutedTransition
}