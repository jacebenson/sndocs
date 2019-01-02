function($scope, $rootScope) {
  /* widget controller */
  var c = this;

	$scope.loadingIndicator = $rootScope.loadingIndicator;

	$scope.$on('sp_loading_indicator', function(e, value) {
		$scope.loadingIndicator = value;
	});

}