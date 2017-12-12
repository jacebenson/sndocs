var HRUserAuthentication = Class.create();
HRUserAuthentication.prototype =  Object.extendsObject(global.AbstractAjaxProcessor, {
  ajaxFunction_authorizedUser: function() {
   var user = new GlideUser();
   var authed = user.authenticate(this.getParameter('sysparm_user') , this.getParameter('sysparm_password'));
   return authed && this.isCurrentUser(this.getParameter('sysparm_user')); 
  }, 
   
  isCurrentUser: function(user_name){
		var gr = new GlideRecord("sys_user");
		gr.addQuery("sys_id", gs.getUserID());
		gr.query();
		if (gr.next())
			return gr.user_name.toLowerCase() == user_name.toLowerCase(); 
		return false;
  }
});
