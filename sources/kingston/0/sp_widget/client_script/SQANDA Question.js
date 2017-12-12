function ($http, $scope, $window, spUtil, $rootScope, $timeout, spAriaUtil) {
	var c = this;
	$rootScope.$broadcast([
		{label: $scope.data.communityBreadcrumb, url: '?id=sqa_tagged_questions'},
		{label: $scope.page.title, url: '#'}
	])

	// switch forms
	var unregister = $scope.$on('$sp.list.click', onListClick);
	$scope.$on("$destroy", function() {
		unregister();
	});

	function onListClick(evt, arg) {
		c.data.sys_id = arg.sys_id;
		c.server.update();
	}

	c.optionalMessage = "";
	c.recipientList = "";
	c.link = $window.location.href.replace("&", "%26");

	c.questionVotingDisabled = function() {
		return (c.data.userIsGuest || c.data.question.profile.sys_id == c.data.liveProfileID);
	}

	c.shareConnect = function($event) {
		var recipientArr = [];
		c.recipientList.split(",").forEach(function(id) {
			recipientArr.push("sys_user." + id);
		});

		var payload = {
			attachments: [],
			has_attachments: false,
			message: c.optionalMessage + "\n\n" + c.link,
			recipients: recipientArr
		}

		$http.post("/api/now/connect/messages", payload).then(function(response) {
			c.optionalMessage = "";
			c.recipientList = "";
			$scope.$broadcast("sp-recipient-list.clear");
			if (response.status === 201) {
				$('#shareModal').modal('hide');
			} else {

			}
		});

	}

	c.isSubscribedStyle = function() {
		return {color: (c.data.question.subscription !== "") ? '#fcc742' : '#cfcfcf'};
	};

	function addTimestamp(comment) {
		comment.timestamp = new Date(comment.sys_created_on).getTime();
		return comment;
	}

	for (var id in c.data.comments) {
    c.data.comments[id].map(addTimestamp);
	}

	c.createAnswerDraft = "";

	c.createAnswer = function() {
		if (c.data.userIsGuest) return;

		if (c.createAnswerDraft.length <= 0) return;
		
		$http.post("/api/now/table/kb_social_qa_answer", {
			question: c.data.questionID,
			answer: c.createAnswerDraft,
			accepted: false,
			sys_id: c.data._attachmentGUID
		}).then(function(response) {
			if (response.status === 201) {//created
				var newAnswer = response.data.result;
				newAnswer.accepted = (newAnswer.accepted === "true");
				newAnswer.has_comment = (newAnswer.has_comment === "true");
				newAnswer.addCommentState = false;
				spAriaUtil.sendLiveMessage(c.data.answerSubmitted);

				$http.get(newAnswer.profile.link).then(function(response) {
					if (response.status == 200) {
						newAnswer.profile = response.data.result;
						$http.get(response.data.result.document.link).then(function(response) {
							if (response.status == 200)
								newAnswer.profile.document = response.data.result;
						});
					}
				});

				c.data.votes[newAnswer.sys_id] = [];
				c.data.comments[newAnswer.sys_id] = [];
				c.data.answers.push(newAnswer);
				c.createAnswerDraft = "";
		
				c.server.get({method:'generate_guid'}).then(function(response) {
					c.data._attachmentGUID = response.data._attachmentGUID;
				});
			}
		});
	};

	c.toggleEdit = function($event, editObj, editFieldName) {
		if (editObj.editState)
			editObj.editState = false;
		else {
			editObj.draft = editObj[editFieldName];
			editObj.editState = true;
		}
	};

	c.edit = function(refObj, refField, table) {
		var reqParameters = {};
		reqParameters[refField] = refObj.draft;
		$http.put("/api/now/table/" + table + "/" + refObj.sys_id, reqParameters)
			.then(function(response) {
				if (response.status === 200) {
					refObj[refField] = response.data.result[refField];
					refObj.editState = false;
					spAriaUtil.sendLiveMessage($scope.data.editMsg);
				}
			});
	};

	c.postComment = function($event, referenceObj, referenceTable) {
		if (c.data.userIsGuest) return;

		if (referenceObj.commentDraft.length <= 0) return;
		
		$http.post("/api/now/table/kb_social_qa_comment", {
			comment: referenceObj.commentDraft,
			reference_id: referenceObj.sys_id,
			reference_name: referenceTable
		}).then(function(response) {
			if (response.status === 201) {
				var newComment = response.data.result;
				newComment.timestamp = new Date(newComment.sys_created_on).getTime();
				$http.get(newComment.profile.link).then(function(response) {
					if (response.status === 200) {
						newComment.profile = response.data.result;
						$http.get(response.data.result.document.link).then(function(response) {
							if (response.status == 200)
								newComment.profile.document = response.data.result;
						});
					}
				});
				c.data.comments[referenceObj.sys_id].push(newComment);
				referenceObj.addCommentState = false;
				referenceObj.commentDraft = "";
				spAriaUtil.sendLiveMessage($scope.data.commentPostedMsg);
			}
		});
	};

	c.cancelComment = function($event, referenceObj) {
		referenceObj.addCommentState = false;
		referenceObj.commentDraft = "";
		spAriaUtil.sendLiveMessage($scope.data.cancelCommentMessage);
	};

	c.handleCommentSubmitEvent = function($event, referenceObj, referenceTable) {
		if ($event.keyCode === 13) {
			c.postComment($event, referenceObj, referenceTable);
		}
	};

	c.getVoteCount = function(voteArray) {
		var upvotes = voteArray.filter(function(vote) {return vote.type === "upvote";});
		var downvotes = voteArray.filter(function(vote) {return vote.type === "downvote";});
		return upvotes.length - downvotes.length;
	};

	c.showActiveArrow = function(id, isUpvote) {
		var votes = $.grep(c.data.votes[id], function(vote) {return vote.profile === c.data.liveProfileID;});
		if (votes.length <= 0) return false;
		var vote = votes[0];
		return isUpvote === (vote.type === "upvote");
	};

	c.goToUser = function(userID) {
		window.location.href = "?id=user_profile&sys_id=" + userID;
	};

	c.vote = function($event, table, id, isUpvote) {
		if (c.data.userIsGuest)
			return;

		if (table === "kb_social_qa_question" && c.questionVotingDisabled())
			return;

		if (c.data.votes[id].some(function(vote) {return vote.profile === c.data.liveProfileID;})) {
			var vote = $.grep(c.data.votes[id], function(vote) {return vote.profile === c.data.liveProfileID;})[0];
			$http({
				method: "DELETE",
				url: "/api/now/table/kb_social_qa_vote/" + vote.sys_id
			}).then(function(response){
				c.data.votes[id] = c.data.votes[id].filter(function(v) {return v.sys_id !== vote.sys_id;});
			});
		} else {
			$http.post("/api/now/table/kb_social_qa_vote", {
				reference_id: id,
				reference_name: table,
				up_vote: isUpvote
			}).then(function(response) {
				if (response.status === 201) {
					var result = response.data.result;
					result.profile = result.profile.value || "";
					result.type = (result.up_vote === "true") ? "upvote" : "downvote";
					c.data.votes[result.reference_id.value].push(result);
				}
			});
		}
	};

	c.toggleAccept = function($event, answerID, acceptValue) {
		if (c.data.userIsGuest) return;

		$http.put("/api/now/table/kb_social_qa_answer/" + answerID, {
			accepted: acceptValue
		}).then(function(response) {
			if (response.status === 200) {
				for (var i = 0; i < c.data.answers.length; i++) {
					if (c.data.answers[i].sys_id === answerID)
						c.data.answers[i].accepted = (response.data.result.accepted === "true");
					 else 
						c.data.answers[i].accepted = false;
				}
				if(response.data.result.accepted === "true")
					spAriaUtil.sendLiveMessage($scope.data.acceptedMsg);
				else
					spAriaUtil.sendLiveMessage($scope.data.unAcceptedMsg);
			}
		});
	};

	c.toggleSubscribe = function($event) {
		if (c.data.userIsGuest) return;

		if (c.data.question.subscription) { //unsubscribe
			$http({
				method: "DELETE",
				url: "/api/now/table/kb_social_qa_subscribe/" + c.data.question.subscription
			}).then(function(response) {
				if (response.status === 204) {
					c.data.question.subscription = "";
					spAriaUtil.sendLiveMessage($scope.data.unsubscribeMessage);
				}
			});
		} else { //subscribe
			$http.post("/api/now/table/kb_social_qa_subscribe", {
				profile: c.data.liveProfileID,
				question: c.data.questionID
			}).then(function(response) {
				if (response.status === 201) {
					c.data.question.subscription = response.data.result.sys_id;
					spAriaUtil.sendLiveMessage($scope.data.subscribeMessage);
				}
			});
		}
	};
	
	c.toggleCommentState = function() {
		c.data.question.addCommentState = !c.data.question.addCommentState;
		if (c.data.question.addCommentState)
			$scope.setQuestionCommentBoxFocus();
	};
	
	c.toggleAnswerCommentState = function(index) {
		c.data.answers[index].addCommentState = !c.data.answers[index].addCommentState;
		$scope.setAnswerCommentBoxFocus();
	};
	
	c.getEmailSubject = function() {
		return c.data.question.question ? window.encodeURIComponent(c.data.question.question) : "";
	};
}
