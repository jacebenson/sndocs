/*! RESOURCE: /scripts/js_includes_sp_core.js */
/*! RESOURCE: /scripts/app.$sp/app.$sp.js */
angular.module("sn.$sp", [
  'oc.lazyLoad',
  'sn.common',
  'ngAria',
  'ngResource',
  'ngCookies',
  'ngAnimate',
  'sn.base',
  'ui.bootstrap',
  'sn.common.attachments',
  'sn.common.util',
  'sn.common.presence',
  'snm.auth.data',
  'snm.cabrillo',
  'snm.serviceCatalog.form',
  'snm.serviceCatalog.data',
  'sn.common.form',
  'sn.common.controls',
  'ui.tinymce',
  'ngSanitize',
  'as.sortable',
  'sp.dependencies',
  '720kb.tooltips'
]);
angular.module('snm.auth.data').provider('glideSystemProperties', function glideSystemPropertiesProvider() {
  'use strict';
  var systemPropertyCache = {};
  this.$get = function glideSystemProperties($window) {
    return {
      set: function(key, value) {
        systemPropertyCache[key] = value;
      },
      get: function(key) {
        return systemPropertyCache[key];
      }
    };
  };
});;
/*! RESOURCE: /scripts/app.$sp/constant.spConf.js */
(function() {
  var config = {
    page: 'sp.do',
    angularProcessor: 'angular.do',
    sysParamType: '$sp',
    widgetApi: '/api/now/sp/widget/',
    instanceApi: '/api/now/sp/rectangle/',
    pageApi: '/api/now/sp/page',
    logoutUrl: '/logout.do?sysparm_goto_url=/{url_suffix}',
    s: 83,
    e: {
      notification: '$$uiNotification'
    },
    SYS_DATE_FORMAT: 'yyyy-MM-dd',
    SYS_TIME_FORMAT: 'HH:mm:ss'
  };
  angular.module('sn.$sp').constant('spConf', config);
}());;
/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular.module('sn.$sp').directive('spFormField', function($location, glideFormFieldFactory, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_form_field.xml',
    replace: true,
    controllerAs: 'c',
    scope: {
      field: '=',
      formModel: '=',
      getGlideForm: '&glideForm'
    },
    controller: function($element, $scope) {
      var c = this;
      var field = $scope.field;
      if (!field)
        throw "spFormField used without providing a field.";
      extendField($scope.field);

      function extendField(field) {
        var glideField = glideFormFieldFactory.create(field);
        field.isReadonly = glideField.isReadonly;
        field.isMandatory = function() {
          return !glideField.isReadonly() && glideField.isMandatory();
        };
        field.mandatory_filled = function() {
          return glideFormFieldFactory.hasValue(field, field.stagedValue);
        }
        field.stagedValue = field.value;
        $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
          if (fieldName == field.name)
            field.stagedValue = newValue;
        });
      }
      $scope.stagedValueChange = function() {
        $scope.$emit('sp.spFormField.stagedValueChange', null);
      };
      $scope.fieldValue = function(newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          $scope.getGlideForm().setValue(field.name, newValue, displayValue);
        }
        return field.value;
      };
      $scope.getEncodedRecordValues = function() {
        var result = {};
        angular.forEach($scope.formModel._fields, function(f) {
          if (f.type != 'user_image')
            result[f.name] = f.value;
          else if (f.value)
            result[f.name] = 'data:image/jpeg;base64,A==';
        });
        return result;
      };
      $scope.onImageUpload = function(thumbnail) {
        $scope.getGlideForm().setValue(field.name, thumbnail, thumbnail);
      };
      $scope.onImageDelete = function() {
        $scope.getGlideForm().setValue(field.name, '');
      };
      $scope.hasValueOrFocus = function() {
        var val = $scope.hasFocus || glideFormFieldFactory.hasValue(field);
        if (field.type == "user_image")
          val = true;
        return val;
      };
      c.showLabel = function showLabel(field) {
        return field.type != "boolean" && field.type != "boolean_confirm";
      };
    },
    link: function(scope, element, attr) {
      $timeout(function() {
        var inputField;
        switch (scope.field.type) {
          case "field_list":
          case "glide_list":
          case "reference":
          case "field_name":
          case "table_name":
            return;
            break;
          default:
            inputField = element.find("[name='" + scope.field.name + "']");
            break;
        }
        var focusHandler = function() {
          scope.hasFocus = true;
          scope.$emit("sp.spFormField.focus", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        var blurHandler = function() {
          scope.fieldValue(scope.field.stagedValue);
          scope.hasFocus = false;
          scope.$emit("sp.spFormField.blur", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        inputField.on('focus', focusHandler).on('blur', blurHandler);
        scope.$on('$destroy', function() {
          inputField.off('focus', focusHandler).off('blur', blurHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, inputField);
      });
      scope.$on('select2.ready', function(e, $el) {
        e.stopPropagation();
        var focusHandler = function(e) {
          $el.select2('open');
        };
        $el.on('focus', focusHandler);
        scope.$on('$destroy', function() {
          $el.off('focus', focusHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, $el);
      });
      scope.getReferenceLabelContents = function() {
        var label = "";
        if (scope.field.isMandatory() && !scope.field.mandatory_filled()) {
          label = label + "Mandatory - ";
        }
        label = label + scope.field.label;
        if (scope.field.displayValue) {
          label = label + ", " + scope.field.displayValue
        }
        return label;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function($rootScope, $http, $location, snRecordWatcher, $q, spPreference, spConf, $window) {
  "use strict";
  var spUtil = {
    format: function(tpl, data) {
      var re = /{([^}]+)?}/g,
        match;
      while (match = new RegExp(re).exec(tpl)) {
        tpl = tpl.replace(match[0], data[match[1]]);
      }
      return tpl;
    },
    update: function($scope) {
      var s = $scope;
      return this.get(s, s.data).then(function(response) {
        if (!response)
          return {};
        angular.extend(s.data, response.data);
        return response.data;
      })
    },
    refresh: function($scope) {
      var s = $scope;
      return this.get(s, null).then(function(response) {
        angular.extend(s.options, response.options);
        angular.extend(s.data, response.data);
        return response;
      })
    },
    get: function($scope, data) {
      var qs = $location.search();
      return $http({
        method: 'POST',
        url: this.getWidgetURL($scope),
        params: qs,
        headers: this.getHeaders(),
        data: data
      }).then(function(response) {
        var r = response.data.result;
        if (r && r._server_time) {
          var w = $scope.widget;
          if (w)
            w._server_time = r._server_time;
        }
        if (r && r.$$uiNotification) {
          if ($scope.$emit)
            $scope.$emit("$$uiNotification", r.$$uiNotification);
          else
            $rootScope.$broadcast("$$uiNotification", r.$$uiNotification);
        }
        return r;
      });
    },
    getHeaders: function() {
      return {
        'Accept': 'application/json',
        'x-portal': $rootScope.portal_id
      };
    },
    getWidgetURL: function(arg) {
      if (typeof arg == 'string')
        return "/api/now/sp/widget/" + arg;
      else if (arg.widget && arg.widget.rectangle_id)
        return "/api/now/sp/rectangle/" + arg.widget.rectangle_id;
      else
        return "/api/now/sp/widget/" + arg.widget.sys_id;
    },
    setBreadCrumb: function($scope, list) {
      $scope.$emit('sp.update.breadcrumbs', list);
    },
    setSearchPage: function(searchPage) {
      $rootScope.$emit("update.searchpage", searchPage);
    },
    addTrivialMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "trivial",
        message: message
      });
    },
    addInfoMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "info",
        message: message
      });
    },
    addErrorMessage: function(message) {
      $rootScope.$broadcast("$$uiNotification", {
        type: "error",
        message: message
      });
    },
    getURL: function(type) {
      var n;
      if (type !== null && typeof type === 'object') {
        n = $.param(type);
      } else {
        n = $.param({
          sysparm_type: spConf.sysParamType,
          sysparm_ck: $window.g_ck,
          type: type
        });
      }
      return spConf.angularProcessor + '?' + n;
    },
    getHost: function() {
      var host = $location.protocol() + '://' + $location.host();
      if ($location.port()) {
        host += ':' + $location.port();
      }
      return host;
    },
    scrollTo: function(id, time) {
      $rootScope.$broadcast('$sp.scroll', {
        selector: id,
        time: time || 1000,
        offset: 'header'
      });
    },
    getAccelerator: function(char) {
      if (!$window.ontouchstart) {
        if ($window.navigator.userAgent.indexOf("Mac OS X") > -1) {
          return '⌘ + ' + char;
        } else {
          return 'Ctrl + ' + char;
        }
      }
      return '';
    },
    recordWatch: function($scope, table, filter, callback) {
      var watcherChannel = snRecordWatcher.initChannel(table, filter || 'sys_id!=-1');
      var subscribe = callback || function() {
        $scope.server.update()
      };
      watcherChannel.subscribe(subscribe);
      $scope.$on('$destroy', function() {
        watcherChannel.unsubscribe();
      });
    },
    createUid: function(str) {
      return str.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    },
    setPreference: function(pref, value) {
      spPreference.set(pref, value);
    },
    getPreference: function(pref, callback) {
      spPreference.get(pref, callback);
    },
    parseAttributes: function(strAttributes) {
      if (typeof strAttributes === 'object')
        return strAttributes;
      var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
      var attributeObj = {};
      for (var i = 0; i < attributeArray.length; i++) {
        if (attributeArray[i].length > 0) {
          var attribute = attributeArray[i].split('=');
          attributeObj[attribute[0].trim()] = attribute.length > 1 ? attribute[1].trim() : '';
        }
      }
      return attributeObj;
    }
  };
  return spUtil;
});
/*! RESOURCE: /scripts/app.$sp/directive.spCatItem.js */
angular.module("sn.$sp").directive('spCatItem', function($http, spUtil, $rootScope) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.item = scope.$eval(attrs.item);
    },
    controller: function($scope) {
      var c = this;
      c.priceHasChanged = function(p, parms) {
        var changed = false;
        var t = parms.recurring_price + p.recurring_price;
        if (t != p.recurring_total) {
          changed = true;
          p.recurring_total = t;
        }
        t = parms.price + p.price;
        if (t != p.price_total) {
          changed = true;
          p.price_total = parms.price + p.price;
        }
        return changed;
      };
      c.formatPrice = function(response) {
        var p = $scope.item._pricing;
        var t = $scope.data.sc_cat_item;
        t = $scope.item;
        t.price = t.recurring_price = "";
        if (p.price_total) {
          t.price = response.price;
        }
        if (p.recurring_total) {
          t.recurring_price = response.recurring_price + " " + p.rfd;
        }
      };
      $scope.$on('variable.price.change', function(evt, parms) {
        var p = $scope.item._pricing;
        if (c.priceHasChanged(p, parms)) {
          var o = {
            price: p.price_total,
            recurring_price: p.recurring_total
          };
          $rootScope.$broadcast("guide.item.price.change", o);
          $http.post(spUtil.getURL('format_prices'), o).success(c.formatPrice)
        }
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spChoiceList.js */
angular.module('sn.$sp').directive('spChoiceList', function($timeout, spUtil, $http) {
  return {
    template: '<select name="{{::field.name}}" id="sp_formfield_{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" sn-select-width="auto" ng-disabled="field.isReadonly()" ng-options="c.value as c.label for c in field.choices track by getVal(c.value)"></select>',
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      'field': '=',
      'options': '=?',
      'getGlideForm': '&glideForm'
    },
    link: function(scope, element, attrs, ngModel) {
      scope.getVal = function(v) {
        return v;
      };
      var g_form = scope.getGlideForm();
      var field = scope.field;
      var fieldOptions;
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
        if (!hasSelectedValue && field.choices.length > 0)
          g_form.setValue(field.name, field.choices[0].value, field.choices[0].label);
        element.select2('val', ngModel.$viewValue);
        if (isOpen)
          element.select2("close").select2("open");
      }

      function refreshReferenceChoices() {
        var params = {};
        params['qualifier'] = field.reference_qual;
        params['table'] = field.lookup_table;
        params['sysparm_include_variables'] = true;
        params['variable_ids'] = field.sys_id;
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
        params.sysparm_type = 'sp_ref_list_data';
        var url = spUtil.getURL({
          sysparm_type: 'sp_ref_list_data'
        });
        return $http.post(url, params).then(function(response) {
          if (!response.data)
            return;
          field.choices = [];
          angular.forEach(response.data.items, function(item) {
            item.label = item.$$displayValue;
            item.value = item.sys_id;
            field.choices.push(item);
          });
          selectValueOrNone();
        });
      }
      var pcTimeout;
      g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
        if (fieldName != field.name)
          return;
        if (propertyName == "optionStack") {
          $timeout.cancel(pcTimeout);
          pcTimeout = $timeout(function() {
            field.choices = applyOptionStack(fieldOptions, field.optionStack);
            selectValueOrNone();
          }, 35);
        }
      });
      setDefaultOptions();
      if (field.choices) {
        setChoiceOptions(field.choices);
      }
      selectValueOrNone();

      function setDefaultOptions() {
        setChoiceOptions([{
          value: scope.field.value,
          label: scope.field.displayValue || scope.field.placeholder
        }]);
      }

      function setChoiceOptions(options) {
        if (options) {
          options.forEach(function(option) {
            option.value = String(option.value);
          });
        }
        fieldOptions = options;
        scope.options = applyOptionStack(options, scope.field.optionStack);
      }

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
        element.bind("select2-open", function() {
          isOpen = true;
        });
        element.bind("select2-close", function() {
          isOpen = false;
        });
        ngModel.$render = function() {
          if (ngModel.$viewValue === "" || ngModel.$viewValue === null)
            selectValueOrNone();
          element.select2('val', ngModel.$viewValue);
        };
      }
      $timeout(function() {
        element.parent().find(".select2-focusser").removeAttr("aria-labelledby");
        element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
      });

      function getAriaLabel() {
        var label = "";
        if (field.isMandatory()) {
          label = "Mandatory - "
        }
        label += field.label;
        if (field.displayValue || field.value) {
          label += (" " + (field.displayValue || field.value));
        }
        return label;
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spCLink.js */
angular.module('sn.$sp').directive('spCLink', function(i18n) {
  return {
    restrict: 'E',
    scope: {
      rectangle: '=',
      target: '@',
      table: '=',
      id: '=',
      query: '='
    },
    replace: true,
    template: '<span class="sp-convenience-link-wrapper" ng-if="display()"><a href="{{href}}" target="_blank" class="sp-convenience-link">{{getText()}}</a></span>',
    link: function(scope, element, attrs, controller) {
      scope.display = function() {
        return scope.href && window.NOW.sp_debug;
      }
      var href = '';
      if (scope.target) {
        var target = scope.target;
        if (target == 'form')
          href = scope.table + '.do?sys_id=' + scope.id;
        if (target == 'kb_article')
          href = 'kb_view.do?sysparm_article=' + scope.id;
        if (target == 'sc_cat_item')
          href = 'com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=' + scope.id + '&sysparm_catalog_view=catalog_default';
        if (target == 'list') {
          scope.$watch(function() {
            return scope.table + " | " + scope.query;
          }, function(newValue, oldValue) {
            if (newValue != oldValue)
              scope.href = scope.table + '_list.do?sysparm_query=' + scope.query;
          })
          href = scope.table + '_list.do?sysparm_query=' + scope.query;
        }
      }
      scope.href = href;
      scope.getText = function() {
        return i18n.getMessage('Open');
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(spConf, $rootScope, $document, spAriaUtil, i18n) {
  var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
  if (typeof moment.tz !== "undefined")
    moment.tz.setDefault(g_tz);
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;
  if ($rootScope.user && $rootScope.user.date_time_format)
    dateTimeFormat = $rootScope.user.date_time_format;

  function isValidDate(value, format) {
    if (value === '')
      return true;
    return moment(value, format).isValid();
  }
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': isInvalid}" style="width: 100%;">' +
      '<input id="sp_formfield_{{::field.name}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{translations[\'Enter date in format\']}} {{format}}" uib-tooltip-html="getDateFormatTooltip()" tooltip-trigger="focus" tooltip-placement="top" tooltip-enable="{{showDateFormatTooltip}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button" tabindex="-1" aria-hidden="true">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '<span ng-if="isInvalid" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Enter date in format\']}} {{format}}</span>' +
      '</div>',
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      field: '=',
      snDisabled: '=',
      snIncludeTime: '=',
      snChange: '&'
    },
    link: function(scope, element, attrs, ngModel) {
      scope.g_accessibility = spAriaUtil.isAccessibilityEnabled();
      scope.showDateFormatTooltip = scope.g_accessibility;
      var includeTime = scope.snIncludeTime;
      var format;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      scope.format = format;
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: "X"
      }).on('dp.change', onDpChange);

      function closeOnTouch(evt) {
        if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
          dp.data('DateTimePicker').hide();
        }
      }

      function bindTouchClose() {
        $document.on('touchstart', closeOnTouch);
      }

      function unBindTouchClose() {
        $document.off('touchstart', closeOnTouch);
      }
      dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);

      function onDpChange(e) {
        scope.formattedDate(e.date.format(format));
        if (!scope.$root.$$phase)
          scope.$apply();
      }
      scope.getDateFormatTooltip = function() {
        if (scope.snDisabled || scope.isInvalid)
          return "";
        return scope.translations['Use format'] + ' ' + scope.format;
      };

      function validate(formattedDate) {
        scope.isInvalid = false;
        if (formattedDate == null || formattedDate == '') {
          dp.data('DateTimePicker').setValue(new Date());
          return '';
        }
        if (isValidDate(formattedDate, format)) {
          dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        } else if (isValidDate(formattedDate, moment.ISO_8601)) {
          var date = moment.utc(formattedDate).clone().local();
          dp.data('DateTimePicker').setDate(date);
          formattedDate = date.format(format);
        } else {
          spAriaUtil.sendLiveMessage(scope.translations["Entered date not valid. Enter date in format"] + " " + format);
          scope.isInvalid = true;
        }
        return formattedDate;
      }
      if (ngModel) {
        ngModel.$parsers.push(validate);
        ngModel.$render = function() {
          validate(ngModel.$viewValue);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            ngModel.$setViewValue(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return ngModel.$viewValue;
        };
      } else {
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            scope.field.value = validate(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return scope.field.value;
        };
        scope.$watch('field.value', function(newValue, oldValue) {
          if (newValue != oldValue)
            validate(newValue);
        });
      }
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
        unBindTouchClose();
      });
      scope.translations = [];
      i18n.getMessages(["Enter date in format", "Use format", "Entered date not valid. Enter date in format"], function(msgs) {
        scope.translations = msgs;
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spDropdownTree.js */
angular.module('sn.$sp').directive('spDropdownTree', function() {
  return {
    restrict: 'E',
    scope: {
      items: '='
    },
    replace: true,
    template: '<ul class="dropdown-menu">' +
      '<li ng-repeat="mi in items" style="min-width: 20em;" ng-class="{\'dropdown-submenu\': mi.type == \'menu\', \'dropdown-menu-line\':$index < items.length - 1}" ng-include="getURL()">' +
      '</ul>',
    link: function(scope, element, attrs, controller) {
      scope.getURL = function() {
        return 'spDropdownTreeTemplate';
      }
    }
  }
});
(function($) {
  $("body").on("click", "a.menu_trigger", function(e) {
    var current = $(this).next();
    var grandparent = $(this).parent().parent();
    if ($(this).hasClass('left-caret') || $(this).hasClass('right-caret'))
      $(this).toggleClass('right-caret left-caret');
    grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
    current.toggle();
    $(".dropdown-menu").each(function(i, elem) {
      var elemClosest = $(elem).closest('.dropdown');
      var currentClosest = current.closest('.dropdown');
      if (!elem.contains(current[0]) && elem != current[0] && (!currentClosest.length || !elemClosest.length || elemClosest[0] == currentClosest[0]))
        $(elem).hide();
    })
    e.stopPropagation();
  });
  $("body").on("click", "a:not(.menu_trigger)", function() {
    var root = $(this).closest('.dropdown');
    root.find('.left-caret').toggleClass('right-caret left-caret');
  });
})(jQuery);;
/*! RESOURCE: /scripts/app.$sp/factory.spMacro.js */
angular.module('sn.$sp').factory("spMacro", function($log) {
  "use strict";
  return function($scope, dataPrototype, inputMap, keepFields) {
    var gf = $scope.page.g_form;
    if (!gf) {
      $log.warn('GlideForm not set for widget: ' + $scope.widget.name);
      return;
    }
    var map = createMap();

    function createMap() {
      var names = gf.getFieldNames();
      var fields = [];
      names.forEach(function(name) {
        fields.push(gf.getField(name));
      })
      var map = {};
      angular.forEach(inputMap, function(value, key) {
        fields.forEach(function(field) {
          if (field.variable_name == value) {
            map[key] = field.name;
            if (!keepFields)
              gf.setDisplay(field.name, false);
          }
        })
      })
      angular.forEach(dataPrototype, function(value, key) {
        if (map[key])
          return;
        fields.forEach(function(field) {
          if (field.variable_name == key) {
            map[key] = field.name;
            if (!keepFields)
              gf.setDisplay(field.name, false);
          }
        })
      })
      return map;
    }
    return {
      getMap: function() {
        return map;
      },
      onChange: function(newV, oldV) {
        if (!angular.isDefined(newV))
          return;
        angular.forEach(newV, function(value, key) {
          if (newV[key] == oldV[key])
            return;
          var n = map[key];
          gf.setValue(n, newV[key]);
        })
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/factory.spUIActionFactory.js */
angular.module('sn.$sp').factory('spUIActionFactory', function($http, $rootScope) {
  'use strict';
  return {
    create: function(uiActions, options) {
      return new GlideUIActions(uiActions, options);
    },
    executeUIAction: executeDesktopUIAction
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
        options.uiActionNotifier,
        options.attachmentGUID
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
      if (!foundAction)
        foundAction = this.getAction(name);
      return foundAction;
    };
  }

  function GlideUIAction(name, sysId, displayName, uiActionNotifier, attachmentGUID) {
    var _inProgress = false;
    var _name = name;
    var _displayName = displayName;
    var _sysId = sysId;
    var _notifier = uiActionNotifier;
    this.getSysId = function() {
      return _sysId;
    };
    this.getName = function() {
      return _name;
    };
    this.getDisplayName = function() {
      return _displayName;
    };
    this.execute = function(g_form) {
      _inProgress = true;
      var formData = {};
      var fieldNames = g_form.getFieldNames();
      fieldNames.forEach(function(name) {
        formData[name] = g_form.getField(name);
      });
      if (attachmentGUID)
        formData._attachmentGUID = attachmentGUID;
      var $execute = executeDesktopUIAction(
        this.getSysId(),
        g_form.getTableName(),
        g_form.getSysId(),
        formData
      ).finally(function() {
        _inProgress = false;
      });
      _notifier(this.getName(), $execute);
      return $execute;
    };
  }

  function executeDesktopUIAction(actionSysId, tableName, recordSysId, formData) {
    var req = {
      method: "POST",
      url: "/api/now/sp/uiaction/" + actionSysId,
      headers: {
        'Accept': 'application/json',
        'x-portal': $rootScope.portal_id
      },
      data: {
        table: tableName,
        recordID: recordSysId,
        data: formData
      }
    };
    return $http(req).then(qs, qe);

    function qs(response) {
      var r = response.data.result;
      if (r && r.$$uiNotification)
        $rootScope.$broadcast("$$uiNotification", r.$$uiNotification);
      return r;
    }

    function qe(error) {
      console.log("Error " + error.status + " " + error.statusText);
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spGlyphPicker.js */
angular.module('sn.$sp').directive('spGlyphPicker', function($rootScope) {
  return {
    template: '<span class="glyph-picker-container">' +
      '<button ng-show="!disabled()" class="btn btn-default" data-iconset="fontawesome" data-icon="fa-{{field.value}}" role="iconpicker" />' +
      '<div ng-show="disabled()" class="fa fa-{{field.value}} glyph-picker-disabled"/>' +
      '</span>',
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      snOnChange: '&',
      snOnBlur: '&',
      snDisabled: '&'
    },
    link: function(scope, element, attrs, controller) {
      scope.disabled = function() {
        if (typeof scope.snDisabled() == "undefined")
          return false;
        return scope.snDisabled();
      }
      var button = element.find('button');
      button.on('click', function(e) {
        var describedByAttr = this.attributes['aria-describedby'];
        if (describedByAttr && describedByAttr.value.startsWith("popover")) {
          e.stopImmediatePropagation();
        }
      });
      button.iconpicker({
        cols: 6,
        rows: 6,
        placement: 'right',
        iconset: 'fontawesome'
      });
      scope.transferIcon = function() {
        button.iconpicker('setIcon', 'fa-' + scope.field.value);
      }
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue)
          scope.transferIcon();
      })
      scope.transferIcon();
      button.on('change', function(e) {
        scope.field.value = e.icon.replace(/^fa-/, '');
        if (!$rootScope.$$phase)
          $rootScope.$digest();
        scope.snOnChange();
      })
      button.on('change', function(e) {
        scope.snOnBlur();
      })
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spColorPicker.js */
angular.module('sn.$sp').directive('spColorPicker', function($timeout) {
  return {
    template: '<div class="input-group">' +
      '<input id="sp_formfield_{{::field.name}}" class="form-control" name="{{field.name}}" value="{{field.value}}" placeholder="{{field.placeholder}}" autocomplete="off" ng-readonly="snDisabled" />' +
      '<input type="text" class="btn input-group-btn" name="color_picker_{{field.name}}" ng-disabled="snDisabled" />' +
      '</div>',
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      getGlideForm: '&glideForm',
      snChange: "&",
      snDisabled: "="
    },
    link: function(scope, element, attrs, controller) {
      var field = scope.field;
      var initialColor;
      var g_form = scope.getGlideForm();

      function setValue(newVal) {
        if (!scope.snDisabled)
          scope.snChange({
            newValue: newVal
          });
      }
      $timeout(function() {
        init();
      });

      function init() {
        var $input = element.find('input[name="' + field.name + '"]');
        var $picker = element.find('input[name="color_picker_' + field.name + '"]');
        $picker.spectrum({
          color: field.value,
          showInitial: true,
          showButtons: false,
          showInput: true,
          showSelectionPalette: false,
          preferredFormat: "hex",
          showPalette: true,
          hideAfterPaletteSelect: true,
          replacerClassName: "input-group-btn",
          palette: [
            ["#000000", "#ffffff", "#343d47", "#485563", "#81878e", "#bdc0c4", "#e6e8ea"],
            ["#e7e9eb", "#6d79eb", "#8784db", "#b1afdb", "#278efc", "#83bfff", "#c0dcfa"],
            ["#289fdb", "#97e0fc", "#caeefc", "#71e279", "#6edb8f", "#9adbad", "#fcc742"],
            ["#ffe366", "#fff1b2", "#fc8a3d", "#ffc266", "#ffe0b2", "#f95050", "#ff7b65"],
            ["#ffbeb2", "#f95070", "#ff93a2", "#ffc1ca", "#cddc39", "#e6ee9c", "#f9fbe7"]
          ],
          show: function(color) {
            initialColor = color.toHexString();
          },
          hide: function(color) {
            var newVal = color.toHexString();
            if (initialColor != newVal) {
              setValue(newVal);
            }
          },
          move: function(color) {
            var newVal = color.toHexString();
            setValue(newVal);
          },
          change: function(color) {
            var newVal = color.toHexString();
            setValue(newVal);
          }
        });
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly")
            $picker.spectrum(g_form.isReadOnly(field.name) ? "disable" : "enable");
        });
        $input.on("focus", function() {
          var el = angular.element(this);
          initialColor = el.val();
        });
        $input.on("blur", function() {
          var el = angular.element(this);
          var newVal = el.val();
          if (initialColor != newVal) {
            $picker.spectrum("set", newVal);
            setValue(newVal);
          }
        });
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spReferenceField.js */
angular.module('sn.$sp').directive('spReferenceField', function($rootScope, spUtil, $uibModal, $http, spAriaUtil, i18n) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_reference_field.xml',
    controller: function($scope) {
      var unregister;
      $scope.openReference = function(field, view) {
        var data = {
          table: field.ed.reference,
          sys_id: field.value,
          view: view
        };
        if (angular.isDefined(field.reference_key))
          data[field.reference_key] = field.value;
        else
          data.sys_id = field.value;
        if (unregister)
          unregister();
        unregister = $rootScope.$on('$sp.openReference', function(evt, data) {
          unregister();
          unregister = null;
          if (!evt.defaultPrevented && evt.targetScope === $scope)
            showForm(data);
        });
        $scope.$emit('$sp.openReference', data);
      };
      $scope.$on("$destroy", function() {
        if (unregister)
          unregister();
      });

      function showForm(data) {
        var url = spUtil.getWidgetURL("widget-form");
        var req = {
          method: 'POST',
          url: url,
          headers: spUtil.getHeaders(),
          data: data
        }
        $http(req).then(qs, qe);

        function qs(response) {
          var r = response.data.result;
          showModal(r);
        }

        function qe(error) {
          console.error("Error " + error.status + " " + error.statusText);
        }
      }

      function showModal(form) {
        var opts = {
          size: 'lg',
          templateUrl: 'sp_form_modal',
          controller: ModalInstanceCtrl,
          resolve: {}
        };
        opts.resolve.item = function() {
          return angular.copy({
            form: form
          });
        };
        var modalInstance = $uibModal.open(opts);
        modalInstance.result.then(function() {}, function() {
          spAriaUtil.sendLiveMessage($scope.exitMsg);
        });
        $scope.$on("$destroy", function() {
          modalInstance.close();
        });
        var unregister = $scope.$on('sp.form.record.updated', function(evt, fields) {
          unregister();
          unregister = null;
          modalInstance.close();
          if (evt.stopPropagation)
            evt.stopPropagation();
          evt.preventDefault();
        });
      }

      function ModalInstanceCtrl($scope, $uibModalInstance, item) {
        $scope.item = item;
        $scope.ok = function() {
          $uibModalInstance.close();
        };
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      }
    },
    link: function(scope) {
      i18n.getMessage("Closing modal page", function(msg) {
        scope.exitMsg = msg;
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spCssEditor.js */
angular.module('sn.$sp').directive('spCssEditor', function() {
  return {
    template: '<textarea ng-model="v" name="{{::field.name}}" style="width: 100%; min-height: 2em;" rows="1" wrap="soft" data-length="{{::dataLength}}" data-charlimit="false">' +
      '</textarea>',
    restrict: 'E',
    replace: true,
    require: '^ngModel',
    scope: {
      field: '=',
      dataLength: '@',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      var g_form;
      var field = scope.field;
      if (typeof attrs.glideForm != "undefined") {
        g_form = scope.getGlideForm();
      }
      element[0].value = field.value;
      element[0].id = field.name + "_css_editor";
      var cmi = CodeMirror.fromTextArea(element[0], {
        mode: "text/x-less",
        lineWrapping: false,
        readOnly: scope.snDisabled === true,
        viewportMargin: Infinity,
        lineNumbers: true,
        tabSize: 2,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      });
      var extraKeys = {
        "Ctrl-M": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen"))
            cm.setOption("fullScreen", false);
        }
      }
      cmi.addKeyMap(extraKeys);
      cmi.on('change', function(cm) {
        if (typeof field.stagedValue != "undefined") {
          field.stagedValue = cm.getValue();
          ctrl.$setViewValue(field.stagedValue);
        } else {
          field.value = cm.getValue();
          ctrl.$setViewValue(field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      ctrl.$viewChangeListeners.push(function() {
        scope.$eval(attrs.ngChange);
      });
      if (g_form) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly") {
            var isReadOnly = g_form.isReadOnly(fieldName);
            cmi.setOption('readOnly', isReadOnly);
            var cmEl = cmi.getWrapperElement();
            jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
          }
          g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
            if (fieldName != field.name)
              return;
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(newValue);
          });
        });
      } else {
        scope.$watch(function() {
          return field.value;
        }, function(newValue, oldValue) {
          if (newValue != oldValue && !cmi.hasFocus())
            cmi.getDoc().setValue(field.value);
        });
        scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue)) {
            cmi.setOption('readOnly', newValue);
          }
        });
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spTinymceEditor.js */
angular.module('sn.$sp').directive('spTinymceEditor', function(getTemplateUrl, snAttachmentHandler, $timeout) {
  return {
    templateUrl: getTemplateUrl('sp_tinymce_editor.xml'),
    restrict: 'E',
    replace: true,
    scope: {
      model: "=ngModel",
      field: "=?",
      options: "=ngModelOptions",
      snBlur: '&',
      snDisabled: '=?',
      getGlideForm: '&glideForm'
    },
    controller: function($scope, $element, $attrs) {
      $scope.options = $scope.options || {};
      var thisEditor = {};
      var g_form;
      var field;
      if (typeof $attrs.glideForm != "undefined") {
        g_form = $scope.getGlideForm();
      }
      if (typeof $attrs.field != "undefined") {
        field = $scope.field;
      }
      var langs = 'cs,de,en,es,fi,fr,he,it,ja,ko,nl,pl,pt,ru,zh,zt';
      var userLanguage = g_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = g_system_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = 'en';
      $scope.tinyMCEOptions = {
        skin: 'lightgray',
        theme: 'modern',
        menubar: false,
        language: userLanguage,
        statusbar: false,
        plugins: "codesample code",
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | codesample code',
        setup: function(ed) {
          thisEditor = ed;
          ed.addCommand('imageUpload', function(ui, v) {
            $scope.clickAttachment();
          });
          ed.addButton('image', {
            icon: 'image',
            tooltip: 'Insert image',
            onclick: function(e) {
              ed.execCommand('imageUpload');
            },
            stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
          });
          ed.on('blur', function() {
            if (angular.isDefined($scope.snBlur))
              $scope.snBlur();
          });
          $scope.registerPasteHandler();
        }
      };
      $scope.attachFiles = function(data) {
        snAttachmentHandler.create("kb_social_qa_question", "-1").uploadAttachment(data.files[0], null, {}).then(function(response) {
          var args = tinymce.extend({}, {
            src: encodeURI("/" + response.sys_id + ".iix"),
            style: "max-width: 100%; max-height: 480px;"
          });
          thisEditor.execCommand('mceInsertContent', false, thisEditor.dom.createHTML('img', args), {
            skip_undo: 1
          });
        });
      };
      if (g_form && field) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly" && typeof thisEditor.setMode == "function") {
            if (thisEditor.getContainer()) {
              var isReadOnly = g_form.isReadOnly(fieldName);
              thisEditor.setMode(isReadOnly ? 'readonly' : 'design');
              thisEditor.getDoc().body.style.backgroundColor = isReadOnly ? "#eeeeee" : "#fff";
            } else {
              thisEditor.on('init', function() {
                var isReadOnly = g_form.isReadOnly(fieldName);
                thisEditor.setMode(isReadOnly ? 'readonly' : 'design');
                thisEditor.getDoc().body.style.backgroundColor = isReadOnly ? "#eeeeee" : "#fff";
              });
            }
          }
        });
      } else if (typeof $attrs.snDisabled != "undefined") {
        $scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue) && typeof thisEditor.setMode == "function") {
            if (thisEditor.getContainer())
              thisEditor.setMode(newValue ? 'readonly' : 'design');
            else {
              thisEditor.on('init', function() {
                thisEditor.setMode(newValue ? 'readonly' : 'design');
              });
            }
          }
        });
      }
    },
    link: function(scope, element, attrs) {
      scope.attrs = attrs;
      scope.clickAttachment = function() {
        element.find("input").click();
      };
      scope.registerPasteHandler = function() {
        $timeout(function() {
          element.find('iframe').contents().find('body').bind('paste', function(e) {
            e = e.originalEvent;
            var files = [];
            for (var i = 0; i < e.clipboardData.items.length; i++) {
              var item = e.clipboardData.items[i];
              if (item.kind && item.kind === "file") {
                var file = item.getAsFile();
                Object.defineProperty(file, "name", {
                  value: "Pasted File - " + new Date()
                });
                files.push(file);
              }
            }
            if (files.length > 0) {
              e.stopPropagation();
              e.preventDefault();
              scope.attachFiles({
                files: files
              });
            }
          });
        });
      };
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spHTMLEditor.js */
angular.module('sn.$sp').directive('spHtmlEditor', function() {
  return {
    template: '<textarea class="CodeMirror" name="{{::field.name}}" ng-model="v" style="width: 100%;" data-length="{{ ::dataLength }}" data-charlimit="false"></textarea>',
    restrict: 'E',
    require: '^ngModel',
    replace: true,
    scope: {
      field: '=',
      dataLength: '@',
      rows: '@',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      var g_form;
      var field = scope.field;
      if (typeof attrs.glideForm != "undefined") {
        g_form = scope.getGlideForm();
      }
      element[0].value = field.value;
      element[0].id = field.name + "_html_editor";
      var cmi = CodeMirror.fromTextArea(element[0], {
        mode: "htmlmixed",
        lineWrapping: false,
        readOnly: scope.snDisabled === true,
        viewportMargin: Infinity,
        lineNumbers: true,
        autoCloseTags: true,
        tabSize: 2,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      });
      var extraKeys = {
        "Ctrl-M": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen"))
            cm.setOption("fullScreen", false);
        }
      }
      cmi.addKeyMap(extraKeys);
      ctrl.$viewChangeListeners.push(function() {
        scope.$eval(attrs.ngChange);
      });
      cmi.on('change', function(cm) {
        if (typeof field.stagedValue != "undefined") {
          field.stagedValue = cm.getValue();
          ctrl.$setViewValue(field.stagedValue);
        } else {
          field.value = cm.getValue();
          ctrl.$setViewValue(field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      if (g_form) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly") {
            var isReadOnly = g_form.isReadOnly(fieldName);
            cmi.setOption('readOnly', isReadOnly);
            var cmEl = cmi.getWrapperElement();
            jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
          }
          g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
            if (fieldName != field.name)
              return;
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(newValue);
          });
        });
      } else {
        scope.$watch(function() {
          return field.value;
        }, function(newValue, oldValue) {
          if (newValue != oldValue && !cmi.hasFocus())
            cmi.getDoc().setValue(field.value);
        });
        scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue)) {
            cmi.setOption('readOnly', newValue);
          }
        });
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spHtmlContent.js */
angular.module('sn.$sp').directive('spHtmlContent', function($sce) {
  return {
    template: '<p ng-bind-html="trustAsHtml(model)"></p>',
    restrict: 'E',
    replace: true,
    scope: {
      model: '='
    },
    link: function(scope, element, attrs, controller) {
      scope.trustAsHtml = $sce.trustAsHtml;
      scope.$watch('model', function() {
        Prism.highlightAll();
      })
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spCodeMirror.js */
angular.module('sn.$sp').directive('spCodeMirror', function() {
  return {
    template: '<textarea class="CodeMirror" name="{{::field.name}}" ng-model="v" style="width: 100%;" data-length="{{ ::dataLength }}" data-charlimit="false">' +
      '</textarea>',
    restrict: 'E',
    replace: true,
    require: '^ngModel',
    scope: {
      field: '=',
      mode: '@',
      dataLength: '@',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      var g_form;
      var field = scope.field;
      if (typeof attrs.glideForm != "undefined") {
        g_form = scope.getGlideForm();
      }
      element[0].value = field.value;
      element[0].id = field.name + "_html_editor";
      var cmi = CodeMirror.fromTextArea(element[0], {
        mode: scope.mode,
        lineWrapping: false,
        readOnly: scope.snDisabled === true,
        viewportMargin: Infinity,
        tabSize: 2,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      });
      ctrl.$viewChangeListeners.push(function() {
        scope.$eval(attrs.ngChange);
      });
      cmi.on('change', function(cm) {
        if (typeof field.stagedValue != "undefined") {
          field.stagedValue = cm.getValue();
          ctrl.$setViewValue(field.stagedValue);
        } else {
          field.value = cm.getValue();
          ctrl.$setViewValue(field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      if (g_form) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly") {
            var isReadOnly = g_form.isReadOnly(fieldName);
            cmi.setOption('readOnly', isReadOnly);
            var cmEl = cmi.getWrapperElement();
            jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
          }
          g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
            if (fieldName != field.name)
              return;
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(newValue);
          });
        });
      } else {
        scope.$watch(function() {
          return field.value;
        }, function(newValue, oldValue) {
          if (newValue != oldValue && !cmi.hasFocus())
            cmi.getDoc().setValue(field.value);
        });
        scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue)) {
            cmi.setOption('readOnly', newValue);
          }
        });
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spScriptEditor.js */
angular.module('sn.$sp').directive('spScriptEditor', function($rootScope, $timeout, $http, spCodeEditorAutocomplete, defaultJSAutocomplete) {
  return {
    template: '<textarea class="CodeMirror" name="{{::field.name}}" ng-model="v" style="width: 100%;" data-length="{{::dataLength}}" data-charlimit="false">' +
      '</textarea>',
    restrict: 'E',
    require: '^ngModel',
    replace: true,
    scope: {
      field: '=',
      dataLength: '@',
      options: '@?',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      var g_form;
      var field = scope.field;
      if (typeof attrs.glideForm != "undefined") {
        g_form = scope.getGlideForm();
      }
      element[0].value = field.value;
      element[0].id = field.name + "_javascript_editor";
      var cmi = initializeCodeMirror(element[0]);
      var server;
      spCodeEditorAutocomplete.getConfig('sp_widget', field.name)
        .then(setupTernServer);
      ctrl.$viewChangeListeners.push(function() {
        scope.$eval(attrs.ngChange);
      });
      cmi.on('change', function(cm) {
        if (typeof field.stagedValue != "undefined") {
          field.stagedValue = cm.getValue();
          ctrl.$setViewValue(field.stagedValue);
        } else {
          field.value = cm.getValue();
          ctrl.$setViewValue(field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      if (g_form) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          if (propertyName == "readonly") {
            var isReadOnly = g_form.isReadOnly(fieldName);
            cmi.setOption('readOnly', isReadOnly);
            var cmEl = cmi.getWrapperElement();
            jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
          }
          g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
            if (fieldName != field.name)
              return;
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(newValue);
          });
        });
      } else {
        scope.$watch(function() {
          return field.value;
        }, function(newValue, oldValue) {
          if (newValue != oldValue && !cmi.hasFocus())
            cmi.getDoc().setValue(field.value);
        });
        scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue)) {
            cmi.setOption('readOnly', newValue);
          }
        });
      }
      cmi.on("keyup", function(cm, event) {
        var keyCode = ('which' in event) ? event.which : event.keyCode;
        var ternTooltip = document.getElementsByClassName('CodeMirror-Tern-tooltip')[0];
        if (keyCode == 190)
          if (event.shiftKey)
            return;
          else
            server.complete(cmi, server);
        if (keyCode == 57 && window.event.shiftKey && ternTooltip)
          angular.element(ternTooltip).show();
        if (keyCode == 27 && ternTooltip) {
          angular.element(ternTooltip).hide();
        }
      });
      cmi.on("startCompletion", function(cm) {
        var completion = cm.state.completionActive;
        completion.options.completeSingle = false;
        var pick = completion.pick;
        completion.pick = function(data, i) {
          var completion = data.list[i];
          CodeMirror.signal(cm, "codemirror_hint_pick", {
            data: completion,
            editor: cm
          });
          pick.apply(this, arguments);
        }
      });
      cmi.on("codemirror_hint_pick", function(i) {
        var data = i.data.data;
        var editor = i.editor;
        var cur = editor.getCursor();
        var token = data.type;
        if (token && token.indexOf('fn(') != -1) {
          if (editor.getTokenAt({
              ch: cur.ch + 1,
              line: cur.line
            }).string != '(') {
            editor.replaceRange('()', {
              line: cur.line,
              ch: cur.ch
            }, {
              line: cur.line,
              ch: cur.ch
            });
            if (token && token.substr(0, 4) !== 'fn()' && angular.element('div.CodeMirror-Tern-tooltip')[0]) {
              editor.execCommand('goCharLeft');
              setTimeout(function() {
                var ternTooltip = document.getElementsByClassName('CodeMirror-Tern-tooltip')[0];
                if (ternTooltip) {
                  angular.element(ternTooltip).show();
                }
              }, 100)
            }
          } else if (token && token.substr(0, 4) !== 'fn()')
            editor.execCommand('goCharRight');
        }
      });

      function initializeCodeMirror(elem) {
        var options = {
          mode: "javascript",
          lineNumbers: true,
          lineWrapping: false,
          readOnly: scope.snDisabled === true,
          viewportMargin: Infinity,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers", "CodeMirror-foldgutter"],
          lint: {
            asi: true
          },
          indentWithTabs: true,
          indentUnit: 2,
          tabSize: 2,
          matchBrackets: true,
          autoCloseBrackets: true,
          theme: "snc"
        };
        if (scope.options) {
          Object.keys(scope.options).forEach(function(key) {
            options[key] = scope.options[key];
          });
        }
        var cm = CodeMirror.fromTextArea(elem, options);
        return cm;
      }

      function setupTernServer(data) {
        var plugins = {};
        if (field.name === "client_script")
          plugins = {
            "angular": "./"
          };
        server = new CodeMirror.TernServer({
          defs: [data, defaultJSAutocomplete],
          plugins: plugins
        });
        cmi.setOption("extraKeys", {
          "Ctrl-Space": function(cm) {
            server.complete(cm);
          },
          "Ctrl-I": function(cm) {
            server.showType(cm);
          },
          "Ctrl-O": function(cm) {
            server.showDocs(cm);
          },
          "Alt-.": function(cm) {
            server.jumpToDef(cm);
          },
          "Alt-,": function(cm) {
            server.jumpBack(cm);
          },
          "Ctrl-Q": function(cm) {
            server.rename(cm);
          },
          "Ctrl-.": function(cm) {
            server.selectName(cm);
          }
        });
        var extraKeys = {
          "Ctrl-M": function(cm) {
            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
          },
          "Esc": function(cm) {
            if (cm.getOption("fullScreen"))
              cm.setOption("fullScreen", false);
          }
        }
        cmi.addKeyMap(extraKeys);
        cmi.on("cursorActivity", function(cm) {
          server.updateArgHints(cm);
        });
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spScroll.js */
angular.module('sn.$sp').directive('spScroll', function() {
  function scrollTo(el, options) {
    var offset = $(options.offset).height() || 0;
    $(el).animate({
      scrollTop: $(options.selector).offset().top - offset - 10
    }, options.time);
  }

  function link($scope, el) {
    $scope.$on('$sp.scroll', function(e, options) {
      if (options.selector) {
        return scrollTo(el, options);
      }
      $(el).scrollTop(options.position || 0);
    });
  };
  return {
    restrict: 'C',
    link: link
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spEditableField.js */
angular.module('sn.$sp').directive('spEditableField', function(glideFormFactory, $http, spUtil) {
  return {
    restrict: 'E',
    templateUrl: 'sp_editable_field.xml',
    scope: {
      fieldModel: "=",
      table: "@",
      tableId: "=",
      block: "=?",
      editableByUser: "=",
      onChange: "=?",
      onSubmit: "=?",
      asyncSubmitValidation: "=?"
    },
    transclude: true,
    replace: true,
    controller: function($scope) {
      var REST_API_PATH = "/api/now/v1/ui/table_edit/";
      var g_form;
      this.createShadowModel = function() {
        $scope.shadowModel = angular.copy($scope.fieldModel);
        $scope.shadowModel.table = $scope.table;
        $scope.shadowModel.sys_id = $scope.tableId;
        $scope.blockDisplay = $scope.block ? {
          display: 'block'
        } : {};
        $scope.editable = !$scope.shadowModel.readonly && $scope.editableByUser;
        $scope.fieldID = $scope.table + "-" + $scope.shadowModel.name.replace('.', '_dot_') + "-" + $scope.tableId;
        initGlideForm();
      };
      this.createShadowModel();
      $scope.getGlideForm = function() {
        return g_form;
      };
      $scope.saveForm = function() {
        if (g_form)
          g_form.submit();
        if (angular.isDefined($scope.asyncSubmitValidation)) {
          $scope.asyncSubmitValidation(g_form, $scope.shadowModel).then(function(result) {
            if (result)
              completeSave();
          });
        }
      };

      function completeSave() {
        var url = REST_API_PATH + $scope.table + "?sysparm_records=" + $scope.tableId + "&sysparm_view=default&sysparm_fields=" + $scope.shadowModel.name;
        var data = {};
        data[$scope.shadowModel.name] = $scope.shadowModel.value;
        $http.put(url, data).success(function(data) {
          if (data.result && Array.isArray(data.result.records))
            updateFieldModel(data.result.records);
          $scope.closePopover();
        });
      }

      function updateFieldModel(records) {
        for (var i = 0; i < records.length; i++) {
          var r = records[i];
          if (r.data && $scope.fieldModel.name in r.data) {
            var updated = r.data[$scope.fieldModel.name];
            $scope.fieldModel.value = updated.value;
            $scope.fieldModel.displayValue = updated.display_value;
          }
        }
      }

      function initGlideForm() {
        if (g_form)
          g_form.$private.events.cleanup();
        var uiMessageHandler = function(g_form, type, message) {
          switch (type) {
            case 'infoMessage':
              spUtil.addInfoMessage(message);
              break;
            case 'errorMessage':
              spUtil.addErrorMessage(message);
              break;
            case 'clearMessages':
              break;
            default:
              return false;
          }
        };
        g_form = glideFormFactory.create($scope, $scope.table, $scope.tableId, [$scope.shadowModel], null, {
          uiMessageHandler: uiMessageHandler
        });
        $scope.$emit("spEditableField.gForm.initialized", g_form, $scope.shadowModel);
        if (angular.isDefined($scope.onChange))
          g_form.$private.events.on("change", function(fieldName, oldValue, newValue) {
            return $scope.onChange.call($scope.onChange, g_form, $scope.shadowModel, oldValue, newValue);
          });
        if (angular.isDefined($scope.onSubmit))
          g_form.$private.events.on("submit", function() {
            return $scope.onSubmit.call($scope.onSubmit, g_form, $scope.shadowModel);
          });
        if (!angular.isDefined($scope.asyncSubmitValidation)) {
          g_form.$private.events.on('submitted', function() {
            completeSave();
          });
        }
      }
    },
    link: function(scope, el, attrs, ctrl) {
      scope.closePopover = function() {
        if (scope.shadowModel.popoverIsOpen)
          ctrl.createShadowModel();
        scope.shadowModel.popoverIsOpen = false;
      }
      $('body').on('click', function(event) {
        var $et = $(event.target);
        if (!($et.closest(".popover-" + scope.fieldID).length ||
            $et.closest(".popover-trigger-" + scope.fieldID).length)) {
          scope.$evalAsync('closePopover()');
        }
      })

      function executeEventHandlers(event) {
        trapKeyboardFocus(event);
        closePopoverOnEscape(event);
      }

      function trapKeyboardFocus(event) {
        if (!scope.shadowModel.popoverIsOpen)
          return;
        if (event.which === 9 && !event.shiftKey) {
          if (($(event.target).is("button[ng-click='closePopover();']"))) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
        if (event.which === 9 && event.shiftKey) {
          if (!isTargetedElementSPFormField(event))
            return;
          if ($('button[ng-click="openReference(field, formModel.view)"]').length === 1) {
            if ($(event.target).is("button")) {
              event.preventDefault();
              event.stopPropagation();
            }
          } else if ($("sp-email-element").length === 1) {
            if ($("sp-email-element").length === 1) {
              if ($(event.target).is("input")) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          } else {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }

      function isTargetedElementSPFormField(event) {
        return $(event.target).parents("#editableSaveForm").length === 1;
      }

      function closePopoverOnEscape(event) {
        if (event.which === 27)
          closePopover();
      }

      function closePopover() {
        scope.$evalAsync('closePopover()');
      }
      $('body').on('keydown', executeEventHandlers);
      scope.$on("$destroy", function() {
        $('body').off('keyup', closePopover);
      });
      scope.$on('sp.spFormField.rendered', function(e, element, input) {
        input.focus();
      })
    }
  }
});
angular.module('sn.$sp').directive('spEditableField2', function(glideFormFactory, $http, spUtil) {
  return {
    restrict: 'E',
    templateUrl: 'sp_editable_field2.xml',
    scope: {
      fieldModel: "=",
      table: "@",
      tableId: "=",
      block: "=?",
      editableByUser: "=",
      onChange: "=?",
      onSubmit: "=?",
      label: "@?"
    },
    transclude: true,
    replace: true,
    controller: function($scope) {
      var REST_API_PATH = "/api/now/v1/ui/table_edit/";
      var g_form;
      $scope.fieldModel = $scope.fieldModel || {};
      if (angular.isDefined($scope.label))
        $scope.fieldModel.label = $scope.label;
      $scope.editable = !$scope.fieldModel.readonly && $scope.editableByUser;
      $scope.fieldID = $scope.table + "-" + $scope.fieldModel.name + "-" + $scope.tableId;
      initGlideForm();
      $scope.getGlideForm = function() {
        return g_form;
      };
      $scope.$on('sp.spEditableField.save', function(e, fieldModel) {
        if (fieldModel == $scope.fieldModel)
          $scope.saveForm();
      });
      $scope.saveForm = function() {
        if (g_form)
          g_form.submit();
      };

      function completeSave() {
        var url = REST_API_PATH + $scope.table + "?sysparm_records=" + $scope.tableId + "&sysparm_view=default&sysparm_fields=" + $scope.fieldModel.name;
        var data = {};
        data[$scope.fieldModel.name] = $scope.fieldModel.value;
        $http.put(url, data)
          .success(function(data) {
            console.log("Field update successful", data);
          })
          .error(function(reason) {
            console.log("Field update failure", reason);
          });
      }

      function initGlideForm() {
        if (g_form)
          g_form.$private.events.cleanup();
        var uiMessageHandler = function(g_form, type, message) {
          switch (type) {
            case 'addInfoMessage':
              spUtil.addInfoMessage(message);
              break;
            case 'addErrorMessage':
              spUtil.addErrorMessage(message);
              break;
            case 'clearMessages':
              break;
            default:
          }
        };
        g_form = glideFormFactory.create($scope, $scope.table, $scope.tableId, [$scope.fieldModel], null, {
          uiMessageHandler: uiMessageHandler
        });
        $scope.$emit("spEditableField.gForm.initialized", g_form, $scope.fieldModel);
        if (angular.isDefined($scope.onChange)) {
          g_form.$private.events.on("change", function(fieldName, oldValue, newValue) {
            return $scope.onChange.call($scope.onChange, g_form, $scope.fieldModel, oldValue, newValue);
          });
        }
        if (angular.isDefined($scope.onSubmit))
          g_form.$private.events.on("submit", function() {
            return $scope.onSubmit.call($scope.onSubmit, g_form);
          });
        g_form.$private.events.on('submitted', function() {
          completeSave();
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spFieldListElement.js */
angular.module('sn.$sp').directive('snFieldListElement', function($http, $timeout, $sanitize, i18n, $filter, nowServer) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      snChange: '&',
      getGlideForm: '&glideForm',
      snDisabled: '='
    },
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
    controller: function($scope) {
      $scope.table = $scope.field.ed.dependent_value;
      $scope.$watch('field.dependentValue', function(newVal, oldVal) {
        if (!angular.isDefined(newVal))
          return;
        if (newVal != oldVal)
          console.log("Should have changed tables to " + newVal);
        $scope.table = $scope.field.dependentValue;
        var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
        $http.post(src).success(function(response) {
          $scope.field.choices = response;
        });
      });
    },
    link: function(scope, element) {
      var orderBy = $filter('orderBy');
      var isExecuting = false;
      var fieldCache = {};
      var data = [];
      var term = "";
      var initTimeout = null;
      var value = scope.field.value;
      var oldValue = scope.field.value;
      var $select;
      var previousScrollTop;
      var remove = i18n.getMessage("Remove");

      function getRemoveItem(label) {
        return jQuery("<span class='sr-only' tabindex='0' />").text(remove + " " + label);
      };
      var select2Helpers = {
        query: function(q) {
          term = q.term;
          if (data.length == 0) {
            getFieldsForTable(scope.table, function(tableName, fields) {
              data = fields;
              filterData(q);
            });
          } else
            filterData(q);
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            var items = [];
            var values = scope.field.value.split(',');
            var displayValues = scope.field.displayValue.split(',');
            for (var i = 0; i < values.length; i++)
              items.push({
                id: values[i],
                text: displayValues[i]
              });
            callback(items);
          } else
            callback([]);
        },
        formatResult: function(item) {
          var row = item.text;
          if (item.reference && !item.children)
            row += "<span style='float: right' class='expand fa fa-chevron-right' data-id='" + item.id + "' data-reference='" + item.reference + "'></span>";
          return row;
        },
        formatSelectionCssClass: function(item, el) {
          var parentEl = el.parent();
          parentEl.find("a").append(getRemoveItem(item.text));
        }
      };
      var config = {
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '    ',
        formatSearching: '',
        allowClear: true,
        query: select2Helpers.query,
        initSelection: select2Helpers.initSelection,
        formatResult: select2Helpers.formatResult,
        formatSelectionCssClass: select2Helpers.formatSelectionCssClass,
        closeOnSelect: false,
        multiple: true
      };

      function filterData(q) {
        var r = {
          results: []
        };
        for (var c in data) {
          var row = data[c];
          if (q.term.length == 0 || row.text.toUpperCase().indexOf(q.term.toUpperCase()) >= 0 || row.id.toUpperCase().indexOf(q.term.toUpperCase()) >= 0)
            r.results.push(row);
        }
        q.callback(r);
      }

      function init() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          $select = element.select2(config);
          $select.bind("select2-open", onDropdownShow);
          $select.bind("select2-close", onDropdownClose);
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          $select.bind("change", onChange);
          $select.bind("select2-loaded", onResultsLoaded);
          var sortable = new Sortable($select.select2("container").find("ul.select2-choices").get(0), {
            onStart: function() {
              $select.select2("onSortStart");
            },
            onEnd: function() {
              $select.select2("onSortEnd");
            }
          });
        });
      }

      function expandHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type == 'click') {
          var $el = angular.element(this);
          previousScrollTop = $el.parents('ul.select2-results').scrollTop();
          var d = $el.data();
          var targetRow = getDataRowByFieldName(d.id);
          getFieldsForTable(d.reference, function(tableName, refFields) {
            for (var i = 0; i < refFields.length; i++)
              refFields[i].id = d.id + '.' + refFields[i].id;
            targetRow.children = refFields;
            $select.select2("search", term);
          });
        }
      };

      function getDataRowByFieldName(fieldName) {
        var fieldNames = fieldName.split('.');
        var row = getDataRowByFieldNamePart(fieldNames[0], data);
        if (fieldNames.length > 1)
          for (var i = 1; i < fieldNames.length; i++)
            row = getDataRowByFieldNamePart(fieldNames[i], row.children);
        return row;
      }

      function getDataRowByFieldNamePart(fieldNamePart, fieldArr) {
        for (var i = 0; i < fieldArr.length; i++)
          if (fieldArr[i].fieldName == fieldNamePart) return fieldArr[i];
      }

      function getFieldsForTable(tableName, callback) {
        if (tableName in fieldCache) {
          var fields = getOrderedFieldsFromCache(tableName);
          callback.call(this, tableName, fields);
          return;
        }
        $http.get('/api/now/ui/meta/' + tableName).then(function(r) {
          var fields = [];
          if (r.data && r.data.result && r.data.result.columns) {
            fieldCache[tableName] = r.data.result.columns;
            fields = getOrderedFieldsFromCache(tableName);
          }
          callback.call(this, tableName, fields);
        });

        function getOrderedFieldsFromCache(tableName) {
          var col, cols = [],
            fields = fieldCache[tableName];
          for (var c in fields) {
            col = fields[c];
            cols.push({
              fieldName: col.name,
              id: col.name,
              text: col.label,
              reference: col.reference
            });
          }
          return orderBy(cols, 'text', false);
        }
      }

      function onResultsLoaded() {
        if (!previousScrollTop)
          return;
        $timeout(function() {
          angular.element('ul.select2-results').scrollTop(previousScrollTop);
          previousScrollTop = null;
        });
      }

      function onDropdownShow() {
        angular.element('ul.select2-results').on('mousedown click mouseup', 'span.expand', expandHandler);
      }

      function onDropdownClose() {
        angular.element('ul.select2-results').off('mousedown click mouseup', 'span.expand', expandHandler);
      }

      function onChange(e) {
        setValue(e.val, e);
      }

      function onSelecting(e) {
        var selectedItem = e.choice;
        if (selectedItem['id'] != '') {
          var values = scope.field.value == '' ? [] : scope.field.value.split(',');
          values.push(selectedItem['id']);
          setValue(values, e);
        }
      }

      function onRemoving(e) {
        var removed = e.choice;
        var values = scope.field.value.split(',');
        for (var i = values.length - 1; i >= 0; i--) {
          if (removed['id'] == values[i]) {
            values.splice(i, 1);
            break;
          }
        }
        setValue(values, e);
      }

      function setValue(values, e) {
        isExecuting = true;
        oldValue = scope.field.value;
        scope.field.value = scope.field.displayValue = values.join(',');
        e.preventDefault();
        $select.select2('val', scope.field.value.split(','));
        scope.$apply(function() {
          if (scope.snChange)
            scope.snChange({
              field: scope.field,
              newValue: scope.field.value,
              displayValue: scope.field.displayValue,
              oldValue: oldValue
            });
          isExecuting = false;
        });
      }
      scope.$watch("field.value", function(newValue) {
        if (isExecuting) return;
        if (angular.isDefined(newValue) && $select) {
          $select.select2('val', newValue.split(',')).select2('close');
        }
      });
      init();
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spReferenceElement.js */
angular.module('sn.$sp').directive('spReferenceElement', function($timeout, $http, spUtil, filterExpressionParser, $sanitize, i18n, spIs, spAriaUtil) {
  "use strict";
  var defaultPlaceholder = '    ';
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ed: "=?",
      field: "=",
      refTable: "=?",
      refId: "=?",
      snOptions: "=?",
      snOnBlur: "&",
      snOnClose: "&",
      minimumInputLength: "@",
      snDisabled: "=",
      dropdownCssClass: "@",
      formatResultCssClass: "&",
      displayColumn: "@",
      recordValues: '&',
      getGlideForm: '&glideForm',
      domain: "@",
      snSelectWidth: '@',
      labelId: '@?'
    },
    template: '<input type="text" id="sp_formfield_{{::field.name}}" name="{{::field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" />',
    link: function(scope, element, attrs, ctrl) {
      scope.ed = scope.ed || scope.field.ed;
      scope.selectWidth = scope.snSelectWidth || '100%';
      element.css("opacity", 0);
      var fireReadyEvent = true;
      var g_form;
      var displayColumns;
      var refAutoCompleter;
      var refOrderBy;
      var field = scope.field;
      var isMultiple = scope.snOptions && scope.snOptions.multiple === true;
      if (angular.isDefined(scope.getGlideForm))
        g_form = scope.getGlideForm();
      var fieldAttributes = {};
      if (field.attributes && typeof scope.ed.attributes == 'undefined')
        if (Array.isArray(field.attributes))
          fieldAttributes = field.attributes;
        else
          fieldAttributes = spUtil.parseAttributes(field.attributes);
      else
        fieldAttributes = spUtil.parseAttributes(scope.ed.attributes);
      if (angular.isDefined(fieldAttributes['ref_ac_columns']))
        displayColumns = fieldAttributes['ref_ac_columns'];
      if (angular.isDefined(fieldAttributes['ref_auto_completer']))
        refAutoCompleter = fieldAttributes['ref_auto_completer'];
      else
        refAutoCompleter = "AJAXReferenceCompleter";
      if (angular.isDefined(fieldAttributes['ref_ac_order_by']))
        refOrderBy = fieldAttributes['ref_ac_order_by'];

      function getPlaceholder() {
        var ph = defaultPlaceholder;
        if (field.placeholder) {
          ph = field.placeholder;
        }
        if (scope.snOptions && scope.snOptions.placeholder) {
          ph = scope.snOptions.placeholder;
        }
        return ph;
      }
      var remove = i18n.getMessage("Remove");

      function getRemoveItem(label) {
        return jQuery("<span class='sr-only' tabindex='0' />").text(remove + " " + label);
      };
      var s2Helpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatSelectionCssClass: function(item, el) {
          var parentEl = el.parent();
          parentEl.find("a").append(getRemoveItem(getDisplayValue(item)));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return $sanitize(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;display: inline-block;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          var url = spUtil.getURL({
            sysparm_type: 'sp_ref_list_data'
          });
          return $http.post(url, queryParams.data).then(function(response) {
            queryParams.success(response);
          });
        },
        initSelection: function(elem, callback) {
          if (field.displayValue) {
            if (isMultiple) {
              var items = [];
              var values = field.value.split(',');
              var displayValues = field.display_value_list;
              if (Array.isArray(field.displayValue)) {
                displayValues.length = 0;
                for (var i in field.displayValue)
                  displayValues[i] = field.displayValue[i];
                field.displayValue = displayValues.join(g_glide_list_separator);
              } else if (values.length == 1) {
                displayValues.length = 0;
                displayValues[0] = field.displayValue;
              } else if (field.displayValue != displayValues.join(g_glide_list_separator)) {
                displayValues.length = 0;
                var split = field.displayValue.split(',');
                for (var i in split)
                  displayValues[i] = split[i];
              }
              for (var i = 0; i < values.length; i++) {
                items.push({
                  sys_id: values[i],
                  name: displayValues[i]
                });
              }
              callback(items);
            } else {
              callback({
                sys_id: field.value,
                name: field.displayValue
              });
            }
          } else
            callback([]);
        },
        onSelecting: function(e) {
          var selectedItem = e.choice;
          if ('sys_id' in selectedItem) {
            var values = field.value == '' ? [] : field.value.split(',');
            var displayValues = field.display_value_list;
            values.push(selectedItem.sys_id);
            displayValues.push(getDisplayValue(selectedItem));
            g_form.setValue(field.name, values.join(','), displayValues.join(g_glide_list_separator));
            e.preventDefault();
            element.select2('val', values).select2('close');
          }
        },
        onRemoving: function(e) {
          var removed = e.choice;
          var values = field.value.split(',');
          var displayValues = field.display_value_list;
          for (var i = values.length - 1; i >= 0; i--) {
            if (removed.sys_id == values[i]) {
              values.splice(i, 1);
              displayValues.splice(i, 1);
              break;
            }
          }
          g_form.setValue(field.name, values.join(','), displayValues.join(g_glide_list_separator));
          e.preventDefault();
          element.select2('val', values);
        },
        select2Change: function(e) {
          e.stopImmediatePropagation();
          if (e.added) {
            var selectedItem = e.added;
            var value = selectedItem.sys_id;
            var displayValue = value ? getDisplayValue(selectedItem) : '';
            if (field['_cat_variable'] === true && ('price' in selectedItem || 'recurring_price' in selectedItem))
              setPrice(selectedItem.price, selectedItem.recurring_price);
            g_form.setValue(field.name, value, displayValue);
          } else if (e.removed) {
            if (field['_cat_variable'] === true)
              setPrice(0, 0);
            g_form.clearValue(field.name);
          }
          setAccessiblePlaceholder();
        }
      };
      var lookupMsg = jQuery("<span class='sr-only' />");
      lookupMsg.text(i18n.getMessage("Lookup using list"));

      function setAccessiblePlaceholder() {
        if (!field.value && getPlaceholder() === defaultPlaceholder) {
          element.parent().find('.select2-chosen').append(lookupMsg);
        }
      }
      var config = {
        width: scope.selectWidth,
        placeholder: getPlaceholder(),
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
        containerCssClass: 'select2-reference ng-form-element',
        formatSearching: '',
        allowClear: attrs.allowClear !== 'false',
        id: function(item) {
          return item.sys_id;
        },
        sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
            var q = '';
            var columnsToSearch = getReferenceColumnsToSearch();
            var queryArr = [];
            var query;
            columnsToSearch.forEach(function(colToSearch) {
              query = "";
              if (field.ed.queryString)
                query += field.ed.queryString + '^';
              query += colToSearch + filterExpression.operator + filterExpression.filterText +
                '^' + colToSearch + 'ISNOTEMPTY' + getExcludedValues();
              queryArr.push(query);
            });
            q += queryArr.join("^NQ");
            if (refOrderBy)
              q += "^ORDERBY" + refOrderBy;
            q += "^EQ";
            var params = {
              start: (scope.pageSize * (page - 1)),
              count: scope.pageSize,
              sysparm_target_table: scope.refTable,
              sysparm_target_sys_id: scope.refId,
              sysparm_target_field: scope.ed.name,
              table: scope.ed.reference,
              qualifier: scope.ed.qualifier,
              data_adapter: scope.ed.data_adapter,
              attributes: scope.ed.attributes,
              dependent_field: scope.ed.dependent_field,
              dependent_table: scope.ed.dependent_table,
              dependent_value: scope.ed.dependent_value,
              p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
            };
            if (displayColumns)
              params.required_fields = displayColumns.split(";").join(":");
            if (scope.domain) {
              params.sysparm_domain = scope.domain;
            }
            if (angular.isDefined(field) && field['_cat_variable'] === true) {
              delete params['sysparm_target_table'];
              params['sysparm_include_variables'] = true;
              params['variable_ids'] = field.sys_id;
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
          transport: s2Helpers.search
        },
        formatSelection: s2Helpers.formatSelection,
        formatSelectionCssClass: s2Helpers.formatSelectionCssClass,
        formatResult: s2Helpers.formatResult,
        initSelection: s2Helpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null,
        multiple: isMultiple
      };
      if (isMultiple && scope.ed.reference == "sys_user" && !scope.field._cat_variable) {
        config.createSearchChoice = function(term) {
          if (spIs.an.email(term)) {
            return {
              email: term,
              name: term,
              user_name: term,
              sys_id: term
            };
          }
        };
      }
      if (scope.snOptions && scope.snOptions.width) {
        config.width = scope.snOptions.width;
      }

      function getReferenceColumnsToSearch() {
        var colNames = ['name'];
        if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          colNames = fieldAttributes['ref_ac_columns'].split(';');
          if (scope.ed.searchField)
            colNames.push(scope.ed.searchField);
        } else if (scope.ed.searchField)
          colNames = [scope.ed.searchField];
        else if (fieldAttributes['ref_ac_order_by'])
          colNames = [fieldAttributes['ref_ac_order_by']];
        return colNames.filter(onlyUnique);
      }

      function getExcludedValues() {
        if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
          return '^sys_idNOT IN' + scope.ed.excludeValues;
        }
        return '';
      }

      function init() {
        $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          var select2 = element.select2(config);
          element.select2("val", field.value.split(','));
          if (isMultiple) {
            element.bind("select2-selecting", s2Helpers.onSelecting);
            element.bind("select2-removing", s2Helpers.onRemoving);
          } else {
            element.bind("change select2-removed", s2Helpers.select2Change);
          }
          element.bind("select2-blur", function() {
            $timeout(function() {
              scope.snOnBlur();
            });
          });
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
          setAccessiblePlaceholder();
          element.parent().find(".select2-focusser").removeAttr("aria-labelledby");
          element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
        });
      }

      function getAriaLabel() {
        var label = "";
        if (field.isMandatory()) {
          label = "Mandatory - "
        }
        label += field.label;
        if (field.displayValue) {
          label += (" " + field.displayValue);
        }
        return label;
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
          displayValues.push(getDisplayValue(selectedItem));
        }
        if (displayColumns && refAutoCompleter === "AJAXTableCompleter") {
          var columns = displayColumns.split(";");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayValues.push(selectedItem[column]);
          }
        }
        return displayValues.filter(onlyUnique);
      }

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      function setPrice(p, rp) {
        field.price = p;
        field.recurring_price = rp;
      }
      g_form.$private.events.on("change", function(fieldName, oldValue, value) {
        if (fieldName == field.name) {
          if (value == "" && field.display_value_list)
            field.display_value_list.length = 0;
          element.select2("val", typeof value == 'string' ? value.split(',') : value);
          element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $timeout(function() {
          element.select2("open");
        })
      });
      scope.$on("select2.ready", function() {
        if (scope.labelId && scope.field.type === 'reference' && spAriaUtil.g_accessibility == "true") {
          element.parent().find(".select2-focusser").attr("aria-labelledby", scope.labelId);
        }
      });
      init();
    },
    controller: function($scope, $rootScope) {
      $scope.pageSize = 20;
      this.filterResults = function(data, page) {
        return {
          results: data.data.items,
          more: (page * $scope.pageSize < data.data.total)
        };
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spCurrencyElement.js */
angular.module('sn.$sp').directive('spCurrencyElement', function() {
  return {
    templateUrl: 'sp_element_currency.xml',
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      snBlur: '&',
      snChange: '&',
      'getGlideForm': '&glideForm'
    },
    controller: function($scope) {
      var g_form = $scope.getGlideForm();
      var field = $scope.field;
      g_form.$private.events.on("change", function(fieldName, oldValue, newValue) {
        if (fieldName == field.name) {
          if (newValue.indexOf(";") > 0) {
            var v = newValue.split(";");
            field.currencyCode = v[0];
            field.currencyValue = v[1];
          } else
            field.currencyValue = newValue;
        }
      });
      $scope.formatValue = function(shouldSetValue) {
        var v = field.currencyValue;
        if (field.currencyValue != "")
          v = field.currencyCode + ";" + field.currencyValue;
        field.stagedValue = v;
        $scope.snChange();
        if (shouldSetValue)
          $scope.snBlur();
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spDurationElement.js */
angular.module('sn.$sp').directive('spDurationElement', function() {
  "use strict";
  if (typeof moment.tz !== "undefined")
    moment.tz.setDefault(g_tz);

  function getVisibleUnits(attributes) {
    var maxUnit = "days";
    var o = {
      days: ["days", "hours", "minutes", "seconds"],
      hours: ["hours", "minutes", "seconds"],
      minutes: ["minutes", "seconds"],
      seconds: ["seconds"]
    };
    if (attributes && attributes.max_unit && attributes.max_unit in o)
      maxUnit = attributes.max_unit;
    return o[maxUnit];
  }
  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    templateUrl: 'sp_element_duration.xml',
    link: function(scope, element, attrs, ngModelCtrl) {
      var theDawnOfTime;
      scope.field = scope.$eval(attrs.field);
      scope.visibleUnits = getVisibleUnits(scope.field.attributes);
      ngModelCtrl.$formatters.push(function() {
        if (!ngModelCtrl.$modelValue)
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          };
        theDawnOfTime = moment("1970-01-01 00:00:00");
        var dur = moment.duration(moment(ngModelCtrl.$modelValue).diff(theDawnOfTime));
        if (moment(ngModelCtrl.$modelValue).isDST())
          dur.add(1, "hours");
        var d = parseInt(dur.asDays(), 10);
        var h = dur.get('hours');
        var m = dur.get('minutes');
        var s = dur.get('seconds');
        if (scope.visibleUnits[0] == "hours") {
          h = h + (d * 24);
          d = 0;
        } else if (scope.visibleUnits[0] == "minutes") {
          m = m + (h * 60) + (d * 1440);
          d = h = 0;
        } else if (scope.visibleUnits[0] == "seconds") {
          s = s + (m * 60) + (h * 3600) + (d * 86400);
          d = h = m = 0;
        }
        return {
          days: d,
          hours: h,
          minutes: m,
          seconds: s
        };
      });
      ngModelCtrl.$render = function() {
        scope.parts = ngModelCtrl.$viewValue;
      };
      ngModelCtrl.$parsers.push(function(model) {
        theDawnOfTime = moment("1970-01-01 00:00:00");
        var modelValue = moment.duration(model);
        var newValue = theDawnOfTime.add(modelValue).format("YYYY-MM-DD HH:mm:ss");
        return newValue;
      });
      scope.updateDuration = function() {
        ngModelCtrl.$setViewValue(angular.copy(scope.parts));
      };
      scope.showLabel = function(unit) {
        if (unit == "days" || unit == "hours")
          return true;
        if (scope.visibleUnits[0] == "minutes")
          return unit == "minutes";
        return scope.visibleUnits[0] == "seconds";
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spEmailElement.js */
angular.module('sn.$sp').directive('spEmailElement', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: 'sp_element_email.xml'
  };
});;
/*! RESOURCE: /scripts/app.$sp/controller.spLogin.js */
angular.module("sn.$sp").controller("spLogin", function($scope, $http, $window, spUtil, $location, i18n) {
  $scope.login = function(username, password) {
    var url = spUtil.getURL({
      sysparm_type: 'view_form.login'
    });
    var pageId = $location.search().id || $scope.page.id;
    var isLoginPage = $scope.portal.login_page_dv == pageId;
    return $http({
      method: 'post',
      url: url,
      data: $.param({
        sysparm_type: 'login',
        'ni.nolog.user_password': true,
        remember_me: typeof remember_me != 'undefined' && !!remember_me ? true : false,
        user_name: username,
        user_password: password,
        get_redirect_url: true,
        sysparm_goto_url: isLoginPage ? null : $location.url()
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function(response) {
      if (!response.data) {
        $scope.message = i18n.getMessage("There was an error processing your request");
        return;
      }
      if (response.data.status == 'success') {
        $scope.success = response.data.message;
        $window.location = response.data.redirect_url;
      } else {
        $scope.message = response.data.message;
      }
    }, function errorCallback(response) {
      $scope.message = i18n.getMessage("There was an error processing your request");
    });
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spMessageDialog.js */
angular.module("sn.$sp").directive('spMessageDialog', function(nowServer, i18n, $timeout) {
  return {
    restrict: 'E',
    scope: {
      name: '@',
      title: '@',
      message: '@',
      question: '@',
      ok: '@',
      cancel: '@',
      dialogClass: '@',
      checkboxMessage: '@',
      checkboxCallback: '&',
      checkboxState: '='
    },
    replace: true,
    templateUrl: 'sp_dialog.xml',
    link: function(scope, element) {
      element.remove();
      element.appendTo($('body'));
      if (scope.checkboxMessage) {
        scope.checkboxModel = {
          value: scope.checkboxState
        };
        scope.update = function() {
          scope.checkboxState = scope.checkboxModel.value;
          $timeout(function() {
            scope.checkboxCallback()(scope.checkboxState);
          })
        }
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/controller.spPage.js */
angular.module("sn.$sp").controller("spPageCtrl", function($scope, $http, $location, $window, spAriaUtil, spUtil,
  snRecordWatcher, $rootScope, spPage, spConf, spAriaFocusManager) {
  'use strict';
  var _ = $window._;
  var c = this;
  c.firstPage = true;
  $scope.page = {
    title: "Loading..."
  };
  $scope.theme = {};
  $scope.portal = {};
  $scope.sessions = {};
  if ($window.NOW.sp_show_console_error) {
    spPage.showBrowserErrors();
  }
  c.parseJSON = function(str) {
    return JSON.parse(str);
  };
  c.getContainerClasses = function(container) {
    var classes = [];
    if (!container.bootstrap_alt) {
      classes[classes.length] = container.width;
    }
    if (container.container_class_name) {
      classes[classes.length] = container.container_class_name;
    }
    return classes;
  };
  var oid = $location.search().id;
  var oldPath = $location.path();
  var locationChanged = false;
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
    locationChanged = (oldUrl != newUrl);
    var s = $location.search();
    var p = $location.path();
    if (oldPath != p) {
      $window.location.href = $location.absUrl();
      return;
    }
    if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
      return;
    }
    if (spPage.isHashChange(newUrl, oldUrl))
      return;
    $scope.$broadcast('$$uiNotification.dismiss');
    if (newUrl = spPage.containsSystemPage(p)) {
      $window.location.href = newUrl;
      return;
    }
    if (!$window.NOW.has_access && locationChanged) {
      $window.location.href = $location.absUrl();
      return;
    }
    oid = s.id;
    getPage();
  });

  function loadPage(r) {
    var response = r.data.result;
    c.firstPage = false;
    $scope.containers = _.filter(response.containers, {
      'subheader': false
    });
    $scope.subheaders = _.filter(response.containers, {
      'subheader': true
    });
    var p = response.page;
    var u = response.user;
    if (!spPage.isPublicOrUserLoggedIn(p, u)) {
      if (locationChanged) {
        $window.location.href = $location.absUrl();
        return;
      }
    }
    $rootScope.page = $scope.page = p;
    $(spPage.getElement(p)).remove();
    $(spPage.getStyle(p)).appendTo('head');
    $window.document.title = spPage.getTitle(response);
    $scope.$broadcast('$sp.scroll', {
      position: 0
    });
    $rootScope.theme = $scope.theme = response.theme;
    $rootScope.portal = $scope.portal = response.portal;
    c.style = spPage.getClasses($scope);
    response.portal.logoutUrl = spUtil.format(spConf.logoutUrl, {
      url_suffix: response.portal.url_suffix
    });
    if (!$scope.user) {
      $rootScope.user = $scope.user = {};
    }
    $scope.g_accessibility = spAriaUtil.g_accessibility;
    angular.extend($scope.user, response.user);
    $scope.user.logged_in = spPage.userLoggedIn($scope.user);
    $scope.$broadcast('$$uiNotification', response.$$uiNotification);
    snRecordWatcher.init();
  }

  function getPage() {
    return $http({
        method: 'GET',
        url: spPage.getUrl($scope.portal_id),
        headers: spUtil.getHeaders()
      }).then(loadPage)
      .then(function() {
        spAriaFocusManager.pageLoadComplete($location.url());
      });
  }
  $scope.$on('sp.page.reload', getPage);
  $($window).keydown(spPage.saveOnCtrlS);
  $scope.$on('$destroy', function() {
    $($window).off('keydown', spPage.saveOnCtrlS);
  });
});;
/*! RESOURCE: /scripts/app.$sp/factory.spPage.js */
angular.module('sn.$sp').factory('spPage', function($rootScope, spConf, $location, $window) {
  'use strict';

  function getStyle(page) {
    return '<style type="text/css" data-page-id="' + page.sys_id + '" data-page-title="' + page.title + '">' + page.css + '</style>'
  }

  function getClasses(scope) {
    var style = [];
    if (scope.isNative)
      style.push('isNative');
    if (scope.theme.navbar_fixed)
      style.push('fixed-header');
    if (scope.theme.footer_fixed)
      style.push('fixed-footer');
    return style.join(' ');
  }

  function getElement(page) {
    return "style[data-page-id='" + page.sys_id + "']";
  }

  function isHashChange(newUrl, oldUrl) {
    if (newUrl == oldUrl)
      return false;
    var newUrlParts = newUrl.split("#");
    var oldUrlParts = oldUrl.split("#");
    return (newUrlParts.length > 1 && newUrlParts[0] == oldUrlParts[0]);
  }

  function userLoggedIn(user) {
    if (user.hasOwnProperty("logged_in"))
      return user.logged_in;
    if (user.user_name === "guest")
      return false;
    if (typeof user.user_name !== "undefined" && user.user_name && user.user_name !== "guest")
      return true;
    return user.can_debug_admin;
  }

  function isPublicOrUserLoggedIn(page, user) {
    if (page.public || userLoggedIn(user)) {
      return true;
    }
    return false;
  }

  function getTitle(response) {
    if (response.portal.title) {
      return (response.page.title) ? response.page.title + ' - ' + response.portal.title : response.portal.title;
    }
    return response.page.title;
  }

  function saveOnCtrlS(e) {
    if (e.keyCode != spConf.s)
      return;
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
      $rootScope.$broadcast("$sp.save", e);
    }
  }

  function getUrl(portalId) {
    var currentParms = $location.search();
    var params = {};
    angular.extend(params, currentParms);
    params.time = new $window.Date().getTime();
    params.portal_id = portalId;
    params.request_uri = $location.url();
    return spConf.pageApi + '?' + $.param(params);
  }

  function containsSystemPage(path) {
    if (path.indexOf('.do') > 0 && path.indexOf(spConf.page) == -1) {
      var newUrl = $location.absUrl();
      return '/' + newUrl.substr(newUrl.search(/[^\/]+.do/));
    }
    return false;
  }

  function showBrowserErrors() {
    $window.console.error = (function(old_function) {
      return function(text) {
        old_function(text);
        $rootScope.$broadcast(spConf.e.notification, {
          type: "error",
          message: "There is a JavaScript error in your browser console"
        });
      };
    }($window.console.error.bind($window.console)));
  }
  return {
    getTitle: getTitle,
    getStyle: getStyle,
    getElement: getElement,
    isHashChange: isHashChange,
    getClasses: getClasses,
    isPublicOrUserLoggedIn: isPublicOrUserLoggedIn,
    userLoggedIn: userLoggedIn,
    saveOnCtrlS: saveOnCtrlS,
    getUrl: getUrl,
    containsSystemPage: containsSystemPage,
    showBrowserErrors: showBrowserErrors
  };
});;
/*! RESOURCE: /scripts/app.$sp/service.spPreference.js */
angular.module('sn.$sp').factory('spPreference', function(spConf, $http, $window) {
  'use strict';
  return {
    set: function(name, value) {
      if (value !== null && typeof value === 'object')
        value = JSON.stringify(value);
      var n = $.param({
        sysparm_type: spConf.sysParamType,
        sysparm_ck: $window.g_ck,
        type: 'set_preference',
        name: name,
        value: value
      });
      return $http.post(spConf.angularProcessor + '?' + n);
    },
    get: function(name, callback) {
      if (name == null)
        return null;
      var n = $.param({
        sysparm_type: spConf.sysParamType,
        sysparm_ck: $window.g_ck,
        type: 'get_preference',
        name: name
      });
      return $http.post(spConf.angularProcessor + '?' + n).then(function(response) {
        var answer = response.data.value;
        if (callback && typeof callback === "function")
          callback(answer);
        else
          console.warn("spPreference.get synchronous use not supported in Service Portal (preference: " + name + "), use callback");
      })
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spWidget.js */
angular.module('sn.$sp').factory('spWidgetService', function($compile, lazyLoader, spServer, $rootScope, $injector) {
  var head = document.head || document.getElementsByTagName('head')[0];

  function addElement(options) {
    var el = document.createElement('style');
    el.type = 'text/css';
    if (options.id)
      el.setAttribute('id', options.id);
    if (options.widget)
      el.setAttribute('widget', options.widget);
    if (el.styleSheet)
      el.styleSheet.cssText = options.css;
    else
      el.appendChild(document.createTextNode(options.css));
    return el;
  }

  function render(scope, element, template) {
    element.html(template);
    var el = $compile(element.contents())(scope);
    element.replaceWith(el);
  }

  function loadCSS(scope) {
    var id = scope.widget.directiveName + '-s';
    if (scope.widget.css) {
      if (scope.widget.update)
        scope.widget.css = scope.widget.css.replace(new RegExp('v' + scope.widget.sys_id, 'g'), scope.widget.directiveName);
      if (!$("head #" + id).length)
        head.appendChild(addElement({
          css: scope.widget.css,
          id: id,
          widget: scope.widget.name
        }));
    }
    if (scope.widget.rectangle && scope.widget.rectangle.css)
      head.appendChild(addElement({
        css: scope.widget.rectangle.css,
        widget: scope.widget.name
      }));
  }

  function initData(scope) {
    scope.data = scope.widget.data;
    scope.options = scope.widget.options;
    scope.widget_parameters = scope.options;
  }

  function noData(scope) {
    if (!scope.widget || !Object.keys(scope.widget).length) {
      return true;
    }
    return false;
  }

  function loadDirective(scope, directiveName) {
    if (scope.widget.providers) {
      lazyLoader.providers(scope.widget.providers);
    }
    lazyLoader.directive(directiveName, function($injector) {
      var api = {
        restrict: 'C',
        replace: false
      };
      if (typeof scope.data.replace !== 'undefined')
        api.replace = scope.data.replace;
      if (scope.widget.template)
        api.template = scope.widget.template;
      if (scope.widget.client_script) {
        try {
          var stmt = 'api.controller=' + scope.widget.client_script;
          var src = scope.widget.id || directiveName;
          stmt = "//# sourceURL=" + src + ".js\n" + stmt;
          eval(stmt);
          api.controller.displayName = src;
          if (scope.widget.controller_as) {
            api.controllerAs = scope.widget.controller_as;
            api.bindToController = {
              data: '=',
              options: '=',
              widget: '=',
              server: '='
            };
          }
        } catch (e) {
          console.log(e);
          console.log(scope.widget.client_script);
        }
      }
      api.link = function(sc, elem, attr, ctrl) {
        var link;
        if (scope.widget.link) {
          eval('link=' + scope.widget.link);
          if (link) {
            link(sc, elem, attr, ctrl)
          }
        };
      };
      return api;
    });
  }

  function initGlobals(scope) {
    scope.page = scope.page || $rootScope.page;
    scope.portal = $rootScope.portal;
    scope.user = $rootScope.user;
    scope.theme = $rootScope.theme;
    scope.server = spServer.set(scope);
  }
  return {
    render: render,
    loadCSS: loadCSS,
    initData: initData,
    initGlobals: initGlobals,
    noData: noData,
    loadDirective: loadDirective
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spWidget.js */
angular.module('sn.$sp').directive('spWidget', function($rootScope, $timeout, lazyLoader, spWidgetService, spUtil) {
  'use strict';
  var service = spWidgetService;

  function renderWidget(scope, element) {
    if (scope.widget.ngTemplates)
      lazyLoader.putTemplates(scope.widget.ngTemplates);
    service.initData(scope);
    service.initGlobals(scope);
    var name = scope.widget.sys_id;
    name = "v" + name;
    if (scope.widget.update) {
      name += spUtil.createUid('xxxxx');
    }
    scope.widget.directiveName = name;
    scope.$watch("widget", function(newValue, oldValue) {
      if (newValue !== oldValue)
        service.initData(scope);
    });
    var idTag = (scope.widget.rectangle_id) ? "id=\"x" + scope.widget.rectangle_id + "\"" : "";
    var template = '<div ' + idTag + ' class="' + name + '" data="data" options="options" widget="widget" server="server"></div>';
    if (name.length == 0)
      return;

    function load() {
      service.loadDirective(scope, name, template);
      service.loadCSS(scope);
      service.render(scope, element, template);
    }
    if (scope.widget.dependencies && scope.widget.dependencies.length > 0) {
      lazyLoader.dependencies(scope.widget.dependencies).then(load, function(e) {
        spUtil.format('An error occurred when loading widget dependencies for: {name} ({id}) {error}', {
          name: scope.widget.name,
          id: scope.widget.sys_id,
          error: e
        });
        load();
      });
    } else {
      load();
    }
  }

  function link(scope, element) {
    if (service.noData(scope)) {
      var w = scope.$watch("widget", function() {
        if (!service.noData(scope)) {
          w();
          renderWidget(scope, element);
        }
      });
      return;
    }
    renderWidget(scope, element);
  }
  return {
    restrict: "E",
    link: link,
    scope: {
      widget: '=',
      page: '=?'
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/controller.spWidgetDebug.js */
angular.module('sn.$sp').controller('spWidgetDebug', function($scope, $rootScope, $uibModal, $http, spUtil, $window, i18n) {
  $scope.reveal = false;
  $scope.page = $rootScope.page;
  $scope.portal = $rootScope.portal;
  var menu = [
    null, [i18n.getMessage("Instance Options"), editInstance],
    [i18n.getMessage('Instance in Page Editor') + ' ➚', instancePageEdit],
    [i18n.getMessage('Page in Designer') + ' ➚', openDesigner],
    null, [i18n.getMessage('Edit Container Background'), editBackground],
    null, [i18n.getMessage('Widget Options Schema'), editOptionSchema],
    [i18n.getMessage('Widget in Form Modal'), editWidget],
    [i18n.getMessage('Widget in Editor') + ' ➚', openWidgetEditor],
    null, [i18n.getMessage('Log to console') + ': $scope.data', logScopeData],
    [i18n.getMessage('Log to console') + ': $scope', logScope]
  ];
  var basic_menu = [
    null, [i18n.getMessage("Instance Options"), editInstance],
    [i18n.getMessage('Log to console') + ': $scope.data', logScopeData],
    [i18n.getMessage('Log to console') + ': $scope', logScope]
  ];
  $scope.contextMenu = function(event) {
    if (!event.ctrlKey || !$rootScope.user.can_debug)
      return [];
    var m = menu.slice();
    if (!$rootScope.user.can_debug_admin)
      m = basic_menu.slice();
    else if ($scope.page.internal)
      m.splice(3, 1);
    var w = $scope.rectangle.widget;
    m[0] = spUtil.format("'{widget}' {text} : {time}", {
      widget: w.name,
      text: i18n.getMessage('generated in'),
      time: w._server_time
    });
    m[1] = ((!w.option_schema && !w.rectangle.widget_parameters && !w.field_list) || !$rootScope.user.can_debug_admin) ? [i18n.getMessage("Instance Options")] : [i18n.getMessage("Instance Options"), editInstance];
    var p = "_debugContextMenu";
    if (p in w && Array.isArray(w[p]))
      return m.concat([null], w[p]);
    return m;
  };

  function logScope() {
    console.log("Widget instance...", $scope.rectangle.widget);
  }

  function logScopeData() {
    console.log("Widget $scope.data...", $scope.rectangle.widget.data);
  }

  function editWidget() {
    editRecord('sp_widget', $scope.rectangle.widget.sys_id);
  }

  function editInstance() {
    editRecord('sp_instance', $scope.rectangle.sys_id);
  }

  function editBackground() {
    editRecord('sp_container', $scope.container.sys_id);
  }

  function openDesigner() {
    var page = '$spd.do';
    var ops = {
      portal: $scope.portal.url_suffix,
      page: page,
      pageId: $scope.page.id,
      instance: $scope.rectangle.sys_id
    };
    $window.open(spUtil.format('/{page}#/{portal}/editor/{pageId}/{instance}', ops), page);
  }

  function openWidgetEditor() {
    openConfig({
      id: 'widget_editor',
      sys_id: $scope.rectangle.widget.sys_id
    });
  }

  function instancePageEdit() {
    openConfig({
      id: 'page_edit',
      p: $scope.page.id,
      table: 'sp_instance',
      sys_id: $scope.rectangle.sys_id
    });
  }

  function editOptionSchema() {
    var data = {
      embeddedWidgetId: 'we20',
      embeddedWidgetOptions: {
        sys_id: $scope.rectangle.widget.sys_id
      }
    };
    spUtil.get('widget-modal', data).then(function(widget) {
      var myModalCtrl = null;
      widget.options.afterOpen = function(modalCtrl) {
        myModalCtrl = modalCtrl;
      };
      var unregister = $scope.$on('$sp.we20.options_saved', function() {
        myModalCtrl.close();
        unregister();
      });
      widget.options.afterClose = function() {
        $scope.rectangle.debugModal = null;
        $rootScope.$broadcast('sp.page.reload');
      };
      $scope.rectangle.debugModal = widget;
    });
  }

  function openConfig(params) {
    $window.open('/sp_config?' + $.param(params), 'sp_config');
  }

  function editRecord(table, sys_id) {
    var input = {
      table: table,
      sys_id: sys_id
    };
    spUtil.get('widget-options-config', input).then(function(widget) {
      var myModalCtrl = null;
      widget.options.afterClose = function() {
        $scope.rectangle.debugModal = null;
      };
      widget.options.afterOpen = function(modalCtrl) {
        myModalCtrl = modalCtrl;
      };
      $scope.rectangle.debugModal = widget;
      var unregister = $scope.$on('sp.form.record.updated', function(evt, fields) {
        unregister();
        unregister = null;
        myModalCtrl.close();
        $rootScope.$broadcast('sp.page.reload');
      });
    });
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spNavbarToggle.js */
angular.module('sn.$sp').directive('spNavbarToggle', function(cabrillo, $timeout) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $scope.toggleNavMenu = function() {
        $(element).collapse('toggle');
      }
      if (cabrillo.isNative) {
        cabrillo.viewLayout.setNavigationBarButtons([{
          title: 'Menu'
        }], $scope.toggleNavMenu);
      }
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spAttachmentButton.js */
angular.module('sn.$sp').directive('spAttachmentButton', function(cabrillo, $rootScope, $timeout, i18n) {
  'use strict';
  return {
    restrict: 'E',
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button href="#" title="" ng-click="showAttachOptions()" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-camera"></span></button>';
      } else {
        inputTemplate = '<input type="file" style="display: none" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input"/>';
        inputTemplate += '<button title="" ng-click="attachmentHandler.openSelector($event)" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-paperclip"></span></button>';
      }
      return [
        '<span class="file-upload-input">',
        inputTemplate,
        '</span>'
      ].join('');
    },
    controller: function($element, $scope) {
      $scope.attachmentClassNames = 'btn-default attachment-btn btn-primary icon-paperclip icon-camera list-group-btn';
      $scope.showAttachOptions = function() {
        var handler = $scope.attachmentHandler;
        cabrillo.attachments.addFile(
          handler.tableName,
          handler.tableId,
          null, {
            maxWidth: 1000,
            maxHeight: 1000
          }
        ).then(function(data) {
          handler.getAttachmentList();
          $rootScope.$broadcast("added_attachment");
        }, function() {
          console.log('Failed to attach new file');
        });
      };
      $scope.$on('attachment_select_files', function(e) {
        $timeout(function() {
          $($element).find('.sp-attachments-input').click();
        });
      });
    },
    link: function(scope, el, attr) {
      i18n.getMessage("Add attachment", function(msg) {
        el.find("button").attr("title", msg);
        el.find("button").attr("aria-label", msg);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spPageRow.js */
angular.module('sn.$sp').directive('spPageRow', function($rootScope, $timeout, $compile) {
  return {
    restrict: 'E',
    templateUrl: 'sp_page_row',
    compile: function($tElement) {
      var el = angular.element($tElement[0]);
      var recursiveNode = el.children(".sp-row-content").remove();
      return function(scope, element, attrs) {
        var newNode = recursiveNode.clone();
        element.append(newNode);
        $compile(newNode)(scope);
      };
    },
    replace: false,
    scope: {
      columns: "=",
      container: "=",
      row: '='
    },
    controller: function($scope) {}
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spPanel.js */
angular.module('sn.$sp').directive('spPanel', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    link: function($scope, $element, $attributes, controller, transcludeFn) {
      $scope.widgetParameters = $scope.widget_parameters || $scope.$parent.widget_parameters || {};
      if (!$scope.options)
        $scope.options = $scope.$eval($attributes.options) || $scope.$parent.options;
      var title;
      try {
        title = $scope.$eval($attributes.title);
      } catch (e) {
        title = $attributes.title
      }
      $scope.title = title || $scope.options.title;
      $scope.bodyClass = $scope.$eval($attributes.bodyClass) || "panel-body";
      transcludeFn($scope, function(clone) {
        var container = $element.find('div.transclude');
        container.empty();
        container.append(clone);
      });
    },
    template: '<div class="panel panel-{{options.color}} b">' +
      '<div class="panel-heading"> <h1 class="h4 panel-title">' +
      '<fa ng-if="options.glyph.length" name="{{options.glyph}}" class="m-r-sm" />{{title}}</h1>' +
      '</div>' +
      '<div class="{{bodyClass}} transclude"></div>' +
      '</div>'
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spModel.js */
angular.module('sn.$sp').directive('spVariableLayout', function() {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_variable_layout.xml',
    scope: false
  };
}).directive('spModel', function($timeout, spUtil, glideFormFactory, glideUserSession, catalogItemFactory, glideFormEnvironmentFactory, catalogGlideFormFactory, spUIActionFactory, glideModalFactory, $uibModal,
  spModal, glideListFactory) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: function(elem, attrs) {
      return attrs.templateUrl || 'sp_model.xml';
    },
    replace: true,
    scope: {
      formModel: "=",
      mandatory: '=',
      isInlineForm: '=?'
    },
    controller: function($scope) {
      var c = this;
      var g_form;
      var flatFields;
      var isCatalogItem;
      var debounceFieldChange;
      var formModel;
      $scope.$watch('formModel', function(newValue) {
        if (angular.isDefined(newValue)) {
          init();
        }
      });
      c.populateMandatory = function populateMandatory(flatFields) {
        var mandatory = [];
        var field;
        for (var f in flatFields) {
          field = flatFields[f];
          if (typeof field.mandatory_filled == 'undefined')
            continue;
          if (field.mandatory_filled())
            continue;
          if (field.visible && field.isMandatory())
            mandatory.push(field);
        }
        $scope.$emit("variable.mandatory.change");
        return mandatory;
      };

      function onChange(fieldName, oldValue, newValue) {
        if (!(fieldName in formModel._fields))
          return;
        $timeout.cancel(debounceFieldChange[fieldName]);
        debounceFieldChange[fieldName] = $timeout(function() {
          var field = formModel._fields[fieldName];
          if (isCatalogItem) {
            if (field._pricing) {
              c.setPrices(field, newValue);
              c.setBoolean(field, newValue);
              c.calcPrice(formModel._fields);
            }
          }
          $scope.mandatory = c.populateMandatory(flatFields);
          var p = {
            field: field,
            oldValue: oldValue,
            newValue: newValue
          };
          $scope.$emit("field.change", p);
          $scope.$emit("field.change." + field.name, p);
        });
      }

      function uiMessageHandler(g_form, type, message) {
        switch (type) {
          case 'infoMessage':
            spUtil.addInfoMessage(message);
            break;
          case 'errorMessage':
            spUtil.addErrorMessage(message);
            break;
          case 'clearMessages':
            break;
          default:
            return false;
        }
      }
      c.getFieldsFromView = function getFieldsFromView(fm) {
        var fields = [],
          field;
        if (typeof fm._view !== "undefined") {
          for (var f in fm._view) {
            field = fm._view[f];
            if (fm._fields[field.name]) {
              fields.push(fm._fields[field.name]);
            }
            getNestedVariables(fm, fields, field);
          }
        } else if (typeof fm._sections !== "undefined") {
          getNestedFields(fields, fm._sections);
        }
        return fields;
      };

      function getNestedVariables(fm, fields, field) {
        if (typeof field.variables !== "undefined") {
          for (var v in field.variables) {
            var variable = field.variables[v];
            if (fm._fields[variable.name]) {
              fields.push(fm._fields[variable.name]);
            }
            getNestedVariables(fm, fields, variable);
          }
        }
      }

      function getNestedFields(fields, containers) {
        if (!containers)
          return;
        for (var _container in containers) {
          var container = containers[_container];
          if (container.columns) {
            for (var _col in container.columns) {
              var col = container.columns[_col];
              for (var _field in col.fields) {
                var field = col.fields[_field];
                if (field.type == "container")
                  getNestedFields(fields, [field]);
                else if (field.type == "checkbox_container")
                  getNestedFields(fields, field.containers);
                else if (field.type == "field")
                  fields.push(formModel._fields[field.name]);
              }
            }
          }
        }
      }
      c.hasCatalogVariable = function hasCatalogVariable(flatFields) {
        for (var f in flatFields) {
          if (flatFields[f].hasOwnProperty('_cat_variable'))
            return true;
        }
        return false;
      };
      c.calcPrice = function calcPrice(fields) {
        var price = 0;
        var recurring_price = 0;
        angular.forEach(fields, function(field) {
          if (field.price)
            price += Number(field.price);
          if (field.recurring_price)
            recurring_price += Number(field.recurring_price);
        });
        var o = {
          price: price,
          recurring_price: recurring_price
        };
        $scope.$emit("variable.price.change", o);
      };
      c.setBoolean = function setBoolean(field, value) {
        if (field.type != 'boolean')
          return;
        if (value == true || value == 'true') {
          field.price = field._pricing.price_if_checked;
          field.recurring_price = field._pricing.rec_price_if_checked;
        } else
          field.price = field.recurring_price = 0;
      };
      c.setPrices = function setPrices(field, value) {
        if (!field.choices)
          return;
        field.choices.forEach(function(c) {
          if (c.value != value)
            return;
          field.price = c.price;
          field.recurring_price = c.recurring_price;
        });
      };
      $scope.getGlideForm = function() {
        return g_form;
      };

      function hasVariablePrefix(v) {
        return v.indexOf("IO:") == 0;
      }
      $scope.getVarID = function(v) {
        if (typeof v.name != "undefined" && hasVariablePrefix(v.name))
          return v.name.substring(3);
        return v.name;
      };

      function initGlideForm() {
        var uiActions = spUIActionFactory.create(formModel._ui_actions || [], {
          attachmentGUID: formModel._attachmentGUID,
          uiActionNotifier: function(actionName, uiActionPromise) {
            uiActionPromise.then(function(response) {
              $scope.$emit("spModel.uiActionComplete", response);
            });
          }
        });
        g_form = glideFormFactory.create($scope, (isCatalogItem ? null : formModel.table), formModel.sys_id, flatFields, uiActions, {
          uiMessageHandler: uiMessageHandler,
          relatedLists: formModel._related_lists,
          sections: formModel._sections
        });
        g_form.getControl = getControl;
        g_form.getField = function(fieldName) {
          for (var i = 0, iM = flatFields.length; i < iM; i++) {
            var field = flatFields[i];
            if (field.variable_name === fieldName || field.name === fieldName) {
              return field;
            }
          }
          if (g_form._options.getMappedField) {
            var mapped = g_form._options.getMappedField(fieldName);
            if (mapped) {
              return mapped;
            }
          }
        };
        g_form.showFieldMsg0 = g_form.showFieldMsg;
        g_form.showFieldMsg = function() {
          g_form.showFieldMsg0.apply(this, arguments);
          if (!$scope.$root.$$phase) {
            $scope.$apply();
          }
        };
        g_form.$private.events.on('change', onChange);
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (propertyName == "mandatory")
            $scope.mandatory = c.populateMandatory(flatFields);
        });
        $scope.$on("sp.spFormField.stagedValueChange", function() {
          $scope.mandatory = c.populateMandatory(flatFields);
        });
      }
      $scope.isContainerVisible = function isContainerVisible(container) {
        if (typeof formModel._fields[container.name] != "undefined")
          return formModel._fields[container.name].visible;
        else
          return true;
      };
      c.massageView = function massageView(formModel) {
        if (typeof formModel._view == "undefined")
          return;
        for (var i = formModel._view.length - 1; i >= 0; i--) {
          var field = formModel._view[i];
          if (field.type == 'field' && !formModel._fields[field.name])
            formModel._view.splice(i, 1);
        }
        if (formModel._sections == null) {
          formModel._sections = [{
            _bootstrap_cells: 12,
            visible: true,
            columns: [{
              fields: formModel._view
            }]
          }];
        }
      };

      function init() {
        $scope.mandatory = [];
        debounceFieldChange = {};
        formModel = $scope.formModel;
        c.massageView(formModel);
        flatFields = c.getFieldsFromView(formModel);
        isCatalogItem = c.hasCatalogVariable(flatFields);
        $scope.containers = formModel._sections;
        initGlideForm();
      }
      var execScriptTimeout;
      $scope.execItemScripts = function execItemScripts() {
        $timeout.cancel(execScriptTimeout);
        execScriptTimeout = $timeout(function() {
          execItemScripts0();
        }, 20);
      };

      function execItemScripts0() {
        $scope.$emit("spModel.fields.rendered");
        $timeout(function() {
          glideUserSession.loadCurrentUser().then(onUserLoad);
        });

        function onUserLoad(user) {
          $scope.mandatory = c.populateMandatory(flatFields);
          var g_modal = glideModalFactory.create({
            alert: modalAlert,
            confirm: modalConfirm
          });
          var gfConfig = glideFormEnvironmentFactory.createWithConfiguration(g_form, user, formModel.g_scratchpad, formModel.client_script || [], formModel.policy || [], g_modal);
          if (isCatalogItem) {
            gfConfig.g_env.registerExtensionPoint('g_service_catalog', {
              'isOrderGuide': function() {
                return formModel.isOrderGuideItem;
              }
            });
            catalogGlideFormFactory.addItemEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
            catalogGlideFormFactory.addVariableEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
            c.calcPrice(formModel._fields);
          }
          gfConfig.g_env.registerExtensionPoint('spModal', spModal);
          gfConfig.g_env.registerExtensionPoint('g_list', glideListFactory.init(g_form, flatFields));
          gfConfig.initialize();
          $scope.$emit("spModel.gForm.initialized", g_form);
        }
      };
      $scope.$on('$destroy', function() {
        if (g_form)
          $scope.$emit("spModel.gForm.destroyed", formModel.sys_id);
      });

      function modalAlert(title, message, done) {
        spModal.alert(message).then(done);
      }

      function modalConfirm(title, message, done) {
        spModal.confirm(message).then(
          function() {
            done(true)
          },
          function() {
            done(false)
          }
        );
      }
    }
  };

  function getControl(name) {
    var names = this.getFieldNames();
    if (names.indexOf(name) == -1)
      return null;
    return new GlideFormControl(this, name);

    function GlideFormControl(g_form, name) {
      this.g_form = g_form;
      this.name = name;
      this.options = [];
      this.focus = function focus() {
        console.log(">> focus not implemented for " + this.name)
      }
      Object.defineProperty(this, 'value', {
        get: function() {
          return this.g_form.getValue(this.name);
        },
        set: function(val) {
          this.g_form.setValue(this.name, val);
        }
      })
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spCodeEditorAutocomplete.js */
angular.module('sn.$sp').factory('spCodeEditorAutocomplete', ['$rootScope', '$q', '$http', function($rootScope, $q, $http) {
  'use strict';
  var configCache = {};
  var codeEditorAutocompleteAPI = "/api/now/sp/editor/autocomplete";
  return {
    getConfig: function(tableName, field) {
      if (configCache[tableName + "." + field])
        return $q.when(configCache[tableName + "." + field]);
      return $http.get(codeEditorAutocompleteAPI + "/table/" + tableName + "/field/" + field).then(function(response) {
        var responseConfig = response.data.result;
        configCache[tableName + "." + field] = responseConfig;
        return responseConfig;
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/app.$sp/provider.defaultJSAutocomplete.js */
angular.module('sn.$sp').provider('defaultJSAutocomplete', function defaultJSAutocompleteProvider() {
      "use strict";
      this.$get = function defaultJSAutocompleteFactory() {
          return {
            "!name": "ecma5",
            "!define": {
              "Error.prototype": "Error.prototype"
            },
            "Infinity": {
              "!type": "number",
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Infinity",
              "!doc": "A numeric value representing infinity."
            },
            "undefined": {
              "!type": "?",
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/undefined",
              "!doc": "The value undefined."
            },
            "NaN": {
              "!type": "number",
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/NaN",
              "!doc": "A value representing Not-A-Number."
            },
            "Object": {
              "!type": "fn()",
              "getPrototypeOf": {
                "!type": "fn(obj: ?) -> ?",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getPrototypeOf",
                "!doc": "Returns the prototype (i.e. the internal prototype) of the specified object."
              },
              "create": {
                "!type": "fn(proto: ?) -> !custom:Object_create",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create",
                "!doc": "Creates a new object with the specified prototype object and properties."
              },
              "defineProperty": {
                "!type": "fn(obj: ?, prop: string, desc: ?) -> !custom:Object_defineProperty",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
                "!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
              },
              "defineProperties": {
                "!type": "fn(obj: ?, props: ?) -> !custom:Object_defineProperties",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
                "!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
              },
              "getOwnPropertyDescriptor": {
                "!type": "fn(obj: ?, prop: string) -> ?",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor",
                "!doc": "Returns a property descriptor for an own property (that is, one directly present on an object, not present by dint of being along an object's prototype chain) of a given object."
              },
              "keys": {
                "!type": "fn(obj: ?) -> [string]",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys",
                "!doc": "Returns an array of a given object's own enumerable properties, in the same order as that provided by a for-in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well)."
              },
              "getOwnPropertyNames": {
                "!type": "fn(obj: ?) -> [string]",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames",
                "!doc": "Returns an array of all properties (enumerable or not) found directly upon a given object."
              },
              "seal": {
                "!type": "fn(obj: ?)",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/seal",
                "!doc": "Seals an object, preventing new properties from being added to it and marking all existing properties as non-configurable. Values of present properties can still be changed as long as they are writable."
              },
              "isSealed": {
                "!type": "fn(obj: ?) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isSealed",
                "!doc": "Determine if an object is sealed."
              },
              "freeze": {
                "!type": "fn(obj: ?) -> !0",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/freeze",
                "!doc": "Freezes an object: that is, prevents new properties from being added to it; prevents existing properties from being removed; and prevents existing properties, or their enumerability, configurability, or writability, from being changed. In essence the object is made effectively immutable. The method returns the object being frozen."
              },
              "isFrozen": {
                "!type": "fn(obj: ?) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isFrozen",
                "!doc": "Determine if an object is frozen."
              },
              "preventExtensions": {
                "!type": "fn(obj: ?)",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions",
                "!doc": "Prevents new properties from ever being added to an object."
              },
              "isExtensible": {
                "!type": "fn(obj: ?) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible",
                "!doc": "The Object.isExtensible() method determines if an object is extensible (whether it can have new properties added to it)."
              },
              "prototype": {
                "!stdProto": "Object",
                "toString": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toString",
                  "!doc": "Returns a string representing the object."
                },
                "toLocaleString": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toLocaleString",
                  "!doc": "Returns a string representing the object. This method is meant to be overriden by derived objects for locale-specific purposes."
                },
                "valueOf": {
                  "!type": "fn() -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/valueOf",
                  "!doc": "Returns the primitive value of the specified object"
                },
                "hasOwnProperty": {
                  "!type": "fn(prop: string) -> bool",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/hasOwnProperty",
                  "!doc": "Returns a boolean indicating whether the object has the specified property."
                },
                "propertyIsEnumerable": {
                  "!type": "fn(prop: string) -> bool",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable",
                  "!doc": "Returns a Boolean indicating whether the specified property is enumerable."
                },
                "isPrototypeOf": {
                  "!type": "fn(obj: ?) -> bool",
                  "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf",
                  "!doc": "Tests for an object in another object's prototype chain."
                }
              },
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object",
              "!doc": "Creates an object wrapper."
            },
            "Function": {
              "!type": "fn(body: string) -> fn()",
              "prototype": {
                "!stdProto": "Function",
                "apply": {
                  "!type": "fn(this: ?, args: [?])",
                  "!effects": [
                    "call and return !this this=!0 !1.<i> !1.<i> !1.<i>"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/apply",
                  "!doc": "Calls a function with a given this value and arguments provided as an array (or an array like object)."
                },
                "call": {
                  "!type": "fn(this: ?, args?: ?) -> !this.!ret",
                  "!effects": [
                    "call and return !this this=!0 !1 !2 !3 !4"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/call",
                  "!doc": "Calls a function with a given this value and arguments provided individually."
                },
                "bind": {
                  "!type": "fn(this: ?, args?: ?) -> !custom:Function_bind",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind",
                  "!doc": "Creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function was called."
                },
                "prototype": "?"
              },
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function",
              "!doc": "Every function in JavaScript is actually a Function object."
            },
            "Array": {
              "!type": "fn(size: number) -> !custom:Array_ctor",
              "isArray": {
                "!type": "fn(value: ?) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/isArray",
                "!doc": "Returns true if an object is an array, false if it is not."
              },
              "prototype": {
                "!stdProto": "Array",
                "length": {
                  "!type": "number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/length",
                  "!doc": "An unsigned, 32-bit integer that specifies the number of elements in an array."
                },
                "concat": {
                  "!type": "fn(other: [?]) -> !this",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/concat",
                  "!doc": "Returns a new array comprised of this array joined with other array(s) and/or value(s)."
                },
                "join": {
                  "!type": "fn(separator?: string) -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/join",
                  "!doc": "Joins all elements of an array into a string."
                },
                "splice": {
                  "!type": "fn(pos: number, amount: number, newelt?: ?) -> [?]",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice",
                  "!doc": "Changes the content of an array, adding new elements while removing old elements."
                },
                "pop": {
                  "!type": "fn() -> !this.<i>",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/pop",
                  "!doc": "Removes the last element from an array and returns that element."
                },
                "push": {
                  "!type": "fn(newelt: ?) -> number",
                  "!effects": [
                    "propagate !0 !this.<i>"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/push",
                  "!doc": "Mutates an array by appending the given elements and returning the new length of the array."
                },
                "shift": {
                  "!type": "fn() -> !this.<i>",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/shift",
                  "!doc": "Removes the first element from an array and returns that element. This method changes the length of the array."
                },
                "unshift": {
                  "!type": "fn(newelt: ?) -> number",
                  "!effects": [
                    "propagate !0 !this.<i>"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/unshift",
                  "!doc": "Adds one or more elements to the beginning of an array and returns the new length of the array."
                },
                "slice": {
                  "!type": "fn(from?: number, to?: number) -> !this",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/slice",
                  "!doc": "Returns a shallow copy of a portion of an array."
                },
                "reverse": {
                  "!type": "fn()",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reverse",
                  "!doc": "Reverses an array in place.  The first array element becomes the last and the last becomes the first."
                },
                "sort": {
                  "!type": "fn(compare?: fn(a: ?, b: ?) -> number)",
                  "!effects": [
                    "call !0 !this.<i> !this.<i>"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort",
                  "!doc": "Sorts the elements of an array in place and returns the array."
                },
                "indexOf": {
                  "!type": "fn(elt: ?, from?: number) -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf",
                  "!doc": "Returns the first index at which a given element can be found in the array, or -1 if it is not present."
                },
                "lastIndexOf": {
                  "!type": "fn(elt: ?, from?: number) -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/lastIndexOf",
                  "!doc": "Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at fromIndex."
                },
                "every": {
                  "!type": "fn(test: fn(elt: ?, i: number, array: +Array) -> bool, context?: ?) -> bool",
                  "!effects": [
                    "call !0 this=!1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every",
                  "!doc": "Tests whether all elements in the array pass the test implemented by the provided function."
                },
                "some": {
                  "!type": "fn(test: fn(elt: ?, i: number, array: +Array) -> bool, context?: ?) -> bool",
                  "!effects": [
                    "call !0 this=!1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/some",
                  "!doc": "Tests whether some element in the array passes the test implemented by the provided function."
                },
                "filter": {
                  "!type": "fn(test: fn(elt: ?, i: number, array: +Array) -> bool, context?: ?) -> !this",
                  "!effects": [
                    "call !0 this=!1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter",
                  "!doc": "Creates a new array with all elements that pass the test implemented by the provided function."
                },
                "forEach": {
                  "!type": "fn(f: fn(elt: ?, i: number, array: +Array), context?: ?)",
                  "!effects": [
                    "call !0 this=!1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach",
                  "!doc": "Executes a provided function once per array element."
                },
                "map": {
                  "!type": "fn(f: fn(elt: ?, i: number, array: +Array) -> ?, context?: ?) -> [!0.!ret]",
                  "!effects": [
                    "call !0 this=!1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map",
                  "!doc": "Creates a new array with the results of calling a provided function on every element in this array."
                },
                "reduce": {
                  "!type": "fn(combine: fn(sum: ?, elt: ?, i: number, array: +Array) -> ?, init?: ?) -> !0.!ret",
                  "!effects": [
                    "call !0 !1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce",
                  "!doc": "Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value."
                },
                "reduceRight": {
                  "!type": "fn(combine: fn(sum: ?, elt: ?, i: number, array: +Array) -> ?, init?: ?) -> !0.!ret",
                  "!effects": [
                    "call !0 !1 !this.<i> number !this"
                  ],
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/ReduceRight",
                  "!doc": "Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value."
                }
              },
              "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array",
              "!doc": "The JavaScript Array global object is a constructor for arrays, which are high-level, list-like objects."
            },
            "String": {
              "!type": "fn(value: ?) -> string",
              "fromCharCode": {
                "!type": "fn(code: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/fromCharCode",
                "!doc": "Returns a string created by using the specified sequence of Unicode values."
              },
              "prototype": {
                "!stdProto": "String",
                "length": {
                  "!type": "number",
                  "!url": "https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/length",
                  "!doc": "Represents the length of a string."
                },
                "<i>": "string",
                "charAt": {
                  "!type": "fn(i: number) -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charAt",
                  "!doc": "Returns the specified character from a string."
                },
                "charCodeAt": {
                  "!type": "fn(i: number) -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt",
                  "!doc": "Returns the numeric Unicode value of the character at the given index (except for unicode codepoints > 0x10000)."
                },
                "indexOf": {
                  "!type": "fn(char: string, from?: number) -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/indexOf",
                  "!doc": "Returns the index within the calling String object of the first occurrence of the specified value, starting the search at fromIndex,\nreturns -1 if the value is not found."
                },
                "lastIndexOf": {
                  "!type": "fn(char: string, from?: number) -> number",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/lastIndexOf",
                  "!doc": "Returns the index within the calling String object of the last occurrence of the specified value, or -1 if not found. The calling string is searched backward, starting at fromIndex."
                },
                "substring": {
                  "!type": "fn(from: number, to?: number) -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substring",
                  "!doc": "Returns a subset of a string between one index and another, or through the end of the string."
                },
                "substr": {
                  "!type": "fn(from: number, length?: number) -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substr",
                  "!doc": "Returns the characters in a string beginning at the specified location through the specified number of characters."
                },
                "slice": {
                  "!type": "fn(from: number, to?: number) -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/slice",
                  "!doc": "Extracts a section of a string and returns a new string."
                },
                "trim": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim",
                  "!doc": "Removes whitespace from both ends of the string."
                },
                "toUpperCase": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toUpperCase",
                  "!doc": "Returns the calling string value converted to uppercase."
                },
                "toLowerCase": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLowerCase",
                  "!doc": "Returns the calling string value converted to lowercase."
                },
                "toLocaleUpperCase": {
                  "!type": "fn() -> string",
                  "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/