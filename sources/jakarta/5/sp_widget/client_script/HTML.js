function ($scope, $sce) {
	var c = this;
	c.html = $sce.trustAsHtml(c.options.html);
	$scope.$watch('c.options.html',function(){
		c.html = $sce.trustAsHtml(c.options.html);
	})
}