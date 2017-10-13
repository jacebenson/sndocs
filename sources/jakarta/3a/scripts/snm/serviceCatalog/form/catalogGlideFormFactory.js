/*! RESOURCE: /scripts/snm/serviceCatalog/form/catalogGlideFormFactory.js */
angular.module('snm.serviceCatalog.form').factory('catalogGlideFormFactory', function($q, $log, $http, urlTools, glideFormFactory, catalogDataLookup) {
  'use strict';
  return {
    addVariableEditor: addVariableEditor,
    addItemEditor: addItemEditor
  };

  function addItemEditor(g_form, itemSysId, tableName, sysId, fields) {
    var options = _getGlideFormOptions(itemSysId, fields);
    g_form.$private.options(options);
    catalogDataLookup.initItem(itemSysId, g_form, tableName, sysId);
  }

  function addVariableEditor(g_form, itemSysId, tableName, sysId, fields) {
    var options = _getGlideFormOptions(itemSysId, fields);
    g_form.$private.options(options);
    catalogDataLookup.initRecord(itemSysId, g_form, tableName, sysId);
  }

  function _getGlideFormOptions(itemSysId, fields) {
    var catalogFields = getCatalogFields(fields);
    var options = {
      fieldIterator: function(func) {
        return catalogFields.forEach(func);
      },
      getMappedField: function(fieldName) {
        return getCatalogField(catalogFields, fieldName);
      },
      getMappedFieldName: function(fieldName) {
        var field = getCatalogField(catalogFields, fieldName);
        return field.variable_name || field.catalogFieldName;
      },
      getFieldParams: function() {
        return getFieldParams(catalogFields);
      },
      getFieldSequence: function() {
        return getFieldSequence(catalogFields);
      },
      itemSysId: itemSysId
    };
    return options;
  }

  function getCatalogFields(fields, arr) {
    if (!arr) {
      arr = [];
    }
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      field.catalogFieldName = getCatalogFieldName(field.name, field.sys_id);
      arr.push(field);
      if (field.fields && field.fields.length > 0) {
        getCatalogFields(field.fields, arr);
      }
    }
    return arr;
  }

  function getCatalogField(fields, fieldName) {
    for (var i = 0, iM = fields.length; i < iM; i++) {
      if (fields[i].name === fieldName || fields[i].catalogFieldName == fieldName || fields[i].variable_name == fieldName) {
        return fields[i];
      }
    }
    return null;
  }

  function getCatalogFieldName(name, sysId) {
    var prefix = 'IO:';
    if (name.indexOf('ni.QS') === 0) {
      prefix = 'ni.QS';
    }
    return prefix + sysId;
  }

  function getFieldParams(fieldList) {
    var params = {};
    for (var i = 0; i < fieldList.length; i++) {
      var field = fieldList[i];
      var sysId = field.sys_id;
      if (!sysId || sysId.indexOf("gen_") == 0) {
        continue;
      }
      switch (field.catalogType) {
        default: var prefix = field.name.indexOf('ni.QS') === 0 ? 'ni.QS' : 'IO';
        params[prefix + ':' + sysId] = field.value;
        params['sys_original.' + prefix + ':' + sysId] = field.initial_value;
        switch (field.type) {
          case 'masked':
            if (prefix === 'IO') {
              params['ni.nolog.IO:' + sysId] = true
            } else {
              params['ni.nolog.QS:' + sysId] = true
            }
            break;
          case 'checkbox':
            params[prefix + ':' + sysId] = field.value == 'true' ? 'on' : '';
            break;
        }
        break;
        case 'quantity':
            params[sysId] = field.value;
          break;
        case 'label':
            case 'break':
            break;
      }
    }
    return params;
  }

  function getFieldSequence(fieldList) {
    var sequence = [];
    for (var i = 0; i < fieldList.length; i++) {
      var field = fieldList[i];
      if (field.catalogType !== 'quantity') {
        if (!field.sys_id || field.sys_id.indexOf("gen_") == 0) {
          continue;
        }
        var result = field.sys_id;
        if (result != "") {
          sequence.push(result);
        }
      }
    }
    return sequence.join(',');
  }
});;