var HttpResponseEccPayloadConverter = Class.create();
HttpResponseEccPayloadConverter.prototype = {
	initialize: function() {
		this.params = {};
		this.headers = {};
		this.cookies = [];
		this.body;
		this.errMsg;
		this.stringUtil = new GlideStringUtil();
		this.payload = new GlideXMLDocument("results");
		this.status;
		this.responseAttachSysid = '';
	},
	
	getPayload: function() {
		this._buildResult();
		this._buildHeaders();
		this._buildCookies();
		this._buildParams();
		this._buildError();
		return this.payload;
	},
	
	_buildHeaders:function(){
		if(!JSUtil.isEmpty(this.headers)){
			var httpHeaders = new GlideXMLDocument("httpHeaders");
			
			for(var name in this.headers) {
				var h = httpHeaders.createElement("httpHeader");
				httpHeaders.setCurrent(h);
				httpHeaders.setAttribute("name",name);
				httpHeaders.setAttribute("value",this.headers[name]);
				httpHeaders.pop();
			}
			var hElem = httpHeaders.getDocumentElement();
			var pElem = this.payload.getDocumentElement();
			this.payload.importElementToParent(hElem,pElem);
		}
	},
	
	_buildCookies:function(){
		if(this.cookies.size() > 0){
			var httpCookies = new GlideXMLDocument("httpCookies");
			
			// this.cookies has been set to ArrayList via
			// setCookies function below
			for	(idx = 0; idx < this.cookies.size(); idx++) {
				var h = httpCookies.createElement("httpCookie");
				httpCookies.setCurrent(h);
				httpCookies.setAttribute("value", this.cookies.get(idx));
				httpCookies.pop();
			}
			
			var cElem = httpCookies.getDocumentElement();
			var pElem = this.payload.getDocumentElement();
			this.payload.importElementToParent(cElem,pElem);
		}
	},
	
	_buildParams:function(){
		if(!JSUtil.isEmpty(this.params)){
			var params = new GlideXMLParameters();
			for(var name in this.params) {
				params.put(name,this.params[name]);
			}
			var pElem = params.getDocumentElement();
			var payloadElem = this.payload.getDocumentElement();
			
			this.payload.importElementToParent(pElem,payloadElem);
		}
	},
	
	_buildResult:function() {
		if(JSUtil.notNil(this.body) || JSUtil.notNil(this.responseAttachSysid)) {
			var rElem = this.payload.createElement("result");
			this.payload.setCurrent(rElem);
			if (JSUtil.notNil(this.body)) {
				this.body = this.stringUtil.stripSuffix(this.body,"\r\n");
				this.payload.createElement("output",this.body);
			} else {
				this.payload.createElement("attachment_output",this.responseAttachSysid);
			}
			this.payload.pop();
		}
	},
	
	_buildError:function() {
		if(JSUtil.notNil(this.errMsg)){
			var pDocElem =  this.payload.getDocumentElement();
			this.setCurrentElement(pDocElem);
			this.payload.setAttribute("error",this.errMsg);
		}
	},
	
	setHttpHeader:function(name, val){
		this.headers[name] = val;
	},
	
	setHttpHeaders:function(headers){
		if(!JSUtil.isEmpty(headers)){
			for(var key in headers) {
				this.setHttpHeader(key, headers[key]);
			}			
		}
	},
	
	setCookies:function(cookies){
		this.cookies = cookies;
	},
	
	setBody:function(body){
		this.body = body;
	},
	
	setResponseAttachmentSysid:function(respAttachSysid) {
		this.responseAttachSysid = respAttachSysid;
	},
	
	setStatus:function(code){
		this.params.http_status_code = code;
	},
	
	setErrorMsg:function(msg){
		this.errMsg = msg;
	},
	
	setParam:function(name,value){
		this.params[name] = value;
	},
	
	type: 'HttpResponseEccPayloadConverter'
}