var KBPortalServiceImpl = Class.create();
KBPortalServiceImpl.prototype = {
	
	LANGUAGE: gs.getProperty('glide.knowman.enable_multi_language_search','false') != 'true' ?  (gs.getProperty("glide.knowman.search.default_language") || gs.getUser().getLanguage() || 'en') : "",
	
	initialize: function() {
		
	},
	
	/**
	Calls SNC Class to evaluate the inputs and get all subscribed facets data
 	**/
	getAllFacets: function(keyword,language,variables,query,order){
		
		try{
			language = language || this.LANGUAGE;
			return this._getAllFacets(keyword+'',language+'',variables+'',query+'',order+'');
		}catch(e){
			return [];
		}
	},
	
	/**
	Calls SNC Class to evaluate the inputs and get specific facet data
 	**/
	getFacetByName: function(name,value,keyword,language,variables,query,order){
		
		try{
			language = language || this.LANGUAGE;
			return this._getFacetByName(name+'', value+'', keyword+'',language+'',this.str(variables),this.str(query),order+'');
		}catch(e){
			return [];
		}
	},
	
	//Returns a JSONArray representation of accessible knowledge bases
	getMyKnowledgeBases:function(order){
		try{
			order = order || 'title';
			return this._getMyKnowledgeBases(order+"");
		}catch(e){
			return "";
		}
	},
	
	//Returns a JSONArray representation of keyword suggestions
	getKnowledgeSuggestions:function(keyword,language){
		try{
			language = language || this.LANGUAGE;
			return this._getKnowledgeSuggestions(keyword,language);
		}catch(e){
			return "";
		}
	},
	
	//Returns a JSONArray representation of accessible knowledge bases
	getFeaturedArticles:function(maxValue,displayField,secondaryFields,kb){
		try{
			return this._getFeaturedArticles(maxValue,displayField,secondaryFields,kb);
		}catch(e){
			return [];
		}
	},
	
	//Returns a JSONArray representation of accessible knowledge bases
	getMostViewedArticles:function(maxValue,displayField,secondaryFields,kb){
		try{
			return this._getMostViewedArticles(maxValue,displayField,secondaryFields,kb);
		}catch(e){
			return [];
		}
	},
	
	//Returns a JSONArray representation of accessible knowledge bases
	getMostUsefulArticles:function(maxValue,displayField,secondaryFields,kb){
		try{
			return this._getMostUsefulArticles(maxValue,displayField,secondaryFields,kb);
		}catch(e){
			return [];
		}
	},
	
	//Return attachment link for given article id
	getAttachmentLink:function(articleId){
		try{
			return this._getAttachmentLink(articleId);
		}catch(e){
			return "";
		}
	},
	
	isValidFacetField:function(table,field,maxVal){
		var gr = new GlideRecord(table);
		gr.setLimit(1);
		if(gr.isValidField(field)){
			gr.query();
			if(gr.next()){
				var fieldType =  gr.getElement(field).getED().getInternalType();
				if(fieldType == 'boolean' || fieldType == 'reference'){
					return true;
				}else if(fieldType == 'string' || fieldType == 'integer' || fieldType == 'workflow'){
					var fieldChoice = gr.getElement(field).getED().getChoice();
					if(fieldChoice == '1' || fieldChoice == '3' ||  gr.getElement(field).getED().getSqlLength() <= maxVal)
						return true;
				}
			}
		}
		return false;
	},
	
	isMobile: function() {
		return (GlideMobileExtensions.getDeviceType() == 'm' || GlideMobileExtensions.getDeviceType() == 'mobile');
	},
	
	/*
 	* Payload parameters: start, end, keyword, language, variables, order, secondary_fields, resource, attachment
 	*/
	
	getResultData:function(input){
		
		try{
			
			if(typeof(input) != 'object')
				input = new JSON().decode(input);
			
			var queryParams = {};
				queryParams.portal_request = true;
				queryParams.variables = input.variables ? input.variables : "";
				queryParams.freetext = input.keyword ? input.keyword+'' : "";
				queryParams.knowledge_fields = input.knowledge_fields ? input.knowledge_fields+'' : "";
				queryParams.social_fields = input.social_fields ? input.social_fields+'' : "";
				queryParams.kb_knowledge_encoded_query = input.kb_query || "";
				
				if(input.result_limit)
					queryParams.result_limit = input.result_limit || gs.getProperty('glide.knowman.content_block_limit') || 5;
				
				queryParams.searchParameters = {};
					queryParams.searchParameters.knowledgeBase = input.knowledge_base ? input.knowledge_base+"" : "";
					queryParams.searchParameters.language = input.language ? input.language+'' : this.LANGUAGE;
					queryParams.searchParameters.socialqa_encoded_query = input.social_query ? input.social_query :  "";
					queryParams.searchParameters.pinned_encoded_query = input.kb_query ? input.kb_query : "";
					
					var orderdata = [];
					
					if(input.order){
						orderdata = input.order.toString().split(',');
						
						queryParams.order = orderdata[0] || "";
						queryParams.order_desc = orderdata[1] || false;
					}
					
					var resource = [];
					if(input.resource){
						if(input.resource != 'Knowledge'){
							resource.push('social');
							
							if(input.resource == 'Accepted')
								queryParams.acceptedAnswersOnly = true;
							if(input.resource == 'Answered')
								queryParams.answeredQuestionsOnly = true;
							if(input.resource == 'Unanswered')
								queryParams.unansweredQuestionsOnly = true;
						}else{
							resource.push('knowledge');
						}
					}
					
					var payload = {
						meta	: {
							window	: {
								'start'	: input.start ? parseInt(input.start) : 0,
								'end'	: input.end ? parseInt(input.end) : 30
							},
							includePinnedArticles: true,
							applyFilter			 : true,
							searchWhenEmpty		 : false,
							queryForAttachments	 : input.attachment
						},
						context	: input.context ? input.context : '03ddb541c31121005655107698ba8f7f',
						entity	: input.entity || '',
						query	: queryParams ,
						resources : resource || [],
						debug	: false
					};
					
					return this._getResult(new JSON().encode(payload));
					
				}catch(e){
					return [];
				}
			},
			
			getAvailableLanguages:function(){
				try{
					if(gs.getProperty('glide.knowman.enable_multi_language_search','false') != 'true'){
						//Get laguages available in language choices in language field on user table
						var choiceList = new GlideChoiceList();
						var languages = [];
						var defaultLanguage = gs.getProperty('glide.knowman.search.default_language') || gs.getUser().getLanguage() || "en";
						var languageStr = "";

						if (new GlideRecord('kb_knowledge').isValidField('language')) {
							var clg = new GlideChoiceListGenerator('sys_user', 'preferred_language');
							clg.setCache(false);
							clg.setNone(false);
							clg.get(choiceList);
							choiceList.removeChoice('NULL_OVERRIDE');
						}
						if(choiceList){
							languageStr = choiceList.toString().replace('[','').replace(']','');
						}

						if(languageStr && languageStr != ""){
							var lanArry = languageStr.split(',');

							for(var i=0;i<lanArry.length;i++){
								var lang = lanArry[i].split(':');
								var obj = {};
								obj.label = lang[0].trim();
								obj.value = lang[1].trim();
								if(defaultLanguage.trim() == lang[1].trim())
									defaultLanguage = lang[0].trim();
								languages.push(obj);
							}
						}
						var result = {};
						result.languages = languages;
						result.default_language = defaultLanguage;
						return result;
					}
					return [];
				}catch(e){
					return [];
				}
			},
					
					canSubscribe:function(){
						
						if(gs.getSession().isLoggedIn() == false)
							return false;
						
						if (!GlidePluginManager().isActive('com.snc.knowledge_advanced'))
							return false;
						
						if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'false')
							return false;
						
						var roles = gs.getProperty('glide.knowman.enable_km_subscription.roles');
						if (roles != null && roles != '') {
							var hasRole = gs.hasRole(roles);
							if (hasRole == false)
								return false;
						}
						
						return true;
					},
					
					canCreateArticle: function() {
						if(gs.getSession().isLoggedIn() == false)
							return false;
						
						if(!new KBKnowledge().canCreate())
							return false;
						
						return true;
					},
					
					canPostQuestion: function() {
						
						if(gs.getSession().isLoggedIn() == false)
							return false;
						
						if (!GlidePluginManager().isActive('com.sn_kb_social_qa') && !GlidePluginManager().isActive('sn_kb_social_qa'))
							return false;
						
						//	if(!new KBKnowledgeSNC().canCreate())
						//		return false;
						
						if(!new GlobalKnowledgeUtil().canCreateNewQuestion())
							return false;
						
						return true;
					},
					
					_getResult: function(data){
						var json = new JSON();
						var searchRequest = new SNC.SearchRequest().fromJSON(data);
						return json.decode(searchRequest.submit().toJSON());
					},
					
					_getMyKnowledgeBases:function(order){
						var json = new JSON();
						var kbData = json.decode(new SNC.KnowledgeHelper().getUserKnowledgeBases(order));
						
						if(this.canSubscribe()){
							var subs = new ActivitySubscriptionContext();
							var subscribedKBs = subs.getSubscriptionService().getSubscriptionsBySubscriber(gs.getUserID(),"722d67c367003200d358bb2d07415a9c","true");
							
							kbData.forEach(function(f){
								if(subscribedKBs && subscribedKBs.subscriptions && subscribedKBs.subscriptions.toString().indexOf(f.sys_id+'') > -1)
									f.subscribed = true;
								else
									f.subscribed = false;
							});
						}
						
						return kbData;
					},
					
					_getKnowledgeSuggestions:function(key,lang){
						var json = new JSON();
						var kbData = json.decode(new SNC.KnowledgeHelper().getJSONAlternatePhrases(key,lang));
						return kbData;
					},
					
					_getFeaturedArticles:function(maxValue,displayField,secondaryFields,kb){
						var input = {};
							input.keyword = gs.getProperty("glide.knowman.default_keyword") || 'homepage';
							input.start = 0;
							input.end = maxValue || 30;
							input.result_limit = maxValue;
							if(secondaryFields)
								input.knowledge_fields = secondaryFields;
							
							if(displayField){
								input.knowledge_fields = input.knowledge_fields + "," + displayField;
							}
							input.attachment = false;
							input.entity = "pinnedArticles";
							input.context = "ac821f40bf003100216a85ce2c0739d2";
							if(kb)
								input.knowledge_base = kb || "";
							
							return this.getResultData(input);
						},
						
						_getMostViewedArticles:function(maxValue,displayField,secondaryFields,kb){
							return new JSON().decode(new SNC.KnowledgeHelper().getMostViewedArticles(maxValue+"",displayField+"",secondaryFields+"",kb+""));
						},
						
						_getMostUsefulArticles:function(maxValue,displayField,secondaryFields,kb){
							return new JSON().decode(new SNC.KnowledgeHelper().getMostUsefulArticles(maxValue+"",displayField+"",secondaryFields+"",kb+""));
						},
						
						_getAllFacets: function(keyword,language,variables,query,order){
							return new SNC.KnowledgeHelper().getAllFacets(keyword,language,variables,query,order);
						},
						
						_getFacetByName: function(name,value,keyword,language,variables,query,order){
							return new SNC.KnowledgeHelper().getFacetByName(name,value,keyword,language,variables,query,order);
						},
						
						_getAttachmentLink:function(articleId){
							return new SNC.KnowledgeHelper().getAttachmentLink(articleId);
						},
						
						//make sure we always get strings from the parameter map
						str:function(value) {
							if (value){
								if(typeof value === 'object')
									return new global.JSON().encode(value) + '';
								else
									return value+'';
							}
							return '';
						},
						
						type: 'KBPortalServiceImpl'
					};