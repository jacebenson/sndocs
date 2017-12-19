function($location, $rootScope) {
	var c = this;
	c.submit = function() {
		c.server.update().then(function(response) {
			$rootScope.$broadcast('$sp.widget-close-modal');
			var s = $location.search();
			s.sys_id = c.data.sys_id;
			$location.search(s).replace();
		});
	}
	c.fixID = function(id) {
		if (!id) return;
		c.data.id = id.toString().toLowerCase()
		.replace(/[^a-z0-9-]/gi, '_')
    .replace(/^-|-$/g, '');
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
}