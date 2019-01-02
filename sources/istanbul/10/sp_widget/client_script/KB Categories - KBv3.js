function($scope, spKBCategoryService, $location, $rootScope, urlTools) {
	var c = this;
	spKBCategoryService.addDefaultListener(function(catId){
		$location.search({id: 'kb_category', kb_category: catId});
	});
	
	c.setCategory = function(evt, catId) {
		evt.preventDefault();
		var searchParms = $location.search();
		searchParms.kb_category = catId;
		searchParms.spa = 1;
		$location.search(searchParms);
		spKBCategoryService.setCategoryId(catId);
	}
	// Location change handler for back/forward buttons
	var removeLw = $rootScope.$on('$locationChangeSuccess', function(e, newUrl) {
		var urlParts = urlTools.parseQueryString(newUrl);
		if (urlParts.id === 'kb_category' && spKBCategoryService.getCategoryId() !== urlParts.kb_category)
			spKBCategoryService.setCategoryId(urlParts.kb_category);
	});
	$scope.$on('$destroy', function(){
		removeLw();
	});
}