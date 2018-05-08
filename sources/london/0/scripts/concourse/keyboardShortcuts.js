/*! RESOURCE: /scripts/concourse/keyboardShortcuts.js */
var MagellanNavigatorKeyboardUtils = (function($) {
  var textInputs = /textarea|input|select/i;

  function isTargetEditable(event) {
    var targetElement = event.target;
    if (targetElement) {
      if (textInputs.test(targetElement.nodeName)) {
        return true;
      }
      if ($(targetElement).attr('contenteditable')) {
        return true;
      }
    }
    return false;
  }

  function shouldIgnoreInputEvents() {
    if (typeof g_application_navigator_shortcuts_ignore_input_events === 'undefined')
      return false;
    else
      return g_application_navigator_shortcuts_ignore_input_events;
  }

  function areShortcutsEnabled() {
    if (typeof g_application_navigator_shortcuts_enabled === 'undefined')
      return true;
    else
      return g_application_navigator_shortcuts_enabled;
  }
  return {
    isEventValidFactory: function(_shortcutsEnabled, _ignoreInputEvents) {
      var shortcutsEnabled = _shortcutsEnabled === undefined ? areShortcutsEnabled() : _shortcutsEnabled;
      var ignoreInputEvents = _ignoreInputEvents === undefined ? shouldIgnoreInputEvents() : _ignoreInputEvents
      if (shortcutsEnabled && ignoreInputEvents) {
        return function negate(event) {
          return !isTargetEditable.call(null, event);
        };
      } else if (shortcutsEnabled && !ignoreInputEvents) {
        return function() {
          return true;
        };
      } else {
        return function() {
          return false;
        };
      }
    }
  }
})(jQuery);
(function($) {
  if (window.top != window.self)
    return;
  $('document').ready(function() {
    var keyboardRegistry = SingletonKeyboardRegistry.getInstance();
    var isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory();
    CustomEvent.observe('application_navigator_keyboard_shortcuts_updated', function(keyboard_shortcuts_enabled) {
      isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory(keyboard_shortcuts_enabled);
    });
    keyboardRegistry.bind('ctrl + alt + g', function(evt) {
      if (!isEventValid(evt)) return;
      $('#sysparm_search').focus();
    }).selector(null, true);
    keyboardRegistry.bind('ctrl + alt + c', function(evt) {
      if (!isEventValid(evt)) return;
      CustomEvent.fireAll('magellan_collapse.toggle');
    }).selector(null, true);
    keyboardRegistry.bind('ctrl + alt + f', function(evt) {
      if (!isEventValid(evt)) return;
      if ($('.navpage-layout').hasClass('navpage-nav-collapsed')) {
        CustomEvent.fireAll('magellan_collapse.toggle');
        $(document).one("nav.expanded", function() {
          $('#filter').focus();
        });
      } else {
        if (!$('.navpage-layout').hasClass('magellan-edit-mode')) {
          $('#filter').focus();
        }
      }
    }).selector(null, true);
  });
})(jQuery);;