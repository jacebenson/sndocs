function($scope, $document, $rootScope) {
  /* widget controller */
  var c = this;
	var isSaved = false;
	var g_form = $scope.page.g_form;
	var origActionName;

	if (g_form)
		addSaveHandler();
	else
		c.showSave = true;

	// Used when embedded as a formatter
	function addSaveHandler() {
		g_form.$private.events.on("submit", function(){
			origActionName = g_form.getActionName();
			if (isSaved) return true;

			c.server.update().then(function(){
				isSaved = true;
				g_form.submit(origActionName);
			});

			return false;
		});
	}

	c.save = function(){
		var activeElement = $document.activeElement;
		if (activeElement)
			activeElement.blur();
		c.server.update().then(function() {
			if (c.data.table == "sc_cart_item")
				$rootScope.$broadcast("$sp.service_catalog.cart.update");
		});
	};
	
	c.hasVariables = function(fields) {
		if (!fields) 
			return false;
		
		return Object.keys(fields).length > 0;
	}
}