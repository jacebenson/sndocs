function ($scope, spUtil, spUIActionsExecuter) {
	var ESIGNATURE = {
		TYPE: "form",
		APPROVE_SYS: "cbfe291147220100ba13a5554ee4904d",
		REJECT_SYS: "580f711147220100ba13a5554ee4904b"
	};

	if ($scope.options.portal == true || $scope.options.portal == 'true') {
		$scope.contentColClass = "col-xs-12";
		$scope.options.portal = true;
	} else {
		$scope.options.portal = false;
		$scope.contentColClass = "col-sm-9";
	}

	$scope.data.op = "";
	spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^approverIN" + $scope.data.myApprovals.toString());

	function get() {
		spUtil.update($scope);
	}

	$scope.approve = function(id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};

		if($scope.data.esignature.e_sig_required && esigRequired) {
			spUIActionsExecuter.executeFormAction(ESIGNATURE.APPROVE_SYS, "sysapproval_approver" , id, [] , "", requestParams).then(function(response) {
			});			
		} else {
			$scope.data.op = "approved";
			$scope.data.target = id;
			get();
		}
  }

	$scope.reject = function(id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};

		if($scope.data.esignature.e_sig_required && esigRequired) {
			spUIActionsExecuter.executeFormAction(ESIGNATURE.REJECT_SYS, "sysapproval_approver" , id, [] , "", requestParams).then(function(response) {
			});
		} else {
			$scope.data.op = "rejected";
			$scope.data.target = id;
			get();  
		}
	}

	// pagination
	$scope.previousPage = function() {
		if ($scope.data.pagination.currentPage > 1)
			$scope.data.pagination.currentPage = $scope.data.pagination.currentPage - 1;
		else
			$scope.data.pagination.currentPage = 0;

		get();
	}

	$scope.nextPage = function() {
		$scope.data.pagination.currentPage = $scope.data.pagination.currentPage+1;
		get();
	}
}