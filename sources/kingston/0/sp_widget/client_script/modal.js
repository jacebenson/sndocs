function($scope, $timeout) {
	var c = this;
	
	$scope.$on("$$uiNotification", function(evt, $$uiNotification) {
		evt.preventDefault();
		if (evt.stopPropagation)
			evt.stopPropagation();
		addUiNotification($$uiNotification);
	});
	
	var notificationAutoDismissTimeout;
	function addUiNotification($$uiNotification) {
		if (angular.isArray($$uiNotification) && !$$uiNotification.length)
			return;

		if (angular.isArray($$uiNotification) && $$uiNotification.length > 0)
			c.$$uiNotification = $$uiNotification;
		else {
			if (!angular.isArray($scope.$$uiNotification))
				c.$$uiNotification = [];

			c.$$uiNotification.push($$uiNotification);
		}

		$timeout.cancel(notificationAutoDismissTimeout);
		var seconds = 5;
		if (c.$$uiNotification.length == 1 && c.$$uiNotification[0].type == 'trivial')
			seconds = 2;

		notificationAutoDismissTimeout = $timeout(function(){
			c.dismissNotifications();
		}, seconds * 1000);
	}
	
	c.dismissNotifications = function() {
		angular.forEach(c.$$uiNotification, function(notification){
			notification.visible = false;
		});
		$timeout(function(){
			c.$$uiNotification = {};
		}, 20);
	}

	c.revealNotification = function($$uiNotification){
		$timeout(function(){
			$$uiNotification.visible = true;
		}, 20);
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// End notification handling
	/////////////////////////////////////////////////////////////////////////////////////////////////////
}