function ($rootScope, $scope, spUtil, $timeout) {
	var c = this;
	c.isValid = true;//$rootScope.isValid;
	c.article_sys_id = $rootScope.article_sys_id;
	c.properties = $rootScope.properties;
	c.messages = $rootScope.messages;
	//c.showComments = c.options.show_user_comments != 'false' && $rootScope.properties && $rootScope.properties.showFeedBack;
	c.showComments = c.options.show_user_comments === 'Use system properties' ? ($rootScope.properties && $rootScope.properties.showFeedBack) : c.options.show_user_comments === 'Yes';
	c.commentsPrompt = c.options.add_comment_prompt ? c.options.add_comment_prompt : $rootScope.messages.ADD_COMMENT;
	//c.showRatings = c.options.show_star_rating != 'false' && $rootScope.properties && $rootScope.properties.showKBStarRating && $rootScope.properties.showKBRatingOptions;
	c.showRatings = c.options.show_star_rating === 'Use system properties' ? ($rootScope.properties && $rootScope.properties.showKBStarRating && $rootScope.properties.showKBRatingOptions) : c.options.show_star_rating === 'Yes';
	c.rateStyle = (c.showComments) ? 'pull-right' : 'kb-rate-mobile';
	
	$scope.submitComment = function(){
		$scope.server.get({action : 'add_comment', commentText : $scope.data.comments, article_id : $rootScope.article_sys_id, rating : $scope.data.rating}).then(function(r){
			
			if(r.data.commentId){
				$scope.success = true;
				$scope.data.response = $rootScope.messages.THANK_YOU;
				var commentRecord = {userName : r.data.currentUserName, createdOn : r.data.timeStamp, commentText : $scope.data.comments, justNow : 'Y'};
				$rootScope.comments.unshift(commentRecord);
			}
			else {
				$scope.success = false;
				$scope.data.response = $rootScope.messages.RATE_LIMIT_REACHED;
			}
			
			$scope.data.comments ="";
			$scope.clearMessage();
					
		});
	}
	$scope.$watch("data.rating", function() {
		if ($scope.data.rating && !$scope.data.allowFeedback){
					$scope.server.get({action : 'submit_rating', commentText : $scope.data.comments, article_id : $rootScope.article_sys_id, rating : $scope.data.rating}).then(function(r){
						$scope.success = true;
						$scope.data.response = $rootScope.messages.THANK_YOU;
						$scope.clearMessage();
					});

		
	}
	});
	
	$scope.clearMessage = function(){
		$timeout(function() {
			$scope.data.response = "";
		}, 2000);						

	}

}