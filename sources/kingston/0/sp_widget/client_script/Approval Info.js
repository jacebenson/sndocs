function ($scope, spUIActionsExecuter, spUtil) {
	var c = this;
	
	var ESIGNATURE = {
		"approved": "cbfe291147220100ba13a5554ee4904d",
		"rejected": "580f711147220100ba13a5554ee4904b"
	};
	
	spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^sys_id="+ c.data.sys_id);

	c.action = function(state) {
		if(c.data.esignature.e_sig_required) {
			var requestParams = {
				username: c.data.esignature.username,
				userSysId: c.data.esignature.userSysId
			};
			spUIActionsExecuter.executeFormAction(ESIGNATURE[state], "sysapproval_approver" , c.data.sys_id, [] , "", requestParams).then(function(response) {
				});
		} else {
				c.data.op = state;
				c.data.state = state;
				c.server.update();
		}
	}	
}