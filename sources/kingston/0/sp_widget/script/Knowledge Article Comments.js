data.disabled = false;
data.isLoggedInUser = gs.getSession().isLoggedIn();
data.tsQueryId = $sp.getParameter("sysparm_tsqueryId") || "";
if(input && input.article_id){
	var action = input.action;
	if(action === 'fetch_comments'){
		if(input.article_id){
				fetchComments(input.article_id);			
		}
	}
	else if (action === 'add_comment'){
		addNewFeedback(true, false);
	}
	else if (action === 'submit_rating'){
		addNewFeedback(false, true);
	}
	
}
function fetchComments(articleId){
	data.feedback = getFeedback(articleId);
}


function addNewFeedback(hasComments, hasRatings){
	if (input.article_id) {
		data.sys_id = input.article_id;
		var articleGR = new GlideRecord("kb_knowledge");
		articleGR.get(data.sys_id);
		var gr = new GlideRecord('kb_feedback');
		gr.user = gs.getUserID();
		if (hasComments && input.commentText)
			gr.comments = input.commentText;
		if (hasRatings && input.rating) 
			gr.rating = input.rating;

		gr.article = input.article_id;
		gr.session_id = gs.getSessionID();
		gr.search_id = data.tsQueryId;
		data.commentId = gr.insert();
		
		data.currentUserName = gr.user.getDisplayValue();
		data.timeStamp = new Date();
		data.disabled = true;
	}	
}

function add(name) {
	if (gr[name].getED().isDateType())
		f[name] = gr.getValue(name);
	else
		f[name] = gr[name].getDisplayValue();
}
function getFeedback(articleID) {
  var feedback = [];
  var gr = new GlideRecord("kb_feedback");
  gr.addQuery("article", articleID);
	gr.addNotNullQuery("comments");
  gr.orderByDesc('sys_created_on');
  gr.query();
  while (gr.next()) {
    var f = {};
    add('comments');
    add('rating');
    add('user');
    add('useful');
    add('sys_created_on');
    feedback.push(f);
  }

  return feedback;


}

