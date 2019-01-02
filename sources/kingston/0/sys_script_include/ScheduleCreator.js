var ScheduleCreator = Class.create();

ScheduleCreator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
 ajaxFunction_createSchedule: function() {
   var unique;
   if (this.getParameter("sysparm_unique") == "true")
       unique = true;
   else
       unique = false;
   var m = new IndexCreator(this.getParameter('sysparm_table'),this.getParameter('sysparm_fields'),unique,this.getParameter('sysparm_email'),this.getParameter('sysparm_schedule_name'));
    m.schedule();
 }
 
});