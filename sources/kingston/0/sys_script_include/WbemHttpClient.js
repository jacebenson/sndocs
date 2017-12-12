var WbemHttpException = Class.create();
WbemHttpException.prototype = Object.extendsObject(GenericException);

var WbemHttpClient = Class.create();
WbemHttpClient.prototype = {
  initialize : function(schema, hostname, port, username, password) {
    this._config = new WbemConnectionParameters(schema, hostname, port, username, password);
  },

  enumerateClassNames: function(namespace, deepInheritance, localOnly, includeQualifiers, includeClassOrigin) {
    var request = new WbemXmlRequest(this._config, namespace, 'EnumerateClasses', 4711);

    if (deepInheritance == null)
      deepInheritance = false;
    if (localOnly == null)
      localOnly = false;
    if (includeQualifiers == null)
      includeQualifiers = false;
    if (includeClassOrigin == null)
      includeClassOrigin = false;

    request.addParameter('DeepInheritance', ( deepInheritance ? 'TRUE' : 'FALSE' ));
    request.addParameter('LocalOnly', ( localOnly ? 'TRUE' : 'FALSE' ));
    request.addParameter('IncludeQualifiers', ( includeQualifiers ? 'TRUE' : 'FALSE' ));
    request.addParameter('IncludeClassOrigin', ( includeClassOrigin ? 'TRUE' : 'FALSE' ));

    var response = request.request();
    var classesDom = new ArrayUtil().ensureArray(response['CLASS']);
    var classnames = [];

    for (var i = 0; i < classesDom.length; ++i)
      classnames.push(classesDom[i]['@NAME'] + '');

    return classnames;
  },

  enumerateInstances: function(namespace, classname, localOnly) {
    var request = new WbemXmlRequest(this._config, namespace, 'EnumerateInstances', 1000);

    if (classname == null)
      throw new IllegalArgumentException('ClassName is required.');
    if (localOnly == null)
      localOnly = false;

    request.addParameter('ClassName', '<CLASSNAME NAME="' + classname + '" />');
    request.addParameter('LocalOnly', ( localOnly ? 'TRUE' : 'FALSE' ));

    var response = request.request();
    var namedInstancesDom = new ArrayUtil().ensureArray(response['VALUE.NAMEDINSTANCE']);
    var instances = [];

    for (var ii = 0; ii < namedInstancesDom.length; ++ii) {
      var instanceClassName = namedInstancesDom[ii].INSTANCENAME['@CLASSNAME'] + '';
      var instancesDom = new ArrayUtil().ensureArray(namedInstancesDom[ii].INSTANCE);

      for (var ji = 0; ji < instancesDom.length; ++ji) {
        var instance = { 
                           classname: instanceClassName 
                       };
        var propertiesDom = new ArrayUtil().ensureArray(instancesDom[ji].PROPERTY);

        for (var pi = 0; pi < propertiesDom.length; ++pi)
          instance[propertiesDom[pi]['@NAME']] = propertiesDom[pi].VALUE;

        instances.push(instance);
      }
    }

    return instances;
  },

  type: "WbemHttpClient"
}

var WbemConnectionParameters = Class.create();

WbemConnectionParameters.SCHEMA_HTTP = 'http';
WbemConnectionParameters.SCHEMA_HTTPS = 'https';

WbemConnectionParameters.prototype = {
  initialize: function(schema, hostname, port, username, password) {
    this.schema = schema;
    this.hostname = hostname;
    this.port = port;
    this.username = username;
    this.password = password;
  }
};

var WbemXmlRequest = Class.create();

WbemXmlRequest.TRUE = 'TRUE';
WbemXmlRequest.FALSE = 'FALSE';

WbemXmlRequest.prototype = {
  initialize: function(wbemConnectionParameters, namespace, method, messageId) {
    this._method = ( method ? method : null );
    this._messageId = ( messageId ? messageId : null );
    this._config = wbemConnectionParameters;
    this._parameters = {};
    this._namespace = null;
    this._namespaceTokens = null;

    if (namespace)
      this.setNamespace(namespace);
  },

  setNamespace: function(namespace) {
    this._namespace = namespace;
    this._namespaceTokens = namespace.split('/');
  },

  setMethod: function(method, messageId) {
    this._method = method;
    this._messageId = messageId;
  },

  addParameter: function(name, value) {
    this._parameters[name] = value;
  },

  validate: function() {
    if (!this._namespace)
      throw new IllegalArgumentException('Wbem namespace is required.');
    else if (!this._method)
      throw new IllegalArgumentException('Wbem method is required.');
    //else if (!this._parameters)
    //  throw new IllegalArgumentException('Wbem parameters are required.');
  },

  createXml: function() {
    this.validate();

    var xml = '<?xml version="1.0" encoding="utf-8" ?>\n<CIM CIMVERSION="2.0" DTDVERSION="2.0">\n<MESSAGE ID="' + this._messageId + '" PROTOCOLVERSION="1.0">\n<SIMPLEREQ>\n'
    + '<IMETHODCALL NAME="' + this._method + '">\n<LOCALNAMESPACEPATH>\n';

    for (var i = 0; i < this._namespaceTokens.length; ++i)
      xml += '<NAMESPACE NAME="' + this._namespaceTokens[i] + '" />\n';

    xml += '</LOCALNAMESPACEPATH>\n';

    for (var key in this._parameters) {
      if (this._parameters[key].charAt(0) == '<')
        xml += '<IPARAMVALUE NAME="' + key + '">\n' + this._parameters[key] + '\n</IPARAMVALUE>\n';
      else
        xml += '<IPARAMVALUE NAME="' + key + '">\n<VALUE>' + this._parameters[key] + '</VALUE>\n</IPARAMVALUE>\n';
    }

    xml += '</IMETHODCALL>\n</SIMPLEREQ>\n</MESSAGE>\n</CIM>\n';
    return xml;
  },

  createHttpRequest: function() {
    var request = new GlideHTTPRequest(
      this._config.schema + '://' + this._config.hostname + ':' + this._config.port + '/cimom'
    );

    request.setBasicAuth(this._config.username, this._config.password);
    request.setContentType("application/xml");
    request.addHeader('CIMOperation', 'MethodCall');
    request.addHeader('CIMMethod', this._method);
    request.addHeader('CIMObject', this._namespace);
    request.setHttpTimeout(5000);
    return request;
  },

  request: function() {
    var request = this.createHttpRequest();
    var xml = this.createXml();
    var response = request.post(xml);
    if (response.haveError()) {
      var headers = response.getHeaders();
      var msg = headers.get('CIMError') + '.';
      if (headers.containsKey('PGErrorDetail')) // include tog-pegasus if available
        msg += ' ' + Packages.java.net.URLDecoder.decode(headers.get('PGErrorDetail')) + '.';
      throw new WbemHttpException(msg);
    }

    var body = response.getBody();
    var dom = new XMLHelper(body).toObject();
    if (!dom || !dom.MESSAGE.SIMPLERSP.IMETHODRESPONSE.IRETURNVALUE) {
      if (dom.MESSAGE.SIMPLERSP.IMETHODRESPONSE.ERROR)
        throw new WbemHttpException(dom.MESSAGE.SIMPLERSP.IMETHODRESPONSE.ERROR['@DESCRIPTION'])

      throw new WbemHttpException('Invalid response from server.');
    }

    return dom.MESSAGE.SIMPLERSP.IMETHODRESPONSE.IRETURNVALUE;
  },
}