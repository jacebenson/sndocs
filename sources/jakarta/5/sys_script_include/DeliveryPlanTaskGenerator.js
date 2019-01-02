gs.include("PrototypeServer");
var DeliveryPlanTaskGenerator= Class.create();

DeliveryPlanTaskGenerator.prototype = {
   initialize : function(/*DeliveryPlan*/ plan, /* GlideRecord */ parentItem) {
      this.plan = plan;
      this.parentItem = parentItem;
      this._map = {};
      this._lazy = false;
   },

   // the lazy flag is set when this is being called as part of a fix job
   // it inserts the local m2m reference records lazily. giving us better throughput
   // on the fix
   setLazy : function(/* boolean */ lazy) {
      this._lazy = lazy;
   },

   createTasks : function() {
      this._now = new GlideDateTime();
      var tokens = this.plan.getSortedTokenList();
      for (var i =0; i < tokens.size(); i++) {
        var tt = tokens.get(i);
        this._createTask(tt);
      }
      this._createLocalLinks();
   },

   convertTasks : function() {
      var tn = this.plan.getTaskTable();
      if (!tn)
          tn = 'sc_task';

      var kids = new GlideRecord(tn);
      kids.addQuery('parent', this.parentItem.sys_id);
      kids.setWorkflow(false);
      kids.orderBy('number');
      kids.query();
      while (kids.next()) {
         var id = kids.delivery_task;
         var tt = this.plan.getToken(id);
         if (!tt)
            continue;

         if (tt.getType() == 1) {
            this._addApprovalDetails(tt, kids);
            kids.update();
         }

         this._map[tt.getId()] = kids.sys_id + '';
      }
      this._createLocalLinks();
   },

   _createLocalLinks : function () {
      var it = this.plan.getTokenMap().values().iterator();
      while (it.hasNext()) {
        var tt =  it.next();
	this._createLocalLink(tt);
      }
   },

   _createLocalLink : function(/* TaskToken */ tt) {
      var task_id = this._map[tt.getId()];
      if (!task_id)
         return;

      var it = tt.getPredecessors().iterator();
      while (it.hasNext()) {
         var s = it.next();
         if ('START' == s)
            continue;
 
         var pred = this._map[s];
         if (!pred)
            continue;

         var gr = new GlideRecord('execution_plan_local');
         gr.initialize();
         gr.predecessor = pred;
         gr.successor = task_id;
         if (this._lazy)
           gr.insertLazy();
         else
           gr.insert();
      }
   },

   _createTask : function(/* TaskToken */ tt) {
      var template = new GlideRecord('sc_cat_item_delivery_task');
      template.get(tt.getId());
      var description = template.short_description;	
      // if we're still nil use the task name
      if (!description) 
	  description = template.name;
		
      var task = new GlideRecord(this.plan.getTaskTable());
      task.initialize();
      this._setParentage(task);
      task.short_description = description;
      task.description = template.instructions;
      task.work_notes = template.work_notes;
      task.due_date.setValue(tt.getDueDate(this._now));
      task.assignment_group = template.group;
      task.assigned_to = template.assigned_to;
      task.delivery_task = tt.getId();
      task.expected_start.setValue(tt.getExpectedStart(this._now));
	  if (this.plan.getTaskTable() == ChangeTask.CHANGE_TASK) {
         var changeTask = new ChangeTask(task);
         changeTask.setPending();
	  } else
         task.state = -5;
      this._runTaskScript(task, tt);
      if (tt.getType() == 1)
         this._addApprovalDetails(tt, task);		
      var id = task.insert();
      this._map[tt.getId()] = id;
   },
   
   _addApprovalDetails : function (/* TaskToken */ tt, /* GlideRecord */ task) {
      task.upon_approval = 'proceed';
      task.upon_reject = 'cancel';
      task.rejection_goto = this._map[tt.getUponRejectGoto()];
      if (tt.getUponReject() == 1)
         task.upon_reject = 'goto';
      
   },

   _setParentage : function (/* GlideRecord */ task) {
      task.parent = this.parentItem.sys_id;
      if (task.getRecordClassName() == 'change_task')
         task.change_request = this.parentItem.sys_id;
   },

   _runTaskScript : function (/* GlideRecord */ task, /* TaskToken */ tt) {
      if (!tt.getGenerationScript())
         return;

      task.putCurrent();
      eval(tt.getGenerationScript() + '');
      task.popCurrent();
   }
};