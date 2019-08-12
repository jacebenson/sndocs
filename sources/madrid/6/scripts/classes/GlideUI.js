/*! RESOURCE: /scripts/classes/GlideUI.js */
var GlideUI = Class.create({
      initialize: function() {
        this.topWindow = getTopWindow() || window;
        this.outputMessagesTag = "output_messages";
        this.outputMsgDivClass = ".outputmsg_div";
        this.messages = {};
        if (window.NOW && window.NOW.ngLegacySessionNotificationSupport) {
          return;
        }
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_SYSTEM, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_INFO, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_ERROR, this._systemNotification.bind(this));
        CustomEvent.observe(GlideUI.UI_NOTIFICATION_SYSTEM_EVENT, this._eventNotification.bind(this));
        this._setupAnnouncer();
        this._scrapePageLoadMessages();
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
        this.topWindow.CustomEvent.fireTop(GlideUI.UI_NOTIFICATION + '.' + notification.getType(), notification);
      },
      _systemNotification: function(notification) {
        if (window.NOW && window.NOW.ngLegacySessionNotificationSupport) {
          return;
        }
        var options = {
          text: notification.getText(),
          type: notification.getType()
        };
        if (!options.text)
          return;
        this.display(options);
      },
      _eventNotification: function(notification) {
        var type = notification.getAttribute('event');
        if (type == 'refresh_nav')
          CustomEvent.fireTop('navigator.refresh');
      },
      addOutputMessage: function(options) {
        srMessage = {
          info: "Info Message",
          warning: "Warning Message",
          error: "Error Message",
          success: "Success Message"
        };
        options = Object.extend({
          msg: '',
          id: '',
          icon: 'icon-info',
          iconSr: srMessage.info,
          type: 'info',
          preventDuplicates: true
        }, options || {});
        document.addEventListener("DOMContentLoaded", function(event) {
          if (window.nowapi) {
            window.nowapi.g_i18n.getMessages([srMessage.info, srMessage.warning, srMessage.error, srMessage.success], function(translations) {
              srMessage.info = translations[srMessage.info];
              srMessage.warning = translations[srMessage.warning];
              srMessage.error = translations[srMessage.error];
              srMessage.success = translations[srMessage.success];
            });
          }
        });
        if (options.type === 'error') {
          options.icon = 'icon-cross-circle';
          options.iconSr = srMessage.error;
        } else if (options.type === 'warning') {
          options.icon = 'icon-alert';
          options.iconSr = srMessage.warning;
        } else if (options.type === 'success') {
          options.icon = 'icon-check-circle';
          options.iconSr = srMessage.success;
        }
        var divs = this._getOutputMessageDivs();
        if (!divs)
          return false;
        var newMsg;
        if (typeof options.id == 'undefined' || options.id == '')
          newMsg = GlideUI.OUTPUT_MESSAGE_TEMPLATE.evaluate(options);
        else
          newMsg = GlideUI.OUTPUT_MESSAGE_TEMPLATE_WITH_ID.evaluate(options);
        var messageKey = options.type + "_" + options.msg;
        if (options.preventDuplicates && this.messages[messageKey])
          return false;
        this.messages[messageKey] = true;
        divs.container.insert(newMsg);
        this.show(divs.messages);
        if (options.msg && this._shouldAnnounce(divs.container))
          this._announce(options.type, options.msg);
        if (window._frameChanged)
          _frameChanged();
        return true;
      },
      clearOutputMessages: function(closeImg) {
        var divs;
        if (closeImg) {
          closeImg = $(closeImg);
          divs = {
            messages: closeImg.up(),
            container: closeImg.up().select(this.outputMsgDivClass)[0]
          }
        } else
          divs = this._getOutputMessageDivs();
        if (!divs)
          return false;
        this.hide(divs.messages);
        divs.container.innerHTML = '';
        this.messages = {};
        return true;
      },
      setNavMessage: function(options) {
          options = Object.extend({
            msg: ''
          }, options || {});
          var navMessage = $('nav_message');
          if (navMessage) {
            navMessage.replace(GlideUI.NAV_MESSAGE_TEMPLATE.evaluate(options));
            this.adjustTopScrollHeight();
            return true;
          }
          var firstNavElement = $$('nav.