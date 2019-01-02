function ($scope, $sce, $location, spUtil, $rootScope) {
	spUtil.setSearchPage($scope.data.t);
	$scope.showScore = $scope.options.show_score == 'true' || $scope.options.show_score == true;

	$scope.getBGImage = function(item) {
		return {"background-image": "url('" + item.picture + "')"};
	}

	$scope.highlight = function(haystack, needle) {
		if (!haystack)
			return "";

		if (!needle)
			return $sce.trustAsHtml(haystack);

		return $sce.trustAsHtml(haystack.replace(new RegExp(needle, "gi"), function(match) {
			return '<mark class="highlight">' + match + '</mark>';
		}));
	}
}