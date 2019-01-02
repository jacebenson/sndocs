function($scope, $http, $timeout, spUtil, $rootScope) {
	var c = this;

	c.tagList = "";
	c.editMode = false;

	c.toggleEditMode = function() {
		if (c.editMode || c.data.tags.length === 0) {
			$timeout(function() {
				$scope.data.action = "update";
				if ($scope.data.tagList != c.tagList) {
					c.saving = true;
					$scope.data.tagList = c.tagList;
					$scope.server.update().then(function() {
						c.saveMsg = "Tags saved";
						c.saving = false;
						$timeout(function() {
							c.saveMsg = "";
						}, 1500);
						c.editMode = false;
						//spUtil.addTrivialMessage('Tags have been updated');
						$rootScope.$broadcast("sp-favorite-tags-updated");
					});
				} else
					c.editMode = false;

				c.tagList = "";
			});
		} else {
			c.editMode = true;
			c.tagList = "";
			$timeout(function() {
				$rootScope.$broadcast("sp-favorite-tags-edit");
			});
		}
	}	
	$scope.$on("spTagListBlurred", function() {
		c.toggleEditMode();
	});

}