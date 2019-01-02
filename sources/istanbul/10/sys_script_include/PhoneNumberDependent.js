var PhoneNumberDependent = Class.create();
PhoneNumberDependent.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var dependent = this.getParameter('sysparm_sys_id');
		var gePN = new GlideElementPhoneNumber();
		var userPhoneFormat = gePN.getPhoneFormatForUser(dependent);
		if (userPhoneFormat == null)
			userPhoneFormat = gePN.getPhoneFormatForLocation(dependent);
		if (userPhoneFormat != null) {
			var optionValue = userPhoneFormat.getGlobalDialingCode() + ","
				+ userPhoneFormat.getLocalDialingCode() + ","
				+ userPhoneFormat.isLocalFollowsGlobal();
		
			return escape(userPhoneFormat.getTerritory()) + "," + escape(optionValue);
		}
		return "";
	},

	type: 'PhoneNumberDependent'
});

