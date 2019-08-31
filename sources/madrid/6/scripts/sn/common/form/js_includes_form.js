/*! RESOURCE: /scripts/sn/common/form/js_includes_form.js */
/*! RESOURCE: /scripts/sn/common/form/_module.js */
angular.module('sn.common.form', [
  'sn.common.clientScript',
  'sn.common.form.data'
]);;
/*! RESOURCE: /scripts/sn/common/form/directive.glideFormField.js */
angular.module('sn.common.form').directive('glideFormField', function(getTemplateUrl, cabrillo, glideFormFieldFactory, i18n, $log) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('directive_glide_form_field.xml'),
    scope: {
      field: '=',
      tableName: '=',
      getGlideForm: '&glideForm'
    },
    controller: function($element, $scope) {
      var g_form;
      $scope.requiredMsg = i18n.getMessage('Required');
      if (!$scope.getGlideForm) {
        $log.warn('glideFormField: Field directive is missing GlideForm');
      } else {
        g_form = $scope.getGlideForm();
      }
      var field = $scope.field;
      var glideField = glideFormFieldFactory.create(field);
      $scope.isReadonly = glideField.isReadonly;
      $scope.isMandatory = glideField.isMandatory;
      $scope.isVisible = glideField.isVisible;
      $scope.hasMessages = glideField.hasMessages;
      var isNative = cabrillo.isNative();
      $scope.showBarcodeHelper = isNative && glideField.hasBarcodeHelper();
      $scope.showCurrentLocationHelper = isNative && glideField.hasCurrentLocationHelper();
      $scope.getBarcode = function() {
        cabrillo.camera.getBarcode().then(function(value) {
          cabrillo.log('Received barcode value: ' + value);
          g_form.setValue($scope.field.name, value);
        });
      };
      $scope.getCurrentLocation = function() {
        cabrillo.geolocation.getCurrentLocation().then(function(value) {
          var composite = value.coordinate.latitude + ',' + value.coordinate.longitude;
          g_form.setValue($scope.field.name, composite);
        });
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/form/directive.recursiveHelper.js */
angular.module('sn.common.form').directive('recursiveHelper', function($compile) {
  return {
    restrict: "EACM",
    priority: 100000,
    compile: function(tElement, tAttr) {
      var contents = tElement.contents().remove();
      var compiledContents;
      return function(scope, iElement, iAttr) {
        if (!compiledContents)
          compiledContents = $compile(contents);
        iElement.append(compiledContents(scope, function(clone) {
          return clone;
        }));
      };
    }
  };
});;
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
      if (!foundAction) {
        name = name.toLowerCase();
        _uiActions.forEach(function(action) {
          if (foundAction) {
            return;
          }
          if (name === (action.getDisplayName() || '').toLowerCase()) {
            foundAction = action;
          }
        });
      }
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
/*! RESOURCE: /scripts/sn/common/form/data/js_includes_data.js */
/*! RESOURCE: /scripts/sn/common/form/data/_module.js */
angular.module('sn.common.form.data', []);;
/*! RESOURCE: /scripts/sn/common/form/data/glideUIActionsApi.js */
angular.module('sn.common.form.data').factory('glideUIActionsApi', function($http) {
  'use strict';
  return {
    execute: execute
  };

  function execute(actionSysId, type, tableName, recordSysId, fields, encodedRecord, requestParams) {
    return $http.post('/api/now/mobile/ui_actions/' + actionSysId + '/execute', {
      sysparm_type: type,
      sysparm_table: tableName,
      sysparm_sys_id: recordSysId,
      sysparm_encoded_record: encodedRecord,
      sysparm_fields: fields,
      sysparm_request_params: requestParams
    });
  }
});;;;