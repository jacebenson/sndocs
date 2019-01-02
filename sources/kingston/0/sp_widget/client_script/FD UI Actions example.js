function fdActionsExampleCtrl(fdManager, $scope) {
  /* widget controller */
  var c = this;
	
	var form_id;
	
	$scope.$on('fd.newForm', function (ev, data){
		form_id = data.id;
		c.actions = fdManager.getActions(form_id);
	});
	
	c.triggerAction = function (action) {
		fdManager.triggerAction(form_id, action);
	};
	
}