function(scope, elem, attr) {
	scope.setQuestionCommentBoxFocus = function () {
		setTimeout(function () {
			elem.find("input.comment-question-textarea").attr('tabIndex', '-1').focus();
		}, 0);
	};
	scope.setAnswerCommentBoxFocus = function () {
		setTimeout(function () {
			var inboxArray = elem.find("input.comment-answer-textarea");
			inboxArray.attr('tabIndex', '-1').focus();
		}, 0);
	};
}