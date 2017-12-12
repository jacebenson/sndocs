function($scope, $rootScope) {
  /* widget controller */
  var c = this;
	
	$scope.userID = $scope.user.sys_id;
	
	$rootScope.$on('sp.avatar_changed', function() {
		$scope.userID = "";
		$timeout(function(){
			$scope.userID = $scope.user.sys_id;
		});
	});
}