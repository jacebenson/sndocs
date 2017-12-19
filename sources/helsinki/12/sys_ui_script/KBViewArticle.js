/* Formless article editor.


 Accepted URI parameters:
 sysparm_stack = yes/no
 sysparm_context = popup
 sysparm_no_create = true/false
 sysparm_no_update = true/false
 sysparm_no_info = true/false
 sysparm_no_history = true/false
 sysparm_no_suggest = true/false
 sysparm_no_create_incident = true/false
 sysparm_no_rating = true/false
 */

var ArticleNotification = function () {

	function show(message, type) {
		reset();
		$j('#messageType').addClass('outputmsg_' + type);
		$j('#messageType').addClass('notification-' + type);
		$j('#articleText').text(message);
		$j('#messageBox').show();
	}

	function hide() {
		reset();
		$j('#messageBox').hide();
	}

	function reset() {
		$j('#articleText').text('');
		$j('#messageType').removeClass('outputmsg_error')
			.removeClass('notification-error')
			.removeClass('outputmsg_info')
			.removeClass('notification-info');
	}

	return {
		show: show,
		hide: hide
	};
};

var KbViewArticle = Class.create({
	type: 'KbViewArticle',
	isQuirksMode: (document.compatMode !== 'CSS1Compat'),
	messageBar: new ArticleNotification(),
	refreshDelay: 3000,
	canContribute: false,
	gwtMessage: new GwtMessage(),

	setUpArticleBannerAndAuthorInfo: function () {
		// Does the page have a large banner image on the top
		var hasBannerImage = $j('#articleBanner').length > 0;
		// Determine how the author name should be styled
		var authorName = $j('#authorName');
		if (authorName.length) {
			if (hasBannerImage) {
				authorName.addClass('snc-article-header-author-name-white');
				if (this.isQuirksMode) {
					authorName.addClass('snc-article-text-outline-text-ie-white');
				}
			} else {
				authorName.addClass('snc-article-header-author-name-no-image');
			}
		}
		// Determine how the author ghost should be be styled
		var authorGhost = $j('#authorGhost');
		if (authorGhost.length) {
			if (hasBannerImage)
				authorGhost.addClass('snc-article-header-author-ghost-white');
			else
				authorGhost.addClass('snc-article-header-author-ghost-black');
		}
		// Determine how the border around the author image should be styled
		var authorImageBorder = $j('#authorImageBorder');
		if (authorImageBorder.length) {
			if (hasBannerImage)
				authorImageBorder.addClass('snc-article-header-author-border-white');
			else
				authorImageBorder.addClass('snc-article-header-author-border-black');
		}
		// Determine how the readonly version of the article title should be styled
		var articleTitleReadonly = $j('#articleTitleReadonly');
		if (articleTitleReadonly.length) {
			if (hasBannerImage) {
				articleTitleReadonly.addClass('snc-article-header-toolbar-title-white');
				if (this.isQuirksMode) {
					articleTitleReadonly.addClass('snc-article-text-outline-text-ie-white');
				}
			} else {
				articleTitleReadonly.addClass('snc-article-header-toolbar-title-no-image');
			}
		}
	},

	// partial initialisation of the page.
	onLoaded: function () {
		$j('#backButton').click(this.backButtonHandler.bind(this));
		$j('#editArticle').click(this.editArticleHandler.bind(this));
		$j('#attachToTask').click(this.attachToTaskHandler.bind(this));
		$j('#createIncident').click(this.incidentBtnHandler.bind(this));
		$j('#flagArticle').click(this.flagArticleHandler.bind(this));
		$j('#article').focus(this.focusHandler.bind(this))
			.blur(this.blurHandler.bind(this));

		// Add load handler for article banner field
		this.setUpArticleBannerAndAuthorInfo();
		// Show meta fields
		$j('#articleFooter').show();
		this.setMetaDataVisibility();
		// Show feedback if viewing published content
		if (this.isPublished()) {
			$j('#articleFooterSection').removeAttr('style'); // unhide
		}
		// Add event handler to article content placeholder field
		$j('#articlePlaceHolder').click(function (event) {
			if (tinymce.editors.length) {
				tinymce.activeEditor.focus();
			} else {
				var elemId = (this.isWiki || this.isQuirksMode) ? '#articleWiki' : '#article';
				$j(elemId).focus();
			}
		}.bind(this));
		// Hide/Show Comments section
		$j('#user_feedback_div_show').click(this.showCommentsHandler.bind(this));
		$j('#user_feedback_div_hide').click(this.hideCommentsHandler.bind(this));
		$j('#user_feedback_div_hide').trigger('click'); // trigger this link to hide the comment section on load
		
		   	// Bind an event to window.onhashchange that, when the hash changes, scroll to exact bookmark in the KBA
	    $j(window).bind( 'hashchange', function(event){
  		    offSetScroll(window.location.hash);
	    });
	    
    	// Bind an event to window.load that, when the page loads changes, scroll to exact spot in the KBA if url contains any hash bookmarks
	    $j(window).bind('load', function(event) {
	        offSetScroll(window.location.hash);
	    });	
	    
	    // Bind an event to anchor <a> link click that, when the link is clicked, scroll to exact bookmark in the KBA
		$j("a").click(navigationBookmarkLinkHandler.bind(this));
		function navigationBookmarkLinkHandler(event) {
			var href = Event.element(event)+'';
			if (href == undefined || href == null)
				return;
			
		    var hash = href.substring(href.indexOf("#"));
	        offSetScroll(hash);
		}
	    
	    // using the offset scroll to the right spot of the bookmark in the KBA
	    function offSetScroll(hash) {
			//Change this according to the height of the navigation bar
		    var fromTop = 50;	// nav bar padding is set to 40px, leaving a 10px from top after scroll
		    // validate if the href starts with # ie a bookmark within the article
		    if (hash.indexOf('#') != 0)
		    	return;
		    
		    // getting elem by id
			var elem = $j(hash);	 
			var elemOffset = elem.offset();
		    if (elemOffset == undefined || elemOffset == null){
				// getting elem by name if not found by id
	 			elem = $j('a[name="'+hash.substring(1)+'"]');	
		   		elemOffset = elem.offset();
		    }
			if (elemOffset == undefined || elemOffset == null)
				return;
			
			var targetOffset = elemOffset.top-fromTop;
		    $j('html, body').animate({scrollTop: targetOffset}, 500, function(e) {});
		}
	},
	
	showIfPopulated: function (containerId, contentId) {
		if ($j('#' + contentId).html()) {
			$j('#' + containerId).show();
		}
	},
	
	updateMetaField: function (containerId, valueId, value) {
		var elem = $j('#' + valueId);
		if (!elem.length)
			return;

		elem.text(value);
		var method = value ? 'show' : 'hide';
		$j('#' + containerId)[method]();
	},

	setMetaDataContent: function (kbViewInfo) {
		var knowledgeRecord = kbViewInfo.knowledgeRecord;
		this.updateMetaField("articleVersion", "articleVersionValue", kbViewInfo.knowledgeBaseVersion);
		this.updateMetaField('articlePublished', 'articlePublishedValue', knowledgeRecord.published);
		this.updateMetaField('articleNumber', 'articleNumberValue', knowledgeRecord.number);
		this.updateMetaField('articlePermalink', 'articlePermalinkValue', kbViewInfo.permalink);
		this.updateMetaField('articleCategory', 'articleCategoryValue', knowledgeRecord.category);
		if ($('articlePermalinkValue'))
			$j('#articlePermalinkValue').attr('href', kbViewInfo.permalink);
		this.updateMetaField('articleAuthorName', 'articleAuthorNameValue', kbViewInfo.authorName);
		this.updateMetaField('articleAuthorCompany', 'articleAuthorCompanyValue', kbViewInfo.authorCompany);
		this.updateMetaField('articleAuthorDepartment', 'articleAuthorDepartmentValue', kbViewInfo.authorDepartment);
		this.updateMetaField('articleAuthorTitle', 'articleAuthorTitleValue', kbViewInfo.authorTitle);
	},

	setMetaDataVisibility: function () {
		$j('#attachments').hide();
		if ($j('#articleDisplayAttachments').val() === 'true')
			this.showIfPopulated('attachments', 'attachments-content');

		this.showIfPopulated("articleVersion", "articleVersionValue");
		this.showIfPopulated('articlePublished', 'articlePublishedValue');
		this.showIfPopulated('articleNumber', 'articleNumberValue');
		this.showIfPopulated('articlePermalink', 'articlePermalinkValue');
		this.showIfPopulated('articleCategory', 'articleCategoryValue');
		this.showIfPopulated('articleAuthorName', 'articleAuthorNameValue');
		this.showIfPopulated('articleAuthorCompany', 'articleAuthorCompanyValue');
		this.showIfPopulated('articleAuthorDepartment', 'articleAuthorDepartmentValue');
		this.showIfPopulated('articleAuthorTitle', 'articleAuthorTitleValue');
	},

	isPublished: function () {
		return this.isState('published');
	},

	isRetired: function () {
		return this.isState('retired');
	},

	isDraft: function () {
		return this.isState('draft');
	},

	isReview: function () {
		return this.isState('review');
	},

	isState: function (state) {
		return state === $j('#articleWorkflowState').val();
	},
	
	isModified: function () {
		return $j('#articleModified').val() === 'true';
	},
	
	isNew: function () {
		return $j('#articleIsNew').val() === 'true';
	},
	
	canShowKBFeedback: function () {
		return $j('#canShowKBFeedback').val() === 'true';
	},
	
	isDisplayFromPopup: function () {
		if (self.opener && self.opener.document.getElementById("section_form_id") != null) {
			return true;
		}
		return false;
	},
	
	isLiveFeedEnabled: function () {
		return $j('#isLiveFeedEnabled').val() === 'true';
	},
	
	setModified: function (value) {
		$j('#articleModified').val(value + '');
	},
	
	setViewMode: function () {
		$j('#articleEditMode').val(false);
	},

	setCanContribute: function (value) {
		this.canContribute = value;
	},

	enableButtons: function (btnIds) {
		$j(btnIds).removeAttr('disabled');
	},

	disableButtons: function (btnIds) {
		$j(btnIds).attr('disabled', 'true');
	},

	resetButtonState: function () {
		// Hide each item in toolbar
		var buttons = $j('.snc-article-header-toolbar-button');
		if (!buttons.length) {
			return;
		}

		buttons.removeAttr('disabled').removeClass('btn-primary').addClass('btn-default').hide();
		// Get hidden field values to check state
		var isDraft = this.isDraft();
		var isReview = this.isReview();
		var isPublished = this.isPublished();
		var isRetired = this.isRetired();
		var showKBCreateIncident = $j('#articleShowKBCreateIncident').val() === 'true';
		//Everyone should see it
		$j('#flagArticle').show();
		var isDisplayFromPopup = this.isDisplayFromPopup();
		if (isDisplayFromPopup) {
			$j('#attachToTask').show();
		}

		if (!this.canContribute) { // Read only mode
			if (isPublished && showKBCreateIncident) {
				$j('#createIncident').show();
			}
		} else {
			$j('#editArticle').show();
			if (showKBCreateIncident) {
				$j('#createIncident').show();
			}
		}

		var visibleBtns = $j('#editArticle:visible');
		visibleBtns.not(':disabled').last().removeClass('btn-default').addClass('btn-primary');
	},

	resetArticleFieldState: function () {
		$j('#articlePlaceHolder').hide();
		$j('#articleTitleReadonly').hide();
		$j('#articleNumberReadonly').hide();
		$j('#articleTitleEditable').hide();
		$j('#article').hide();

	},

	resetPage: function (kbViewInfo) {
		this.setViewMode();
		// Hide any message that may be on display
		this.messageBar.hide();
		// Set up hidden fields from kb_view_hidden_fields
		var knowledgeRecord = kbViewInfo.knowledgeRecord;
		$j('#articleId').val(knowledgeRecord.sys_id);
		if (!kbViewInfo.isNewRecord && window.history.replaceState) {
			window.history.replaceState('', knowledgeRecord.number, 'kb_view.do?sys_kb_id=' + knowledgeRecord.sys_id);
		}

		$j('#articleVersion').val(kbViewInfo.knowledgeBaseVersion);
		$j('#articleWorkflowState').val(knowledgeRecord.workflow_state);
		$j('#articleTitleReadonly').html(knowledgeRecord.short_description);
		$j('#articleNumberReadonly').html(knowledgeRecord.number);
		$j('#articleTextType').val(kbViewInfo.articleType);
		$j('#articleOriginal').val(knowledgeRecord.text);
		$j('#article').html(knowledgeRecord.text);
		//Set state for livefeed and comments
		$j('#isLiveFeedEnabled').val(kbViewInfo.isLiveFeedEnabled);
		$j('#canShowKBFeedback').val(kbViewInfo.showKBFeedback);
		// Set up state of article title and content fields
		this.resetArticleFieldState();
		// Must update meta content fields
		this.setMetaDataContent(kbViewInfo);
		this.setMetaDataVisibility();
		// If viewing published content show feedback
		if (this.isPublished()) {
			$j('#articleFooterSection').removeAttr('style'); // unhide
			// If we're using live feed comments then ensure it's loaded with the correct ID
			var attr = $j('#iframe_live_feed').attr('src');
			if (attr && attr.match(/sysparm_kb_id=[a-z0-9]{32}/)) {
				$j('#iframe_live_feed').attr('src', '$knowledge_feedback.do?sysparm_stack=no&sysparm_kb_id=' + knowledgeRecord.sys_id);
			}
		} else {
			$j('#articleFooterSection').css('display', 'none');
		}
		// Set up the initial state of buttons
		this.resetButtonState();
		// Update Author Information
		this.updateAuthorInfo(kbViewInfo);
	},

	updateAuthorInfo: function (kbViewInfo) {
		var $elem = $j('#authorName');
		if ($elem.length) {
			$elem.html(kbViewInfo.authorName);
			$j('#authorImage').attr('src', kbViewInfo.authorImage);
		}
	},

	flagArticleHandler: function () {
		var self = this;
		var overlay = new GlideOverlay({
			id: 'suggestChange',
			title: self.getL10N('Flag this article'),
			width: '60%',
			height: 250,
			fadeInTime: 250,
			draggable: false,
			iframe: 'kb_view_suggest.do?sys_id=-1&sysparm_nostack=yes&sysparm_popup=true',
			onAfterLoad: function () {
				this.setHeight('250px');
				this.autoPosition();
				var doc = overlay.getIFrameElement().contentWindow.document;
				var iframe = $j(overlay.getIFrameElement());
				$j('#suggestChange', iframe.contents()).click({dlg: overlay}, function(eventObj) {
					var comments = doc.getElementById('suggestText').value;
					if (!comments) {
						doc.getElementById('errorMsg').innerHTML = self.getL10N('Please provide a comment');
					} else {
						var ajax = new GlideAjax('KnowledgeAjax');
						ajax.addParam('sysparm_type', 'kbWriteComment');
						ajax.addParam('sysparm_search', '');
						ajax.addParam('sysparm_id', $j('#articleId').val());
						ajax.addParam('sysparm_flag', true);
						ajax.addParam('sysparm_feedback', escape(comments));
						ajax.getXML(function () {
							eventObj.data.dlg.close();
							kbViewArticle.messageBar.show(self.getL10N('Article has been flagged'), 'info');
						});
					}
				});
				$j('#suggestChangeCancel', iframe.contents()).click({dlg: overlay}, function(eventObj) {
					eventObj.data.dlg.close();
				});
			}
		});
		overlay.render();
	},

	setPageViewable: function () {
		this.setViewMode();
		// fill hidden backup fields
		$j('#articleOriginal').val($j('#article').html());
		$j('#articleTitleOld').val($j('#articleTitleEditable').val());
		// Return if this is a new article (As there is nothing else to do for now)
		$j('#articlePlaceHolder').hide();
		$j('#articleTitleReadonly').show();
		$j('#articleNumberReadonly').show();
		$j('#article').css("display", "block");
		this.unfade('#articleFooter, #articleFooterSection');
		// Configure toolbar buttons
		this.resetButtonState();
	},

	// accepts comma separated list of selectors
	fade: function (elemId) {
		$j(elemId).addClass('snc-faded');
	},

	// accepts comma separated list of selectors
	unfade: function (elemId) {
		$j(elemId).removeClass('snc-faded');
	},
	
	focusHandler: function (event) {
	},

	blurHandler: function (event) {
	},
	
	mouseEnterHandler: function (event) {
		var element = Event.element(event);
		element.removeClassName('snc-article-header-toolbar-button-blur');
		element.addClassName('snc-article-header-toolbar-button-focus');
		element.setStyle({color: 'black'});
	},

	mouseLeaveHandler: function (event) {
		var element = Event.element(event);
		element.removeClassName('snc-article-header-toolbar-button-focus');
		element.addClassName('snc-article-header-toolbar-button-blur');
		element.setStyle({color: 'black'});
	},

	mouseUpHandler: function (event) {
		var element = Event.element(event);
		var isIconElement = element.hasClassName('snc-article-header-toolbar-button-icon');
		var isTextElement = element.hasClassName('snc-article-header-toolbar-button-text');
		var targetElement = (isIconElement || isTextElement) ? element.up() : element;
		targetElement.setStyle({color: 'black'});
	},

	mouseDownHandler: function (event) {
		var element = Event.element(event);
		var isIconElement = element.hasClassName('snc-article-header-toolbar-button-icon');
		var isTextElement = element.hasClassName('snc-article-header-toolbar-button-text');
		var targetElement = (isIconElement || isTextElement) ? element.up() : element;
		targetElement.setStyle({color: 'black'});
	},

	touchStartHandler: function (event) {
		var element = Event.element(event);
		var isIconElement = element.hasClassName('snc-article-header-toolbar-button-icon');
		var isTextElement = element.hasClassName('snc-article-header-toolbar-button-text');
		var targetElement = (isIconElement || isTextElement) ? element.up() : element;
		targetElement.removeClassName('snc-article-header-toolbar-button-blur');
		targetElement.addClassName('snc-article-header-toolbar-button-focus');
	},

	touchEndHandler: function (event) {
		var element = Event.element(event);
		var isIconElement = element.hasClassName('snc-article-header-toolbar-button-icon');
		var isTextElement = element.hasClassName('snc-article-header-toolbar-button-text');
		var targetElement = (isIconElement || isTextElement) ? element.up() : element;
		targetElement.removeClassName('snc-article-header-toolbar-button-focus');
		targetElement.addClassName('snc-article-header-toolbar-button-blur');
	},

	discardArticleChanges: function () {
		var articleTitleOld = $j('#articleTitleOld').val();
		$j('#articleTitleEditable').val(articleTitleOld);
		$j('#articleTitleReadonly').html(articleTitleOld);
		var content = $j('#articleOriginal').val();
		$j('#articleWiki').val(content);
		$j('#article').html(content);
		this.setModified(false);
		this.setPageViewable(false);
		this.showInfoMessage(kbConfig.i18n.DISCARDED);
	},

	backButtonHandler: function () {
		if (window.history) {
				window.history.go(-1);
			}
	},
	
	editArticleHandler:function(){
		var revURL = new GlideURL("kb_knowledge.do");
		revURL.addParam("sys_id", $j('#articleId').val());
		revURL.addParam("sysparm_referring_url","kb_view.do");
		//set referring url ,so that update/retire UI actions works properly
		var frame = top.gsft_main || top;
		frame.location = revURL.getURL();
	},
	
	attachToTaskHandler: function () {
		if (self.opener) {
			var lastSaved = self.opener.document.getElementById("onLoad_sys_updated_on").value;
			if (!lastSaved) {
				self.close();
				var err = (gel('error_msg') != null) ? gel('error_msg').value : "Invalid action: Record needs to be saved first";
				self.opener.g_form.addErrorMessage(err);
				return false;
			}
			var e = self.opener.document.getElementById("sys_uniqueValue");
			var task = e.value;
		}

		var sysID = $j('#articleId').val();
		var args = new Array();
		args.push(sysID);
		args.push($j('#attachFields').val());

		var ajax = new GlideAjax("KnowledgeAjax");
		ajax.addParam("sysparm_type", "kbAttachArticle");
		ajax.addParam("sysparm_value", sysID + "," + task);
		ajax.getXML(kbReturnAttach2, "", args);

		return false;
	},
	
	showInfoMessage: function (message) {
		this.messageBar.hide();
		this.messageBar.show(this.getL10N(message), 'info');
	},

	showWarningMessage: function (message) {
		this.messageBar.show(this.getL10N(message), 'warning');
	},

	showErrorMessage: function (message) {
		this.messageBar.show(this.getL10N(message), 'error');
	},

	incidentBtnHandler: function (event) {
		var loc = $j('#createIncidentLinkLocation').val();
		if (loc && loc.length) {
			window.location = loc;
		}
	},

	synchArticleTitle: function () {
		var value = $j('#articleTitleEditable').val();
		$j('#articleTitleReadonly').val(value);
		$j('#articleTitleOld').val(value);
	},

	displayStateMessage: function () {
		var workflowState = $j('#articleWorkflowState').val();
		if (workflowState === 'review' || workflowState === 'pending_retirement') {
			this.showInfoMessage(this.getStateMessage(workflowState));
		}
	},

	getStateMessage: function (state) {
		return kbConfig.i18n.STATUS_MSG[state] || '';
	},

	getL10N: function (message, array) {
		message = message || '';
		var padded = ' ' + message + ' ';
		var translated = getMessage(padded, array);
		var trimmed = translated.trim();
		return trimmed;
	},
	
	hideConfirmationDlg: function () {
		$j('#kb_confirmationDlg').hide();
	},

	popupConfirmationDlg: function (title, msg, callBack) {
		var popup = $j('#kb_confirmationDlg');
		popup.find('.modal-title').text(title);
		popup.find('.modal-body p').text(msg);
		popup.find('.kb-yes-btn').off('click').click(callBack);
		popup.show();
	},

	showCommentsHandler: function () {
		$j('#user_feedback_div_show').hide();
		$j('#user_feedback_div_hide').show();
		$j('#kbCommentsAndLiveFeedDisplay').css('visibility','visible');
		$j('#kbCommentsAndLiveFeedDisplay').css('height','');
	    $j('#kbCommentsAndLiveFeedDisplay').css('position','');
	},

	hideCommentsHandler: function () {
		$j('#user_feedback_div_hide').hide();
		$j('#user_feedback_div_show').show();
		$j('#kbCommentsAndLiveFeedDisplay').css('visibility','hidden');
		$j('#kbCommentsAndLiveFeedDisplay').css('height','0');
		$j('#kbCommentsAndLiveFeedDisplay').css('position','absolute');
	},

	setTitle: function (title) {
		$j(".snc-article-header-toolbar h1.navbar-title").html(title);
	},
	
	getArticleStyle: function () {
		return $j("#articleStyle").val();
	}
});


