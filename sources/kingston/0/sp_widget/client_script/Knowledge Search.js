function($rootScope,$window,$timeout,KnowledgeSearchService,$scope) {
	var c = this;

	c.keyword = c.data.keyword || "";
	c.oldKeyword = c.data.keyword || "";
	c.options.glyph = c.options.glyph || 'search';
	c.filterCount =0;
	c.applycolor =false;
	c.items =[];
	var qry;

	//Subscribe search element to service on load
	if(KnowledgeSearchService){
		var input = {};
		input.element = "search";
		input.alt_url_params = c.options.alt_search_url_params;
		KnowledgeSearchService.subscribe(input);
	}
	var refreshSearchFilter = $rootScope.$on('sp.kb.refresh.filter',function (event,data){
		if(data){
			c.items = data;
		}
		if(c.items.length>0){
			c.filterCount = c.items.length;
			c.applycolor = true;
		}else{
			c.filterCount = 0;
			c.applycolor = false;
		}
	});


	var refreshKeyword = $rootScope.$on('sp.kb.refresh.keyword',function(event,data){
		if(data)
			c.keyword = data.keyword;				 
	});

	c.keywordChanged = function(event){
		c.keyword = c.keyword.trim();

		if(c.keyword != c.oldKeyword){
			//handle keyboard events for enter and keyup
			if(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if(!c.data.allow_instant_search && keycode != 13)
					return;
			}

			//throw update event based on options			
			if( (c.data.allow_empty_search && c.keyword == "") || (c.keyword && c.keyword.length >= c.data.min_search_char)){
				$rootScope.$emit('sp.kb.updated.keyword',{'keyword':c.keyword});
			}

			c.oldKeyword = angular.copy(c.keyword);
		}

		$timeout(function(){
			if($("#kb_search_input"))
				$("#kb_search_input").focus();
		});
	};

	//If instant search enable then wait for 200ms for the next input then throw event
	$("#kb_search_input").keyup(_.debounce(function(event){
		c.keywordChanged(event);
	},c.options.search_wait));

	c.toggleFacets = function(){
		$rootScope.showFacet = !$rootScope.showFacet;
	}
	$(window).resize(function() {
		var width1 = $(window).width();
		if(width1<=992 && !$rootScope.isMobile){
			$rootScope.isMobile = true;
		}else if(width1>992 && $rootScope.isMobile ){
			$rootScope.showFacet = false;
			$rootScope.isMobile = false;
		}
	});
	//set keyword onload from url and throw event
	if(c.data.keyword){
		c.keyword = c.data.keyword;
		c.keywordChanged();
	}
	$scope.$on('$destroy',function(){
		refreshSearchFilter();
		refreshKeyword();
	});
}