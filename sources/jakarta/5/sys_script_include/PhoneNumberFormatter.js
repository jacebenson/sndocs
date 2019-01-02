var PhoneNumberFormatter = Class.create();
PhoneNumberFormatter.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var local = (this.getParameter('sysparm_local') == 'true');
		var strict = (this.getParameter('sysparm_strict') == 'true');		
		var showText = (this.getParameter('sysparm_showText') == 'true');		
		var phoneNumber = this.getParameter('sysparm_phoneNumber'); 
		var gePN = new GlideElementPhoneNumber();
		var valid = gePN.setPhoneNumber(phoneNumber, strict);
		var matchType = gePN.getPartialMatchType()+"";
		var returnValue = null;
		if (valid) {

			if (local)
				returnValue = gePN.getLocalDisplayValue();
			else
				returnValue = gePN.getGlobalDisplayValue();
			
			var country = gePN.getTerritory();
			var optionValue = gePN.getGlobalDialingCode() + ","
				+ gePN.getLocalDialingCode() + ","
				+ gePN.isLocalFollowsGlobal();
		
			return escape(returnValue) + "," + escape(country) + "," + escape(optionValue);
		}	
		var country = gePN.getTerritory();
		if (matchType == 'GLOBAL') // Failed to match global part of phone number
			country = gs.getMessage("Other / Unknown");
			
		return "NO_MATCH" + "," + escape(country) + "," + escape(optionValue);
	},

	type: 'PhoneNumberFormatter'
});

