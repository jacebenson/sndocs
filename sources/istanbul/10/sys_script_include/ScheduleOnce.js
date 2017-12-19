gs.include("Schedule");
var ScheduleOnce = Class.create();

ScheduleOnce.prototype =  Object.extendsObject(Schedule,{
   initialize: function() {
      Schedule.prototype.initialize.call(this);
      this.time = new GlideDateTime();
      this.document = null;
      this.trigger_type = 0;
      this.seconds = 0;
      this.minutes = 0;
      this.hours = 0;
      this.days = 0;
   },
   
   // when this should run
   setTime: function(glideDateTime) {
      this.time = glideDateTime;
   },
   
   schedule: function() {
      var t = this._getTrigger();
      
      // calc and set time
      var n = parseInt(this.seconds);
      n += parseInt(this.minutes) * 60;
      n += parseInt(this.hours) * 60 * 60;
      n += parseInt(this.days) * 24 * 60 * 60;
      this.time.addSeconds(n);
      t.next_action.setValue( this.time );
      
      t.trigger_type = this.trigger_type;
      gs.print("Scheduling: " + this.label + " for: " + t.next_action.getDisplayValue());
      return t.insert();
   },
   
   setAsSeconds : function(secs) {
      if (secs >= 86400) {
         this.days = parseInt((secs / 86400),10);
         secs -= (this.days * 86400);
      }
      
      if (secs >= 3600) {
         this.hours = parseInt((secs / 3600),10);
         secs -= (this.hours * 3600);
      }
      
      if (secs >= 60) {
         this.minutes = parseInt((secs / 60),10);
         secs -= (this.minutes * 60);
      }
      
      this.seconds = secs;
   }
   
});
