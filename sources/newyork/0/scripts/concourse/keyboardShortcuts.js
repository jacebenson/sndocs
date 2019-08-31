/*! RESOURCE: /scripts/concourse/keyboardShortcuts.js */
function getShortcutCombination(action) {
  if (window.g_keyboard_shortcuts && window.g_keyboard_shortcuts[action] &&
    window.g_keyboard_shortcuts[action].key_combination)
    return window.g_keyboard_shortcuts[action].key_combination;
  return '';
}

function getShortcutEnabledState(action) {
  if (window.g_keyboard_shortcuts && window.g_keyboard_shortcuts[action] &&
    typeof window.g_keyboard_shortcuts[action].enabled === 'boolean')
    return window.g_keyboard_shortcuts[action].enabled;
  return true;
}
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

  function shouldAllowInInputs() {
    if (typeof window.g_keyboard_shortcuts === 'undefined' ||
      typeof window.g_keyboard_shortcuts.allow_in_input_fields === 'undefined')
      return false;
    return window.g_keyboard_shortcuts.allow_in_input_fields;
  }

  function areShortcutsEnabled() {
    if (typeof window.g_keyboard_shortcuts === 'undefined' ||
      typeof window.g_keyboard_shortcuts.enabled === 'undefined')
      return true;
    return window.g_keyboard_shortcuts.enabled;
  }
  return {
    isEventValidFactory: function(_shortcutsEnabled, _allowInInputs) {
      var shortcutsEnabled = _shortcutsEnabled === undefined ? areShortcutsEnabled() : _shortcutsEnabled;
      var allowInInputs = _allowInInputs === undefined ? shouldAllowInInputs() : _allowInInputs;
      if (shortcutsEnabled && !allowInInputs) {
        return function negate(event) {
          return !isTargetEditable.call(null, event);
        };
      } else if (shortcutsEnabled && allowInInputs) {
        return function() {
          return true;
        };
      } else {
        return function() {
          return false;
        };
      }
    },
    isShortcutValidFactory: function(keyboardRegistry) {
      var validKeys = window.top.validKeys;
      return function(keyCombo, action) {
        var defaultKeyCombo = {
          'globalSearch': 'ctrl+alt+g',
          'mainFrame': 'ctrl+alt+p',
          'navToggle': 'ctrl+alt+c',
          'navFilter': 'ctrl+alt+f',
          'impersonator': 'ctrl+alt+i'
        };
        var keys = keyCombo.toLowerCase().replace(/\s/g, '').split('+');
        var bindings = keyboardRegistry.primary.keyBindingGroups[keys.length];
        for (var i = 0; i < keys.length; i++) {
          if (!validKeys.hasOwnProperty(keys[i])) {
            console.log('%cKeyboard shortcut (' + keyCombo + ') defined for ' + action +
              ' is invalid. Reverting to default (' + defaultKeyCombo[action] + ').', 'color:red;');
            keyCombo = defaultKeyCombo[action];
            break;
          }
        }
        if (bindings) {
          for (var i = 0; i < bindings.length; i++) {
            if (keyCombo.toLowerCase().replace(/\s/g, '') === bindings[i].keyCombo) {
              console.log('%cKeyboard shortcut (' + keyCombo + ') defined for ' + action +
                ' is already in use. No action taken.', 'color:red;');
              return false;
            }
          }
        }
        return keyCombo;
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
    var validShortcut = MagellanNavigatorKeyboardUtils.isShortcutValidFactory(keyboardRegistry);
    var impersonateButtonScope;
    CustomEvent.observe('application_navigator_keyboard_shortcuts_updated', function(keyboardShortcutsEnabled) {
      isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory(keyboardShortcutsEnabled);
    });

    function bindShortcut(shortcut, action, shortcutEnabled, callback) {
      var validKeyCombo = validShortcut(shortcut, action);
      if (validKeyCombo) {
        keyboardRegistry.bind(validKeyCombo, function(evt) {
          if (shortcutEnabled && isEventValid(evt))
            callback(evt);
        }).selector(null, true);
      }
    }

    function globalSearchCallback(evt) {
      $('#sysparm_search').focus();
      evt.preventDefault();
    }

    function mainFrameCallback(evt) {
      window.top.moveFocusToMainContent();
      evt.preventDefault();
    }

    function navigatorToggleCallback(evt) {
      CustomEvent.fireAll('magellan_collapse.toggle');
      evt.preventDefault();
    }

    function navigatorFilterCallback(evt) {
      window.top.moveFocusToNavigationFilter();
      evt.preventDefault();
    }

    function impersonatorCallback(evt) {
      if (!impersonateButtonScope && angular) {
        var impersonateButton = angular.element($('#glide_ui_impersonator'));
        if (impersonateButton) {
          impersonateButtonScope = impersonateButton.scope();
        }
      }
      if (impersonateButtonScope) {
        impersonateButtonScope.$broadcast('dialog.impersonate.show');
        evt.preventDefault();
      }
    }
    bindShortcut(getShortcutCombination('global_search'), 'globalSearch',
      getShortcutEnabledState('global_search'), globalSearchCallback);
    bindShortcut(getShortcutCombination('main_frame'), 'mainFrame',
      getShortcutEnabledState('main_frame'), mainFrameCallback);
    bindShortcut(getShortcutCombination('navigator_toggle'), 'navToggle',
      getShortcutEnabledState('navigator_toggle'), navigatorToggleCallback);
    bindShortcut(getShortcutCombination('navigator_filter'), 'navFilter',
      getShortcutEnabledState('navigator_filter'), navigatorFilterCallback);
    bindShortcut(getShortcutCombination('impersonator'), 'impersonator',
      getShortcutEnabledState('impersonator'), impersonatorCallback);
  });
})(jQuery);;