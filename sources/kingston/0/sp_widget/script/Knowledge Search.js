(function($sp) {

	options.alt_search_url_params = options.alt_search_url_params || "";

	//Set keyword from url
	data.keyword = "";
	var keywordParm = $sp.getParameter('query') || "";

	if(keywordParm == ""){
		if(options.alt_search_url_params){
			var qParams =  options.alt_search_url_params.toString().split(",");
			qParams.forEach(function(key){
				if($sp.getParameter(key))
					keywordParm = $sp.getParameter(key);
			});
		}
	}
	
	if(keywordParm)
		data.keyword = keywordParm;

	//set values based on options and properties.
	//options will be given precedence if value exit
	data.set_foccus = gs.getProperty('glide.knowman.portal_search_focus') == 'true' || false;
	data.min_search_char = parseInt(options.min_search_char || gs.getProperty('glide.knowman.search_character_limit') || 3);
	data.allow_instant_search = options.allow_instant_search ? (options.allow_instant_search == 'Use system property' ?  gs.getProperty('glide.knowman.search.instant_results') == 'true' : options.allow_instant_search == 'Yes') : gs.getProperty('glide.knowman.search.instant_results') == 'true' || false;
	data.allow_empty_search = options.allow_empty_search ? (options.allow_empty_search == 'Use system property' ?  gs.getProperty('glide.knowman.allow_empty_search') == 'true' : options.allow_empty_search == 'Yes') : gs.getProperty('glide.knowman.allow_empty_search') == 'true' || false;
	
	options.search_wait = options.search_wait || 500;
	options.title = options.title || gs.getMessage('Search (minimum {0} characters)',data.min_search_char+'');

	var langOption = {};
	langOption.alt_lang_url_params = options.alt_lang_url_params || "";
	data.language_picker = $sp.getWidget("kb-language-picker",langOption);
})($sp);