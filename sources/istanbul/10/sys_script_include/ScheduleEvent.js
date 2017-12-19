var ScheduleEvent = Class.create();

ScheduleEvent.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
   ajaxFunction_scheduleIR: function() {
       new IRSchedule().schedule(this.getParameter('sysparm_event') ,this.getParameter('sysparm_table') ,this.getValue());
   },
	
   isPublic: function() {
      return false;
   }
});