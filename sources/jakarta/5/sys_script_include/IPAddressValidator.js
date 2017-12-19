var IPAddressValidator = Class.create();
IPAddressValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	ajaxFunction_validate: function() {
		var ip = this.getParameter('sysparm_ip');

		return (SncIPAddressV4.get(ip) || SncIPAddressV6.get(ip));
	},

    type: 'IPAddressValidator'
});