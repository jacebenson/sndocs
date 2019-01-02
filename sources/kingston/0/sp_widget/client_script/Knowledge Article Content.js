function($rootScope, $scope, $window, $timeout, spUtil, $sce, spModal, $uibModal) {
  /* widget controller */
  var c = this;
	$scope.data.kbText = $sce.trustAsHtml($scope.data.kbText);	
	c.flagMessage = null;
	$rootScope.$broadcast("sp.update.breadcrumbs", $scope.data.breadCrumb);
	$rootScope.properties = $scope.data.properties;
	$rootScope.messages = $scope.data.messages;
	$rootScope.isValid = c.data.isValid;
	$rootScope.comments = $scope.data.comments;
	$rootScope.article_sys_id = $scope.data.article_sys_id;
	$rootScope.attachments = $scope.data.attachments;
	$rootScope.attachedIncidents = $scope.data.attachedIncidents;
	$rootScope.affectedProducts = $scope.data.affectedProducts;
	$rootScope.displayAttachments = $scope.data.displayAttachments;
	$rootScope.hideFeedbackOptions = $scope.data.hideFeedbackOptions;
	$rootScope.helpfulContent = $scope.data.helpfulContent;
	$rootScope.tableName = $scope.data.tableName;
	$scope.data.isSubscribed = $scope.data.isArticleSubscribed || $scope.data.isArticleSubscribedAtKB;
	$scope.data.subscribeLabel = ($scope.data.isSubscribed ? $scope.data.messages.SUBSCRIBED : $scope.data.messages.SUBSCRIBE);
	c.createIncidentURL = c.options.create_task_url || ($scope.data.properties && $scope.data.properties.createIncidentURL);
	c.createIncidentLabel = c.options.create_task_prompt || $scope.data.messages.CREATE_INCIDENT;
	c.showCreateIncident = c.data.isLoggedInUser && c.options.show_create_incident_action != 'false' && c.data.properties && c.data.properties.showKBCreateIncident && c.createIncidentURL;
	c.showFlagArticle =  c.data.properties && c.data.properties.showKBFlagArticle && c.data.properties.showRatingOptions;
	c.showMenu = c.data.properties && (c.showFlagArticle || c.data.properties.isEditable || c.showCreateIncident);
	$rootScope.stackUrl = c.data.portalName + '?id=kb_article_view%26' +  (c.data.params.sysparm_article ? 'sysparm_article=' + c.data.params.sysparm_article : 'sys_kb_id=' + c.data.params.sys_kb_id);
	c.stackUrl = $rootScope.stackUrl;
	c.flagMessage = '';
	c.submitFlagWithoutComment = "${Please enter a comment to be able to flag the article}";
	c.submitFlagWithComment = "${Press this button to flag the article}";
	$scope.data.toggleSubscribed = ($scope.data.isSubscribed ? true : false);
	
	if(c.data.langList && c.data.langList.length > 1){
		for(lng in c.data.langList){
			if(c.data.langList[lng].selected == true){
				c.selectedLanguage = c.data.langList[lng];
				break;
			}
		}
	}
	
	c.showVersions = false;
	c.toggleVersions = function(){
		c.showVersions = !c.showVersions;
		$('#kbVersionInfo').slideToggle("fast");
	};
	
	c.selectLanguage = function(ind){
		$window.location.replace(c.data.portalName + '?id=kb_article_view&sys_kb_id=' + c.data.langList[ind].sys_id);	
	};
	
	c.showActionMenu = function(){
		if(c.showMenu){
			return true;
		}
		else{
			if(c.data.properties && c.data.properties.isSubscriptionEnabled && $window.innerWidth < 992)			
				return true;
			else
				return false;
		}
	}
	
	c.handleSubscribeButtonFocus = function(){
		if($scope.data.isSubscribed){
			$scope.data.subscribeLabel = $rootScope.messages.UNSUBSCRIBE;
			$scope.data.toggleSubscribed = !$scope.data.toggleSubscribed;
		}

	};
	
	c.handleSubscribeButtonBlur = function(){
		if($scope.data.isSubscribed){
			$scope.data.subscribeLabel = $rootScope.messages.SUBSCRIBED;
			$scope.data.toggleSubscribed = !$scope.data.toggleSubscribed;
		}
	}
	c.closeUnsubscribeModal = function(){
		$("#unSubscribeModal").modal('hide');
	};
	
	c.handleSubscription = function(confirmation){
		c.data.actionName = null;
		if(!$scope.data.isSubscribed){
			c.data.actionName = 'subscribe';
			c.data.articleSysId = $scope.data.article_sys_id;
			c.data.articleNum = $scope.data.number;
		}
		else
		{
			if($scope.data.isArticleSubscribed && !$scope.data.isArticleSubscribedAtKB){
				c.data.actionName = "unsubscribe";
				c.data.articleSysId = $scope.data.article_sys_id;
				c.data.articleNum = $scope.data.number;
				c.data.unsubscribeKB = false;
			}
			else if(!confirmation){
				//$("#unSubscribeModal").modal();
				var unsubscribeMessage = "<p>" + c.data.messages.UNSUBSCRIBE_CONTENT + "</p><p><b>" + c.data.messages.UNSUBSCRIBE_CONFIRMATION + "</b></p>";
				spModal.open(
					{
						title: c.data.messages.UNSUBSCRIBE, 
						buttons : [{label : c.data.messages.NO, cancel : true}, {label: c.data.messages.YES, primary : true}], 
						message : unsubscribeMessage
					}).then(function(){
					c.handleSubscription('Y');
				}, function(){
					c.closeUnsubscribeModal();
				});
					
				return;
			}
			else if(confirmation === 'Y'){
				c.data.actionName = "unsubscribe";
				c.closeUnsubscribeModal();
				c.data.articleSysId = $scope.data.article_sys_id;
				c.data.kbSysId = $scope.data.kbSysId;
				c.data.articleNum = $scope.data.number;
				c.data.kbName = $scope.data.kbName;
				c.data.unsubscribeKB = true;
			}
		}
		c.server.get({action : c.data.actionName, kbSysId : c.data.kbSysId, kbName : c.data.kbName, articleSysId : c.data.articleSysId, articleNum : c.data.articleNum, unsubscribeKB : c.data.unsubscribeKB, isArticleSubscribed: c.data.isArticleSubscribed, isKBSubscribed : c.data.isArticleSubscribedAtKB}).then(function(resp){
			if(c.data.actionName == 'subscribe'){
				$scope.data.isArticleSubscribed = true;				
				$scope.data.isSubscribed = true;
				$scope.data.subscribeLabel = $rootScope.messages.SUBSCRIBED;
			}
			else{
				$scope.data.isArticleSubscribed = false;
				$scope.data.isSubscribed = false;
				$scope.data.isArticleSubscribedAtKB = false;
				$scope.data.subscribeLabel = $rootScope.messages.SUBSCRIBE;
			}
			spUtil.addInfoMessage(resp.data.responseMessage);

		});
	};
	

	
	c.submitFlagComments = function(){
		if(!c.data.comment){
			c.flagMessage = "${Please provide a comment to flag the article}";
			$("#flagComment").focus();
			return false;
		}
		else{
			c.server.get({action : 'saveFlagComment', article_sys_id : c.data.article_sys_id, comment : c.data.comment}).then(function(resp){
				if(resp.data.responseMessage){
					spUtil.addInfoMessage(resp.data.responseMessage);
					c.clearComment();
				}

			});
			
		}
			
	};
	
	c.copyPermalink = function(){
			var v = document.createElement('textarea');
			v.innerHTML = document.location.href;
			v.className = "sr-only";
			document.body.appendChild(v);
			v.select();
			var result = true;
			try {
				result = document.execCommand('copy');
			}
			catch(err){
				result = false;
			}
			finally{
				document.body.removeChild(v);
			}
		if(result === true){
			spUtil.addInfoMessage(c.data.messages.PERMALINK_COPIED);
		}
		else{
			$window.prompt("${Because of a browser limitation the URL can not be placed directly in the clipboard. Please use Ctrl-C to copy the data and escape to dismiss this dialog}", document.location.href);
		}
		
	};
	var modal = null;
	c.launchFlagModal = function(){
		c.clearComment();
		modal = $uibModal.open(
			{
				title : c.data.messages.FLAG_THIS_ARTICLE,
				scope : $scope,
				templateUrl : 'kb-flag-article-modal'
			});
	}
	
	c.clearComment = function(){
		$scope.data.comment = '';
		c.flagMessage = '';
		if(modal){
			modal.dismiss();
		}
		
	}
}
