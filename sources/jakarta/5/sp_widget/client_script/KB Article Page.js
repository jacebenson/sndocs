function ($scope, spUtil, $sce, $rootScope, $timeout) {
	spUtil.setSearchPage('kb');
	$scope.data.text = $sce.trustAsHtml($scope.data.text);
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', $scope.data.breadcrumbs);
	});
}