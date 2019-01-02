var SubscriptionAuditHelper = Class.create();
SubscriptionAuditHelper.prototype = {
    initialize: function() {
		
		this.LICENSE_DETAILS_AUDIT_LOG = "license_details_audit_log";
		
		this.CREATED = "created";
		this.DELETED = "deleted";
		this.UPDATED = "updated";
		
		this.INITIALIZED = this._validate();
    },
	
	recordSubscriptionAdded: function (licGR) {		
		this.record(licGR, this.CREATED);
	},
	
	recordSubscriptionDeleted: function (licGR) {
		this.record(licGR, this.DELETED);
	},
	
	recordSubscriptionUpdated: function (licGR) {
		this.record(licGR, this.UPDATED);
	},
	
	record: function(licGR, action) {
		
		if (!this.INITIALIZED)
			return;
		
		if (!this._validateAuditInput(licGR, action))
			return;
		
		var opTime = this._getOperationTime(licGR, action);
		var licName = licGR.getValue("name");
			
		var gr = new GlideRecord(this.LICENSE_DETAILS_AUDIT_LOG);
		
		gr.setValue("time_stamp", opTime);
		gr.setValue("license", licGR.getValue("sys_id"));
		gr.setValue("license_name", licName);
		gr.setValue("action", action);
		gr.setValue("new_purchased_count", licGR.getValue("count"));
		gr.setValue("new_start_date", licGR.getValue("start_date"));
		gr.setValue("new_end_date", licGR.getValue("end_date"));
		
		var auditRec = gr.insert();
		
		if (JSUtil.nil(auditRec))
			GlideLog.error("Subscription Audit Log failed for license: " + licName);
	},
	
	_getOperationTime: function (licGR, action) {
		
		if (action === this.CREATED)
			return licGR.getValue("sys_created_on");
		else if (action === this.UPDATED)
			return licGR.getValue("sys_updated_on");
		else 
			return new GlideDateTime().getValue();
		
	},
	
	_validateAuditInput: function (licGR, action) {
		
		if (JSUtil.nil(licGR)) {
			GlideLog.error("Skipping Subscription Audit Log for subscription " + action + "operation because GlideRecord object is null");
			return false;
		}
		
		if (JSUtil.nil(action)) {
			GlideLog.error("Skipping Subscription Audit Log for subscription " + licGR.name + "because operation is unknown");
			return false;
		}
		
		return true;
	},
	
	_validate: function() {
		if (!GlideTableDescriptor.isValid(this.LICENSE_DETAILS_AUDIT_LOG)) {
			GlideLog.error("Skipping Subscription Audit Log because " + this.LICENSE_DETAILS_AUDIT_LOG + " does not exist");
			return false;
		}
		
		return true;
	},

    type: 'SubscriptionAuditHelper'
};