function kbFeedbackDone(response) {
	// Add the comment to the comments section
	var result = response.responseXML.getElementsByTagName('item')[0];
	var name = result.getAttribute('name');
	var date = result.getAttribute('date');
	var comment = result.getAttribute('comment');
	var messages = getMessages(['Posted by', 'on', 'Feedback', 'Comments']);
	var commentElem = new Element('div', {'class': 'snc-kb-comment'});
	var commentDetails = new Element('div', {'class': 'snc-kb-comment-by'});
	var commentImg = new Element('img', {'src': 'images/icons/feedback.gifx', 'alt': messages['Feedback']});
	var commentPostedBy = new Element('span', {'class': 'snc-kb-comment-by-title'});
	var commentUser = new Element('span', {'class': 'snc-kb-comment-by-user'});
	var commentOn = new Element('span', {'class': 'snc-kb-comment-by-title'});
	var commentDate = new Element('span', {'class': 'snc-kb-comment-by-date'});
	var commentText = new Element('span', {'class': 'snc-kb-comment-by-text'});

	commentPostedBy.insert('&nbsp;' + messages['Posted by']);
	commentUser.insert('&nbsp;' + name);
	commentOn.insert('&nbsp;' + messages['on']);
	commentDate.insert('&nbsp;' + date);
	commentText.insert(comment);
	commentDetails.insert(commentImg);
	commentDetails.insert(commentPostedBy);
	commentDetails.insert(commentUser);
	commentDetails.insert(commentOn);
	commentDetails.insert(commentDate);
	commentElem.insert(commentDetails);
	commentElem.insert(commentText);
	$('comments_section').insert({top: commentElem});
	// Scroll to the first comment (newly added one)
	$j('html, body').animate({ scrollTop: $j('#kbCommentsAndLiveFeedDisplay').offset().top }, 1000);
}

