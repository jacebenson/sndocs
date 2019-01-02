function($scope, $rootScope, $location, spUtil, $timeout, spAriaFocusManager) {
	if ($scope.data.dataTableWidget)
		angular.extend($scope.data.dataTableWidget.options, $scope.options);

	$scope.$on('data_table.click', function(e, parms) {
		var oid = $location.search().id;
		var p = $scope.data.page_id || 'form';
		var s = {id: p, table: parms.table, sys_id: parms.sys_id, view: $scope.data.view};
		if (oid == p) {
			s.spa = 1;
			var t = $location.search();
			s = angular.extend(t, s);
			$rootScope.$broadcast('$sp.list.click', s);
		}

		var newURL = $location.search(s);
		spAriaFocusManager.navigateToLink(newURL.url());
	});

	$scope.$on('select2.ready', function(e, $el){
		if ($scope.data.invalid_table){
			e.stopPropagation();
			$el.select2('open');
		}
	})

	$scope.selectedTable = {
		displayValue: $scope.data.table,
		value: $scope.data.table
	}

	function resetParams(){
		delete $scope.data.p;
		delete $scope.data.o;
		delete $scope.data.d;
		delete $scope.data.q;
		delete $scope.data.table;
	}

	$scope.onChange = function() {
		resetParams();
		$scope.data.table = $scope.selectedTable.value;
		$scope.data.fields = "";  // reset
		$scope.data.invalid_table = false;
		getData(true);
	}

	function getData(updateUrl) {
		var f = $scope.data;
		spUtil.update($scope).then(function(data) {
				$scope.data.dataTableWidget = null;
				$timeout(function(){
					$scope.data.dataTableWidget = data.dataTableWidget;
					angular.extend($scope.data.dataTableWidget.options, $scope.options);
					if (updateUrl)
						setPermalink(f.table);
				});
		});
	}

	function setPermalink(table) {
		$scope.ignoreLocationChange = true;
		var searchParms = $location.search();
		var search = {
			spa: 1,
			table: table,
			id: searchParms.id
		};
		$location.search(search);
	}
}