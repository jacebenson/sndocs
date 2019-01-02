var KnowledgeAjax = Class.create();

KnowledgeAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	/**
 	* Prevent public access to this script
 	*/
	isPublic: function() {
		return false;
	},
	
	process: function() {
		if (type == "kbWriteComment")
			this.kbWriteComment();
		else if (type == "kbGetText")
			this.kbGetText(value);
		else if (type == "kbAttachArticle")
			this.kbAttachArticle(value);
		else if(type == 'subscribeKbArticle') {
			var sub_obj_id = this.getParameter("sysparm_article_id");
			var subs_obj_type_id = this.getParameter("sysparm_subs_obj_type_id");
			this.subscribeKbArticle(sub_obj_id,subs_obj_type_id);
		}
		else if(type == 'unsubscribeKbArticle') {
			var sub_obj_id = this.getParameter("sysparm_article_id");
			this.unsubscribeKbArticle(sub_obj_id);
		}
		else if(type == 'unsubscribeKB') {
			var sub_obj_id = this.getParameter("sysparm_article_id");
			var sub_obj_kb_id = this.getParameter("sysparm_kb_id"); 
			return this.unsubscribeKB(sub_obj_id,sub_obj_kb_id);
		}
	},
	
	unsubscribeUnpublishedArticle: function(sub_obj_id) {
		var gr = new GlideRecord('kb_knowledge');
		gr.get(sub_obj_id);
		if(gr.article_id.nil())
			return;
		
		var gr1 = new GlideRecord('kb_knowledge');
		gr1.addQuery('article_id',gr.article_id);
		gr1.addQuery('workflow_state','!=','published');
		gr1.addQuery('latest',true);
		gr1.query();
		if(gr1.next()) {
			if(new ActivitySubscriptionContext().getSubscriptionService().isSubscribed(gr1.sys_id).subscriptionId) {
				new ActivitySubscriptionContext().getSubscriptionService().unsubscribe(gr1.sys_id);
			}
		}
	},
	
	subscribeKbArticle: function(sub_obj_id,subs_obj_type_id) {
		return new ActivitySubscriptionContext().getSubscriptionService().subscribe(subs_obj_type_id,sub_obj_id);
	},
	
	unsubscribeKbArticle: function(sub_obj_id) {
		this.unsubscribeUnpublishedArticle(sub_obj_id);
		return new ActivitySubscriptionContext().getSubscriptionService().unsubscribe(sub_obj_id);
	},
	
	unsubscribeKB: function(sub_obj_id,sub_obj_kb_id) {
		new ActivitySubscriptionContext().getSubscriptionService().unsubscribe(sub_obj_kb_id);
		if(new ActivitySubscriptionContext().getSubscriptionService().isSubscribed(sub_obj_id).subscriptionId) {
			this.unsubscribeUnpublishedArticle(sub_obj_id);
			new ActivitySubscriptionContext().getSubscriptionService().unsubscribe(sub_obj_id);
			return "Article";
		}
		return "Knowledge Base";
	},
	
	kbWriteComment: function() {
		var feedback = unescape(this.getParameter("sysparm_feedback"));
		var view_id = this.getParameter("view_id");
		var fb = new GlideRecord('kb_feedback');
		if(view_id && view_id != "") {
			fb.addQuery("view_id",view_id);
			fb.query();
			if (!fb.next()) 
				view_id = gs.generateGUID();
		} else {
			view_id = gs.generateGUID();
		}
		fb.article = this.getParameter("sysparm_id");
		fb.user.setValue(gs.getUserID());
		fb.comments = feedback;
		fb.query = unescape(this.getParameter("sysparm_search"));
		fb.search_id = this.getParameter("ts_queryId") || "";
		if (this.getParameter("sysparm_flag") == "true")
			fb.flagged = "true";
		fb.view_id = view_id;
		fb.session_id = gs.getSessionID();
		fb.useful="";
		fb.insert();
	},
	
	kbAttachArticle: function(value,docUrl) {
		var id = value.split(',');
		var articleID = id[0];
		var taskID = id[1];
		var tsQueryId = "";
		var rankId = "";
		if(docUrl && !gs.nil(docUrl)){
			var url = new GlideURL(docUrl);
			tsQueryId = url.get('sysparm_tsqueryId');
			rankId = url.get('sysparm_rank');
			if(tsQueryId && rankId && tsQueryId!=null && !gs.nil(tsQueryId)){
				var tsQueryKb = new GlideRecord('ts_query_kb');
				tsQueryKb.get(tsQueryId);
				var prevRank = tsQueryKb.top_click_rank;
				if(prevRank!=null && !gs.nil(prevRank)){
					try{
						if(parseInt(prevRank)>parseInt(rankId)){
							tsQueryKb.top_click_rank =rankId;
							tsQueryKb.update();
						}
					}catch(err){
						gs.log(err.message);
					}
				}else{
					tsQueryKb.top_click_rank = rankId;
					tsQueryKb.update();
				}
			}
		}
		var kbTask = new GlideRecord('m2m_kb_task');
		kbTask.addQuery("kb_knowledge",articleID);
		kbTask.addQuery("task",taskID);
		kbTask.query();
		if (!kbTask.next()) {
			kbTask.initialize();
			kbTask.kb_knowledge = articleID;
			kbTask.task = taskID;
			kbTask.insert();
		}
		
		var article = new GlideRecord('kb_knowledge');
		if (!article.get(articleID))
			return;
		var paramObj = {};
		paramObj["glideSessionId"] = gs.getSessionID();
		paramObj["displayVal"] = article.getDisplayValue();
		paramObj["isFromSearchView"] = true;
		paramObj["ts_query_id"]= tsQueryId;
		
		gs.eventQueue("kb.use", article,JSON.stringify(paramObj), gs.getUserID());
		
		var s = "Knowledge article " + article.number + ":\n";
		if (gs.getProperty("glide.ui.security.allow_codetag", "true") != "true")
			s += article.short_description;
		else {
			var displayValue = new KnowledgeHelp(article).findDisplayValue();
			s += "[code]" + displayValue + "[/code]";
		}
		
		var item = this.newItem();
		item.setAttribute("name", "text");
		item.setAttribute("value", s);
		
	},
	
	kbGetText: function(value) {
		var articleID = this.getParameter("article_id");
		var rating = this.getParameter("used");
		var view_id = this.getParameter("view_id");
		if(gs.getProperty('glide.knowman.log_ratings','true') == 'true'){
			var fb = new GlideRecord('kb_feedback');
			fb.addQuery("view_id",view_id);
			fb.query();
			if (fb.next()) {
				if (rating == 'yes' || rating == 'no')
					fb.useful = rating;
				else {
					rating = Math.round(rating);
					fb.rating = rating;
				}
				fb.update();
			} else {
				fb.initialize();
				fb.article = articleID;
				fb.user = gs.getUserID();
				if (rating == 'yes' || rating == 'no')
					fb.useful = rating;
				else {
					rating = Math.round(rating);
					fb.rating = rating;
				}
				fb.view_id = view_id;
				fb.query = unescape(this.getParameter("sysparm_search"));
				fb.session_id = gs.getSessionID();
				fb.insert();
			}
		}
	},
	
	type: "KnowledgeAjax"
});