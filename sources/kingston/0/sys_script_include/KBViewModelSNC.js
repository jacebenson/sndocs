var KBViewModelSNC = Class.create();

KBViewModelSNC.prototype = Object.extendsObject(KBCommon, {
	// Table name constants
	publishedTable: "kb_knowledge",
	tableNames: ["kb_knowledge", "kb_knowledge_base"],
	knowledgeTables: ["kb_knowledge"],
	// GlideRecords to be used on the page
	knowledgeRecord: null, // Record to be displayed on the page
	publishedRecord: null, // Published kb_knowledge record associated with the knowledge item
	feedbackRecord: null, // Feedback based on the knowledge item
	// Utility script includes
	kbKnowledgeSI: new KBKnowledge(),
	// Record attributes
	recordId: null,
	knowledgeBaseVersion: null,
	tableName: null,
	// Type of record on display
	isNewRecord: null,
	isLegacyArticle: null,
	// Visibility of view elements
	showKBMenu: false,
	showKBFeedback: false,
	showKBRatingOptions: false,
	showKBHelpfullRating: false,
	showKBStarRating: false,
	showKBCreateIncident: false,
	showKBFlagArticle: false,
	isSubscriptionEnabled: false,
	isArticleSubscribed: false,
	isArticleSubscribedAtKB: false,
	showKBUpdateAction: false,
	// Feedback
	feedbackInitialDisplay: false,
	feedbackEntryInitialDisplay: false,
	starRatingValue: 0,
	// View
	isInPopup: false,
	isPrint: false,
	isLiveFeedEnabled: false,
	// Blog style
	bannerImage: "",
	authorImage: "",
	authorName: "",
	authorCompany: "",
	authorDepartment: "",
	authorTitle: "",
	relatedContent: [],
	// Templates
	articleTitleTemplate: "",
	articleTemplate: "",
	// Security
	canContributeToKnowledgeBase: false,
	canCreateNew: false,
	// State of the knowledge item
	knowledgeExists: false,
	// Meta data
	permalink: "",
	attachments: [],
	dirtyFormMessage: null,
	//subscription
	isKASubscribed : false,
	isKBSubscribed : false,
	//Service Portal related properties
	isInvokedFromSP : false,
	servicePortalViewPageUrlPrefix : null,
	
	hideFeedbackOptions : false,
	helpfulText : '',
	articleTemplateName : '',
	externalArticle : false,

	// Get information by sys_id for a kb_knowledge(supplied by the URL)
	getInfo: function () {
		this.findKnowledgeByURL(jelly);
		if (this.isValid)
			return this;
		else
			return null;
	},
	// New method for invocation from service portal article view page
	getInfoForSP: function (params) {
		this.isInvokedFromSP = true;
		this.servicePortalViewPageUrlPrefix = params.sp_view_url_prefix ? params.sp_view_url_prefix : 'kb?id=kb_article_view&sys_kb_id=';
		this.findKnowledgeByURL(params);
	
		if (this.isValid)
			return this;
		else
			return null;
	},
	// Get information by sys_id for a kb_knowledge (directly injected)
	getInfoById: function (recordId) {
		this.findKnowledgeById(recordId);
		if (this.isValid)
			return this;
		else
			return null;
	},

	// Get information by number (KB) for a kb_knowledge (directly injected)
	getInfoByArticle: function (itemNumber) {
		this.findKnowledgeByNumber(itemNumber);
		if (this.isValid)
			return this;
		else
			return null;
	},

	// Get information for a sys_id by language for a kb_knowledge (directly injected)
	getInfoForLanguage: function (recordId, language) {
		this.findKnowledgeForLanguage(recordId, language);
		if (this.isValid)
			return this;
		else
			return null;
	},

	getKnowledgeRecord: function (query, value, stopWorkflow) {
		var knowledgeExists = false;
		var isValid = false;
		var record = null;
		for (var i = 0; i < this.tableNames.length; ++i) {
			record = new GlideRecord(this.tableNames[i]);
			knowledgeExists = true;

			// Need to turn off workflow in order to override the Before query
			// BR that should normally restrict querying for articles in other languages
			if (stopWorkflow)
				record.setWorkflow(false);

			if (!this._get(record, query, value))
				knowledgeExists = false;

			if (knowledgeExists)
				break;
		}

		isValid = knowledgeExists ? record.canRead() : false;
		if(isValid){
			var state = record.workflow_state;
			if(state=="retired"){
				if(!gs.hasRole("knowledge_admin")){
					isValid = false;
				}
			}
		}
		
		return {knowledgeExists: knowledgeExists, isValid: isValid, record: record};
	},

	// Find a knowledge item from the URL
	findKnowledgeByURL: function (jelly) {
		var isValid = false;
		for (var index = 0; index < this.tableNames.length; ++index) {
			var record = new GlideRecordSecure(this.tableNames[index]);
			isValid = true;
			if (!gs.nil(jelly.sysparm_article)) {
				if(this.isVersioningEnabled()){
					if (gs.nil(jelly.sysparm_version))
						this.findLatestVersion(jelly.sysparm_article);
					else
						this.findKnowledgeByVersion(jelly.sysparm_article,jelly.sysparm_version);
				}
				else
					this.findKnowledgeByNumber(jelly.sysparm_article + "");
			} else if (!gs.nil(jelly.sysparm_language)) {
				this.findKnowledgeForLanguage(jelly.sys_kb_id + "", jelly.sysparm_language + "");
			} else {
				this.findKnowledgeById(jelly.sys_kb_id + "");
			}

			// Check if we're in a popup
			if (!gs.nil(jelly.sysparm_nameofstack) && jelly.sysparm_nameofstack == 'kbpop')
				this.isInPopup = true;
			else
				this.isInPopup = false;

			if (!gs.nil(jelly.sysparm_media) && jelly.sysparm_media == 'print')
				this.isPrint = true;
			else
				this.isPrint = false;
		}

		if (this.isValid && (!this.isLegacyArticle || this.isInvokedFromSP))
			this._logPageView(jelly.sysparm_ts_queryId);
	},
	
	findKnowledgeByVersion: function(articleNumber,version){
		var record = new KBVersioning().getArticleVersion(articleNumber,version);
		this.isValid = record?true:false;
		if(record)
			this._initializeKnowledge(record);
	},
	
	findLatestVersion: function(articleNumber){
		var record = new KBVersioning().getLatestAccessibleVersion(articleNumber);
		this.isValid = record?true:false;
		if(record)
			this._initializeKnowledge(record);
		
		else
			//// In case if there are non versioned articles
			this.findKnowledgeByNumber(articleNumber);
	},
	
	// Find a knowledge item by sys_id
	findKnowledgeById: function (recordId) {
		var result;
		if(this.isVersioningInstalled() && !this.isVersioningEnabled()){
			//All old versions accessed with sys_id will be visible in view pages if versioning is disabled after installing.
			result = this.getKnowledgeRecord("sys_id", recordId, true);
			if(result.isValid && new KBVersioning().isLatestVersion(result.record)){
				//If it's a latest version, we need to make sure other business rules allow access.
				this.getKnowledgeRecord("sys_id", recordId, false);
			}
		}
		else { 
			result = this.getKnowledgeRecord("sys_id", recordId, false);
		}
		this.knowledgeExists = result.knowledgeExists;
		this.isValid = result.isValid;
		this._initializeKnowledge(result.record);
	},

	// Find a knowledge item by item number
	findKnowledgeByNumber: function (itemNumber) {
		var result = this.getKnowledgeRecord("number", itemNumber, false);
		this.knowledgeExists = result.knowledgeExists;
		this.isValid = result.isValid;
		this._initializeKnowledge(result.record);
	},

	// Find a knowledge item by item number when using languages
	findKnowledgeForLanguage: function (recordId, language) {
		var result = this.getKnowledgeRecord("sys_id", recordId, true);
		this.knowledgeExists = result.knowledgeExists;
		this.isValid = result.isValid;
		this._initializeKnowledge(result.record);
	},

	// Can show the KB Menu (ratings etc)
	canShowKBMenu: function () {
		var showMenu = gs.getProperty('glide.knowman.show_kb_menu', 'true');
		if (!showMenu)
			return false;

		var roles = gs.getProperty('glide.knowman.show_kb_menu.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the rating options
	canShowKBFeedback: function () {
		var showFeedback = gs.getProperty('glide.knowman.show_user_feedback');
		showFeedback = showFeedback.toLowerCase();

		if (showFeedback === 'never' || this.knowledgeRecord.disable_commenting)
			return false;

		var roles = gs.getProperty('glide.knowman.show_user_feedback.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the rating options
	canShowKBRatingOptions: function () {
		var showRatingOptions = gs.getProperty('glide.knowman.show_rating_options', 'true');
		if (!showRatingOptions || showRatingOptions === 'false')
			return false;

		var roles = gs.getProperty('glide.knowman.show_rating_options.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the 'Helpful Yes / No'
	canShowKBHelpfullRating: function () {
		if (this.isNewRecord)
			return false;

		if (this.isPrint || !this.canShowKBMenu() || !this.canShowKBRatingOptions())
			return false;

		var showYesNoRating = gs.getProperty('glide.knowman.show_yn_rating', 'true');
		if (!showYesNoRating)
			return false;

		var roles = gs.getProperty('glide.knowman.show_yn_rating.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the star ratings
	canShowKBStarRating: function () {
		if (this.isPrint || !this.canShowKBMenu() || !this.canShowKBRatingOptions())
			return false;

		var showKBStarRating = this._knowledgeHelper.getBooleanProperty(this.knowledgeRecord, 'glide.knowman.show_star_rating', true);
		if (!showKBStarRating)
			return false;

		var roles = gs.getProperty('glide.knowman.show_star_rating.roles');
		if (!(roles == null || roles == '')) {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the Create Incident Link
	canShowKBCreateIncident: function () {
		if (this.isNewRecord)
			return false;

		if (this.isInPopup || this.isPrint || !this.canShowKBMenu())
			return false;

		var showCreateIncident = gs.getProperty('glide.knowman.create_incident_link.display', 'false');
		if (!showCreateIncident || showCreateIncident == 'false')
			return false;

		var roles = gs.getProperty('glide.knowman.create_incident_link.display.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},

	// Can show the Flag Article functionality
	canShowKBFlagArticle: function () {
		if (this.isNewArticle)
			return false;

		if (this.isPrint || !this.canShowKBMenu() || !this.canShowKBRatingOptions())
			return false;

		var showFlagArticle = gs.getProperty('glide.knowman.show_flag', 'true');
		if (!showFlagArticle)
			return false;

		var roles = gs.getProperty('glide.knowman.show_flag.roles');
		if (roles != null && roles != '') {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				return false;
		}
		return true;
	},
	
	canshowKBSubscribeArticle: function() {
			if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'false')
				return false;
				
			if(gs.getSession().isLoggedIn() == false)
				return false;	
		
			var roles = gs.getProperty('glide.knowman.enable_km_subscription.roles');
			if (roles != null && roles != '') {
				var hasRole = gs.hasRole(roles);
				if (hasRole == false)
					return false;
			}
				
			var workflow_states = gs.getProperty('glide.knowman.enable_km_subscription.workflow_state');
			if(workflow_states !=null && workflow_states != '') {
					var state = this.knowledgeRecord.getValue('workflow_state');
					if(new ArrayUtil().indexOf(workflow_states.split(','),state) == -1)
						return false;
			}
		
			return true;
	},
	
	subscribedAtArticle: function() {
		return new ActivitySubscriptionContext().getSubscriptionService().isSubscribed(this.knowledgeRecord.sys_id).subscriptionId ? true : false;
	},
	
	subscribedAtKB: function() {
		return new ActivitySubscriptionContext().getSubscriptionService().isSubscribed(this.knowledgeRecord.kb_knowledge_base).subscriptionId ? true : false;
	},
	
	canShowKBUpdateAction: function () {
		if (this.isPrint || !this.canContributeToKnowledgeBase)
			return false;

		return true;
	},

	getPermalink: function (number) {
		return (gs.getProperty("glide.servlet.uri") + "kb_view.do?sysparm_article=" + number);
	},

	// get the modified comments for a given kb_feedback record
	getFeedbackComment: function (feedbackRecord) {
		var text = feedbackRecord.comments + '';
		text = text.replace(/\n/g, "INSERTNEWLINE");
		text = GlideStringUtil.escapeHTML(text) + '';
		text = text.replace(/INSERTNEWLINE/g, "<br/>");
		return text;
	},

	// find and return the feedback records into attribute
	getKBFeedbackRating: function () {
		var count = new GlideAggregate('kb_feedback');
		count.addQuery('article', this.knowledgeRecord.sys_id);
		count.addQuery('rating', '!=', '');
		count.addAggregate('COUNT');
		count.query();
		var ratings = 0;
		if (count.next())
			ratings = count.getAggregate('COUNT');
		return ratings;
	},

	getAttachments: function () {
		var tableUtils = new TableUtils(this.tableName);
		var tn = tableUtils.getAllExtensions();
		var att = new GlideRecordSecure("sys_attachment");
		att.addQuery("table_name", tn);
		att.addQuery("table_sys_id", this.knowledgeRecord.sys_id);
		att.query();
		var attachments = [];
		while (att.next())
			attachments.push({sys_id: att.sys_id + "", file_name: att.file_name + ""});
		return attachments;
	},

	getCurrentUserName: function () {
		return gs.getUser().getDisplayName();
	},

	getCurrentUserImage: function (userSysId) {
		// Use provided user id (Else use active user's id)
		var userId = userSysId || gs.getUserID();
		var profile = new LiveFeedProfile(new GlideappLiveProfile().getID(userId)).getDetails();
		return profile.user_image;
	},

	getAuthorImage: function () {
		if(this.isVersioningEnabled() && !this.knowledgeRecord.revised_by.nil())
			return this.getCurrentUserImage(this.knowledgeRecord.revised_by.sys_id);
		if(this.knowledgeRecord.author)
			return this.getCurrentUserImage(this.knowledgeRecord.author.sys_id);
		else
			return "";  
	},

	getAuthorInfo: function (fieldName) {
		return this._getDotField(this.knowledgeRecord, fieldName) + "";
	},

	getBannerImage: function () {
		// Default: Return url of thumbnail of banner image for this record
		//#TODO get banner image
		var bannerImage = "";
		return bannerImage;
	},

	getCurrentRelatedContent: function () {
		// Case1: The current record is not associated with a knowledge base
		var kbId = this._getDotField(this.knowledgeRecord, "kb_knowledge_base.sys_id") + "";
		if (!kbId)
			return [];

		// Default: The current record is associated with a knowledge base
		var limit = gs.getProperty("glide.knowman.related.content.limit", "6");
		var order = gs.getProperty("glide.knowman.related.content.order", "published");
		var names = ["number", "short_description", "author", "published"];
		var kbKnowledgeId = this._getDotField(this.knowledgeRecord, "sys_id") + "";
		var kbKnowledgeGr = new GlideRecord("kb_knowledge");
		kbKnowledgeGr.addQuery("workflow_state", "published");
		kbKnowledgeGr.addQuery("kb_knowledge_base", kbId);
		if (kbKnowledgeId)
			kbKnowledgeGr.addQuery("sys_id", "!=", kbKnowledgeId);
		kbKnowledgeGr.setLimit(limit);
		kbKnowledgeGr.orderByDesc(order);
		kbKnowledgeGr.query();
		var relatedContent = [];
		while (kbKnowledgeGr.next()) {
			var content = {};
			content.publishedDate = kbKnowledgeGr.published.getDisplayValue();
			content.shortDescription = kbKnowledgeGr.short_description.getDisplayValue();
			content.published = kbKnowledgeGr.published.getDisplayValue();
			content.author = kbKnowledgeGr.author.getDisplayValue();
			content.articleLink = "/kb_view.do?sysparm_article=" + kbKnowledgeGr.number;
			content.authorImage = this.getCurrentUserImage(kbKnowledgeGr.author.sys_id);
			relatedContent.push(content);
		}
		return relatedContent;
	},

	// Get the breadcrumb for the knowledge article
	getBreadcrumb: function () {
		var node = [];
		if (JSUtil.nil(this.knowledgeRecord.kb_category)) {
			var catNode = {};
			catNode.name = this.knowledgeRecord.topic;
			catNode.type = 'topic';
			catNode.knowledge_base = this.knowledgeRecord.kb_knowledge_base;
			node.push(catNode);
			return node;
		}
		var categoryId = this.knowledgeRecord.kb_category.sys_id;
		do {
			var kbCategoryGR = new GlideRecord('kb_category');
			if (kbCategoryGR.get(categoryId)) {
				var catNode = {};
				catNode.name = kbCategoryGR.label;
				catNode.value = kbCategoryGR.sys_id;
				catNode.type = 'category';
				catNode.knowledge_base = this.knowledgeRecord.kb_knowledge_base;
				node.unshift(catNode);
				categoryId = kbCategoryGR.parent_id.sys_id;
			}
			else
				break;
		} while (kbCategoryGR.parent_table != 'kb_knowledge_base');
		return node;
	},

	// Set to true if the page is running in a popup window. Autopopulated from URL if getInfo() is used
	setInPopup: function (isPopup) {
		this.isInPopup = isPopup;
	},

	// Set to true if the page is running in 'print' mode. Autopopulated from URL if getInfo() is used
	setIsPrint: function (isPrint) {
		this.isPrint = isPrint;
	},
	
	isPluginActive : function(pluginId){
		return GlidePluginManager.isActive(pluginId);
	},
	
	getVersionHistory: function(record){
		var history = [];
		if(record.article_id.nil())
			return history;
		var versions = new GlideRecordSecure('kb_knowledge');
		versions.addQuery('article_id',record.article_id);
		versions.orderByDesc('sys_created_on');
		versions.query();
		var versioning = new KBVersioning();
		while(versions.next()){
			var isVersioned = !versions.version.nil();
			var versionNumber = versions.getDisplayValue('version');
			var isCurrent = versions.getValue('version') == record.getValue('version');
			var isRevised = versioning.isRevised(versions);
			var activity;
			if(isRevised)
				activity = gs.getMessage("Updated on {0} by {1}",[new GlideDateTime(versions.sys_updated_on).getDate().getDisplayValue(),versions.getDisplayValue('revised_by')]);
			else
				activity = gs.getMessage("Authored on {0} by {1}",[versions.getDisplayValue('published'),versions.getDisplayValue('author')]);
			
			history.push({
				versionText: activity,
				isCurrent : isCurrent,
				versionNumber : versionNumber,
				sysId : versions.sys_id+'',
			});
		}
		return history;
	},
	
	//get affected products
	getAffectedProducts : function(){
		var affectedProducts = [];
		var cis = new GlideRecord('m2m_kb_ci');
		cis.addQuery('kb_knowledge', this.knowledgeRecord.sys_id);
		cis.orderBy('cmdb_ci.name');
		cis.query();
		while(cis.next()){
				affectedProducts.push({className: cis.cmdb_ci.sys_class_name + '', sysId: cis.cmdb_ci + '', name: cis.cmdb_ci.name + '', canRead : cis.cmdb_ci.canReadRef()});
		}
		return affectedProducts;
	},
	
	// get attached tasks
	getAttachedTasks : function(){
		var tasks = new GlideRecord('m2m_kb_task');
		var versioningInstalled = this.isVersioningInstalled();
		if(versioningInstalled && !this.knowledgeRecord.summary.nil()){
			tasks.addQuery("kb_knowledge.summary",this.knowledgeRecord.summary);
			tasks.addQuery("kb_knowledge.sys_created_on",'<=',this.knowledgeRecord.sys_created_on);
		}
		else
			tasks.addQuery("kb_knowledge", this.knowledgeRecord.sys_id);
		tasks.orderByDesc('task.sys_created_on');
		tasks.setLimit(gs.getProperty('glide.knowman.recent_tasks',10));
		tasks.query();
		var attachedIncidents = [];
		while(tasks.next()){
			var attTask = new GlideRecord("task");
			if(attTask.get(tasks.task)){
				var taskUrl = 'task.do?sys_id=' + tasks.task.sys_id + '&sysparm_referring_url=kb_article_view'; 
				var altText = tasks.task.getDisplayValue('number') + ' - ' + (tasks.task.short_description + '') ;
				attachedIncidents.push({URL : taskUrl, text : altText});
			}
			else{
				attTask.deleteRecord();
			}
		}
		return attachedIncidents;
	},
	
	// get WIKI article content
	
	getWikiContent : function(){
		var glideWikiModel = new GlideWikiModel();
		glideWikiModel.setLinkBaseURL(glideWikiModel.getLinkBaseURL() + "&sysparm_field=kb_knowledge.wiki" + "&sysparm_kbtable=" + this.tableName);
		return glideWikiModel.render(this.knowledgeRecord.wiki) + '';	
	},
	
	getLanguagesToDisplay: function (gr) {
		var listToDisplay = [];
		var articles = new GlideRecordSecure('kb_knowledge');
		if (JSUtil.notNil(gr.sys_id)) {
			var versioned = (this.isVersioningInstalled() && !gr.summary.nil());

			var cond;
			if (versioned) {
				if (gs.nil(gr.parent)){
					cond = articles.addQuery('parent.summary', gr.summary);
				}
				else{
					//Bypass Before query BR
					var temp = new GlideRecord('kb_knowledge');
					temp.setWorkflow(false);
					temp.get(gr.parent);
					
					cond = articles.addQuery('parent.summary', temp.summary)
					.addOrCondition('summary', temp.summary);
				}
				cond.addOrCondition('summary',gr.summary);

			} else {
				if (gs.nil(gr.parent))
					cond = articles.addQuery('parent', gr.sys_id);
				else
					cond = articles.addQuery('parent', gr.parent)
					.addOrCondition('sys_id', gr.parent);

				cond.addOrCondition('sys_id',gr.sys_id);
			}

			articles.orderBy('parent');
			articles.orderBy('language');
			articles.orderByDesc('sys_created_on');
			articles.query();
			var lastAddedLang = 'INITIAL_LANGUAGE';
			var utils = new I18nUtils();
			while (articles.next()) {

				if(lastAddedLang == articles.language)
					continue;
				lastAddedLang = articles.language+'';

				var label = utils.getLanguageLabel(articles.language)+'';
				if (gs.nil(articles.parent)) {
					label += " (Original)";
				}

				var selected = versioned?(gr.summary==articles.summary):
				(gr.sys_id==articles.sys_id);

				listToDisplay.push({
					'sys_id': articles.sys_id + '',
					'label': label,
					'selected' : selected,
					'language' : articles.language+'',
				});

			}
		}
		return listToDisplay;
	},

	 updateTsQueryKbWithRank : function(tsQueryId,rank){
		 var inc = new GlideRecord('ts_query_kb');
		 inc.get(tsQueryId);
		 var prevRank = inc.top_click_rank;
		 if(prevRank !=""){
			 if(parseInt(prevRank)>parseInt(rank)){
				 inc.top_click_rank =rank;
				 inc.update();
			 }
		 }else{
			 inc.top_click_rank = rank;
			 inc.update();
		 }
	 },
	// Initialize attributes to either null or the found items information
	_initializeKnowledge: function (record) {
		this.knowledgeRecord = this.isValid ? record : null;
		this._initialiseAdditionalInformation();
		if (this.isValid) {
			this._populateAdditionalInformation();
		}
	},

	// The UI houses short_description, text and wiki fields. Need to check for templates
	_initializeTemplateInformation: function () {
		// Only concerned with short_description and text fields
		var template = new KBUtilsSNC().buildTemplate(templateQuery);
		this.articleTitleTemplate = template["short_description"] || "";
		this.articleTemplate = template["text"] || "";
	},

	// Initialize attributes to null
	_initialiseAdditionalInformation: function () {
		this.recordId = null;
		this.tableName = null;
		this.knowledgeBaseId = null;
		this.isLegacyArticle = null;
		this.publishedRecord = null;
		this.dirtyFormMessage = null;
		this.feedbackRecord = null;
		this.showKBMenu = false;
		this.showKBFeedback = false;
		this.showKBRatingOptions = false;
		this.showKBHelpfullRating = false;
		this.showKBStarRating = false;
		this.showKBCreateIncident = false;
		this.showKBFlagArticle = false;
		this.isSubscriptionEnabled = false;
		this.isArticleSubscribed = false;
		this.isArticleSubscribedAtKB = false;
		this.showKBUpdateAction = false;
		this.showKBMoreInfo = false;
		this.starRatingValue = 0;
		this.bannerImage = "";
		this.authorImage = "";
		this.authorName = "";
		this.authorCompany = "";
		this.authorDepartment = "";
		this.authorTitle = "";
		this.feedbackInitialDisplay = false;
		this.feedbackEntryInitialDisplay = false;
		this.canCreateNew = false;
		this.knowledgeExists = false;
		this.permalink = "";
		this.attachments = [];
		this.relatedContent = [];
	},

	// Initialize attributes to the found items information
	_populateAdditionalInformation: function () {
		this.recordId = this.knowledgeRecord.getUniqueValue() + "";
		this.tableName = this.knowledgeRecord.getTableName() + "";
		this.knowledgeBaseVersion = this._getDotField(this.knowledgeRecord, "kb_knowledge_base.kb_version") + "";
		this.isLegacyArticle = JSUtil.nil(this.knowledgeBaseId) || !this.isKBVersion3(this.knowledgeBaseId);
		this.hasPublishedRecord = this._populatePublishedRecord();
		this._populateFeedback();
		this._populateFoundThisHelpful();
		var messageId = "eac1f2e9ff201000dada1c57f27f9d41";
		var messageGr = new GlideRecord("sys_ui_message");
		if (this._get(messageGr, "sys_id", messageId))
			this.dirtyFormMessage = this._i18n(messageGr.key.toString());
		this.canContributeToKnowledgeBase = this._knowledgeHelper.canContribute(this.knowledgeRecord);
		this.revisionString = this._knowledgeHelper.getRevisionString(this.knowledgeRecord);
		this.isEditable = this.canContributeToKnowledgeBase;
		this.articleTemplateName = this._knowledgeHelper.getArticleTemplateName(this.knowledgeRecord.sys_class_name) || '';
		/* Pass versioning related information to the view layer */
		
		this.versioningInfo = {};
		this.versioningInfo.isInstalled = this.isVersioningInstalled();
		this.versioningInfo.isEnabled = this.isVersioningEnabled();
		this.versioningInfo.showHistory = false;
		this.versioningInfo.versionDisplay = '';
		if(this.versioningInfo.isInstalled){
			var versioning = new KBVersioning();
			
			// article_id will be empty for non versioned articles, no information to display in that case.
			if(!this.knowledgeRecord.article_id.nil()){
				var latest = versioning.getLatestAccessibleVersionFromId(this.knowledgeRecord.article_id);
				this.versioningInfo.newVersionAvailable = latest.getValue('version')!=this.knowledgeRecord.getValue('version');
				if(this.versioningInfo.newVersionAvailable){
					this.versioningInfo.newVersion = latest;
						this.versioningInfo.warningMessage = versioning.getWarningMessage(this.knowledgeRecord,				(this.isInvokedFromSP ? this.servicePortalViewPageUrlPrefix : "kb_view.do?sys_kb_id="));
				}

				if(this.versioningInfo.isEnabled){
					var versionGr = this.knowledgeRecord.version.getRefRecord();
					if(this.knowledgeRecord.workflow_state!="published"){
						this.hideFeedbackOptions = !(versioning.isPhysicalRecord(versionGr) && versioning.isLatestVersion(this.knowledgeRecord));
					}
					this.isEditable = this.knowledgeRecord.canWrite() || versioning.canCheckout(this.knowledgeRecord);
					this.versioningInfo.history = this.getVersionHistory(this.knowledgeRecord);
					this.versioningInfo.showHistory = this.versioningInfo.history.length > 1;
					if(this.versioningInfo.showHistory){
						var versionNumber = this.knowledgeRecord.version.nil()?'':'v'+this.knowledgeRecord.getDisplayValue('version');
						this.versioningInfo.versionDisplay = this.versioningInfo.newVersionAvailable?versionNumber:gs.getMessage("Latest Version");
					}
				}
				else{
					// If versioning is disabled, non latest articles should not be editable.
					if(!versioning.isLatestVersion(this.knowledgeRecord)){
						this.isEditable = false;
						this.hideFeedbackOptions = true;
					}
				}
				
			}
		}

		
		/* End versioning related information */
		
		this.showKBMenu = this.canShowKBMenu();
		this.showKBFeedback = this.canShowKBFeedback();
		this.showKBRatingOptions = this.canShowKBRatingOptions();
		this.showKBHelpfullRating = this.canShowKBHelpfullRating();
		this.showKBStarRating = this.canShowKBStarRating();
		this.showKBCreateIncident = this.canShowKBCreateIncident();
		this.showKBFlagArticle = this.canShowKBFlagArticle();
		if(this.versioningInfo.isInstalled && !this.hideFeedbackOptions) {
			this.isSubscriptionEnabled = this.canshowKBSubscribeArticle();
			this.isArticleSubscribed = this.subscribedAtArticle();
			this.isArticleSubscribedAtKB = this.subscribedAtKB();
		}
		this.showKBUpdateAction = this.canShowKBUpdateAction();
		this.showKBMoreInfo = this.canShowKBMoreInfo();
		this.isLiveFeedEnabled = gs.getProperty("glide.knowman.use_live_feed", 'true');
		this.starRatingValue = this.getKBFeedbackRating();
		this.bannerImage = this.getBannerImage();
		this.authorImage = this.getAuthorImage();
		this.canCreateNew = true;
		this.permalink = this.getPermalink(this.knowledgeRecord.number);
		if (!this.isNewRecord)
			this.attachments = this.getAttachments();

		this.authorName = this.getAuthorInfo("author.name");
		this.authorCompany = this.getAuthorInfo("author.company.name");
		this.authorDepartment = this.getAuthorInfo("author.department.name");
		this.authorTitle = this.getAuthorInfo("author.title");
		if(this.isExternalArticle(this.knowledgeRecord))
			this.externalArticle =  true;


	},

	// find the published record for the knowledge item and populate related attributes
	_populatePublishedRecord: function () {
		this.publishedRecord = this.knowledgeRecord;
		
		return false;
	},

	_populateFoundThisHelpful: function(){
		var versioningInstalled = this.isVersioningInstalled();
		var fbs = new GlideRecord("kb_feedback");
		fbs.addQuery("useful", "yes");
		if(versioningInstalled && !this.knowledgeRecord.article_id.nil()){
			fbs.addQuery("article.article_id",this.knowledgeRecord.article_id);
		}
		else
			fbs.addQuery("article",this.knowledgeRecord.sys_id);

		fbs.query();
		var useful_yes = fbs.getRowCount();

		fbs = new GlideRecord("kb_feedback");
		fbs.addNotNullQuery("useful");
		if(versioningInstalled && !this.knowledgeRecord.article_id.nil()){
			fbs.addQuery("article.article_id",this.knowledgeRecord.article_id);
		}
		else
			fbs.addQuery("article",this.knowledgeRecord.sys_id);

		fbs.query();
		var useful_total = fbs.getRowCount();

		var percentage = (useful_total > 0) ? Math.round(useful_yes/useful_total*100) : 0;
		if(percentage>0)
			this.helpfulText = gs.getMessage("{0}% found this useful", percentage+'');
	},
	
	
	// load the feedback records into attribute
	_populateFeedback: function () {
		var loggedinUser = gs.getUserID();
		var isAdmin = gs.hasRole("admin") || gs.hasRole("knowledge_admin");
		var isManager = gs.hasRole("knowledge_manager");
		var isAuthor = (this.knowledgeRecord.author == loggedinUser);
		
		var fb = new GlideRecord("kb_feedback");
		var versioningInstalled = this.isVersioningInstalled();
		if(versioningInstalled && !this.knowledgeRecord.article_id.nil()){
			fb.addQuery("article.article_id",this.knowledgeRecord.article_id);
			fb.addQuery("article.sys_created_on",'<=',this.knowledgeRecord.sys_created_on);
		}
		else
			fb.addQuery("article", this.knowledgeRecord.sys_id);
		/*Flagged comments should not go public.
		  admin, knowledge_admin, knowledge_manager, author of the article will see all the flagged     comments.
		  Other users will only see the flagged comments that are entered by them */
		if(!isAdmin && !isManager && !isAuthor){
			fb.addQuery('flagged', false).addOrCondition('user',loggedinUser);
		}
		
		fb.addNotNullQuery("comments");
		fb.orderByDesc('sys_created_on');
		fb.setLimit(gs.getProperty("glide.knowman.feedback.display_threshold", 100));
		fb.query();
		if (fb.getRowCount() == 0) {
			fb = new GlideRecord("kb_feedback");
			fb.initialize();
			this.feedbackInitialDisplay = false;
			this.feedbackEntryInitialDisplay = true;

		} else {
			this.feedbackInitialDisplay = false;
			this.feedbackEntryInitialDisplay = false;
		}
		this.feedbackRecord = fb;
	},

	// Update page metrics
	_logPageView: function (tsqueryId) {
		if(this.isInvokedFromSP){
			var paramObj = {};
			paramObj["glideSessionId"] = gs.getSessionID();
			paramObj["displayVal"] = this.knowledgeRecord.getDisplayValue();
			if(tsqueryId && tsqueryId !=""){
				paramObj["ts_query_id"] = tsqueryId;
			}
			gs.eventQueue('user.view', this.knowledgeRecord, this.knowledgeRecord.getDisplayValue(), gs.getUserID());
			gs.eventQueue('kb.view', this.knowledgeRecord, JSON.stringify(paramObj), gs.getUserID());
		}else{
			gs.eventQueue('user.view', this.knowledgeRecord, this.knowledgeRecord.getDisplayValue(), gs.getUserID());
			gs.eventQueue('kb.view', this.knowledgeRecord, this.knowledgeRecord.getDisplayValue(), gs.getUserID());
		}
			
	},
	
	getArticleTemplateContent: function(){
		if(!this.isVersioningInstalled()){
			return '';
		}
		var gr = new GlideRecord('kb_article_template');
		gr.addQuery("article_template", this.articleTemplateName);
		gr.query();
		if(gr.next()){
			var atd = new GlideRecord("kb_article_template_definition");
			atd.addQuery("article_template", gr.sys_id);
			atd.addQuery("active", true);
			atd.orderBy('order');
			atd.query();
			var kr = new GlideRecord(this.knowledgeRecord.sys_class_name);
			kr.get(this.knowledgeRecord.sys_id);
			var articleContent = '';
			var childTable = new GlideRecord(gr.child_table);
			while(atd.next()){
				var columnName = atd.table_column;
				if(columnName && kr[columnName].canRead()){
					var tc = kr.getDisplayValue(columnName);
					var columnLabel = childTable.getElement(atd.table_column).getLabel();
					if(tc){
						articleContent += '<div><h3>' + columnLabel + '</h3>';
						articleContent += tc + '</div>';
					}					
				}
			}
			return articleContent;
		}
	},
	type: "KBViewModelSNC"
});