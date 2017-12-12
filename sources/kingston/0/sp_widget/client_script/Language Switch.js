function ($scope, $window, $http, userPreferences, $filter) {
	var c = this;		
	c.language = {value: 'en', displayValue: 'English'};		
	c.changed = function(a) {							
		c.server.get(c.language).then(function() {			
			$window.location.reload();			
		});
	};

	// get the list of values for a property using the concourse picker api (timezone, language)
	var getListValuesForProperty = function(endpoint, listProperty) {
		$http.get('/api/now/ui/concoursepicker/' + endpoint).then(function(response) {
			if (response && response.data && response.data.result && response.data.result.list) {
				if (!listProperty.list)
					listProperty.list = [];

				listProperty.list = response.data.result.list;
				if (response.data.result.current) {
					if (!listProperty.current)
						listProperty.current = {};
					listProperty.current = $filter('filter')(listProperty.list, {value: response.data.result.current}, true)[0];
				}
			}
		});
	};

	// list of user properties that are not user preferences
	$scope.data.listProperties = {
		language: {}
	};

	// initialize dropbox data
	getListValuesForProperty('language', $scope.data.listProperties.language);
	//set the user property
	$scope.setPreferenceValue = function(endpoint, value) {
		$http.put('/api/now/ui/concoursepicker/' + endpoint, {current : value}).then(function(response) {
			if (response && response.data && response.data.result) {
				$scope.data.userPreferencesChanged = true;
				c.changed();
			}
		});
	};

	//set the user preference value
	$scope.setUserPreferenceValue = function(userProperty) {
		userPreferences.setPreference(userProperty.key, userProperty.value).then(function() {
			$scope.data.userPreferencesChanged = true;
		});
	};

}