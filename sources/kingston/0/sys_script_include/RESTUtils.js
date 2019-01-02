gs.include("RESTUtils");

var RESTUtils = Class.create();
RESTUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    validateCORSDomain: function(corsDomainUrl) {
		var url = this._removeProtocol(corsDomainUrl);
		
		//disallow http://servicenow.com/incident or snc.com?a=b
		if (url.indexOf('/') > -1 || url.indexOf('?') > -1)
			return gs.getMessage("Invalid domain. / and ? are not allowed in the domain pattern");

		//validate url if includes at least one *
		if (url.match(/\*/g) != null) {
			if (url.match(/\*/g).length >  1) //more than one * ie. http://*.snc.*.com
				return gs.getMessage("Invalid domain. Only one wildcard (*) is allowed");

			//if host is '*' or does not start with * ie. news.*.com or blog*.com
			if (url.length == 1)
				return gs.getMessage("Invalid domain. A host substring must be specified, e.g. http://*test.acme.com, https://*test.acme.com, *test.acme.com, *.acme.com, or acme.com");

			//if host does not start with * ie. news.*.com
			if (!url.startsWith('*'))
				return gs.getMessage("Invalid domain. Wildcard (*) is only allowed in the left-most justified position, e.g. http://*test.acme.com, https://*test.acme.com, *test.acme.com, *.acme.com, or acme.com");
		}

		return null;
    },
	
	//ie. http://*.service-now.com ==> *.service-now.com
	_removeProtocol: function(url) {
		var protocol_idx = url.indexOf('://');
		if (protocol_idx != -1) {
			if (protocol_idx + 3 < url.length)
				url = url.substring(protocol_idx + 3).trim();
			else
				url = '';
		}

		return url;
	},

    type: 'RESTUtils'
});