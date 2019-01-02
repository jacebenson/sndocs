function ($scope, spUtil, $timeout, spAriaUtil) {
	$scope.$watch("data.rating", function() {
		if ($scope.data.rating && !$scope.data.allowFeedback)
			$scope.server.update();
	});
	
	$scope.$watch("data.response", function() {
		if ($scope.data.response) {
			$timeout(function() {
				$scope.data.response = "";
			}, 2000);
		}
	});
	
	$scope.submitFeedback = function() {
		$scope.server.update().then(function() {
			if ($scope.data.response)
				spAriaUtil.sendLiveMessage($scope.data.response);
		});
	}
}