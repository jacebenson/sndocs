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

	// Get information by sys_id for a kb_knowledge(supplied by the URL)
	getInfo: function () {
		this.findKnowledgeByURL();
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
		return {knowledgeExists: knowledgeExists, isValid: isValid, record: record};
	},

	// Find a knowledge item from the URL
	findKnowledgeByURL: function () {
		var isValid = false;
		for (var index = 0; index < this.tableNames.length; ++index) {
			var record = new GlideRecordSecure(this.tableNames[index]);
			isValid = true;
			if (!gs.nil(jelly.sysparm_article)) {
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

		if (this.isValid && !this.isLegacyArticle)
			this._logPageView();
	},

	// Find a knowledge item by sys_id
	findKnowledgeById: function (recordId) {
		var result = this.getKnowledgeRecord("sys_id", recordId, false);
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
		if (!showRatingOptions)
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

		if (this.isInPopup || this.isPrint || !this.canShowKBMenu() || !this.canShowKBRatingOptions())
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
		return this.getCurrentUserImage(this.knowledgeRecord.author.sys_id);
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
		var messageId = "eac1f2e9ff201000dada1c57f27f9d41";
		var messageGr = new GlideRecord("sys_ui_message");
		if (this._get(messageGr, "sys_id", messageId))
			this.dirtyFormMessage = this._i18n(messageGr.key.toString());
		this.canContributeToKnowledgeBase = this._knowledgeHelper.canContribute(this.knowledgeRecord);
		this.showKBMenu = this.canShowKBMenu();
		this.showKBFeedback = this.canShowKBFeedback();
		this.showKBRatingOptions = this.canShowKBRatingOptions();
		this.showKBHelpfullRating = this.canShowKBHelpfullRating();
		this.showKBStarRating = this.canShowKBStarRating();
		this.showKBCreateIncident = this.canShowKBCreateIncident();
		this.showKBFlagArticle = this.canShowKBFlagArticle();
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
		this.relatedContent = this.getCurrentRelatedContent();
	},

	// find the published record for the knowledge item and populate related attributes
	_populatePublishedRecord: function () {
		this.publishedRecord = this.knowledgeRecord;
		
		return false;
	},

	// load the feedback records into attribute
	_populateFeedback: function () {
		var loggedinUser = gs.getUserID();
		var isAdmin = gs.hasRole("admin") || gs.hasRole("knowledge_admin");
		var isManager = gs.hasRole("knowledge_manager");
		var isAuthor = (this.knowledgeRecord.author == loggedinUser);
		
		var fb = new GlideRecord("kb_feedback");
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
	_logPageView: function () {
		gs.eventQueue('user.view', this.knowledgeRecord, this.knowledgeRecord.getDisplayValue(), gs.getUserID());
		gs.eventQueue('kb.view', this.knowledgeRecord, this.knowledgeRecord.getDisplayValue(), gs.getUserID());
	},

	type: "KBViewModelSNC"
});

			