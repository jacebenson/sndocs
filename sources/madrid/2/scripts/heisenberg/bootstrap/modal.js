/*! RESOURCE: /scripts/heisenberg/bootstrap/modal.js */ + function($) {
  'use strict';
  var Modal = function(element, options) {
    this.options = options
    this.$body = $(document.body)
    this.$element = $(element)
    this.$backdrop =
      this.isShown = null
    this.scrollbarWidth = 0
    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function() {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }
  Modal.VERSION = '3.2.0'
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }
  Modal.prototype.toggle = function(_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }
  Modal.prototype.show = function(_relatedTarget) {
      var that = this
      var e = $.Event('show.bs.modal', {
        relatedTarget: _relatedTarget
      })
      this.$element.trigger(e)
      if (this.isShown || e.isDefaultPrevented()) return
      this.isShown = true
      this.checkScrollbar()
      this.$body.addClass('modal-open')
      this.setScrollbar()
      this.escape()
      this.$element.on('click.dismiss.bs.