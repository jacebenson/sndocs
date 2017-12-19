function ($scope,$location) {

	$scope.theme = {
		displayValue: $scope.data.name,
		value: $scope.data.sys_id,
		name: 'theme'
	};

	var display_id = $location.search().sys_id;

	$scope.$on("field.change", function(evt, parms) {		
		if (parms.field.name == 'theme')
			changePage(parms.newValue);
	});

	function changePage(p){
		var path = $location.path();
		var searchParms = $location.search();
		$location.url(path + '?id=' + searchParms.id + '&table=sp_theme&sys_id=' + p);
	}

}