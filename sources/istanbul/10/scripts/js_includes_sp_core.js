/*! RESOURCE: /scripts/js_includes_sp_core.js */
/*! RESOURCE: /scripts/app.$sp/app.$sp.js */
angular.module("sn.$sp", [
  'ngAria',
  'oc.lazyLoad',
  'ngAnimate',
  'sn.common',
  'ngResource',
  'ngCookies',
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
/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular.module('sn.$sp').directive('spFormField', function($location, glideFormFieldFactory, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_form_field.xml',
    replace: true,
    scope: {
      field: '=',
      formModel: '=',
      getGlideForm: '&glideForm'
    },
    controller: function($element, $scope) {
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
        field.mandatory_filled = hasValue;
        field.stagedValue = field.value;
        $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
          if (fieldName == field.name)
            field.stagedValue = newValue;
        });
      }

      function hasValue() {
        if (field.type === "boolean")
          return true;
        if (field.stagedValue == null || typeof field.stagedValue === 'undefined')
          return false;
        var trimmed = String(field.stagedValue).trim();
        return trimmed.length > 0;
      }
      $scope.stagedValueChange = function() {
        $scope.$emit('sp.spFormField.stagedValueChange', null);
      }
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
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function(nowServer, $rootScope, $http, $location, snRecordWatcher, $q, spPreference) {
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
    triggerTableUIAction: function(action, table, recordID) {
      var req = {
        method: "POST",
        url: "/api/now/sp/uiaction/" + action.id,
        headers: this.getHeaders(),
        data: {
          table: table,
          recordID: recordID
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
    },
    get: function($scope, data) {
      var defer = $q.defer();
      var t = this.getWidgetURL($scope);
      var req = {
        method: 'POST',
        url: t,
        headers: this.getHeaders(),
        data: data
      };
      $http(req).then(qs, qe);

      function qs(response) {
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
        defer.resolve(r);
      }

      function qe(error) {
        console.log("Error " + error.status + " " + error.statusText);
        defer.reject(error);
      }
      return defer.promise;
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
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: type
      };
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + n[t]
      });
      return dataURL;
    },
    getHost: function() {
      var host = $location.protocol() + '://' + $location.host();
      if ($location.port()) {
        host += ':' + $location.port();
      }
      return host;
    },
    scrollTo: function(id, time) {
      var t = time || 1000;
      var offset = $('.navbar').height() || 0;
      $('section').animate({
        scrollTop: $(id).offset().top - offset - 10
      }, t);
    },
    getAccelerator: function(char) {
      var t = "";
      if (typeof window.ontouchstart == "undefined") {
        if (navigator.userAgent.indexOf("Mac OS X") > -1)
          t = "⌘ + " + char;
        else
          t = "Ctrl + " + char;
      }
      return t;
    },
    recordWatch: function($scope, table, filter, callback) {
      filter = filter || 'sys_id!=-1';
      var watcherChannel = snRecordWatcher.initChannel(table, filter);
      var deregister = $scope.$on('record.updated', function(name, data) {
        if (data.table_name != table)
          return;
        if (callback)
          callback(name, data);
        else
          $scope.server.update();
      })
      $scope.$on('$destroy', function() {
        deregister();
        watcherChannel.unsubscribe();
      })
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
      if (typeof strAttributes === 'object') {
        return strAttributes;
      }
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
      $scope.$on('variable.price.change', function(evt, parms) {
        var p = $scope.item._pricing;
        var changed = false;
        var t = parms.recurring_price + p.recurring_price;
        if (t != p.recurring_total) {
          changed = true;
          p.recurring_total = t;
        }
        t = parms.price + p.price
        if (t != p.price_total) {
          changed = true;
          p.price_total = parms.price + p.price;
        }
        if (!changed)
          return;
        var o = {
          price: p.price_total,
          recurring_price: p.recurring_total
        };
        $rootScope.$broadcast("guide.item.price.change", o);
        $http.post(spUtil.getURL('format_prices'), o).success(function(response) {
          var t = $scope.data.sc_cat_item;
          t = $scope.item;
          t.price = t.recurring_price = "";
          if (p.price_total)
            t.price = response.price;
          if (p.recurring_total)
            t.recurring_price = response.recurring_price + " " + p.rfd;
        })
      })
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spChoiceList.js */
angular.module('sn.$sp').directive('spChoiceList', function($timeout, urlTools, $http, spUtil) {
  return {
    template: '<select name="{{field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" sn-select-width="auto" ng-disabled="field.isReadonly()" ng-options="c.value as c.label for c in field.choices track by c.value"></select>',
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      'field': '=',
      'options': '=?',
      'getGlideForm': '&glideForm'
    },
    link: function(scope, element, attrs, ngModel) {
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
        var url = urlTools.getURL('choice_list_data', params);
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
        if (!hasSelectedValue && field.choices.length > 0) {
          g_form.setValue(field.name, field.choices[0].value, field.choices[0].label);
        }
        element.select2('val', ngModel.$viewValue);
        if (isOpen) {
          element.select2("close").select2("open");
        }
      }

      function refreshReferenceChoices() {
        var params = [];
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
        var url = urlTools.getURL('sp_ref_list_data', params);
        return $http.get(url).success(function(data) {
          field.choices = [];
          angular.forEach(data.items, function(item) {
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
/*! RESOURCE: /scripts/app.$sp/service.spCommunicator.js */
angular.module('sn.$sp').factory('spCommunicator', ['$rootScope', function($rootScope) {
  return {
    deregFuncMap: {},
    _getEventMap: function($scope) {
      var eventMap = this.deregFuncMap[$scope.$id];
      if (!eventMap)
        eventMap = this.deregFuncMap[$scope.$id] = {};
      return eventMap;
    },
    start: function(event, handler, $scope) {
      this.stop(event, $scope);
      var eventMap = this._getEventMap($scope);
      eventMap[event] = $rootScope.$on(event, function(event, data) {
        handler(data);
      });
    },
    stop: function(event, $scope) {
      var eventMap = this._getEventMap($scope);
      var deregFunc = eventMap[event];
      if (deregFunc)
        deregFunc();
    },
    fire: function(event, data) {
      if (event)
        $rootScope.$broadcast(event, data);
    }
  }
}]);
/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(dateUtils, $rootScope) {
  var dateFormat = g_user_date_format || dateUtils.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || dateUtils.SYS_TIME_FORMAT;
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
      '<input type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-disabled="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
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
      var includeTime = scope.snIncludeTime;
      var format;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: "X"
      }).on('dp.change', onDpChange);

      function onDpChange(e) {
        scope.formattedDate(e.date.format(format));
        if (!scope.$root.$$phase)
          scope.$apply();
      }

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
angular.module('sn.$sp').factory("spMacro", function() {
  "use strict";
  return function($scope, dataPrototype, inputMap, keepFields) {
    var gf = $scope.page.g_form;
    if (!gf) {
      console.warn('GlideForm not set for widget: ' + $scope.widget.name);
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
/*! RESOURCE: /scripts/app.$sp/service.spFileSelect.js */
angular.module('sn.$sp').factory('spFileSelect', ['$rootScope', '$upload', '$timeout', function($rootScope, $upload, $timeout) {
  'use strict';
  var imageFile = {};
  return {
    onFileSelect: function($files, field) {
      imageFile[field.name] = null;
      if ($files.length == 1 && window.FileReader && $files[0].type.indexOf('image') > -1) {
        field.image = null;
        imageFile[field.name] = $files[0];
        var fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile[field.name]);
        fileReader.onload = function(e) {
          field.value = e.target.result;
        }
        $upload.upload({
          url: 'upload',
          data: {},
          formDataAppender: function(formData, key, val) {
            if (angular.isArray(val))
              angular.forEach(val, function(v) {
                formData.append(key, v);
              });
            else
              formData.append(key, val);
          },
          file: imageFile[field.name],
          fileFormDataName: 'myFile'
        })
      }
    }
  }
}]);
/*! RESOURCE: /scripts/app.$sp/directive.spGlyph.js */
angular.module('sn.$sp').directive("spGlyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      char: "@",
    },
    template: '<span class="glyphicon glyphicon-{{char}}" />',
    link: function(scope) {}
  }
});
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
      '<input class="form-control" name="{{field.name}}" value="{{field.value}}" placeholder="{{field.placeholder}}" autocomplete="off" ng-disabled="snDisabled" />' +
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
angular.module('sn.$sp').directive('spReferenceField', function($rootScope, spUtil, $uibModal, $http) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_reference_field.xml',
    controller: function($scope) {
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
        showForm(data);
      };

      function showForm(data) {
        var url = spUtil.getWidgetURL("widget-form");
        var req = {
          method: 'POST',
          url: url,
          headers: {
            'Accept': 'application/json',
            'x-portal': $rootScope.portal_id
          },
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
        modalInstance.result.then(function() {}, function() {});
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
      snBlur: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      element[0].value = scope.field.value;
      element[0].id = scope.field.name + "_css_editor";
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
        if ("stagedValue" in scope.field) {
          scope.field.stagedValue = cm.getValue();
          ctrl.$setViewValue(scope.field.stagedValue);
        } else {
          scope.field.value = cm.getValue();
          ctrl.$setViewValue(scope.field.value);
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
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue && !cmi.hasFocus())
          cmi.getDoc().setValue(scope.field.value);
      });
      scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue)) {
          cmi.setOption('readOnly', newValue);
        }
      });
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
      options: "=ngModelOptions",
      snBlur: '&',
      snDisabled: '=?'
    },
    controller: function($scope) {
      $scope.options = $scope.options || {};
      var thisEditor = {};
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
      $scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue) && typeof thisEditor.setMode == "function")
          thisEditor.setMode(newValue ? 'readonly' : 'design');
      });
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
      snBlur: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      element[0].value = scope.field.value;
      element[0].id = scope.field.name + "_html_editor";
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
        if ("stagedValue" in scope.field) {
          scope.field.stagedValue = cm.getValue();
          ctrl.$setViewValue(scope.field.stagedValue);
        } else {
          scope.field.value = cm.getValue();
          ctrl.$setViewValue(scope.field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue && !cmi.hasFocus())
          cmi.getDoc().setValue(scope.field.value);
      });
      scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue)) {
          cmi.setOption('readOnly', newValue);
        }
      });
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
      snBlur: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      element[0].value = scope.field.value;
      element[0].id = scope.field.name + "_html_editor";
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
        if ("stagedValue" in scope.field) {
          scope.field.stagedValue = cm.getValue();
          ctrl.$setViewValue(scope.field.stagedValue);
        } else {
          scope.field.value = cm.getValue();
          ctrl.$setViewValue(scope.field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function(cm) {
        if ("stagedValue" in scope.field) {
          scope.field.stagedValue = cm.getValue();
          ctrl.$setViewValue(scope.field.stagedValue);
        } else {
          scope.field.value = cm.getValue();
          ctrl.$setViewValue(scope.field.value);
        }
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue && !cmi.hasFocus())
          cmi.getDoc().setValue(scope.field.value);
      });
      scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue)) {
          cmi.setOption('readOnly', newValue);
        }
      });
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
          snBlur: '&'
        },
        link: function(scope, element, attrs, ctrl) {
            element[0].value = scope.field.value;
            el