function kbFeedback2(name) {
	var comments = ($(name) ? $(name).value : '');
	if (comments == '') {
		showObject(gel('commentsdiv_empty'));
		return false;
	}

	var sys_id = ($('articleId') ? $('articleId').value : '');
	var flag = document.getElementById('article_flag');
	var view_id = document.getElementById('view_id');
	var query = document.getElementById('sysparm_search');
	var ajax = new GlideAjax('KBAjaxSNC');
	ajax.addParam('sysparm_type', 'kbWriteComment');
	ajax.addParam('sysparm_search', escape(query.value));
	ajax.addParam('sysparm_id', sys_id);
	if (flag)
		ajax.addParam('sysparm_flag', flag.checked);
	ajax.addParam('sysparm_feedback', escape(comments));
	ajax.addParam('view_id', view_id.value);
	ajax.getXML(kbFeedbackDone);
	$(name).value = '';
	$('commentsdiv_empty').hide();
	var commentLinkDiv = $('comment_link_div');
	if (commentLinkDiv)
		commentLinkDiv.hide();

	return false;
}

function hideComments() {
	gel('commentsdiv').style.display = 'none';
	if (gel('commentsdiv_done').style.display == 'none') {
		gel('comment_link_div').style.display = '';
		gel('comment_link_div_cancel').style.display = 'none';
	} else {
		gel('comment_link_div').style.display = 'none';
		gel('comment_link_div_cancel').style.display = 'none';
	}
}

