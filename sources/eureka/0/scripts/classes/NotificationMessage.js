var NotificationMessage = Class.create({
  FADE_IN_DEFAULT_MS: 400,
  FADE_OUT_DEFAULT_MS: 200,
  CLOSE_DEFAULT_MS: 3000,
  TYPE_IMAGES: {
    info: 'images/outputmsg_info.gifx',
    warn: 'images/outputmsg_warning.gifx',
    warning: 'images/outputmsg_warning.gifx',
    error: 'images/outputmsg_error.gifx'
  },
  initialize: function(options) {
    this.options = Object.extend({
      text: '',
      type: '',
      image: '',
      styles: {},
      sticky: false,
      fadeIn: this.FADE_IN_DEFAULT_MS,
      fadeOut: this.FADE_OUT_DEFAULT_MS,
      closeDelay: this.CLOSE_DEFAULT_MS,
      classPrefix: 'notification',
      container: 'ui_notification',
      bundleMessages: false,
      singleMessage: false,
      onBeforeOpen: function() {},
      onAfterOpen: function() {},
      onBeforeClose: function() {},
      onAfterClose: function() {}
    }, options || {});
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
    if (!this.options.bundleMessages || container.childElements().length == 0) {
      container.insert(this.notification);
      if (!this.options.sticky) {
        this.timeoutId = setTimeout(this._close.bind(this, false), this.options.closeDelay + this.options.fadeIn);
        this.notification.observe('mouseover', this._makeSticky.bind(this));
      }
    } else {
      var notification = container.down('.' + this.options.classPrefix + '_message');
      if (!notification)
        notification = this.notification;
      notification.select(".notification_more")[0].show();
      NotificationMessage.prototype.messages.push(this.notification);
      notification.select(".notification_more")[0].update(NotificationMessage.prototype.messages.length + " more...");
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
      if (notification.up('.' + this.options.classPrefix + '_message') && notification.up().select('.' + this.options.classPrefix + '_message').length < 2)
        notification.up('.' + this.options.classPrefix + '_message').remove();
      else {
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
      notification = closeEvent.element().up('.' + this.options.classPrefix + '_message');
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
    this.notification.down('.notification_close_icon').show();
    this.notification.addClassName(this.options.classPrefix + '_message_sticky');
  },
  _showAll: function(more) {
    if (this.notification.select(".notification_outer").length == 0) {
      var notificationContainer = this._createContainer();
      this.notification.insert(notificationContainer)
      this.notification.wrap(notificationContainer);
      this.notification.addClassName("notification_inner");
      this.notification = notificationContainer;
    }
    for (var i = 0; i < NotificationMessage.prototype.messages.length; i++) {
      var notification = NotificationMessage.prototype.messages[i];
      this.notification.insert(notification);
      notification.stopObserving('mouseover');
      notification.addClassName("notification_inner");
      notification.down('.notification_close_icon').show();
      notification.addClassName(this.options.classPrefix + '_message_sticky');
    }
    more.hide();
    NotificationMessage.prototype.messages = [];
  },
  _getContainer: function(n) {
    var c = $(n);
    if (c)
      return c;
    c = new Element('div', {
      'id': n,
      'className': this.options.classPrefix + '_container'
    });
    document.body.appendChild(c);
    return c;
  },
  _createContainer: function() {
    var e = this._createMainDiv(true);
    var text = new Element('div', {
      className: "notification_outer"
    });
    text.innerHTML = "Current Notification Messages";
    e.insert(text);
    text.insert(this._createMoreIcon());
    var close = this._createCloseIcon();
    close.setStyle({
      display: "block"
    });
    e.appendChild(close);
    return e;
  },
  _create: function() {
    var e = this._createMainDiv();
    var text = new Element('div', {
      style: "position:relative"
    });
    text.innerHTML = this.options.text;
    e.insert(text);
    text.insert(this._createMoreIcon())
    text.appendChild(this._createTypeIcon());
    e.appendChild(this._createCloseIcon());
    e.style.display = 'none';
    return e;
  },
  _createCloseIcon: function() {
    var close = new Element('img', {
      src: 'images/x.gifx',
      className: 'notification_close_icon notification_close_action',
      style: 'display: ' + (this.options.sticky ? 'block' : 'none')
    });
    close.observe('click', this._close.bind(this, true));
    return close;
  },
  _createMainDiv: function(isContainer) {
    var className = this.options.classPrefix + '_message';
    if (!isContainer && this.options.type)
      className += ' ' + this.options.classPrefix + '_message_' + this.options.type;
    else if (isContainer)
      className += ' ' + this.options.classPrefix + '_message_container';
    if (this.options.sticky)
      className += ' ' + this.options.classPrefix + '_message_sticky';
    var e = new Element('div', {
      'className': className
    });
    e.setStyle(this.options.styles);
    return e;
  },
  _createTypeIcon: function() {
    var img = this.options.image;
    if (!img && this.options.type && this.TYPE_IMAGES[this.options.type])
      img = this.TYPE_IMAGES[this.options.type];
    if (!img)
      img = this.TYPE_IMAGES['info'];
    var image = new Element('img', {
      src: img,
      className: this.options.classPrefix + '_image'
    });
    return image;
  },
  _createMoreIcon: function() {
    var more = new Element("a", {
      "className": "notification_more",
      style: "display:none"
    });
    more.observe('click', this._showAll.bind(this, more));
    return more;
  },
  _validNumber: function(n, v) {
    n = parseInt(n, 10);
    return isNaN(n) ? v : n;
  },
  toString: function() {
    return 'NotificationMessage';
  }
});
NotificationMessage.prototype.messages = new Array();