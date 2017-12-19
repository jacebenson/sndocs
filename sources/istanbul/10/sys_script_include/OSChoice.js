/**
 * Utilities for the 'os' field of cmdb_ci_computer.
 */
var OSChoice = Class.create();

/**
 * Adds the specified OS to the list of available operating systems in cmdb_ci_computer, if not already available.
 * @param string os The label / value of the choice entry.
 * @return string Returns the same os label / value passed to this method
 */
OSChoice.reconcile = function(os) {
	var gr = new GlideRecord('sys_choice');
	gr.setWorkflow(false); // dont write out changes
	gr.addQuery('name', 'cmdb_ci_computer');
	gr.addQuery('element', 'os');
	gr.addQuery('label', os);
	gr.query();

	if (gr.next()) {
		if (gr.inactive == false)
			return os;

		gr.inactive = false;
		gr.update();
	} else {
		// use a mutex to prevent the insertion of duplicate OS in sys_choice table 
		var mutexName = '<<<-- OSChoice Mutex of '+ os + '-->>>';
		var mutexMetricName = 'OSChoice Mutex';
		var mutex = new SelfCleaningMutex(mutexName, mutexMetricName);
		// limit our attempt to get a mutex to 120 seconds... 
		mutex.setSpinWait(500);
		mutex.setMaxSpins(240);
		mutex.setMutexExpires(120000); //120 seconds 
		
		if (mutex.get()) {
			try {
				// check to see that it doesn't exist already
				var sr = new GlideRecord('sys_choice');
				sr.setWorkflow(false); // dont write out changes
				sr.addQuery('name', 'cmdb_ci_computer');
				sr.addQuery('element', 'os');
				sr.addQuery('label', os);
				sr.query();
				
				if (!sr.next()) {
					sr.initialize();
					sr.setValue('name', 'cmdb_ci_computer');
					sr.setValue('element', 'os');
					sr.setValue('value', os);
					sr.setValue('label', os);
					sr.setValue('inactive', false);
					sr.setValue('language', 'en');
					sr.insert();
				}
			} finally {
				mutex.release();
			}
		} else {
			//lock failed
			gs.log("Unable to lock on to " + mutexName);
		}
	}
	
	return os;
}

OSChoice.prototype = {
    initialize: function() { /* do nothing */ },
    type: 'OSChoice'
}