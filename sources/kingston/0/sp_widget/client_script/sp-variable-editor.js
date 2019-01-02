function($scope, $document, $rootScope) {
  /* widget controller */
  var c = this;
	var isSaved = false;
	var parent_g_form = $scope.page.g_form;
	var origActionName;

	if (parent_g_form)
		addSaveHandler();
	else
		c.showSave = true;
	
	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance){
		g_form = gFormInstance;
	});

	// Used when embedded as a formatter
	function addSaveHandler() {
		parent_g_form.$private.events.on("submit", function() {
			origActionName = parent_g_form.getActionName();
			if (isSaved) return true;
			if (!g_form.submit('none')) return false;

			c.server.update().then(function() {
				isSaved = true;
				parent_g_form.submit(origActionName);
			});

			return false;
		});
	}

	c.save = function() {
		var activeElement = $document.activeElement;
		if (activeElement)
			activeElement.blur();
		if (!g_form.submit('none'))
			return false;
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