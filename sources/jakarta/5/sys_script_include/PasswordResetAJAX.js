var PasswordResetAJAX = Class.create();

PasswordResetAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   
   isPublic: function() {
        return true;
   },
      
   process : function() {
      var userid = this.getParameter('sysparm_userid');
      var email = this.getParameter('sysparm_email') ;
      var response = this._resetPassword(userid, email);
      var item = this.newItem();
      item.setAttribute("result", response.split(':')[0]);
      item.setAttribute("message", response.split(':')[1]);
   },
   
   _resetPassword : function(userid, email) {
      var msg = "";
      var usr = new GlideRecord('sys_user');
      usr.addQuery('active', 'true');
      usr.addQuery('user_name', userid);
      usr.queryNoDomain();
      if(usr.next()) {
         //alert and exit if ldap account
         if (usr.source.toString().startsWith('ldap')) {
            msg = gs.getMessage("Use your network password to log into Service-now. If your network password does not work, contact your service desk.");
            return "Error:" + msg;
         }
         if(usr.email.toLowerCase() != email.toLowerCase()) {
            msg = gs.getMessage("Either the username or email address does not match an active user in our system");
            return "Error:" + msg;
         }
         else {
            newpw = "";
            var availablechars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            for(var x = 0; x < 8; x++) {
               randomNumber = Math.floor(Math.random() * availablechars.length);
               newpw += availablechars[randomNumber];
            }
            usr.user_password.setDisplayValue(newpw);
            usr.password_needs_reset = true;
            usr.update();
            gs.eventQueue("password.reset", usr, email, newpw);
            msg = gs.getMessage("Your password has been reset and will be emailed to the address in our system");
            return "Success:" + msg;
         }
      } else {
         msg = gs.getMessage("Either the username or email address does not match an active user in our system");
         return "Error:" + msg;
      }
   },
   
   type : "PasswordResetAJAX"
});