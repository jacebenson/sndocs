/*! RESOURCE: /scripts/snm/serviceCatalog/form/js_includes_form.js */
/*! RESOURCE: /scripts/snm/serviceCatalog/form/snm.serviceCatalog.form.module.js */
angular.module('snm.serviceCatalog.form', [
  'sn.common.clientScript',
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/snm/serviceCatalog/form/catalogDataLookup.js */
angular.module('snm.serviceCatalog.form').factory('catalogDataLookup', function($q, $log, $http, urlTools) {
  'use strict';
  var DEBUG_LOG = false;
  return {
    initItem: initItem,
    initRecord: initRecord
  };

  function initItem(itemSysId, g_form) {
    var url = urlTools.getURL('catalog_data_lookup', {
      item: itemSysId
    });
    return _loadDataLookup(url, itemSysId, g_form);
  }

  function initRecord(itemSysId, g_form, tableName, recordSysId) {
    var url = urlTools.getURL('catalog_form_data_lookup', {
      table: tableName,
      sys_id: recordSysId
    });
    return _loadDataLookup(url, itemSysId, g_form);
  }

  function _loadDataLookup(url, itemSysId, g_form) {
    return $http.get(url).then(function(response) {
      var data = response.data;
      if (!data.catalog_data_lookup) {
        return null;
      }
      if (DEBUG_LOG) {
        $log.log('(catalogDataLookup) Loaded:', data);
      }
      return _createDataLookupEnv(itemSysId, g_form, data.catalog_data_lookup);
    });
  }

  function _createDataLookupEnv(itemSysId, g_form, dataLookups) {
    var fieldDataLookups = {};
    for (var i = 0, iM = dataLookups.length; i < iM; i++) {
      var dld = dataLookups[i];
      var fields = dld.fields;
      for (var j = 0, jM = fields.length; j < jM; j++) {
        var fieldName = fields[j];
        if (g_form.hasField(fieldName)) {
          var fieldDataLookup = fieldDataLookups[fieldName];
          if (!fieldDataLookup) {
            fieldDataLookup = fieldDataLookups[fieldName] = {
              dlds: []
            };
          }
          fieldDataLookup.dlds.push(dld);
        }
      }
    }
    g_form.serviceCatalog = {
      activeDataLookupRequests: [],
      lastDataLookup: null,
      dataLookupDisabled: false
    };
    var onChange = _wrapChangeHandler(itemSysId, g_form, fieldDataLookups);
    g_form.$private.events.on('change', onChange);
    return {
      created: true
    };
  }

  function _wrapChangeHandler(_itemSysId, _g_form, _fieldDataLookups) {
    var itemSysId = _itemSysId;
    var g_form = _g_form;
    var fieldDataLookups = _fieldDataLookups;
    return function _onChangeForm(control, oldValue, newValue, isLoading, isTemplate) {
      var dataLookup = fieldDataLookups[control];
      if (!dataLookup || !dataLookup.dlds) {
        return;
      }
      if (DEBUG_LOG) {
        $log.log('(catalogDataLookup) Found field lookup:', control, dataLookup);
      }
      var $activeLookups = [];
      for (var i = 0, iM = dataLookup.dlds.length; i < iM; i++) {
        var $lookup = _runDataLookup(itemSysId, dataLookup.dlds[i], g_form);
        if ($lookup) {
          $activeLookups.push($lookup);
        }
      }
      if ($activeLookups.length == 0) {
        return;
      }
      var $requests = $q.all($activeLookups).finally(function() {
        g_form.serviceCatalog.activeDataLookupRequests.pop();
      });
      g_form.serviceCatalog.activeDataLookupRequests.push($requests)
    };
  }

  function _runDataLookup(itemSysId, dld, g_form) {
    if (g_form.serviceCatalog.dataLookupDisabled) {
      return;
    }
    var getFieldParams = g_form.$private.options('getFieldParams');
    var fieldParams = getFieldParams();
    var serialized = urlTools.encodeURIParameters(fieldParams);
    if (g_form.serviceCatalog.lastDataLookup === serialized) {
      return;
    }
    g_form.serviceCatalog.lastDataLookup = serialized;
    var tableName = g_form.getTableName();
    if (!tableName) {
      tableName = "ni";
    }
    var sysId = g_form.getSysId();
    if (typeof sysId === 'undefined') {
      sysId = '';
    }
    var url = urlTools.getURL('run_catalog_data_lookup');
    var getFieldSequence = g_form.$private.options('getFieldSequence');
    var requestFields = angular.extend({}, fieldParams, {
      sys_target: tableName,
      sysparm_id: itemSysId,
      data_lookup_sys_id: dld.data_lookup_sys_id,
      variable_sequence1: getFieldSequence()
    });
    return $http({
      method: 'POST',
      url: url,
      data: urlTools.encodeURIParameters(requestFields),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function(response) {
      var data = response.data;
      if (!data.fields) {
        return;
      }
      g_form.serviceCatalog.dataLookupDisabled = true;
      for (var i = 0; i < data.fields.length; i++) {
        var field = data.fields[i];
        if (field.label === '' || field.value === '') {
          continue;
        }
        g_form.setValue(field.name, field.value, field.label);
      }
      g_form.serviceCatalog.dataLookupDisabled = false;
    });
  }
});;
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
});;;