function showComments() {
	if (gel('commentsdiv_done').style.display == 'none') {
		gel('commentsdiv').style.display = '';
		gel('comment_link_div').style.display = 'none';
		gel('comment_link_div_cancel').style.display = '';
	}
}

function toggleArticleFlag(e) {
	var msg = gel('commentsdiv_flagmsg');
	var inputdiv = gel('commentsdiv');
	var donemsg = gel('commentsdiv_done');
	var input = gel('article_comments');
	if (e.checked) {
		showObject(msg);
		hideObject(donemsg);
		openFeedback();
	} else
		hideObject(msg);
}

function openFeedback() {
	var cmtdivdone = gel('commentsdiv_done');
	var cmtdiv = gel('commentsdiv');

	if (cmtdivdone) {
		if (cmtdivdone.style.display != 'block') {
			var commentsdiv = gel('commentsdiv');
			showObject(commentsdiv);
			window.scrollBy(0, 9999999);
			var e = gel('article_comments');
			if (e)
				e.focus();
			window.scrollBy(0, -20);
		} else {
			cmtdivdone.style.display = 'none';
			var feedBackText = gel('article_comments');
			feedBackText.value = '';
			cmtdiv.style.display = 'block';
		}
	}
}

function postUsedDone(answer) {
	var data = answer.evalJSON(true);
	if (!data) {
		return kbViewArticle.showInfoMessage('Useful rating not submitted');
	}
	if (!data.success) {
		return kbViewArticle.showInfoMessage(data.message);
	}
	kbViewArticle.showInfoMessage(data.message);
}

