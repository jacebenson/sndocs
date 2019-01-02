var UserSubscriptionAuditHelper = Class.create();
UserSubscriptionAuditHelper.prototype = {
    initialize: function() {
		
		this.SYS_USER_LICENSE_AUDIT_LOG = "sys_user_license_audit_log";
		
		this.LICENSE_DETAILS = "license_details";
		this.SYS_USER = "sys_user";
		this.SYS_USER_SET = "sys_user_set";
		this.SYS_USER_LICENSE_SOURCE = "sys_user_license_source";
		
		this.RELATED_TABLES = [this.LICENSE_DETAILS, this.SYS_USER, this.SYS_USER_SET, this.SYS_USER_LICENSE_SOURCE];
		
		this.ADD = "add";
		this.REMOVE = "remove";
		this.EXCLUDE = "exclude";
		this.UNEXCLUDE = "un-exclude";
		
		this.SUBSCRIBED = "subscribed";
		this.UNSUBSCRIBED = "un-subscribed";
		this.EXCLUDED = "excluded";
		this.UNEXCLUDED = "un-excluded";
		
		this.USERS = "users";
		this.DIRECT = "direct";
		this.USERSET = "userset";
		this.MIXED = "mixed";
		
		this.SYS_ID = "sys_id";
		
		this.INITIALIZED = this._validate();
    },	
	
	recordSubscribed: function(userSysId, licSysId) {
		
		if (!this.INITIALIZED)
			return;
		
		var srcDetail = this._getUserSourceDetails(userSysId, licSysId);
		var srcNames = srcDetail.srcList;
		var srcType = srcDetail.srcType;
		this.record(this.ADD, userSysId, licSysId, srcType, srcNames, this.SUBSCRIBED);
	},
	
	recordUnSubscribed: function(userSysId, licSysId) {		
		this.record(this.REMOVE, userSysId, licSysId, "", "", this.UNSUBSCRIBED);
	},
	
	recordExcluded: function(userSysId, licSysId) {
		this.record(this.EXCLUDE, userSysId, licSysId, "", "", this.EXCLUDED);
	},
	
	recordUnExcluded: function(userSysId, licSysId) {
		this.record(this.UNEXCLUDE, userSysId, licSysId, "", "", this.UNEXCLUDED);
	},
	
	
	record: function(operation, userSysId, licSysId, userSourceType, userSourceName, state) {
		
		if (!this.INITIALIZED)
			return;
		
		var opTime = new GlideDateTime().getValue();
		var userName = this._getUserName(userSysId);
		var licName = this._getLicenseName(licSysId);
		
		var gr = new GlideRecord(this.SYS_USER_LICENSE_AUDIT_LOG);
		
		gr.setValue("time_stamp", opTime);
		gr.setValue("user_id", userName);
		gr.setValue("user", userSysId);
		
		gr.setValue("license_name", licName);
		gr.setValue("license", licSysId);
		
		gr.setValue("operation", operation);
		gr.setValue("user_source_type", userSourceType);
		gr.setValue("user_source_name", userSourceName);
		gr.setValue("user_state", state);
		
		var auditRec = gr.insert();
		
		if (JSUtil.nil(auditRec))
			GlideLog.error("User Subscription Audit Log failed for user: " + userName + " and license: " + license);
	},
	
	_getUserName: function(userSysId) {
		var userGR = new GlideRecord(this.SYS_USER);
		userGR.addQuery(this.SYS_ID, userSysId);
		userGR.query();
		
		if (userGR.next())
			return userGR.getValue("user_name");
		
		return "";
	},
	
	_getLicenseName: function(licSysId) {
		var licGR = new GlideRecord(this.LICENSE_DETAILS);
		licGR.addQuery(this.SYS_ID, licSysId);
		licGR.query();
		
		if (licGR.next()) {
			return licGR.getValue("name");
		}
		
		return "";
	},
	
	_getUserSourceDetails: function(userSysId, licSysId) {
		
		var srcDetails = {};
		var srcList = [];
		var userSetName = "";
		var directCount = 0;
		
		var licSrcGR = new GlideRecord(this.SYS_USER_LICENSE_SOURCE);
		licSrcGR.addQuery("user", userSysId);
		licSrcGR.addQuery("license", licSysId);
		
		licSrcGR.query();
		
		while (licSrcGR.next()) {
			
			userSetName = this._getUserSourceName(licSrcGR.getValue("user_set_source"));
			
			if (JSUtil.notNil(userSetName))
				srcList.push(userSetName);
			
			if (licSrcGR.getValue("is_direct") == "1")
				directCount++;
				
		}
		
		srcDetails.srcType = this._determineSrcType(directCount, srcList);
		
		if (srcDetails.srcType == this.DIRECT)
			srcList.push(this.USERS);
		
		srcDetails.srcList = srcList.toString();
		
		return srcDetails;
	},
	
	_determineSrcType: function(directCount, srcList) {
		
		
		if (directCount > 0 && srcList.length > 0)
			return this.MIXED;
		else if (directCount > 0 && srcList.length == 0)
			return this.DIRECT;
		else if (directCount == 0 && srcList.length > 0)
			return this.USERSET;
		else 
			return "";
	},
		
	_getUserSourceName: function(userSetSysId) {
		
		var userSetGR = new GlideRecord(this.SYS_USER_SET);
		
		userSetGR.addQuery(this.SYS_ID, userSetSysId);
		userSetGR.query();
		
		if (userSetGR.next()) 
			return userSetGR.getValue("name");
		
		return "";
		
	},
	
	_validate: function() {
		if (!GlideTableDescriptor.isValid(this.SYS_USER_LICENSE_AUDIT_LOG)) {
			GlideLog.error("Skipping User Subscription Audit Log because " + this.SYS_USER_LICENSE_AUDIT_LOG + " does not exist");
			return false;
		}
			
		
		for (var i=0; i<this.RELATED_TABLES.length ; i++) {
			
			var table = this.RELATED_TABLES[i];
			
			if (!GlideTableDescriptor.isValid(table)) {
				GlideLog.error("Skipping User Subscription Audit Log because " + table + " does not exist");
				return false;
			}
		}
		
		return true;
	},

    type: 'UserSubscriptionAuditHelper'
};