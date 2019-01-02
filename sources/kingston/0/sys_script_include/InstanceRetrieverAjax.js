var InstanceRetrieverAjax = Class.create();

InstanceRetrieverAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
  myInstanceId: gs.getProperty("instance_id"),
  myMgmtServer: gs.getProperty("upgrade_server_url"),

  getCredentials: function() {
    var user = this.getParameter('sysparm_username');
    var pass = this.getParameter('sysparm_password');
    var instance_url = this.getParameter('sysparm_instance_url');
    var clone_id = this.getParameter('sysparm_clone_id');

    var success = this.authenticate(instance_url, user, pass, clone_id);
    if (!success) {
      this.setError(this.getErrorMessage());
      return;
    }

    if (this.hasSecurityToken())
      this._addResponse('security_token', this.getSecurityToken());

    var instanceGR = this.getInstanceRecord();
    if (this.isUpdate())
       instanceGR.update();
    else
       instanceGR.insert();

    var instanceSysId = instanceGR.getValue("sys_id");

    gs.log("InstanceRetrieverAjax instance sys_id: " + instanceSysId + ", instance_id: " + instanceGR.instance_id + ", security_token: " + this.getSecurityToken());
    return instanceSysId;
  },

  authenticate: function(instance_url, user, pass, clone_id) {
    var answer = false;
    this._errorMessage = null;
    this._instanceGR = null;
    this._isUpdate = false;
    this._securityToken = null;

    try {
          var soapRequest = this._getSOAPResponse(instance_url, user, pass, clone_id);
          var xmlStr = soapRequest.getResponseXML();

          gs.log("InstanceRetrieverAjax xmlStr=" + xmlStr);
          gs.log("InstanceRetrieverAjax getHTTPStatus=" + soapRequest.getHTTPStatus());

          if (this._haveError(soapRequest, xmlStr))
            return false;
          
          var xmlDoc = new XMLDocument(xmlStr);
          if (this._isValidResponse(xmlDoc)) {
            this._instanceGR = this._populateRecord(xmlDoc, instance_url);
            answer = true;
          } else {
            var remoteError = xmlDoc.getNodeText("//error_string");
            if (gs.nil(remoteError)) {
			  var remote_instance_id = xmlDoc.getNodeText("//instance_id");
			  if (this._isSameInstanceId(remote_instance_id))
				  this._setErrorMessage("Destination has same Instance ID as source, unable to clone");
			  else
				  this._setErrorMessage("Destination returned invalid response");
			} else
				this._setErrorMessage(remoteError);
          }
    } catch(e) {
          this._setErrorMessage("Destination returned an error, please check your URL, username, and password");
          gs.log("InstanceRetrieverAjax error: " + e);
    }
    return answer;
  },

  getSecurityToken: function() {
    return this._securityToken;
  },

  hasSecurityToken: function() {
    return this._securityToken != null && this._securityToken != "";
  },

  getErrorMessage: function() {
    return this._errorMessage;
  },

  getInstanceRecord: function() {
    return this._instanceGR;
  },

  isUpdate: function() {
    return this._isUpdate;
  },
  
  _getSOAPResponse: function(instance_url, user, pass, clone_id) {
    // create the soap document
    var soapdoc = new SOAPEnvelope("HAGetParams", "http://www.service-now.com/");
    soapdoc.setFunctionName("execute");    
    soapdoc.addFunctionParameter("clone_id", clone_id);

    // post the request
    var url = this._buildWSURL(instance_url);
    gs.log("InstanceRetrieverAjax: Sending request to " + url);
    var soapRequest = new GlideInternalSoapClient(url, user, pass);
	soapRequest.setSOAPAction(soapdoc.functionName);
    soapRequest.postRequest(soapdoc.toString());
     
    return soapRequest;
  },
	
  _isValidResponse: function(xmlDoc) {
	var remote_instance_id = xmlDoc.getNodeText("//instance_id");
    return !gs.nil(remote_instance_id) && !this._isSameInstanceId(remote_instance_id);
  },

  _isValidResponseToken: function(xmlDoc) {
    return !gs.nil(xmlDoc.getNodeText("//security_token"));
  },

  _isSameInstanceId: function(remote_instance_id) {
	var self_instance_id = gs.getProperty("instance_id");
	if (gs.nil(remote_instance_id) || gs.nil(self_instance_id))
		return false;
	  
	return remote_instance_id == self_instance_id;
  },
	
  _buildWSURL: function(instance_url) {
    var url = instance_url+"";
    var http = "";
    var slash = "";
    if (url.charAt(url.length-1, 1) != '/') {
      slash = "/";
    }
    
    if (url.indexOf("http") != 0) {
      http = "http://";
    
      if (url.indexOf("localhost") == -1) {
        http = "https://";
      }
    }

    return http + url + slash + "HAGetParams.do?SOAP";
  },
  
  _populateRecord: function(xmlDoc, instance_url) {
	  var instanceGR = new GlideRecord("instance");
      instanceGR.addQuery("source", false);
      var qc = instanceGR.addQuery("instance_id", xmlDoc.getNodeText("//instance_id"));
      qc.addOrCondition("instance_url", instance_url);
      instanceGR.orderBy("instance_id");
      instanceGR.query();
      this._isUpdate = instanceGR.next();
      instanceGR.setWorkflow(false);

      // populate instance metadata
      var instance_name = SncCloneUtils.getInstanceName(instance_url);
      instanceGR.setValue("instance_id", xmlDoc.getNodeText("//instance_id"));
      instanceGR.setValue("instance_name", instance_name);
      instanceGR.setValue("instance_url", instance_url);
      instanceGR.setValue("production", xmlDoc.getNodeText("//production"));
      instanceGR.setValue("war_version", xmlDoc.getNodeText("//war_version"));
      
      // populate database parameters     
      var ip = gs.getXMLText(xmlDoc, "//ip");
      var jdbcUrl = gs.getXMLText(xmlDoc, "//url");
      var encryptedPassword = xmlDoc.getNodeText("//password");

      // for ease of development and testing in dev environments, no sql permission setting (IP address lookup takes 5s so try and skip it for dev)
      if (jdbcUrl !== null && jdbcUrl.indexOf("localhost") < 0 && ip == GlideHostUtil.getPublicIPAddress())
          jdbcUrl = jdbcUrl.replace(ip, "localhost");

      instanceGR.setValue("database_name", xmlDoc.getNodeText("//name"));       
      instanceGR.setValue("database_tablespace", xmlDoc.getNodeText("//tablespace"));
      instanceGR.setValue("database_type", xmlDoc.getNodeText("//rdbms"));
      instanceGR.setValue("database_user", xmlDoc.getNodeText("//user"));
      instanceGR.database_password = encryptedPassword;
      instanceGR.setValue("database_url", jdbcUrl); 
      instanceGR.setValue("source", false);
      instanceGR.setValue("primary", false);

      if (this._isValidResponseToken(xmlDoc))
        this._setSecurityToken(xmlDoc.getNodeText("//security_token"));

      return instanceGR;
  },
  
  _haveError: function(soapRequest, xmlStr) {
      if (soapRequest.getErrorMessage()) {
          this._setErrorMessage(soapRequest.getErrorMessage());
          return true;
      }

      if (soapRequest.getHTTPStatus() == 401) {
          this._setErrorMessage("Invalid username or password");
          return true;
      }

      if (soapRequest.getHTTPStatus() == 403) {
          this._setErrorMessage("Destination returned unauthorized access (Verify IP Access Control List)");
          return true;
      }

      if (gs.nil(xmlStr) || xmlStr.indexOf("SOAP-ENV:Envelope") == -1) {
          if (!gs.nil(xmlStr) && xmlStr.indexOf("service-now") != -1) {
            this._setErrorMessage("Destination does not appear to have the HA Plugin enabled (HA Plugin must be installed on target instance)");
            return true;
          }

          this._setErrorMessage("Destination does not appear to be a Service-now.com instance");
          return true;
      }

      if (xmlStr.indexOf("Invalid table HAGetParams") != -1) {
          this._setErrorMessage("Destination returned invalid response (Verify user is an admin)");
          return true;
      }

      if (xmlStr.indexOf("Web service not found") != -1) {
          this._setErrorMessage("Destination does not appear to have the HA Plugin enabled (HA Plugin must be installed on target instance)");
          return true;
      }

      if (soapRequest.getHTTPStatus() != 200) {
          this._setErrorMessage("Destination returned error, status = " + soapRequest.getHTTPStatus());
          return true;
      }

      return false;
  },

  _setSecurityToken: function(token) {
    this._securityToken = token;
  },

  _setErrorMessage: function(error) {
    this._errorMessage = error;
  },

  _addResponse: function(name, node) {
      var item = this.newItem(name);
      var tn = this.getDocument().createTextNode(new JSON().encode(node));
      item.appendChild(tn);
  },
  
  isPublic: function() {
    return false;
  },
  
  type: 'InstanceRetrieverAjax'
});