function($scope, $timeout) {
	$scope.$on("$sp.sc_category.retrieve_subcategories", function(evt, category) {
		if (!category.subcategories) {
			$scope.server.get({
				action: "retrieve_nested_categories",
				parentID: category.sys_id
			}).then(function(response) {
				category.subcategories = response.data.subcategories;
			})
		}
	})
}