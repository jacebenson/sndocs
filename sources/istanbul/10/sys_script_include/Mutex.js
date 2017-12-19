var Mutex = Class.create();

/*
 * Enter the Critical section, as identified by the mutexName
 * and execute the specified criticalFunction() with the given arguments
 */
Mutex.enterCriticalSection = function(mutexName, scope, criticalFunction /*, optional arguments to criticalFunction() */) {
   var mutex = new Mutex('<<<--' + mutexName + '-->>>');
   return mutex.enterCriticalSection.apply(mutex, arguments);
};

/*
 * Enter the Critical section, as identified by the mutexName and metricName
 * and execute the specified criticalFunction() with the given arguments
 */
Mutex.enterCriticalSectionRecordInStats = function(mutexName, metricName, scope, criticalFunction /*, optional arguments to criticalFunction() */) {
   var mutex = new Mutex('<<<--' + mutexName + '-->>>', metricName);
   return mutex.enterCriticalSectionRecordInStats.apply(mutex, arguments);
};

Mutex.prototype = {
   initialize : function(mutexId, metricName) {
	  var uniqueIdentifier = metricName;
	  if (typeof metricName === 'undefined') 
		  uniqueIdentifier = '';
      this._mutex = new GlideMutex(mutexId, uniqueIdentifier);
      // limit our attempt to get a mutex
      this.setSpinWait(this._getScriptSpinWaitSetting());
      this.setMaxSpins(this._getScriptMaxSpinsSetting());
   },
   
   // 100ms, 100 times == 10 seconds
   DEFAULT_SPINWAIT_MS: 100,
   DEFAULT_MAXSPINS:    100, 
   
   // properties to override the above default values, for Mutex
   MUTEX_SPINWAIT_MS: 'com.glide.mutex.script.spinwait',
   MUTEX_MAXSPINS: 'com.glide.mutex.script.maxspins',

   get: function() {
      return this._mutex.get();
   },

   release: function() {
      return this._mutex.release();
   },

   // how long, in ms, to wait between lock attempts
   setSpinWait: function(waitMS) {
      return this._mutex.setSpinWait(waitMS);
   },

   // how many times get() will try to acquire a lock.
   setMaxSpins: function(n) {
      return this._mutex.setMaxSpins(n);
   },
   
   // after acquiring mutexName, execute criticalFunction, in the Script scope
   enterCriticalSection: function(mutexName, scope, criticalFunction /*, optional arguments to criticalFunction() */) {
      // Arrange our remaining arguments, for calling the criticalFunction
      // arguments[0]   - mutexName
      // arguments[1]   - scope to execute criticalFunction() in, usually 'this'
      // arguments[2]   - criticalFunction()
      // arguments[3..] - arguments to criticalFunction()
      var args = [];
      var func = arguments[2];
      for (var i=3; i< arguments.length; i++)
         args.push(arguments[i]);

      var rval;
      if (this.get()) {
         try {
            rval = func.apply(scope, args);
         }
         finally {
            this.release();
         }
      }
      
      return rval;
   },
	
   // after acquiring mutexName, execute criticalFunction, in the Script scope
   enterCriticalSectionRecordInStats: function(mutexName, metricName, scope, criticalFunction /*, optional arguments to criticalFunction() */) {
      // Arrange our remaining arguments, for calling the criticalFunction
      // arguments[0]   - mutexName
	  // arguments[1]   - metricName (this is tracked in the performance graphs)
      // arguments[2]   - scope to execute criticalFunction() in, usually 'this'
      // arguments[3]   - criticalFunction()
      // arguments[4..] - arguments to criticalFunction()
      var args = [];
      var func = arguments[3];
      for (var i=4; i< arguments.length; i++)
         args.push(arguments[i]);

      var rval;
      if (this.get()) {
         try {
            rval = func.apply(scope, args);
         }
         finally {
            this.release();
         }
      }
      
      return rval;
   }, 	 
   
   // 100 ms, if not overridden by the (com.glide.mutex.script.spinwait) property value
   _getScriptSpinWaitSetting: function() {
      return gs.getProperty(this.MUTEX_SPINWAIT_MS, this.DEFAULT_SPINWAIT_MS);
   },
   
   // 100 times, if not overriden by the (com.glide.mutex.script.maxspins) property value
   _getScriptMaxSpinsSetting: function() {
      return gs.getProperty(this.MUTEX_MAXSPINS, this.DEFAULT_MAXSPINS);
   },

   type: 'Mutex'
};