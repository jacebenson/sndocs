(function() {
	if(input){
		var status = "failed";

		if(input.id && input.action){
			if(input.action == "subscribe"){
				subscribeKB(input.id);
				status ="success";
			}else if(input.action == "unsubscribe"){
				unSubscribeKB(input.id);
				status ="success";
			}
		}
		data.status = status;
	}else{
		options.order_by = options.order_by ? options.order_by : "title";
		options.order_reverse = options.order_reverse ? options.order_reverse == 'true': false;
		var isKnowledgeAdvancedInstalled = GlidePluginManager.isActive('com.snc.knowledge_advanced');
		if(isKnowledgeAdvancedInstalled && options.create_article_url && options.create_article_url.contains('kb_knowledge.do')){
			var activeTemplatesFound = new global.ArticleTemplateUtil().activeTemplatesFound();
			if(activeTemplatesFound){
				options.create_article_url = 'wizard_view.do?sysparm_wizardAction=sysverb_new&sysparm_parent=446e65e30b0003003c328ffe15673a81&sysparm_query=kb_knowledge.do&sys_target=kb';
			}
		}
		data.instanceid = $sp.getDisplayValue("sys_id");
		data.kb_label = gs.getMessage('knowledge base {0} having {1} articles');
		data.kb_label_qa = gs.getMessage('knowledge base {0} having {1} articles and {2} questions');

		var kbService = new KBPortalService();
		data.isMobile = kbService.isMobile();
		data.result = kbService.getMyKnowledgeBases(options.order_by);
		var kbCount = data.result.length;
		var articleCount = 0;
		var socailqaCount = 0;

		data.result.forEach(function(key){
			articleCount = articleCount + parseInt(key.article_count,10);
			socailqaCount = socailqaCount + parseInt(key.questions_count,10);

		});

		var canSuscribe = false;
		var canCreateArticle = false;
		var canPostQuestion = false;
		var kbService2 = new KBPortalService();
		canSuscribe = kbService2.canSubscribe();
		canCreateArticle = kbService2.canCreateArticle();
		canPostQuestion = kbService2.canPostQuestion();

		data.total_kb_count = kbCount;
		data.total_articles_count = articleCount;
		data.total_socialqa_count = socailqaCount;
		data.canSuscribe = canSuscribe;
		data.canCreateArticle = canCreateArticle;
		data.canPostQuestion = canPostQuestion;
	}

	function subscribeKB(kbID){
		var context = global.ActivitySubscriptionContext.getContext();
		context.getSubscriptionService().subscribe("722d67c367003200d358bb2d07415a9c",kbID);
	}

	function unSubscribeKB(kbID){
		var context = global.ActivitySubscriptionContext.getContext();
		context.getSubscriptionService().unsubscribe(kbID);
	}

})();