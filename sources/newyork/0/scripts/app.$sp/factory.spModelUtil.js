/*! RESOURCE: /scripts/app.$sp/factory.spModelUtil.js */
angular.module('sn.$sp').factory('spModelUtil', function(glideFormFieldFactory) {
  'use strict';

  function extendField(field) {
    var glideField = glideFormFieldFactory.create(field);
    field.isReadonly = glideField.isReadonly;
    field.isMandatory = glideField.isMandatory;
    field.isVisible = glideField.isVisible;
    field.mandatory_filled = function() {
      return glideFormFieldFactory.hasValue(field, field.stagedValue);
    }
    field.hasError = function() {
      var hasError = false;
      var fieldMessages = field.messages;
      if (fieldMessages) {
        var fieldMessagesLength = fieldMessages.length;
        for (var j = fieldMessagesLength - 1; j >= 0; j--) {
          if (field.messages[j].type === 'error') {
            hasError = true;
            break;
          }
        }
      }
      return hasError;
    }
    field.stagedValue = field.value;
  }

  function extendFields(fields) {
    for (var f in fields) {
      extendField(fields[f]);
    }
  }
  return {
    extendField: extendField,
    extendFields: extendFields
  };
});;