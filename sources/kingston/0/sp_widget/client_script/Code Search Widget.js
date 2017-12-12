function($scope, $http, $location) {
	/* widget controller */
	var c = this;
	$scope.startSearchSysid = false;
	$scope.startSearchCode = false;
	c.doSearch = function() {
		$scope.startSearchCode = true;
		if (c.data.searchTerm) {
			// purposely searching all scopes so hard-coding the parameter
			$http.get("/api/sn_codesearch/code_search/search?term=" + c.data.searchTerm + "&search_all_scopes=true")
				.success(function(response) {
				c.searchTerm = "";
				c.allScopes = "";
				$scope.response = response;
			});
			if(c.data.searchTerm.length === 32){
				$scope.startSearchSysid = true;
				$scope.server.update().then(function(response){
					//console.log('on client: ' + JSON.stringify(response,'','  '));
					$scope.records = response.urls;
				});
			}
		} else {
			$scope.response = "";
		}
	}

	// Update to work with URL parameters
	if($location.search().searchTerm) {
		c.data.searchTerm = $location.search().searchTerm;
		c.doSearch();
	}
}