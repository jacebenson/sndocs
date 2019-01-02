function ($scope,$location) {

	$scope.portal = {
		displayValue: $scope.data.title,
		value: $scope.data.sys_id,
		name: 'portal'
	};

	var display_id = $location.search().sys_id;

	$scope.$on("field.change", function(evt, parms) {		
		if (parms.field.name == 'portal')
			changePage(parms.newValue);
	});

	function changePage(p){
		var path = $location.path();
		var searchParms = $location.search();
		$location.url(path + '?table=sp_portal&sys_id=' + p);
	}
	
	if ($scope.data.sys_id)
		changePage($scope.data.sys_id);

}