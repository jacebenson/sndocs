function ($scope, spUtil, $sce, $rootScope) {	
	$rootScope.$broadcast('sp.update.breadcrumbs', $scope.data.breadcrumbs);	
	spUtil.setSearchPage('kb');
	$scope.data.text = $sce.trustAsHtml($scope.data.text);	
}