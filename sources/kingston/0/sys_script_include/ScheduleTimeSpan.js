var ScheduleTimeSpan = Class.create();

ScheduleTimeSpan.prototype = {
   initialize : function() {
   },
   
   getRepeatDescription : function(type, count, start, days, monthly, yearly, month, floatWeek, floatDay) {
      return GlideScheduleTimeSpan.getRepeatDescription(type, count, start, days, monthly, yearly, month, floatWeek, floatDay);
   }
}