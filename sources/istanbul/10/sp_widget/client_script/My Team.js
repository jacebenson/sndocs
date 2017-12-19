function ($scope, $location) {
	$scope.showFullInfoCollegues = false;
	$scope.showFullInfoReports = false;
	$scope.showMyProfile = false;

	$scope.$on('finishedChanged', function(event, data) {
      $scope.myManager = data.profile.manager;
      $scope.teamMembers = data.profile.members;
			$scope.directReports = data.profile.direct_reports;
			if(data.profile.user && data.profile.user.sys_id) { //if user exists, then this isn't 'my' profile. It's someone elses.
				$scope.showMyProfile = true;
				$scope.userID = data.profile.user.sys_id;
			}
	});
	
	$scope.openProfile = function(user) {
		$location.search("id=user_profile&sys_id=" + user.sys_id); 
	};
	
	$scope.showTeamWidget = function() {
		return ($scope.myManager && $scope.myManager.sys_id) ||
			($scope.teamMembers && $scope.teamMembers.length > 1) ||
			($scope.directReports && $scope.directReports.length > 0);
	};
	
	$scope.updateList = function(variable, value) {
		if (variable == "showFullInfoReports")
			$scope.showFullInfoReports = value;
		else if (variable == "showFullInfoCollegues")
			$scope.showFullInfoCollegues = value;
	};
}