function postUsed(id, useful) {
	var view = gel('view_id');
	var query = gel('sysparm_search');

	if (id) {
		var ajax = new GlideAjax('KBAjaxSNC');
		ajax.addParam('sysparm_type', 'saveUseful');
		if (query)
			ajax.addParam('sysparm_search', escape(query.value));
		else
			ajax.addParam('sysparm_search', '');
		ajax.addParam('sysparm_article_id', id);
		ajax.addParam('sysparm_useful', useful);
		if (view)
			ajax.addParam('sysparm_view_id', view.value);
		ajax.getXMLAnswer(postUsedDone);
	}
	if (isNaN(useful)) {
		var elem;
		if (useful == 'yes') {
			hideObject(gel('noarticlerating'));
			elem = gel('yesarticlerating');
			if (elem) {
				elem.setAttribute('onclick', '');
				elem.setAttribute('class', 'kb_link_disable');
				elem.setAttribute('className', 'kb_link_disable');
			}
		} else if (useful == 'no') {
			hideObject(gel('yesarticlerating'));
			elem = gel('noarticlerating');
			if (elem) {
				elem.setAttribute('onclick', '');
				elem.setAttribute('class', 'kb_link_disable');
				elem.setAttribute('className', 'kb_link_disable');
			}
		} else hideObject(gel('articlerating'));

		showObject(gel('articleratingsubmitted'));
	}
}

