var UserAuthentication = Class.create();
UserAuthentication.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
  ajaxFunction_authorizedUser: function() {
   var user = new User();
   var authed = user.authenticate(this.getParameter('sysparm_user') , this.getParameter('sysparm_password'));
   return authed; 
  }, 
   
  ajaxFunction_getGroups: function() {
   return new UserGroup().getGroups(this.getParameter('sysparm_sys_id'));
  }
});


