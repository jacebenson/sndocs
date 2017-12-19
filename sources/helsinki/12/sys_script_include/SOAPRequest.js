gs.include("PrototypeServer");

var SOAPRequest = Class.create();

/**
 * SOAPRequest takes a SOAPEnvelope or string representation of a SOAP envelope
 * and posts it to the specified endpoint
 */
SOAPRequest.prototype = {
  initialize: function(endpoint, userName, password) {
    this.endpoint = endpoint;
    this.httpStatus = null;
    this.responseDoc; // a string of the response
    this.soapAction;
    this.userName = userName;
    this.password = password;
    this.proxyHost;
    this.proxyPort = 80;
    this.postMethod;
    this.errorMessage;
    this.midServer; // mid server name
    this.requestHeaders = new Object();
    this.httpHeaderMap = {};
  },

  /**
   * posting a SOAPEnvelope object, optionally specifying whether
   * to use the ECC table to send the request
   */
  post: function(soapEnvelope, use_ecc) {

    this.httpStatus = null
    this.errorMessage = null;
    this.responseDoc = null

    var action = soapEnvelope.functionName;
    if (this.soapAction)
      action = this.soapAction;

    if (use_ecc) {
      var cred = this.encodeCredentials();
      if (this.midServer) {
        soapEnvelope.setMIDServer(this.midServer);
      }

      soapEnvelope.invokeService(this.endpoint, action, cred);
      return;
    }

    var soapDoc = soapEnvelope.toString() + ''; // make sure that it is a javascript string
    return this.postString(soapDoc, action);
  },

  /**
   * encode basic auth credentials, to be used when invoking SOAP
   * through the ECC queue
   */
  encodeCredentials: function() {
    if (this.userName == null)
      return "";

    var str = this.userName + ":" + this.password;
    var e = new GlideEncrypter();
    return e.encrypt(str);
  },

  /**
   * posting a string representation of the SOAP envelope
   */
  postString: function(soapDoc, action) {

    this.httpStatus = null
    this.errorMessage = null;
    this.responseDoc = null

    // must initialize first, to get extended protocols and SSL context
    // before making a new PostMethod
    var httpClient = new GlideHTTPClient();

    try {
      this.postMethod = new Packages.org.apache.commons.httpclient.methods.PostMethod(this.endpoint);
      this.postMethod.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
      this.postMethod.setRequestHeader("SoapAction", this.wrapQuotes(action));

      for(key in this.requestHeaders) {
        this.postMethod.setRequestHeader(key, this.requestHeaders[key]);
      }

      this.postMethod.setRequestBody(soapDoc);

      if (this.userName) {
        httpClient.setBasicAuth(this.userName, this.password);
      }

      if (this.proxyHost) {
        if (this.proxyHost == "unset") {
          httpClient.setHostConfiguration(new Packages.org.apache.commons.httpclient.HostConfiguration());
        } else {
          httpClient.setupProxy(this.proxyHost, this.proxyPort);
        }
      }

      var result = httpClient.executeMethod(this.postMethod);
      this.httpStatus = result;

      this.errorMessage = httpClient.getErrorMessage();

	  var headers = this.postMethod.getResponseHeaders();
	  for (var i = 0; i < headers.length; i++) {
		  this.httpHeaderMap[headers[i].getName()] = headers[i].getValue();
	  }
		
      this.responseDoc = this.postMethod.getResponseBodyAsString();
      this.postMethod.releaseConnection();
      return this.responseDoc;
    } catch (e) {
      this.errorMessage = e.toString();
      
      var sb = new Packages.java.lang.StringBuffer();   
      var st = e.getStackTrace();
      for (var i = 0; i < st.length; i++) {
        sb.append(st[i].toString() + "\n");
      }        
    
      return this.errorMessage + "\n" + sb.toString();
    } finally {
      this.postMethod.releaseConnection();
    }
  },

  /**
   * Wrap specified string in double-quotes unless it is already wrapped
   */
  wrapQuotes : function (str) {
    if (str !== null)
      str = "\"" + str.trim().replace(/^"/, "").replace(/"$/, "") + "\"";

    return str;
  },

  /**
   * setup proxy servers for the HTTP post
   */
  setupProxy : function (host, port) {
    this.proxyHost = host;
    if (port) {
      this.proxyPort = port; // defaults to 80
    }
  },

  /**
   * set the SOAP action HTTP header
   */
  setSoapAction: function(action) {
    this.soapAction = action;
  },

  setMIDServer : function(name) {
    this.midServer = name;
  },

  /**
   * get the response string
   */
  getResponseDoc: function() {
    return this.responseDoc;
  },

  getResponseHeaderValue: function(headerName) {
    var header = this.postMethod.getResponseHeader(headerName);
    return header.getValue();
  },

  setRequestHeader: function(headerName, headerValue) {
    this.requestHeaders[headerName]=headerValue;
  },

  /**
   * get the HTTP status of the post
   */
  getHttpStatus: function() {
    return this.httpStatus;
  },
  /**
   * get the error message as a result of the post
   */
  getErrorMessage: function() {
    return this.errorMessage;
  },
	
	getHttpHeaders: function() {
		return this.httpHeaderMap;
	},
	
	getHttpHeader: function(name) {
		return this.httpHeaderMap[name];
	}
	
};
