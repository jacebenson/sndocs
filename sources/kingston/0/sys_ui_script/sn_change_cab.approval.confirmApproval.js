angular.module("sn.change_management.cab.approval")
	.controller('confirmApproval', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance){
		$scope.editor = {
			config: {
				menubar:false,
				theme:'modern',
				skin:'lightgray',
				plugins:[
			         'advlist lists link charmap anchor',
			         'searchreplace visualblocks code ',
			         'insertdatetime'
			         ],
			    height: 150,
			    toolbar:'styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link',
			    toolbar_items_size:'small',
			    resize: false,
			    statusbar:false,
			    debounce:false
			},
			workingCopy: ""
		};
		
		$scope.ok = function() {
			$uibModalInstance.close("[code]" + $scope.editor.workingCopy + "[/code]");
		};
		
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}]);