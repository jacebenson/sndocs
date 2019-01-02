var SOAPMessage = Class.create();

SOAPMessage.prototype = {
	/*
 	* constructor.  takes a mandatory argument of the SOAP Message name, and
 	* an optional function name, the SOAP function to be called
 	*/
	initialize : function(name, funcName) {
		this.valid = false;
		//'name' is reserved keyword for Rhino. so using different property to hold information and leaving the old one for backward compatibility
		this.name = this.soapMsgName = name;
		this.props = new Packages.java.util.Properties();
		this.soapEndPoint;
		this.soapRequest;
		this.soapAction;
		this.funcName;
		this.use_basic_auth;
		this.userName;
		this.userPassword;
		this.requestHeaders = new Object();
		this.midServer; // mid server name minus mid.server
		this.use_ecc;
		this.soapEnvelopeTemplate;
		this.soapEnvelope; // has a value when posting through ECC queue
		this.httpStatus;
		this.envelope;
		this.eccParameters = {};
		this.eccCorrelator;
		this.use_ws_security;
		this.key_store_sysid;
		this.key_store_password;
		this.key_store_alias;
		this.certificate_sysid;
		this.strip_whitespace;

		if (funcName) {
			this.funcName = funcName;
		}

		var sgr = new GlideRecord("sys_soap_message");
		sgr.addQuery("name", this.soapMsgName);
		sgr.query();
		if (sgr.next())
			this.valid = true;

		var fgr = new GlideRecord("sys_soap_message_function");
		fgr.addQuery("soap_message", sgr.sys_id);
		fgr.addQuery("function_name", this.funcName);
		fgr.query();
		fgr.next();
		this._initializeDefaults(fgr);
	},

	/**
 	* Initialize default values to the ones in sys_soap_message_function record.
 	*/
	_initializeDefaults : function(funcGR) {
		if (!funcGR)
			return;
		if (this._isAuthProfile(funcGR)) {
			this.valid = false;
			throw "This object does not support the auth profile of this SOAP message function, please use SOAPMessageV2";
		}
		this.soapMsgFuncGR = funcGR;
		this.soapAction = funcGR.soap_action;
		this.soapEndPoint = funcGR.soap_endpoint;
		this.soapEnvelopeTemplate = funcGR.envelope;
		this.strip_whitespace = funcGR.strip_whitespace;
		this.enable_mutual_auth = funcGR.enable_mutual_auth;
		if (funcGR.use_basic_auth) {
			this.use_basic_auth = true;
			this.userName = funcGR.basic_auth_user;
			var Encrypter = new GlideEncrypter();
			this.userPassword = Encrypter.decrypt(funcGR.basic_auth_password);
		}

		if (!funcGR.use_mid_server.nil()) {
			this.use_ecc = true;
			this.midServer = funcGR.use_mid_server.name;
		}

		if (funcGR.use_ws_security == true) {
			this.use_ws_security = true;
			this.key_store_sysid = funcGR.key_store;
			var Encrypter = new GlideEncrypter();
			this.key_store_password = Encrypter.decrypt(funcGR.key_store_password);
			this.key_store_alias = funcGR.key_store_alias;
			this.certificate_sysid = funcGR.certificate;
		}
	},

	/**
 	* set the basic auth credentials
 	*/
	setBasicAuth : function(userName, userPass) {
		this.use_basic_auth = true;
		this.userName = userName;
		this.userPassword = userPass;
	},

	/**
 	* set WSS security info
 	*/
	setWSSecurityInfo : function(keyStoreId, keyStoreAlias, keyStorePassword, certificateId) {
		this.use_ws_security = true;
		this.key_store_sysid = keyStoreId;
		this.key_store_password = keyStorePassword;
		this.key_store_alias = keyStoreAlias;
		this.certificate_sysid = certificateId;
	},

	/**
 	* DEPRECATED - use setStringParameter or setXMLParameter instead
 	*/
	setParameter : function (name, value) {
		this.props.put(name, value);
	},

	/**
 	* set String parameter with escaping of XML reserved characters
 	*/
	setStringParameter : function(name, value) {
		if (value)
			value = Packages.org.apache.commons.lang.StringEscapeUtils.escapeXml(value);

		if (value !== null)
			this.props.put(name, value);
	},

	/**
 	* set XML parameter - for literal XML values, no escaping
 	*/
	setXMLParameter : function (name, value) {
		this.props.put(name, value);
	},

	/**
 	* set the parameter to be passed to the ecc queue record
 	*/
	setEccParameter : function (name, value) {
		this.eccParameters[name] = value;
	},

	/**
 	* set the ecc queue record correlator for filtering in the workflow context
 	*/
	setEccCorrelator : function (correlator) {
		this.eccCorrelator = correlator;
	},

	/**
 	* post the soap message, if the function name is provided, use it
 	*/
	post : function(use_ecc) {
		var response = "error";
		this.httpStatus = null;
		this.use_ecc = use_ecc;

		if (this.envelope == null) {
			this.envelope = GlideStringUtil.substituteVariables(
			this.soapEnvelopeTemplate, this.props);
		}

        if (JSUtil.notNil(this.midServer)) {
			this.soapRequest = new SOAPRequest(this.soapEndPoint, this.userName, this.userPassword);
		}else
			this.soapRequest = new SOAPRequest(this._getModifiedURL(this.soapEndPoint), this.userName, this.userPassword);

		for (key in this.requestHeaders) {
			this.soapRequest.setRequestHeader(key, this.requestHeaders[key]);
		}

		if (this.strip_whitespace == true) {
			this.envelope = this.stripWhiteSpace(this.envelope);
		}

		if (this.use_ws_security == true) {
			this.envelope = this.signEnvelope(this.envelope);
		}

        if (this.use_ecc || this.midServer) {
			this.soapEnvelope = new SOAPEnvelope();
			this.soapEnvelope.parse(this.envelope);
			this.soapEnvelope.setParameters(this.eccParameters);
			this.soapEnvelope.setCorrelator(this.eccCorrelator);
			this.soapRequest.setMIDServer(this.midServer);
			this.soapRequest.setSoapAction(this.soapAction);
			this.soapEnvelope.setHttpHeaders(this.requestHeaders);
			this.soapRequest.post(this.soapEnvelope, true);
			this.getHttpStatus();
			response = this.soapEnvelope.getResponse();
		} else {
			response = this.soapRequest.postString(this.envelope, this.soapAction);
			this.httpStatus = this.soapRequest.getHttpStatus();
		}

		return response;
	},

	/**
 	* in async mode, e.g. going to MID server, get the response after waitMS
 	* milliseconds
 	*/
	getResponse : function(waitMS) {
		if (waitMS) {
			Packages.java.lang.Thread.sleep(waitMS);
		}

		return this.soapEnvelope.getResponse();
	},

	/**
 	* get the HTTP status
 	*/
	getHttpStatus : function() {
		if (this.midServer || this.use_ecc) {
			this.httpStatus = this.soapEnvelope.getHttpStatus();
		} else {
			this.httpStatus = this.soapRequest.getHttpStatus();
		}

		return this.httpStatus;
	},

	getHttpHeaders : function() {
		if (this.midServer || this.use_ecc)
			return this.soapEnvelope.getHttpHeaders();

		return this.soapRequest.getHttpHeaders();
	},

	getHttpHeader : function(name) {
		return this.getHttpHeaders()[name];
	},

	/**
 	* get the request envelope as a string
 	*/
	getRequestEnvelope : function() {
		return this.envelope;
	},


	/**
 	* set the request envelope as a string
 	*/
	setRequestEnvelope : function(str) {
		this.envelope = str;
	},

	/**
 	* set the SOAP message to go through the MID server
 	*/
	setMIDServer : function (name) {
		if(name)
			this.midServer = name;
	},

	/**
 	* strip all whitespace form SOAP envelope XML
 	*/
	stripWhiteSpace : function (envelope) {
		var eDoc = GlideXMLUtil.parse(envelope);
		GlideXMLUtil.stripWhiteSpace(eDoc.getDocumentElement());
		return GlideXMLUtil.toString(eDoc);
	},

	/**
 	* sign the SOAP message
 	*/
	signEnvelope : function (envelope) {
		var dbks = new DBKeyStore();
		dbks.loadBySysId(this.key_store_sysid);
		dbks.listAliases();
		var Encrypter = new GlideEncrypter();
		var keyPEM = dbks.getKeyPEM(this.key_store_alias, this.key_store_password);

		var gr = new GlideRecord("sys_certificate");
		gr.addQuery("sys_id", this.certificate_sysid);
		gr.query();
		gr.next();
		var certPEM = gr.pem_certificate;

		var ss = new GlideSOAPSigner(keyPEM, certPEM);
		return ss.sign(GlideXMLUtil.parse(envelope));
	},

	setRequestHeader: function(headerName, headerValue) {
		this.requestHeaders[headerName] = headerValue;
	},

	getResponseHeaderValue: function(headerName) {
		return this.soapRequest.getResponseHeaderValue(headerName);
	},

	/**
 	* Allows the SOAP Endpoint defined in the SOAP Message to be overridden
 	*/
	setSoapEndPoint: function(soapEndPoint) {
		this.soapEndPoint = this.modifiedSoapEndPoint = (soapEndPoint != "") ? soapEndPoint : null;
	},

	isValid : function () {
		return this.valid;
	},

	_getModifiedURL : function(url) {
		var modifiedUrl = url;
		if (this.enable_mutual_auth) {
			var mAuthProtocol = '' + this.soapMsgFuncGR.getDisplayValue('protocol_profile');
			if (!JSUtil.nil(url) && !JSUtil.nil(mAuthProtocol)) {
				var currentProtocolIndex= url.indexOf('://');
				if(currentProtocolIndex <= 0)
					mAuthProtocol += '://';
				modifiedUrl = url.replace(url.substring(0, currentProtocolIndex), mAuthProtocol);
			}
		}
		return modifiedUrl;
	},

	_isAuthProfile : function(funcGR) {
		if (JSUtil.nil(funcGR.authentication_type))
			return false;
		if (funcGR.authentication_type == 'basic_simple')
			return false;
		return true;
	}
}
