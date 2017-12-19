function ($scope) {

	$scope.$watch('page.field.value', function(nv, ov) {
		$scope.error = false;
		$scope.warn_value = false;
		if (!nv)
			return; 

		$scope.error = isNaN($scope.page.field.value);
		if ($scope.error)
			return; 
		
		var t = parseFloat($scope.page.field.value);
		if (t < 0 || t >100)
			$scope.warn_value = true;
	})
}