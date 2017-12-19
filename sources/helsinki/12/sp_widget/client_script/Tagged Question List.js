function questionListController($scope, spUtil, $timeout) {
	var c = this;
	spUtil.setBreadCrumb($scope, [
		{label: c.data.communityBreadcrumb, url: '#'}
	]);
  c.mode = getMode();
	function getMode() {
		if (!c.data.tagID)
			return "all";
		
		if (c.data.tagID == "-1")
			return "favorites";
		
		return "tag";
	}

	c.getSysIDParam = function() {
		return (c.data.tagID) ? "&sys_id=" + c.data.tagID : "";
	}

	c.capitalize = function(str) {
		if (str.length === 0)
			return "";

		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	$scope.$on("sp-favorite-tags-updated", function() {
		c.data.tagID = -1;
		$scope.server.update().then(function() {
			c.mode = getMode();
		});
	})
}