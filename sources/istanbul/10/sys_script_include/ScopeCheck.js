var ScopeCheck = (function() {
	return {
		verifyNotGlobal: function(appId) {
			var gr = getScopedAppRecord(appId);
			if (gr.getValue('scope') === 'global')
				throwAccessDenied(appId + ' is globally scoped.');
		}
	};
	
	function getScopedAppRecord(appId) {
		var gr = new GlideRecord('sys_scope');
		gr.addQuery('sys_id', appId);
		gr.query();
		if (!gr.next())
			throwAccessDenied(appId + ' is not a scoped application.');
		return gr;
	}
	
	function throwAccessDenied(msg) {
		throw new sn_ws_err.ServiceError()
			.setStatus(403)
			.setMessage('Access denied. ' + msg);
	}
	
})();