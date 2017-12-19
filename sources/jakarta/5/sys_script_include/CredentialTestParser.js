var CredentialTestParser = Class.create();

CredentialTestParser.prototype = {
    initialize: function(payload) {
		if (JSUtil.nil(payload))
			return;

		this.payload = payload;		
		this._parseResult();
    },

	getResult: function() {
		return this.result;
	},

	matchError: function(error) {
		if (error.substring(0, 17) == "CommandPipeline: ")
			error = error.substring(17);

		var genericAuthFailure = /(.*no valid credential found.*)/i;
		var awsAuthFailure = /(.*invalid username\/password combo.*)/i;
		var tcpPortFailure = /(.*failed to connect tcp.*)/i;
		var timeoutFailure = /(.*timed out while waiting.*)/i;
		var credTypeFailure = /(.*credential type: .* is not supported.*)/i;
		var invalidTarget = /(.*UnknownException.*|.*Catastrophic failure.*)/i;

		var msg = "";

		if (error.match(genericAuthFailure) || error.match(awsAuthFailure))
			msg = "Authentication failed";

		else if (error.match(tcpPortFailure))
			msg = "Could not connect to specified port";

		else if (error.match(timeoutFailure))
			msg = "Timed out trying to reach target";

		else if (error.match(credTypeFailure))
			msg = "This credential type cannot be tested";

		else if (error.match(invalidTarget))
			msg = "Invalid target specified";

		else
			msg = error;

		return "error:" + msg;
	},

	_parseResult: function() {
		var XMLUtil = GlideXMLUtil;
		var g_doc = XMLUtil.parse(this.payload);

		var parent = g_doc.getDocumentElement();

		// If no error attribute, it was successful
		var error = XMLUtil.getAttribute(parent, "error");

		this.result = JSUtil.nil(error) ? "success" : this.matchError(error);
	},

    type: 'CredentialTestParser'
};