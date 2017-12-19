function ($scope) {
  $scope.$on('$sp.list.click', function(evt, obj) {
    $scope.data.action = obj.action.name;
    $scope.data.record = obj.record;
  }); 
}