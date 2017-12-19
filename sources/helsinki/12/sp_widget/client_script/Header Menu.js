function (snRecordWatcher, $scope, spUtil, $rootScope, $timeout) {
	$scope.loadingIndicator = $rootScope.loadingIndicator;
	$scope.cartItemCount = 0;
	$scope.itemAddedTooltipOpen = false;

	$scope.$on("$sp.service_catalog.cart.count", function($evt, count) {
		$scope.cartItemCount = count;
	});

	var cancelTooltipPromise;
	$scope.$on("$sp.service_catalog.cart.add_item", function() {
		$timeout.cancel(cancelTooltipPromise);

		$scope.itemAddedTooltipOpen = true;
		cancelTooltipPromise = $timeout(function() {
			$scope.itemAddedTooltipOpen = false;
		}, 3000);
	});

	$scope.$on('sp_loading_indicator', function(e, value) {
		$scope.loadingIndicator = value;
	});

	$scope.toggleCart = function() {
		$timeout.cancel(cancelTooltipPromise);
		$scope.itemAddedTooltipOpen = false;
		$timeout(function() {
			$("#cart-dropdown").dropdown("toggle");
		});
	}

	// Get list of record watchers
	var record_watchers = [];
	if ($scope.data.menu.items) {
		for(var i in $scope.data.menu.items) {
			var item = $scope.data.menu.items[i];
			if (item.type == 'scripted') {
				if (item.scriptedItems.record_watchers)
					record_watchers = record_watchers.concat(item.scriptedItems.record_watchers);
			}
			if (item.type == 'filtered') {
				record_watchers.push({'table':item.table,'filter':item.filter});
			}
		}
	}

	// Init record watchers
	for (var y in record_watchers){
		var watcher = record_watchers[y];
		//console.info('Record Watcher: '+watcher.table+' : '+watcher.filter);
		snRecordWatcher.initList(watcher.table, watcher.filter);
	}

	$scope.$on("record.updated", function(evt) {
		spUtil.update($scope);
	});

}