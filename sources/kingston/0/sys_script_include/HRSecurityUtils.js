var HRSecurityUtils = Class.create();

HRSecurityUtils.prototype = {

	initialize : function(request, responseXML, gc) {
		
	},
		
	processOrderGuide : function(orderGuide, variables) {
		var sog = new SNC.ScriptableOrderGuide(String(orderGuide.sys_id));
		var result = sog.process(new JSON().encode(variables));
		if (!result)
			gs.error("Processing the scriptable order guide failed with message: " + sog.getMessage()); 
		else
			return sog.getRequest();
	},
	
	createNewUserCriteria : function(sys_id, name){
		var newUserCriteria = new GlideRecord('user_criteria');
		newUserCriteria.initialize();
		newUserCriteria.name = name;
		newUserCriteria.active = 'true';
		newUserCriteria.advanced = 'true';
		newUserCriteria.script = 'new sn_hr_core.hr_Criteria().evaluateById("' + sys_id + '");';
		if(newUserCriteria.canCreate())
		    return newUserCriteria.insert();
		else
			return "";
	},
			
	orderCatalogItem: function(catalogItem, variables) {
		var cart = new Cart();
		var item = cart.addItem(catalogItem);
		for (var question in variables)
			cart.setVariable(item, question, variables[question]);
		
		var rc = cart.placeOrder();
		if (rc)
			return rc;
		else
			gs.error("Unable to order Catalog item " + catalogItem);
	},
	
	removeSysAttachmentRecords : function(tableName, tableSysId){
		var sysAttachment = new GlideSysAttachment();
		var attachmentGR = sysAttachment.getAttachments(tableName, tableSysId);
		while(attachmentGR.next()) 
				attachmentGR.deleteRecord();
	},
	
	removeSysAttachmentsBySysId : function(attachmentSysId){
		var sysAttachment = new GlideSysAttachment();
		sysAttachment.deleteAttachment(attachmentSysId);
	},
	
	generatePassword : function(){
		var pwdGenerationUtil = new PwdDefaultAutoGenPassword();
		var pwd = pwdGenerationUtil.generatePassword("");
		return pwd;
	},
	
	evaluateMailScripts : function(emailText) {
		return GlideEmailFormatter().evaluateTemplateScript(emailText);
	},
	
	authenticationSuccess : function(task_id, table_name, doc_revision_id) {
		new sn_hr_core.hr_Login_Authenticator().success(task_id, table_name, doc_revision_id);
	},
	
	escapeHTML : function(text) {
		return new GlideStringUtil().escapeHTML(text);
	},
	
	type: 'HRSecurityUtils'
};