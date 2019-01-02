var HRIntegrationsFutureWorkerTransformHelper = Class.create();

HRIntegrationsFutureWorkerTransformHelper.prototype =  Object.extendsObject(HRIntegrationsWorkerTransformHelper, {

    initialize: function() {
    
	},

	
	postProcessAllRecords: function(importSetId) {
		//Do Nothing
	},
	
	// Whether the current transform record should be skipped.
	shouldSkipTransform: function(source, target) {
   
		var transactionLogMatched = false;
		var profile = new GlideRecord('sn_hr_core_profile');
		var isPushEnabled = hrIntegrationsHelper.isPushEnabled(source.source);
		if (profile.get(target.sys_id) && isPushEnabled){
			if (profile.getValue('transaction_log') && source.getValue('transaction_log'))
				transactionLogMatched = profile.getValue('transaction_log').indexOf(source.getValue('transaction_log').trim()) > -1;
		}
		
		if (!(source.current_hire_date > this.getTodayDate(source) || 
			  ((source.terminated == "1"||source.employement_status=='T') && source.end_date >= this.getTodayDate(source))) || transactionLogMatched) {
			return true;
		}
		return false;
	},

    /**
     * Process the employment status. (this is called from the parent - during transform)
     */
	processEmploymentStatus: function(source, target) {
		if(source.terminated == "1"||source.employement_status=='T') {
			if (source.end_date >= this.getTodayDate(source)) {
				this.updateUserActive(target, true);
			} else {
				this.updateUserActive(target, false);
			}
		} else if (source.current_hire_date > this.getTodayDate(source)) {
			//New hire process this as on boarding.
			this.updateUserActive(target, true);
		}
	},
	
	/**
	 * Override this if you don't want the manager update.
	 */
	shouldSkipManagerUpdate: function(workdayRecord) {
		//gs.info('Today date = '+this.getTodayDate(source));
		if (workdayRecord.current_hire_date > this.getTodayDate(workdayRecord.source)) 
			return false;
		
		return true;
	},
	
	/**
	 * Called by the transform before storing the record.
	 */ 
	updateHrProfileForOffBoarding: function(source, target) {
        //gs.info('ONBEFORE INSERT:?: Target value = '+target.active);
		if ((source.terminated == "1"||source.employement_status=='T') && source.end_date >= this.getTodayDate(source)) {
	    	target.employment_end_date = source.end_date;
			this.updateUserActive(target, true);
            //gs.info(' Overriding: Target value = '+target.active);
		}
	},
	
	updateUserActive: function (target, active) {
		var user = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
		if (user.get(target.user)){
			user.active = active;
			user.update();
		}
	},

    type: 'HRIntegrationsFutureWorkerTransformHelper'
});