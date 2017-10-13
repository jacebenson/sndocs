/*! RESOURCE: /scripts/sn/common/clientScript/angular/js_includes_angular.js */
/*! RESOURCE: /scripts/sn/common/clientScript/angular/_module.js */
angular.module('sn.common.clientScript', [
  'sn.common.i18n',
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideAjaxFactory.js */
angular.module('sn.common.clientScript').factory('glideAjaxFactory', function($window, glideRequest) {
  $window.GlideAjax.glideRequest = glideRequest;
  return {
    create: function(processor) {
      return new $window.GlideAjax(processor);
    },
    getClass: function() {
      return $window.GlideAjax;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormEnvironmentFactory.js */
angular.module('sn.common.clientScript').factory('glideFormEnvironmentFactory', function(
  $q,
  $window,
  $timeout,
  glideFormFieldFactory,
  glideAjaxFactory,
  glideRecordFactory,
  i18n,
  glideModalFactory,
  jQueryRequestShim
) {
  'use strict';
  var factory = $window.glideFormEnvironmentFactory;
  angular.extend(factory.defaultExtensionPoints, {
    GlideAjax: glideAjaxFactory.getClass(),
    GlideRecord: glideRecordFactory.getClass(),
    getMessage: i18n.getMessage,
    getMessages: i18n.getMessages,
    $: jQueryRequestShim
  });
  factory.createInitializer = function(g_form, g_user, g_scratchpad, clientScripts, uiPolicies, g_modal) {
    if (typeof g_modal === 'undefined') {
      g_modal = glideModalFactory.create();
    }
    var g_env = glideFormEnvironmentFactory.create(g_form, g_scratchpad, g_user, g_modal);
    if (clientScripts && clientScripts.messages) {
      for (var key in clientScripts.messages) {
        i18n.loadMessage(key, clientScripts.messages[key]);
      }
    }
    return function() {
      g_env.initScripts(clientScripts);
      if (uiPolicies && (uiPolicies.length > 0)) {
        g_env.initUIPolicyScripts(uiPolicies);
      }
      return g_env;
    };
  };
  factory.createWithConfiguration = function(g_form, g_user, g_scratchpad, clientScripts, uiPolicies, g_modal) {
    if (typeof g_modal === 'undefined') {
      g_modal = glideModalFactory.create();
    }
    var g_env = glideFormEnvironmentFactory.create(g_form, g_scratchpad, g_user, g_modal);
    if (clientScripts && clientScripts.messages) {
      for (var key in clientScripts.messages) {
        i18n.loadMessage(key, clientScripts.messages[key]);
      }
    }
    return {
      g_env: g_env,
      initialize: function() {
        g_env.initScripts(clientScripts);
        if (uiPolicies && (uiPolicies.length > 0)) {
          g_env.initUIPolicyScripts(uiPolicies);
        }
      }
    };
  };
  var FIELDS_INITIALIZED_INTERVAL = 195;
  factory.onFieldsInitialized = function(fields) {
    var $fieldsReady = $q.defer();
    var $readyTimeout = $timeout(checkFormFields, FIELDS_INITIALIZED_INTERVAL);

    function checkFormFields() {
      var ready = fields.reduce(function(previous, field) {
        return previous && glideFormFieldFactory.isInitialized(field);
      }, true);
      if (!ready) {
        $readyTimeout = $timeout(checkFormFields, FIELDS_INITIALIZED_INTERVAL);
        return;
      }
      $fieldsReady.resolve();
    }
    return $fieldsReady.promise;
  };
  return factory;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormFactory.js */
angular.module('sn.common.clientScript').factory('glideFormFactory', function($window, glideRecordFactory, glideRequest, glideFormMessageHandler) {
  'use strict';
  var factory = $window.glideFormFactory;
  factory.glideRequest = glideRequest;
  var EVENT_CHANGED = 'changed';
  var EVENT_PROPERTY_CHANGE = 'propertyChange';

  function createAngularGlideForm($scope, tableName, sysId, fields, uiActions, options, relatedLists, sections) {
    options = angular.extend({
      GlideRecord: glideRecordFactory.getClass(),
      uiMessageHandler: glideFormMessageHandler
    }, options);
    var g_form = factory.create(tableName, sysId, fields, uiActions, options, relatedLists, sections);
    g_form.$private.events.on(EVENT_CHANGED, function() {
      if (!$scope.$root.$$phase) {
        $scope.$apply();
      }
    });
    g_form.$private.events.on(EVENT_PROPERTY_CHANGE, function() {
      if (!$scope.$root.$$phase) {
        $scope.$apply();
      }
    });
    $scope.$on('$destroy', function() {
      g_form.$private.events.cleanup();
    });
    return g_form;
  }
  return {
    create: createAngularGlideForm
  }
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormFieldFactory.js */
angular.module('sn.common.clientScript').factory('glideFormFieldFactory', function($window) {
  'use strict';
  return $window.glideFormFieldFactory;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormMessageHandler.js */
angular.module('sn.common.clientScript').factory('glideFormMessageHandler', function($rootScope) {
  'use strict';
  return function(g_form, type, message) {
    switch (type) {
      case 'infoMessage':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'info',
          message: message
        });
        break;
      case 'errorMessage':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'error',
          message: message
        });
        break;
      case 'clearMessages':
        $rootScope.$emit('snm.ui.sessionNotification', {
          type: 'clear'
        });
        break;
      default:
        return false;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideListFactory.js */
angular.module('sn.common.clientScript').factory('glideListFactory', function() {
  'use strict';
  if (typeof g_glide_list_separator == "undefined")
    var g_glide_list_separator = ", ";
  return {
    init: init
  };

  function init(g_form, fields) {
    return {
      get: function(fieldName) {
        return _glideListUtil(fieldName, g_form, fields);
      }
    };
  }

  function getField(fieldName, g_form, fields) {
    for (var i = 0, iM = fields.length; i < iM; i++) {
      var field = fields[i];
      if (field.variable_name === fieldName || field.name === fieldName) {
        return field;
      }
    }
    if (g_form.$private.options('getMappedField')) {
      var mapped = g_form.$private.options('getMappedField')(fieldName);
      if (mapped) {
        return mapped;
      }
    }
  }

  function _glideListUtil(fieldName, g_form, fields) {
    var field = getField(fieldName, g_form, fields);
    if (!field)
      return;

    function getItems() {
      var items = [];
      var values = field.value.split(',');
      var displayValues = field.display_value_list;
      for (var i = 0; i < values.length; i++) {
        items.push({
          value: values[i],
          display_value: displayValues[i]
        });
      }
      return items;
    }

    function addItem(item, itemDV) {
      var v = field.value;
      if (v.indexOf(item) > -1)
        return;
      var dv = field.display_value_list;
      v = v == '' ? [] : v.split(',');
      if (v.indexOf(item) == -1) {
        v.push(item);
        dv.push(itemDV);
      }
      g_form.setValue(fieldName, v.join(','), dv.join(g_glide_list_separator));
    }

    function removeItem(item) {
      var v = field.value;
      if (v.indexOf(item) == -1)
        return;
      var values = field.value.split(',');
      var displayValues = field.display_value_list;
      for (var i = values.length - 1; i >= 0; i--) {
        if (item == values[i]) {
          values.splice(i, 1);
          displayValues.splice(i, 1);
          break;
        }
      }
      g_form.setValue(field.name, values.join(','), displayValues.join(g_glide_list_separator));
    }

    function reset() {
      field.ed.queryString = '';
    }

    function setQuery(queryString) {
      field.ed.queryString = queryString;
      field.ed.queryString.replace("^EQ", "");
    }

    function setDefaultOperator(operator) {
      field.ed.defaultOperator = operator;
    }

    function getDefaultOperator() {
      return field.ed.defaultOperator;
    }
    return {
      addItem: addItem,
      removeItem: removeItem,
      getItems: getItems,
      setQuery: setQuery,
      getDefaultOperator: getDefaultOperator,
      setDefaultOperator: setDefaultOperator,
      queryString: field.ed.queryString,
      reset: reset
    };
  }
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideModalFactory.js */
angular.module('sn.common.clientScript').factory('glideModalFactory', function($q) {
  'use strict';
  return {
    create: create
  };

  function create(options) {
    options = options || {};
    var alertHandler = options.alert || _browserAlertHandler;
    var confirmHandler = options.confirm || _browserConfirmHandler;
    return {
      alert: function() {
        var args = _getArgs(arguments);
        var $d = $q.defer();
        if (args.callback) {
          $d.promise.then(function() {
            args.callback();
          });
        }
        if (alertHandler) {
          alertHandler(args.title, args.message, function() {
            $d.resolve();
          });
        } else {
          $d.reject();
        }
        return $d.promise;
      },
      confirm: function() {
        var args = _getArgs(arguments);
        var $d = $q.defer();
        if (args.callback) {
          $d.promise.then(function(result) {
            args.callback(result);
          });
        }
        if (confirmHandler) {
          confirmHandler(args.title, args.message, function(result) {
            $d.resolve(result === true ? true : false);
          });
        } else {
          $d.reject();
        }
        return $d.promise;
      }
    };
  }

  function _getArgs(args) {
    var title = args[0];
    var message = args[1];
    var callback = args[2];
    switch (typeof message) {
      case 'function':
        callback = message;
      case 'undefined':
        message = title;
        title = null;
        break;
      default:
        break;
    }
    return {
      title: title,
      message: message,
      callback: callback
    };
  }

  function _browserAlertHandler(title, message, done) {
    alert(message);
    done();
  }

  function _browserConfirmHandler(title, message, done) {
    done(confirm(message));
  }
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideRecordFactory.js */
angular.module('sn.common.clientScript').factory('glideRecordFactory', function($window, glideRequest) {
  $window.GlideRecord.glideRequest = glideRequest;
  return {
    create: function(table) {
      return new $window.GlideRecord(table);
    },
    getClass: function() {
      return $window.GlideRecord;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideRequest.js */
angular.module('sn.common.clientScript').factory('glideRequest', function($q, $log, $http, $window, urlTools, xmlUtil) {
  'use strict';
  $window.glideRequest = {
    getAngularURL: urlTools.getURL,
    get: $http.get,
    post: function(url, options) {
      options = options || {};
      options.url = url;
      options.method = 'post';
      if (!options.headers) {
        options.headers = {};
      }
      var getXml = false;
      switch (options.dataType) {
        case 'json':
          break;
        case 'xml':
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          var data = options.data || {};
          options.data = urlTools.encodeURIParameters(data);
          getXml = true;
          options.responseType = 'text';
          if (!options.data) {
            options.data = '';
          }
          options.headers['Accept'] = 'application/xml, text/xml';
          break;
        default:
      }
      return $http(options).then(function(response) {
        response.type = getXml ? 'xml' : 'json';
        response.responseText = response.data;
        response.responseXML = getXml ? xmlUtil.xmlToElement(response.data) : null;
        return response;
      }, function(error) {
        error.type = getXml ? 'xml' : 'json';
        error.responseText = error.data;
        error.responseXML = getXml ? xmlUtil.xmlToElement(error.data) : null;
        return $q.reject(error);
      });
    }
  };
  return $window.glideRequest;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideUserFactory.js */
angular.module('sn.common.clientScript').factory('glideUserFactory', function($window) {
  function getClass() {
    return $window.GlideUser;
  }
  return {
    create: function(fields) {
      var u = getClass();
      return new u(fields);
    },
    getClass: getClass
  };
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/jQueryRequestShim.js */
angular.module('sn.common.clientScript').factory('jQueryRequestShim', function(glideRequest) {
  if (angular.isDefined(window.jQuery)) {
    return {
      get: window.jQuery.get,
      post: window.jQuery.post
    };
  }
  var jQueryRequestShim = {
    get: function() {
      var args = Array.prototype.slice.call(arguments);
      return _createJQueryRequest('get', args);
    },
    post: function() {
      var args = Array.prototype.slice.call(arguments);
      return _createJQueryRequest('post', args);
    }
  };

  function _createJQueryRequest(type, args) {
    var url = args.shift() || '';
    var data = args.shift();
    var success;
    if (typeof data === 'function') {
      success = data;
      data = null;
    } else {
      success = args.shift();
    }
    var dataType = args.shift();
    if (!angular.isDefined(dataType)) {
      dataType = 'json';
    }
    var $request;
    switch (type) {
      case 'get':
        $request = glideRequest.get(url);
        break;
      case 'post':
        $request = glideRequest.post(url, {
          data: data,
          dataType: dataType
        });
        break;
    }
    if (success) {
      $request = $request.then(function(response) {
        success(response.data, response.statusText, response);
      });
    }
    return $request;
  }
  return jQueryRequestShim;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/uiPolicyFactory.js */
angular.module('sn.common.clientScript').factory('uiPolicyFactory', function($window) {
  var factory = $window.uiPolicyFactory;
  return factory;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/uiPolicyTypes.js */
angular.module('sn.common.clientScript').factory('uiPolicyTypes', function($window) {
  var factory = $window.UI_POLICY_TYPES;
  return factory;
});;
/*! RESOURCE: /scripts/sn/common/clientScript/angular/xmlUtil.js */
angular.module('sn.common.clientScript').factory('xmlUtil', function($log) {
  function xmlToElement(xmlText) {
    if (typeof DOMParser !== 'undefined') {
      try {
        var parser = new DOMParser();
        return parser.parseFromString(xmlText, 'application/xml');
      } catch (e) {
        $log.error(e);
        return null;
      }
    } else {
      var xml = angular.element(xmlText);
      $log.warn('DOMParser is not supported on this browser');
      return angular.element(xml[1]);
    }
  }

  function getDataFromXml(text, nodeName) {
    var dataSet = [];
    var el = angular.element(xmlToElement(text));
    if (el && el.length) {
      var nodes = angular.isString(nodeName) ? el.find(nodeName) : el.find('xml');
      angular.forEach(nodes, function(n) {
        if (n.attributes && n.attributes.length) {
          var data = {};
          angular.forEach(n.attributes, function(attr) {
            data[attr.nodeName] = attr.nodeValue;
          });
          dataSet.push(data);
        }
      });
    }
    return dataSet;
  }
  return {
    xmlToElement: xmlToElement,
    getDataFromXml: getDataFromXml
  };
});;;