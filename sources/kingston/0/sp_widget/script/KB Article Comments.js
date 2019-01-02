data.submitMsg = gs.getMessage("Submit");
data.sys_id = $sp.getParameter('sys_id');
var articleGR = GlideRecord("kb_knowledge");
articleGR.get(data.sys_id);

if (input) {
  data.sys_id = input.sys_id;
	articleGR = new GlideRecord("kb_knowledge");
	articleGR.get(input.sys_id);
  data.response = gs.getMessage('Thank you for your feedback');
  data.comments = "";
  data.disabled = true;

  var gr = new GlideRecord('kb_feedback');
  gr.user = gs.getUserID();
  if (input.comments)
		gr.comments = input.comments;
  if (input.rating) 
    gr.rating = input.rating;

  gr.article = input.sys_id;
  gr.insert();
}

data.isValid = articleGR.isValidRecord() && articleGR.canRead() && !articleGR.direct;
// a kb_knowledge record can individually disable comments, otherwise
// check widget option and possibly system properties
data.allowFeedback = !articleGR.disable_commenting && showComments();
data.allowRating = showStarRating();
data.rating = 0;

data.feedback = [];
if (data.isValid && data.allowFeedback)
	data.feedback = getFeedback(data.sys_id);

// private functions
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

  function add(name) {
    if (gr[name].getED().isDateType())
      f[name] = gr.getValue(name);
    else
      f[name] = gr[name].getDisplayValue();
  }
}

function showStarRating() {
	if (options.show_star_rating == "Yes")
		return true;

	if (options.show_star_rating == "No")
		return false;

	if (gs.getProperty("glide.knowman.show_star_rating", "true") != "true")
		return false;

	return gs.hasRole(gs.getProperty("glide.knowman.show_star_rating.roles"));
}

function showComments() {
	if (options.show_user_feedback == "Yes")
		return true;

	if (options.show_user_feedback == "No")
		return false;

	if (gs.getProperty("glide.knowman.show_user_feedback", "onload") == "never")
		return false;

	return gs.hasRole(gs.getProperty("glide.knowman.show_user_feedback.roles"));
}