function ($scope, spUtil, $location) {
	$scope.$on('data_table.click', function(e, parms){
		var p = $scope.data.page_id || 'form';
		var s = {id: p, table: parms.table, sys_id: parms.sys_id, view: 'sp'};
		$location.search(s);
	});
}