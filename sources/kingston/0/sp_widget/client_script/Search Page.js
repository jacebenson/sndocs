function ($scope, $location, spUtil, $rootScope) {
	spUtil.setSearchPage($scope.data.t);
	$scope.showScore = $scope.options.show_score == 'true' || $scope.options.show_score == true;

	$scope.getBGImage = function(item) {
		return {"background-image": "url('" + item.picture + "')"};
	}
	
	$scope.search = function(searchTerm) {
		$location.search('q', searchTerm);
	}

	$scope.highlight = function(haystack, needle) {
		if (!haystack)
			return "";

		if (!needle)
			return haystack;

		return haystack.replace(new RegExp(needle.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "gi"), function(match) {
			return '<span class="highlight mark">' + match + '</span>';
		});
	}
}