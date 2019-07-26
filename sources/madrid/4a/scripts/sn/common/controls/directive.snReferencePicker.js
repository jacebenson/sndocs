/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, escapeHtml, i18n) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ed: "=?",
      field: "=",
      refTable: "=?",
      refId: "=?",
      snOptions: "=?",
      snOnChange: "&",
      snOnBlur: "&",
      snOnClose: "&",
      snOnOpen: '&',
      minimumInputLength: "@",
      snDisabled: "=",
      snPageSize: "@",
      dropdownCssClass: "@",
      formatResultCssClass: "&",
      overlay: "=",
      additionalDisplayColumns: "@",
      displayColumn: "@",
      recordValues: '&',
      getGlideForm: '&glideForm',
      domain: "@",
      snSelectWidth: '@',
    },
    template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
    link: function(scope, element, attrs, ctrl) {
      scope.ed = scope.ed || scope.field.ed;
      scope.selectWidth = scope.snSelectWidth || '100%';
      element.css("opacity", 0);
      var fireReadyEvent = true;
      var g_form;
      if (angular.isDefined(scope.getGlideForm))
        g_form = scope.getGlideForm();
      var fieldAttributes = {};
      if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
        if (Array.isArray(scope.field.attributes))
          fieldAttributes = scope.field.attributes;
        else
          fieldAttributes = parseAttributes(scope.field.attributes);
      else
        fieldAttributes = parseAttributes(scope.ed.attributes);
      if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
        scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
      var select2AjaxHelpers = {
        formatSelection: function(item) {
          return escapeHtml(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return escapeHtml(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + escapeHtml(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          if ('sysparm_include_variables' in queryParams.data) {
            var url = urlTools.getURL('ref_list_data', queryParams.data);
            return $http.get(url).then(queryParams.success);
          } else {
            var urlQueryParameters = {};
            if (queryParams.data['sysparm_for_impersonation']) {
              urlQueryParameters['sysparm_for_impersonation'] = true;
            }
            var url = urlTools.getURL('ref_list_data', urlQueryParameters);
            return $http.post(url, queryParams.data).then(queryParams.success);
          }
        },
        initSelection: function(elem, callback) {
          if (scope.field && scope.field.displayValue)
            callback({
              sys_id: scope.field.value,
              name: scope.field.displayValue
            });
        }
      };
      var config = {
        width: scope.selectWidth,
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
        overlay: scope.overlay,
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '   ',
        formatSearching: '',
        allowClear: attrs.allowClear !== 'false',
        id: function(item) {
          return item.sys_id;
        },
        sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var q = _getReferenceQuery(filterText);
            var params = {
              start: (scope.pageSize * (page - 1)),
              count: scope.pageSize,
              sysparm_target_table: scope.refTable,
              sysparm_target_sys_id: scope.refId,
              sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
              table: scope.ed.reference,
              qualifier: scope.ed.qualifier,
              sysparm_for_impersonation: !!scope.ed.for_impersonation,
              data_adapter: scope.ed.data_adapter,
              attributes: scope.ed.attributes,
              dependent_field: scope.ed.dependent_field,
              dependent_table: scope.ed.dependent_table,
              dependent_value: scope.ed.dependent_value,
              p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
            };
            if (scope.domain) {
              params.sysparm_domain = scope.domain;
            }
            if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true) {
              delete params['sysparm_target_table'];
              params['sysparm_include_variables'] = true;
              params['variable_ids'] = scope.field.sys_id;
              var getFieldSequence = g_form.$private.options('getFieldSequence');
              if (getFieldSequence) {
                params['variable_sequence1'] = getFieldSequence();
              }
              var itemSysId = g_form.$private.options('itemSysId');
              params['sysparm_id'] = itemSysId;
              var getFieldParams = g_form.$private.options('getFieldParams');
              if (getFieldParams) {
                angular.extend(params, getFieldParams());
              }
            }
            if (scope.recordValues)
              params.sysparm_record_values = scope.recordValues();
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2AjaxHelpers.search
        },
        formatSelection: select2AjaxHelpers.formatSelection,
        formatResult: select2AjaxHelpers.formatResult,
        initSelection: select2AjaxHelpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
        }
        if (scope.snOptions.width) {
          config.width = scope.snOptions.width;
        }
      }

      function _getReferenceQuery(filterText) {
        var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
        var colToSearch = getReferenceColumnsToSearch();
        var excludedValues = getExcludedValues();
        return colToSearch.map(function(column) {
          return column + filterExpression.operator + filterExpression.filterText +
            '^' + column + 'ISNOTEMPTY' + excludedValues;
        }).join("^NQ");
      }

      function getReferenceColumnsToSearch() {
        var colName = ['name'];
        if (scope.ed.searchField) {
          colName = scope.ed.searchField.split(";");
        } else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          colName = fieldAttributes['ref_ac_columns'].split(';');
        } else if (fieldAttributes['ref_ac_order_by']) {
          colName = [fieldAttributes['ref_ac_order_by']];
        }
        return colName;
      }

      function getExcludedValues() {
        if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
          return '^sys_idNOT IN' + scope.ed.excludeValues;
        }
        return '';
      }

      function parseAttributes(strAttributes) {
        var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
        var attributeObj = {};
        for (var i = 0; i < attributeArray.length; i++) {
          if (attributeArray[i].length > 0) {
            var attribute = attributeArray[i].split('=');
            attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
          }
        }
        return attributeObj;
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          var select2 = element.select2(config).select2('val', []);
          select2.bind("change", select2Change);
          select2.bind("select2-removed", select2Change);
          select2.bind("select2-blur", function() {
            scope.$apply(function() {
              scope.snOnBlur();
            });
          });
          select2.bind("select2-close", function() {
            scope.$apply(function() {
              scope.snOnClose();
            });
          });
          select2.bind("select2-open", function() {
            scope.$apply(function() {
              if (scope.snOnOpen)
                scope.snOnOpen();
            });
          });
          select2.bind('select2-focus', function() {
            redirectLabel(element);
          });
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }

      function select2Change(e) {
        e.stopImmediatePropagation();
        if (e.added) {
          if (scope.$$phase || scope.$root.$$phase)
            return;
          var selectedItem = e.added;
          var value = selectedItem.sys_id;
          var displayValue = value ? getDisplayValue(selectedItem) : '';
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.setValue(scope.field.name, value, displayValue);
            scope.rowSelected();
            e.displayValue = displayValue;
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.value = value;
              scope.field.displayValue = displayValue;
              scope.rowSelected();
              e.displayValue = displayValue;
              triggerSnOnChange();
            });
          }
        } else if (e.removed) {
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.clearValue(scope.field.name);
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.displayValue = '';
              scope.field.value = '';
              triggerSnOnChange();
            });
          }
        }
        $timeout(function() {
          element.parent().find(".select2-focusser").focus();
        }, 0, false);

        function triggerSnOnChange() {
          if (scope.snOnChange)
            scope.snOnChange(e);
        }
      }

      function redirectLabel($select2) {
        if (NOW.select2LabelWorkaround)
          NOW.select2LabelWorkaround($select2);
      }

      function getDisplayValue(selectedItem) {
        var displayValue = '';
        if (selectedItem && selectedItem.sys_id) {
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            displayValue = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            displayValue = selectedItem.$$displayValue;
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return displayValue;
      }

      function getDisplayValues(selectedItem) {
        var displayValues = [];
        if (selectedItem && selectedItem.sys_id) {
          var current = "";
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            current = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            current = selectedItem.$$displayValue;
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayValues.push(current);
        }
        if (scope.additionalDisplayColumns) {
          var columns = scope.additionalDisplayColumns.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayValues.push(selectedItem[column]);
          }
        }
        return displayValues;
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue != oldValue && newValue !== scope.model) {
          init();
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $timeout(function() {
          element.select2("open");
        })
      });
      init();
    },
    controller: function($scope, $rootScope) {
      $scope.pageSize = 20;
      if ($scope.snPageSize)
        $scope.pageSize = parseInt($scope.snPageSize);
      $scope.rowSelected = function() {
        $rootScope.$broadcast("@page.reference.selected", {
          field: $scope.field,
          ed: $scope.ed
        });
      };
      this.filterResults = function(data, page) {
        return {
          results: data.data.items,
          more: (page * $scope.pageSize < data.data.total)
        };
      };
    }
  };
});;