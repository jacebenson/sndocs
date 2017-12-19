var RESTMessage = Class.create();

RESTMessage.prototype = {
    /*
     * constructor.  takes a mandatory argument of the REST Message name, and
     * the REST function (verb) to be called
     */
    initialize: function(name, funcName) {
        this.valid = false;
        //'name' is reserved keyword for Rhino. so using different property to hold information and leaving the old one for backward compatibility
        this.name = this.restMsgName = name;
        this.props = new Packages.java.util.Properties();
        this.funcName;
		this.useBasicAuth = false;
        this.userName;
        this.userPassword;
        this.midServer; // mid server name minus mid.server
        this.use_ecc;
        this.eccResponse;
        this.httpStatus;
        this.eccParameters = {};
        this.eccCorrelator;
        this.endpoint;
		this.useMutualAuth;
		this.protocolName;
		this.adjustedEndpoint;
		this.setTopic('RESTProbe');

        if (funcName)
            this.funcName = funcName;

        var rgr = new GlideRecord('sys_rest_message');
        rgr.addQuery('name', this.restMsgName);
        rgr.query();
        if (rgr.next()) {
            this.valid = true;
            this.restMessageGR = rgr;
        }
    },

    /**
     * send the message to the endpoint
     */
    execute: function () {
        var httpResponse = null;
        var response = 'error';
        this.httpStatus = null;

        this.functionGr = new GlideRecord('sys_rest_message_fn');
        this.functionGr.addQuery('rest_message', this.restMessageGR.sys_id);
        this.functionGr.addQuery('function_name', this.funcName);
        this.functionGr.query();

        if (this.functionGr.next()) {
			if (this._isAuthProfile(this.functionGr)) {
				this.valid = false;
				throw "This object does not support the auth profile of this REST message function, please use RESTMessageV2";
			}
            this._handleEndpoint();

            var headers = this._handleHeaders();
            var params = this._handleParameters();

            if (!this.functionGr.use_mid_server.nil()) {
                this.use_ecc = true;
                if (!this.midServer)
                    this.midServer = this.functionGr.use_mid_server.name;
            }

			var creds = this._handleBasicAuth();
            if (this.use_ecc) {
                // Build ECC queue payload
                var payload = new GlideXMLDocument('parameters');
                this._addParameterToPayload(payload, 'message_headers', this._getMessageFields(headers));
                this._addParameterToPayload(payload, 'message_parameters', this._getMessageFields(params));

                for (var name in this.eccParameters)
                    this._addParameterToPayload(payload, name, this.eccParameters[name]);

				if (this.useBasicAuth) {
                    if (creds) {
                        var encrypter = new GlideEncrypter();
                        this._addParameterToPayload(payload, 'rest_user', creds.user);
                        this._addParameterToPayload(payload, 'rest_password', 'enc:' + encrypter.reencryptForAutomation(creds.password));
                    }
                }
                // if the function takes content
                if (this.funcName == 'post' || this.funcName == 'put')
                    this._addParameterToPayload(payload, 'content', this._handleContent());
                this._createECCQueueEntry(payload.toString());
            } else {
				this._handleMutualAuth();
				this._adjustEndpoint();
				
                var httpRequest = new GlideHTTPRequest(this.adjustedEndpoint);

				if (this.useBasicAuth) {					
                    if (creds) {
                        var Encrypter = new GlideEncrypter();
                        var userpassword = Encrypter.decrypt(creds.password);
                        httpRequest.setBasicAuth(creds.user, userpassword);
                    }
                }

                // Pass the headers through
                for (var h = 0; h < headers.length; h++)
                    httpRequest.addHeader(headers[h].name, headers[h].value);

                // Pass the parameters through
                for (var i = 0; i < params.length; i++)
                    httpRequest.addParameter(params[i].name, params[i].value);

                if (this.funcName == 'get')
                    httpResponse = this._handleGetRequest(httpRequest);
                else if (this.funcName == 'post')
                    httpResponse = this._handlePostRequest(httpRequest, this._handleContent());
                else if (this.funcName == 'put')
                    httpResponse = this._handlePutRequest(httpRequest, this._handleContent());
                else if (this.funcName == 'delete')
                    httpResponse = this._handleDeleteRequest(httpRequest);
            }
        }

        return httpResponse;
    },

    /**
     * set the basic auth credentials, but only if it looks like if we actually got a username
     */
    setBasicAuth : function(userName, userPass) {
		if (gs.nil(userName))
			return;
		
		var encrypter = new GlideEncrypter();
		this.useBasicAuth = true;
        this.userName = userName;
        this.userPassword = encrypter.encrypt(userPass);
    },	
	
    getEndpoint: function() {
        return this.endPoint;
    },

    getResponse: function (waitMS) {
        if (waitMS)
            Packages.java.lang.Thread.sleep(waitMS);

        // this method can be called multiple times, don't re-query the ecc_queue if we already got the response payload
        if (this.eccResponse != null)
            return this.eccResponse;
        this.eccResponse = this._getEccResponse();
        return this.eccResponse;
    },

    setEccCorrelator: function (correlator) {
        this.eccCorrelator = correlator;
    },

    /**
     * set the parameter to be passed to the ecc queue record
     */
    setEccParameter: function (name, value) {
        this.eccParameters[name] = value;
    },

    setMIDServer: function(midServer) {
        this.use_ecc = true;
        this.midServer = midServer;
    },

    setRestEndPoint: function(endpoint) {
        this.endPoint = endpoint;
    },

    /**
     * set String parameter with escaping of XML reserved characters
     */
    setStringParameter: function (name, value) {
        if (value)
            value = Packages.org.apache.commons.lang.StringEscapeUtils.escapeXml(value);

        this.props.put(name, value);
    },

    /**
     * set XML parameter - for literal XML values, no escaping
     */
    setXMLParameter: function (name, value) {
        this.props.put(name, value);
    },
	
	getAdjustedEndpoint: function() {
		return this.adjustedEndpoint;
	},
	
	setTopic: function(topic) {
		this.topic = topic;
	},

    /**
     * adds a parameter to the payload, which is expected to be an XMLDocument object
     */
    _addParameterToPayload: function (payload, name, value) {
        var element = payload.createElement('parameter');
        element.setAttribute('name', name);
        element.setAttribute('value', value);
    },

    /**
     * Create ECC queue entry to launch RESTProbe
     */
    _createECCQueueEntry: function (payload) {
        var eccgr = new GlideRecord('ecc_queue');
        eccgr.initialize();
        eccgr.agent = 'mid.server.' + this.midServer;
        eccgr.topic = this.topic;
        eccgr.name = this.funcName;
        eccgr.source = this.endPoint;
        eccgr.payload = payload;
        eccgr.queue = 'output';
        eccgr.state = 'ready';
        if (this.eccCorrelator)
            eccgr.agent_correlator = this.eccCorrelator;
        this.outputq = eccgr.insert();
    },

    /**
     * Get name-value pairs as an XML doc for transmission
     */
    _getMessageFields: function (fields) {
        var d = new GlideXMLDocument('fields');

        for (var i = 0; i < fields.length; i++) {
            var el = d.createElement('field');

            el.setAttribute('name', fields[i].name);
            el.setAttribute('value', fields[i].value);
        }

        return '' + d.toString();
    },

    _getEccResponse: function() {
        var eccResponse = null;
        var ieccgr = new GlideRecord('ecc_queue');
        ieccgr.addQuery('response_to', this.outputq);
        ieccgr.query();
        if (ieccgr.next()) {
            eccResponse = new RESTECCResponse(ieccgr);
            eccResponse.setEndpoint(this.endPoint);
        }
        
        return eccResponse;
    },

    _handleBasicAuth: function() {
		// If already set in script, use that instead of what's defined on the REST message record
		if (!gs.nil(this.userName))
			return {'user' : this.userName, 'password' : this.userPassword};
		
		if (this.functionGr.use_basic_auth) {
			this.useBasicAuth = true;
			
			var username = '' + this.functionGr.basic_auth_user;
			var pw = '';
	
			// if use basic auth is checked but there is no user specified, use the settings from the main message
			if (JSUtil.nil(username)) {
				if (this.restMessageGR.use_basic_auth) {
					username = '' + this.restMessageGR.basic_auth_user;
					pw = '' + this.restMessageGR.basic_auth_password;
				} else
					username = '';
			} else
				pw = '' + this.functionGr.basic_auth_password;
	
			if (!JSUtil.nil(username)) {
				var creds = {};
				creds.user = username;
				creds.password = pw;
				return creds;
			}
		}

        return null;
    },

    _handleContent: function() {
        var content = '' + this.functionGr.content;
        if (this._shouldSubstitute(content))
            content = this._substituteVariable(content, this.props);
        return content;    
    },

    _handleDeleteRequest: function(httpRequest) {
        var response;

        try {
            response = this._handleHttpRequest(httpRequest, httpRequest.del(), null);
        } catch (ex) {
            response = this._handleError(ex.getMessage());
        }

        return response;
    },

    _handleEccRequest: function(eccResponse) {
        var httpResponse = new RESTResponse(eccResponse);
        httpResponse.setEndpoint(this.endPoint);
        return httpResponse;
    },

    _handleEndpoint: function() {
        if (gs.nil(this.endPoint)) {
            var endPoint = '' + this.functionGr.rest_endpoint;
            if (JSUtil.nil(endPoint))
                endPoint = '' + this.restMessageGR.rest_endpoint;
            this.endPoint = endPoint;
        }

        if (this._shouldSubstitute(this.endPoint))
            this.endPoint = this._substituteVariable(this.endPoint, this.props);
		
		this.adjustedEndpoint = '' + this.endPoint;
    },

    _handleError: function(error) {
        var response = new RESTResponse(null);
        response.setError(error);
        return response;
    },

    _handleGetRequest: function(httpRequest) {
        var response;

        try {
            response = this._handleHttpRequest(httpRequest, httpRequest.get(), null);
        } catch (ex) {
            response = this._handleError(ex.getMessage());
        }

        return response;
    },

    _handleHeaders: function() {
        var headers = {};
        var headersToReturn = [];

        // Grab all the headers from the main message body first, then the function and replace any duplicates with the one
        // from the function because it takes precedent by being more specific
        var hgr = new GlideRecord('sys_rest_message_headers');
        hgr.addQuery('rest_message', this.restMessageGR.sys_id);
        hgr.query();
            
        while (hgr.next())
            headers['' + hgr.name] = '' + hgr.value;

        hgr = new GlideRecord('sys_rest_message_fn_headers');
        hgr.addQuery('rest_message_function', '' + this.functionGr.sys_id);
        hgr.query();

        while (hgr.next())
            headers['' + hgr.name] = '' + hgr.value;

        for (var key in headers) {
            var value = headers[key];
            if (this._shouldSubstitute(value))
                value = this._substituteVariable(value, this.props);
            var header = {};
            header.name = key;
            header.value = value;
            headersToReturn.push(header);
        }

        return headersToReturn;
    },

    _handleHttpRequest: function(httpRequest, responseObj, content) {
        var httpResponse = new RESTResponse(responseObj);

        var response = httpResponse.getHttpMethod(); 
        httpResponse.setEndpoint(this.endPoint);
        var parameters = response ? response.getQueryString() : '';
        httpResponse.setParameters(parameters);
        if (!gs.nil(content))
            httpResponse.setContent(content);
        if (!response)
            httpResponse.setError(httpRequest.getErrorMessage());

        return httpResponse;
    },

    _handleParameters: function() {
        var params = [];
        var pgr = new GlideRecord('sys_rest_message_fn_param_defs');
        pgr.addQuery('rest_message_function', '' + this.functionGr.sys_id);
        pgr.orderBy('order');
        pgr.query();

        while (pgr.next()) {
            var value = '' + pgr.value;
            if (this._shouldSubstitute(value))
                value = this._substituteVariable(value, this.props);
            var param = {};
            param.name = '' + pgr.name;
            param.value = '' + GlideStringUtil.urlEncode(value);
            params.push(param);
            //params['' + pgr.name] = value;
        }

        return params;
    },

    _handlePostRequest: function(httpRequest, content) {
        var response;

        try {
            response = this._handleHttpRequest(httpRequest, httpRequest.post(content), content);
        } catch (ex) {
            response = this._handleError(ex.getMessage());
        }

        return response; 
    },

    _handlePutRequest: function(httpRequest, content) {
        var response;

        try {
            response = this._handleHttpRequest(httpRequest, httpRequest.put(content), content);
        } catch (ex) {
            response = this._handleError(ex.getMessage());
        }

        return response; 
    },

    _substituteVariable: function (original, props) {
        var newValue;

        try {
            newValue = '' + GlideStringUtil.substituteVariables(original, props);
        } catch(ex) {
            newValue = original;
        }

        return newValue;
    },

    _shouldSubstitute: function (str) {
        return str.indexOf('${') > -1;
    },
	
	_handleMutualAuth: function() {
		if (this.functionGr.use_mutual_auth) {
			this.useMutualAuth = true;
			
			this.protocolName = '' + this.functionGr.getDisplayValue('protocol_name');
	
			// if use mutual auth is checked but there is no protocol specified, use the settings from the main message
			if (JSUtil.nil(this.protocolName)) {
				if (this.restMessageGR.use_mutual_auth) 
					this.protocolName = '' + this.restMessageGR.getDisplayValue('protocol_name');
				else
					this.protocolName = '';
			}
		}
	},
	
	_adjustEndpoint: function() {
		if (!JSUtil.nil(this.endPoint) && !JSUtil.nil(this.protocolName)) {
			var currentProtocolIndex= this.endPoint.indexOf('://');
			if(currentProtocolIndex <= 0)
				this.protocolName += '://';
			this.adjustedEndpoint = this.endPoint.replace(this.endPoint.substring(0, currentProtocolIndex), this.protocolName);
		}		
	},

	_isAuthProfile : function(funcGR) {
		if (JSUtil.nil(funcGR.authentication_type) || funcGR.authentication_type == 'inherit_from_parent')
			return false;
		if (funcGR.authentication_type == 'basic_simple')
			return false;
		return true;
	}
}