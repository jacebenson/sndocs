var SelfCleaningMutex = Class.create();

/*
 * Enter the Critical section, as identified by the mutexName
 * and execute the specified criticalFunction() with the given arguments
 */
SelfCleaningMutex.enterCriticalSection = function(scMutexName, scope, criticalFunction) {
   var mutex = new SelfCleaningMutex('<<<--' + scMutexName + '-->>>');
   return mutex.enterCriticalSection.apply(mutex, arguments);
};

/*
 * Enter the Critical section, as identified by the mutexName and metricName that will be used in performance graphs
 * and execute the specified criticalFunction() with the given arguments
 */
SelfCleaningMutex.enterCriticalSectionRecordInStats = function(scMutexName, metricName, scope, criticalFunction) {
   var mutex = new SelfCleaningMutex('<<<--' + scMutexName + '-->>>', metricName);
   return mutex.enterCriticalSectionRecordInStats.apply(mutex, arguments);
};

SelfCleaningMutex.prototype = Object.extendsObject(Mutex, {
   initialize : function(mutexId, metricName) {
	  if (metricName === undefined) {
		  this._mutex = new GlideSelfCleaningMutex(mutexId);
	  }
	  else {
		  this._mutex = new GlideSelfCleaningMutex(mutexId, metricName); 
	  }
      // limit our attempt to get a mutex
      this.setSpinWait(this._getScriptSpinWaitSetting());
      this.setMaxSpins(this._getScriptMaxSpinsSetting());
   },
   
   // default spin wait times, 10ms for 100 attempts -- same as Mutex
   
   // properties to override the default values (from Mutex), for SelfCleaningMutex specifically
   MUTEX_SPINWAIT_MS: 'com.glide.selfcleaningmutex.script.spinwait',
   MUTEX_MAXSPINS: 'com.glide.selfcleaningmutex.script.maxspins',
  
   type: 'SelfCleaningMutex'
});