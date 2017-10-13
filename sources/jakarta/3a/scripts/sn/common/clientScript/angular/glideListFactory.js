/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideListFactory.js */
angular.module('sn.common.clientScript').factory('glideListFactory', function() {
  'use strict';
  if (typeof g_glide_list_separator == "undefined")
    var g_glide_list_separator = ", ";
  return {
    init: init
  };

  function init(g_form, fields) {
    return {
      get: function(fieldName) {
        return _glideListUtil(fieldName, g_form, fields);
      }
    };
  }

  function getField(fieldName, g_form, fields) {
    for (var i = 0, iM = fields.length; i < iM; i++) {
      var field = fields[i];
      if (field.variable_name === fieldName || field.name === fieldName) {
        return field;
      }
    }
    if (g_form.$private.options('getMappedField')) {
      var mapped = g_form.$private.options('getMappedField')(fieldName);
      if (mapped) {
        return mapped;
      }
    }
  }

  function _glideListUtil(fieldName, g_form, fields) {
    var field = getField(fieldName, g_form, fields);
    if (!field)
      return;

    function getItems() {
      var items = [];
      var values = field.value.split(',');
      var displayValues = field.display_value_list;
      for (var i = 0; i < values.length; i++) {
        items.push({
          value: values[i],
          display_value: displayValues[i]
        });
      }
      return items;
    }

    function addItem(item, itemDV) {
      var v = field.value;
      if (v.indexOf(item) > -1)
        return;
      var dv = field.display_value_list;
      v = v == '' ? [] : v.split(',');
      if (v.indexOf(item) == -1) {
        v.push(item);
        dv.push(itemDV);
      }
      g_form.setValue(fieldName, v.join(','), dv.join(g_glide_list_separator));
    }

    function removeItem(item) {
      var v = field.value;
      if (v.indexOf(item) == -1)
        return;
      var values = field.value.split(',');
      var displayValues = field.display_value_list;
      for (var i = values.length - 1; i >= 0; i--) {
        if (item == values[i]) {
          values.splice(i, 1);
          displayValues.splice(i, 1);
          break;
        }
      }
      g_form.setValue(field.name, values.join(','), displayValues.join(g_glide_list_separator));
    }

    function reset() {
      field.ed.queryString = '';
    }

    function setQuery(queryString) {
      field.ed.queryString = queryString;
      field.ed.queryString.replace("^EQ", "");
    }

    function setDefaultOperator(operator) {
      field.ed.defaultOperator = operator;
    }

    function getDefaultOperator() {
      return field.ed.defaultOperator;
    }
    return {
      addItem: addItem,
      removeItem: removeItem,
      getItems: getItems,
      setQuery: setQuery,
      getDefaultOperator: getDefaultOperator,
      setDefaultOperator: setDefaultOperator,
      queryString: field.ed.queryString,
      reset: reset
    };
  }
});;