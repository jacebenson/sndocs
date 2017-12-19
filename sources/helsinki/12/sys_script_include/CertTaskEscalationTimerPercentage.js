var CertTaskEscalationTimerPercentage = Class.create();
CertTaskEscalationTimerPercentage.prototype = {
    initialize: function() {
    },
    
    /**
	 * Returns the number of seconds the workflow timer needs to wait for duration of
	 * cert task based on the percentage specified.
	 * @param certTaskRecord Certification task record
	 * @param percentage Percentage of duration of the task the timer needs to wait
	 */
    getTimerWaitDuration: function(certTaskRecord, percentage) {
        var rightNow = new GlideDateTime();
        var startDate = certTaskRecord.sys_created_on.getGlideObject();
        var endDate = certTaskRecord.complete_by.getGlideObject();
        var usedDuration = 0;
        var totalDuration = endDate.getNumericValue() - startDate.getNumericValue();
		var percentageDuration = 0;
		var modifiedDuration = 0;
		var waitTime = 0;
		
        usedDuration = rightNow.getNumericValue() - startDate.getNumericValue();
        percentageDuration = totalDuration * (percentage / 100);
			
		modifiedDuration = percentageDuration - usedDuration;
		
        // Set 'answer' to the number of seconds this timer should wait
        if(modifiedDuration > 0)
            waitTime = modifiedDuration / 1000;
		
		return waitTime;
    },
     
    /** 
     * Updates the Aging level of all certification tasks. Called by a scheduled job.
     */
    updateAgingLevels: function() {
        var age30 = new GlideDateTime();
        age30.addDays(-30);
        var age60 = new GlideDateTime();
        age60.addDays(-60);
        var age90 = new GlideDateTime();
        age90.addDays(-90);
        var certTask = new GlideRecord('cert_follow_on_task');
        var startDate;
        certTask.addEncodedQuery('stateIN-5,1,2');
        certTask.query();
        while(certTask.next()) {
        
 	       startDate = certTask.sys_created_on.getGlideObject();
			if (startDate.getNumericValue() > age30.getNumericValue()) {
	           	certTask.setValue('aging_level', gs.getMessage("30 days"));
			}
            else if (startDate.getNumericValue() > age60.getNumericValue()) {
            	certTask.setValue('aging_level', gs.getMessage("60 days"));
			}
            else if (startDate.getNumericValue() > age90.getNumericValue()) {
            	certTask.setValue('aging_level', gs.getMessage("90 days"));
			}
            else {
            	certTask.setValue('aging_level', gs.getMessage("Past 90 days"));
			}
            
            certTask.update();
        }
    },
	
    type: 'CertTaskEscalationTimerPercentage'
}