function ($scope, spUtil, snRecordWatcher, $rootScope) {
	$scope.standalone = $scope.options.standalone == 'true' || $scope.options.standalone == true;
  var q = "cmdb_ci.sys_class_name=cmdb_ci_service";
  if ($scope.data.outageIDs != "")
    q += "^NQ" + $scope.data.outageIDs;

  snRecordWatcher.initList("cmdb_ci_outage", q);

  function get() {
		$rootScope.$broadcast("sp.outage.updated");
    spUtil.update($scope);
  }

  $scope.$on('record.updated', get);
}