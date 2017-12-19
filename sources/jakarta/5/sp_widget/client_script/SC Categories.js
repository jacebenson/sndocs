function($scope, $http, $timeout) {
	var getCatalogCategories = "/api/sn_sc/servicecatalog/catalogs/" + $scope.data.sc_catalog + "/categories?sysparm_top_level_only=" + ($scope.options.category_layout === "Nested") + "&sysparm_check_item_can_view=" + $scope.options.check_can_view + "&sysparm_limit=-1&sysparm_dynamic_category=false";
	$http({method: 'GET', url: getCatalogCategories}).
		then(function(response) {
			$scope.data.categories = response.data.result;

			$scope.server.get({
				action: "retrieve_parent_hierarchy",
				cur_category : $scope.data.selected_category,
				categories : $scope.data.categories
			}).then(function(response) {
				$scope.data.categories = response.data.categories;
			});

		}, function(response) {
			console.log(response.data.error.message);
		});

	$scope.$on("$sp.sc_category.retrieve_subcategories", function(evt, category) {
		var specificCategoryDetails = "/api/sn_sc/servicecatalog/categories/" + category.sys_id + "?sysparm_check_item_can_view=" + $scope.options.check_can_view;
		if (!category.subcategories || !category.subcategories[0].count) {
			$http({method: 'GET', url: specificCategoryDetails}).
				then(function(response) {
 					category.subcategories = response.data.result.child_categories;
				}, function(response) {
					console.log(response.data.error.message);
				});
		}
	});
}