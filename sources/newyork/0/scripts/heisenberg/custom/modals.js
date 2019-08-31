/*! RESOURCE: /scripts/heisenberg/custom/modals.js */
jQuery(function($) {
  "use strict";
  var bsModal = $.fn.modal.Constructor;
  var bsModalShow = bsModal.prototype.show;
  var bsModalHide = bsModal.prototype.hide;
  var visibleModalStack = [];
  var $document = $(document);

  function isMobileSafari() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i);
  }

  function forceRedraw(element) {
    return element.offsetLeft;
  }

  function getLastTabbableElement(container, depth) {
    if (typeof depth === 'undefined')
      depth = 1;
    if (depth === 3)
      return null;
    var elements = window.tabbable(container, 'input, select, a[href], textarea, button, [tabindex]:not(.focus-trap-boundary-south), iframe');
    if (elements.length === 0) return null;
    if (elements[elements.length - 1].tagName !== 'IFRAME')
      return elements[elements.length - 1];
    var result = null;
    for (var i = elements.length - 1; i >= 0 && result === null; i--) {
      result = elements[i];
      if (result.tagName === 'IFRAME')
        result = getLastTabbableElement(elements[i].contentDocument, depth + 1);
    }
    return result;
  }

  function visibleModalFocusInHandler(event) {
    var $modal = visibleModalStack[visibleModalStack.length - 1];
    if (!$modal)
      return;
    if ($modal.attr('focus-escape') === 'true')
      return;
    var modal = $modal[0];
    var targetIsModal = modal === event.target;
    var modalContainsTarget = $modal.has(event.target).length > 0;
    var targetIsSouthernBoundary = event.target.classList.contains('focus-trap-boundary-south');
    if (!targetIsModal) {
      if (targetIsSouthernBoundary)
        $modal.trigger('focus');
      if (!modalContainsTarget) {
        var lastTabbableElement = getLastTabbableElement(modal);
        if (lastTabbableElement && typeof lastTabbableElement.focus === 'function')
          lastTabbableElement.focus();
        else
          $modal.trigger('focus');
      }
    }
  }
  bsModal.prototype.show = function() {
    bsModalShow.apply(this, arguments);
    visibleModalStack.push(this.$element);
    var $backdrop = $('body').find('.modal-backdrop').not('.stacked');
    var zmodal = this.$element.css('z-index');
    var zbackdrop = $backdrop.css('z-index');
    this.$element.css('z-index', (~~zmodal) + (10 * visibleModalStack.length));
    $backdrop.css('z-index', (~~zbackdrop) + (10 * visibleModalStack.length));
    $backdrop.addClass('stacked');
    forceRedraw(this.$element[0]);
  };
  bsModal.prototype.hide = function(e) {
    bsModalHide.apply(this, arguments);
    visibleModalStack.pop();
    if (this.isShown) return;
    if (visibleModalStack.length > 0)
      $document.on('focusin.bs.modal', visibleModalFocusInHandler)
    this.$element.css('z-index', '');
    forceRedraw(this.$element[0]);
  };
  $document.on('shown.bs.modal hidden.bs.modal', function() {
    if (window._frameChanged)
      _frameChanged();
  })
  $document.on('shown.bs.modal', function(event) {
    $document.off('focusin.bs.modal');
    $document.on('focusin.bs.modal', visibleModalFocusInHandler);
    var modal = event.target;
    var autoFocus = true;
    if (modal.getAttribute('data-auto-focus') === 'false') {
      autoFocus = false;
    }
    if (autoFocus && window.tabbable) {
      var tabbableElements = window.tabbable(modal);
      if (
        tabbableElements &&
        tabbableElements.length &&
        tabbableElements[0]
      ) {
        tabbableElements[0].focus();
      }
    }
  });
});;