function($scope, $location, $rootScope) {
	var c = this;
	c.submit = function() {
		c.server.update().then(function(response) {
			$rootScope.$broadcast('$sp.widget-close-modal');
			var s = $location.search();
			s.sys_id = c.data.sys_id;
			$location.search(s).replace();
			window.location.reload();
		});
	}
	c.fixID = function(id, blurred) {
		if (!id) return;
		c.data.id = id.toString().toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
		if (blurred)
			c.data.id = c.data.id.replace(/^-|-$/g, '');
	}

	c.fixPageID = function(id) {
		if (!id) return;
		c.data.test_page_id = id.toString().toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
	}
	
	// Automatically provide an ID that is based on the name of the widget
	c.updateID = function() {
		c.data.id = c.data.name.toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
		
		c.data.test_page_id = c.data.name.toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
	}
	
	$scope.$on("widget_clone_modal_close", function() {
		c.data.id = "";
		c.data.name = "";
	});
}