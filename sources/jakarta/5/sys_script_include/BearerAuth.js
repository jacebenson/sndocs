var BearerAuth = Class.create();

BearerAuth.prototype = {
   initialize : function(request, response, auth_type, auth_value) {
      this.request = request;
      this.response = response;
      this.auth_type = auth_type;
      this.auth_value = auth_value;
   },
   
   getAuthorized : function() {
	  var result = GlideUser.authenticateOAuthAccessToken(this.auth_value);      
      if (!result) {
         gs.log("Oauth authentication failed for access token: " + this.auth_value);
         return null;
      }

      this.updateLastLogin(result);
      
      // user is authenticated, so return it...
      return result;
   },

   updateLastLogin : function(userName) {
      if ('true' != gs.getProperty("glide.oauth.update_last_login_time", "false"))
        return;

      var user = new GlideRecord("sys_user");
      user.addQuery("user_name", userName);
      user.query();
      if(user.next()){
         user.last_login_time = new GlideDateTime();
         user.update();
      }
   }
}