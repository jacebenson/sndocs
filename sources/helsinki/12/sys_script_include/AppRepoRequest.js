var AppRepoRequest = Class.create();
AppRepoRequest.prototype = {
	initialize: function(requestType, parameters) {
		this.requestType = requestType || "";
		this.parameters = parameters||{};
		this.parameters["sysparm_instance_id"] = gs.getProperty("instance_id")||'';
		this.parameters["sysparm_instance_name"] = gs.getProperty("instance_name")||'';
		this.parameters["sysparm_developer"] = gs.getProperty("glide.installation.developer")||'';
		this.baseURL = this._getUploadUrl();
		this.processor = gs.getProperty("sn_appclient.repository_processor", "sn_orchestration_api_v1.do");
		this._useBasicAuth = false;
		
		this._http = new GlideHTTPUtil();
		this.httpSupportsErrors = (typeof this._http.supportsHttpErrorCodes == 'function');
		gs.debug("HTTPClient supports HTTP error codes? {0}", this.httpSupportsErrors);
		this.responseBody = '';
		this.errorMessage = '';
	},

	setParameter: function(name, value) {
		this.parameters[name] = value;
		return this;
	},

	setQuiet: function(b) {
		this._http.setQuiet(b);
		return this;
	},
	
	isQuiet: function() {
		return this._http.isQuiet();
	},
	
	getStatusCode: function() {
		return this._http.getStatusCode();
	},
	
	getErrorMessage: function() {
		if (this.errorMessage)
			return this.errorMessage;
		
		var err = this._http.getErrorMessage();
		gs.debug("HTTP client says error message is {0}", err);

		if((this.getStatusCode() !== 200 && !err) || 
		   (this.getStatusCode() == 200 && this.responseBody)) {
			try {
				var json = new global.JSON();
				var responseObject = json.decode(this.responseBody);
				if(responseObject.errorMessage)
					err = responseObject.errorMessage;
				gs.debug("Tried pulling error message from response object. Error is {0}", err);
			} catch (e) {
				gs.debug("Response is not a JSON object.");
			}
		}
		
		if(err)
			this.errorMessage = err;
			
		return err;
	},
	
	addHeader: function(key, value) {
		this._http.addHeader(key, value);
		return this;
	},
	
	get: function() {
		this._initRequest();
		var url = this._getUrlWithParams();		
		gs.info("About to GET {0}", url);
		var response = this._http.get(url);
		this.responseBody = response;
		
		if (this.getStatusCode() == 200) {
			if ((response+'').indexOf('<!DOCTYPE html><html') > -1) {
				if (!this.isQuiet())
					gs.info("GET {0} {1} >> page could not be found", this.getStatusCode(), url);
				return "";
			}
			gs.info("GET {0} {1} >> {2}", this.getStatusCode(), url, response);
		} else if (!this.isQuiet())
			gs.error("GET {0} {1} >> {2}", this.getStatusCode(), url, this.getErrorMessage());
			
		return response;
	},

	getJSON: function() {
		var responseString = this.get();
		var responseObject = new global.JSON().decode(responseString);
		return responseObject;
	},

	post: function() {
		this._initRequest();
		var url = this._getBaseUrl();		
		gs.info("About to POST {0}", url);
		var response = this._http.post(url, this.parameters);
		this.responseBody = response;

		if (this.getErrorMessage() && !this.isQuiet())
			gs.error("POST {0} {1} >> {2}", this.getStatusCode(), url, this.getErrorMessage());
		
		else
			gs.debug("POST {0} {1} >> {2}", this.getStatusCode(), url, response);
		
		return response;
	},

	uploadAttachments: function(attachmentIds, uploadTracker) {
		this._initRequest();
		var url = this._getBaseUrl();
		gs.info("About to UPLOAD {0}, attachmentIds: {1}, parameters: {2}", url, attachmentIds.join(","), new JSON().encode(this.parameters));
		var response = this._http.uploadAttachments(attachmentIds, url, this.parameters, uploadTracker);
		this.responseBody = response;

		if (this.getErrorMessage())
			gs.error("UPLOAD {0} {1} >> {2}", this.getStatusCode(), url, this.getErrorMessage());
		else
			gs.debug("UPLOAD {0} {1} >> {2}", this.getStatusCode(), url, response);
			
		return response;
	},
	
	downloadAttachment: function(targetTable, targetSysID, fileName, fileContentType, downloadTracker) {
		this._initRequest();
		var url = this._getUrlWithParams();
		gs.info("About to DOWNLOAD " + url + ", target " + targetTable + ":" + targetSysID + ", fileName " + fileName + ", contentType " + fileContentType);
		var attachmentSysId = this._http.downloadAttachment(url, targetTable, targetSysID, fileName, fileContentType, downloadTracker);
		
		if (this.getErrorMessage())
			gs.error("DOWNLOAD {0} {1} >> {2}", this.getStatusCode(), url, this.getErrorMessage());
		else
			gs.debug("DOWNLOAD {0} {1} >> sys_attachment.sys_id {2}", this.getStatusCode(), url, attachmentSysId);			

		return attachmentSysId;
	},
		
	_getBaseUrl: function() {
		var url = this.baseURL + this.processor + "?type=" + this.requestType;
		if(!this.httpSupportsErrors)
			url += "&send_status=200";

		return url;
	},
	
	_getUrlWithParams: function() {
		var url = this._getBaseUrl();
		for (var param in this.parameters) {
			if (gs.nil(this.parameters[param])) {
				gs.debug("Skipping nil parameter value for: {0}", param);
				continue;
			}
			url += ("&" + param + "=" + this._http.urlEncode(this.parameters[param]));
		}
		return url;
	},

	_initRequest: function() {
		var authScriptInclude = "sn_apprepo.AppRepo";
		var credential = gs.getProperty("sn_apprepo.credential");
		if (gs.nil(credential))
			credential = gs.getProperty("instance_id");
		var authValue = authScriptInclude + " " + credential;
		this.addHeader("Authorization", authValue);
		
		this.errorMessage = '';
	},
	
	_getUploadUrl: function() {
		var resultURL = "";
		var targetUploadURL = this.parameters["target_upload_URL"] || '';
		resultURL = targetUploadURL;
		if (gs.nil(resultURL)) {
			var devUrl = gs.getProperty("sn_appclient.dev_repository_base_url", "http://localhost:8080/");
			var prodUrl = gs.getProperty("sn_appclient.repository_base_url", "https://apprepo.service-now.com/");
			var isDev = gs.getProperty("glide.installation.developer", "false") == "true";
				resultURL = isDev ? devUrl : prodUrl;
		
			var overrideUrl = gs.getProperty("sn_appclient.upload_base_url") || gs.getProperty("sn_appauthor.upload_base_url");
			if (!gs.nil(overrideUrl) && overrideUrl.startsWith("http"))
				resultURL = overrideUrl;
		}
		
		if (!resultURL.endsWith("/"))
			resultURL += "/";
		
		return resultURL;
	},
	
    type: 'AppRepoRequest'
};