/*! RESOURCE: /scripts/heisenberg/custom/accessibility.js */
jQuery(function($) {
  if (!document.querySelectorAll)
    return;
  $(document).on('show.bs.modal show.bs.popover', function(evt) {
    var modal = $(evt.target);
    var previouslyFocusedElement = document.activeElement;
    if (modal && modal[0] === previouslyFocusedElement || modal[0].getAttribute('focus-escape') == 'true')
      return;
    createFocusTrap(modal, {
      escapeDeactivates: false,
      focusOutsideDeactivates: false,
      clickOutsideDeactivates: false
    }).previouslyFocusedElement = previouslyFocusedElement;
  });
  $(document).on('shown.bs.modal shown.bs.popover', function(evt) {
    try {
      var modal = $(evt.target);
      if (modal && modal[0] === document.activeElement)
        return;
      var focusTrap = getFocusTrap(modal);
      if (!focusTrap)
        return;
      focusTrap.activate();
    } catch (e) {
      if (window.console)
        console.log('Error while activating focus trap', e);
    }
  });
  $(document).on('hide.bs.modal hide.bs.popover', function(evt) {
    var modal = $(evt.target);
    var focusTrap = getFocusTrap(modal);
    if (!focusTrap)
      return;
    focusTrap.deactivate({
      returnFocus: !!focusTrap.previouslyFocusedElement,
      onDeactivate: function() {
        setTimeout(function() {
          if (focusTrap.previouslyFocusedElement)
            focusTrap.previouslyFocusedElement.focus();
        }, 0);
      }
    });
  });

  function createFocusTrap($el, options) {
    var fTrap = getFocusTrap($el);
    if (!fTrap) {
      fTrap = focusTrap($el[0], options);
      $el.data('focusTrap', focusTrap($el[0], options));
    }
    return fTrap;
  }

  function getFocusTrap($el, options) {
    if (!window.focusTrap)
      return {
        activate: function() {},
        deactivate: function() {}
      };
    return $el.data('focusTrap');
  }
});;