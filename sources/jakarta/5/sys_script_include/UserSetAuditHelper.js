var UserSetAuditHelper = Class.create();
UserSetAuditHelper.prototype = {
    initialize: function() {
		
		this.SYS_USER_AUDIT_LOG = "sys_user_set_audit_log";
		this.SYS_USER_SET = "sys_user_set";
		
		this.CREATED = "created";
		this.DELETED = "deleted";
		this.UPDATED = "updated";
		
		this.userSetHelper = new UserSetHelper();
		
		this.INITIALIZED = this._validate();
    },
	
	recordUserSetCreated: function (userSetGR) {
		this.record(userSetGR, "", this.CREATED);
	},
	
	recordUserSetUpdated: function (newUserSetGR, oldUserSetGR) {		
		this.record(newUserSetGR, oldUserSetGR, this.UPDATED);
	},
	
	recordUserSetDeleted: function (userSetGR) {
		this.record(userSetGR, "", this.DELETED);
	},
	
	record: function(newUserSetGR, oldUserSetGR, operation) {
		
		if (!this.INITIALIZED)
			return;
		
		if (!this._validateAuditInput(newUserSetGR, operation))
			return;
		
		var countDelta = this._getCountDelta(newUserSetGR, oldUserSetGR);
		
		var userSetName = newUserSetGR.getValue("name");
		var opTime = this._getOperationTime(newUserSetGR, operation);
				
		var gr = new GlideRecord(this.SYS_USER_AUDIT_LOG);
		
		gr.setValue("time_stamp", opTime);
		gr.setValue("user_set_name", userSetName);
		gr.setValue("user_set", newUserSetGR.getValue("sys_id"));
		gr.setValue("operation", operation);
		gr.setValue("user_set_source_type", newUserSetGR.getValue("source"));
		gr.setValue("user_count_delta", countDelta);
		
		var auditRec = gr.insert();
		
		if (JSUtil.nil(auditRec))
			GlideLog.error("User Set Audit Log creation failed for: " + userSetName);
	},
	
	_getOperationTime: function (newUserSetGR, operation) {
		
		if (operation === this.CREATED)
			return newUserSetGR.getValue("sys_created_on");
		else if (operation === this.UPDATED)
			return newUserSetGR.getValue("sys_updated_on");
		else 
			return new GlideDateTime().getValue();
		
	},
	
	_getCountDelta: function (/*sys_user_set GlideRecord*/newUserSetGR, /*sys_user_set GlideRecord*/oldUserSetGR) {
		
		var beforeUsers = this.userSetHelper.retrieveUserSetCount(oldUserSetGR);
		var afterUsers = this.userSetHelper.retrieveUserSetCount(newUserSetGR);
		
		return  afterUsers - beforeUsers;
	},
	
	_validateAuditInput: function (newUserSetGR, operation) {
		
		if (JSUtil.nil(newUserSetGR)) {
			GlideLog.error("Skipping User Set Audit Log for because sys_user_set GlideRecord object is null");
			return false;
		}
		
		if (JSUtil.nil(operation)) {
			GlideLog.error("Skipping User Set Audit Log for " + newUserSetGR.name + "because operation is unknown");
			return false;
		}
		
		return true;
	},
	
	_validate: function() {
		if (!GlideTableDescriptor.isValid(this.SYS_USER_AUDIT_LOG)) {
			GlideLog.error("Skipping User Set Audit Log because " + this.SYS_USER_AUDIT_LOG + " does not exist");
			return false;
		}
		
		if (!GlideTableDescriptor.isValid(this.SYS_USER_SET)) {
			GlideLog.error("Skipping User Set Audit Log because " + this.SYS_USER_SET + " does not exist");
			return false;
		}
		
		return true;
	},

    type: 'UserSetAuditHelper'
};