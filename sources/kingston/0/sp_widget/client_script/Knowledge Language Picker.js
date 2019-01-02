function($rootScope,$timeout,KnowledgeSearchService) {
	//Update language 
	//or hide picker if no language returned from server
	var c = this;
	c.showDropdown = false;
	c.selectedLanguage = c.data.default_language || "${English}";
	c.languages = c.data.languages;

	//Subscribe search element to service on load
	if(KnowledgeSearchService){
		var input = {};
		input.element = "language";
		input.alt_url_params = c.options.alt_lang_url_params;
		KnowledgeSearchService.subscribe(input);
	}

	//Throw event for change
	c.updateLanguage = function(item){
		$rootScope.$broadcast('sp.kb.updated.language',item);
		c.selectedLanguage = item.label;
		c.showDropdown = false;
	};

	//Close dropdown on foccus out
	$timeout(function(){
		$(".kb-language").focusout(function(){
			c.showDropdown = false;
		});
	});
}