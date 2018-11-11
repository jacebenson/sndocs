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