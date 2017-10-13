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
    $uibModal.open({
      templateUrl: 'sp-modal.html',
      controller: spModalCtrl,
      size: options.size,
      resolve: {
        options: function() {
          return options;
        }
      }
    }).result.then(function(result) {
      if (options.input) {
        defer.resolve(result.input, result.button);
      } else {
        defer.resolve(result.button);
      }
    }, function() {
      defer.reject();
    });
  }

  function initOptions(options) {
    var defaults = {
      title: '',
      message: '',
      messageOnly: false,
      input: false,
      label: '',
      size: '',
      value: '',
      required: false,
      values: false,
      widget: null,
      widgetInput: null,
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
    return options;
  }

  function spModalCtrl($scope, options, $timeout) {
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
      $scope.$close({
        button: button,
        input: $scope.input.value
      });
    }
    $scope.submit = function() {
      var ok;
      angular.forEach($scope.options.buttons, function(button) {
        if (button.primary)
          ok = button;
      })
      if (ok) $scope.buttonClicked(ok);
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