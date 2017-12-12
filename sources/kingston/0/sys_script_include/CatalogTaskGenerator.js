gs.include('DeliveryPlanTaskGenerator');
var CatalogTaskGenerator= Class.create(); 

CatalogTaskGenerator.prototype = Object.extendsObject(DeliveryPlanTaskGenerator, {

    _createTask : function(/* TaskToken */ tt) {

      var template = new GlideRecord('sc_cat_item_delivery_task');
      template.get(tt.getId());
      var description = template.short_description;	
      if (!description)
         description = this.parentItem.cat_item.short_description;

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
	  task.order = tt.getOrder();
      task.delivery_task = tt.getId();
      task.expected_start.setValue(tt.getExpectedStart(this._now));
      task.state = -5;
      task.cmdb_ci = this.parentItem.configuration_item;
      task.request_item.setRefRecord(this.parentItem);
      this._runTaskScript(task, tt);
      if (tt.getType() == 1)
         this._addApprovalDetails(tt, task);
      var id = task.insert();
      this._map[tt.getId()] = id;
   },

   _setParentage : function (/* GlideRecord */ task) {
      task.parent = this.parentItem.sys_id;
      if (task.getRecordClassName() == 'sc_task')
         task.request_item = this.parentItem.sys_id;
   }

});