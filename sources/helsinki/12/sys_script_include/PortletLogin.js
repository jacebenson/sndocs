var PortletLogin = Class.create();

PortletLogin.prototype = {
  initialize : function() {
      this.user = request.getParameter("u");
      this.pass = request.getParameter("p");
      this.gUser = GlideUser;
  },
  
  process: function() {
      if (gs.nil(this.user) || gs.nil(this.pass) || !this.gUser.authenticate(this.user, this.pass)) {
            var message = gs.getMessage("login_invalid");
            root.setAttribute("auth", "fail");
            root.setAttribute("message", message);
            session.addErrorMessage(message);
            session.flushMessages();
            return;
        }
        
        root.setAttribute("auth", "ok");
        session.setUser(this.user);
        session.flushMessages();
        
        var hs = request.getSession();
        hs.setAttribute("glide_user", this.user);
        hs.setAttribute("glide_user_cookie", "true");
        gs.log("User: " + session.getUserName() + " logged in");
  },
  
  type: "PortletLogin"
}