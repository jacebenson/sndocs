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
      $scope.tinyMCEOptions = {
        skin: 'lightgray',
        theme: 'modern',
        menubar: false,
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
      element[0].id = scope.field.name + "_javascript_editor";
      var cmi = initializeCodeMirror(element[0]);
      var server;
      spCodeEditorAutocomplete.getConfig('sp_widget', scope.field.name)
        .then(setupTernServer);
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue && !cmi.hasFocus())
          cmi.getDoc().setValue(scope.field.value);
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
      scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue)) {
          cmi.setOption('readOnly', newValue);
        }
      });
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
        if (scope.field.name === "client_script")
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
angular.module('sn.$sp').directive('snFieldListElement', function(getTemplateUrl, $http, urlTools, $timeout, $sanitize, i18n, $filter, nowServer) {
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
        formatResult: function(object, container, query) {
          var row = object.text;
          if (object.reference && !object.children)
            row += "<span style='float: right' class='expand fa fa-chevron-right' data-id='" + object.id + "' data-reference='" + object.reference + "'></span>";
          return row;
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
angular.module('sn.$sp').directive('spReferenceElement', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n, spIs, spUtil) {
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
    },
    template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" />',
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
      if (scope.field && scope.field.attributes && typeof scope.ed.attributes == 'undefined') {
        if (Array.isArray(scope.field.attributes)) {
          fieldAttributes = scope.field.attributes;
        } else {
          fieldAttributes = spUtil.parseAttributes(scope.field.attributes);
        }
      } else {
        fieldAttributes = spUtil.parseAttributes(scope.ed.attributes);
      }
      if (angular.isDefined(fieldAttributes['ref_ac_columns']))
        displayColumns = fieldAttributes['ref_ac_columns'];
      if (angular.isDefined(fieldAttributes['ref_auto_completer']))
        refAutoCompleter = fieldAttributes['ref_auto_completer'];
      else
        refAutoCompleter = "AJAXReferenceCompleter";
      if (angular.isDefined(fieldAttributes['ref_ac_order_by']))
        refOrderBy = fieldAttributes['ref_ac_order_by'];
      var s2Helpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return $sanitize(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          var url = urlTools.getURL('sp_ref_list_data');
          return $http.post(url, queryParams.data).then(function(response) {
            queryParams.success(response);
          });
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            if (isMultiple) {
              var items = [];
              var values = scope.field.value.split(',');
              var displayValues = scope.field.display_value_list;
              if (Array.isArray(scope.field.displayValue)) {
                displayValues.length = 0;
                for (var i in scope.field.displayValue)
                  displayValues[i] = scope.field.displayValue[i];
                scope.field.displayValue = displayValues.join(g_glide_list_separator);
              } else if (values.length == 1) {
                displayValues.length = 0;
                displayValues[0] = scope.field.displayValue;
              } else if (scope.field.displayValue != displayValues.join(g_glide_list_separator)) {
                displayValues.length = 0;
                var split = scope.field.displayValue.split(',');
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
                sys_id: scope.field.value,
                name: scope.field.displayValue
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
            if (scope.field['_cat_variable'] === true && ('price' in selectedItem || 'recurring_price' in selectedItem))
              setPrice(selectedItem.price, selectedItem.recurring_price);
            g_form.setValue(scope.field.name, value, displayValue);
          } else if (e.removed) {
            if (scope.field['_cat_variable'] === true)
              setPrice(0, 0);
            g_form.clearValue(scope.field.name);
          }
        }
      };
      var config = {
        width: scope.selectWidth,
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
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
          transport: s2Helpers.search
        },
        formatSelection: s2Helpers.formatSelection,
        formatResult: s2Helpers.formatResult,
        initSelection: s2Helpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null,
        multiple: isMultiple
      };
      if (isMultiple && scope.ed.reference == "sys_user") {
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
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
        }
        if (scope.snOptions.width) {
          config.width = scope.snOptions.width;
        }
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
          element.select2("val", scope.field.value.split(','));
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
        });
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
        scope.field.price = p;
        scope.field.recurring_price = rp;
      }
      g_form.$private.events.on("change", function(fieldName, oldValue, value) {
        if (fieldName == field.name) {
          if (value == "" && scope.field.display_value_list)
            scope.field.display_value_list.length = 0;
          element.select2("val", typeof value == 'string' ? value.split(',') : value);
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
/*! RESOURCE: /scripts/app.$sp/controller.spLogin.js */
angular.module("sn.$sp").controller("spLogin", function($scope, $http, $window, urlTools, $location, i18n) {
  $scope.login = function(username, password) {
    var url = urlTools.getURL('view_form.login');
    var pageId = $location.search().id || $scope.page.id;
    var isLoginPage = $scope.portal.login_page_dv == pageId;
    return $http({
      method: 'post',
      url: url,
      data: urlTools.encodeURIParameters({
        'sysparm_type': 'login',
        'ni.nolog.user_password': true,
        'remember_me': typeof remember_me != 'undefined' && !!remember_me ? true : false,
        'user_name': username,
        'user_password': password,
        'get_redirect_url': true,
        'sysparm_goto_url': isLoginPage ? null : $location.url()
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
});
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
angular.module("sn.$sp").controller("spPage", function($scope, $http, $location, $window, $timeout, spUtil, nowServer, snRecordWatcher, cabrillo, $rootScope, glideUserSession) {
  var _ = $window._;
  $scope.firstPage = true;
  $scope.page = {};
  $scope.page.title = "Loading...";
  $scope.theme = {};
  $scope.portal = {};
  $scope.sessions = {};
  $scope.status = "";
  $scope.isViewNative = cabrillo.isNative();
  $scope.openWindow = function(parms) {
    var jo = JSON.parse(parms);
    var left = window.screenX + window.innerWidth - 540;
    var top = window.screenY + 140;
    window.open(jo.url, jo.name, "left=" + left + ",top=" + top + "," + jo.specs);
  };
  $scope.parseJSON = function(str) {
    return JSON.parse(str);
  }
  $scope.getContainerClasses = function(container) {
    var classes = {};
    classes[container.width] = !container.bootstrap_alt;
    classes[container.container_class_name] = true;
    return classes;
  }
  var oid = $location.search().id;
  var oldPath = $location.path();
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
    $scope.$broadcast("$$uiNotification.dismiss");
    $scope.locationChanged = (oldUrl != newUrl);
    var s = $location.search();
    var p = $location.path();
    if (oldPath != p) {
      $window.location.href = $location.absUrl();
      return;
    }
    if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
      e.pageIsHandling = true;
      return;
    }
    if (p.indexOf(".do") > 0 && p.indexOf("sp.do") == -1) {
      var newUrl = $location.absUrl();
      newUrl = newUrl.substr(newUrl.search(/[^\/]+.do/));
      $window.location.href = "/" + newUrl;
      return;
    }
    if (!window.NOW.has_access && $scope.locationChanged) {
      $window.location.href = $location.absUrl();
      return;
    }
    oid = s.id;
    var t = getUrl();
    refreshPage(t);
  });

  function getUrl() {
    var currentParms = $location.search();
    var params = {};
    angular.extend(params, currentParms);
    params.time = new Date().getTime();
    params.portal_id = $scope.portal_id;
    params.request_uri = $location.url();
    return '/api/now/sp/page?' + $.param(params);
  }

  function loadPage(response) {
    $scope.firstPage = false;
    $scope.containers = _.filter(response.containers, {
      'subheader': false
    });
    $scope.subheaders = _.filter(response.containers, {
      'subheader': true
    });
    $scope.rectangles = response.rectangles;
    $scope.style = '';
    var p = response.page;
    var u = response.user;
    if (!isPublicOrUserLoggedIn(p, u)) {
      if ($scope.locationChanged) {
        $window.location.href = $location.absUrl();
        return;
      }
    }
    $rootScope.page = $scope.page = p;
    setCSS(p);
    if (response.portal.title)
      $window.document.title = (p.title) ? response.portal.title + ' - ' + p.title : response.portal.title;
    else
      $window.document.title = p.title;
    $timeout(function() {
      jQuery('section, .flex-item').scrollTop(0);
    });
    $rootScope.theme = $scope.theme = response.theme;
    var style = "";
    if ($scope.isNative)
      style = 'isNative';
    response.portal.logoutUrl = "/logout.do?sysparm_goto_url=/" + response.portal.url_suffix;
    $rootScope.portal = $scope.portal = response.portal;
    if (!$scope.user) {
      $rootScope.user = $scope.user = {};
      glideUserSession.loadCurrentUser().then(function(g_user) {
        $rootScope.g_user = g_user;
      });
    }
    angular.extend($scope.user, response.user);
    $scope.user.logged_in = $scope.user.user_name != 'guest';
    $scope.$broadcast('$$uiNotification', response.$$uiNotification);
    snRecordWatcher.init();
  }
  var pageLoaded = false;
  $scope.$on('sp.page.reload', function() {
    var t = getUrl();
    refreshPage(t);
  });

  function refreshPage(dataURL) {
    if (window.pageData && !pageLoaded) {
      pageLoaded = true;
      loadPage(pageData);
    } else {
      $http.get(dataURL, {
        headers: spUtil.getHeaders()
      }).success(function(response) {
        loadPage(response.result);
      });
    }
  }

  function isPublicOrUserLoggedIn(page, user) {
    if (page.public)
      return true;
    if (user.user_name == "guest")
      return false;
    return true;
  }

  function setCSS(page) {
    jQuery("style[data-page-id='" + page.sys_id + "']").remove();
    if (page.css) {
      var buf = [
        '<style type="text/css" data-page-id="' + page.sys_id + '" data-page-title="' + page.title + '">',
        page.css,
        '</style>'
      ];
      jQuery(jQuery(buf.join('\n'))).appendTo('head');
    }
  }
  $(window).keydown(onKeyDown);

  function onKeyDown(e) {
    if (e.keyCode != 83)
      return;
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
      $rootScope.$broadcast("$sp.save", e);
    }
  }
  $scope.$on('$destroy', function() {
    $(window).off("keydown", onKeyDown);
  })
});;
/*! RESOURCE: /scripts/app.$sp/service.spPreference.js */
angular.module('sn.$sp').factory('spPreference', function(nowServer, $http) {
  "use strict";
  return {
    set: function(name, value) {
      if (value !== null && typeof value === 'object')
        value = JSON.stringify(value);
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: "set_preference",
        name: name,
        value: value
      }
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + encodeURIComponent(n[t])
      })
      $http.post(dataURL);
    },
    get: function(name, callback) {
      if (name == null)
        return null;
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: "get_preference",
        name: name
      }
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + encodeURIComponent(n[t])
      })
      $http.post(dataURL).then(function(response) {
        var answer = response.data.value;
        if (callback && typeof callback === "function")
          callback(answer);
        else
          console.warn("spPreference.get synchronous use not supported in Service Portal (preference: " + name + "), use callback");
      })
    }
  }
});
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
    if (scope.widget.dependencies) {
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
      $scope.contextMenu = function(event) {
          if (!event.ctrlKey || !$rootScope.user.can_debug)
            return [];
          var w = $scope.rectangle.widget;
          menu[0] = spUtil.format("'{widget}'