var AutoMapHelper = Class.create();
AutoMapHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	fromXMLString: function() {
		var payload = this.getParameter("sysparm_payload");
		var namespaceAware = (this.getParameter("sysparm_namespaceAware") === "true");
		var resultTag = this.getParameter("sysparm_resultTag");
		var subTag = this.getParameter("sysparm_subTag");
		
		return SNC.AutoMapHelper.fromXMLString(payload, namespaceAware, resultTag, subTag);
	},
	
	fromWSDL: function() {
		var wsdlURL = this.getParameter("sysparm_soap_wsdl");
		var actionName = this.getParameter("sysparm_soap_action_name");
		var wsdlXML = this.getParameter("sysparm_soap_wsdl_xml");
		var username = this.getParameter("sysparm_soap_username");
		var password = this.getParameter("sysparm_soap_password");

		return SNC.AutoMapHelper.fromWSDL(wsdlURL, actionName, wsdlXML, username, password);
	},

    fromSoap: function() {
		var payload = this.getParameter("sysparm_soap_payload");
		return SNC.AutoMapHelper.fromSoapResponse(payload);
	},

	fromRest: function() {
		var payload = this.getParameter("sysparm_rest_payload");
		var contentType = this.getParameter("sysparm_rest_content_type");

		return SNC.AutoMapHelper.fromRestPayload(payload, contentType);
	},

	getActionName: function() {
		var soapFuncSysId = this.getParameter("sysparm_soap_function");
		return SNC.AutoMapHelper.getActionName(soapFuncSysId);
	},
	
	isSQLQuery: function(current) {
		return SNC.AutoMapHelper.isSQLQuery(current);
	},
	
	JDBCOperations: function() {
		return SNC.AutoMapHelper.JDBCOperations();
	},
	
	type: 'AutoMapHelper'
});