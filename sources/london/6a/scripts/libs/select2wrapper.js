/*! RESOURCE: /scripts/libs/select2wrapper.js */
(function() {
  if (window.Select2 !== undefined) {
    var initSelect2 = window.Select2.class.abstract.prototype.init;
    window.Select2.class.single.prototype.init = function(opts) {
      var self = this;
      initSelect2.call(this, opts);
      this.opts.element.on('$destroy', function() {
        self.opts.element.select2('destroy');
      });
    }
  }
}());