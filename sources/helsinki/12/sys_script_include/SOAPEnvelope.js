var SOAPEnvelope = Class.create();

/**
 * SOAPEnvelope class.  Create a SOAP envelope document that can be used
 * by SOAPRequest
 */
SOAPEnvelope.prototype = {
	/**
 	* constructor takes a body element name and XML namespace for the body element
 	*/
	initialize: function(bodyElementName, xmlns) {
		this.document = new GlideSOAPDocument();
		
		// default name spaces
		this.document.setAttribute("xmlns:xsd","http://www.w3.org/2001/XMLSchema");
		this.document.setAttribute("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance");
		this.document.setAttribute("xmlns:SOAP-ENC","http://schemas.xmlsoap.org/soap/encoding/");
		this.document.setAttribute("xmlns:SOAP-ENV","http://schemas.xmlsoap.org/soap/envelope/");
		this.document.setAttribute("SOAP-ENV:encodingStyle","http://schemas.xmlsoap.org/soap/encoding/");
		
		this.header;
		this.body;
		this.bodyElementName;
		this.funktion;
		this.functionName;
		this.midServer;
		this.response_payload;
		this.service_parameters;
		this.service_correlator;
		this.httpHeaderMap = {};
		this.reqHttpHeaderMap = {};
		
		if (bodyElementName) {
			this.bodyElementName = bodyElementName;
			this.body = this.createBodyElement(bodyElementName);
			
			if (xmlns)
				this.setAttribute(this.body, "xmlns", xmlns);
		}
		
		this.outputq;
		this.responsePayload;
	},
	
	/**
 	* create an additional name space forthe document element
 	*/
	createNameSpace: function(name, value) {
		this.document.setAttribute(name, value);
	},
	
	/**
 	* create a header element
 	*/
	createHeaderElement: function(name, value, attrName, attrValue) {
		if (!this.header) {
			this.document.setCurrent(this.document.getDocumentElement());
			this.header = this.document.createElement("SOAP-ENV:Header");
		}
		
		this.document.setCurrent(this.header);
		
		var el;
		
		if (value)
			el = this.document.createElement(name, value);
		else
			el = this.document.createElement(name);
		
		if (attrName)
			el.setAttribute(attrName, attrValue);
		
		return el;
	},
	
	/**
 	* create an element in the body element
 	*/
	createBodyElement: function(name, value, attrName, attrValue) {
		if (!this.body) {
			this.document.setCurrent(this.document.getDocumentElement());
			this.body = this.document.createElement("SOAP-ENV:Body");
		}
		
		this.document.setCurrent(this.body);
		
		var el;
		
		if (value)
			el = this.document.createElement(name, value);
		else
			el = this.document.createElement(name);
		
		if (attrName)
			el.setAttribute(attrName, attrValue);
		
		return el;
	},
	
	/**
 	* set a function name, when using this, assumes that its an RPC style
 	* SOAP envelope, and that there is 1 function name
 	*/
	setFunctionName: function(name, namespace) {
		this.functionName = name;
		
		if (!this.body) {
			this.document.setCurrent(this.document.getDocumentElement());
			this.body = this.document.createElement("SOAP-ENV:Body");
		}
		
		this.funktion = this.createElement(this.body, name);
		
		if (namespace) {
			this.funktion.setAttribute("xmlns", namespace);
		}
	},
	
	/**
 	* add a parameter for the function, must call setFunctionName first
 	* all function parameters are assumed to be xsi:string type
 	*/
	addFunctionParameter: function(name, value, xsiType) {
		var el = this.createElement(this.funktion, name, value);
		
		if (xsiType) {
			this.setAttribute(el, "xsi:type", xsiType);
		} else {
			// default to string
			this.setAttribute(el, "xsi:type", "xsd:string");
		}
		
		return el;
	},
	
	/**
 	* set an attribute for an element
 	*/
	setAttribute: function(el, name, value) {
		this.document.setCurrent(el);
		this.document.setAttribute(name, value);
	},
	
	/**
 	* create an element for a parent element
 	*/
	createElement: function(parent, name, value) {
		this.document.setCurrent(parent);
		
		if (value)
			return this.document.createElement(name, value);
		else
			return this.document.createElement(name);
	},
	
	/**
 	* set the body element, allows a body element to be created externally
 	* and imported into the body element
 	*/
	setBody: function(el) {
		if (!this.body) {
			this.document.setCurrent(this.document.getDocumentElement());
			this.body = this.document.createElement("SOAP-ENV:Body");
		}
		
		this.document.setCurrent(this.body);
		
		this.document.importElementToParent(el, this.body);
	},
	
	/**
 	* set parameters that need to go into the ecc queue record
 	*/
	setParameters: function(parameters) {
		this.service_parameters = parameters;
	},
	
	/**
 	* set the correlator used for filtering ecc queue records in the workflow context
 	*/
	setCorrelator: function(correlator) {
		this.service_correlator = correlator;
	},
	
	/**
 	* parse the SOAP envelope from a string
 	*/
	parse : function (envelope_xml) {
		this.document.parse(envelope_xml);
	},
	
	/**
 	* invoke the web service, by inserting into the ECC queue and triggering
 	* the SOAPClient business rule
 	*/
	invokeService: function(endpoint, functionName, credentials) {
		this.httpStatus = null;
		this.response_payload = null;
		
		var eccgr = new GlideRecord("ecc_queue");
		eccgr.initialize();
		
		if (this.midServer) {
			eccgr.agent = "mid.server." + this.midServer;
			eccgr.topic = "SOAPProbe";
			eccgr.name = functionName;
			eccgr.source = endpoint;
			eccgr.payload = this._getSOAPProbePayload(credentials);
		} else {
			eccgr.agent = "SOAPClient";
			eccgr.topic = endpoint;
			eccgr.name = functionName;
			eccgr.source = credentials;
			eccgr.payload = this.toString();
		}
		
		if (this.service_correlator)
			eccgr.agent_correlator = this.service_correlator;
		
		eccgr.queue = "output";
		eccgr.state = "ready";
		this.outputq = eccgr.insert();
		// this.outputq is used in this.getResponse()
		
		return this.getResponse();
	},
	
	_getSOAPProbePayload : function(credentials) {
		var doc;
		if (this.document.wantSigned()) {
			doc = this.document.getSignedDocument();
		} else {
			doc = this.document.getDocument();
		}
		
		var pstr = GlideXMLUtil.toString(doc.getDocumentElement(), true);
		
		var p = "<parameters>"
		p += "<output>" + pstr + "</output>";
		p += this._addCredentials(credentials);
		if (this.service_parameters)
			for (var name in this.service_parameters)
			p += "<parameter name=\"" + name + "\" value=\"" + this.service_parameters[name] + "\"/>";
		p += this._getHttpHeadersString();
		p += "</parameters>";
		return p;
	},
	
	_getHttpHeadersString:function(){
		var headersString = '<httpHeaders>';
		if(this.reqHttpHeaderMap){
			for(var name in this.reqHttpHeaderMap){
				headersString += "<httpHeader "+ name + "="+"\'" + this.reqHttpHeaderMap[name] + "\'/>";
			}
		}
		headersString+='</httpHeaders>';
		return headersString;
	},
	
	setHttpHeaders:function(a_http_headers){
		this.reqHttpHeaderMap= a_http_headers;
	},
	
	_addCredentials : function(credentials) {
		if (!credentials) {
			return "";
		}
		
		var e = new GlideEncrypter();
		var cred = e.decrypt(credentials);
		if (cred.indexOf(":") <= 0) {
			return "";
		}
		
		var uname = cred.split(":")[0];
		var pass = cred .split(":")[1];
		
		var p = "<parameter name='soap_username' value='" + uname + "'/>";
		p += "<parameter name='soap_password' value='enc:" + e.encrypt(pass) + "'/>";
		return p;
	},
	
	/**
 	* tell the SOAP message to use a designated MID server to invoke the
 	* service by proxy
 	*/
	setMIDServer : function(name) {
		this.midServer = name;
	},
	
	/**
 	* get a value from the response, by filtering using an XPATH
 	*/
	getResponse: function(xpath) {
		// this method can be called multiple times, don't re-query the ecc_queue if we already got the response payload
		if (this.response_payload != null) {
			return this.response_payload;
		}
		this.response_payload = this._getResponsePayload();
		if (this.response_payload == null) {
			return null;
		}
		
		if (this.midServer) {
			xpath = "/results/result/output";
		}
		
		if(xpath) {
			return gs.getXMLText(this.response_payload, xpath);
		}
		
		return this.response_payload;
	},
	
	/**
 	* get the HTTP status from the ecc queue payload
 	*/
	getHttpStatus : function() {
		if (this.response_payload == null) {
			this.response_payload = this._getResponsePayload();
			if (this.response_payload == null) {
				return this.httpStatus; // set by _getResponsePayload()
			}
		}
		
		if (this.midServer) {
			return gs.getXMLText(this.response_payload, "//parameters/parameter[@name=\"http_status_code\"]/@value");
		}
		
		return this.httpStatus;
	},
	
	//Method to get the http headers
	getHttpHeaders : function() {
		if (this.response_payload == null) {
			this.response_payload = this._getResponsePayload();
		}
		return this.httpHeaderMap;
	},
	
	//get http header by name
	getHttpHeader : function(name) {
		return getHttpHeaders()[name];
	},
	
	_getHttpStatusFromEccErrorString: function(errorString) {
		if (errorString.indexOf('HTTP status code ') != -1)
			return errorString.substr('HTTP status code '.length);
		else
			return null;
	},
	
	_getResponsePayload : function() {
		var ieccgr = new GlideRecord("ecc_queue");
		ieccgr.addQuery("response_to", this.outputq);
		ieccgr.query();
		if (ieccgr.next()) {
			if (ieccgr.state == 'error')
				this.httpStatus = this._getHttpStatusFromEccErrorString(ieccgr.error_string);
			else
				this.httpStatus = '200';
			
			var response_payload = ieccgr.payload.toString();
			if(response_payload == '<see_attachment/>'){
				var sa = new GlideSysAttachment();
				response_payload = sa.get(ieccgr, 'payload');
			}

			this._getHttpHeaders(response_payload)
			
			return response_payload;
		}
	},
	
	//parse the response payload, find the HTTP headers and store them in the local hashmap
	_getHttpHeaders : function(response_payload){
		if (response_payload != null) {
			var xml = new XMLHelper();
			var record = xml.toObject('' + response_payload);
			var headers = record.httpHeaders.httpHeader;
			if (record.httpHeaders) {
				for (var i = 0; i < headers.length; i++) {
					this.httpHeaderMap[headers[i]['@name']] = headers[i]['@value'];
				}
			}
		}
	},
	
	/**
 	* get the body element
 	*/
	getBody: function() {
		return this.body;
	},
	
	/**
 	* set the signing elements for the SOAP envelope
 	*/
	setSignatureKeys: function(privateKey, certificateKey) {
		this.document.setSignerKey(privateKey);
		this.document.setSignerCertificate(certificateKey);
	},
	
	/**
 	* get the SOAP envelope as a string
 	*/
	toString: function() {
		return new String(this.document.toString());
	}
};
