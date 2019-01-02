function formDecoratedCtrl(fdManager, $scope, $location) {
  var c = this;
	
	var form_id;
	
	// When g_form becomes available, report to fdForm and get the actions
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		if (gFormInstance.getTableName() == $scope.data.form.table) {
			form_id = fdManager.add(gFormInstance, c.data.form);
			c.actions = fdManager.getActions(form_id);
			$scope.$emit('fd.newForm', {id: form_id});
		}
	});
	
	// Trigger an action
	c.triggerAction = function(action) {
		fdManager.triggerAction(form_id, action.action_name || action.sys_id);
	};
	
	// Once the action is complete, reload the record
	$scope.$on("spModel.uiActionComplete", function(evt, response) {
		$scope.data.sys_id = (response.isInsert) ? response.sys_id : $scope.data.sys_id;
		$scope.server.update().then(function () {
			$rootScope.$broadcast('sp.form.record.updated', $scope.data.form._fields);
			if (response.isInsert) {
				var search = $location.search();
				search.sys_id = response.sys_id;
				search.spa = 1;
				$location.search(search).replace();
			}
		});
	});

}