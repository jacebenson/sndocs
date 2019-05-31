/*! RESOURCE: /scripts/classes/doctype/NotificationMessage.js */
var NotificationMessage = Class.create({
  FADE_IN_DEFAULT_MS: 400,
  FADE_OUT_DEFAULT_MS: 200,
  CLOSE_DEFAULT_MS: 3000,
  initialize: function(options) {
    this.options = Object.extend({
      text: '',
      type: 'info',
      image: '',
      styles: {},
      sticky: false,
      fadeIn: this.FADE_IN_DEFAULT_MS,
      fadeOut: this.FADE_OUT_DEFAULT_MS,
      closeDelay: this.CLOSE_DEFAULT_MS,
      classPrefix: 'notification',
      container: 'ui_notification',
      classContainer: 'panel-body',
      bundleMessages: false,
      singleMessage: false,
      onBeforeOpen: function() {},
      onAfterOpen: function() {},
      onBeforeClose: function() {},
      onAfterClose: function() {}
    }, options || {});
    if (this.options.type == 'warn')
      this.options.type = 'warning';
    if (this.options.type === '')
      this.options.type = 'info';
    if (this.options.type == 'system')
      this.options.type = 'info';
    this.options.fadeIn = this._validNumber(this.options.fadeIn, this.FADE_IN_DEFAULT_MS);
    this.options.fadeOut = this._validNumber(this.options.fadeOut, this.FADE_OUT_DEFAULT_MS);
    this.options.closeDelay = this._validNumber(this.options.closeDelay, this.CLOSE_DEFAULT_MS);
    this._show();
  },
  _show: function() {
    var container = this._getContainer(this.options.container);
    this.options.onBeforeOpen.call(this);
    if (this.options.singleMessage)
      container.update("");
    this.notification = this._create();
    if (!this.options.bundleMessages || container.childElements().length === 0) {
      container.insert(this.notification);
      if (!this.options.sticky) {
        this.timeoutId = setTimeout(this._close.bind(this, false),
          this.options.closeDelay + this.options.fadeIn);
        this.notification.observe('mouseover', this._makeSticky.bind(this));
      }
    } else {
      var notification = container.down('.' + this.options.classPrefix);
      if (!notification)
        notification = this.notification;
      this._showOuterPanel(notification);
      NotificationMessage.prototype.messages.push(this.notification);
      this._updateMoreText(notification, NotificationMessage.prototype.messages.length + " more...");
    }
    this.notification.on('click', '.notification_close_action', this._close.bind(this, true));
    this.notification.fadeIn(this.options.fadeIn, function() {
      this.options.onAfterOpen.call(this);
    }.bind(this));
  },
  _close: function(boolCloseImmediately, closeEvent) {
    if (!this.notification || this._isClosing === true)
      return;
    this._isClosing = true;
    this.options.onBeforeClose.call(this);
    clearTimeout(this.timeoutId);
    this.timeoutId = null;

    function _onClose(notification) {
      this._isClosing = false;
      notification.stopObserving();
      var parent = notification.up();
      if (notification.up('.' + this.options.classContainer) &&
        notification
        .up('.' + this.options.classContainer).select('.' + this.options.classPrefix).length <= 1)
        notification.up('#' + this.options.container).remove();
      else {
        if (notification.parentNode)
          notification.remove();
        notification = null;
      }
      this.options.onAfterClose.call(this);
      if (isMSIE && parent) {
        parent.style.display = "none"
        parent.style.display = "block";
      }
    }
    var notification = this.notification;
    if (closeEvent && closeEvent.element)
      notification = closeEvent.element().up('.' + this.options.classPrefix + '-closable');
    if (boolCloseImmediately)
      _onClose.call(this, notification);
    else
      notification.animate({
        height: 0,
        opacity: 0.2
      }, this.options.fadeOut, _onClose.bind(this, notification));
  },
  _makeSticky: function() {
    clearTimeout(this.timeoutId);
    this.notification.stopObserving('mouseover');
    this.notification.down('.close').show();
    this.notification.addClassName(this.options.classPrefix + '_message_sticky');
  },
  _showAll: function(more) {
    if (this.notification.up(".panel-body").length === 0) {
      var notificationContainer = this._createContainer();
      this.notification.insert(notificationContainer)
      this.notification.wrap(notificationContainer);
      this.notification.addClassName("notification_inner");
      this.notification = notificationContainer;
    }
    for (var i = 0; i < NotificationMessage.prototype.messages.length; i++) {
      var notification = NotificationMessage.prototype.messages[i];
      this.notification.up('.panel-body').insert(notification);
      notification.stopObserving('mouseover');
      notification.down('.close').show();
      notification.addClassName(this.options.classPrefix + '_message_sticky');
    }
    more.up('.notification-more-container').hide();
    NotificationMessage.prototype.messages = [];
  },
  _getContainer: function(n) {
    var c = $(n);
    if (c)
      return c.down('.' + this.options.classContainer);
    c = new Element('div', {
      'id': n,
      'className': this.options.classPrefix + '_container notification-closable'
    });
    document.body.appendChild(c);
    this._createHeading(c);
    var body = this._createBody(c);
    this._createFooter(c);
    return body;
  },
  _createContainer: function() {
    return this._createMainDiv(true);
  },
  _createHeading: function(container) {
    var heading = new Element('div', {
      className: "panel-heading",
      style: 'display: none;'
    });
    var close = this._createCloseIcon();
    close.setStyle({
      display: "block"
    });
    heading.insert(close);
    heading.insert("<h3 class=\"panel-title\">Current Notification Messages</h3>");
    container.insert(heading);
  },
  _createBody: function(container) {
    var el = new Element('div', {
      className: this.options.classContainer,
      style: 'padding: 0;'
    });
    container.insert(el);
    return el;
  },
  _createFooter: function(container) {
    var el = new Element('div', {
      className: 'panel-footer notification-more-container',
      style: 'display:none; '
    });
    container.insert(el);
    el.insert(this._createMoreIcon());
  },
  _create: function() {
    var e = this._createMainDiv();
    e.appendChild(this._createCloseIcon());
    e.insert(this.options.text);
    e.style.display = 'none';
    return e;
  },
  _createCloseIcon: function() {
    var close = new Element('span', {
      className: 'icon-cross close',
      style: 'display: ' + (this.options.sticky ? 'block' : 'none')
    });
    close.observe('click', this._close.bind(this, true));
    return close;
  },
  _createMainDiv: function(isContainer) {
    var className = this.options.classPrefix;
    if (!isContainer && this.options.type)
      className += ' notification-closable ' + this.options.classPrefix + '-' + this.options.type;
    else if (isContainer)
      className = this.options.classPrefix + '_message_container panel-body';
    if (this.options.sticky)
      className += ' ' + this.options.classPrefix + '_sticky';
    var e = new Element('div', {
      'className': className
    });
    e.setStyle(this.options.styles);
    return e;
  },
  _createMoreIcon: function() {
    var more = new Element("a", {
      "className": "notification-more"
    });
    more.observe('click', this._showAll.bind(this, more));
    return more;
  },
  _showOuterPanel: function(notification) {
    notification.up('.notification_container').down('.panel-heading').show();
    notification.up('.notification_container').down('.panel-body').style.padding = '';
    notification.up('.notification_container').addClassName('panel panel-default');
    notification.up('.panel').down(".notification-more-container").show();
  },
  _updateMoreText: function(notification, text) {
    notification.up('.panel').select(".notification-more")[0].update(text);
  },
  _validNumber: function(n, v) {
    n = parseInt(n, 10);
    return isNaN(n) ? v : n;
  },
  toString: function() {
    return 'NotificationMessage';
  }
});
NotificationMessage.prototype.messages = [];;