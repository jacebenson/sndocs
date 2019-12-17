/*! RESOURCE: /scripts/app.$sp/directive.spChoiceList.js */
angular.module('sn.$sp').directive('spChoiceList', function($timeout, spUtil, $http, i18n, select2EventBroker) {
  return {
    template: '<select name="{{::field.name}}" id="sp_formfield_{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" sn-select-width="auto" ng-disabled="field.isReadonly()" ng-options="c.value as getLabel(c) for c in field.choices track by getVal(c.value)"></select>',
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      'field': '=',
      'getGlideForm': '&glideForm',
      'setDefaultValue': '&defaultValueSetter'
    },
    link: function(scope, element, attrs, ngModel) {
      scope.getVal = function(v) {
        return v;
      };
      scope.getLabel = function(c) {
        if (c.priceLabel) {
          return c.label.concat(c.priceLabel);
        } else {
          return c.label;
        }
      }
      var g_form = scope.getGlideForm();
      var field = scope.field;
      var isOpen = false;
      scope.fieldValue = function() {
        return field.value;
      };
      g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
        if (fieldName == field.name) {} else if (fieldName == field.dependentField) {
          field.dependentValue = newValue;
          refreshChoiceList();
        } else if (typeof field.variable_name !== 'undefined' && field.reference_qual && isRefQualElement(fieldName)) {
          refreshReferenceChoices();
        }
        element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
        element.parent().find(".select2-focusser").attr("aria-required", field.isMandatory());
      });

      function isRefQualElement(fieldName) {
        var refQualElements = [];
        if (field.attributes && field.attributes.indexOf('ref_qual_elements') > -1) {
          var attributes = spUtil.parseAttributes(field.attributes);
          refQualElements = attributes['ref_qual_elements'].split(',');
        }
        return field.reference_qual.indexOf(fieldName) != -1 || refQualElements.indexOf(fieldName) != -1;
      }

      function refreshChoiceList() {
        var params = {};
        params.table = g_form.getTableName();
        params.field = field.name;
        params.sysparm_dependent_value = field.dependentValue;
        params.sysparm_type = 'choice_list_data';
        var url = spUtil.getURL(params);
        return $http.get(url).success(function(data) {
          field.choices = [];
          g_form.$private.clearOptionStack(field.name);
          angular.forEach(data.items, function(item) {
            field.choices.push(item);
          });
          selectValueOrNone();
        });
      }

      function selectValueOrNone() {
        var hasSelectedValue = false;
        angular.forEach(field.choices, function(c) {
          if (field.value == c.value)
            hasSelectedValue = true;
        });
        if (!hasSelectedValue && field.choices.length > 0) {
          var defaultValue = field.choices[0].value;
          var defaultLabel = field.choices[0].label;
          for (var i = 0; i < field.choices.length; ++i) {
            var choice = field.choices[i];
            if (field.default_value === choice.value) {
              defaultValue = choice.value;
              defaultLabel = choice.label;
              break;
            }
          }
          scope.setDefaultValue({
            fieldName: field.name,
            fieldInternalValue: defaultValue,
            fieldDisplayValue: defaultLabel
          });
        }
        element.select2('val', ngModel.$viewValue);
        if (isOpen)
          element.select2("close").select2("open");
      }

      function refreshReferenceChoices() {
        var params = {};
        params['qualifier'] = field.reference_qual;
        params['table'] = field.lookup_table;
        params['o'] = field.lookup_label || field.lookup_value;
        params['sysparm_include_variables'] = true;
        params['variable_ids'] = field.sys_id;
        var getFieldSequence = g_form.$private.options('getFieldSequence');
        if (getFieldSequence) {
          params['variable_sequence1'] = getFieldSequence();
        }
        var itemSysId = g_form.$private.options('itemSysId');
        params['sysparm_id'] = itemSysId;
        params['sysparm_query_refs'] = false;
        var getFieldParams = g_form.$private.options('getFieldParams');
        if (getFieldParams) {
          angular.extend(params, getFieldParams());
        }
        params.sysparm_type = 'sp_ref_list_data';
        var url = spUtil.getURL({
          sysparm_type: 'sp_ref_list_data'
        });
        return $http.post(url, params).then(function(response) {
          if (!response.data)
            return;
          field.choices = [];
          g_form.$private.clearOptionStack(field.name);
          angular.forEach(response.data.items, function(item) {
            item.label = item.$$displayValue;
            item.value = item.sys_id;
            field.choices.push(item);
          });
          if (!field.choices.length)
            g_form.clearValue(scope.field.name);
          else
            selectValueOrNone();
          scope.$emit('sp.sc.refresh_label_choices', field);
        });
      }
      var pcTimeout;

      function updateOptions() {
        $timeout.cancel(pcTimeout);
        pcTimeout = $timeout(function() {
          field.choices = applyOptionStack(field.choices, field.optionStack);
          selectValueOrNone();
        }, 35);
      }
      g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
        if (fieldName != field.name)
          return;
        if (propertyName == "optionStack") {
          updateOptions();
        }
      });
      scope.$watch('field.optionStack', function() {
        if (field.optionStack) {
          updateOptions();
        }
      });
      updateOptions();

      function applyOptionStack(options, optionStack) {
        if (!optionStack || optionStack.length == 0) {
          return options;
        }
        var newOptions = angular.copy(options);
        if (!newOptions) {
          newOptions = [];
        }
        optionStack.forEach(function(item) {
          switch (item.operation) {
            case 'add':
              for (var o in newOptions) {
                if (newOptions[o].label == item.label)
                  return;
              }
              var newOption = {
                label: item.label,
                value: item.value
              };
              if (typeof item.index === 'undefined') {
                newOptions.push(newOption);
              } else {
                newOptions.splice(item.index, 0, newOption);
              }
              break;
            case 'remove':
              var itemValue = String(item.value);
              for (var i = 0, iM = newOptions.length; i < iM; i++) {
                var optionValue = String(newOptions[i].value);
                if (optionValue !== itemValue) {
                  continue;
                }
                newOptions.splice(i, 1);
                break;
              }
              break;
            case 'clear':
              newOptions = [];
              break;
            default:
          }
        });
        return newOptions;
      }
      if (angular.isFunction(element.select2)) {
        element.select2({
          allowClear: false,
          width: '100%'
        }).focus(function() {
          element.select2('focus');
        });
        element.bind("change select2-removed", function(e) {
          e.stopImmediatePropagation();
          if (e.added) {
            var selectedItem = e.added;
            g_form.setValue(field.name, selectedItem.id, selectedItem.text);
          } else if (e.removed) {
            g_form.clearValue(scope.field.name);
          }
        });
        element.bind("select2-opening", function() {
          select2EventBroker.publishSelect2Opening();
        });
        element.bind("select2-open", function() {
          isOpen = true;
          element.parent().find(".select2-focusser").attr("aria-expanded", isOpen);
        });
        element.bind("select2-close", function() {
          isOpen = false;
          element.parent().find(".select2-focusser").attr("aria-expanded", isOpen);
        });
        ngModel.$render = function() {
          if (ngModel.$viewValue === "" || ngModel.$viewValue === null)
            selectValueOrNone();
          element.select2('val', ngModel.$viewValue);
        };
      }
      scope.$evalAsync(function() {
        element.parent().find(".select2-focusser").removeAttr("aria-labelledby");
        element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
        element.parent().find(".select2-focusser").attr("aria-required", field.isMandatory());
        element.parent().find(".select2-focusser").attr("aria-expanded", isOpen);
        var container = element.parent().find('.select2-container');
        if (container && container.length > 0) {
          container.attr('id', (container.attr('id') || 's2id_sp_formfield_{{::field.name}}').replace(/{{::field.name}}/, field.name));
        }
      });

      function getAriaLabel() {
        var label = "";
        label += field.label;
        if (field.displayValue || field.value) {
          label += (" " + (field.displayValue || field.value));
        }
        return label;
      }

      function getTitle() {
        return field.label + " " + field.hint;
      }
      var select2Choice = element.parent().find(".select2-choice");
      select2Choice.attr("aria-hidden", true);
      select2Choice.addClass('form-control');
      element.parent().find(".select2-offscreen").text(getTitle());
      element.parent().find(".select2-focusser").on("keydown", function(e) {
        if (e.which === 40 || e.which === 38)
          e.stopImmediatePropagation();
      });
      var el = element.parent().find(".select2-focusser")[0];
      if (el) {
        var currentBindings = $._data(el, 'events')["keydown"];
        if ($.isArray(currentBindings))
          currentBindings.unshift(currentBindings.pop());
      }
    }
  };
});;