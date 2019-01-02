function ($scope) {
  $scope.table = "sp_page";
  $scope.field = {};
  $scope.descriptor = {
    reference: $scope.table,
    attributes: '',
    name: '',
    searchField: 'id',
    qualifier: ''
  };
  
  $scope.valueSelected = function() {
    console.log($scope.field);
  }
}