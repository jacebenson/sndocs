var ScriptedRESTCommon = Class.create();
ScriptedRESTCommon.prototype = {
	initialize: function() {
	},
	
	normalizeServiceId: function(svcId) {
		// all non-lowercase chars and digits to '_'
		svcId = svcId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
		
		// replace repeating '_' chars with a single '_'
		svcId = svcId.replace(/_+/g, '_');
		
		// remove the trailing '_' if present
		if (svcId.charAt(svcId.length-1) == '_')
			svcId = svcId.substring(0, svcId.length-1);
		
		return svcId;
	},
	
	normalizeRelativePath: function (template_uri) {
		var uri = '/' + template_uri;
		
		// convert all non-alphanumeric and chars other than '_/{}' to '_'.
		uri = uri.replace(/[^a-zA-Z0-9_\/\{\}]/g, '_');
		
		// replace repeating '_' chars with a single '_'
		uri = uri.replace(/_+/g, '_');
		
		// replace repeating '/' chars with a single '/'
		uri = uri.replace(/\/+/g, '/');
		
		// remove the trailing '_' or '/' chars if present
		uri = uri.replace(/[_\/]+$/, '');
		
		if (0 === uri.length)
			uri = '/';
		
		return uri;
	},
	
	type: 'ScriptedRESTCommon'
};