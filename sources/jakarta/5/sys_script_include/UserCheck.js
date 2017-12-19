var UserCheck = (function() {
	return {
		verifyLoggedIn: function(userId) {
			if (gs.getUserID() !== userId)
				throwOperationNotPermitted('User ' + userId + ' is not logged in.');
		}
	};
	
	function throwOperationNotPermitted(msg) {
		throw new sn_ws_err.ServiceError()
			.setStatus(403)
			.setMessage('Operation not permitted. ' + msg);
	}
	
})();

