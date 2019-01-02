angular.module("sn.app_common.cxs", ["sn.app_common.cxs.contextual_search", "sn.app_common.cxs.contextual_feedback"]);
angular.module("sn.app_common.cxs.contextual_search", ["sn.app_common"]);
angular.module("sn.app_common.cxs.contextual_search")
	.service("contextualSearch", ["$http", "$q", "modelUtil", "$log", function($http, $q, modelUtil, $log) {
		var contextualSearch = this;
		
		var CTX_SERVICE = "/api/now/cxs/search";
		
		// Definition of the client side SearchRequest
		var SearchRequest = function(requestData) {
			// Deep copy of request.  Stops dot walking inadvertantly modifying different requests.
			if (requestData) {
				var reqGF;
				if (requestData.g_form) {
					reqGF = requestData.g_form;
					delete requestData.g_form;
				}
				angular.copy(requestData, this);
				if (reqGF) {
					requestData.g_form = reqGF;
					this.g_form = reqGF;
				}
			}
			else {
				this.query = {};
				this.meta = {
					window: {}
				};
			}
			
			this.submit = function() {
				return contextualSearch.submit(this);
			};
		};
		
		// Definition of the client side SearchResponse
		var SearchResponse = function(responseData) {
			if (responseData) {
				// Shallow copy response.
				for (var key in responseData)
					if(responseData.hasOwnProperty(key))
						this[key] = responseData[key];
				
				// Create SearchRequest objects
				if (this.request) {
					this.request = new SearchRequest(this.request);
					
					var winDiff = this.request.meta.window.end - this.request.meta.window.start;
					
					// Inspect request and create prev_request and next_request;
					if (!this.request_next && this.meta.has_more_results) {
						this.request_next = new SearchRequest(this.request);
						this.request_next.meta.sources = this.meta.sources;
						this.request_next.meta.window.start = this.request_next.meta.window.end;
						this.request_next.meta.window.end += winDiff;
					}
					
					if (!this.request_prev && this.request.meta.window.start > 0) {
						this.request_prev = new SearchRequest(this.request);
						this.request_prev.meta.sources = this.meta.sources;
						this.request_prev.meta.window.end = this.request_prev.meta.window.start;
						this.request_prev.meta.window.start =
							winDiff >= this.request_prev.meta.window.start ? 0 :  this.request_prev.meta.window.start - winDiff;
					}
				}
			}
		};
		
		contextualSearch.newSearchRequest = function(requestData) {
			return new SearchRequest(requestData);
		};
		
		/* Converts sp g_form.serialize() to form g_form.serialize()
		 * Not a 1:1 conversion, a 'good enough' conversion
		 */
		function serializeForm(g_form) {
			var fieldNames = g_form.getFieldNames();
			var nvp=[];
			var isFrm = false;
			for (var i = 0; i < fieldNames.length; i++) {
				if (fieldNames[i].match(/^IO:/))
					nvp.push(fieldNames[i] + "=" + g_form.getValue(fieldNames[i]));
				else {
					isFrm = true;
					var fldNm = g_form.getTableName() + "." + fieldNames[i];
					nvp.push(fldNm + "=" + g_form.getValue(fieldNames[i]));
					nvp.push("sys_display." + fldNm + "=" + g_form.getDisplayValue(fieldNames[i]));
				}
			}
			
			if (isFrm) {
				nvp.push("sys_target=" + g_form.getTableName());
				nvp.push("sys_uniqueValue=" + g_form.getUniqueValue());
			}
			return nvp.join("&");
		}
		
		contextualSearch.submit = function(searchRequest) {
			// Build the form information on submit
			if (searchRequest.g_form)
				searchRequest.meta.form = {
					tn: searchRequest.g_form.getTableName() || "ni",
					sys_id: searchRequest.g_form.getUniqueValue(),
					serialized: serializeForm(searchRequest.g_form)
				};

			var deferred = $q.defer();
			
			var reqGF;
			if (searchRequest.g_form) {
				reqGF = searchRequest.g_form;
				delete searchRequest.g_form;
			}
			
			$http.post(CTX_SERVICE, searchRequest).then(function(response) {
				deferred.resolve(new SearchResponse(response.data.result));
			},
			function(response) {
				modelUtil.failNicely(response);
				deferred.reject(response);
			});
			
			if (reqGF)
				searchRequest.g_form = reqGF;
			
			return deferred.promise;
		};
	}]);


angular.module("sn.app_common.cxs.contextual_feedback", ["sn.app_common","sn.app_common.cxs.contextual_search"]);
angular.module("sn.app_common.cxs.contextual_feedback")
	.service("contextualFeedback", ["$http", "$q", "modelUtil", "contextualSearch", "$log", function($http, $q, modelUtil, contextualSearch, $log) {
		var contextualFeedback = this;

		var CTX_SERVICE = "/api/now/cxs/feedback";
		var CTX_SERVICE_LINK = CTX_SERVICE + "/link";

		// Definition of the client side FeedbackRequest
		var FeedbackRequest = function(requestData) {
			if (requestData) {
				angular.copy(requestData, this);
				if (this.search_request) {
					this.search_request = contextualSearch.newSearchRequest(this.search_request);
					if (this.search_request.g_form)
						delete (this.search_request.g_form);
				}
			}
			else {
				this.search_request = contextualSearch.newSearchRequest();
				this.relevant_doc = "";
				this.relevant_doc_url = "";
				this.relevance = "";
				this.relevant = false;
			}
				

			// Convenience method to submit this request
			this.submit = function() {
				return contextualFeedback.submit(this);
			};
		};
		
		// Definition of the client side FeedbackResponse
		var FeedbackResponse = function(responseData) {
			if (responseData) {
				// Shallow copy response.
				for (var key in responseData)
					if(responseData.hasOwnProperty(key))
						this[key] = responseData[key];
				
				// Create a feedback request object
				if (this.request)
					this.request = new FeedbackRequest(this.request);
			}
		};

		contextualFeedback.newFeedbackRequest = function(requestData) {
			return new FeedbackRequest(requestData);
		};

		contextualFeedback.submit = function(feedbackRequest) {
			var deferred = $q.defer();
			$http.post(CTX_SERVICE, feedbackRequest).then(function(response) {
				deferred.resolve(new FeedbackResponse(response.data.result));
			},
			function(response) {
				modelUtil.failNicely(response);
				deferred.reject(response);
			});
			return deferred.promise;
		};
		
		contextualFeedback.link = function(session, tableName, sysId) {
			var deferred = $q.defer();
			$http.post(CTX_SERVICE_LINK, {
				"session_id" : session,
				"sys_id" : sysId,
				"table" : tableName
			}).then(function(response){
				deferred.resolve(response);
			}, function(response){
				modelUtil.failNicely(response);
				deferred.reject(response);
			});
			return deferred.promise;
		};
	}]);