function changeWasThisHelpfulToOn(element, sysId) {
	element.style.display = 'none';
	gel('wasThisHelpfulCheckedIcon').style.display = 'inline';
	postUsed(sysId, 'yes');
}

function changeWasThisHelpfulToOff(element, sysId) {
	element.style.display = 'none';
	gel('wasThisHelpfulUncheckedIcon').style.display = 'inline';
	gel('articleratingsubmitted').style.display = 'none';
	postUsed(sysId, '');
}

/*
 * Initialize the page after the DOM is fully loaded.
 */
$j(function () {
	window.kbViewArticle = new KbViewArticle();
	kbViewArticle.setCanContribute(kbConfig.canContribute);
	kbViewArticle.onLoaded();
	kbViewArticle.setPageViewable();
	if (kbViewArticle.isDisplayFromPopup()) {
		//enables to move attach to button to top right corner
		$j('.snc-article-header-toolbar').css("padding-right", 0);
	}

	// Remove hidden buttons wrecking page layout in RTL mode.
	if ($j('html').is('.rtl')) {
		var inc = 0;
		var fnc = function() {
			var buttons = $j('button').filter(function () {
				return this.style.left == '-9999px';
			});
			if (buttons.length) {
				// Delete useless hidden buttons which caused to stretch the page width.
				buttons.remove();
			}
			if (++inc > 5) {
				clearInterval(window.cleanupBtns);
			}
		};
		// Timeout needed to catch hidden buttons and menus generated/injected after the page has loaded.
		window.cleanupBtns = setInterval(fnc, 150);
	}

});

