gs.include("PrototypeServer");
gs.include("DeliveryPlanTaskGenerator");
var DeliveryPlan = Class.create();

DeliveryPlan.prototype = {
   initialize : function(/*GlideRecord*/ gr) {
      this.parentRecord = gr;
      this.planID = gr.delivery_plan + '';
      this.plan = GlideAbstractExecutionPlan.get(this.planID);
   },
   
   createChildren : function() {
      if (!this.plan)
         return;

      var gen = new DeliveryPlanTaskGenerator(this.plan, this.parentRecord);
      gen.createTasks();
        
   },

   rejectTask : function (/* GlideRecord */ rejectedTask) {
      if (!this.plan)
         return;

      var action = rejectedTask.upon_reject;
      var reject_goto = rejectedTask.rejection_goto;
      
      if (action == 'goto')
         this._rollBackTo(reject_goto, rejectedTask);
      else 
         this._cancelPendingOrOpen(rejectedTask);
   },

   initTasks : function() {
      var kids = new GlideRecord('task');
      kids.addQuery('parent', this.parentRecord.sys_id);
      kids.query();
      while (kids.next()) {
        var canStart = this._canStart(kids.sys_id);
        if (this._canStart(kids.sys_id)) {
           var className = kids.sys_class_name;
           var gr = new GlideRecord(className);
           gr.get(kids.sys_id);
           if (this._shouldSkip(gr))
               this._skip.call(this, gr);
           else
               this._start.call(this, gr);
           gr.update();
        }
      }
   },

   startTasks : function(/* GlideRecord */ closed) {
      var depends = new GlideRecord('execution_plan_local');
      depends.addQuery('predecessor', closed.sys_id);
      depends.query();
      while (depends.next()) {
         // depends might conceivably start if there are no other dependencies
         if (this._canStart(depends.successor)) {
            var className = depends.successor.sys_class_name;
            var realThing = new GlideRecord(className);
            realThing.get(depends.successor);
            if (this._shouldSkip(realThing))
               this._skip.call(this, realThing);
            else
               this._start.call(this, realThing);
            realThing.update();
         }
      }
   },

   _canStart : function(/* String */ task_id) {
      // look for a predecessor which is still running
      // still running is defined as work_end is not null
      var depends = new GlideRecord('execution_plan_local');
      depends.addQuery('successor', task_id);
      depends.addQuery('predecessor.work_end', '=', '');
      depends.query();
      if (depends.next())
         return false;

      return true;
   },

   _shouldSkip : function(/* GlideRecord */ task) {
      if (!this.plan)
         return false;

      var id = task.delivery_task;
      var tt = this.plan.getToken(id);
      if (!tt)
         return false;

      return tt.shouldSkip(task);
   },

   _calcBasis : function() {
      var gr = new GlideRecord(this.plan.getTaskTable());
      var basis = this.parentRecord.sys_updated_on.getGlideObject();
      gr.addQuery('parent', this.parentRecord.sys_id);
      gr.query();
      while (gr.next()) {
         if (gr.delivery_task.nil())
            continue;
         
         var tt = this.plan.getToken(gr.delivery_task);
         if (!tt)
             continue;
         
         var due_date = tt.getDueDate(basis);
         var expected_start = tt.getExpectedStart(basis);

         gr.due_date.setValue(due_date);
         gr.expected_start.setValue(expected_start);
         if (gr.due_date.changes() || gr.expected_start.changes())
           gr.update();
      }
   },
   
   _cancelPendingOrOpen : function(/* GlideRecord */ rejectedTask) {   
      this._stop.call(this, rejectedTask);   
      if (!this.plan)
         return;
         
      var gr = new GlideRecord(this.plan.getTaskTable()); 
      gr.addQuery('parent', this.parentRecord.sys_id);
      gr.addQuery('sys_id', '!=', rejectedTask.sys_id);
      var qc = gr.addQuery('state', '1'); // open
      qc.addOrCondition('state', '-5'); // pending
      gr.query();
      while (gr.next()) {
          this._cancel.call(this, gr);
          gr.update();
      }
   },
   
   _rollBackTo : function(/* String */ reject_goto, /* GlideRecord */ rejectedTask) {
      if (!this.plan)
         return;
      var gr = new GlideRecord(this.plan.getTaskTable());
      gr.addQuery('parent', this.parentRecord.sys_id);
      gr.query(); 
      while (gr.next()) {
         
         gs.print('<<<<< Testing ' + gr.number);
         // this is the task we want to roll to
         if (gr.sys_id == reject_goto) {
             this._start.call(this, gr);
             gr.update();
             continue;
         }
         
         if (this._hasPredecessor(gr.sys_id, reject_goto)) {
             
            gs.print('PENDING ' + gr.number);
            if (gr.sys_id != rejectedTask.sys_id) {
                this._pend.call(this, gr);
                gr.update();
            } else {
                this._pendSelf.call(this, rejectedTask);
            }
         }
      }
   },
   
   _hasPredecessor : function (/* String */ test_id, /* String */ pred_id) {
      
       gs.print('TEST ID = ' + test_id);
       var gr = new GlideRecord('execution_plan_local');
       gr.addQuery('successor', test_id);
       gr.query();
       while (gr.next()) {
          gs.print('PRED = ' + gr.predecessor + ' PRED_ID = ' + pred_id);
          if (gr.predecessor == pred_id)
            return true;
            
          if (this._hasPredecessor(gr.predecessor, pred_id))
             return true;
       } 
       return false;
   },
     
   _start : function(/* GlideRecord */ gr) {
      gr.work_start = gs.nowDateTime();
      gr.work_end = null;
      gr.state = '1';
   },
   
   _stop : function(/* GlideRecord */ gr) {
      gr.work_end = gs.nowDateTime();
      gr.state = '4'; 
   },

   _skip : function(/* GlideRecord */ gr) {
      gr.work_start = gs.nowDateTime();
      gr.work_end = gs.nowDateTime();
      gr.state = '7';
   },

   _pend : function(/* GlideRecord */ gr) {
      gr.work_start = null;
      gr.work_end = null;
      gr.work_notes = "Task set back to pending due to a subsequent task being rejected";
      gr.state = '-5';
   },
   
   _pendSelf : function(/* GlideRecord */ gr) {
      gr.work_start = null;
      gr.work_end = null;
      gr.work_notes = "Task set back to pending due its being rejected and a previous task being restarted";
      gr.state = '-5';
   },

   

   _cancel : function(/* GlideRecord */ gr) {
      gr.work_start = gs.nowDateTime();
      gr.work_end = gs.nowDateTime();
      gr.state = '4';
   },
}