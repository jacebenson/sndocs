var VCSAppAccessCheck = (function() {
	
	return {
		verifyReadAccess : function(appId) {
			var gr = attemptAppLoad(appId);
			if (!gr.canRead())
				throwAccessDenied(appId);
		},
		
		verifyWriteAccess : function(appId) {
			var gr = attemptAppLoad(appId);
			if (!gr.canRead()) // temporary fix for PRB683568
				throwAccessDenied(appId);
		},
		
		verifyCreateAccess : function() {
			var gr = new GlideRecord("sys_app");
			if (!gr.canCreate())
				throw new sn_ws_err.ServiceError()
					.setStatus(403)
					.setMessage("Access denied to create a new application");
		}
	};
	
	function attemptAppLoad(appId) {
		var gr = new GlideRecord("sys_app");
		gr.addQuery('sys_id', appId);
		gr.query();
		if (!gr.next())
			throw new sn_ws_err.NotFoundError("Invalid application id " + appId);
		return gr;
	}
	
	function throwAccessDenied(appId) {
		throw new sn_ws_err.ServiceError()
			.setStatus(403)
			.setMessage("Access denied to application " + appId);
	}
	
})();