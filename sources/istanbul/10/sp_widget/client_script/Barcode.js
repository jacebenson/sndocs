function ($scope, spUtil, cabrillo, $timeout) {
  $scope.got = false;
  $scope.need = false;

  $scope.$on("need_barcode", function() {
    $scope.need = true;
  });

  $scope.$on('scan_barcode', function(evt) {
    $timeout(function() {
      angular.element('#scan_barcode').trigger('click');
    }, 100);
  });

  $scope.getBarcode = function() {
    cabrillo.camera.getBarcode().then(function(value) {
      cabrillo.log('Received barcode value: ' + value);
      $scope.data.barcode = value;
      $scope.got = true;
      $scope.need = false;
      spUtil.update($scope);
    }, function(err) {
      $scope.data.barcode = "IT1011717";
      spUtil.update($scope);
      $scope.got = true;
      $scope.need = false;
    });
  }
}