function($scope, $rootScope, $timeout, $http, modelUtil, contextualSearch, contextualFeedback, $log, i18n) {
	var c = this;
	var ARIA_MSG_GAP = 1000;
	var PREVIEW_STR = "Preview";
	var HELPED_STR = "This helped";
	$scope.i18n = i18n;
	c.data.cxs.RESULT_TITLE_ID = 'result_title_';
	var ariaMsgs = c.data.ariaMsgs;
	$scope.cxs = c.data.cxs;
	var cxs = $scope.cxs;  // local pointer to simplify code
	cxs.trigger = {
		field: $scope.page.g_form.getField("IO:" + cxs.config.search_variable.value)
	};
	cxs.display = {
		collapsed: false
	};

	function clearDisplay() {
		delete(cxs.display.results);
		delete(cxs.display.result_detail);
		delete(cxs.display.result_index);
		delete(cxs.display.result);
	}

	$scope.getRatingDesc = function(rating) {
		rating = $scope.getRating(rating);
		if(rating == 0)
			return c.data.i18nMsgs.noRating;
		return i18n.format(c.data.i18nMsgs.rating, $scope.getRating(rating));
	}

	$scope.getRating = function(rating) {
		return Math.round(rating || 0);
	}

	function hasResults(){
		return cxs.display.results && cxs.display.results.length != 0;
	}

	$scope.$watch("cxs.trigger.field.stagedValue", function (newValue, oldValue) {
		if (cxs.trigger.timeout)
			$timeout.cancel(cxs.trigger.timeout);
		
		if (!newValue || newValue.replace(/\s/g,'') === "") {
			clearDisplay();
			delete(cxs.response);
			$scope.setAriaStatus(ariaMsgs.noResultsToDisplay, 0);
			return;
		}
		
		cxs.trigger.timeout = $timeout(function() {
			$timeout.cancel(cxs.trigger.timeout);
			$scope.setAriaStatus(i18n.format(ariaMsgs.searching, newValue), 0);
			var searchRequest = contextualSearch.newSearchRequest({
				context: cxs.config.cxs_context_config.value,
				query: {
					freetext: newValue
				},
				meta: {
					limit: cxs.config.limit.value,
					window: {
						start: 0,
						end: cxs.config.results_per_page.value
					},
					session: cxs.session,
					includePinnedArticles: true
				},
				g_form: $scope.page.g_form
			});
			
			// Submit search request and handle results returned from promise
			searchRequest.submit().then(
				function(response) {
					clearDisplay();
					cxs.response = response;
					cxs.display.results = response.results;
					if(hasResults()) {
						if($scope.hasMoreResults())
							$scope.setAriaStatus(ariaMsgs.searchCompleted, ARIA_MSG_GAP);
						else
							$scope.setAriaStatus(ariaMsgs.allResultsLoaded, ARIA_MSG_GAP);
					}
					else
						$scope.setAriaStatus(i18n.format(ariaMsgs.noMatchingResults, newValue), ARIA_MSG_GAP);
				},
				function(response) {
					clearDisplay();
					delete(cxs.response);
				}
			);
		},
		cxs.property.wait_time);
	});
	
	$scope.getMoreResults = function() {
		if (!$scope.hasMoreResults())
			return;
		// Set limit if request_next exceeds it.
		if (cxs.response.request_next.meta.window.end > cxs.config.limit.value)
			cxs.response.request_next.meta.window.end = cxs.config.limit.value;
		$scope.setAriaStatus(ariaMsgs.loadingMoreResults, 0);
		cxs.response.request_next.submit().then(
			function(response) {
				cxs.response = response;
				cxs.display.results = cxs.display.results.concat(response.results);
				if($scope.hasMoreResults())
					$scope.setAriaStatus(ariaMsgs.resultsLoaded, ARIA_MSG_GAP);
				else
					$scope.setAriaStatus(ariaMsgs.allResultsLoaded, ARIA_MSG_GAP);
			},
			function(response) {
				$log.info("BAD");
			}
		);
	};
	
	$scope.hasMoreResults = function() {
		return cxs.response.meta.has_more_results
			&& cxs.response.request_next.meta.window.start < cxs.config.limit.value;
	};
	
	$scope.displayDetail = function(resultIndex) {
		if (!cxs.display.results[resultIndex])
			return;
		
		var result = cxs.display.results[resultIndex];
		if (result._record) {
			cxs.display.result_index = resultIndex;
			cxs.display.result_detail = result._record;
			cxs.display.result = result;
			$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
			return;
		}
		
		// Lookup if we haven't already.
		var id = result.id.split(":");
		$http.get("/api/now/table/" + id[0] + "?sysparm_display_value=all&sysparm_query=sys_id%3D" + id[1]).then(
			function(response) {
				result._record = response.data.result[0];
				modelUtil.addFriendlyDisplayValueToAll(result._record);
				cxs.display.result_index = resultIndex;
				cxs.display.result_detail = result._record;
				cxs.display.result = result;
				$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
			},
			function(response) {
				$log.info("BAD II");
			}
		);
	};
	
	$scope.toggleExpandCollapse = function() {
		cxs.display.collapsed = !cxs.display.collapsed;
	};
	
	$scope.getResultTemplate = function(result) {
		return (result && result.meta.source) ? "cxs-result-" + result.meta.source : "cxs-result-default";
	};
	
	$scope.getDetailTemplate = function() {
		var result = cxs.display.results[cxs.display.result_index];
		return (result && result.meta.source) ? "cxs-detail-" + result.meta.source : "cxs-detail-default" ;
	};
	
	$scope.getKBParentCategories = function(result) {
		if (!result)
			return;
		
		var parentCategories = [];
		// copy by value. slice() does not work on this array
		if (result.meta.parentCategories)
			for (var i = 0; i < result.meta.parentCategories.length; i++)
			parentCategories.push(result.meta.parentCategories[i]);
		return parentCategories.reverse().join(' > ');
	};
	
	// Detail navigation
	$scope.backToResults = function() {
		delete(cxs.display.result_detail);
		delete(cxs.display.result_index);
		delete(cxs.display.result);
		$scope.onBackToResult();
	};
	
	$scope.toNext = function() {
		if (cxs.display.result_index >= cxs.display.results.length-1 && $scope.hasMoreResults())
			$scope.getMoreResults();
		
		if ($scope.hasNext())
			$scope.displayDetail(cxs.display.result_index + 1);	
	};
	
	$scope.toPrev = function() {
		if ($scope.hasPrev())
			$scope.displayDetail(cxs.display.result_index - 1);
	};
	
	$scope.hasNext = function() {
		return cxs.display.result_index < cxs.display.results.length-1 || $scope.hasMoreResults();
	};
	
	$scope.hasPrev = function() {
		return cxs.display.result_index > 0;
	};
	
	$scope.sendFeedback = function(action_value, result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		var relevance = true;
		if(action_value == HELPED_STR)
			relevance = !$scope.isRelevant(action_value);
		var feedbackRequest = contextualFeedback.newFeedbackRequest({
			session: cxs.session,
			search_request: cxs.response.request,
			relevant_doc: result.id,
			relevant_doc_url: result.sp_link || result.link,
			relevance: action_value,
			relevant: relevance,
			score: result.meta['score'],
            index: cxs.display.result_index,
			displayed_on: cxs.displayed_on
		});
		
		feedbackRequest.submit().then(
			function(response) {
				if (!result.meta.relevance)
					result.meta.relevance = {};
				if(action_value == PREVIEW_STR)
					result.meta.relevance[action_value] = true;
				else if(action_value == HELPED_STR)
					result.meta.relevance[action_value] = !$scope.isRelevant(action_value, result);
			},
			function(response) {
				$log.info("BAD III");
			}
		);
	};

	$scope.isRelevant = function(action_value, result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		return result.meta.relevance && result.meta.relevance[action_value];
	};
	
	$rootScope.$on("$sp.sc_cat_item.submitted", function(event, response){
        contextualFeedback.link(cxs.session, response.table, response.sys_id);
    });
	
}