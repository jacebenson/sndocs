/*! RESOURCE: /scripts/app.$sp/service.spNavStateManager.js */
angular.module('sn.$sp').factory('spNavStateManager', function($rootScope, $window, spConf, $q, spModal, i18n) {
  'use strict';
  var registeredForms = {};

  function registerForm(tableName, saveFunction, g_form) {
    registeredForms[tableName] = {
      'saveFunc': saveFunction,
      'g_form': g_form
    };
    return registeredForms[tableName];
  }

  function onRecordChange() {
    var dirtyFormsArray = _getDirtyArrayFromArgs();
    if (dirtyFormsArray.length !== 0) {
      return showModal(dirtyFormsArray);
    } else {
      return $q.when(true);
    }
  }

  function showModal(dirtyTableNames) {
    return spModal.open({
      title: i18n.getMessage("Save Changes"),
      headerStyle: {
        border: 'none',
        'padding-bottom': 0
      },
      footerStyle: {
        border: 'none',
        'padding-top': 0
      },
      message: i18n.getMessage("Do you want to save your changes before leaving this page?"),
      buttons: [{
          label: i18n.getMessage("Discard"),
          value: "discard"
        },
        {
          label: i18n.getMessage("Save"),
          primary: true,
          value: "save"
        }
      ]
    }).then(function(confirm) {
      if (confirm.value == "save") {
        for (var tn in dirtyTableNames) {
          var tableName = dirtyTableNames[tn];
          registeredForms[tableName].saveFunc();
        }
      }
      for (var i in dirtyTableNames) {
        var tableName = dirtyTableNames[i];
        registeredForms[tableName].g_form.$private.userState.clearModifiedFields();
      }
    });
  }

  function _getDirtyArrayFromArgs() {
    if (!g_dirty_form_warning_enabled)
      return [];
    var dirtyFormsArray = [];
    var tables = Array.prototype.slice.call(arguments, 0);
    if (tables.length === 0) {
      tables = Object.keys(registeredForms);
    }
    for (var t in tables) {
      var tableName = tables[t];
      if (registeredForms[tableName] && registeredForms[tableName].g_form.isUserModified()) {
        dirtyFormsArray.push(tableName);
      }
    }
    return dirtyFormsArray;
  }

  function _getDirtyTables() {
    if (!g_dirty_form_warning_enabled)
      return [];
    var dirtyTables = [];
    Object.keys(registeredForms).forEach(function(tableName) {
      var form = registeredForms[tableName];
      if (form.g_form.isUserModified()) {
        dirtyTables.push(tableName);
      }
    });
    return dirtyTables;
  }
  $rootScope.$on('$locationChangeStart', function(event, next) {
    var dirtyTables = _getDirtyTables();
    if (dirtyTables.length > 0) {
      event.preventDefault();
      showModal(dirtyTables).then(function() {
        window.location = next;
      });
    }
  });
  $window.onbeforeunload = function(event) {
    var dirtyTables = _getDirtyTables();
    if (dirtyTables.length > 0) {
      event.returnValue = "";
    }
  }
  return {
    _getDirtyArrayFromArgs: _getDirtyArrayFromArgs,
    onRecordChange: onRecordChange,
    register: registerForm
  }
});;