/*! RESOURCE: /scripts/sn/common/form/glideUIActionsFactory.js */
angular.module('sn.common.form').factory('glideUIActionsFactory', function(urlTools, $http, $q, $log) {
  'use strict';
  var ACTION_OPERATIONS = {
    'INSERT': 'insert',
    'UPDATE': 'update'
  };
  var ACTION_TYPES = {
    'LIST': 'list',
    'FORM': 'form'
  };
  var ACTION_DISPLAY_TYPES = {
    'LIST_BUTTON': 'list_button',
    'FORM_BUTTON': 'form_button',
    'FORM_MORE_ITEM': 'form_more_item'
  };
  return {
    ACTION_OPERATIONS: ACTION_OPERATIONS,
    ACTION_TYPES: ACTION_TYPES,
    create: function(uiActions, options) {
      return new GlideUIActions(uiActions, options);
    },
    executeUIAction: executeUIAction
  };

  function GlideUIActions(uiActions, options) {
    if (!uiActions) {
      throw 'uiActions must be provided';
    }
    var _uiActionsById = {};
    var _uiActions = [];
    options = options || {};
    uiActions.forEach(function(uiAction) {
      var action = new GlideUIAction(
        uiAction.action_name,
        uiAction.sys_id,
        uiAction.name,
        uiAction.disabled,
        uiAction.display_types,
        uiAction.navigate_back === true ? 'back' : 'default',
        options.uiActionNotifier
      );
      _uiActionsById[action.getSysId()] = action;
      _uiActions.push(action);
    });
    this.getActions = function() {
      return _uiActions;
    };
    this.getAction = function(sysId) {
      return _uiActionsById[sysId];
    };
    this.getActionByName = function(name) {
      var foundAction;
      _uiActions.forEach(function(action) {
        if (foundAction) {
          return;
        }
        if (name === action.getName()) {
          foundAction = action;
        }
      });
      return foundAction;
    };
  }

  function GlideUIAction(name, sysId, displayName, disabled, displayTypes, navigateBehavior, uiActionNotifier) {
    var _inProgress = false;
    var _name = name;
    var _sysId = sysId;
    var _displayName = displayName;
    var _disabled = !!disabled;
    var _navigateBehavior;
    var _notifier = uiActionNotifier;
    switch (navigateBehavior) {
      case 'back':
        _navigateBehavior = 'back';
        break;
      default:
        _navigateBehavior = 'default';
        break;
    }
    var _displayTypes = {};
    if (displayTypes) {
      displayTypes.forEach(function(type) {
        _displayTypes[type] = true;
      });
    }
    this.getSysId = function() {
      return _sysId;
    };
    this.getName = function() {
      return _name;
    };
    this.getDisplayName = function() {
      return _displayName;
    };
    this.getNavigateBehavior = function() {
      return _navigateBehavior;
    };
    this.isDisabled = function() {
      return _disabled;
    };
    this.isMoreMenuItem = function() {
      return !_displayTypes[ACTION_DISPLAY_TYPES.FORM_BUTTON] && _displayTypes[ACTION_DISPLAY_TYPES.FORM_MORE_ITEM];
    };
    this.execute = function(g_form) {
      if (this.isDisabled() || _inProgress) {
        return false;
      }
      _inProgress = true;
      var $execute = executeUIAction(
        ACTION_TYPES.FORM,
        this.getSysId(),
        g_form.getTableName(),
        g_form.getSysId(),
        g_form.isNewRecord() ? ACTION_OPERATIONS.INSERT : ACTION_OPERATIONS.UPDATE,
        g_form.serialize(true),
        g_form.getEncodedRecord()
      ).finally(function() {
        _inProgress = false;
      });
      _notifier(this.getName(), $execute);
      return $execute;
    };
  }

  function executeUIAction(actionType, actionSysId, tableName, recordSysId, operation, fields, encodedRecord) {
    var queryParams = {
      method: 'execute',
      type: actionType,
      operation: angular.isDefined(operation) ? operation : ACTION_OPERATIONS.UPDATE,
      action_id: actionSysId,
      table: tableName,
      sys_id: recordSysId,
      save_parms: JSON.stringify({})
    };
    var url = urlTools.getURL('ui_action', queryParams);
    return $http.post(url, {
      fields: fields || [],
      encoded_record: encodedRecord
    }).then(function(response) {
      var data = response.data;
      return {
        sys_id: data.sys_id,
        redirect: data.redirect
      };
    }).catch(function(data, status) {
      $log.log("Error executing uiAction: " + status);
    });
  }
});;