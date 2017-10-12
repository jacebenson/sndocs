/*! RESOURCE: /scripts/classes/GlideUI.js */
var GlideUI = Class.create({
      initialize: function() {
        this.topWindow = getTopWindow() || window;
        this.outputMessagesTag = "output_messages";
        this.outputMsgDivClass = ".outputmsg_div";
        if (window.NOW && window.NOW.ngLegacySessionNotificationSupport) {
          return;
        }
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_SYSTEM, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_INFO, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_ERROR, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_SYSTEM_EVENT, this._eventNotification.bind(this));
      },
      setMsgTags: function(msgTag, msgDivClass) {
        this.outputMessagesTag = msgTag;
        this.outputMsgDivClass = msgDivClass;
      },
      display: function(htmlTextOrOptions) {
        alert('GlideUI.display() needs to be implemented in an overriding class');
      },
      fireNotifications: function() {
        var spans = $$('span.ui_notification');
        for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          this.fire(new GlideUINotification({
            xml: span
          }));
        }
      },
      fire: function(notification) {
          this.topWindow.CustomEvent.fireTop(Glide