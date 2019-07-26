/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.spSCMultiRowElement.js */
angular.module('sn.$sp').directive('spScMultiRowElement', function($http, spModal, spUtil, i18n, $sce, spScUtil) {
  "use strict";

  function getEmbeddedWidgetOptions(action, data) {
    var options = {
      embeddedWidgetId: "sc-multi-row-active-row",
      embeddedWidgetOptions: {
        action: action,
        source_table: "",
        source_id: "",
        row_data: {},
        variable_set_id: "",
        cat_item: ""
      },
      backdrop: "static",
      keyboard: false,
      size: "md"
    };
    for (var key in options.embeddedWidgetOptions) {
      if (typeof data[key] != "undefined") {
        options.embeddedWidgetOptions[key] = data[key];
      }
    }
    return options;
  }

  function loadActiveRowWidget(action, data) {
    return $http({
      method: 'POST',
      url: spUtil.getWidgetURL("widget-modal"),
      headers: spUtil.getHeaders(),
      data: getEmbeddedWidgetOptions(action, data)
    });
  }

  function isValueEmpty(value) {
    return typeof value == "undefined" || value == "";
  }
  var actions = {
    ADD_ROW: "add",
    UPDATE_ROW: "edit",
  };
  var catalogVariableTypes = {
    CHECK_BOX: "7"
  };
  return {
    restrict: "E",
    templateUrl: "sp_element_sc_multi_row.xml",
    controllerAs: "c",
    scope: {
      'field': "=",
      'getGlideForm': '&glideForm'
    },
    controller: function($scope) {
      var field = $scope.field;
      var g_form = $scope.getGlideForm();

      function getActiveOptionsData() {
        return {
          variable_set_id: field.sys_id,
          source_table: field.source_table,
          source_id: field.source_id,
          cat_item: field.cat_item
        };
      }
      $scope.$on("$sp.sc_multi_row.create_row", function(evt, fieldId, itemId) {
        if (field.id == fieldId && field.cat_item == itemId)
          $scope.c.createRow();
      });
      g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
        if (fieldName !== field.name) {
          return;
        }
        field._value = isValueEmpty(newValue) ? [] : JSON.parse(newValue);
        if (field._value.length > 0)
          refreshMultiRowDisplayValue();
        else {
          field.displayValue = [];
          field._displayValue = "";
        }
      });

      function refreshMultiRowDisplayValue() {
        field._loadingData = true;
        spScUtil.getDisplayValueForMultiRowSet(field.id, field.value).then(function(response) {
          if (!response.data)
            return;
          field.displayValue = response.data.result;
          field._displayValue = JSON.parse(response.data.result);
          field._loadingData = false;
        });
      }
      this.clearValue = function() {
        var options = {
          title: i18n.getMessage("Are you sure you want to delete all rows?"),
          headerStyle: {
            border: 'none',
            'padding-bottom': 0
          },
          footerStyle: {
            border: 'none',
            'padding-top': 0
          },
          messageOnly: true,
          buttons: [{
              label: i18n.getMessage('Cancel'),
              primary: false
            },
            {
              label: i18n.getMessage("Remove"),
              class: "btn-danger",
              primary: true
            }
          ]
        };
        spModal.open(options).then(function(actionButton) {
          if (!actionButton.primary)
            return;
          $scope.getGlideForm().setValue(field.name, "", "");
        });
      }
      this.createRow = function(evt) {
        var that = this;
        var activeRowWidget;
        loadActiveRowWidget(actions.ADD_ROW, getActiveOptionsData()).then(function(response) {
          var activeRowWidget = response.data.result;
          var unregisterCancel = $scope.$on("$sp.sc_multi_row_active_row.cancel", function(event, data) {
            that.activeRow = "";
          });
          var unregisterSave = $scope.$on("$sp.sc_multi_row_active_row.add", function(event, data) {
            that.activeRow = "";
            var newVal = angular.copy(field._value) || [];
            var newDisplayVal = angular.copy(field._displayValue) || [];
            newVal.push(data.value);
            newDisplayVal.push(data.display_value);
            $scope.getGlideForm().setValue(field.name, JSON.stringify(newVal), JSON.stringify(newDisplayVal));
          });
          activeRowWidget.options.afterClose = function() {
            unregisterSave();
            unregisterCancel();
          }
          that.activeRow = activeRowWidget;
        });
      }
      this.updateRow = function(index) {
        var that = this;
        var activeRowWidget;
        var options = getActiveOptionsData();
        options.row_data = field._value[index];
        loadActiveRowWidget(actions.UPDATE_ROW, options).then(function(response) {
          var activeRowWidget = response.data.result;
          var unregisterCancel = $scope.$on("$sp.sc_multi_row_active_row.cancel", function(event, data) {
            that.activeRow = "";
          });
          var unregister = $scope.$on("$sp.sc_multi_row_active_row.update", function(event, data) {
            that.activeRow = "";
            var newVal = angular.copy(field._value) || [];
            var newDisplayVal = angular.copy(field._displayValue) || [];
            newVal[index] = data.value;
            newDisplayVal[index] = data.display_value;
            field._value[index] = angular.copy(data.value);
            field._displayValue[index] = angular.copy(data.display_value);
            $scope.getGlideForm().setValue(field.name, JSON.stringify(newVal), JSON.stringify(newDisplayVal));
          });
          activeRowWidget.options.afterClose = function() {
            unregister();
            unregisterCancel();
          };
          that.activeRow = activeRowWidget;
        });
      }
      this.deleteRow = function(index) {
        var options = {
          title: i18n.getMessage("Are you sure you want to delete the row?"),
          headerStyle: {
            border: 'none',
            'padding-bottom': 0
          },
          footerStyle: {
            border: 'none',
            'padding-top': 0
          },
          messageOnly: true,
          buttons: [{
              label: i18n.getMessage('Cancel'),
              primary: false
            },
            {
              label: i18n.getMessage("Remove"),
              class: "btn-danger",
              primary: true
            }
          ]
        };
        spModal.open(options).then(function(actionButton) {
          if (!actionButton.primary)
            return;
          var newVal = angular.copy(field._value) || [];
          var newDisplayVal = angular.copy(field._displayValue) || [];
          newVal.splice(index, 1);
          newDisplayVal.splice(index, 1);
          if (newVal.length !== 0)
            $scope.getGlideForm().setValue(field.name, JSON.stringify(newVal), JSON.stringify(newDisplayVal));
          else
            $scope.getGlideForm().setValue(field.name, "", "");
        });
      }
      this.canDelete = function() {
        return true;
      }
      this.canInsert = function() {
        if (field._value.length + 1 > field.max_rows_size)
          return false;
        return true;
      }
      this.canClearValue = function() {
        return this.canDelete() && field._value && field._value.length > 0;
      }
      this.getCellDisplayValue = function(displayValue, fieldType) {
        if (fieldType == catalogVariableTypes.CHECK_BOX)
          return "" + (displayValue == 'true');
        return $sce.trustAsHtml(displayValue);
      }
    },
    link: function(scope, element, attrs, ctrl) {
      var field = scope.field;
      if (typeof field.value != "undefined" && Array.isArray(field.value))
        field.value = JSON.stringify(field.value);
      if (typeof field.displayValue != "undefined" && Array.isArray(field.displayValue))
        field.displayValue = JSON.stringify(field.displayValue);
      if (typeof field._value == "undefined")
        field._value = isValueEmpty(field.value) ? [] : JSON.parse(field.value);
      if (typeof field._displayValue == "undefined")
        field._displayValue = isValueEmpty(field.displayValue) ? [] : JSON.parse(field.displayValue);
      scope.field._loadingData = false;
    }
  };
});;