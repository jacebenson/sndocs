/*! RESOURCE: /scripts/sn/common/clientScript/glideFormFieldFactory.js */
(function(exports, undefined) {
  'use strict';
  var IS_INITIALIZED = 'isInitialized';
  exports.glideFormFieldFactory = {
    create: create,
    hasInputHelpers: hasInputHelpers,
    useDisplayValueForValue: useDisplayValueForValue,
    isMandatory: isMandatory,
    hasValue: hasValue,
    isInitialized: isInitialized,
    setInitialized: setInitialized
  };

  function create(field) {
    var attributes = field.attributes || {};
    return {
      isVisible: function() {
        if (typeof field.fields !== 'undefined') {
          var childVisibility = false;
          field.fields.forEach(function(child) {
            childVisibility |= !!child.visible;
          });
          if (!childVisibility) {
            return false;
          }
        }
        return field.visible === true;
      },
      isReadonly: function() {
        return field.readonly === true || field.sys_readonly === true;
      },
      isMandatory: function() {
        return isMandatory(field);
      },
      hasBarcodeHelper: function() {
        return hasInputHelpers(field) && attributes.barcode === 'true';
      },
      hasCurrentLocationHelper: function() {
        return hasInputHelpers(field) && attributes.current_location === 'true';
      },
      hasMessages: function() {
        return field.messages && (field.messages.length > 0);
      }
    };
  }

  function isInitialized(field) {
    return field[IS_INITIALIZED] === true;
  }

  function setInitialized(field) {
    field[IS_INITIALIZED] = true;
  }

  function hasInputHelpers(field) {
    switch (field.type) {
      case 'boolean':
      case 'reference':
        return false;
      default:
        return true;
    }
  }

  function isMandatory(field) {
    switch (field.type) {
      case 'widget':
        return false;
      default:
        return !field.readonly && (field.mandatory === true || field.sys_mandatory === true);
    }
  }

  function hasValue(field) {
    if (field.type === "boolean")
      return true;
    var value = useDisplayValueForValue(field) ? field.displayValue : field.value;
    if (value == null) {
      return false;
    }
    if (typeof value === 'undefined') {
      return false;
    }
    var trimmed = String(value).trim();
    return trimmed.length > 0;
  }

  function useDisplayValueForValue(field) {
    switch (field.type) {
      case 'user_image':
      case 'glide_encrypted':
      case 'translated_text':
        return true;
      default:
        return false;
    }
  }
})(window);;