function ($scope, $rootScope, $timeout, spKBCategoryService) {
	var accessWordCountMax = 15;
	var c = this;
	init();
	
	c.getShortenText = function getShortenText(text) {
		var wordsArray = text.split(" ");
		if (wordsArray.length > accessWordCountMax)
			wordsArray = wordsArray.slice(0, accessWordCountMax);
		return wordsArray.join(" ");
	}
	
	var removeListener = spKBCategoryService.addListener(function(catId) {
		c.data.category = catId;
		c.data.items = null;
		c.server.update().then(function(){
			init();
		});
	});
	
	function init() {
		$timeout(function() {
			$rootScope.$broadcast('sp.update.breadcrumbs', c.data.breadcrumbs);
		});
	}
	
	$scope.$on('$destroy', function(){
		removeListener();
	});
}