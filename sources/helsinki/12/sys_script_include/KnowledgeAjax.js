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
		if (this.getParameter("sysparm_flag") == "true")
			fb.flagged = "true";
		fb.view_id = view_id;
		fb.useful="";
		fb.insert();
	},
	
	kbAttachArticle: function(value) {
		var id = value.split(',');
		var articleID = id[0];
		var taskID = id[1];
		
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
		
		gs.eventQueue("kb.use", article, article.getDisplayValue(), gs.getUserID());
		
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
				fb.insert();
			}
		}
	},
	
	type: "KnowledgeAjax"
});