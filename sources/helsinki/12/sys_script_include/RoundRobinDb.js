gs.include("PrototypeServer");

var RoundRobinDb = Class.create();
RoundRobinDb.prototype = {
   
   initialize: function() {
      this.rrdb = null;
      this.sample = null;
      this.logErrors = true;
   },
            
   /**
    * Open a RRDb
    */
   open: function(name) {
      this.rrdb = SncRrdGlideBackendFactory.get(name);
   },
   
   /**
    * Close the RRDb opened with 'open'
    */
   close: function() {
      if (this.rrdb) {
         this.rrdb.close();
         this.rrdb = null;
         this.sample = null;
      }
   },

   insert: function() {
      this.update();
      this.close();
   },
   
   /**
    * Create a sample that we will store values into
    *
    * If the 'datetime' parameter is specified it needs to be a date-time
    * value in the user's date-time format.  If not specified, then the
    * timestamp is set to the current time.
    */
   createSample: function(datetime) {
      if (!this.rrdb)
         // must open a database first
         return;
      
      this.sample = this.rrdb.createSample();
      var timestamp;
      if (typeof datetime == 'undefined') {
         timestamp = new Date().getTime();
      } else {
         var gdt = new GlideDateTime();
         gdt.setDisplayValue(datetime);
         timestamp = gdt.getRaw().getTime();
      }
      timestamp = parseInt(timestamp / 1000);
      this.sample.setTime(timestamp);
   },
   
   /**
    * Set a value into the sample created with 'createSample'
    * returns true for success
    */
   setValue: function(name, doubleValue) {
      if (!this.sample)
         // must create a sample first
         return false;
       
      var answer = true;
      try {
         this.sample.setValue(name, parseFloat(doubleValue));
      } catch (ex) {
         answer = false;
         if (this.logErrors) 
             GlideLog.error("rrdb.setValue: " + ex);
      }
      
      return answer;
   },
  
   setLogErrors: function(logErrors) {
      this.logErrors = logErrors;
   },
   
   /**
    * Write the sample to the database - the sample is no longer
    * valid after calling this method and 'createSample' must
    * be called again to create a new sample
    */
   update: function() {
      if (!this.sample)
         // must create a sample first
         return;
      
      try {
          this.sample.update();
      } catch (ex) {
         if (this.logErrors) 
             GlideLog.error("rrdb.update: " + ex);
      }

      this.sample = null;
   },
   
   z: null
};

