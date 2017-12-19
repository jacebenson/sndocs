var ScheduleDateTime = Class.create();

ScheduleDateTime.prototype = {
  initialize : function(date_time) {
    if (JSUtil.nil(date_time))
       this.dt = new GlideScheduleDateTime();
    else 
       this.dt = new GlideScheduleDateTime(date_time);
  },

  convertTimeZone : function(from, to) {
    return this.dt.convertTimeZone(from, to);
  },
   
  setIncludeZFormat : function(booleanValue) {
    return this.dt.setIncludeZFormat(booleanValue);
  }
}