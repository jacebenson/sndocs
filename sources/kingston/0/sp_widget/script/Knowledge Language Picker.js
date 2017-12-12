(function() {

	options.alt_lang_url_params = options.alt_lang_url_params || "";

	//Set keyword from url
	var languageParm = $sp.getParameter('language') || "";

	if(languageParm == ""){
		if(options.alt_lang_url_params){
			var qParams =  options.alt_lang_url_params.toString().split(",");
			qParams.forEach(function(key){
				if($sp.getParameter(key))
					languageParm = $sp.getParameter(key);
			});
		}
	}

	var languages = [];
	var defaultLanguage = "";

	//Generate language object
	var kbService = new KBPortalService();
	var languageList = kbService.getAvailableLanguages();

	if(languageList){
		if(languageList.languages && languageList.languages.length > 0){
			languages = languageList.languages;
		}

		if(languageParm){
			languages.forEach(function(k){
				if(k.value == languageParm){
					defaultLanguage = k.label;
				}
			});
		}
		if(defaultLanguage == "" && languageList.default_language){
			defaultLanguage = languageList.default_language;
		}
	}

	data.default_language = defaultLanguage;
	data.languages = languages;
})();