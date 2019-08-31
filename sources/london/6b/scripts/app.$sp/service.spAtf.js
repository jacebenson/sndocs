/*! RESOURCE: /scripts/app.$sp/service.spAtf.js */
angular.module('sn.$sp').factory('spAtf', function($q, $http, $rootScope) {
  'use strict';
  var _atf;

  function _getAtfManager(atf) {
    function _triggerPageLoaded() {
      if (atf.triggerPortalPageLoaded) {
        atf.triggerPortalPageLoaded();
      }
    }

    function _expose(name, obj) {
      window[name] = obj;
    }
    return {
      triggerPageLoaded: _triggerPageLoaded,
      expose: _expose
    };
  }

  function _augmentForm(g_form) {
    var oriFieldValues = {};

    function gel(id) {
      if (typeof id != 'string') {
        return id;
      }
      return document.getElementById(id);
    }

    function _getReferenceTable(field) {
      var referenceTable = field.ed ? field.ed.reference : undefined;
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.refTable;
      }
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.ref_table;
      }
      return referenceTable;
    }
    g_form.getParameter = function(param) {
      if (!(param.substr(0, 8) == 'sysparm_')) {
        param = 'sysparm_' + param;
      }
      var pcel = gel(param);
      return pcel ? pcel.value : '';
    };
    g_form.getFormElement = function() {
      return gel(g_form.getTableName() + '.do');
    };
    g_form.isChoiceField = function(fieldName) {
      var field = g_form.getField(fieldName);
      return field && (field.type === 'choice' || field.type === 'multiple_choice');
    };
    g_form.isValidChoice = function(fieldName, value) {
      var field = g_form.getField(fieldName);
      var choices = field.choices || [];
      for (var i = 0; i < choices.length; i++) {
        if (choices[i].value === value) {
          return true;
        }
      }
      return false;
    };
    g_form.getRef = function(fieldName, callback) {
      if (!callback) {
        _logWarn('GETREF:NOCB', 'Mobile scripts must specify a callback function');
        return;
      }
      var field = g_form.getField(fieldName);
      if (!field) {
        _logWarn('GETREF:FNF', 'Field not found: ' + fieldName);
        return;
      }
      var table = _getReferenceTable(field);
      var referenceKey = field.reference_key ? field.reference_key : 'sys_id';
      var url = '/api/now/table/' + table + '?sysparm_query=' + encodeURIComponent(referenceKey + '=' + field.value) + '&sysparm_fields=sys_id&sysparm_limit=1';
      $http.get(url).then(function(res) {
        if (res.data.result && res.data.result.length === 1) {
          return callback(res.data.result[0]);
        }
        callback({
          _error: 'No matching record found'
        });
      }, function(res) {
        callback({
          _error: res.data.error.message
        });
      });
    };
    g_form.serializeToString = function() {
      var tableName = g_form.getTableName();
      var serialized = [
        'sys_target=' + tableName,
        'sys_uniqueValue=' + g_form.getUniqueValue()
      ];
      g_form.serialize().forEach(function(f) {
        var key = tableName + '.' + f.ed.name;
        serialized.push('sys_original.' + key + '=' + encodeURIComponent((oriFieldValues[f.ed.name] || f).value));
        serialized.push(key + '=' + encodeURIComponent(f.value));
      });
      return serialized.join('&');
    };
    g_form.atfSubmit = function(sysId) {
      var action = sysId.length > 2 ? 'sysverb_update' : 'sysverb_insert';
      var deferred = $q.defer();
      g_form.submit(action);
      var cleanUp = $rootScope.$on('sp.form.submitted', function(o, result) {
        cleanUp();
        deferred.resolve(result);
      });
      return deferred.promise;
    };
    g_form.$private.events.on('onChange', function(fieldName, oldValue) {
      oriFieldValues[fieldName] = {
        value: oldValue
      };
    });
    return g_form;
  }

  function _init() {
    if (_atf) {
      return $q(function(resolve) {
        resolve(_getAtfManager(_atf));
      });
    }
    if (window.ATF) {
      _atf = window.ATF;
      return $q(function(resolve) {
        resolve(_getAtfManager(_atf));
      });
    }
    return $q(function(resolve, reject) {
      reject();
    });
  }
  return {
    init: _init,
    augmentForm: _augmentForm
  };
});;