function(scope, element, attrs, ctrl){
	if (!scope.data)
		return;
	var $rootScope = $injector.get('$rootScope');
	var $uibModal = $injector.get('$uibModal');
	var opts = {
		size : scope.options.size || 'lg',
		scope: $rootScope.$new(false, scope),
		template : element,
		backdrop: scope.options.backdrop || true,
		keyboard: scope.options.keyboard != undefined ? scope.options.keyboard : true,
		controller : function($scope, $uibModalInstance){
			$scope.instance = scope.data.instance;
		}
	};

	if (scope.options.modalBodyClass)
		element.addClass(scope.options.modalBodyClass);
	
	if (scope.options.beforeRender)
		scope.options.beforeRender.call(null, scope.data.instance.data);

	var modalInstance = $uibModal.open(opts);

	if (scope.options.afterOpen)
		scope.options.afterOpen.call(null, modalController(modalInstance));
	
	if (scope.options.afterClose)
		modalInstance.closed.then(scope.options.afterClose);

	modalInstance.closed.then(function(){
		scope.$emit('sp.widget-modal.closed');
	});
	
	function modalController(instance){
		return {
			close: function(){
				instance.close();
			}
		}
	}

}