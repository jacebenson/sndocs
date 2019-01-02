function($scope, $location) {
	var c = this;

	c.clickQuestion = function($event, question) {
		$event.stopPropagation();
		$event.preventDefault();
		$location.search({id: "kb_social_qa_question", sys_id: question.sys_id});
	}

	c.questionVoteDirection = function(votes) {
		return {
			'fa-chevron-up': votes >= 0,
			'fa-chevron-down': votes < 0
		}
	}
}