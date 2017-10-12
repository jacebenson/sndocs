/*! RESOURCE: /scripts/heisenberg/bootstrap/collapse.js */ + function($) {
  'use strict';
  var Collapse = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null
    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }
  Collapse.VERSION = '3.2.0'
  Collapse.DEFAULTS = {
    toggle: true
  }
  Collapse.prototype.dimension = function() {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }
  Collapse.prototype.show = function() {
      if (this.transitioning || this.$element.hasClass('in')) return
      var startEvent = $.Event('show.bs.collapse')
      this.$element.trigger(startEvent)
      if (startEvent.isDefaultPrevented()) return
      var actives = this.$parent && this.$parent.find('> .panel > .in')
      if (actives && actives.length) {
        var hasData = actives.data('bs.collapse')
        if (hasData && hasData.transitioning) return
        Plugin.call(actives, 'hide')
        hasData || actives.data('bs.collapse', null)
      }
      var dimension = this.dimension()
      this.$element
        .removeClass('collapse')
        .addClass('collapsing')[dimension](0)
      this.transiti