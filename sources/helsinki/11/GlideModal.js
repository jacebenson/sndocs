/*! RESOURCE: /scripts/classes/doctype/GlideModal.js */
(function(global, $) {
    "use strict";
    var GlideModal = function() {
      GlideModal.prototype.initialize.apply(this, arguments);
    };
    GlideModal.prototype = {
        initialize: function(id, readOnly, width, height) {
          this.preferences = {};
          this.id = id;
          this.readOnly = readOnly;
          this.backdropStatic = false;
          this.nologValue = false;
          this.setDialog(id);
          this.setSize(width, height);
          this.setPreference('renderer', 'RenderForm');
          this.setPreference('type', 'direct');
        },
        setDialog: function(dialogName) {
          this.setPreference('table', dialogName);
        },
        setPreference: function(name, value) {
          this.preferences[name] = value;
        },
        getPreference: function(name) {
          return this.preferences[name];
        },
        setAutoFullHeight: function(isAutoFullHeight) {
          this.isAutoFullHeight = isAutoFullHeight;
        },
        setSize: function(width) {
          this.size = 'modal-md';
          if (!width)
            this.size = 'modal-md';
          else if (width < 350)
            this.size = 'modal-alert';
          else if (width < 450)
            this.size = 'modal-sm';
          else if (width < 650)
            this.size = 'modal-md';
          else
            this.size = 'modal-lg';
        },
        setWidth: function(width) {
          this.setSize(width);
        },
        setTitle: function(title) {
            th