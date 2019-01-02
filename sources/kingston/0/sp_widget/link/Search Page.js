function(scope) {
	var lazyLoader = $injector.get("lazyLoader");
	lazyLoader.putTemplates(scope.data.resultTemplates);
}