function(scope, element) {	
	var el = $(element[0]).find('input');	
	scope.$evalAsync(function() {
		el.focus();	
	});
}