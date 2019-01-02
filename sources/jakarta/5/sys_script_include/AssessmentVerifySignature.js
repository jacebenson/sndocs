var AssessmentVerifySignature = Class.create();
AssessmentVerifySignature.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	verifySignature: function() {
		if (this.authorizedUser(this.getParameter('sysparm_user') , this.getParameter('sysparm_password'))) {
			return "true";
		}
		return "false";
	},
	
	authorizedUser: function(user_name, password) {
		return GlideUser().authenticate(user_name, password) && this.isCurrentUser(user_name); 
	}, 
	
	isCurrentUser: function(user_name){
		var gr = new GlideRecord("sys_user");
		gr.addQuery("sys_id", gs.getUserID());
		gr.query();
		if (gr.next())
			return gr.user_name.toLowerCase() == user_name.toLowerCase(); 
		return false;
	},
	
	_privateFunction: function() { // this function is not client callable
	
}

});