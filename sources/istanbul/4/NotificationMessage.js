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
      _show: function(