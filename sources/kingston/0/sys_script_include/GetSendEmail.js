var GetSendEmail = Class.create();
GetSendEmail.prototype = {
	initialize: function() {
		
	},
	
	execute: function() {
		var emailReaderHandlerClass = "com.glide.email_accounts.EmailReaderJob";
		var smtpSenderHandlerClass = "SMTPSenderJob";
		var jobIDs = [];
		jobIDs.push(this._getJobID(emailReaderHandlerClass),this._getJobID(smtpSenderHandlerClass));
		
		for (var i=0; i < jobIDs.length; i++) {
			
			if(jobIDs[i]) {
				var sysTriggerGr = new GlideRecord("sys_trigger");
				sysTriggerGr.addQuery("job_id",jobIDs[i]);
				sysTriggerGr.query();
				this._updateNextAction(sysTriggerGr);
			}
		}
	},
	
	_getJobID: function(handlerClass) {
		var sysJobGr = new GlideRecord("sys_job");
		sysJobGr.addQuery("handler_class",handlerClass);
		sysJobGr.query();
		if(sysJobGr.next()) {
			return sysJobGr.getUniqueValue();
		}
		
		return null;
	},
	
	_updateNextAction: function(sysTriggerGr) {
		if (sysTriggerGr.next()) {
			var jobName = sysTriggerGr.getValue("name");
			if(sysTriggerGr.getValue("state") == 1) {
				gs.log("Skipping run of " + jobName + " job as it is already running");
			}
			else {
				gs.log("Triggering " + jobName + " job");
				var gdt = new GlideDateTime();
				gdt.setNumericValue(0);
				sysTriggerGr.setValue("next_action",gdt.getValue());
				sysTriggerGr.update();
				
			}
			
		}
		
	},
	
	type: 'GetSendEmail'
};