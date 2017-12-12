angular.module('sn.change_management.cab')
	.controller('ModalCtrl', function ($scope, $uibModalInstance, data) {
		$scope.data = data;
		$('body').on('DismissCabwModal', function () {
			$scope.cancel();
		});
		$scope.modalName = $scope.data.cabwModalName;
		$scope.cancel = function() {
			$uibModalInstance.dismiss();
		};
		$scope.$on('$destroy', function () {
			$('body').off('DismissCabwModal');
		});
	});