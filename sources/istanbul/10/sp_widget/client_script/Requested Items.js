function requestedItemsController($scope, $rootScope, $interpolate, $window) {
  
  $scope.$watch("data.conversation_title", function() {
    $rootScope.$broadcast('sp.conversation_title.changed', $scope.data.conversation_title);
  })

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
  }
	
	$scope.toggle = function($event, item) {
		item.expand = !item.expand;
	}
	
	if ($scope.data.list.length == 1)
		$scope.data.list[0].expand = true;
}