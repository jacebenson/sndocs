data.tsQueryId = $sp.getParameter("sysparm_tsqueryId") || "";
if(!input){
		var kbViewModel = new global.KBViewModel();
		populateParameters();
		
		kbViewModel.getInfoForSP(data.params);
		var isValidRecord = kbViewModel.isValid;
		data.knowledgeExists = kbViewModel.knowledgeExists;
		data.messages = {};
		data.langList = [];
		var tsQueryId = $sp.getParameter("sysparm_tsqueryId");
		var rank = $sp.getParameter("sysparm_rank");
		if(tsQueryId && rank && tsQueryId != ""){
			kbViewModel.updateTsQueryKbWithRank(tsQueryId,rank);
		}	
		if (isValidRecord) {
			var knowledgeRecord = kbViewModel.knowledgeRecord;
			
			populateDataFromKBViewModel();
			populateMessages();
			populateCommonProperties();
			populateBreadCrumbs();
			populateVersionInfo();
			handleViewCountIncrement();
			populateContributorInfo();
			
			if(data.articleType === 'wiki'){
				initGlideWiki();
			}

			data.sys_updated_on = "";
			if (kbViewModel.publishedRecord) {
				published = kbViewModel.publishedRecord.published;
				data.sys_updated_on = kbViewModel.publishedRecord.sys_updated_on + "";
			}

			data.shortDesc = knowledgeRecord.short_description + "";
			
			
			populateFeedback();
			populateSystemProperties();
			
			
			if(data.properties.showAffectedProducts === 'true' || data.properties.showAffectedProducts === true){
				populateAffectedProducts();
			}
			
			if(data.properties.showAttachedTasks === true || data.properties.showAttachedTasks === 'true'){
				populateAttachedTasks();
			}
			
			
		}
		else{
			data.messages.INSUFFICIENT_PREVILEGES = gs.getMessage("You do not have sufficient privileges to access this knowledge item");
			data.messages.RECORD_NOT_FOUND = gs.getMessage("Knowledge record not found");			
		}

}

if(input){
	if(input.action === 'saveFlagComment'){
		var kbAjax = new global.KBAjaxSNC();
		var params = {};
		params.sysparm_id = input.article_sys_id;
		params.feedback = input.comment;
		params.sysparm_flag = "true";
		params.ts_queryId = data.tsQueryId;
		kbAjax.kbWriteCommentWithParams(params);
		data.responseMessage = gs.getMessage("Article has been flagged");
	}
	if(input.action === 'subscribe'){
		var subResult = subscribeObject('Article', input.articleSysId, gs.getUserID());		
		if(subResult){
			data.responseMessage = gs.getMessage("You are now subscribed to {0}. You will be notified of any new comments or activity according to your notification settings.", input.articleNum);
		}
	}
	if(input.action === 'unsubscribe'){
		
		var subResult = false;
		if(input.unsubscribeKB){
			subResult = unsubscribeObject('KB', input.articleSysId, input.kbSysId);
			if(subResult === 'Article'){
				data.responseMessage = gs.getMessage("Your subscriptions to {0} Knowledge Base and {1} have been removed.", [input.kbName, input.articleNum]);
			}
			else{
				data.responseMessage = gs.getMessage("Your subscription to {0} Knowledge Base has been removed.", input.kbName);
			}
		}
		else{
			subResult = unsubscribeObject('Article', input.articleSysId, null);
			if(subResult){
				data.responseMessage = gs.getMessage("Your subscription to {0} has been removed.", input.articleNum);
			}	
		}
	}
}

function subscribeObject(type, sysId, userId){
		var kAjax = new global.KnowledgeAjax();
		return kAjax.subscribeKbArticle(sysId, "7d8f537453003200fa9bd7b08cc5872c");
}

function unsubscribeObject(type, articleSysId, kbSysId){
		var kAjax = new global.KnowledgeAjax();
		if(type === 'Article'){
			return kAjax.unsubscribeKbArticle(articleSysId);	
		}
		else{
			return kAjax.unsubscribeKB(articleSysId, kbSysId);
		}
}

