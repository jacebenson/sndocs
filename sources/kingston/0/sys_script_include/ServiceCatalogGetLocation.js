var ServiceCatalogGetLocation = Class.create();
ServiceCatalogGetLocation.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	_fetchAddressfromUserTable: function (sysId) {

		var address = '';

		var gr = new GlideRecord('sys_user');

		if(gr.get(sysId)) {

			if (gr.street != '' && gr.street != null)
				address = gr.street + '\n';

			if (gr.city != '' && gr.city != null)
				address += gr.city + ',';

			if (gr.state != '' && gr.state != null)
				address += gr.state + ", ";

			if (gr.zip != '' && gr.zip != null)
				address += gr.zip;

			if (gr.country != null && gr.country != '') {
				address += '\n';
				address += gr.getDisplayValue('country');
			}

		}
		return address;
	},

	_fetchAddressfromCMNLocation: function(sysId) {

		var locationAddress = '';
		var location = new GlideRecord('cmn_location');

		if(location.get(sysId)) {

			if (location.street != null && location.street != '')
				locationAddress += location.street + ", \n";

			if (location.city != null && location.city != '')
				locationAddress += location.city + ", ";

			if (location.state != null && location.state != '')
				locationAddress += location.state + ",";

			if (location.zip != null && location.zip != '')
				locationAddress += location.zip;

			if (locationAddress.length > 0)
				locationAddress += '\n';

			if (location.country != null && location.country != '')
				locationAddress += location.country;

		}
		return locationAddress;
	},

	_getAddress: function(userSysId) {

		var useCmnLocation = gs.getProperty('glide.sc.prioritise.user.location');
		var gr = new GlideRecord('sys_user');

		if(gr.get(userSysId)) {

			var locId = gr.location;
			if (useCmnLocation === 'true' && (locId != null && locId != '' ))
				return this._fetchAddressfromCMNLocation(locId);

			if (gr.street != null && gr.street != '')
				return this._fetchAddressfromUserTable(userSysId);

			if (useCmnLocation === 'false' && (locId != null && locId != ''))
				return this._fetchAddressfromCMNLocation(locId);

		}
		return null;
	},

	retrieveAddress: function() {

		var userShippingAddress = '';
		var userSysId = this.getParameter('sysparm_sysId');
		if (userSysId == '' || userSysId == null)
			return userShippingAddress;
		userShippingAddress = sn_sc.CartJS.getRequestedForAddress(userSysId);
		return userShippingAddress;
	},
	type: 'ServiceCatalogGetLocation'
});