function(FlowManager, $location, $scope, $timeout, spUtil) {
	
  var c = this,
			g_form;
	
	FlowManager.init(c.data.flowSysID, c.server);
	
	c.getActionsVisible = FlowManager.getActionsVisible;
	c.isLoading = FlowManager.getIsLoading;
	
	c.submit = function () {
		if (c.data.screen.type === 'form') {

			g_form.submit('sysverb_update_and_stay').then(function (response) {
				if (response.isInsert) {
					FlowManager.setRecord(response.sys_id, g_form.getTableName());
					FlowManager.submit();
				}
			});	
		} else {
			FlowManager.submit();
		}
	};
	
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		
		if (gFormInstance.getTableName() == c.data.screen.form.table) {
			
			g_form = gFormInstance;
			
			$timeout(function () {
				var responses = c.data.responses;
				eval(c.data.screen.loadScript);
			}, 0);
			
		}
	});
	
}