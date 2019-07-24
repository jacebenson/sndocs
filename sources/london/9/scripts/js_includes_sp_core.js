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
  'sp.pageData',
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
    announcementApi: '/api/now/sp/announcement',
    logoutUrl: '/logout.do?sysparm_goto_url=/{url_suffix}',
    s: 83,
    e: {
      notification: '$$uiNotification',
      announcement: '$$:sp:announcement'
    },
    SYS_DATE_FORMAT: 'yyyy-MM-dd',
    SYS_TIME_FORMAT: 'HH:mm:ss'
  };
  angular.module('sn.$sp').constant('spConf', config);
}());;
/*! RESOURCE: /scripts/app.$sp/service_catalog/constant.spSCConf.js */
(function() {
  var scConf = {
    MULTI_ROW_TYPE: "sc_multi_row",
    CONTAINER_START: "container_start",
    CHECKBOX: "boolean",
    CHECKBOX_MANDATORY: "boolean_confirm",
    CHECKBOX_CONTAINER: "checkbox_container",
    LABEL: "label",
    MASKED: "masked",
    _CAT_VARIABLE: "_cat_variable"
  };
  angular.module('sn.$sp').constant('spSCConf', scConf);
}());;
/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular.module('sn.$sp').directive('spFormField', function($location, glideFormFieldFactory, $timeout, spLabelHelper, spAriaUtil, i18n, spModelUtil, $ocLazyLoad, $sce) {
  'use strict';

  function getDeps(fieldType) {
    var deps = {
      codeMirror: [
        '/styles/sp_codemirror_includes.css',
        '/scripts/libs/sp_codemirror_includes.js'
      ],
      spectrum: [
        '/styles/spectrum.css',
        '/scripts/lib/spectrum.js'
      ]
    };
    deps.momentLocale = function() {
      var lookup = {
        pb: "pt-br",
        zh: "zh-cn",
        cs: "cs",
        nl: "nl",
        et: "et",
        fi: "fi",
        fr: "fr",
        fq: "fr-ca",
        de: "de",
        he: "he",
        hu: "hu",
        it: "it",
        ja: "ja",
        ko: "ko",
        pl: "pl",
        pt: "pt",
        ru: "ru",
        es: "es",
        th: "th",
        zt: "zh-cn",
        tr: "tr"
      };
      if (lookup[g_lang]) {
        return ['/scripts/libs/moment/locale/' + lookup[g_lang] + '.js'];
      }
      return;
    };
    return {
      css: deps.codeMirror,
      xml: deps.codeMirror,
      json: deps.codeMirror,
      script: deps.codeMirror,
      properties: deps.codeMirror,
      script_server: deps.codeMirror,
      html_template: deps.codeMirror,
      color: deps.spectrum,
      glide_date: deps.momentLocale(),
      glide_date_time: deps.momentLocale()
    } [fieldType];
  }
  return {
    restrict: 'E',
    templateUrl: 'sp_form_field.xml',
    replace: true,
    controllerAs: 'c',
    scope: {
      field: '=',
      formModel: '=',
      getGlideForm: '&glideForm',
      setDefaultValue: '&defaultValueSetter'
    },
    controller: function($element, $scope) {
      var c = this;
      var field = $scope.field;
      if (!field)
        throw "spFormField used without providing a field.";
      c.depsLoaded = false;
      c.getAttachmentGuid = function() {
        if ($scope.formModel) {
          return $scope.formModel._attachmentGUID;
        }
        return "";
      }
      var deps = getDeps(field.type);
      if (deps && deps.length) {
        $ocLazyLoad.load(deps).then(function() {
          c.depsLoaded = true;
        });
      } else {
        c.depsLoaded = true;
      }
      if (typeof field.isMandatory === "undefined")
        spModelUtil.extendField(field);
      var _setDefaultValue = $scope.setDefaultValue;
      $scope.setDefaultValue = function(fieldName, fieldInternalValue, fieldDisplayValue) {
        _setDefaultValue({
          fieldName: fieldName,
          fieldInternalValue: fieldInternalValue,
          fieldDisplayValue: fieldDisplayValue
        });
      };
      $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
        if (fieldName == field.name)
          field.stagedValue = newValue;
      });
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
      $scope.formatNumber = function() {
        if (!field.noFormat)
          field.stagedValue = formatNumber(field.stagedValue);
      };
      $scope.onImageUpload = function(thumbnail, sys_id) {
        $scope.getGlideForm().setValue(field.name, sys_id, thumbnail);
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
        return field.type != "boolean" && field.type != "boolean_confirm" && field.type != "glide_duration";
      };
    },
    link: function(scope, element, attr) {
      scope.$applyAsync(function() {
        var inputField;
        switch (scope.field.type) {
          case "field_list":
          case "glide_list":
          case "reference":
          case "field_name":
          case "table_name":
          case "masked":
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
        $(function() {
          $('[tooltip-right]').tooltip({
            'delay': {
              show: 500
            },
            'placement': 'right',
            'trigger': 'hover'
          });
          $('[tooltip-top]').tooltip({
            'delay': {
              show: 500
            },
            'placement': 'top',
            'trigger': 'focus'
          });
        });
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
      scope.getReferenceLabelContents = function(field) {
        return spLabelHelper.getReferenceLabelContents(field);
      }
      scope.accessible = spAriaUtil.isAccessibilityEnabled();
      scope.enhancePriceLabels = function(field) {
        return (field._pricing && field._pricing.enhance_price_labels === true);
      }
      scope.getCheckBoxPrice = function(field) {
        return spLabelHelper.getPriceLabelForCheckbox(field);
      }
      scope.setPriceLabelForChoice = function(field) {
        if (angular.isDefined(field) && field._cat_variable === true) {
          if (!scope.enhancePriceLabels(field))
            return;
          var labelArrayPromise = spLabelHelper.getPriceLabelForChoices(field, scope.formModel.recurring_price_frequency);
          labelArrayPromise.then(
            function(labelArray) {
              if (!labelArray || field.choices.length != labelArray.length)
                return;
              for (var i = 0; i < field.choices.length; i++) {
                field.choices[i].priceLabel = labelArray[i];
              }
            },
            function(errorMessage) {
              console.log(errorMessage);
            });
        }
      }
      scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      }
      if (scope.field.type == "integer" || scope.field.type == "decimal") {
        if (!scope.field.noFormat) {
          scope.field.stagedValue = scope.field.displayValue;
        }
        return;
      }
      if (scope.field._cat_variable && scope.field.type == "choice" && scope.field._pricing && scope.field._pricing.enhance_price_labels === true) {
        scope.$on('sp.sc.refresh_label_choices', function(event, field) {
          if (scope.field.name == field.name) {
            event.stopPropagation();
            scope.setPriceLabelForChoice(field);
          }
        });
      }
      var fieldChangeHandlers = [{
          types: ['choice', 'multiple_choice'],
          handler: function($event, payload) {
            scope.setPriceLabelForChoice(payload.field);
          }
        },
        {
          types: ['boolean', 'boolean_confirm'],
          handler: function($event, payload) {
            var newValue = (payload.newValue.toString() === 'true').toString();
            if (newValue !== payload.oldValue) {
              scope.field.value = newValue;
            }
          }
        }
      ];
      fieldChangeHandlers.some(function(fch) {
        if (fch.types.indexOf(scope.field.type) > -1) {
          scope.$on('field.change.' + scope.field.name, fch.handler);
          return true;
        }
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spLabelHelper.js */
angular.module('sn.$sp').factory('spLabelHelper', function($q, $http, i18n, spUtil, glideFormFieldFactory) {
  'use strict'

  function getReferenceLabelContents(field) {
    if (!field)
      return;
    var label = "";
    if (glideFormFieldFactory.isMandatory(field) && (field.mandatory_filled && !field.mandatory_filled())) {
      label = i18n.getMessage("Required") + " - ";
    }
    label = label + field.label;
    if (field.displayValue) {
      label = label + ", " + field.displayValue
    }
    return label;
  }

  function getPriceLabelForCheckbox(field) {
    if (!field || !field._pricing)
      return;
    if (!(field._pricing.price_if_checked || field._pricing.rec_price_if_checked))
      return '';
    var label = " [ ";
    if (field.value == "true") {
      if (field._pricing.price_if_checked && field._pricing.rec_price_if_checked)
        label += i18n.getMessage("has added {0} | has added {1}").withValues([field._pricing.price_if_checked_display, field._pricing.rec_price_if_checked_display]);
      else if (field._pricing.price_if_checked || field._pricing.rec_price_if_checked)
        label += i18n.getMessage("has added {0}").withValues([field._pricing.price_if_checked_display || field._pricing.rec_price_if_checked_display]);
    } else {
      if (field._pricing.price_if_checked && field._pricing.rec_price_if_checked)
        label += i18n.getMessage("will add {0} | will add {1}").withValues([field._pricing.price_if_checked_display, field._pricing.rec_price_if_checked_display]);
      else if (field._pricing.price_if_checked || field._pricing.rec_price_if_checked)
        label += i18n.getMessage("will add {0}").withValues([field._pricing.price_if_checked_display || field._pricing.rec_price_if_checked_display]);
    }
    label += " ]";
    return label;
  }

  function preparePriceMap(field) {
    var priceMap = {};
    var selectedPrice = field.price || 0;
    var selectedRecurringPrice = field.recurring_price || 0;
    for (var i = 0; i < field.choices.length; i++) {
      var choicePrice = 0;
      var choiceRecurringPrice = 0;
      if (field.choices[i].price) {
        choicePrice = field.choices[i].price;
      }
      if (field.choices[i].recurring_price) {
        choiceRecurringPrice = field.choices[i].recurring_price;
      }
      var adjustedPrice = selectedPrice - choicePrice;
      var adjustedRecurringPrice = selectedRecurringPrice - choiceRecurringPrice;
      var adjustedPriceAbs = Math.abs(selectedPrice - choicePrice);
      var adjustedRecurringPriceAbs = Math.abs(selectedRecurringPrice - choiceRecurringPrice);
      var key1 = adjustedPriceAbs + '';
      var key2 = adjustedRecurringPriceAbs + '';
      if (!priceMap.hasOwnProperty(key1)) {
        priceMap[key1] = adjustedPriceAbs;
      }
      if (!priceMap.hasOwnProperty(key2)) {
        priceMap[key2] = adjustedRecurringPriceAbs;
      }
    }
    return priceMap;
  }

  function getPriceLabelArray(field, recurringPriceFreq, formattedPriceMap) {
    var priceLableArray = [];
    var selectedPrice = field.price || 0;
    var selectedRecurringPrice = field.recurring_price || 0;
    for (var i = 0; i < field.choices.length; i++) {
      var choicePrice = 0;
      var choiceRecurringPrice = 0;
      if (field.choices[i].price) {
        choicePrice = field.choices[i].price;
      }
      if (field.choices[i].recurring_price) {
        choiceRecurringPrice = field.choices[i].recurring_price;
      }
      var label = " [ ";
      var message;
      var formattedValues;
      var adjustedPrice = selectedPrice - choicePrice;
      var adjustedRecurringPrice = selectedRecurringPrice - choiceRecurringPrice;
      var adjustedPriceAbs = Math.abs(selectedPrice - choicePrice);
      var adjustedRecurringPriceAbs = Math.abs(selectedRecurringPrice - choiceRecurringPrice);
      var key1 = adjustedPriceAbs + '';
      var key2 = adjustedRecurringPriceAbs + '';
      if (adjustedPrice != 0 && adjustedRecurringPrice != 0 && recurringPriceFreq) {
        message = (adjustedPrice > 0 ? "subtract" : "add") + " {0} | " + (adjustedRecurringPrice > 0 ? "subtract" : "add") + " {1}";
        formattedValues = [(formattedPriceMap[key1] ? formattedPriceMap[key1] : ''), (formattedPriceMap[key2] ? formattedPriceMap[key2] : '')];
        label += i18n.getMessage(message).withValues(formattedValues) + " " + recurringPriceFreq;
      } else if (adjustedPrice != 0) {
        message = (adjustedPrice > 0 ? "subtract" : "add") + " {0}";
        formattedValues = [(formattedPriceMap[key1] ? formattedPriceMap[key1] : '')];
        label += i18n.getMessage(message).withValues(formattedValues);
      } else if (adjustedRecurringPrice != 0 && recurringPriceFreq) {
        message = (adjustedRecurringPrice > 0 ? "subtract" : "add") + " {0}";
        formattedValues = [(formattedPriceMap[key2] ? formattedPriceMap[key2] : '')];
        label += i18n.getMessage(message).withValues(formattedValues) + " " + recurringPriceFreq;
      } else {
        priceLableArray.push("");
        continue;
      }
      label += " ]";
      priceLableArray.push(label);
    }
    return priceLableArray;
  }

  function getPriceLabelForChoices(field, recurringPriceFreq) {
    return $http.post(spUtil.getURL('format_prices'), preparePriceMap(field))
      .then(function(response) {
        return response.data
      })
      .then(function(data) {
        return getPriceLabelArray(field, recurringPriceFreq, data)
      });
  }
  return {
    getReferenceLabelContents: getReferenceLabelContents,
    getPriceLabelForCheckbox: getPriceLabelForCheckbox,
    getPriceLabelForChoices: getPriceLabelForChoices
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spUtil.js */
angular.module('sn.$sp').factory('spUtil', function($rootScope, $http, $location, snRecordWatcher, $q, spPreference, spConf, $window) {
  "use strict";
  var spUtil = {
    isMobile: function() {
      if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)) {
        return true;
      } else {
        return false;
      }
    },
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
        'x-portal': $rootScope.portal_id,
        'X-UserToken': $window.g_ck
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
    clearMessages: function() {
      $rootScope.$broadcast("$$uiNotification.dismiss");
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
/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular.module('sn.$sp').factory('spScUtil', function($http, $q, $log, spSCConf, $httpParamSerializer) {
  "use strict";
  var baseUrl = "/api/sn_sc/v1/servicecatalog/";

  function addAdditionalParms(req, parms) {
    for (var key in parms)
      req[key] = parms[key];
  }

  function getCart() {
    return $http.get(baseUrl + "cart");
  }

  function submitProducer(producerId, variables, newRecordID, additionalParms) {
    var request = {
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
  }

  function submitStdChgProducer(producerId, twoStep, currentVersion, newRecordID) {
    var promise;
    if (twoStep) {
      var urlParameters = {};
      urlParameters["sys_id"] = '-1';
      urlParameters["id"] = 'form';
      urlParameters["table"] = 'change_request';
      urlParameters["query"] = 'type=standard^std_change_producer_version=' + currentVersion;
      var completeUrl = 'sp?' + $httpParamSerializer(urlParameters);
      var resp = {};
      resp['redirect_portal_url'] = completeUrl;
      resp['redirect_url'] = completeUrl;
      resp['table'] = 'change_request';
      promise = $q.resolve({
        data: {
          result: resp
        }
      });
    } else
      promise = this.submitProducer(producerId, {}, newRecordID, null);
    return promise;
  }

  function orderNow(itemId, quantity, variables, newRecordID, additionalParms) {
    var request = {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addToCart(itemId, quantity, variables, newRecordID) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function updateCart(itemId, quantity, variables) {
    return $http.put(baseUrl + "cart/" + itemId, {
      'sysparm_quantity': quantity,
      'variables': variables,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function addToWishlist(itemId, quantity, variables, newRecordID) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_wishlist", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'sysparm_item_guid': newRecordID
    }).then(null, onFail);
  }

  function orderWishlistedItem(itemId, quantity, variables, savedItemId, additionalParms) {
    var request = {
      'sysparm_quantity': quantity,
      'variables': variables,
      'saved_item_id': savedItemId,
      'get_portal_messages': 'true',
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseUrl + "items/" + itemId + "/order_now", request).then(null, onFail);
  }

  function addWishlistedItemToCart(itemId, quantity, variables, savedItemId) {
    return $http.post(baseUrl + "items/" + itemId + "/add_to_cart", {
      'sysparm_quantity': quantity,
      'variables': variables,
      'saved_item_id': savedItemId,
      sysparm_no_validation: 'true'
    }).then(null, onFail);
  }

  function submitWishlistedProducer(producerId, variables, savedItemId, additionalParms) {
    var request = {
      'variables': variables,
      'sysparm_item_guid': savedItemId,
      'get_portal_messages': 'true',
      'saved_item_id': savedItemId,
      sysparm_no_validation: 'true'
    };
    addAdditionalParms(request, additionalParms);
    return $http.post(baseUrl + "items/" + producerId + "/submit_producer", request).then(null, onFail);
  }

  function getDisplayValueForMultiRowSet(multiRowSetId, value) {
    var params = {};
    params['sysparm_value'] = value;
    var url = "/api/sn_sc/servicecatalog/variables/" + multiRowSetId + "/display_value";
    return $http.post(url, params).then(null, onFail);
  }

  function onFail(response) {
    $log.info("REST Failure");
    $log.info(response);
    return $q.reject(response);
  }

  function isCatalogVariable(field) {
    return ('' + field[spSCConf._CAT_VARIABLE]) == 'true';
  }
  return {
    getCart: getCart,
    submitProducer: submitProducer,
    submitStdChgProducer: submitStdChgProducer,
    orderNow: orderNow,
    addToCart: addToCart,
    updateCart: updateCart,
    addToWishlist: addToWishlist,
    orderWishlistedItem: orderWishlistedItem,
    addWishlistedItemToCart: addWishlistedItemToCart,
    submitWishlistedProducer: submitWishlistedProducer,
    getDisplayValueForMultiRowSet: getDisplayValueForMultiRowSet,
    isCatalogVariable: isCatalogVariable
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spCatItem.js */
angular.module("sn.$sp").directive('spCatItem', function($http, spUtil) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.item = scope.$eval(attrs.item);
    },
    controller: function($scope) {
      var c = this;
      c.priceHasChanged = function(p, parms) {
        if (parms.force_update)
          return true;
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
      c.getItemId = function() {
        return $scope.item.sys_id;
      };
      c.formatPrice = function(data) {
        var response = data.answer;
        var t = $scope.item;
        t.price = t.recurring_price = "";
        t.price = response.price;
        t.price_subtotal = response.price_subtotal;
        t.recurring_price = response.recurring_price;
        t.recurring_price_subtotal = response.recurring_price_subtotal;
      };
      var g_form;
      $scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
        if (gFormInstance.getSysId() != c.getItemId())
          return;
        g_form = gFormInstance;
      });

      function getCalculatedPrices() {
        if (!g_form)
          return;
        var o = {};
        o.sys_id = g_form.$private.options('itemSysId');
        o.sysparm_id = o.sys_id;
        o.variable_sequence1 = g_form.$private.options('getFieldSequence')();
        var getFieldParams = g_form.$private.options('getFieldParams');
        if (getFieldParams) {
          angular.extend(o, getFieldParams());
        }
        var transform = function(data) {
          for (var key in data) {
            if (key.indexOf("IO") == 0 && Array.isArray(data[key]))
              data[key] = JSON.stringify(data[key]);
          }
          return $.param(data);
        }
        var config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          transformRequest: transform
        };
        $http.post(spUtil.getURL('update_price'), o, config).success(c.formatPrice);
      }
      $scope.$on('variable.price.change', function(evt, parms) {
        var p = $scope.item._pricing;
        if (c.priceHasChanged(p, parms)) {
          getCalculatedPrices();
        }
      });
    }
  }
});;
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
          scope.setDefaultValue({
            fieldName: field.name,
            fieldInternalValue: field.choices[0].value,
            fieldDisplayValue: field.choices[0].label
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
      selectValueOrNone();

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
      scope.$evalAsync(function() {
        element.parent().find(".select2-focusser").removeAttr("aria-labelledby");
        element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
      });

      function getAriaLabel() {
        var label = "";
        if (field.isMandatory()) {
          label = i18n.getMessage("Required") + " - ";
        }
        label += field.label;
        if (field.displayValue || field.value) {
          label += (" " + (field.displayValue || field.value));
        }
        return label;
      }

      function getTitle() {
        return field.label + " " + field.hint;
      }
      element.parent().find(".select2-choice").attr("aria-hidden", true);
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
/*! RESOURCE: /scripts/app.$sp/directive.spRadioOption.js */
angular.module('sn.$sp').directive('spRadioOption', function(spUtil, $http) {
  var REF_QUAL_ELEMENTS = "ref_qual_elements";

  function isRefQualElement(field, fieldName) {
    var refQualElements = [];
    if (field.attributes && field.attributes.indexOf(REF_QUAL_ELEMENTS) > -1) {
      var attributes = spUtil.parseAttributes(field.attributes);
      refQualElements = attributes[REF_QUAL_ELEMENTS].split(',');
    }
    return field.reference_qual.indexOf(fieldName) != -1 || refQualElements.indexOf(fieldName) != -1;
  }
  return {
    template: '<ng-include src="getTemplateUrl()" />',
    restrict: 'E',
    scope: {
      'field': '=',
      'getGlideForm': '&glideForm'
    },
    link: function(scope, element, attrs) {
      var g_form = scope.getGlideForm();
      var field = scope.field;
      scope.getTemplateUrl = function() {
        return field.choice_direction === 'across' ? 'sp_element_radio_across.xml' : 'sp_element_radio_down.xml';
      }
      scope.fieldValue = function(newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          g_form.setValue(field.name, newValue, displayValue);
        }
        return field.value;
      };
      g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
        if (fieldName == field.name)
          return;
        else if (typeof field.variable_name !== 'undefined' && field.reference_qual && isRefQualElement(field, fieldName))
          refreshReferenceChoices();
      });

      function selectValueOrNone() {
        var hasSelectedValue = false;
        angular.forEach(field.choices, function(c) {
          if (field.value == c.value)
            hasSelectedValue = true;
        });
        if (!hasSelectedValue && field.choices.length > 0)
          g_form.setValue(field.name, field.choices[0].value, field.choices[0].label);
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
        console.log("Posting from directive");
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
angular.module('sn.$sp').directive('spDatePicker', function(spConf, $rootScope, $document, spAriaUtil, i18n, spDatePickerUtil, select2EventBroker, $window) {
  var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
  var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;
  if ($rootScope.user && $rootScope.user.date_time_format)
    dateTimeFormat = $rootScope.user.date_time_format;
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': field.isInvalid || field.isInvalidDateFormat}" style="width: 100%;">' +
      '<input id="sp_formfield_{{::field.name}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{g_accessibility ? translations[\'Enter date in format\']: \'\'}} {{g_accessibility ? format : \'\'}}" tooltip-top="true" tooltip-enable="{{g_accessibility}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button" tabindex="-1" aria-hidden="true">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '<span ng-if="field.isInvalidDateFormat && !field.isInvalid" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Enter date in format\']}} {{format}}</span>' +
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
      var includeTime = scope.snIncludeTime;
      var format;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      scope.format = format;
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: scope.format,
        locale: g_lang,
        language: g_lang
      }).on('dp.change', onDpChange);
      element.find('.form-control').on('blur', function(e) {
        var value = e.target.value;
        setFieldValue('newValue', '');
        setFieldValue('newValue', value);
      }).on('keyup', function(e) {
        if (e.keyCode === 13) {
          var value = e.target.value;
          setFieldValue('newValue', '');
          setFieldValue('newValue', value);
        }
      });

      function validate(formattedDate) {
        scope.field.isInvalidDateFormat = false;
        return spDatePickerUtil.validate(dp, format, formattedDate, function(error) {
          if (error) {
            spAriaUtil.sendLiveMessage(scope.translations["Entered date not valid. Enter date in format"] + " " + format);
            scope.field.isInvalidDateFormat = true;
          }
        });
      }

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
      dp.on('dp.hide', function(e) {
        if (ngModel) {
          setFieldValue('newValue', scope.field.stagedValue);
        }
      })

      function onDpChange(e) {
        var translatedDate = enableDateTranslation ? e.date.format(format) : e.date.locale("en").format(format);
        scope.formattedDate(translatedDate);
        if (!scope.$root.$$phase)
          scope.$apply();
        if (!scope.snIncludeTime)
          dp.data('DateTimePicker').hide();
      }

      function setFieldValue(key, value) {
        if (scope.snChange) {
          var change = {};
          change[key] = value;
          scope.snChange(change);
        }
      }
      if (ngModel) {
        ngModel.$parsers.push(validate);
        ngModel.$render = function() {
          validate(ngModel.$viewValue);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            ngModel.$setViewValue(formattedValue);
            setFieldValue('stagedValue', formattedValue);
          }
          return ngModel.$viewValue;
        };
      } else {
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            scope.field.value = validate(formattedValue);
            setFieldValue('newValue', formattedValue);
          }
          return scope.field.value;
        };
        scope.$watch('field.value', function(newValue, oldValue) {
          if (newValue != oldValue)
            validate(newValue);
        });
      }
      var select2Unsubscribe = select2EventBroker.subscribeSelect2Opening(function() {
        if ($(dp.data('DateTimePicker').widget[0]).is(":visible"))
          dp.data('DateTimePicker').hide();
      })
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
        unBindTouchClose();
        select2Unsubscribe();
      });
      scope.translations = [];
      i18n.getMessages(["Enter date in format", "Use format", "Entered date not valid. Enter date in format"], function(msgs) {
        scope.translations = msgs;
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spDatePickerUtil.js */
angular.module('sn.$sp').factory('spDatePickerUtil', function(spAriaUtil, $window) {
    var service = {
      isValidDate: isValidDate,
      validate: validate
    };
    var enableDateTranslation = $window.NOW.sp.enableDateTranslation;

    function isValidDate(value, format) {
      if (value === '')
        return true;
      if (!enableDateTranslation) {
        moment.locale("en");
      }
      return moment(value, format, true).isValid();
    }

    function validate(dp, format, formattedDate, cb) {
      if (formattedDate == null || formattedDate == '') {
        dp.data('DateTimePicker').setValue(new Date());
        return '';
      }
      if (service.isValidDate(formattedDate, format)) {
        if (enableDateTranslation) {
          formattedDate = moment(formattedDate, format).format(format);
        } else {
          formattedDate = formattedDate = moment(formattedDate, format).locale("en").format(format);
        }
        dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        cb()
      } else if (service.isValidDate(formattedDate, moment.ISO_8601)) {
        var date = moment.utc(formattedDate).clone().local();
        dp.data('DateTimePicker').setDate(date);
        if (enableDateTranslation) {
          formattedDate = date.format(format);
        } else {
          formattedDate = date.locale("en").format(format);
        }
        cb()
      } else {
        cb(true);
      }
      return formattedDate;
    }
    return service;
  })
  .run(function() {
    if (typeof moment !== "undefined" && typeof moment.tz !== "undefined")
      moment.tz.setDefault(g_tz);
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
      '<li ng-repeat="mi in items" style="min-width: 20em;" ng-class="{\'dropdown-submenu\': mi.type == \'menu\', \'dropdown-menu-line\':$index < items.length - 1}" ng-include="getURL()" role="presentation">' +
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
/*! RESOURCE: /scripts/app.$sp/factory.spModelUtil.js */
angular.module('sn.$sp').factory('spModelUtil', function(glideFormFieldFactory) {
  'use strict';

  function extendField(field) {
    var glideField = glideFormFieldFactory.create(field);
    field.isReadonly = glideField.isReadonly;
    field.isMandatory = glideField.isMandatory;
    field.isVisible = glideField.isVisible;
    field.mandatory_filled = function() {
      return glideFormFieldFactory.hasValue(field, field.stagedValue);
    }
    field.stagedValue = field.value;
  }

  function extendFields(fields) {
    for (var f in fields) {
      extendField(fields[f]);
    }
  }
  return {
    extendField: extendField,
    extendFields: extendFields
  };
});;
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
      '<button ng-show="!disabled()" class="btn btn-default" data-iconset="fontawesome" data-icon="fa-{{field.value}}" role="iconpicker" id="sp_formfield_{{::field.name}}"/>' +
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
        if (scope.field) {
          button.iconpicker('setIcon', 'fa-' + scope.field.value);
        }
      }
      scope.$watch(function() {
        return scope.field ? scope.field.value : null;
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
angular.module('sn.$sp').directive('spColorPicker', function() {
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
      scope.$evalAsync(function() {
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
angular.module('sn.$sp').directive('spCssEditor', function($timeout) {
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
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = "sp_formfield_" + field.name;
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
      });
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spTinymceEditor.js */
angular.module('sn.$sp').directive('spTinymceEditor', function(getTemplateUrl, snAttachmentHandler, $timeout, i18n, spAriaUtil, $rootScope) {
  return {
    templateUrl: getTemplateUrl('sp_tinymce_editor.xml'),
    restrict: 'E',
    replace: true,
    scope: {
      model: '=ngModel',
      field: '=?',
      options: '=ngModelOptions',
      snBlur: '&',
      snDisabled: '=?',
      getGlideForm: '&glideForm',
      ngChange: '&',
      attachmentGuid: '=?',
      recordTableName: '=?',
      textId: '@?'
    },
    controller: function($scope, $element, $attrs) {
      $scope.accessibilityEnabled = spAriaUtil.g_accessibility === "true";
      $scope.onChangeModel = function() {
        $timeout(function() {
          $scope.ngChange();
        });
      }
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
      if ($scope.textId) {
        $scope.textareaId = $scope.textId.replace('.', '-');
      } else {
        $scope.textareaId = 'ui-tinymce-' + (new Date().valueOf());
      }
      var langs = 'cs,de,en,es,fi,fr,he,it,ja,ko,nl,pl,pt,ru,zh,zt';
      var userLanguage = g_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = g_system_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = 'en';
      var setMode = function() {
        var isReadOnly = g_form.isReadOnly(field.name);
        thisEditor.setMode(isReadOnly ? 'readonly' : 'design');
        var body = thisEditor.getDoc().body;
        body.style.backgroundColor = isReadOnly ? "#eeeeee" : "#fff";
        var doc = thisEditor.getDoc();
        doc.documentElement.style.height = '90%';
        doc.body.style.height = '90%';
        $timeout(function(i18n) {
          body.setAttribute('contenteditable', !isReadOnly);
          body.setAttribute('aria-label', $scope.field.label);
        }, 1000);
      }
      var updateMode = function() {
        if (typeof thisEditor.setMode == "function") {
          if (thisEditor.getContainer()) {
            setMode();
          } else {
            thisEditor.on('init', function() {
              setMode();
            });
          }
        } else {
          $timeout(updateMode, 10);
        }
      }
      $scope.tinyMCEOptions = {
        skin: 'lightgray',
        theme: 'modern',
        menubar: false,
        language: userLanguage,
        statusbar: false,
        plugins: "codesample code link paste",
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link unlink | image | codesample code',
        paste_data_images: true,
        browser_spellcheck: true,
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
          ed.on('ProgressState', function(e) {
            $rootScope.$emit('$sp.html.editor.progress', e);
          });
        },
        images_upload_handler: function(blobInfo, success, failure) {
          var blob = blobInfo.blob();
          var data = {};
          data.sysparm_table = null;
          data.sysparm_sys_id = null;
          if ($scope.getGlideForm()) {
            data.sysparm_table = $scope.getGlideForm().getTableName();
            data.sysparm_sys_id = $scope.getGlideForm().getSysId();
            if ($scope.getGlideForm().getSysId() == -1)
              data.sysparm_sys_id = $scope.attachmentGuid;
            if (data.sysparm_table === null) {
              data.sysparm_table = $scope.getGlideForm().recordTableName;
            }
          }
          if (data.sysparm_table === null && $scope.recordTableName) {
            data.sysparm_table = $scope.recordTableName;
          }
          if (data.sysparm_sys_id === null && $scope.attachmentGuid) {
            data.sysparm_sys_id = $scope.attachmentGuid;
          }
          if (data.sysparm_table && data.sysparm_sys_id) {
            thisEditor.setProgressState(true);
            snAttachmentHandler.create(data.sysparm_table, data.sysparm_sys_id).uploadAttachment(blob, null, {}).then(function(response) {
              success("/sys_attachment.do?sys_id=" + response.sys_id);
            }).then(function() {
              $scope.$applyAsync(function() {
                $scope.field.value = $scope.field.stagedValue = tinyMCE.activeEditor.getContent({
                  format: 'raw'
                });
                thisEditor.setProgressState(false);
              });
            });
          } else {
            console.log("GlideForm or table and record id is not provided");
          }
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
          updateMode();
        });
        updateMode();
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
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spHTMLEditor.js */
angular.module('sn.$sp').directive('spHtmlEditor', function($timeout) {
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
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = "sp_formfield_" + field.name;
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
angular.module('sn.$sp').directive('spCodeMirror', function($timeout) {
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
      getGlideForm: '&glideForm',
      id: '@?'
    },
    link: function(scope, element, attrs, ctrl) {
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = scope.id;
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
      });
    }
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spScriptEditor.js */
angular.module('sn.$sp').directive('spScriptEditor', function($rootScope, $http, spCodeEditorAutocomplete, defaultJSAutocomplete, $timeout) {
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
      getGlideForm: '&glideForm',
      id: '@?'
    },
    link: function(scope, element, attrs, ctrl) {
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = scope.id;
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
      });
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
angular.module('sn.$sp').directive('spEditableField', function(glideFormFactory, $http, spUtil, spModelUtil, $timeout) {
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
        spModelUtil.extendField($scope.fieldModel);
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
              spUtil.clearMessages();
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
      var returnFocus = true;
      scope.closePopover = function() {
        if (scope.shadowModel.popoverIsOpen)
          ctrl.createShadowModel();
        scope.shadowModel.popoverIsOpen = false;
        if (returnFocus) {
          var trigger = el[0].querySelector('#field-' + scope.fieldID);
          trigger.focus();
        }
        $('body').off('keydown', executeEventHandlers);
        $('body').off('click', closePopoverOnOutsideClick);
      }
      scope.togglePopover = function(evt) {
        scope.shadowModel.popoverIsOpen = !scope.shadowModel.popoverIsOpen;
        if (scope.shadowModel.popoverIsOpen) {
          returnFocus = true;
          $('body').on('keydown', executeEventHandlers);
          $('body').on('click', closePopoverOnOutsideClick);
        }
      }

      function executeEventHandlers(event) {
        trapKeyboardFocus(event);
        closePopoverOnEscape(event);
      }

      function trapKeyboardFocus(event) {
        if (!scope.shadowModel.popoverIsOpen)
          return;
        if (event.which === 9 && !event.shiftKey) {
          if (($(event.target).is("button[ng-click='saveForm()']"))) {
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

      function closePopoverOnOutsideClick(event) {
        var $et = $(event.target);
        var closeButton = $et.attr('ng-click') && $et.attr('ng-click') === 'closePopover()';
        var saveButton = $et.attr('ng-click') && $et.attr('ng-click') === 'saveForm()';
        if (closeButton || saveButton)
          return;
        if (!($et.closest(".popover-" + scope.fieldID).length ||
            $et.closest(".popover-trigger-" + scope.fieldID).length)) {
          returnFocus = false;
          scope.$evalAsync('closePopover()');
        }
      }
      scope.$on("$destroy", function() {
        $('body').off('keydown', executeEventHandlers);
        $('body').off('click', closePopoverOnOutsideClick);
      });
      scope.$on('sp.spFormField.rendered', function(e, element, input) {
        var parent = input.parent();
        var select2Input = parent[0].querySelector('.select2-container input');
        $timeout(function() {
          select2Input.focus();
        }, 0, false);
      });
    }
  }
});
angular.module('sn.$sp').directive('spEditableField2', function(glideFormFactory, $http, spUtil, spModelUtil) {
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
        spModelUtil.extendField($scope.fieldModel);
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
angular.module('sn.$sp').directive('snFieldListElement', function($http, $sanitize, i18n, $filter, nowServer) {
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
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="field.value" id="sp_formfield_{{::field.name}}"/>',
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
        scope.$evalAsync(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          i18n.getMessage('No matches found', function(msg) {
            config.formatNoMatches = function() {
              return msg;
            };
          });
          i18n.getMessage('Loading more results...', function(msg) {
            config.formatLoadMore = function(pageNumber) {
              return msg;
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
        scope.$evalAsync(function() {
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
angular.module('sn.$sp').directive('spReferenceElement', function($http, spUtil, filterExpressionParser, $sanitize, i18n, spIs, spAriaUtil, select2EventBroker) {
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
    template: '<input type="text" id="sp_formfield_{{::field.name}}" name="{{::field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" aria-hidden="true" />',
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
              markup += "<div style='width: " + width + "%;display: inline-block;word-wrap:break-word;vertical-align:top' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
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
              var isPricingField = field._pricing && field._pricing.pricing_implications === true;
              var items = [];
              var values = field.value.split(',');
              var displayValues = field.display_value_list;
              var priceValues = [];
              if (isPricingField)
                priceValues = field.price_value_list;
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
                if (isPricingField) {
                  items.push({
                    sys_id: values[i],
                    name: displayValues[i],
                    pricing: priceValues[i]
                  });
                } else {
                  items.push({
                    sys_id: values[i],
                    name: displayValues[i]
                  });
                }
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
            var priceValues = field.price_value_list;
            values.push(selectedItem.sys_id);
            displayValues.push(getDisplayValue(selectedItem));
            if (field['_cat_variable'] === true && field._pricing && field._pricing.pricing_implications === true) {
              var priceSelected = getPriceValue(selectedItem);
              updatePrice(priceSelected, true);
              if (priceValues)
                priceValues.push(priceSelected);
            }
            g_form.setValue(field.name, values.join(','), displayValues);
            e.preventDefault();
            element.select2('val', values).select2('close');
          }
        },
        onRemoving: function(e) {
          var removed = e.choice;
          var values = field.value.split(',');
          var displayValues = field.display_value_list;
          var priceValues = field.price_value_list;
          for (var i = values.length - 1; i >= 0; i--) {
            if (removed.sys_id == values[i]) {
              values.splice(i, 1);
              displayValues.splice(i, 1);
              if (field['_cat_variable'] === true && field._pricing && field._pricing.pricing_implications === true) {
                if (priceValues && priceValues.length > i) {
                  var priceRemoved = priceValues[i];
                  updatePrice(priceRemoved, false);
                  priceValues.splice(i, 1);
                }
              }
              break;
            }
          }
          g_form.setValue(field.name, values.join(','), displayValues);
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
        },
        onOpening: function(e) {
          select2EventBroker.publishSelect2Opening();
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
              query += colToSearch + filterExpression.operator + filterExpression.filterText;
              if (!g_sort_elements_by_session_language || g_lang === 'en')
                query += '^' + colToSearch + 'ISNOTEMPTY';
              query += getExcludedValues();
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
              p: scope.ed.reference,
              q: q,
              r: scope.ed.qualifier
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
        scope.$evalAsync(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          i18n.getMessage('No matches found', function(msg) {
            config.formatNoMatches = function() {
              return msg;
            };
          });
          i18n.getMessage('Loading more results...', function(msg) {
            config.formatLoadMore = function(pageNumber) {
              return msg;
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
          element.bind("select2-opening", s2Helpers.onOpening);
          element.bind("select2-blur", function() {
            scope.$evalAsync(function() {
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
          element.parent().find(".select2-choice").attr("aria-hidden", "true");
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
        });
      }

      function getAriaLabel() {
        var label = "";
        if (field.isMandatory()) {
          label = i18n.getMessage("Required") + " - ";
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

      function getPriceValue(selectedItem) {
        var priceValue = {};
        if (selectedItem && selectedItem.sys_id) {
          priceValue.price = selectedItem.price ? selectedItem.price : 0.0;
          priceValue.recurring_price = selectedItem.recurring_price ? selectedItem.recurring_price : 0.0;
        }
        return priceValue;
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

      function updatePrice(priceToUpdate, add) {
        field.price = Number(field.price);
        field.recurring_price = Number(field.recurring_price);
        if (!field.price) {
          field.price = 0.0;
        }
        if (!field.recurring_price)
          field.recurring_price = 0.0;
        if (add == true) {
          field.price += Number(priceToUpdate.price);
          field.recurring_price += Number(priceToUpdate.recurring_price);
        } else {
          field.price -= Number(priceToUpdate.price);
          field.recurring_price -= Number(priceToUpdate.recurring_price);
        }
      }
      g_form.$private.events.on("change", function(fieldName, oldValue, value) {
        if (fieldName == field.name) {
          if (value == "" && field.display_value_list) {
            field.display_value_list.length = 0;
            if (field.price_value_list)
              field.price_value_list.length = 0;
          }
          element.select2("val", typeof value == 'string' ? value.split(',') : value);
          element.parent().find(".select2-focusser").attr("aria-label", getAriaLabel());
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $scope.$evalAsync(function() {
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
      $scope.pageSize = NOW.ac_max_search_matches;
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
      $scope.field.currencyValue = formatNumber(field.currencyValue);
      g_form.$private.events.on("change", function(fieldName, oldValue, newValue) {
        if (fieldName == field.name) {
          if (newValue.indexOf(";") > 0) {
            var v = newValue.split(";");
            field.currencyCode = v[0];
            field.currencyValue = formatNumber(v[1]);
          } else
            field.currencyValue = formatNumber(newValue);
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

  function parseDurationToParts(value) {
    var MS_IN_DAY = 86400000;
    var parts = value.split(" ");
    if (parts.length == 2) {
      var times = parts[1].split(":");
      for (var i = 0; i < times.length; i++)
        parts[1 + i] = times[i];
      var dateParts = parts[0].split("-");
      if (dateParts.length == 3)
        parts[0] = parseInt(Date.parse(dateParts[1] +
          '/' + dateParts[2] + '/' +
          dateParts[0] + ' 00:00:00 UTC')) /
        MS_IN_DAY;
    }
    return parts;
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
      scope.field.mandatory_filled = function() {
        if (!scope.field.stagedValue || scope.field.stagedValue == "1970-01-01 00:00:00")
          return false;
        return true;
      }
      ngModelCtrl.$formatters.push(function() {
        if (!ngModelCtrl.$modelValue)
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          };
        var duration = parseDurationToParts(ngModelCtrl.$modelValue);
        var d = duration[0];
        var h = duration[1];
        var m = duration[2];
        var s = duration[3];
        scope.field.value = d + " " + h + ":" + m + ":" + s;
        if (scope.visibleUnits[0] == "hours") {
          h = +h + (d * 24) + '';
          d = 0;
        } else if (scope.visibleUnits[0] == "minutes") {
          m = +m + (h * 60) + (d * 1440) + '';
          d = h = 0;
        } else if (scope.visibleUnits[0] == "seconds") {
          s = +s + (m * 60) + (h * 3600) + (d * 86400) + '';
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
/*! RESOURCE: /scripts/app.$sp/directive.spMaskElement.js */
angular.module('sn.$sp').directive('spMaskElement', function(i18n) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      field: '=',
      onChange: '&snChange',
      onBlur: '&snBlur',
      disabled: '=snDisabled',
      placeholder: '=',
      getGlideForm: '&glideForm'
    },
    templateUrl: 'sp_element_mask.xml',
    controller: function($scope) {
      var c = this;
      var VALUE_MASK = '**********';
      $scope.inputType = 'password';
      $scope.toggleShowHide = i18n.getMessage('u_show');
      if (!$scope.field.catalog_view_masked && $scope.field.stagedValue != '') {
        $scope.field.stagedValue = VALUE_MASK;
      }
      $scope.modelValueChange = function() {
          $scope.field._setFromModel = true;
          $scope.getGlideForm().setValue($scope.field.name, $scope.field.stagedValue);
        },
        c.validate = function() {
          if ($scope.field.stagedValue !== $scope.field.confirmPassword && $scope.field.useConfirmation == true)
            $scope.field.isInvalid = true;
          else
            $scope.field.isInvalid = false;
          $scope.onChange();
        },
        c.cleanData = function() {
          if ($scope.field.stagedValue === VALUE_MASK) {
            $scope.field.stagedValue = '';
            $scope.field.confirmPassword = '';
          }
        },
        c.togglePassword = function() {
          if ($scope.inputType == 'password') {
            $scope.toggleShowHide = i18n.getMessage('u_hide');
            $scope.inputType = 'text';
          } else {
            $scope.toggleShowHide = i18n.getMessage('u_show');
            $scope.inputType = 'password';
          }
        }
    },
    controllerAs: 'c',
    link: function(scope, elem, attrs) {
      scope.field.isInvalid = false;
      scope.field.confirmPassword = scope.field.stagedValue;
      scope.reEnter = i18n.getMessage('Re-enter');
      scope.misMatch = i18n.getMessage('Confirmation must match');
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.spCatalogVariable.js */
angular.module('sn.$sp').directive('spCatalogVariable', function(spSCConf) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: 'sp_catalog_variable.xml',
    link: function(scope, element, attrs, ctrl) {
      scope.spSCConf = spSCConf;
    }
  };
});;
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
          soruce_id: field.source_id,
          cat_item: field.cat_item
        };
      }
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
          $scope.getGlideForm().setValue(field.name, [], []);
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
          $scope.getGlideForm().setValue(field.name, JSON.stringify(newVal), JSON.stringify(newDisplayVal));
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
/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCFieldPropertyDecorator.js */
angular.module('sn.$sp').factory('spSCFieldPropertyDecorator', function(spScUtil, spSCConf, glideFormFieldFactory) {
  function isContainerType(field) {
    return field.type == spSCConf.CONTAINER_START || field.type == spSCConf.CHECKBOX_CONTAINER;
  }

  function isCheckboxEmpty(value) {
    return value == "false" || value == "";
  }
  return {
    decorate: decorateCatalogFields
  }

  function decorateCatalogFields(fields, g_form) {
    var _fields = fields;
    _fields.forEach(function(field) {
      if (!spScUtil.isCatalogVariable(field))
        return;
      field._visible = field.visible;
      field._readonly = field.readonly;
      field._mandatory = field.mandatory;
      switch (field.type) {
        case spSCConf.CONTAINER_START:
          _overLoadContainerMandatoryProperty(field, g_form);
          _overLoadContainerVisibleProperty(field, g_form);
          _overLoadContainerValueProperty(field, g_form);
          _overLoadContainerReadonlyProperty(field, g_form);
          _overLoadContainerInvalidProperty(field, g_form);
          return;
        case spSCConf.CHECKBOX_CONTAINER:
          _overLoadCheckboxContainerMandatoryProperty(field, g_form);
          _overLoadCheckboxContainerVisibleProperty(field, g_form);
          _overLoadCheckboxContainerReadonlyProperty(field, g_form);
          _overLoadCheckboxContainerValueProperty(field, g_form);
          _overLoadCheckboxContainerLabelProperty(field, g_form);
          return;
        case spSCConf.CHECKBOX:
          _overLoadCheckboxMandatoryProperty(field, g_form);
          _overLoadCheckboxVisibleProperty(field, g_form);
          _overLoadCheckboxReadonlyProperty(field, g_form);
          return;
        case spSCConf.LABEL:
          _overLoadLabelMandatoryProperty(field, g_form);
          return;
        case spSCConf.MASKED:
          _overLoadMaskedValueProperty(field, g_form);
          _overLoadDefaultMandatoryProperty(field, g_form);
          _overLoadDefaultVisibleProperty(field, g_form);
          return;
        default:
          _overLoadDefaultMandatoryProperty(field, g_form);
          _overLoadDefaultVisibleProperty(field, g_form);
          return;
      }
    });

    function _getField(fieldName) {
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.variable_name === fieldName || field.name === fieldName) {
          return field;
        }
      }
      return null;
    }

    function canHideOrDisable(field) {
      if (isContainerType(field))
        return canHideOrDisableContainer(field);
      else if (field.type == spSCConf.CHECKBOX) {
        if (glideFormFieldFactory.isMandatory(field) && isCheckboxEmpty(field.value))
          return false;
      } else if (glideFormFieldFactory.isMandatory(field) && !glideFormFieldFactory.hasValue(field))
        return false;
      return true;
    }

    function canHideOrDisableContainer(field) {
      for (var i = 0; i < field._children.length; i++) {
        if (!canHideOrDisable(_getField(field._children[i])))
          return false;
      }
      return true;
    }

    function _overLoadDefaultMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          this._mandatory = isMandatory;
          if (typeof this._parent != "undefined" && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), true);
          }
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadDefaultVisibleProperty(field, g_form) {
      Object.defineProperty(field, 'visible', {
        set: function(isVisible) {
          this._visible = isVisible;
          if (typeof this._parent != 'undefined' && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), isVisible);
          }
          return;
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function walkToRootAndSetVisibility(g_form, field, isVisible) {
      if (!isContainerType(field))
        return;
      if (!isVisible) {
        for (var i = 0; i < field._children.length; i++) {
          if (g_form.isVisible(field._children[i]))
            return false;
        }
        g_form.setVisible(field.variable_name, false);
        field._cascade_hidden = true;
        return;
      } else {
        if ((field._cascade_hidden || !canHideOrDisableContainer(field))) {
          field._cascade_hidden = false;
          g_form.setVisible(field.variable_name, true);
        }
      }
    }

    function _overLoadContainerValueProperty(field, g_form) {
      Object.defineProperty(field, "value", {
        get: function() {
          for (var i = 0; i < this._children.length; i++) {
            var child = _getField(this._children[i]);
            if (glideFormFieldFactory.hasValue(child))
              return "true";
          }
          return "";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
    }

    function _overLoadContainerMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          for (var i = 0; i < this._children.length; i++) {
            g_form.setMandatory(this._children[i], isMandatory);
          }
          this._mandatory = isMandatory;
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadContainerVisibleProperty(field, g_form) {
      Object.defineProperty(field, 'visible', {
        set: function(isVisible) {
          if (isVisible) {
            if (!this._visible && this._cascade_hidden) {
              return;
            }
          } else {
            if (!canHideOrDisableContainer(this)) {
              return;
            }
          }
          this._visible = isVisible;
          this._cascade_hidden = false;
          if (typeof this._parent != 'undefined' && this._parent)
            walkToRootAndSetVisibility(g_form, _getField(this._parent), isVisible);
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadContainerReadonlyProperty(field, g_form) {
      Object.defineProperty(field, 'readonly', {
        set: function(isReadonly) {
          for (var i = 0; i < this._children.length; i++) {
            var child = _getField(this._children[i]);
            if (isContainerType(child) || !isReadonly || (isReadonly && canHideOrDisable(child))) {
              g_form.setReadonly(child.name, isReadonly);
            }
          }
          this._readonly = isReadonly;
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadContainerInvalidProperty(field, g_form) {
      Object.defineProperty(field, 'isInvalid', {
        set: function(isReadonly) {
          return;
        },
        get: function() {
          return false;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerMandatoryProperty(field, g_form) {
      if (field.render_label) {
        for (var i = 0; i < field._children.length; i++) {
          if (_getField(field._children[i]).mandatory) {
            field._mandatory = true;
            break;
          }
        }
      } else {
        var childCheckbox = _getField(field._children[0]);
        if (childCheckbox.mandatory)
          field._mandatory = true;
      }
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          for (var i = 0; i < field._children.length; i++) {
            g_form.setMandatory(field._children[i], isMandatory);
          }
        },
        get: function() {
          var oneMandatoryVisibleChild = false;
          for (var i = 0; i < field._children.length; i++) {
            var childField = _getField(field._children[i]);
            if (childField.visible && childField.mandatory) {
              oneMandatoryVisibleChild = true;
              this._mandatory = true;
              break;
            }
          }
          if (!oneMandatoryVisibleChild)
            this._mandatory = false;
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerVisibleProperty(field, g_form) {
      Object.defineProperty(field, "visible", {
        set: function(isVisible) {
          if (isVisible) {
            this._visible = true;
            this._cascade_hidden = false;
            return;
          }
          if (!canHideOrDisable(this))
            return;
          this._visible = false;
          this._cascade_hidden = false;
          if (typeof this._parent != "undefined" && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), false);
          }
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerReadonlyProperty(field, g_form) {
      Object.defineProperty(field, "readonly", {
        set: function(isReadonly) {
          for (var i = 0; i < field._children.length; i++) {
            g_form.setReadonly(field._children[i], isReadonly);
          }
          this._readonly = isReadonly;
          this._cascade_readonly = true;
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerValueProperty(field, g_form) {
      Object.defineProperty(field, "value", {
        get: function() {
          for (var i = 0; i < this._children.length; i++) {
            var childCheckbox = _getField(this._children[i]);
            if (childCheckbox._visible && "" + childCheckbox.value == "true")
              return "true";
          }
          return this._mandatory ? "" : "false";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
      Object.defineProperty(field, "stagedValue", {
        get: function() {
          for (var i = 0; i < this._children.length; i++) {
            var childCheckbox = _getField(this._children[i]);
            if (childCheckbox._visible && "" + childCheckbox.value == "true")
              return "true";
          }
          return this._mandatory ? "" : "false";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerLabelProperty(field, g_form) {
      if (field.render_label)
        return;
      Object.defineProperty(field, 'label', {
        get: function() {
          var childCheckbox = _getField(this._children[0]);
          return childCheckbox.label;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxMandatoryProperty(field, g_form) {
      Object.defineProperty(field, "mandatory", {
        set: function(isMandatory) {
          var checkboxContainer = _getField(this._parent);
          if (isMandatory && isCheckboxEmpty(this.value)) {
            this._visible = true;
            this._readonly = false;
            if (!checkboxContainer._visible) {
              checkboxContainer._visible = true;
              if (typeof checkboxContainer._parent != "undefined" && checkboxContainer._parent) {
                walkToRootAndSetVisibility(g_form, _getField(checkboxContainer._parent), true);
              }
            }
          }
          this._mandatory = isMandatory;
          if (isMandatory) {
            checkboxContainer._mandatory = true;
            return;
          }
          for (var i = 0; i < checkboxContainer._children.length; i++) {
            if (_getField(checkboxContainer._children[i])._mandatory) {
              checkboxContainer._mandatory = true;
              return;
            }
          }
          checkboxContainer._mandatory = isMandatory;
          checkboxContainer.isInvalid = false;
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxVisibleProperty(field, g_form) {
      Object.defineProperty(field, "visible", {
        set: function(isVisible) {
          if (!isVisible && !_getField(this._parent).mandatory_filled())
            return;
          this._visible = isVisible;
          if (typeof this._parent != "undefined" && this._parent) {
            var parent = _getField(this._parent);
            if (isVisible && !parent.visible && !parent._cascade_hidden)
              return;
            if (!isVisible) {
              if (_getField(this._parent)._mandatory && !glideFormFieldFactory.hasValue(this._parent)) {
                var children = _getField(this._parent)._children;
                for (var i = 0; i < children.length; i++) {
                  if (_getField(children[i])._visible && isCheckboxEmpty(_getField(children[i]).value))
                    _getField(children[i])._readonly = false;
                }
              }
              return walkToRootAndSetVisibility(g_form, parent, false);
            }
            parent._visible = isVisible;
            parent._cascade_hidden = !isVisible;
            if (typeof parent._parent != "undefined" && parent._parent)
              walkToRootAndSetVisibility(g_form, _getField(parent._parent), isVisible);
          }
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxReadonlyProperty(field, g_form) {
      Object.defineProperty(field, "readonly", {
        set: function(isReadonly) {
          if (isReadonly && !_getField(this._parent).mandatory_filled())
            return false;
          this._readonly = isReadonly;
          if (_getField(this._parent)._cascade_readonly) {
            _getField(this._parent)._cascade_readonly = false;
            _getField(this._parent)._readonly = false;
          }
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadLabelMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          console.log("setMandatory not applicable for 'Label' variable type");
          return;
        },
        configurable: true
      });
    }

    function _overLoadMaskedValueProperty(field, g_form) {
      field._value = field.value;
      Object.defineProperty(field, 'value', {
        set: function(value) {
          field._value = value;
          if (field._setFromModel)
            field._setFromModel = false;
          else {
            field.confirmPassword = value;
            field.isInvalid = false;
          }
        },
        get: function() {
          return field._value;
        },
        configurable: true
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCNavStateManager.js */
angular.module('sn.$sp').factory('spSCNavStateManager', function($rootScope, $window, spModal, i18n) {
  'use strict';
  var registeredForms = {};

  function registerForm(form) {
    registeredForms[form.getSysId()] = form;
  }

  function unregisterForms(sysIds) {
    sysIds.forEach(function(sysId) {
      delete registeredForms[sysId];
    });
  }

  function clearUserModifiedFields() {
    var includedForms = Object.keys(registeredForms);
    includedForms.forEach(function(includedForm) {
      if (registeredForms[includedForm].isUserModified())
        registeredForms[includedForm].$private.userState.clearModifiedFields();
    });
  }

  function checkForDirtyForms() {
    var isFormDirty = false;
    var includedForms = Object.keys(registeredForms);
    for (var i in includedForms)
      if (registeredForms[includedForms[i]].isUserModified()) {
        isFormDirty = true;
        break;
      }
    return isFormDirty;
  }
  $rootScope.$on('$locationChangeStart', function(event, next) {
    event.preventDefault();
    if (checkForDirtyForms()) {
      spModal.open({
        title: i18n.getMessage("Leave page?"),
        headerStyle: {
          border: 'none',
          'padding-bottom': 0
        },
        footerStyle: {
          border: 'none',
          'padding-top': 0
        },
        message: i18n.getMessage("Changes you made will be lost."),
        buttons: [{
            label: i18n.getMessage("Cancel"),
            value: "cancel"
          },
          {
            label: i18n.getMessage("Leave"),
            primary: true,
            value: "leave"
          }
        ]
      }).then(function(confirm) {
        if (confirm.value == "leave") {
          clearUserModifiedFields();
          $window.location = next;
        }
      });
    } else
      $window.location = next;
  });
  $window.onbeforeunload = function(event) {
    if (checkForDirtyForms())
      event.returnValue = "Changes you made will be lost.";
  }
  return {
    register: registerForm,
    unregisterForms: unregisterForms
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spCheckboxGroup.js */
angular.module('sn.$sp').directive('spCheckboxGroup', function($sce) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_checkbox_group.xml',
    scope: {
      getGlideForm: '&glideForm',
      containers: "=containers",
      formModel: "=formModel",
      name: "="
    },
    controllerAs: "c",
    controller: function($scope) {
      var c = this;
      var field;
      $scope.field = $scope.formModel._fields[$scope.name];
      field = $scope.field;
      $scope.getVarID = function(v) {
        if (typeof v.name != "undefined" && hasVariablePrefix(v.name))
          return v.name.substring(3);
        return v.name;
      };
      $scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      };

      function hasVariablePrefix(v) {
        return v.indexOf("IO:") == 0;
      }
    }
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
angular.module("sn.$sp").controller("spPageCtrl", function($scope, $http, $location, $window, spAriaUtil, spUtil, spMetatagService, spAnnouncement,
  snRecordWatcher, $rootScope, spPage, spAriaFocusManager, $timeout, spAtf, spGtd) {
  'use strict';
  var _ = $window._;
  var c = this;
  c.doAnimate = false;
  c.firstPage = true;
  $scope.theme = {};
  $scope.page = {
    title: "Loading..."
  };
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
    if (spPage.isHashChange(newUrl, oldUrl)) {
      return;
    }
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
    spMetatagService.setTags(response.metatags);
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
    response.portal = $rootScope.portal;
    $window.document.title = spPage.getTitle(response);
    $scope.$broadcast('$sp.scroll', {
      position: 0
    });
    $rootScope.theme = $scope.theme = response.theme;
    c.style = spPage.getClasses($scope);
    if (!$scope.user) {
      $rootScope.user = $scope.user = {};
    }
    $scope.g_accessibility = spAriaUtil.g_accessibility;
    angular.extend($scope.user, response.user);
    $scope.user.logged_in = spPage.userLoggedIn($scope.user);
    $scope.$broadcast('$$uiNotification', response.$$uiNotification);
    snRecordWatcher.init();
    $timeout(function() {
      c.doAnimate = true;
    }, 500);
    if (NOW && NOW.sp && NOW.sp.enableTours && $scope.user.logged_in) {
      spGtd.getToursForPage({
          portal: $rootScope.portal,
          page: $rootScope.page,
          user: $rootScope.user
        })
        .then(function(data) {
          $rootScope.$broadcast('sp-menu-update-tours', data);
          $scope.$on('sp-header-loaded', function() {
            $rootScope.$broadcast('sp-menu-update-tours', data);
          });
        });
    }
    return r;
  }

  function setupAtf() {
    spAtf.init().then(function(atf) {
      atf.triggerPageLoaded();
    });
  }

  function getPage() {
    return $http({
        method: 'GET',
        url: spPage.getUrl($scope.portal_id),
        headers: spUtil.getHeaders()
      })
      .then(loadPage)
      .then(function(res) {
        spAnnouncement.init(res.data.result.announcements).then(function() {
          spAriaFocusManager.pageLoadComplete($location.url());
          setupAtf();
        });
      });
  }
  $scope.$on('sp.page.reload', getPage);
  $($window).keydown(spPage.saveOnCtrlS);
  $scope.$on('$destroy', function() {
    $($window).off('keydown', spPage.saveOnCtrlS);
  });
  c.focusOnPageTitle = function() {
    spAriaFocusManager.focusOnPageTitle();
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spPage.js */
angular.module('sn.$sp').factory('spPage', function($rootScope, spConf, $location, $window, $sanitize, i18n) {
  'use strict';

  function getStyle(page) {
    return '<style type="text/css" data-page-id="' + page.sys_id + '" data-page-title="' + $sanitize(page.title) + '">' + page.css + '</style>'
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
    if (e.metaKey || (e.ctrlKey && !e.altKey)) {
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
          message: i18n.getMessage("There is a JavaScript error in your browser console")
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
    if (scope.widget.options && scope.widget.options.css)
      head.appendChild(addElement({
        css: scope.widget.options.css,
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
    null,
    [i18n.getMessage("Instance Options"), editInstance],
    [i18n.getMessage('Instance in Page Editor') + ' ➚', instancePageEdit],
    [i18n.getMessage('Page in Designer') + ' ➚', openDesigner],
    null,
    [i18n.getMessage('Edit Container Background'), editBackground],
    null,
    [i18n.getMessage('Widget Options Schema'), editOptionSchema],
    [i18n.getMessage('Widget in Form Modal'), editWidget],
    [i18n.getMessage('Widget in Editor') + ' ➚', openWidgetEditor],
    null,
    [i18n.getMessage('Log to console') + ': $scope.data', logScopeData],
    [i18n.getMessage('Log to console') + ': $scope', logScope]
  ];
  var basic_menu = [
    null,
    [i18n.getMessage("Instance Options"), editInstance],
    [i18n.getMessage('Log to console') + ': $scope.data', logScopeData],
    [i18n.getMessage('Log to console') + ': $scope', logScope]
  ];
  $scope.contextMenu = function(event) {
    if (!event.ctrlKey || !$rootScope.user.can_debug) {
      if (!window._protractor_contextmenu) {
        return [];
      }
    }
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
    m[1] = ((!w.option_schema && w.options && !w.options.widget_parameters && !w.field_list) || !$rootScope.user.can_debug_admin) ? [i18n.getMessage("Instance Options")] : [i18n.getMessage("Instance Options"), editInstance];
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
angular.module('sn.$sp').directive('spNavbarToggle', function(cabrillo) {
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
angular.module('sn.$sp').directive('spAttachmentButton', function(cabrillo, $rootScope, i18n) {
  'use strict';
  return {
    restrict: 'E',
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button href="#" title="" ng-click="showAttachOptions()" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-camera"></span></button>';
      } else {
        inputTemplate = '<input type="file" style="display: none" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input"/>';
        inputTemplate += '<button  id="add_attachment_button" title="" ng-click="attachmentHandler.openSelector($event)" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-paperclip"></span></button>';
      }
      return [
        '<span class="file-upload-input">',
        inputTemplate,
        '</span>'
      ].join('');
    },
    controller: function($element, $scope) {
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
        $scope.$evalAsync(function() {
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
angular.module('sn.$sp').directive('spPageRow', function($rootScope, $compile) {
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
}).directive('spModel', function($q, spUtil, glideFormFactory, glideUserSession, catalogItemFactory, glideFormEnvironmentFactory, catalogGlideFormFactory, spUIActionFactory, glideModalFactory, $uibModal,
  spModal, glideListFactory, spModelUtil, $sce, spAtf, spSCFieldPropertyDecorator, spSCConf, $rootScope, uiScriptFactory) {
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
    controller: function($scope, $rootScope, $timeout) {
      var c = this;
      var g_form;
      var flatFields;
      var isCatalogItem;
      var formModel;
      var ui_g_form;
      var formEnvironment;
      var deferredEnv = $q.defer();
      $scope.okToPaintForm = false;
      $scope.$watch('formModel', function(newValue) {
        if (angular.isDefined(newValue)) {
          init();
        }
      });
      $scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      }
      c.populateMandatory = function populateMandatory(flatFields) {
        var mandatory = [];
        var field;
        for (var f in flatFields) {
          field = flatFields[f];
          if (typeof field.mandatory_filled == 'undefined' || field.type == spSCConf.CONTAINER_START || field.type == spSCConf.LABEL)
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
        $scope.$evalAsync(function() {
          var field = formModel._fields[fieldName];
          if (field.stagedValue != newValue) {
            field.stagedValue = newValue;
          }
          if (isCatalogItem) {
            if (hasPricingImplications(field)) {
              if (field.type == 'boolean' || field.type == 'boolean_confirm')
                c.setBoolean(field, newValue);
              if (field.choices)
                c.setPrices(field, newValue);
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
          $scope.$broadcast("field.change." + field.name, p);
          $scope.$emit("field.change." + field.name, p);
        });
      }

      function hasPricingImplications(field) {
        if (!field._pricing)
          return false;
        if (field.type == 'boolean' || field.type == 'boolean_confirm')
          return true;
        if (field.choices || field.type == 'sc_multi_row')
          return true;
        if (field.type == 'reference' || field.type == 'glide_list')
          if (field._pricing && field._pricing.pricing_implications === true)
            return true;
        return false;
      }

      function getErrorMessage(message) {
        var parts = message.split(':');
        if (parts.length !== 2) {
          return message;
        }
        var errorFields = [];
        var fields = parts[1].split(/\r|\n/);
        fields.forEach(function(f) {
          f = f.trim();
          if (!f) {
            return;
          }
          errorFields.push(f);
        });
        if (errorFields.length === 0) {
          return message;
        }
        return parts[0] + ': ' + errorFields.join(', ');
      }

      function uiMessageHandler(g_form, type, message) {
        switch (type) {
          case 'infoMessage':
            spUtil.addInfoMessage(message);
            break;
          case 'errorMessage':
          case 'mandatoryMessage':
            spUtil.addErrorMessage(getErrorMessage(message));
            break;
          case 'clearMessages':
            spUtil.clearMessages();
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

      function getNestedVariables(fm, fields, viewField) {
        if (typeof viewField.variables !== "undefined") {
          var fieldModel = fm._fields[viewField.name];
          if (fieldModel)
            fieldModel._children = [];
          for (var v in viewField.variables) {
            var variable = viewField.variables[v];
            if (fm._fields[variable.name]) {
              var child = fm._fields[variable.name];
              if (fieldModel) {
                fieldModel._children.push(variable.name);
                child._parent = viewField.name;
              }
              fields.push(child);
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
        function forcePriceUpdate() {
          for (var f in fields) {
            if (fields[f].type == "sc_multi_row")
              return true;
            if (fields[f].type == 'reference' || fields[f].type == 'glide_list') {
              if (fields[f]._pricing && fields[f]._pricing.pricing_implications === true)
                return true;
            }
          }
        }
        if (formModel.sys_class_name == 'sc_cat_item_producer')
          return;
        var price = 0;
        var recurring_price = 0;
        var isMultiRowFields = false;
        angular.forEach(fields, function(field) {
          if (field["_multi_row_variable"]) {
            isMultiRowFields = true;
            return;
          }
          if (field.price)
            price += Number(field.price);
          if (field.recurring_price)
            recurring_price += Number(field.recurring_price);
        });
        if (isMultiRowFields)
          return;
        var o = {
          price: price,
          recurring_price: recurring_price,
          force_update: forcePriceUpdate()
        };
        if (fields)
          $scope.$emit("variable.price.change", o);
      };
      c.setBoolean = function setBoolean(field, value) {
        if (field.type != 'boolean' && field.type != 'boolean_confirm')
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
        return ui_g_form;
      };
      $scope.setDefaultValue = function(fieldName, fieldInternalValue, fieldDisplayValue) {
        g_form.setValue(fieldName, fieldInternalValue, fieldDisplayValue);
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
              $rootScope.$broadcast("spModel.uiActionComplete", response);
            });
          }
        });
        spModelUtil.extendFields(flatFields);
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
        if (isCatalogItem) {
          spSCFieldPropertyDecorator.decorate(flatFields, g_form);
        }
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
        return g_form;
      }
      $scope.paintForm = function paintForm(container) {
        return $scope.okToPaintForm && $scope.isContainerVisible(container);
      };
      $scope.isContainerVisible = function isContainerVisible(container) {
        if (!isCatalogItem && typeof container.visible != "undefined")
          return container.visible;
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
        if (!deferredEnv) {
          deferredEnv = $q.defer();
          $scope.execItemScripts();
        }
        $scope.mandatory = [];
        formModel = $scope.formModel;
        c.massageView(formModel);
        flatFields = c.getFieldsFromView(formModel);
        isCatalogItem = c.hasCatalogVariable(flatFields);
        glideUserSession.loadCurrentUser().then(function(user) {
          createEnvironment(user);
          $scope.okToPaintForm = true;
          $scope.containers = formModel._sections;
          deferredEnv.resolve();
        }).catch(deferredEnv.reject);
      }
      $scope.execItemScripts = function() {
        deferredEnv.promise.then(function() {
          deferredEnv = null;
          $scope.$emit("spModel.fields.rendered");
          $scope.$evalAsync(function() {
            $scope.mandatory = c.populateMandatory(flatFields);
            formEnvironment.initialize();
            $scope.$emit("spModel.gForm.initialized", g_form);
            if (isCatalogItem)
              c.calcPrice(flatFields);
          });
        });
      };
      $rootScope.$on("sp.form.submitted", function() {
        if (!deferredEnv) {
          deferredEnv = $q.defer();
        }
        $scope.$applyAsync(function() {
          $scope.execItemScripts();
        });
      });

      function createEnvironment(user) {
        g_form = initGlideForm();
        var g_modal = glideModalFactory.create({
          alert: modalAlert,
          confirm: modalConfirm
        });
        formEnvironment = glideFormEnvironmentFactory.createWithConfiguration(g_form, user, formModel.g_scratchpad, formModel.client_script || [], formModel.policy || [], g_modal, formModel.validation_scripts || [], uiScriptFactory.create(formModel.ui_scripts || [], $q));
        ui_g_form = formEnvironment.getUserGlideForm();
        if (isCatalogItem) {
          formEnvironment.g_env.registerExtensionPoint('g_service_catalog', {
            'isOrderGuide': function() {
              return formModel.isOrderGuideItem ? true : false;
            }
          });
          catalogGlideFormFactory.addItemEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
          catalogGlideFormFactory.addVariableEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
          ui_g_form.recordTableName = "sc_cart_item";
        }
        formEnvironment.g_env.registerExtensionPoint('spModal', spModal);
        formEnvironment.g_env.registerExtensionPoint('g_list', glideListFactory.init(g_form, flatFields));
        $scope.$emit("spModel.gForm.env.created", g_form);
      }
      $rootScope.$on('spModel.gForm.rendered', function() {
        $timeout(function() {
          spAtf.init().then(function(atf) {
            g_form.$rootScope = $rootScope;
            atf.expose('g_form', spAtf.augmentForm(g_form));
          });
        }, 1000);
      });
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
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase",
            "!doc": "Returns the calling string value converted to upper case, according to any locale-specific case mappings."
          },
          "toLocaleLowerCase": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase",
            "!doc": "Returns the calling string value converted to lower case, according to any locale-specific case mappings."
          },
          "split": {
            "!type": "fn(pattern?: string|+RegExp, limit?: number) -> [string]",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/split",
            "!doc": "Splits a String object into an array of strings by separating the string into substrings."
          },
          "concat": {
            "!type": "fn(other: string) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/concat",
            "!doc": "Combines the text of two or more strings and returns a new string."
          },
          "localeCompare": {
            "!type": "fn(other: string) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/localeCompare",
            "!doc": "Returns a number indicating whether a reference string comes before or after or is the same as the given string in sort order."
          },
          "match": {
            "!type": "fn(pattern: +RegExp) -> [string]",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/match",
            "!doc": "Used to retrieve the matches when matching a string against a regular expression."
          },
          "replace": {
            "!type": "fn(pattern: string|+RegExp, replacement: string) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace",
            "!doc": "Returns a new string with some or all matches of a pattern replaced by a replacement.  The pattern can be a string or a RegExp, and the replacement can be a string or a function to be called for each match."
          },
          "search": {
            "!type": "fn(pattern: +RegExp) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/search",
            "!doc": "Executes the search for a match between a regular expression and this String object."
          }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String",
        "!doc": "The String global object is a constructor for strings, or a sequence of characters."
      },
      "Number": {
        "!type": "fn(value: ?) -> number",
        "MAX_VALUE": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MAX_VALUE",
          "!doc": "The maximum numeric value representable in JavaScript."
        },
        "MIN_VALUE": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MIN_VALUE",
          "!doc": "The smallest positive numeric value representable in JavaScript."
        },
        "POSITIVE_INFINITY": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY",
          "!doc": "A value representing the positive Infinity value."
        },
        "NEGATIVE_INFINITY": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY",
          "!doc": "A value representing the negative Infinity value."
        },
        "prototype": {
          "!stdProto": "Number",
          "toString": {
            "!type": "fn(radix?: number) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toString",
            "!doc": "Returns a string representing the specified Number object"
          },
          "toFixed": {
            "!type": "fn(digits: number) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed",
            "!doc": "Formats a number using fixed-point notation"
          },
          "toExponential": {
            "!type": "fn(digits: number) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toExponential",
            "!doc": "Returns a string representing the Number object in exponential notation"
          },
          "toPrecision": {
            "!type": "fn(digits: number) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toPrecision",
            "!doc": "The toPrecision() method returns a string representing the number to the specified precision."
          }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number",
        "!doc": "The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."
      },
      "Boolean": {
        "!type": "fn(value: ?) -> bool",
        "prototype": {
          "!stdProto": "Boolean"
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Boolean",
        "!doc": "The Boolean object is an object wrapper for a boolean value."
      },
      "RegExp": {
        "!type": "fn(source: string, flags?: string)",
        "prototype": {
          "!stdProto": "RegExp",
          "exec": {
            "!type": "fn(input: string) -> [string]",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec",
            "!doc": "Executes a search for a match in a specified string. Returns a result array, or null."
          },
          "test": {
            "!type": "fn(input: string) -> bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/test",
            "!doc": "Executes the search for a match between a regular expression and a specified string. Returns true or false."
          },
          "global": {
            "!type": "bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
            "!doc": "Creates a regular expression object for matching text with a pattern."
          },
          "ignoreCase": {
            "!type": "bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
            "!doc": "Creates a regular expression object for matching text with a pattern."
          },
          "multiline": {
            "!type": "bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/multiline",
            "!doc": "Reflects whether or not to search in strings across multiple lines.\n"
          },
          "source": {
            "!type": "string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/source",
            "!doc": "A read-only property that contains the text of the pattern, excluding the forward slashes.\n"
          },
          "lastIndex": {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/lastIndex",
            "!doc": "A read/write integer property that specifies the index at which to start the next match."
          }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
        "!doc": "Creates a regular expression object for matching text with a pattern."
      },
      "Date": {
        "!type": "fn(ms: number)",
        "parse": {
          "!type": "fn(source: string) -> +Date",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/parse",
          "!doc": "Parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 UTC."
        },
        "UTC": {
          "!type": "fn(year: number, month: number, date: number, hour?: number, min?: number, sec?: number, ms?: number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/UTC",
          "!doc": "Accepts the same parameters as the longest form of the constructor, and returns the number of milliseconds in a Date object since January 1, 1970, 00:00:00, universal time."
        },
        "now": {
          "!type": "fn() -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now",
          "!doc": "Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
        },
        "prototype": {
          "toUTCString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toUTCString",
            "!doc": "Converts a date to a string, using the universal time convention."
          },
          "toISOString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toISOString",
            "!doc": "JavaScript provides a direct way to convert a date object into a string in ISO format, the ISO 8601 Extended Format."
          },
          "toDateString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toDateString",
            "!doc": "Returns the date portion of a Date object in human readable form in American English."
          },
          "toTimeString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toTimeString",
            "!doc": "Returns the time portion of a Date object in human readable form in American English."
          },
          "toLocaleDateString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleDateString",
            "!doc": "Converts a date to a string, returning the \"date\" portion using the operating system's locale's conventions.\n"
          },
          "toLocaleTimeString": {
            "!type": "fn() -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString",
            "!doc": "Converts a date to a string, returning the \"time\" portion using the current locale's conventions."
          },
          "getTime": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTime",
            "!doc": "Returns the numeric value corresponding to the time for the specified date according to universal time."
          },
          "getFullYear": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getFullYear",
            "!doc": "Returns the year of the specified date according to local time."
          },
          "getYear": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getYear",
            "!doc": "Returns the year in the specified date according to local time."
          },
          "getMonth": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMonth",
            "!doc": "Returns the month in the specified date according to local time."
          },
          "getUTCMonth": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMonth",
            "!doc": "Returns the month of the specified date according to universal time.\n"
          },
          "getDate": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDate",
            "!doc": "Returns the day of the month for the specified date according to local time."
          },
          "getUTCDate": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDate",
            "!doc": "Returns the day (date) of the month in the specified date according to universal time.\n"
          },
          "getDay": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDay",
            "!doc": "Returns the day of the week for the specified date according to local time."
          },
          "getUTCDay": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDay",
            "!doc": "Returns the day of the week in the specified date according to universal time.\n"
          },
          "getHours": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getHours",
            "!doc": "Returns the hour for the specified date according to local time."
          },
          "getUTCHours": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCHours",
            "!doc": "Returns the hours in the specified date according to universal time.\n"
          },
          "getMinutes": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMinutes",
            "!doc": "Returns the minutes in the specified date according to local time."
          },
          "getUTCMinutes": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
            "!doc": "Creates JavaScript Date instances which let you work with dates and times."
          },
          "getSeconds": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getSeconds",
            "!doc": "Returns the seconds in the specified date according to local time."
          },
          "getUTCSeconds": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCSeconds",
            "!doc": "Returns the seconds in the specified date according to universal time.\n"
          },
          "getMilliseconds": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMilliseconds",
            "!doc": "Returns the milliseconds in the specified date according to local time."
          },
          "getUTCMilliseconds": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMilliseconds",
            "!doc": "Returns the milliseconds in the specified date according to universal time.\n"
          },
          "getTimezoneOffset": {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset",
            "!doc": "Returns the time-zone offset from UTC, in minutes, for the current locale."
          },
          "setTime": {
            "!type": "fn(date: +Date) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setTime",
            "!doc": "Sets the Date object to the time represented by a number of milliseconds since January 1, 1970, 00:00:00 UTC.\n"
          },
          "setFullYear": {
            "!type": "fn(year: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setFullYear",
            "!doc": "Sets the full year for a specified date according to local time.\n"
          },
          "setUTCFullYear": {
            "!type": "fn(year: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCFullYear",
            "!doc": "Sets the full year for a specified date according to universal time.\n"
          },
          "setMonth": {
            "!type": "fn(month: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMonth",
            "!doc": "Set the month for a specified date according to local time."
          },
          "setUTCMonth": {
            "!type": "fn(month: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMonth",
            "!doc": "Sets the month for a specified date according to universal time.\n"
          },
          "setDate": {
            "!type": "fn(day: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setDate",
            "!doc": "Sets the day of the month for a specified date according to local time."
          },
          "setUTCDate": {
            "!type": "fn(day: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCDate",
            "!doc": "Sets the day of the month for a specified date according to universal time.\n"
          },
          "setHours": {
            "!type": "fn(hour: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setHours",
            "!doc": "Sets the hours for a specified date according to local time, and returns the number of milliseconds since 1 January 1970 00:00:00 UTC until the time represented by the updated Date instance."
          },
          "setUTCHours": {
            "!type": "fn(hour: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCHours",
            "!doc": "Sets the hour for a specified date according to universal time.\n"
          },
          "setMinutes": {
            "!type": "fn(min: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMinutes",
            "!doc": "Sets the minutes for a specified date according to local time."
          },
          "setUTCMinutes": {
            "!type": "fn(min: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMinutes",
            "!doc": "Sets the minutes for a specified date according to universal time.\n"
          },
          "setSeconds": {
            "!type": "fn(sec: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setSeconds",
            "!doc": "Sets the seconds for a specified date according to local time."
          },
          "setUTCSeconds": {
            "!type": "fn(sec: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCSeconds",
            "!doc": "Sets the seconds for a specified date according to universal time.\n"
          },
          "setMilliseconds": {
            "!type": "fn(ms: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMilliseconds",
            "!doc": "Sets the milliseconds for a specified date according to local time.\n"
          },
          "setUTCMilliseconds": {
            "!type": "fn(ms: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMilliseconds",
            "!doc": "Sets the milliseconds for a specified date according to universal time.\n"
          }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
        "!doc": "Creates JavaScript Date instances which let you work with dates and times."
      },
      "Error": {
        "!type": "fn(message: string)",
        "prototype": {
          "name": {
            "!type": "string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/name",
            "!doc": "A name for the type of error."
          },
          "message": {
            "!type": "string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/message",
            "!doc": "A human-readable description of the error."
          }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error",
        "!doc": "Creates an error object."
      },
      "SyntaxError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/SyntaxError",
        "!doc": "Represents an error when trying to interpret syntactically invalid code."
      },
      "ReferenceError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/ReferenceError",
        "!doc": "Represents an error when a non-existent variable is referenced."
      },
      "URIError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/URIError",
        "!doc": "Represents an error when a malformed URI is encountered."
      },
      "EvalError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/EvalError",
        "!doc": "Represents an error regarding the eval function."
      },
      "RangeError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RangeError",
        "!doc": "Represents an error when a number is not within the correct range allowed."
      },
      "TypeError": {
        "!type": "fn(message: string)",
        "prototype": "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/TypeError",
        "!doc": "Represents an error an error when a value is not of the expected type."
      },
      "parseInt": {
        "!type": "fn(string: string, radix?: number) -> number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseInt",
        "!doc": "Parses a string argument and returns an integer of the specified radix or base."
      },
      "parseFloat": {
        "!type": "fn(string: string) -> number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseFloat",
        "!doc": "Parses a string argument and returns a floating point number."
      },
      "isNaN": {
        "!type": "fn(value: number) -> bool",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isNaN",
        "!doc": "Determines whether a value is NaN or not. Be careful, this function is broken. You may be interested in ECMAScript 6 Number.isNaN."
      },
      "isFinite": {
        "!type": "fn(value: number) -> bool",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isFinite",
        "!doc": "Determines whether the passed value is a finite number."
      },
      "eval": {
        "!type": "fn(code: string) -> ?",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/eval",
        "!doc": "Evaluates JavaScript code represented as a string."
      },
      "encodeURI": {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURI",
        "!doc": "Encodes a Uniform Resource Identifier (URI) by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two \"surrogate\" characters)."
      },
      "encodeURIComponent": {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent",
        "!doc": "Encodes a Uniform Resource Identifier (URI) component by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two \"surrogate\" characters)."
      },
      "decodeURI": {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURI",
        "!doc": "Decodes a Uniform Resource Identifier (URI) previously created by encodeURI or by a similar routine."
      },
      "decodeURIComponent": {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURIComponent",
        "!doc": "Decodes a Uniform Resource Identifier (URI) component previously created by encodeURIComponent or by a similar routine."
      },
      "Math": {
        "E": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/E",
          "!doc": "The base of natural logarithms, e, approximately 2.718."
        },
        "LN2": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN2",
          "!doc": "The natural logarithm of 2, approximately 0.693."
        },
        "LN10": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN10",
          "!doc": "The natural logarithm of 10, approximately 2.302."
        },
        "LOG2E": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG2E",
          "!doc": "The base 2 logarithm of E (approximately 1.442)."
        },
        "LOG10E": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG10E",
          "!doc": "The base 10 logarithm of E (approximately 0.434)."
        },
        "SQRT1_2": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT1_2",
          "!doc": "The square root of 1/2; equivalently, 1 over the square root of 2, approximately 0.707."
        },
        "SQRT2": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT2",
          "!doc": "The square root of 2, approximately 1.414."
        },
        "PI": {
          "!type": "number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/PI",
          "!doc": "The ratio of the circumference of a circle to its diameter, approximately 3.14159."
        },
        "abs": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/abs",
          "!doc": "Returns the absolute value of a number."
        },
        "cos": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/cos",
          "!doc": "Returns the cosine of a number."
        },
        "sin": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sin",
          "!doc": "Returns the sine of a number."
        },
        "tan": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/tan",
          "!doc": "Returns the tangent of a number."
        },
        "acos": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/acos",
          "!doc": "Returns the arccosine (in radians) of a number."
        },
        "asin": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin",
          "!doc": "Returns the arcsine (in radians) of a number."
        },
        "atan": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan",
          "!doc": "Returns the arctangent (in radians) of a number."
        },
        "atan2": {
          "!type": "fn(y: number, x: number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan2",
          "!doc": "Returns the arctangent of the quotient of its arguments."
        },
        "ceil": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/ceil",
          "!doc": "Returns the smallest integer greater than or equal to a number."
        },
        "floor": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/floor",
          "!doc": "Returns the largest integer less than or equal to a number."
        },
        "round": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/round",
          "!doc": "Returns the value of a number rounded to the nearest integer."
        },
        "exp": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/exp",
          "!doc": "Returns Ex, where x is the argument, and E is Euler's constant, the base of the natural logarithms."
        },
        "log": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/log",
          "!doc": "Returns the natural logarithm (base E) of a number."
        },
        "sqrt": {
          "!type": "fn(number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sqrt",
          "!doc": "Returns the square root of a number."
        },
        "pow": {
          "!type": "fn(number, number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/pow",
          "!doc": "Returns base to the exponent power, that is, baseexponent."
        },
        "max": {
          "!type": "fn(number, number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/max",
          "!doc": "Returns the largest of zero or more numbers."
        },
        "min": {
          "!type": "fn(number, number) -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/min",
          "!doc": "Returns the smallest of zero or more numbers."
        },
        "random": {
          "!type": "fn() -> number",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random",
          "!doc": "Returns a floating-point, pseudo-random number in the range [0, 1) that is, from 0 (inclusive) up to but not including 1 (exclusive), which you can then scale to your desired range."
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math",
        "!doc": "A built-in object that has properties and methods for mathematical constants and functions."
      },
      "JSON": {
        "parse": {
          "!type": "fn(json: string, reviver?: fn(key: string, value: ?) -> ?) -> ?",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/parse",
          "!doc": "Parse a string as JSON, optionally transforming the value produced by parsing."
        },
        "stringify": {
          "!type": "fn(value: ?, replacer?: fn(key: string, value: ?) -> ?, space?: string|number) -> string",
          "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify",
          "!doc": "Convert a value to JSON, optionally replacing values if a replacer function is specified, or optionally including only the specified properties if a replacer array is specified."
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JSON",
        "!doc": "JSON (JavaScript Object Notation) is a data-interchange format.  It closely resembles a subset of JavaScript syntax, although it is not a strict subset. (See JSON in the JavaScript Reference for full details.)  It is useful when writing any kind of JavaScript-based application, including websites and browser extensions.  For example, you might store user information in JSON format in a cookie, or you might store extension preferences in JSON in a string-valued browser preference."
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/provider.lazyloader.js */
angular.module('sn.$sp').provider('lazyLoader', function() {
  "use strict";
  var config = {};
  var propsCache = {};
  var directivesCache = {};
  this.set = function(value) {
    config = value;
  };

  function directiveExists(name) {
    if (directivesCache[name]) {
      return true;
    }
    directivesCache[name] = true;
    return false;
  }

  function isProviderLoaded(provider) {
    if (provider.type === 'directive') {
      return directiveExists(provider.name);
    }
    if (propsCache[provider.name]) {
      return true;
    }
    propsCache[provider.name] = true;
    return false;
  }
  this.$get = ['$controller', '$templateCache', '$ocLazyLoad', function($controller, $templateCache, $ocLazyLoad) {
    return {
      directive: config.directive,
      directiveExists: directiveExists,
      controller: config.register,
      putTemplates: function(templates) {
        for (var i in templates) {
          $templateCache.put(i, templates[i]);
        }
      },
      providers: function(provList) {
        var provider, script, result = [];
        for (var i in provList) {
          if (!provList.hasOwnProperty(i))
            continue;
          provider = provList[i];
          if (!isProviderLoaded(provider)) {
            eval("script=" + provider.script);
            result[i] = config[provider.type](provider.name, script);
          }
        }
        return result;
      },
      dependencies: function(depsList) {
        var deps = depsList.map(function(item) {
          var files = item.files.map(function(file) {
            var types = {
              script: 'js',
              link: 'css'
            };
            return {
              type: types[file.type],
              path: file.url
            }
          });
          if (files.length == 1)
            return files[0];
          var result = {
            files: files,
            serie: true
          };
          if (item.module.length > 0)
            result.module = item.module;
          return result;
        });
        return $ocLazyLoad.load(deps);
      }
    };
  }];
});;
/*! RESOURCE: /scripts/app.$sp/factory.spServer.js */
angular.module('sn.$sp').factory('spServer', function(spUtil) {
  "use strict";

  function set(scope) {
    return {
      get: function(data) {
        return spUtil.get(scope, data);
      },
      update: function() {
        return spUtil.update(scope);
      },
      refresh: function() {
        return spUtil.refresh(scope);
      }
    }
  }
  return {
    set: set
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spOnTransition.js */
angular.module('sn.$sp').directive('spOnTransition', function($rootScope) {
  function detectEvent() {
    var t, el = document.createElement("test");
    var transitions = {
      "transition": "transitionend",
      "OTransition": "oTransitionEnd",
      "MozTransition": "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    };
    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }
  var transition = detectEvent();
  return {
    restrict: 'A',
    scope: {
      spOnTransition: '='
    },
    link: function(scope, element) {
      $(element).on(transition, function() {
        $rootScope.$broadcast(scope.spOnTransition.event);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spContextMenu.js */
angular.module('sn.$sp').directive('spContextMenu', ["$parse", "$q", function($parse, $q) {
  var contextMenus = [];
  var removeContextMenus = function(level) {
    while (contextMenus.length && (!level || contextMenus.length > level)) {
      contextMenus.pop().remove();
    }
    if (contextMenus.length == 0 && $currentContextMenu) {
      $currentContextMenu.remove();
    }
  };
  var $currentContextMenu = null;
  var renderContextMenu = function($scope, event, options, model, level) {
    if (!level) {
      level = 0;
    }
    if (!$) {
      var $ = angular.element;
    }
    $(event.currentTarget).addClass('context');
    var $contextMenu = $('<div>');
    if ($currentContextMenu) {
      $contextMenu = $currentContextMenu;
    } else {
      $currentContextMenu = $contextMenu;
    }
    $contextMenu.addClass('dropdown clearfix');
    var $ul = $('<ul>');
    $ul.addClass('dropdown-menu');
    $ul.attr({
      'role': 'menu'
    });
    $ul.css({
      display: 'block',
      "padding-top": '0px',
      position: 'absolute',
      left: event.pageX + 'px',
      top: event.pageY + 'px',
      "z-index": 10000
    });
    var $promises = [];
    angular.forEach(options, function(item, i) {
      var $li = $('<li>');
      if (item === null) {
        $li.addClass('divider');
      } else if (!Array.isArray(item)) {
        $li.css("padding", "10px 15px");
        $li.css("background-color", "#eee");
        $li.css("margin-bottom", "8px");
        $li.text(item);
      } else {
        var nestedMenu = angular.isArray(item[1]) ?
          item[1] : angular.isArray(item[2]) ?
          item[2] : angular.isArray(item[3]) ?
          item[3] : null;
        var $a = $('<a>');
        $a.css("padding-right", "8px");
        $a.attr({
          tabindex: '-1',
          href: '#'
        });
        var text = typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope, event, model);
        $promise = $q.when(text)
        $promises.push($promise);
        $promise.then(function(text) {
          $a.text(text);
          if (nestedMenu) {
            $a.css("cursor", "default");
            $a.append($('<strong style="font-family:monospace;font-weight:bold;float:right;">&gt;</strong>'));
          }
        });
        $li.append($a);
        var enabled = angular.isFunction(item[1]);
        if (enabled) {
          var openNestedMenu = function($event) {
            removeContextMenus(level + 1);
            var ev = {
              pageX: event.pageX + $ul[0].offsetWidth - 1,
              pageY: $ul[0].offsetTop + $li[0].offsetTop - 3
            };
            renderContextMenu($scope, ev, nestedMenu, model, level + 1);
          }
          $li.on('click', function($event) {
            $event.preventDefault();
            $scope.$apply(function() {
              if (nestedMenu) {
                openNestedMenu($event);
              } else {
                $(event.currentTarget).removeClass('context');
                removeContextMenus();
                item[1].call($scope, $scope, event, model, text);
              }
            });
          });
          $li.on('mouseover', function($event) {
            $scope.$apply(function() {
              if (nestedMenu) {
                openNestedMenu($event);
              }
            });
          });
        } else {
          $li.on('click', function($event) {
            $event.preventDefault();
          });
          $li.addClass('disabled');
        }
      }
      $ul.append($li);
    });
    $contextMenu.append($ul);
    var height = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    $contextMenu.css({
      width: '100%',
      height: height + 'px',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 9999
    });
    $(document).find('body').append($contextMenu);
    $q.all($promises).then(function() {
      if (level === 0) {
        var topCoordinate = event.pageY;
        var menuHeight = angular.element($ul[0]).prop('offsetHeight');
        var winHeight = event.view.innerHeight;
        if (topCoordinate > menuHeight && winHeight - topCoordinate < menuHeight) {
          topCoordinate = event.pageY - menuHeight;
        }
        var leftCoordinate = event.pageX;
        var menuWidth = angular.element($ul[0]).prop('offsetWidth');
        var winWidth = event.view.innerWidth;
        if (leftCoordinate > menuWidth && winWidth - leftCoordinate < menuWidth) {
          leftCoordinate = event.pageX - menuWidth;
        }
        $ul.css({
          display: 'block',
          position: 'absolute',
          left: leftCoordinate + 'px',
          top: topCoordinate + 'px'
        });
      }
    });
    $contextMenu.on("mousedown", function(e) {
      if ($(e.target).hasClass('dropdown')) {
        $(event.currentTarget).removeClass('context');
        removeContextMenus();
      }
    }).on('contextmenu', function(event) {
      $(event.currentTarget).removeClass('context');
      event.preventDefault();
      removeContextMenus(level);
    });
    $scope.$on("$destroy", function() {
      removeContextMenus();
    });
    contextMenus.push($ul);
  };
  return function($scope, element, attrs) {
    element.on('contextmenu', function(event) {
      $scope.$apply(function() {
        var options = $scope.$eval(attrs.spContextMenu, {
          event: event
        });
        var model = $scope.$eval(attrs.model);
        if (options instanceof Array) {
          if (options.length === 0)
            return;
          event.stopPropagation();
          event.preventDefault();
          renderContextMenu($scope, event, options, model);
        } else {
          throw '"' + attrs.contextMenu + '" not an array';
        }
      });
    });
  };
}]);;
/*! RESOURCE: /scripts/app.$sp/factory.spInterceptor.js */
angular.module('sn.$sp').factory('spInterceptor', function($q, $rootScope) {
  'use strict';
  var activeRequests = [];
  var ignore = [
    '^/api/now/ui/presence',
    '^/api/now/table/'
  ];

  function createUid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function done(id) {
    for (var x in activeRequests) {
      if (activeRequests[x] === id) {
        activeRequests.splice(x, 1);
      }
    }
    if (activeRequests.length === 0) {
      $rootScope.$broadcast('sp_loading_indicator', false);
      $rootScope.loadingIndicator = false;
    }
  }

  function ignored(url) {
    var reg;
    for (var x in ignore) {
      reg = new RegExp(ignore[x]);
      if (reg.test(url)) {
        return true;
      }
    }
    return false;
  }

  function request(config) {
    if (!ignored(config.url)) {
      config.id = createUid();
      activeRequests.push(config.id);
      $rootScope.$broadcast('sp_loading_indicator', true);
      $rootScope.loadingIndicator = true;
    }
    return config;
  }

  function error(rejection) {
    if (rejection.config.id) {
      done(rejection.config.id);
    }
    return $q.reject(rejection);
  }

  function response(response) {
    if (response.config.id) {
      done(response.config.id);
    }
    return response;
  }
  return {
    request: request,
    requestError: error,
    response: response,
    responseError: error
  };
});;
/*! RESOURCE: /scripts/directive.glyph.js */
angular.module('sn.$sp').directive("glyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      snChar: "@",
    },
    template: '<span class="glyphicon glyphicon-{{snChar}}" />',
    link: function(scope) {}
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spNotifications.js */
angular.module('sn.$sp').directive('spNotifications', function($timeout, spAriaUtil, spAriaFocusManager) {
  var str = 'CONSOLE:';

  function isConsoleMsg(msg) {
    if (!msg)
      return false;
    return msg.startsWith(str);
  }

  function outputToConsole(msg) {
    var output = msg.substring(str.length);
    var reg = new RegExp("^\\{|^\\[");
    if (reg.test(output)) {
      try {
        output = jQuery.parseJSON(output);
      } catch (err) {}
    }
    console.warn(output);
  }
  return {
    restrict: 'E',
    replace: true,
    template: '<div id="uiNotificationContainer">\
<div ng-repeat="m in c.notifications track by $index"\
class="alert" ng-class="m.type == \'error\' ? \'alert-danger\' : \'alert-success\'">\
<span ng-if="m.type == \'error\' " class="fa fa-exclamation-triangle m-r-xs"></span>\
<span ng-bind-html="::m.message"></span>\
<button ng-if="::$first" class="btn btn-link fa fa-close dismiss-notifications" ng-click="::c.dismissNotificationsButton()" aria-label="Close Notification"></button>\
</div>\
</div>',
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.notifications = [];
      var timer;

      function addNotification(notification) {
        if (!notification)
          return;
        if (isConsoleMsg(notification.message)) {
          outputToConsole(notification.message);
          return;
        }
        if (typeof notification.message === "undefined") {
          console.warn("Invalid message \"" + notification + "\" passed to spNotifications directive, expected an Object {type:[type], message:[message]}");
          return;
        }
        c.notifications.push(notification);
        if (spAriaUtil.g_accessibility === "true")
          $scope.focusOnNotification();
        else
          timer = autoDismiss();
      }

      function addNotifications(e, notifications) {
        if (!notifications) {
          console.warn("$$uiNotification event fired with invalid or missing notifications parameter");
          return;
        }
        if (Array.isArray(notifications)) {
          for (var x in notifications)
            addNotification(notifications[x]);
        } else {
          addNotification(notifications);
        }
      }
      $scope.$on("$$uiNotification", addNotifications);
      c.dismissNotificationsButton = function() {
        c.dismissNotifications();
        if (spAriaUtil.g_accessibility) {
          spAriaFocusManager.focusOnPageTitle();
        }
      };
      c.dismissNotifications = function() {
        c.notifications.length = 0;
      };
      c.getMilliSeconds = function() {
        var msgTimeout = (typeof g_notif_timeout !== "undefined") ? g_notif_timeout : 5;
        var seconds = (areTrivial(c.notifications)) ? 3 : msgTimeout;
        return seconds * 1000;
      };

      function areTrivial(input) {
        return input.length >= 1 && input.every(function(item) {
          return item && item.type === 'trivial';
        })
      }

      function autoDismiss() {
        if (timer)
          $timeout.cancel(timer);
        var milliSeconds = c.getMilliSeconds();
        if (milliSeconds > 0)
          return $timeout(c.dismissNotifications, milliSeconds);
      }
      c.cancelAutoDismiss = function() {
        if (areTrivial(c.notifications))
          return;
        $timeout.cancel(timer);
      };
      $scope.$on("$$uiNotification.dismiss", c.dismissNotifications);
    },
    link: function(scope, element, attrs, ctrl) {
      var $el = $(element);
      $el.on('mouseover', function() {
        $el.off();
        ctrl.cancelAutoDismiss();
      });
      scope.focusOnNotification = function() {
        $timeout(function() {
          $('#uiNotificationContainer > .alert').attr('tabIndex', '-1').focus();
        });
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/provider.spNotificationEvents.js */
angular.module('sn.$sp').provider('spNotificationEvents', function() {
  'use strict';
  var _$rootScope;

  function clearMessages() {
    if (!_$rootScope) {
      return;
    }
    _$rootScope.$broadcast("$$uiNotification.dismiss");
  }

  function addMessages(messages) {
    if (!_$rootScope) {
      return;
    }
    _$rootScope.$broadcast("$$uiNotification", messages);
  }
  this.clearMessages = clearMessages;
  this.addMessages = addMessages;
  this.$get = function($rootScope) {
    _$rootScope = $rootScope;
    return {
      clearMessages: clearMessages,
      addMessages: addMessages
    };
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spIs.js */
angular.module('sn.$sp').factory('spIs', function() {
  function email(input) {
    var regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(input);
  }
  return {
    an: {
      email: email
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spThrottle.js */
angular.module('sn.$sp').factory('spThrottle', ['$timeout', function($timeout) {
  return function(callback, delay) {
    var wait = false;
    return function() {
      if (!wait) {
        callback.call();
        wait = true;
        $timeout(function() {
          wait = false;
        }, delay);
      }
    }
  };
}]);;
/*! RESOURCE: /scripts/app.$sp/service.spModal.js */
angular.module('sn.$sp').factory('spModal', function($q, spUtil, $http, $uibModal, i18n) {
  "use strict";

  function alert(message) {
    var options = {
      title: message,
      buttons: [{
        label: i18n.getMessage('OK'),
        primary: true
      }]
    }
    return alertConfirm(options);
  }

  function confirm(message) {
    var options = {
      title: message
    }
    return alertConfirm(options);
  }

  function alertConfirm(options) {
    options.messageOnly = true;
    if (options.title.length < 25)
      options.size = 'sm'
    var defer = $q.defer();
    open(options).then(function() {
      defer.resolve(true);
    }, function() {
      defer.reject(false);
    })
    return defer.promise;
  }

  function prompt(message, defaultValue) {
    var options = {
      title: message,
      input: true,
      value: defaultValue,
      headerStyle: {
        border: 'none',
        'padding-bottom': 0
      },
      footerStyle: {
        border: 'none',
        'padding-top': 0
      }
    }
    var defer = $q.defer();
    open(options).then(function(value) {
      defer.resolve(value);
    }, function() {
      defer.reject(null);
    })
    return defer.promise;
  }

  function open(options) {
    options = initOptions(options);
    var defer = $q.defer();
    if (options.widget) {
      var widgetURL = spUtil.getWidgetURL(options.widget);
      $http.post(widgetURL, options.widgetInput).success(function(response) {
        options.widget = response.result;
        options.widget.options.shared = options.shared;
        _open(options, defer);
      });
    } else
      _open(options, defer);
    return defer.promise;
  }

  function _open(options, defer) {
    var pageRoot = angular.element('.sp-page-root');
    var modal = $uibModal.open({
      templateUrl: 'sp-modal.html',
      controller: spModalCtrl,
      size: options.size,
      backdrop: options.backdrop != undefined ? options.backdrop : true,
      keyboard: options.keyboard != undefined ? options.keyboard : true,
      resolve: {
        options: function() {
          return options;
        }
      }
    });
    modal.result.then(function(result) {
      if (options.input) {
        defer.resolve(result.input, result.button);
      } else {
        defer.resolve(result.button);
      }
    }, function() {
      defer.reject();
    });
    modal.rendered.then(function() {
      var h1 = angular.element('#modal-title');
      var modal = h1.closest('div.modal');
      modal.attr('aria-labelledby', 'modal-title');
      pageRoot.attr('aria-hidden', 'true');
    });
    modal.closed.then(function() {
      pageRoot.attr('aria-hidden', 'false');
    });
  }

  function initOptions(options) {
    var defaults = {
      title: '',
      message: '',
      messageOnly: false,
      errorMessage: '',
      input: false,
      label: '',
      size: '',
      value: '',
      required: false,
      values: false,
      onSubmit: null,
      widget: null,
      widgetInput: null,
      noDismiss: false,
      buttons: [{
          label: i18n.getMessage('Cancel'),
          cancel: true
        },
        {
          label: i18n.getMessage('OK'),
          primary: true
        }
      ]
    };
    options = options || {};
    for (var key in defaults) {
      if (options[key] === undefined) {
        options[key] = defaults[key];
      }
    }
    if (options.messageOnly) {
      options.headerStyle = {
        border: 'none'
      }
      options.footerStyle = {
        border: 'none',
        'padding-top': 0
      }
    }
    if (options.noDismiss)
      options.headerStyle = {
        display: 'none'
      };
    return options;
  }

  function spModalCtrl($scope, options) {
    $scope.input = {
      value: options.value
    };
    $scope.options = options;
    $scope.form = {};
    if (!options.input) {
      options.buttons.forEach(function(b) {
        if (b.primary)
          b.focus = true;
      })
    }
    $scope.buttonClicked = function(button) {
      if (button.cancel) {
        $scope.$dismiss();
        return;
      }
      if (options.input && $scope.form.xpForm.$invalid) {
        $scope.changed = true;
        return;
      }
      if (options.onSubmit) {
        var promise = options.onSubmit();
        promise.then(function(res) {
          if (!res.status) {
            $scope.options.errorMessage = res.errorMessage;
            return;
          } else {
            $scope.$close({
              button: button,
              input: $scope.input.value
            });
          }
        });
      } else {
        $scope.$close({
          button: button,
          input: $scope.input.value
        });
      }
    }
    $scope.submit = function() {
      var ok;
      angular.forEach($scope.options.buttons, function(button) {
        if (button.primary)
          ok = button;
      })
      if (ok) $scope.buttonClicked(ok);
    }
    $scope.keyPress = function(keyCode) {
      if (keyCode === 13) {
        $scope.submit();
      }
    }
  }
  var spModal = {
    alert: alert,
    confirm: confirm,
    prompt: prompt,
    open: open
  };
  return spModal;
})
angular.module('sn.$sp').directive('spFocusIf', function focusIf($timeout) {
  function link($scope, $element, $attrs) {
    var dom = $element[0];
    if ($attrs.spFocusIf)
      $scope.$watch($attrs.spFocusIf, focus);
    else
      focus(true);

    function focus(condition) {
      if (condition) {
        $timeout(function() {
          dom.focus();
        }, $scope.$eval($attrs.spFocusDelay) || 0);
      }
    }
  }
  return {
    restrict: 'A',
    link: link
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spTextarea.js */
angular.module('sn.$sp').directive('spTextarea', function($window, $rootScope) {
  'use strict';

  function autosizeAsync(scope, element) {
    scope.$applyAsync(function() {
      if (scope.field.isVisible()) {
        $window.requestAnimationFrame(function() {
          $window.autosize.update(element);
        });
      }
    });
  }
  return {
    scope: {
      field: '='
    },
    require: '^ngModel',
    template: '<textarea ng-attr-placeholder="{{field.placeholder}}" style="resize:vertical;"/>',
    restrict: 'E',
    replace: true,
    link: function(scope, element, attr, ngModel) {
      $window.autosize(element);
      var render0 = ngModel.$render;
      ngModel.$render = function() {
        render0();
        autosizeAsync(scope, element);
      }
      var isHiddenOnRender = !scope.field.isVisible();
      if (isHiddenOnRender) {
        $rootScope.$on('field.change', function() {
          if (scope.field.isVisible())
            autosizeAsync(scope, element);
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spAria.js */
angular.module('sn.$sp')
  .factory('spAriaUtil', function($window) {
    'use strict';
    var g_accessibility = $window.g_accessibility;

    function link(role, forced, index) {
      return function($scope, $element, attr) {
        if (g_accessibility && (_.isEmpty(attr['role']) || forced))
          $element.attr('role', role);
        tabindex($element, attr, index);
      }
    }

    function tabindex($element, attr, index) {
      if (!_.isEmpty(attr['tabindex']))
        index = attr['tabindex'];
      if (!_.isEmpty(index))
        $element.attr('tabindex', index);
    }

    function attr($element, name, value) {
      if (g_accessibility)
        $element.attr(name, value);
    }
    var liveMessageHandler;

    function registerLiveMessageHandler(callbackFn) {
      liveMessageHandler = callbackFn;
    }

    function sendLiveMessage(message) {
      if (liveMessageHandler)
        liveMessageHandler(message);
    }

    function isAccessibilityEnabled() {
      return g_accessibility === true || g_accessibility === 'true';
    }
    return {
      link: link,
      tabindex: tabindex,
      g_accessibility: g_accessibility,
      sendLiveMessage: sendLiveMessage,
      onLiveMessage: registerLiveMessageHandler,
      isAccessibilityEnabled: isAccessibilityEnabled
    }
  })
  .directive('spa11y', function(spAriaUtil) {
    function link($scope, $element, attr) {
      $element.attr('accessibility', g_accessibility);
    }
    return {
      restrict: 'A',
      link: link
    }
  })
  .directive('spAria', function(spAriaUtil) {
    function link($scope, $element, attr) {
      var role = attr['spAria'];
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        $element.attr('role', role);
    }
    return {
      restrict: 'A',
      link: link
    }
  })
  .directive('body', function(spAriaUtil, spAriaFocusManager, $location) {
    return {
      restrict: 'E',
      link: function(scope, elem) {
        angular.element(elem, 'a').on('click', function() {
          scope.$applyAsync(function() {
            spAriaFocusManager.navigateToLink($location.url());
          });
        });
      }
    }
  })
  .directive('form', function(spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('form')
    }
  })
  .directive('img', function(spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('presentation')
    }
  })
  .directive('textarea', function(spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('textbox', false, 0)
    }
  })
  .directive('input', function(spAriaUtil) {
    function link($scope, $element, attr) {
      var role;
      switch (attr['type']) {
        case 'email':
        case 'password':
        case 'tel':
        case 'text':
        case 'url':
          role = 'textbox';
          break;
        case 'button':
        case 'checkbox':
        case 'radio':
          role = attr['type'];
          break;
        case 'hidden':
          break;
        case 'image':
        case 'reset':
        case 'submit':
          role = 'button';
          break;
        case 'number':
          role = 'spinbutton';
          break;
        case 'range':
          role = 'slider';
          break;
        case 'search':
          role = 'searchbox';
          break;
      }
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        spAriaUtil.link(role, false, 0)($scope, $element, attr);
    }
    return {
      restrict: 'E',
      link: link
    }
  })
  .directive('span', function(spAriaUtil) {
    function link($scope, $element, attr) {
      var role;
      if (attr['style'] && attr['style'].indexOf('background') > -1) {
        role = 'presentation';
        attr['aria-hidden'] = true;
      }
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        spAriaUtil.link(role, false, 0)($scope, $element, attr);
    }
    return {
      restrict: 'E',
      link: link
    }
  })
  .directive('role', function(spAriaUtil) {
    function link($scope, $element, attr) {
      var role = attr['role'];
      if (role === 'slider') {
        spAriaUtil.tabindex($element, attr, -1);
        $element.find('i[aria-valuetext]').each(function(idx, el) {
          $(el).attr('tabindex', 0);
        });
      }
    }
    return {
      restrict: 'A',
      link: link
    }
  })
  .directive('spAriaLive', function(spAriaUtil) {
    function link(scope, elem, attr) {
      scope.message = "";
      spAriaUtil.onLiveMessage(function(msg) {
        scope.message = msg;
        setTimeout(function() {
          scope.message = "";
        }, 1000);
      });
    }
    return {
      template: '<div class="sr-only" aria-live="assertive">{{message}}</div>',
      restrict: 'E',
      link: link
    }
  });;
/*! RESOURCE: /scripts/app.$sp/directive.spAriaPageTitle.js */
angular.module("sn.$sp").directive('spAriaPageTitle', function(spAriaFocusManager) {
  function link(scope, elem, attr) {
    spAriaFocusManager.registerPageTitleFocus(function() {
      scope.$applyAsync(function() {
        elem.attr('tabIndex', '-1').focus();
      });
    });
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      pageTitle: '='
    },
    template: "<h1 class='sr-only'>{{pageTitle}}</h1>",
    link: link
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spAriaFocusManager.js */
angular.module('sn.$sp').service("spAriaFocusManager", function() {
  var danglingNavigation;
  var onPageLoadHandlerCallback;

  function linkHandler(newLinkRoute) {
    danglingNavigation = newLinkRoute;
  }

  function pageLoadComplete(newPageRoute) {
    if (newPageRoute == danglingNavigation && onPageLoadHandlerCallback) {
      onPageLoadHandlerCallback();
    }
    danglingNavigation = null;
  }

  function registerPageTitleCallback(pageLoadHandlerFn) {
    onPageLoadHandlerCallback = pageLoadHandlerFn;
  }

  function focusOnPageTitle() {
    if (onPageLoadHandlerCallback) {
      onPageLoadHandlerCallback();
    }
  }
  return {
    navigateToLink: linkHandler,
    pageLoadComplete: pageLoadComplete,
    registerPageTitleFocus: registerPageTitleCallback,
    focusOnPageTitle: focusOnPageTitle
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spAnnouncement.js */
angular.module('sn.$sp').factory('spAnnouncement', function($rootScope, $http, $window, $timeout, $q, spConf, spUtil) {
  'use strict';
  var _initialized = false;
  var _initializing = false;
  var _sessionId = $window.NOW.session_id;
  var _all = [];
  var _list = [];

  function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function _cleanupStorage() {
    for (var key in $window.localStorage) {
      if (!$window.localStorage.hasOwnProperty(key)) {
        return;
      }
      if (key.indexOf('dismissed_announcement_') === 0 && $window.localStorage.getItem(key) !== _sessionId) {
        $window.localStorage.removeItem(key)
      }
    }
  }

  function _handleHttpError(res) {
    console.log(spUtil.format('*** [HTTP::{code}] Unable to retrieve announcement', {
      code: res.status
    }));
  }

  function _buildReq(path, method) {
    return {
      method: method ? method : 'GET',
      url: path ? spConf.announcementApi + '/' + path : spConf.announcementApi,
      headers: {
        'X-PORTAL-ID': $rootScope.portal_id
      }
    };
  }

  function _filterType(type) {
    return function(announcement) {
      if (!type) {
        return true;
      }
      var filterTypes = type.trim().toLowerCase().split(',');
      var types = announcement.type.trim().toLowerCase().split(',');
      for (var i = 0; i < types.length; i++) {
        for (var j = 0; j < filterTypes.length; j++) {
          if (types[i].trim() === filterTypes[j].trim()) {
            return true;
          }
        }
      }
      return false;
    }
  }

  function _filter(list, query, limit, page) {
    var result = [];
    if (!query) {
      result = list;
    } else {
      result = list.filter(function(a) {
        var include = false;
        try {
          if (typeof(query) === 'function') {
            include = query(a);
          } else if (query.key) {
            include = a[query.key] === query.value;
          }
        } catch (e) {
          console.log('*** spAnnouncement.service: unable to process filter', e);
        }
        return include;
      });
    }
    if (limit && page) {
      if (!result.length) {
        return {
          data: result,
          page: 0,
          totalPages: 0,
          totalRecords: 0
        };
      }
      limit = parseInt(limit, 10);
      page = parseInt(page + '', 10);
      var offset = (page - 1) * limit;
      return {
        data: result.slice(offset, offset + limit),
        page: page,
        totalPages: Math.ceil(result.length / limit),
        totalRecords: result.length
      };
    }
    return result;
  }

  function _remove(id, list) {
    return list.filter(function(a) {
      return a.id !== id;
    });
  }

  function _sessionDismissed(id) {
    return $window.localStorage.getItem('dismissed_announcement_' + id) === _sessionId;
  }

  function _dismiss(id) {
    var announcement = _.find(_all, {
      id: id
    });
    if (announcement.dismissOption === 'SESSION_DISMISSIBLE' || !$rootScope.user.logged_in) {
      try {
        $window.localStorage.setItem('dismissed_announcement_' + id, _sessionId);
      } catch (e) {}
    } else {
      $http(_buildReq(id + '/dismiss', 'POST'));
    }
    announcement.dismissed = true;
    _processAnnouncements();
  }

  function _processAnnouncements() {
    _list = [];
    _all.forEach(function(a) {
      if (a.dismissed || ((a.dismissOption === 'SESSION_DISMISSIBLE' || !$rootScope.user.logged_in)) && _sessionDismissed(a.id)) {
        a.dismissed = true;
      }
      _list.push(a);
    });
    $rootScope.$broadcast(spConf.e.announcement);
  }

  function _subscribe(scope, callback) {
    var handler = scope.$on(spConf.e.announcement, callback);
    scope.$on('$destroy', handler);
  }

  function _getAnnouncements(announcements) {
    if (announcements) {
      return $q(function(resolve) {
        _all = announcements;
        resolve();
      });
    }
    return $http(_buildReq()).then(function(res) {
      _all = res.data.result;
    }, _handleHttpError);
  }

  function _init(announcements) {
    if (_initialized || _initializing || $window.NOW.sp.disableAnnouncements) {
      return $q(function(resolve) {
        resolve();
      });
    }
    _initializing = true;
    return _getAnnouncements(announcements).then(function() {
      _processAnnouncements();
      $rootScope.$evalAsync(_cleanupStorage);
      _initialized = true;
      _initializing = false;
    });
  }
  return {
    init: _init,
    subscribe: _subscribe,
    dismiss: _dismiss,
    filterOnType: _filterType,
    get: function(query, limit, page) {
      return _clone(_filter(_list, query, limit, page));
    }
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spAnnouncements.js */
angular.module('sn.$sp').directive('spAnnouncements', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_announcements.xml',
    controllerAs: 'c',
    controller: function($scope, spAnnouncement, spAriaUtil, i18n) {
      var c = this;
      var _announcements;
      c.showAll = false;
      c.announcements = [];
      c.totalAnnouncements = 0;
      c.accessibilityOff = spAriaUtil.g_accessibility === 'false';
      c.i18n = {
        oneOf: i18n.getMessage('1 of'),
        dismiss: i18n.getMessage('Dismiss'),
        collapse: i18n.getMessage('Collapse'),
        expand: i18n.getMessage('Expand'),
        announcement: i18n.getMessage('announcement'),
        announcements: i18n.getMessage('announcements'),
        moreInfo: i18n.getMessage('More information about')
      };

      function _updateCurrentAnnouncements() {
        c.announcements = c.showAll ? _announcements : [_announcements[0]];
      }

      function _getCurrentAnnouncements() {
        c.totalAnnouncements = 0;
        _announcements = spAnnouncement.get(function(announcement) {
          return !announcement.dismissed && spAnnouncement.filterOnType('banner')(announcement);
        });
        if (_announcements.length) {
          c.totalAnnouncements = _announcements.length;
          _announcements = c.totalAnnouncements > 0 ? _announcements : [];
          _updateCurrentAnnouncements();
        }
      }
      c.dismiss = function(id) {
        spAnnouncement.dismiss(id);
      };
      c.toggleShowAll = function() {
        c.showAll = !c.showAll;
        _updateCurrentAnnouncements();
      }
      c.getMaxHeight = function() {
        var viewportHeight = $(window).height();
        if (c.showAll) {
          return viewportHeight;
        }
      }
      c.getStyle = function(announcement) {
        var style = announcement.displayStyle || {};
        return {
          backgroundColor: style.backgroundColor || '#006ed5',
          color: style.foregroundColor || '#ffffff',
          textAlign: (style.alignment || 'left').toLowerCase()
        };
      };
      c.getFirstStyle = function() {
        return c.getStyle(c.announcements[0]);
      };
      c.getJustifyContentValue = function(announcement) {
        return (announcement.displayStyle || {}).alignment === 'CENTER' ? 'center' : 'flex-start';
      };
      c.linkSetup = function(a) {
        a.linkTarget = '_self';
        if ('urlNew' === a.clickTarget) {
          a.linkTarget = '_blank';
        }
        a.linkType = !a.targetLink ? 'none' : a.targetLinkText ? 'normal' : 'title';
      };
      c.getAlignementContentValue = function(announcement) {
        return (announcement.displayStyle || {}).alignment === 'CENTER' ? 'static' : 'absolute';
      }
      spAnnouncement.subscribe($scope, _getCurrentAnnouncements);
      _getCurrentAnnouncements();
      $(document).ready(function() {
        $('body').tooltip({
          selector: '[data-toggle="tooltip"]'
        });
      });
    }
  }
});;
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
/*! RESOURCE: /scripts/app.$sp/service.spMetatags.js */
angular.module('sn.$sp').factory('spMetatagService', function() {
  'use strict';
  var metatagMap = {};
  var subscribeCallbackArr = [];

  function notifySubscribers() {
    for (var i = 0; i < subscribeCallbackArr.length; i++) {
      subscribeCallbackArr[i](metatagMap);
    }
  }
  return {
    setTags: function(tagArr) {
      metatagMap = {};
      if (tagArr && tagArr.length) {
        for (var i = 0; i < tagArr.length; i++) {
          metatagMap[tagArr[i].name] = tagArr[i].content;
        }
      }
      notifySubscribers();
    },
    subscribe: function(callback) {
      subscribeCallbackArr.push(callback);
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spMetatags.js */
angular.module('sn.$sp').directive('spMetatags', function(spMetatagService, $window) {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      spMetatagService.subscribe(function(tags) {
        elem.find("meta[custom-tag]").remove();
        for (var key in tags) {
          var tagElement = $window.document.createElement("meta");
          tagElement.setAttribute("custom-tag", "");
          tagElement.setAttribute("name", key);
          tagElement.setAttribute("content", tags[key]);
          elem.append(tagElement);
        }
      })
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spUIActionsExecuter.js */
angular.module('sn.$sp').factory('spUIActionsExecuter', function($q, glideUIActionsApi, spModal, i18n, $http, spAuthentication, glideUserSession, cabrillo, $cookies, spAuthModal, spNotificationEvents) {
  'use strict';
  var NOW_REAUTHENTICATE_CODE = 'NOW.REAUTHENTICATE';

  function executeListAction(actionSysId, tableName, recordSysId, requestParams) {
    return execute(actionSysId, 'list', tableName, recordSysId, undefined, undefined, requestParams)
  }

  function executeFormAction(actionSysId, tableName, recordSysId, fields, encodedRecord, requestParams) {
    return execute(actionSysId, 'form', tableName, recordSysId, fields, encodedRecord, requestParams);
  }

  function execute(actionSysId, type, tableName, recordSysId, fields, encodedRecord, requestParams) {
    var $request = glideUIActionsApi.execute(
      actionSysId,
      type,
      tableName,
      recordSysId,
      fields,
      encodedRecord,
      requestParams
    );
    return $request.then(function(response) {
      var result = response.data.result,
        username = requestParams.username,
        userSysId = requestParams.userSysId;
      return retrieveSessionMessages().then(function(sessionMessagesResponse) {
        spNotificationEvents.addMessages(sessionMessagesResponse.data.result.$$uiNotification);
        if (result.response_code === NOW_REAUTHENTICATE_CODE) {
          return spAuthModal.prompt(requestParams, username, userSysId).then(function() {
            spNotificationEvents.clearMessages();
            if (!angular.isDefined(requestParams)) {
              requestParams = {};
            }
            requestParams[NOW_REAUTHENTICATE_CODE] = userSysId;
            return execute(
              actionSysId,
              type,
              tableName,
              recordSysId,
              fields,
              encodedRecord,
              requestParams
            );
          }, function() {
            console.error("Re-auth failed");
          });
        }
      })
    });
  }

  function retrieveSessionMessages() {
    return $http({
      method: 'GET',
      url: '/api/now/sp/sessionuinotifications'
    });
  }
  return {
    executeListAction: executeListAction,
    executeFormAction: executeFormAction
  };
});;
/*! RESOURCE: /scripts/app.$sp/service.spAuthentication.js */
angular.module('sn.$sp').factory('spAuthentication', function($window, $q, $http, spUtil, i18n) {
  'use strict';
  var genericError = i18n.getMessage('There was an error processing your request');
  var sessionUsername = $window.NOW.user_name;
  var authEndpoint = spUtil.getURL({
    sysparm_type: 'view_form.login'
  });

  function _success() {
    return $q(function(resolve) {
      resolve({
        success: true
      });
    });
  }

  function _error(message) {
    return $q(function(resolve) {
      resolve({
        success: false,
        message: message || genericError
      });
    });
  }

  function _authenticate(username, password, additionalOptions) {
    var options = {
      'sysparm_type': 'login',
      'ni.nolog.user_password': true,
      'user_name': username,
      'user_password': password
    };
    return $http({
      method: 'post',
      url: authEndpoint,
      data: $.param(_.extend({}, options, additionalOptions || {})),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function(response) {
      if (!response.data) {
        return _error();
      }
      if (response.data.status !== 'success') {
        return _error(response.data.message);
      }
      return _success();
    }, function(error) {
      return _error();
    });
  }

  function _validate(username, password) {
    if (username !== sessionUsername) {
      return _error(i18n.getMessage('Specified username does not match with the username of currently logged in user'));
    }
    return _authenticate(username, password);
  }
  return {
    validateCreds: _validate
  };
});;
/*! RESOURCE: /scripts/app.$sp/service.spAuthModal.js */
angular.module('sn.$sp').factory('spAuthModal', function($q, spModal, i18n, $http, spAuthentication, glideUserSession, cabrillo, $cookies, $window, spUtil, $uibModal) {
  "use strict";

  function _showAuthenticationModal(requestParams, username, userSysId) {
    var currentUser;
    var deferred = $q.defer();
    glideUserSession.loadCurrentUser({
      reload: true
    }).then(function(user) {
      if (!user) {
        deferred.reject({
          error: {
            status: 'ANONYMOUS',
            message: i18n.getMessage('Not logged in')
          }
        });
        return;
      }
      currentUser = user;
      var serializedUser = {
        sysId: currentUser.userID,
        userName: currentUser.userName,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName
      };
      if (cabrillo.isNative()) {
        cabrillo.auth.reauthenticate(currentUser).then(function() {
          deferred.resolve(serializedUser);
        }, function(error) {
          if (error && error.status) {
            deferred.reject({
              error: error
            });
          }
          deferred.reject();
        });
        return;
      }
      var loginMethod = currentUser.$private.loginMethod;
      if (!loginMethod) {
        var providerSysId = $cookies.get('glide_sso_id');
        loginMethod = providerSysId ? 'saml' : 'db';
      }
      if (loginMethod === 'saml') {
        glideUserSession.getSsoReauthenticationUrl().then(function(url) {
          requestParams.externalLoginURL = url;
          var modal;
          openExternalAuthModal(requestParams).then(function(m) {
            modal = m;
          });
          $window.onReauthenticationComplete = function(result) {
            deferred.resolve(serializedUser);
            modal.close();
          };
        });
      } else {
        spModal.open({
          title: i18n.getMessage("Approver authentication"),
          message: i18n.getMessage("Additional authentication is required, enter your usename and password to continue."),
          footerStyle: {
            border: 'none',
            'padding-top': 0
          },
          widget: 'simpleloginui',
          widgetInput: {},
          shared: requestParams,
          onSubmit: function() {
            return onLoginModalSubmit(requestParams, username);
          }
        }).then(function(confirm) {
          if (confirm.label == "OK") {
            deferred.resolve(serializedUser);
          } else {
            deferred.reject();
          }
        });
      }
    });
    return deferred.promise;
  }

  function onLoginModalSubmit(requestParams, username) {
    return $q(function(resolve, reject) {
      var errorMessage = null;
      if (!requestParams.username || requestParams.username.trim() === "" ||
        !requestParams.password || requestParams.password.trim() === "") {
        errorMessage = i18n.getMessage("User name or password invalid");
      } else if (requestParams.username !== username) {
        errorMessage = i18n.getMessage("Attempted to authenticate as a different user");
      }
      if (!errorMessage || errorMessage === "") {
        spAuthentication.validateCreds(requestParams.username, requestParams.password).then(function(res) {
          resolve({
            status: res.success,
            errorMessage: res.message
          });
        });
      } else {
        resolve({
          status: !errorMessage || errorMessage === "",
          errorMessage: errorMessage
        });
      }
    });
  }

  function openExternalAuthModal(requestParams) {
    var deferred = $q.defer();
    var options = {
      title: i18n.getMessage("Approver authentication"),
      message: '',
      messageOnly: false,
      errorMessage: '',
      input: false,
      label: '',
      size: 'lg',
      value: '',
      required: false,
      footerStyle: {
        border: 'none',
        'padding-top': 0
      },
      values: false,
      onSubmit: null,
      widget: 'simpleloginui',
      widgetInput: {},
      shared: requestParams,
      buttons: [{
        label: i18n.getMessage('Cancel'),
        cancel: true
      }]
    };
    var widgetURL = spUtil.getWidgetURL(options.widget);
    $http.post(widgetURL, options.widgetInput).success(function(response) {
      options.widget = response.result;
      options.widget.options.shared = options.shared;
      var modal = $uibModal.open({
        templateUrl: 'sp-modal.html',
        controller: spModalCtrl,
        size: options.size,
        resolve: {
          options: function() {
            return options;
          }
        }
      });
      deferred.resolve(modal);
    });
    return deferred.promise;
  }

  function spModalCtrl($scope, options) {
    $scope.options = options;
    $scope.form = {};
    $scope.buttonClicked = function(button) {
      if (button.cancel) {
        $scope.$dismiss();
        return;
      }
    }
  }
  return {
    prompt: _showAuthenticationModal
  }
});
/*! RESOURCE: /scripts/app.$sp/directive.spPauseChildWatchersIfHidden.js */
angular.module("sn.$sp").directive('spPauseChildWatchersIfHidden', function() {
  return {
    link: function(scope, element, attrs) {
      var count = 0;
      scope.$watch(function() {
        return !element.is(':visible');
      }, function(newVal) {
        if (newVal) {
          toggleChildrenWatchers(element, true);
        } else {
          toggleChildrenWatchers(element, false);
        }
      });

      function toggleChildrenWatchers(element, pause) {
        $.each(element.children(), function(j, childElement) {
          toggleAllWatchers(angular.element(childElement), pause);
        });
      }

      function toggleAllWatchers(element, pause) {
        var data = element.data();
        if (data.hasOwnProperty('$scope') && data.$scope.hasOwnProperty('$$watchers') && data.$scope.$$watchers) {
          if (pause) {
            data._bk_$$watchers = [];
            $.each(data.$scope.$$watchers, function(i, watcher) {
              var temp = {};
              $.extend(true, temp, watcher);
              data._bk_$$watchers.push(temp);
            });
            data.$scope.$$watchers = [];
          } else {
            if (data.hasOwnProperty('_bk_$$watchers')) {
              count += data._bk_$$watchers.length;
              $.each(data._bk_$$watchers, function(i, watcher) {
                var temp = {};
                $.extend(true, temp, watcher)
                data.$scope.$$watchers.push(temp)
              });
            }
          }
        }
        toggleChildrenWatchers(element, pause);
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spGtd.js */
angular.module('sn.$sp').factory('spGtd', function($q, $http, $rootScope, spUtil, i18n) {
  "use strict";
  var url = '/api/now/guided_tours/loader/tour';
  try {
    top.NOW = top.NOW || {};
    top.NOW.gtdConfig = top.NOW.gtdConfig || {
      servicePortalTours: true,
      i18n: i18n,
      displayMessage: {
        info: function(msg) {
          spUtil.addInfoMessage(msg);
        },
        error: function(msg) {
          spUtil.addErrorMessage(msg);
        }
      }
    };
  } catch (e) {
    return {
      getToursForPage: function() {
        var defer = $q.defer();
        defer.reject();
        return defer.promise;
      },
      launch: function() {}
    };
  }
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
    if (top.NOW && top.NOW.guidedToursService) {
      top.NOW.gtdConfig.tours = null;
      top.NOW.gtdConfig.state = null;
      top.NOW.gtdConfig.portal_id = null;
      top.NOW.gtdConfig.page_id = null;
      top.NOW.guidedToursService.setConfig(top.NOW.gtdConfig);
    }
  });

  function _getTourData(portal, page) {
    var defer = $q.defer();
    $http({
      method: 'GET',
      url: url,
      params: {
        name: page,
        portal: portal
      }
    }).then(function(response) {
      defer.resolve(response.data.result);
    }, function(err) {
      defer.reject(err);
    });
    return defer.promise;
  }

  function _loadScript(options, tours, state) {
    top.NOW.gtdConfig.tours = tours;
    top.NOW.gtdConfig.state = state;
    top.NOW.gtdConfig.portal_id = options.portal.sys_id;
    top.NOW.gtdConfig.page_id = options.page.sys_id;
    if (!top.NOW.guidedToursService) {
      var script = document.createElement('script');
      script.src = '/scripts/app.guided_tours/guided_tours_player.js';
      script.type = 'text/javascript';
      script.async = 'true';
      var firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      top.NOW.guidedToursService.setConfig(top.NOW.gtdConfig);
    }
  }

  function getUrlParams(str) {
    var containsParameter = str.indexOf('?') >= 0;
    var sp = null,
      params = [],
      kvpair = null;
    if (containsParameter) {
      sp = str.split('?');
      if (sp.length > 1) {
        params = sp[1].split('&').map(function(kv) {
          kvpair = kv.split('=');
          return {
            name: kvpair[0],
            value: kvpair[1]
          }
        });
      }
    }
    return params;
  }

  function getUrlParameterWithName(str, name) {
    var result = null;
    var params = getUrlParams(str);
    for (var i = 0; i < params.length; i++) {
      if (params[i].name === name) {
        result = params[i];
        break;
      }
    }
    return result;
  }

  function getToursForPage(options) {
    var defer = $q.defer();
    var state = null;
    if (sessionStorage) {
      state = sessionStorage.getItem('guided_tour:tour.state') || location.href.indexOf('gtd_preview_tour_id') >= 0;
      if (state) {
        _loadScript(options, null, state);
      }
    }
    if (!options || !options.page || !options.user || !options.portal) {
      defer.reject();
    } else {
      _getTourData(options.portal.sys_id, options.page.sys_id).then(
        function(data) {
          var pageid = getUrlParameterWithName(document.location.href, 'id');
          var filterByPageId = (pageid && pageid.value);
          data = data.filter(function(t) {
            var contt = getUrlParameterWithName(t.context, 'id');
            return (t.status === 'published') &&
              (t.hasRole === 'true') &&
              (filterByPageId ? (contt.value === pageid.value) : true);
          });
          if (!state && data && data.length) {
            _loadScript(options, data, state);
          }
          defer.resolve(data);
        },
        function() {
          defer.reject();
        });
    }
    return defer.promise;
  }

  function launch(tourId) {
    if (top.NOW && top.NOW.guidedToursService) {
      top.NOW.guidedToursService.startTour(tourId, 0);
    }
  }
  return {
    getToursForPage: getToursForPage,
    launch: launch
  };
});;
/*! RESOURCE: /scripts/app.$sp/service.spFacets.js */
angular.module('sn.$sp').factory('spFacetsClientService', function($rootScope, $location, $http, $q, spFacetManager) {
  'use strict';

  function _search(params) {
    return $http.post('/api/now/sp/search', params)
      .then(function successCallback(response) {
        if (params.include_facets) {
          spFacetManager.notify(response);
        }
        if (response.data.result) {
          var notifications = {};
          response.data.result.$$uiNotification.forEach(function(notification) {
            if (!notifications[notification.message]) {
              notifications[notification.message] = notification;
            }
          });
          if (!params.include_facets) {
            $rootScope.$broadcast('$$uiNotification', _.values(notifications));
          }
        }
        return $q.when(response);
      }, function errorCallback(response) {});
  }
  return {
    search: function(params) {
      return _search(params);
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.spAtf.js */
angular.module('sn.$sp').factory('spAtf', function($q, $http, $rootScope) {
  'use strict';
  var _atf;

  function _getAtfManager(atf) {
    function _triggerPageLoaded() {
      if (atf.triggerPortalPageLoaded) {
        atf.triggerPortalPageLoaded();
      }
    }

    function _expose(name, obj) {
      window[name] = obj;
    }
    return {
      triggerPageLoaded: _triggerPageLoaded,
      expose: _expose
    };
  }

  function _augmentForm(g_form) {
    var oriFieldValues = {};

    function gel(id) {
      if (typeof id != 'string') {
        return id;
      }
      return document.getElementById(id);
    }

    function _getReferenceTable(field) {
      var referenceTable = field.ed ? field.ed.reference : undefined;
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.refTable;
      }
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.ref_table;
      }
      return referenceTable;
    }
    g_form.getParameter = function(param) {
      if (!(param.substr(0, 8) == 'sysparm_')) {
        param = 'sysparm_' + param;
      }
      var pcel = gel(param);
      return pcel ? pcel.value : '';
    };
    g_form.getFormElement = function() {
      return gel(g_form.getTableName() + '.do');
    };
    g_form.isChoiceField = function(fieldName) {
      var field = g_form.getField(fieldName);
      return field && (field.type === 'choice' || field.type === 'multiple_choice');
    };
    g_form.isValidChoice = function(fieldName, value) {
      var field = g_form.getField(fieldName);
      var choices = field.choices || [];
      for (var i = 0; i < choices.length; i++) {
        if (choices[i].value === value) {
          return true;
        }
      }
      return false;
    };
    g_form.getRef = function(fieldName, callback) {
      if (!callback) {
        _logWarn('GETREF:NOCB', 'Mobile scripts must specify a callback function');
        return;
      }
      var field = g_form.getField(fieldName);
      if (!field) {
        _logWarn('GETREF:FNF', 'Field not found: ' + fieldName);
        return;
      }
      var table = _getReferenceTable(field);
      var referenceKey = field.reference_key ? field.reference_key : 'sys_id';
      var url = '/api/now/table/' + table + '?sysparm_query=' + encodeURIComponent(referenceKey + '=' + field.value) + '&sysparm_fields=sys_id&sysparm_limit=1';
      $http.get(url).then(function(res) {
        if (res.data.result && res.data.result.length === 1) {
          return callback(res.data.result[0]);
        }
        callback({
          _error: 'No matching record found'
        });
      }, function(res) {
        callback({
          _error: res.data.error.message
        });
      });
    };
    g_form.serializeToString = function() {
      var tableName = g_form.getTableName();
      var serialized = [
        'sys_target=' + tableName,
        'sys_uniqueValue=' + g_form.getUniqueValue()
      ];
      g_form.serialize().forEach(function(f) {
        var key = tableName + '.' + f.ed.name;
        serialized.push('sys_original.' + key + '=' + encodeURIComponent((oriFieldValues[f.ed.name] || f).value));
        serialized.push(key + '=' + encodeURIComponent(f.value));
      });
      return serialized.join('&');
    };
    g_form.atfSubmit = function(sysId) {
      var action = sysId.length > 2 ? 'sysverb_update' : 'sysverb_insert';
      var deferred = $q.defer();
      g_form.submit(action);
      var cleanUp = $rootScope.$on('sp.form.submitted', function(o, result) {
        cleanUp();
        deferred.resolve(result);
      });
      return deferred.promise;
    };
    g_form.$private.events.on('onChange', function(fieldName, oldValue) {
      oriFieldValues[fieldName] = {
        value: oldValue
      };
    });
    return g_form;
  }

  function _init() {
    if (_atf) {
      return $q(function(resolve) {
        resolve(_getAtfManager(_atf));
      });
    }
    if (window.ATF) {
      _atf = window.ATF;
      return $q(function(resolve) {
        resolve(_getAtfManager(_atf));
      });
    }
    return $q(function(resolve, reject) {
      reject();
    });
  }
  return {
    init: _init,
    augmentForm: _augmentForm
  };
});;
/*! RESOURCE: /scripts/app.$sp/directive.spFacetPill.js */
angular.module('sn.$sp').directive('spFacetPill', function(spFacetManager, spAriaUtil) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      facet: '='
    },
    template: '<div class="sp-facet-pill label label-as-badge label-primary" ng-class="{ \'active\': c.focused}"><span>{{::facet.label}}</span><span class="pull-right"><i class="fa fa-close" ng-focus="c.onFocus()" ng-blur="c.onBlur()" ng-click="c.removePill()" aria-label="{{::c.removeLabel}}" role="button" tabindex="0"></i></span></div>',
    controllerAs: 'c',
    controller: function($scope, i18n) {
      var c = this;
      c.removeLabel = i18n.getMessage('Remove') + " " + $scope.facet.label + " " + i18n.getMessage('facet filter');
      var facetRemovedMsg = i18n.getMessage('Facet removed, search results updated');
      c.removePill = function() {
        spFacetManager.clearFacetValue($scope.facet.id, $scope.facet.item.value);
        spAriaUtil.sendLiveMessage(facetRemovedMsg);
      }
      c.onFocus = function() {
        c.focused = true;
      }
      c.onBlur = function() {
        c.focused = false;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spSearchNav.js */
angular.module('sn.$sp').directive('spSearchNav', function(i18n, $location, spFacetManager, $location) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      searchSources: '=',
      q: '=',
      t: '=',
      listView: '=',
      showToggle: '='
    },
    templateUrl: 'sp_search_nav.xml',
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.i18n = {
        all: i18n.getMessage('All'),
        sources: i18n.getMessage('Sources'),
        search_categories: i18n.getMessage('Search Categories')
      };
      c.searchSources = getSearchSources($scope.searchSources);
      $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);

      function onLocationChangeSuccess(event, newUrl, oldUrl) {
        var page = pageChanged(newUrl, oldUrl);
        if (!pageChanged(newUrl, oldUrl) && searchSourceChanged(newUrl, oldUrl)) {
          var newUrlParams = newUrl.match(/t=.+/);
          if (!newUrlParams) {
            updateSelectedSearchSource(null);
          } else {
            updateSelectedSearchSource(newUrlParams[0].split("&")[0].substring(2));
          }
        }
      }

      function pageChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(/id=.+/),
          oldUrlParams = oldUrl.match(/id=.+/);
        if (!newUrlParams && !oldUrlParams) {
          return false;
        }
        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
          return true;
        }
        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
      }

      function searchSourceChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(/t=.+/),
          oldUrlParams = oldUrl.match(/t=.+/);
        if (!newUrlParams && !oldUrlParams) {
          return false;
        }
        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
          return true;
        }
        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
      }
      c.onSearchSourceClick = function(menu, input) {
        spFacetManager.clearAllFacet();
        $location.search("spa", "1");
        $location.search("q", $scope.q);
        if (input && input.value) {
          $location.search("t", input.value);
        } else {
          $location.search("t", null);
        }
        updateSelectedSearchSource(input.value);
      };

      function updateSelectedSearchSource(value) {
        var items = c.searchSources.items;
        if (value) {
          items.forEach(function(searchSource) {
            if (searchSource.value === value) {
              searchSource.selected = true;
            } else {
              searchSource.selected = false;
            }
          });
        } else {
          items.forEach(function(searchSource) {
            if (!searchSource.value) {
              searchSource.selected = true;
            } else {
              searchSource.selected = false;
            }
          });
        }
        c.searchSources.items = items;
      }

      function getSearchSources(data) {
        return {
          label: c.i18n.sources,
          id: 'searchSources',
          items: getSearchSourceItems(data)
        };
      }

      function getSearchSourceItems(data) {
        var values = _.values(data),
          sources = [];
        values.forEach(function(value) {
          sources.push({
            label: value.name,
            value: value.id,
            selected: value.id == $scope.t,
            order: value.order
          });
        })
        sources.sort(function(a, b) {
          return a.order - b.order;
        });
        sources.unshift({
          label: c.i18n.all,
          value: null,
          selected: !$scope.t
        });
        return sources;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spFacetList.js */
angular.module('sn.$sp').directive('spFacetList', function(i18n, spFacetManager, spAriaUtil) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      listTitle: '=',
      t: '=',
      facets: '=',
      loading: '=',
      collapsed: '=',
      collpasedMap: "=",
      toggleSearchsource: '=',
      collapsedSearchsource: '='
    },
    templateUrl: 'sp_facet_list.xml',
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.showClearAll = shouldShowClearAll();
      c.show = $scope.facets && $scope.facets.length !== 0;
      c.collapsed = $scope.collapsedSearchsource;
      $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);

      function onLocationChangeSuccess(event, newUrl, oldUrl) {
        c.showClearAll = shouldShowClearAll();
      }

      function searchSourceChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(/t=.+/),
          oldUrlParams = oldUrl.match(/t=.+/);
        if (!newUrlParams && !oldUrlParams) {
          return false;
        }
        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
          return true;
        }
        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
      }

      function shouldShowClearAll() {
        for (var i = 0; i < $scope.facets.length; i++) {
          if (spFacetManager.isFacetSelected($scope.facets[i].id, $scope.t)) {
            return true;
          }
        }
        return false;
      }
      c.toggleIcon = function(title) {
        c.collapsed = !c.collapsed;
        spFacetManager.publish("spSearchSources.toggle.data", {
          searchSource: $scope.t,
          collapsed: c.collapsed
        });
        if (c.collapsed)
          spAriaUtil.sendLiveMessage(title + " " + c.i18n.isCollapsed);
        else
          spAriaUtil.sendLiveMessage(title + " " + c.i18n.isExpanded);
      };
      c.i18n = {
        clearAll: i18n.getMessage('Clear All'),
        loading: i18n.getMessage('Loading'),
        filterSelectionCleared: i18n.getMessage('filter selection has cleared for'),
        filterSelected: i18n.getMessage('Filter selected'),
        searchResultsUpdated: i18n.getMessage('Search results updated'),
        isCollapsed: i18n.getMessage('is collapsed'),
        isExpanded: i18n.getMessage('is Expanded'),
        allFacetsCleared: i18n.getMessage("All facets have been cleared, and search results have been updated")
      };
      c.showClear = function(facet) {
        return spFacetManager.isFacetSelected(facet.id, $scope.t);
      };
      c.clearAll = function() {
        spFacetManager.clearAllFacet();
        spAriaUtil.sendLiveMessage(c.i18n.allFacetsCleared);
      };
      c.onSelectFacet = function(menu, input) {
        if (Array.isArray(input)) {
          var values = input.map(function(item) {
            return item.value;
          });
          if ($scope.t) {
            spFacetManager.addFacetWithSearchSource($scope.t, menu.id, values);
          } else {
            spFacetManager.addFacet(menu.id, values);
          }
          spAriaUtil.sendLiveMessage(c.i18n.filterSelected + " " + menu.label + " " + c.i18n.searchResultsUpdated);
        } else {
          var item = input;
          if ($scope.t) {
            spFacetManager.addFacetWithSearchSource($scope.t, menu.id, item.value);
          } else {
            spFacetManager.addFacet(menu.id, item.value);
          }
          spAriaUtil.sendLiveMessage(c.i18n.filterSelected + " " + menu.label + " " + item.label + " " + c.i18n.searchResultsUpdated);
        }
      }
      c.clearFacet = function(menu) {
        spFacetManager.clearFacet(menu.id);
        spAriaUtil.sendLiveMessage(c.i18n.filterSelectionCleared + " " + menu.label + " " + c.i18n.searchResultsUpdated);
        c.showClearAll = shouldShowClearAll();
      }
      c.isCollapsed = function(menuId) {
        return $scope.collpasedMap && $scope.collpasedMap[menuId] !== undefined ? $scope.collpasedMap[menuId] : $scope.collapsed;
      }
      c.onFacetToggle = function(menuId, collapsed) {
        spFacetManager.publish("spFacets.toggle.data", {
          searchSource: $scope.t,
          facetId: menuId,
          collapsed: collapsed
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spFacetLists.js */
angular.module('sn.$sp').directive('spFacetLists', function(spFacetManager) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      collapsed: '=',
      collapsedSearchsource: '=',
      toggleSearchsource: '=',
      listTitle: '=',
      searchSources: '='
    },
    template: '<div class="sp-facet-lists"><div ng-show="c.isLoading" class="loading-icon"><i class="fa fa-spinner fa-spin fa-3x fa-fw" style="font-size:24px"></i><span class="sr-only">{{::c.i18n.loading}}</span></div><div ng-show="c.show()"><div class="panel-heading heading"><div class="panel-title" aria-label="{{::listTitle}}">{{::listTitle}}</div></div><div ng-repeat="data in c.facets"><sp-facet-list collapsed="collapsed" collpased-map="c.facetToogleMap[data.searchSource]" collapsed-searchsource="c.isSearchSourceCollapsed(data.searchSource)" toggle-searchsource="toggleSearchsource" facets="data.facets" list-title="searchSources[data.searchSource].name" t="data.searchSource"></sp-facet-list></div></div></div>',
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.facetToogleMap = {};
      c.searchSourceToggleMap = {};
      spFacetManager.subscribe("spFacets.refresh.data", "list", onFacetsData);
      spFacetManager.subscribe("spFacets.toggle.data", "list", onFacetToggle);
      spFacetManager.subscribe("spSearchSources.toggle.data", "list", onSearchSourceToggle);
      c.isLoading = true;
      c.show = function() {
        return !c.isLoading && !isEmpty(c.facetsObjectMap);
      };

      function onSearchSourceToggle(data) {
        c.searchSourceToggleMap[data.searchSource] = data.collapsed;
      }

      function onFacetToggle(data) {
        if (!c.facetToogleMap[data.searchSource]) {
          c.facetToogleMap[data.searchSource] = {};
        }
        c.facetToogleMap[data.searchSource][data.facetId] = data.collapsed;
      }
      c.isCollapsed = function(searchSource, facetId) {
        return c.facetToogleMap[searchSource] !== undefined && c.facetToogleMap[searchSource][facetId] !== undefined ? c.facetToogleMap[searchSource][menuId] : $scope.collapsed;
      }
      c.isSearchSourceCollapsed = function(searchSource) {
        return c.searchSourceToggleMap[searchSource] !== undefined ? c.searchSourceToggleMap[searchSource] : $scope.collapsedSearchsource;
      }

      function isEmpty(facetsObjectMap) {
        if (!facetsObjectMap) {
          return true;
        }
        for (var searchSource in facetsObjectMap) {
          if (facetsObjectMap[searchSource] && facetsObjectMap[searchSource].length > 0) {
            return false;
          }
        }
        return true;
      }

      function getFacets(facetsObjectMap) {
        var facetArray = [];
        for (var searchSource in facetsObjectMap) {
          var data = {};
          data.searchSource = searchSource;
          data.facets = facetsObjectMap[searchSource];
          data.order = $scope.searchSources[searchSource].order;
          facetArray.push(data);
        }
        facetArray.sort(function(a, b) {
          return a.order - b.order;
        });
        return facetArray;
      }

      function onFacetsData(params) {
        c.facetsObjectMap = params.data;
        c.facets = getFacets(c.facetsObjectMap);
        c.isLoading = false;
        updateFacet(params.query);
      }

      function updateFacet(queries) {
        var keys = Object.keys(queries),
          t = queries.t;
        keys.forEach(function(k) {
          var queryContent = queries[k];
          if (queryContent.charAt(0) === '[' && queryContent.charAt(queryContent.length - 1) === ']')
            queryContent = queryContent.substring(1, queryContent.length - 1);
          var values = queryContent.split(",");
          values.forEach(function(value) {
            value = value.split("%2C").join(",");
            var item = findItem(t, k, value);
            if (item) {
              item.selected = true;
              c.showClearAll = true;
            }
          });
        });
      }

      function findItem(t, key, value) {
        var facets = c.facetsObjectMap[t];
        if (facets && facets.length > 0) {
          var f = facets.filter(function(d) {
            return d.id === key;
          });
          if (f && f.length > 0) {
            var item = f[0].items.filter(function(i) {
              return i.value === value;
            });
            return item[0];
          }
          return null;
        }
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spListMenu.js */
angular.module('sn.$sp').directive('spListMenu', function(i18n, spAriaUtil, $window) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      onclickFn: '&',
      onclearFn: '&',
      ontoggleFn: '&',
      showClear: '=',
      listView: '=',
      showToggle: '=',
      collapsed: '=',
      menu: '='
    },
    templateUrl: 'sp_list_menu.xml',
    controllerAs: 'c',
    controller: function($scope) {
      var MULTI_SELECT = "MULTI_SELECT";
      var c = this;
      var selectedItems = computeSelectedItems();
      var initialSelectedItems = selectedItems;
      c.selectionIsDirty = false;
      c.isMultiSelect = $scope.menu.type === MULTI_SELECT;
      c.onItemClickFn = function(menu, item) {
        if (!c.isMultiSelect && item.selected)
          return;
        item.selected = !item.selected;
        selectedItems = (c.isMultiSelect) ? computeSelectedItems() : item;
        if (!c.isMultiSelect)
          c.submit();
      };
      c.submit = function() {
        if (selectedItems.length == 0)
          c.clear();
        else
          $scope.onclickFn({
            menu: $scope.menu,
            input: selectedItems
          });
      }
      c.clear = function() {
        $scope.onclearFn({
          menu: $scope.menu
        });
      };
      c.show = function() {
        return $scope.menu && $scope.menu.items && $scope.menu.items.length > 0;
      };
      c.i18n = {
        clear: i18n.getMessage('Clear'),
        apply: i18n.getMessage('Apply'),
        collapse: i18n.getMessage('Collapse'),
        isCollapsed: i18n.getMessage('is collapsed'),
        isExpanded: i18n.getMessage('is Expanded')
      };

      function isSmallScreenSize() {
        return $window.matchMedia('(max-width: 767px)').matches;
      }
      c.collapsed = $scope.collapsed;
      c.showToggle = $scope.showToggle;
      c.toggleIcon = function(menuLabel) {
        c.collapsed = !c.collapsed;
        $scope.ontoggleFn({
          menuId: $scope.menu.id,
          collapsed: c.collapsed
        });
        if (c.collapsed)
          spAriaUtil.sendLiveMessage(menuLabel + " " + c.i18n.isCollapsed);
        else
          spAriaUtil.sendLiveMessage(menuLabel + " " + c.i18n.isExpanded);
      };
      c.showClearButton = function() {
        return $scope.showClear && !c.showApplyButton()
      }
      c.showApplyButton = function() {
        return c.isMultiSelect && c.selectionIsDirty;
      }

      function computeSelectedItems() {
        var newSelectedItems = $scope.menu.items.filter(function(item) {
          return item.selected;
        });
        if (initialSelectedItems)
          c.selectionIsDirty = dirtyCheck(newSelectedItems, initialSelectedItems);
        return newSelectedItems;
      }

      function dirtyCheck(newItems, initialItems) {
        if (newItems.length !== initialItems.length)
          return true;
        var initialValueArr = initialItems.map(function(item) {
          return item.value;
        });
        return !newItems.every(function(newItem) {
          if (initialValueArr.indexOf(newItem.value) > -1)
            return true;
        });
      }
      $scope.$on("sp.search.cancel", function() {
        selectedItems = initialSelectedItems;
        c.selectionIsDirty = false;
        $scope.menu.items.forEach(function(item) {
          var initialValueArr = initialSelectedItems.map(function(item) {
            return item.value;
          });
          item.selected = initialValueArr.indexOf(item.value) > -1;
        });
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/directive.spListMenuItems.js */
angular.module('sn.$sp').directive('spListMenuItems', function(i18n) {
  function link(scope, elem, attr) {
    scope.focus = function() {
      $(elem).find("button")[0].focus();
    }
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      onclickFn: '&',
      menu: '='
    },
    link: link,
    templateUrl: function(elem, attr) {
      return (attr.type === "MULTI_SELECT") ?
        "sp_list_menu_checkbox.xml" :
        "sp_list_menu_item.xml"
    },
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.showNextItems = false;
      c.i18n = {
        see_more: i18n.getMessage('See more'),
        see_less: i18n.getMessage('See less')
      };
      getItems();

      function getItems() {
        var items = $scope.menu.items;
        if (items.length > 10) {
          c.items = items.slice(0, 10);
          c.nextItems = items.slice(10);
        } else {
          c.items = items;
        }
      }
      c.showMoreButton = function() {
        return $scope.menu.items.length > 10 && !c.showNextItems;
      }
      c.onMoreButtonClick = function() {
        c.showNextItems = true;
      }
      c.onLessButtonClick = function() {
        c.showNextItems = false;
        $scope.focus();
      }
      c.onClick = function(item) {
        $scope.onclickFn({
          menu: $scope.menu,
          item: item
        });
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/factory.spFacetManager.js */
angular.module('sn.$sp').factory('spFacetManager', function($location) {
  'use strict';
  var subscribeCallbackMap = {};

  function addFacetWithSearchSource(t, key, value) {
    $location.search("spa", "1");
    $location.search("t", t);
    addFacet(key, value);
  }

  function addFacet(key, value) {
    $location.search("spa", "1");
    var urlValue = value.toString();
    if (Array.isArray(value)) {
      value = value.map(encodeCommas);
      urlValue = "[" + value.toString() + "]";
    }
    $location.search(key, urlValue);
  }

  function clearFacet(key) {
    $location.search(key, null);
  }

  function clearFacetValue(facetID, facetValue) {
    facetValue = encodeCommas(facetValue);
    var currentFacetValue = $location.search()[facetID];
    if (!currentFacetValue.charAt(0) === '[' || !currentFacetValue.charAt(currentFacetValue.length - 1) === ']') {
      clearFacet(facetID);
      return;
    }
    var currentFacetArr = currentFacetValue.substring(1, currentFacetValue.length - 1).split(',');
    var index = currentFacetArr.indexOf(facetValue);
    currentFacetArr.splice(index, 1);
    if (currentFacetArr.length == 0) {
      clearFacet(facetID);
      return;
    }
    $location.search(facetID, '[' + currentFacetArr.toString() + ']');
  }

  function clearAllFacet() {
    var urlParams = $location.search(),
      keys = _.keys(urlParams);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'q' && keys[i] !== 't' && keys[i] !== 'id' && keys[i] !== 'spa') {
        $location.search(keys[i], null);
      }
    }
  }

  function isFacetSelected(key, searchSource) {
    var facetURLValue = $location.search()[key],
      t = $location.search().t;
    return (facetURLValue != undefined && facetURLValue != null) && t === searchSource;
  }

  function isAnyFacetSelected() {
    var urlParams = $location.search(),
      keys = _.keys(urlParams);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== 'q' && keys[i] !== 't' && keys[i] !== 'id' && keys[i] !== 'spa') {
        return true;
      }
    }
    return false;
  }

  function notify(response) {
    _notifySubscribers("spFacets.refresh.data", {
      data: response.data.result.facets,
      query: $location.search()
    });
  }

  function _notifySubscribers(eventName, data) {
    if (subscribeCallbackMap[eventName]) {
      var listeners = subscribeCallbackMap[eventName];
      for (var i = 0; i < listeners.length; i++) {
        listeners[i](data);
      }
    }
  }

  function encodeCommas(str) {
    return str.split(",").join("%2C");
  }
  return {
    addFacet: addFacet,
    addFacetWithSearchSource: addFacetWithSearchSource,
    clearFacet: clearFacet,
    clearFacetValue: clearFacetValue,
    clearAllFacet: clearAllFacet,
    isAnyFacetSelected: isAnyFacetSelected,
    isFacetSelected: isFacetSelected,
    notify: notify,
    publish: function(eventName, data) {
      _notifySubscribers(eventName, data);
    },
    subscribe: function(eventName, id, callback) {
      if (!subscribeCallbackMap[eventName]) {
        subscribeCallbackMap[eventName] = [];
      }
      subscribeCallbackMap[eventName].push(callback);
    }
  }
});;
/*! RESOURCE: /scripts/app.$sp/service.select2EventBroker.js */
angular.module('sn.$sp').factory('select2EventBroker', function() {
  var subscribers = {};
  var uuid = -1;

  function _openSelect2Element() {
    for (var key in subscribers) {
      subscribers[key]();
    }
  }

  function _onSelect2Opening(callback) {
    var subscriptionToken = (++uuid).toString();
    subscribers[subscriptionToken] = callback.bind(this);
    return function unsubscribe() {
      delete subscribers[subscriptionToken];
    }
  }
  return {
    publishSelect2Opening: _openSelect2Element,
    subscribeSelect2Opening: _onSelect2Opening
  }
});;
/*! RESOURCE: /scripts/app.$sp/filter.unique.js */
angular.module('sn.$sp').filter('unique', function() {
  return function(collection, property) {
    return _.uniqBy(collection, function(item) {
      return item[property];
    });
  }
});;;