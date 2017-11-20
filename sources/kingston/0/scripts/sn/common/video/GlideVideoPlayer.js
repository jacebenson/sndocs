/*! RESOURCE: /scripts/sn/common/video/GlideVideoPlayer.js */
(function(exports) {
  function GlideVideoPlayer(options) {
    if (!(this instanceof GlideVideoPlayer))
      return new GlideVideoPlayer(options);
    this.initialize.apply(this, arguments);
  }
  GlideVideoPlayer.prototype = {
    initialize: function(options) {
      this.name = options.name || '';
      this.type = options.type || '';
      this.width = options.width || 640;
      this.height = options.height || 264;
      this.class = options.class || 'video-js vjs-default-skin';
      this.includeControls = options.includeControls || 'true';
      this.options = options.options;
      this.playerConstructed = false;
      this.linkConstructed = false;
      this.attachment = options.attachment;
      this.link = !!this.attachment ? '/sys_attachment.do?sys_id=' + this.attachment : '/' + this.name;
      this.guid = options.id;
      if (!this.guid)
        this.guid = exports.nowapi.g_guid ? exports.nowapi.g_guid.generate() : this.name;
      this.video = {
        element: document.createElement('video'),
        attributes: {
          id: this.guid,
          controls: this.includeControls,
          width: this.width,
          height: this.height,
          class: this.class
        }
      };
      this.source = {
        element: document.createElement('source'),
        attributes: {
          src: this.link,
          type: this.type
        }
      };
      this.link = {
        element: document.createElement('a'),
        textContent: this.name,
        attributes: {
          download: this.name,
          href: this.link
        }
      };
    },
    createPlayer: function(options) {
      if (this.playerConstructed)
        return this.video.element;
      this._constructElement(this.video, options);
      this._constructElement(this.source, {});
      this.video.element.appendChild(this.source.element);
      this.playerConstructed = true;
      return this.video.element;
    },
    createDownloadLink: function(options) {
      if (this.linkConstructed)
        return this.link.element;
      this._constructElement(this.link, options);
      this.linkConstructed = true;
      return this.link.element;
    },
    getUniqueId: function() {
      return this.guid;
    },
    _constructElement: function(e, overrides) {
      e.attributes = Object.assign({}, e.attributes, overrides);
      for (var attribute in e.attributes)
        e.element.setAttribute(attribute, e.attributes[attribute])
      if (e.textContent)
        e.element.textContent = e.textContent;
    }
  };
  exports.GlideVideoPlayer = GlideVideoPlayer;
})(window);;