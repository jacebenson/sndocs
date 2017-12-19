function ($scope, $animate, $rootScope) {
  $scope.$watch("data.task", function() {
    $scope.task = $scope.data.task; // copy for shortcuts above
  })
  
}