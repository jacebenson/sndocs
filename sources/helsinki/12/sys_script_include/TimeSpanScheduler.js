var TimeSpanScheduler = Class.create();

TimeSpanScheduler.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  ajaxFunction_scheduleTime: function() {
      return new ScheduleTimeSpan().getRepeatDescription(
                 this.getParameter('sysparm_repeat_type'),
		 this.getParameter('sysparm_repeat_count'),
		 this.getParameter('sysparm_start_date'),
                 this.getParameter('sysparm_days_of_week'), 
                 this.getParameter('sysparm_monthly_type'),
                 this.getParameter('sysparm_yearly_type'),
                 this.getParameter('sysparm_month'),
                 this.getParameter('sysparm_float_week'),
                 this.getParameter('sysparm_float_day'));
  },
  
  ajaxFunction_scheduleDateTime: function() {
      var sdt = new ScheduleDateTime(this.getParameter('sysparm_dt_tm'));
	  if (this.getParameter('sysparm_include_z_format') == 'false')
	     sdt.setIncludeZFormat(false);
      return sdt.convertTimeZone(this.getParameter('sysparm_current_timezone'),this.getParameter('sysparm_new_timezone'));
  }
 


});