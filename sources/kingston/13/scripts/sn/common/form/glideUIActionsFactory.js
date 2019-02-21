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
    }
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
        options.uiActionExecuter
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

  function GlideUIAction(name, sysId, displayName, disabled, displayTypes, navigateBehavior, uiActionExecuter) {
    var _inProgress = false;
    var _name = name;
    var _sysId = sysId;
    var _displayName = displayName;
    var _disabled = !!disabled;
    var _navigateBehavior;
    var _actionExecuter = uiActionExecuter;
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
      return _actionExecuter(
        this.getSysId(),
        g_form.getTableName(),
        g_form.getSysId(),
        g_form.serialize(true),
        g_form.getEncodedRecord()
      ).finally(function() {
        _inProgress = false;
      });
    };
  }
});;