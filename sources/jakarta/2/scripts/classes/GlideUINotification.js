/*! RESOURCE: /scripts/classes/GlideUINotification.js */
var GlideUINotification = Class.create({
  initialize: function(options) {
    options = Object.extend({
      type: 'system',
      text: '',
      duration: 0,
      attributes: {},
      xml: null,
      window: window
    }, options || {});
    this.window = options.window;
    if (!options.xml) {
      this.type = options.type;
      this.text = options.text;
      this.attributes = options.attributes;
      this.duration = options.duration;
    } else
      this.xml = options.xml;
  },
  getType: function() {
    if (this.xml)
      return this.xml.getAttribute('data-type') || '';
    return this.type;
  },
  getText: function() {
    if (this.xml)
      return this.xml.getAttribute('data-text') || '';
    return this.text;
  },
  getDuration: function() {
    if (this.xml)
      return parseInt(this.xml.getAttribute('data-duration'), 10) || 0;
    return this.duration;
  },
  getAttribute: function(n) {
    var v;
    if (this.xml)
      v = this.xml.getAttribute('data-attr-' + n) || '';
    else
      v = this.attributes[n] || '';
    return v;
  },
  getWindow: function() {
    return this.window;
  },
  getChildren: function() {
    if (!this.xml)
      return [];
    var children = [];
    var spans = this.xml.childNodes;
    for (var i = 0; i < spans.length; i++) {
      if ((spans[i].getAttribute('class') == 'ui_notification_child') || (spans[i].getAttribute('className') == 'ui_notification_child'))
        children.push(new GlideUINotification({
          xml: spans[i],
          window: this.window
        }));
    }
    return children;
  },
  toString: function() {
    return 'GlideUINotification';
  }
});;