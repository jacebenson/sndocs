var InstanceCloneValidatorAjax = Class.create();
InstanceCloneValidatorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	/**
	* @param : sysparm_clone_sys_id -  SysID - String
	* @return : String
	**/
	executeValidationRules : function() {
	
		var cloneHistorySysId = this.getParameter('sysparm_clone_sys_id');
		if (gs.nil(cloneHistorySysId))
			return ;
		
		var response = {};
		var cloneGr = new GlideRecord("clone_instance");
		if (!cloneGr.get(cloneHistorySysId)) 
			return ;
			
		var validationRules = cloneGr.getValue('clone_request_validation_rules');
		if (gs.nil(validationRules))
			return ;
				
		validationRules = new JSON().decode(validationRules);
		if (!gs.nil(validationRules.preflightCheck)) {
			var preflightChecksResponse =
				this.executePreflightChecks(validationRules.preflightCheck);
			if (!gs.nil(preflightChecksResponse)) 
				response = preflightChecksResponse;
				
		}

		var encodedResponseString = new JSON().encode(response);
        return encodedResponseString;
        	
	},
	
	/**
	* @arg : preflightCheckObj -  JSON Object
	* @return : response - JSON Object
	**/
	
	executePreflightChecks : function(preflightCheckObj) {
		var response = {};
		if (gs.nil(preflightCheckObj.exclusionTablesBlacklistRules))
			return;
		
		var exclusionTablesBlacklistRules =
			preflightCheckObj.exclusionTablesBlacklistRules;
		if (gs.nil(exclusionTablesBlacklistRules.tables))
			return;
		
		var excludeTablesBlackList = exclusionTablesBlacklistRules.tables;
		var excludeListGr = new GlideRecord("clone_data_exclude");
		excludeListGr.addQuery('name', 'IN', excludeTablesBlackList);
		excludeListGr.query();
		if (excludeListGr.next()) {
			response.type = exclusionTablesBlacklistRules.type;
			response.message = exclusionTablesBlacklistRules.message;
		}
		return response; 
		
	},

    type: 'InstanceCloneValidatorAjax'
});