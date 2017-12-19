var RatingUtilsAJAX = Class.create();
RatingUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	setRating: function() {
		var table = this.getParameter('sysparm_table');
		var recordId = this.getParameter('sysparm_recordId');
		var userId = this.getParameter('sysparm_userId');
		var rating = this.getParameter('sysparm_rating');
		var comment = this.getParameter('sysparm_comment');
		var like = this.getParameter('sysparm_like');
		new SNC.Rating().submitRating(table, recordId, userId, rating, comment, like);
	},
	
	type: 'RatingUtilsAJAX'
});