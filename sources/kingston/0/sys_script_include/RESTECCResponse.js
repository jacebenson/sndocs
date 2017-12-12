var RESTECCResponse = Class.create();
RESTECCResponse.prototype = {
	
	initialize: function(ecc_input) {
		this.statusCode = 0;
		this.body = '';
		this.endPoint = '';
		this.content = '';
		this.hasError = false;
		this.errorCode = 0;
		this.errorMessage = '';
		this.headerMap = {};
		this._processEccQueueInput(ecc_input);
	},
	
	getHttpMethod: function() {
		return null;
	},
	
	getStatusCode: function() {
		return this.statusCode;
	},
	
	getHeader: function(name) {
		return this.headerMap[name];
	},
	
	getHeaders: function() {
		return this.headerMap;
	},
	
	getBody: function() {
		return this.body;
	},
	
	haveError: function() {
		return this.hasError;
	},
	
	getErrorCode: function() {
		return this.errorCode;
	},
	
	getErrorMessage: function() {
		return this.errorMessage;
	},
	
	getContent: function() {
		return this.content ? this.content : '';
	},
	
	getEndpoint: function() {
		return this.endpoint ? this.endpoint : '';
	},
	
	setContent: function(content) {
		this.content = content;
	},
	
	setEndpoint: function(endpoint) {
		this.endpoint = endpoint;
	},
	
	_processEccQueueInput: function(input) {
		var xml = new XMLHelper();
		var payloadXML = input.payload;
		if(payloadXML.toString() == '<see_attachment/>'){
			var sa = new GlideSysAttachment();
			payloadXML = sa.get(input, 'payload');
		}
		
		var record = xml.toObject('' + payloadXML);
		
		this.params = record.parameters.parameter;
		this.headers = record.httpHeaders.httpHeader;
		this.statusCode = this._getParameter('http_status_code');
		this.content = this._getParameter('content');
		/*
		this.hasError = false;
		this.errorCode = 0;
		this.errorMessage = '';
 		*/
		var error = record['@error'];
		
		if (error) {
			this.hasError = true;
			this.errorMessage = error;
		}
		
		if (record.result) {
			var error = record.result['@error'];
			if (error) {
				this.hasError = true;
				this.errorMessage = error;
			}
			
			error = record.result.error;
			if (error){
				this.hasError = true;
				this.errorMessage = error;
			}
		}
		
		if (!this.hasError)
			this.body = record.result.output;
		
		if (record.httpHeaders) {
			for (var i = 0; i < this.headers.length; i++) {
				this.headerMap[this.headers[i]['@name']] = this.headers[i]['@value'];
			}
		}
	},
	
	_getParameter: function(name) {
		var value = '';
		for (var i = 0; i < this.params.length; i++)
			if (this.params[i]['@name'] == name) {
			value = this.params[i]['@value'];
			break;
		}
		
		return value;
	},
	
	type: 'RESTECCResponse'
}