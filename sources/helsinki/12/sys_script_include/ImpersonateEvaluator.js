var ImpersonateEvaluator = Class.create();
ImpersonateEvaluator.prototype = {
	initialize: function() {},
    type: 'ImpersonateEvaluator',
	canImpersonate: function(currentUser, impersonatedUser) {
		return true;
	}
};