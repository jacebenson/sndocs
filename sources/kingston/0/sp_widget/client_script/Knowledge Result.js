function($scope,$rootScope,$http,$window,$q,$timeout,KnowledgeSearchService) {
	var c = this;
	c.kbData = {};
	c.noResults = false;
	c.isLoadingNew = true;
	c.noMoreToLoad = false;
	c.showPinnedArticles = true;
	c.reqInProgress = false;
	c.noMoreData = false;
	c.showResults = false;
	c.no_result_text = "";

	c.start = 0;
	c.end = c.options.init_article_count;
	c.loadOffset = c.options.scroll_article_count;
	c.ts_queryId = "";

	c.getResultData = function(){

		//reset window ofset to get new set of data
		c.start = 0;
		c.end = c.options.init_article_count;

		c.executeSearch(false);		
	};

	c.openArticleAttachment = function(url, name, external) {
		if(external) {
			var params = 'toolbar=no,menubar=no,personalbar=no,height='+screen.height + ',' + 'width='+screen.width + ',' + 'scrollbars=yes,resizable=yes,fullscreen=yes';
			window.open(url, name, params);
		}
		else
			window.open(url, name, "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
	};

	c.getMoreResultData = function(){
		//Cancel old request
		if(c.reqInProgress)
			return false;

		//increment window ofset to get next set of data
		c.start = c.end;
		c.end = c.end + c.loadOffset;
		c.executeSearch(true);

	};

	var unRegResult = $rootScope.$on('sp.kb.refresh.result',function(event,data){
		if(data){
			c.showPinnedArticles = true;
			c.options.filters = data;
			c.getResultData();
		}
	});

	c.executeSearch = function(isMore) {
		c.noResults = false;
		c.noMoreToLoad = false;
		c.isLoadingNew = true;
		c.reqInProgress = true;
		c.noMoreData = false;

		var obj = c.options.filters;
		obj.start = c.start;
		obj.end = c.end;
		obj.attachment = true;
		obj.knowledge_fields = c.options.knowledge_fields;
		obj.social_fields = c.options.social_fields;
		obj.ts_query_sysId = c.ts_queryId;

		// deferred value to cancel outstanding ajax request
		var deferredAbort = $q.defer();

		var request = c.server.get({'payload': JSON.stringify(obj),timeout:deferredAbort.promise});
		var promise;

		if(isMore)
			promise = request.then(c.addMore,c.reqFailled);
		else
			promise = request.then(c.reqSuccess,c.reqFailled);
		// add abort method to promise
		promise.abort = function() {
			promise.aborted = true;
			deferredAbort.resolve();
		};

		// cleanup scope when request is finished
		/*promise.finally(function() {
			promise.abort = angular.noop;
			promise.done  = true;
			deferredAbort = request = promise = null;
		});*/

		return promise;
	};

	c.reqSuccess = function(response){
		//Process response and update data and relevant variables

		var data = response.data.results;
		var responseMeta = data.meta;
		var requestMeta = data.request.meta;
		var startInd =  requestMeta.window.start;
		var tsQueryId = responseMeta.tsQueryId;
		if(startInd == 0 && tsQueryId && tsQueryId!=""){
			c.ts_queryId = tsQueryId;
		}
		if(data && data.status && data.status.code == 200){			
			c.kbData = data;
			c.isLoadingNew = false;
		}else{
			// search failure
			if (typeof status.err_msg != "undefined" && status.err_msg.length > 0) {
				console.log('search error (status ' + status.code + ': ' + status.err_msg[0] + '):', response);
			} else {
				console.log('search error (status ' + status.code + '):', response);
			}

			return $q.reject(response);
		}
		c.reqInProgress = false;
	};

	c.reqFailled = function(response){
		c.reqInProgress = false;
		if (angular.isDefined(response.status) && response.status != 0) { // only log error if not aborted
			console.log('search error:', response);
		}
		return $q.reject(response.data);
	};

	c.addMore = function(response){
		var data = response.data.results;
		//process incremental load if nodata the show message
		if(data && data.status && data.status.code == 200){
			if(data.results.length){
				c.updateObject(c.kbData.results,data.results);
			}else{
				c.noMoreToLoad = true;
			}
		}else{
			// search failure
			if (typeof status.err_msg != "undefined" && status.err_msg.length > 0) {
				console.log('search error (status ' + status.code + ': ' + status.err_msg[0] + '):', response);
			} else {
				console.log('search error (status ' + status.code + '):', response);
			}

			return $q.reject(response);
		}

		c.isLoadingNew = false;
		c.reqInProgress = false;
	};

	c.updateObject = function(obj,dataObj){
		dataObj.forEach(function(item){
			obj.push(item);
		});
	};

	//Script to handle lazy loading of aricles on scroll
	var scrollWindow;
	if($($window).scrollTop())
		scrollWindow = $($window);
	else
		scrollWindow = $('div .page');


	var widgetID = $('.kb-summary-block .kb-summary-block');
	angular.element(scrollWindow).bind("scroll",_.debounce(function () {
		if(!c.isLoadingNew && !c.noMoreToLoad)
			if(widgetID.outerHeight() + 100 < (scrollWindow.outerHeight() + scrollWindow.scrollTop())){
				if(c.hasMoreData){
					c.getMoreResultData();
				}else{
					if(!c.noResults)
						c.noMoreToLoad = true;
				}
				$scope.$apply();
			}
	},100));

	$scope.$watch('c.kbData',function(){
		if(c.kbData && c.kbData.meta){
			c.noResults = c.kbData.meta.returned_results ? c.kbData.meta.returned_results == 0 : true;
			c.hasMoreData = c.kbData.meta.has_more_results ? true :false;

			if(c.noResults){
				if(c.options.filters.keyword){
					c.no_result_text = ' : ' + c.options.filters.keyword;
				}else{
					c.no_result_text = "";
				}
			}
		}
	});

	//saving default order in rootscope
	$rootScope.dafaultSortId =  c.options.default_order;
	$rootScope.dafaultSortDesc =  c.options.default_order_desc;
	//Initialize order and direction for other widgets
	$rootScope.$emit('sp.kb.update.initialize',{'order':c.options.default_order,'order_desc':c.options.default_order_desc});

	//hide pinned articles on click of cross icon
	c.hidePinSection = function(elm) {
		$timeout(function(){
			c.showPinnedArticles = !c.showPinnedArticles;
		},600);
		$('.kb-summary-block .pinned-articles').slideUp("slow", function() {

		});				
	};

	var unRegCount = $rootScope.$on('sp.kb.updated.article.count',function (event,data){
		if(!c.showResults){
			c.showResults = true;
		}		
	});

	c.roundOff = function(val){
		if(val)
			return Math.round(val);
		else
			return 0;
	};

	//show pinned articles on click of 'Show pinned articles' link
	c.showPinSection = function(elm) {
		c.showPinnedArticles = !c.showPinnedArticles;
		$('.kb-summary-block .pinned-articles').slideDown("slow", function() {			
		});
	};

	$scope.$on("$destroy", function() {
		unRegResult();
		unRegCount();
		KnowledgeSearchService.unRegisterServiceEvents()
	});
}