function populateMessages(){
		data.messages.ARTICLE_FLAGGED = gs.getMessage("Article has been flagged");
		data.messages.FLAG_THIS_ARTICLE = gs.getMessage("Flag this article");
		data.messages.ADD_COMMENT = gs.getMessage("Add a comment");
		data.messages.NOT_RETIRED = gs.getMessage("Article not retired");
		data.messages.NOT_PUBLISHED = gs.getMessage("Article not published");
		data.messages.NOT_SAVED = gs.getMessage("Article not saved");
		data.messages.SAVED = gs.getMessage("Article saved");
		data.messages.HOME = gs.getMessage('Home');
		data.messages.DISCARDED = gs.getMessage("Article changes discarded");
		data.messages.SUBMITTED = gs.getMessage("Your article has been submitted");
		data.messages.PREVIEW = gs.getMessage(" Preview ");
		data.messages.PREVIEW_HINT = gs.getMessage("Preview changes");
		data.messages.DELETE = gs.getMessage("Delete");
		data.messages.CONFIRM_DELETE = gs.getMessage("Confirm deletion of this article?");
		data.messages.TITLE_CANCEL = gs.getMessage("Cancel changes");
		data.messages.MESSAGE_CANCEL = gs.getMessage("Discard all changes?");
		data.messages.TITLE_RETIRE = gs.getMessage("Retire");
		data.messages.MESSAGE_RETIRE = gs.getMessage("Retire this article?");
		// Status messages for the message bar.
		data.messages.DRAFT_MSG = gs.getMessage("This knowledge item has been created");
		data.messages.REVIEW_MSG = gs.getMessage("This knowledge item has been published");
		data.messages.PUBLISHED_MSG = gs.getMessage("This knowledge item has been published");
		data.messages.PEND_RETIRE_MSG = gs.getMessage("This knowledge item has been retired");
		data.messages.RETIRED_MSG = gs.getMessage("This knowledge item has been retired");
		data.messages.DELETE_FAIL_MSG = gs.getMessage("This article could not be deleted");
		data.messages.TXT_PLACEHOLDER = gs.getMessage("Add content");
		data.messages.LATEST_VERSION = gs.getMessage("Latest version");
		data.messages.SUBSCRIBE = gs.getMessage("Subscribe");
		data.messages.UNSUBSCRIBE = gs.getMessage("Unsubscribe");
		data.messages.COPY_PERMALINK = gs.getMessage("Copy Permalink");
		data.messages.SUBMIT = gs.getMessage('Submit');
		data.messages.COMMENTS = gs.getMessage('Comments');
		data.messages.AFFECTED_PRODUCTS = gs.getMessage('Affected Products');
		data.messages.OUTDATED = gs.getMessage('Outdated');
		data.messages.KNOWLEDGE_BASE = gs.getMessage('Knowledge Base');
		data.messages.KNOWLEDGE = gs.getMessage('Knowledge');
		data.messages.ATTACHED_INCIDENTS = gs.getMessage("Most recent tasks");
		data.messages.THANK_YOU = gs.getMessage("Thank you");
		data.messages.RATE_LIMIT_REACHED = gs.getMessage("You have reached the daily limit for comments posted by a user.");
		data.messages.NO_ATTACHMENTS = gs.getMessage("No attachments found");
		data.messages.NO_INCIDENTS = gs.getMessage("No tasks found");
		data.messages.NO_PRODUCTS = gs.getMessage("No affected products found");
		data.messages.EDIT = gs.getMessage("Edit");
		data.messages.ATTACHMENTS = gs.getMessage('Attachments');
		data.messages.HELPFUL = gs.getMessage('Helpful?');
		data.messages.CREATE_INCIDENT = gs.getMessage("Create Incident");
		data.messages.FLAG_ARTICLE = gs.getMessage("Flag Article");
		data.messages.PERMALINK_COPIED = gs.getMessage("Permalink copied successfully");
		data.messages.SUBSCRIPTION_CONFIRMATION = gs.getMessage("You are now subscribed to {0}. You will be notified of any new comments or activity according to your notification settings", data.number);
		data.messages.SUBSCRIBED = gs.getMessage("Subscribed");
		data.messages.YES = gs.getMessage("Yes");
		data.messages.NO = gs.getMessage("No");
		data.messages.UNSUBSCRIBE_CONTENT = gs.getMessage("In order to unsubsrcibe from this article, you will need to unsubscribe from the parent knowledge base: {0}. ", data.kbName);	
		data.messages.UNSUBSCRIBE_CONFIRMATION = gs.getMessage("Would you like to unsubscribe from {0}", data.kbName);	
		data.messages.CANCEL = gs.getMessage("Cancel");
		data.messages.ACTION_MENU = gs.getMessage("Action Menu. Please click for available actions on the article");
		data.messages.CLOSE = gs.getMessage("Close");
		data.messages.JUST_NOW = gs.getMessage("just now");
		data.messages.ARTICLE_RATING = gs.getMessage("Average article rating - {0} stars", data.avgRating);
		data.messages.EXTERNAL_CONTENT = gs.getMessage(gs.getProperty("sn_km_intg.glide.knowman.external.ui_label_for_external_content", "External Content"));

}

