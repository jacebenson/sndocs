function ($scope, spUtil,$rootScope, $interpolate, $window) {
	var c = this;

	spUtil.recordWatch($scope, "sc_req_item", $scope.data.filter, function(name, data) {
		c.server.update(); 
	});

	$scope.onClick = function($event, item, url, action) {
		$event.stopPropagation();
		$event.preventDefault();
		if (url) {
			var link = $interpolate(url)(item);
			$window.location = link;
		} else {
			var eventObj = {};
			eventObj.url = url;
			eventObj.table = $scope.data.table;
			eventObj.record = item;
			eventObj.rectangle_id = $scope.data.sys_id;
			eventObj.action = action;
			$rootScope.$broadcast('$sp.list.click', eventObj);
		}
	};

	$scope.toggle = function($event, item) {
		item.expand = !item.expand;
	};

	if ($scope.data.list.length == 1)
		$scope.data.list[0].expand = true;
}