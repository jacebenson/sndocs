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
    this._setupAnnouncer();
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
    options = Object.extend({
      msg: '',
      id: '',
      type: 'info'
    }, options || {});
    var divs = this._getOutputMessageDivs();
    if (!divs)
      return false;
    var newMsg;
    if (typeof options.id == 'undefined' || options.id == '')
      newMsg = GlideUI.OUTPUT_MESSAGE_TEMPLATE.evaluate(options);
    else
      newMsg = GlideUI.OUTPUT_MESSAGE_TEMPLATE_WITH_ID.evaluate(options);
    divs.container.insert(newMsg);
    divs.messages.show();
    if (options.msg)
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
    divs.messages.hide();
    divs.container.innerHTML = '';
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
    var firstNavElement = $$('nav.navbar')[0];
    if (firstNavElement) {
      firstNavElement.setStyle({
        marginBottom: '0px'
      });
      firstNavElement.insert({
        after: GlideUI.NAV_MESSAGE_TEMPLATE.evaluate(options)
      });
      this.adjustTopScrollHeight();
      return true;
    }
    return false;
  },
  clearNavMessage: function() {
    var navMessage = $('nav_message');
    if (!navMessage)
      return false;
    navMessage.remove();
    var firstNavElement = $$('nav.navbar')[0];
    if (firstNavElement)
      firstNavElement.setStyle({
        marginBottom: '5px'
      });
    this.adjustTopScrollHeight();
    return true;
  },
  adjustTopScrollHeight: function() {
    var fixedContent = $$('div[data-position-fixed-header="true"]')[0];
    if (!fixedContent)
      return;
    var scrollContent = $$('div[data-position-below-header="true"]')[0];
    if (!scrollContent)
      return;
    scrollContent.setStyle({
      top: fixedContent.getHeight() + 'px'
    });
    if (fixedContent.getHeight() > 60) {
      var debugRelated = $$('div#debug_related')[0];
      if (debugRelated) {
        var marginHeight = fixedContent.getHeight() + 20;
        debugRelated.setStyle({
          marginTop: marginHeight + 'px'
        });
      }
    }
  },
  _getOutputMessageDivs: function() {
    var divs = {};
    divs.messages = $(this.outputMessagesTag);
    if (!divs.messages)
      return null;
    divs.container = divs.messages.select(this.outputMsgDivClass)[0];
    if (!divs.container)
      return null;
    return divs;
  },
  _setupAnnouncer: function() {
    var self = this;
    addRenderEvent(function() {
      var element = document.createElement('span');
      element.setAttribute('role', 'alert');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('class', 'sr-only');
      document.body.appendChild(element);
      self._announcer = element;
    }, false);
  },
  _announce: function(type, text) {
    if (this._announcer) {
      this._pruneOldMessages();
      var textNode = document.createTextNode(type + ': ' + text);
      this._announcer.appendChild(textNode);
      this._announcer.style.display = 'none';
      this._announcer.style.display = 'inline';
      setTimeout(function() {
        textNode.readyToDelete = true;
      }, 5000);
    }
  },
  _pruneOldMessages: function() {
    var nodes = this._announcer.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.readyToDelete)
        node.parentNode.removeChild(node);
    }
  },
  toString: function() {
    return 'GlideUI';
  }
});
GlideUI.UI_NOTIFICATION = 'glide:ui_notification';
GlideUI.UI_NOTIFICATION_SYSTEM = GlideUI.UI_NOTIFICATION + '.system';
GlideUI.UI_NOTIFICATION_INFO = GlideUI.UI_NOTIFICATION + '.info';
GlideUI.UI_NOTIFICATION_ERROR = GlideUI.UI_NOTIFICATION + '.error';
GlideUI.UI_NOTIFICATION_SYSTEM_EVENT = GlideUI.UI_NOTIFICATION + '.system_event';
GlideUI.OUTPUT_MESSAGE_TEMPLATE = new Template(
  '<div class="outputmsg outputmsg_#{type} notification notification-#{type}">' +
  '<img class="outputmsg_image" src="images/outputmsg_#{type}_24.gifx" alt=""/>' +
  '<span class="outputmsg_text">#{msg}</span>' +
  '</div>'
);
GlideUI.OUTPUT_MESSAGE_TEMPLATE_WITH_ID = new Template(
  '<div class="outputmsg outputmsg_#{type} notification notification-#{type}" id="#{id}">' +
  '<img class="outputmsg_image" src="images/outputmsg_#{type}_24.gifx" alt=""/>' +
  '<span class="outputmsg_text">#{msg}</span>' +
  '</div>'
);
GlideUI.NAV_MESSAGE_TEMPLATE = new Template(
  '<div id="nav_message" class="outputmsg_nav">' +
  '<img src="images/icon_nav_info.png"/>' +
  '<span class="outputmsg_text outputmsg_nav_inner">&nbsp;#{msg}</span>' +
  '</div>'
);
window.g_GlideUI = new GlideUI();
GlideUI.get = function() {
  return window.g_GlideUI;
};;