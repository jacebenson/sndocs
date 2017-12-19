function ($scope, spUtil) {
  
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

  $scope.approve = function(id) {
    $scope.data.op = "approved";
    $scope.data.target = id;
    get();
  }

	$scope.reject = function(id) {
		$scope.data.op = "rejected";
		$scope.data.target = id;
		get();
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