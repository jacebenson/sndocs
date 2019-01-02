function ($scope, spUtil) {
  $scope.$on('record.updated', function(name, data) {
    spUtil.update($scope);
  }) 
}