function ($scope, spUtil, snRecordWatcher) {
  
  if ($scope.options.portal == true || $scope.options.portal == 'true') {
    $scope.contentColClass = "col-xs-12";
		$scope.options.portal = true;
	} else {
		$scope.options.portal = false;
		$scope.contentColClass = "col-sm-9";
	}

	$scope.data.op = "";
  snRecordWatcher.initList("sysapproval_approver", "state=requested^approver=" + window.NOW.user_id);

  function get() {
    spUtil.update($scope);
  }

	$scope.$on('record.updated', function(name, data) {
		get();
	})

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
}