action.setRedirectURL(current);
var rec = new GlideRecord('kb_social_qa_vote');
var currentUser = new global.GlobalKnowledgeUtil().getSessionProfile();
var referenceName = 'kb_social_qa_question';
rec.addQuery('reference_id',current.sys_id);
rec.addQuery('reference_name', referenceName);
rec.addQuery('profile',currentUser );
rec.query(); 
var isFound = false;
if(rec.next()) { 
		isFound =true;
		if(rec.up_vote != true){
			rec.deleteRecord();
		}
}
if(!isFound) {
	var gr = new GlideRecord('kb_social_qa_vote');
	gr.initialize(); 
	gr.reference_id = current.sys_id; 
	gr.reference_name = referenceName; 
	gr.up_vote = true;
	gr.insert();
}