function populateParameters(){
		data.params = {};
		data.params.sysparm_article = $sp.getParameter('sysparm_article');
		data.params.sysparm_language = $sp.getParameter('sysparm_language');
		data.params.sys_kb_id = $sp.getParameter('sys_kb_id');
		data.params.sysparm_no_update = $sp.getParameter('sysparm_no_update');
		data.params.sysparm_no_suggest = $sp.getParameter('sysparm_no_suggest');
		data.params.sysparm_no_info = $sp.getParameter('sysparm_no_info');	
		data.params.sysparm_no_create_incident = $sp.getParameter('sysparm_no_create_incident');
		data.params.sysparm_ts_queryId = $sp.getParameter('sysparm_tsqueryId');
}

function populateSystemProperties(){
	data.properties = {};
	data.properties.showStarRating = getProperty("glide.knowman.show_star_rating", "show_star_rating", true, true);	
	data.properties.showRatingOptions = getProperty("glide.knowman.show_rating_options", "show_rating_options", true, true);	
	data.properties.showYesNoRatings = getProperty("glide.knowman.show_yn_rating", "show_yn_rating", true, true);	
	
	//data.properties.showFlagArticle = getProperty("glide.knowman.show_flag", "show_flag", true, true);	
	//data.properties.showFlagArticle = data.properties.showFlagArticle && !params.sysparm_no_suggest && !knowledgeRecord.disable_suggesting;

	data.properties.showUserComments = getProperty("glide.knowman.show_user_feedback", "show_user_feedback", 'onload');	
	data.properties.showAffectedProducts = gs.getProperty('glide.knowman.affected_products.display','true');
	data.properties.showAttachedTasks = gs.getProperty('glide.knowman.recent_tasks.display','true');
	if(data.properties.showAttachedTasks === 'true'){
		data.properties.showAttachedTasks = gs.hasRole('itil') || gs.hasRole('knowledge');
	}
	data.properties.showCreateIncident = !kbViewModel.isInPopup && !data.params.sysparm_no_create_incident;
	data.properties.createIncidentURL = getProperty('glide.knowman.create_incident_link', 'create_incident_link', '', false);
	data.properties.isSubscriptionEnabled = kbViewModel.isSubscriptionEnabled;
	
	
	data.properties.isEditable = kbViewModel.isEditable;
	data.properties.showFeedBack = kbViewModel.showKBFeedback;
	data.properties.showKBRatingOptions =	kbViewModel.showKBRatingOptions;
	
	data.properties.showKBHelpfullRating =	kbViewModel.showKBHelpfullRating;
	data.properties.showKBStarRating = kbViewModel.showKBStarRating;
	
	data.properties.showKBCreateIncident =	kbViewModel.showKBCreateIncident;// && !kbViewModel.isInPopup && !params.sysparm_no_create_incident;
	data.properties.showKBFlagArticle = kbViewModel.showKBFlagArticle && !data.params.sysparm_no_suggest && !knowledgeRecord.disable_suggesting;
	data.properties.showKBUpdateAction =	kbViewModel.showKBUpdateAction;

}
function getProperty(propertyName, optionName, defaultValue, checkRoles){
	var optionVal = options[optionName];
	if(!optionVal || optionVal === 'use_system' || !(optionVal === 'yes' || optionVal === 'no') ){
		var propValue = gs.getProperty(propertyName, defaultValue);
		if(propValue && checkRoles){
			var roles = gs.getProperty(propertyName + '.roles');
			if (roles != null && roles != ''){
				propValue = gs.hasRole(roles);
			}	
		}
		return propValue;
	}
	else {
		return optionVal === 'yes' ? true : false;
	}
}

