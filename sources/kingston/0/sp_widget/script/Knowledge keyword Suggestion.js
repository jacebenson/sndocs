(function() {
	if(input){
		if(input.requestType=="searchForAlternatePhrases"){
			data.results = getResults(input.keyword,input.language);
		}
	} else{
		data.instanceid = $sp.getDisplayValue("sys_id");
		data.enable_spell_correct=gs.getProperty('glide.ts.dym.enable_spell_correct') == 'true' || false;
		data.enable_chain_suggest=gs.getProperty('glide.ts.dym.enable_chain_suggest') == 'true' || false;
	}

	function getResults(keyword,lang){
		var searchRequest = new KBPortalService();
		return searchRequest.getKnowledgeSuggestions(keyword,lang);
	}
})();