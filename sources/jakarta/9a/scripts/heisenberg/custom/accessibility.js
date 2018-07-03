/*! RESOURCE: /scripts/heisenberg/custom/accessibility.js */
jQuery(function($) {
  if (!window.WeakMap)
    return;
  window.NOW = window.NOW || {};
  if (window.NOW.accessibilityJSLoaded) {
    return;
  }
  window.NOW.accessibilityJSLoaded = true;
  var $document = $(document),
    store = new WeakMap();
  $document.on('show.bs.modal', function(evt) {
    var modal = evt.target,
      previouslyFocusedElement = document.activeElement;
    if (hasOptions(modal))
      return;
    createOptions(modal);
    rememberTrigger(modal, previouslyFocusedElement);
    if (modal.getAttribute('focus-escape') == 'true')
      return;
    createFocusTrap(modal, {
      escapeDeactivates: false,
      focusOutsideDeactivates: false,
      clickOutsideDeactivates: false
    });
  });
  $document.on('shown.bs.modal', function(evt) {
    var modal = evt.target;
    activateFocusTrap(modal);
  });
  $document.on('hide.bs.modal', function(evt) {
    var modal = evt.target;
    deactivateFocusTrap(modal);
  });
  $document.on('hidden.bs.modal', function(evt) {
    var modal = evt.target;
    restoreTriggerFocus(modal);
    destroyOptions(modal);
  });

  function createOptions(modal) {
    store.set(modal, {});
  }

  function hasOptions(modal) {
    return !!store.get(modal);
  }

  function destroyOptions(modal) {
    store.delete(modal);
  }

  function getOption(modal, key) {
    var options = store.get(modal);
    return options && options[key];
  }

  function setOption(modal, key, value) {
    var options = store.get(modal);
    if (options) {
      options[key] = value;
    }
  }

  function rememberTrigger(modal, triggerElement) {
    setOption(modal, 'trigger-element', triggerElement);
  }

  function restoreTriggerFocus(modal) {
    var $target = $(getOption(modal, 'trigger-element'));
    var isFocusable = function($el) {
      if ($el.filter(':visible').length > 0) {
        return $el[0].tabIndex > -1;
      }
      return false;
    }
    var tryFocus = function(el) {
      var $el = $(el);
      if (isFocusable($el)) {
        $el.focus();
        return true;
      }
      return false;
    }
    do {
      if (tryFocus($target) || tryFocus($target.data('menu-trigger'))) {
        return;
      }
      $target = $target.parent();
    } while ($target.length > 0);
  }

  function createFocusTrap(modal, options) {
    if (!window.focusTrap)
      return;
    var focusTrap = window.focusTrap(modal, options);
    setOption(modal, 'focus-trap', focusTrap);
  }

  function activateFocusTrap(modal) {
    var d = $.Deferred();
    var focusTrap = getOption(modal, 'focus-trap');
    if (!focusTrap) {
      d.reject('Focus trap not found');
    } else {
      try {
        focusTrap.activate({
          onActivate: function() {
            d.resolve();
          }
        });
      } catch (e) {
        console.warn('Error while activating focus trap', e);
      }
    }
    return d.promise();
  }

  function deactivateFocusTrap(modal) {
    var d = $.Deferred();
    var focusTrap = getOption(modal, 'focus-trap');
    if (!focusTrap) {
      d.reject('Focus trap not found');
    } else {
      try {
        focusTrap.deactivate({
          onDeactivate: function() {
            d.resolve();
          }
        });
      } catch (e) {
        console.warn('Error while deactivating focus trap', e);
      }
    }
    return d.promise();
  }
});;