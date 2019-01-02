function ($scope, spUtil) {
  function get() {
    spUtil.update($scope);
  }

  $scope.$on('sp.outage.updated', get); 
}