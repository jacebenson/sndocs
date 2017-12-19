function ($scope) {

	$scope.$watch('page.field.value', function(nv, ov) {
		$scope.error = false;
		if (!nv)
			return; 

		$scope.error = isNaN($scope.page.field.value);
	})
}