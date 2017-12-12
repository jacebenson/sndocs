
angular.module("sn.itsm.vcab.misc").controller('confirmSharing', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
	
	$scope.share = function() {
		$uibModalInstance.close();
	};
	
	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
	
}]);
