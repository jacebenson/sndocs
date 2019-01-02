function($scope,$rootScope,$http,$window,$q,$timeout) {
	/* widget controller */
	var c = this;
	c.visible = false;
	c.items = [];
	c.alternatePhrasesFound = false;
	$rootScope.hideSearchBorder = false;

	if(c.data.enable_spell_correct || c.data.enable_chain_suggest){
		c.visible = true;
	}
	//set selections from data
	var refreshSuggestion = $rootScope.$on('sp.kb.refresh.suggestion',function (event,data){
		if(data){
			c.keyword = data.keyword;
			c.language = data.language;
			c.searchForAlternatePhrases(c.keyword,c.language);
		}
	});


	c.searchForAlternatePhrases = function(keywords,language){
		c.items = [];
		c.alternatePhrasesFound = false;
		if(!c.visible)
			return;
		if (typeof keywords !== 'string' || !keywords.trim().length)
			return;
		var input = {};
		input.keyword = keywords;
		input.requestType = "searchForAlternatePhrases";
		input.language = language;
		var deferredAbort = $q.defer();

		var request = c.server.get(input);
		var promise;

		promise = request.then(c.searchPhraseSuccess,c.searchPhraseFailure);
		// add abort method to promise
		promise.abort = function() {
			promise.aborted = true;
			deferredAbort.resolve();
		};

		// cleanup scope when request is finished
		promise.finally(function(){
			promise.abort = angular.noop;
			promise.done  = true;
			deferredAbort = request = promise = null;
		});

	};

	c.updateKeyword = function(keyword){
		$rootScope.$emit('sp.kb.updated.suggestion',{'keyword':keyword});
	}
	
	c.searchPhraseSuccess = function(response) {
		c.items = response.data.results.phrases;
		if(c.items.length>0){
			$rootScope.hideSearchBorder = true;
			c.alternatePhrasesFound = true;
		}else{
			$rootScope.hideSearchBorder = false;
		}
	};


	c.searchPhraseFailure = function(response) {
		if (angular.isDefined(response.status) && response.status != 0) { // only log error if not aborted
			console.log('search error:', response);
		}
		return $q.reject(response.data);
	};		

	$scope.$on('$destroy',function(){
		refreshSuggestion();
	});
	
}