function populateCommonProperties(){
	data.isMobileView = ($sp.getParameter('sysparm_device') != "" && $sp.getParameter('sysparm_device') == "mobile");
	data.isKBLanguagesNewUI = GlidePluginManager.isActive('com.glideapp.knowledge.i18n2');
	data.portalName = $sp.getPortalRecord().getValue('url_suffix');
	if(!data.portalName || data.portalName === ''){
		data.portalName = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url', 'kb');
	}
	if(data.isKBLanguagesNewUI){
		data.langList = kbViewModel.getLanguagesToDisplay(knowledgeRecord);
	}
}

function populateDataFromKBViewModel(){
			data.isValid = true;
			data.isLoggedInUser = gs.getSession().isLoggedIn();
			data.canContributeToKnowledge = kbViewModel.canContributeToKnowledgeBase; //canContributeHelper.canContribute(kbViewModel.knowledgeRecord);
			data.article_sys_id = knowledgeRecord.sys_id + '';	
			data.authorTitle = kbViewModel.authorTitle || kbViewModel.getAuthorInfo("author.title");
			if(knowledgeRecord.sys_class_name == 'kb_knowledge'){
			data.kbText = knowledgeRecord.getValue('text') ;
			}
			else{
				data.kbText = kbViewModel.getArticleTemplateContent() + '';
			}
			data.avgRating = Math.round(knowledgeRecord.rating);
			data.number = knowledgeRecord.number + '';
			data.articleType = knowledgeRecord.article_type + '';
			data.permalink = kbViewModel.permalink;
			data.category = knowledgeRecord.category;
			data.attachments = kbViewModel.attachments;
			data.shortDesc = knowledgeRecord.short_description + "";
			data.viewCount = knowledgeRecord.getDisplayValue('sys_view_count');
			data.displayAttachments = knowledgeRecord.display_attachments + '';
			data.tableName = knowledgeRecord.sys_class_name + '';
			data.disableSuggesting = knowledgeRecord.disable_suggesting;
			data.revisionString = kbViewModel.revisionString;
			data.articleTemplate = kbViewModel.articleTemplateName;
			data.isSubscriptionEnabled = kbViewModel.isSubscriptionEnabled;
			data.helpfulContent = kbViewModel.helpfulText;
			if(data.isSubscriptionEnabled === true){
				data.isArticleSubscribed = (new global.ActivitySubscriptionContext().getSubscriptionService().isSubscribed(knowledgeRecord.sys_id).subscriptionId) ? true : false;//kbViewModel.isArticleSubscribed;
				data.isArticleSubscribedAtKB = (new global.ActivitySubscriptionContext().getSubscriptionService().isSubscribed(knowledgeRecord.kb_knowledge_base).subscriptionId) ? true : false;//kbViewModel.isArticleSubsrcibedAtKB;
			}
			else{
				data.isArticleSubscribed = false;
				data.isArticleSubscribedAtKB = false;
			}

			data.kbSysId = knowledgeRecord.kb_knowledge_base.sys_id + '';
			data.kbName = knowledgeRecord.kb_knowledge_base.getDisplayValue() + '';
			data.externalArticle = kbViewModel.externalArticle;
}

