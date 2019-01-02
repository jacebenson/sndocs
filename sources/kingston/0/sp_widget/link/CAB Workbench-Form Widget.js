function(scope, el, attr) {
	var clsNamespace = ".cab_custom_form_tabs";
	var $timeout = $injector.get("$timeout");
	// This is CAB specific customization
	// monitor the click event for uib-tab
	// whenever tab changes refresh the form fields.
	angular.element(el).on("click" + clsNamespace,
												 clsNamespace + " li[cab_change_tab_key]",
												 function(){
		var key = $(this).attr("cab_change_tab_key");
		if(!key)
			return;
		if(scope.activeChangeTabKey == key)
			return;
		scope.activeChangeTabKey = key;
		// give sometime .so that field will be visible on the tab.
		$timeout(function(){
				scope.refreshFormTab();
		},10);

	});
	scope.$on("$destroy", function(){
		angular.element(el).off(clsNamespace);
	})

}