function populateBreadCrumbs(){
	var breadCrumb = kbViewModel.getBreadcrumb();
	data.breadCrumb = [];
	data.breadCrumb.push({label: knowledgeRecord.kb_knowledge_base.title + ' (' + data.messages.KNOWLEDGE_BASE + ')', url: data.portalName + '?id=kb_search&kb_knowledge_base=' + knowledgeRecord.kb_knowledge_base.sys_id});
	var ctg = '';
	for(var i = 0; i < breadCrumb.length; i++){
		ctg += breadCrumb[i].name;
		if(i != breadCrumb.length - 1){
			ctg += ' - ';
		}
	}
	if(ctg !== '' && breadCrumb && breadCrumb.length > 0){
		data.breadCrumb.push({label: ctg + '', url: data.portalName + '?id=kb_search&kb_knowledge_base=' + breadCrumb[breadCrumb.length - 1].knowledge_base + '&kb_category=' + breadCrumb[breadCrumb.length - 1].value });
	}
}

function handleViewCountIncrement(){
	knowledgeRecord.incrementViewCount();
	var viewCountGR = new GlideRecord('kb_knowledge');
	if(viewCountGR.get(knowledgeRecord.sys_id))
		data.viewCount = viewCountGR.getValue('sys_view_count');

}

function initGlideWiki(){
	try{
		data.kbWiki = kbViewModel.getWikiContent();		
	}
	catch(e){
		data.kbWiki = '';
	}
}

function populateAttachedTasks(){
	data.attachedIncidents = [];	
	data.attachedIncidents = kbViewModel.getAttachedTasks();
}

function populateAffectedProducts(){
	data.affectedProducts = [];
	data.affectedProducts = kbViewModel.getAffectedProducts();
}

function populateVersionInfo(){
	data.isVersioningEnabled = kbViewModel.versioningInfo.isEnabled;
	data.versionList = kbViewModel.versioningInfo.history;
	data.version = knowledgeRecord.getDisplayValue('version');
	data.isLatestVersion = !(kbViewModel.versioningInfo.newVersionAvailable === true); 
	data.workflowState = (knowledgeRecord.workflow_state != 'published') ? ('(' + knowledgeRecord.workflow_state.getDisplayValue() + ')') : ''; 
	data.versionInfo = kbViewModel.versioningInfo.versionDisplay;//((kbViewModel.versioningInfo.newVersionAvailable === true) ? 'v' + data.version  : data.messages.LATEST_VERSION);
	data.showHistory = kbViewModel.versioningInfo.showHistory;
	data.hideFeedbackOptions = kbViewModel.hideFeedbackOptions;
	data.versionWarningMessage = kbViewModel.versioningInfo.warningMessage;
	if(data.versionWarningMessage){
		data.versionWarningMessage = data.versionWarningMessage.replace('kb_view.do?', data.portalName + '?id=kb_article_view&');
	}
}
function populateFeedback(){
	var feedbackRecords = kbViewModel.feedbackRecord;
	data.comments = [];
	while(kbViewModel.feedbackRecord.next()){
		var user = kbViewModel.feedbackRecord.user.getDisplayValue();
		var createdTime = kbViewModel.feedbackRecord.getValue('sys_created_on');
		var comment = kbViewModel.getFeedbackComment(kbViewModel.feedbackRecord);
		data.comments.push({'userName' : user, 'createdOn' : createdTime, 'commentText' : comment});
	}
}

function populateContributorInfo(){
	if(!GlidePluginManager.isActive('com.sn_communities')) return;
	if(sn_communities.CommunityKnowledgeHarvest){
		var h = new sn_communities.CommunityKnowledgeHarvest();
		var res = h.getHarvestedContentInfo(''+knowledgeRecord.sys_id);
		if(res && res.status == 200){
			data.hInfo = res.data;
			if(data.hInfo){
				var message = gs.getMessage("Created from the Community by {0}");
				var contributor = data.hInfo.contributor;
				var profile = gs.getMessage('Community user');
				if(contributor){
					profile = contributor.name.length > 0 ? contributor.name : profile;
					if(contributor.userId)
						profile = '<a href="?id=community_user_profile&user='+contributor.userId+'" target="_blank_cm1" >'+profile+'</a>';
				}
				message = message.replace('{0}', profile);
				data.hInfo.profileMessage = message;
			}
		}
	}
}
