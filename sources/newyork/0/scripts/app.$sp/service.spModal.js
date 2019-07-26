/*! RESOURCE: /scripts/app.$sp/service.spModal.js */
angular.module('sn.$sp').factory('spModal', function($q, spUtil, $http, $uibModal, i18n, $document, $uibModalStack) {
  "use strict";

  function alert(message, appendTo) {
    var options = {
      title: message,
      buttons: [{
        label: i18n.getMessage('OK'),
        primary: true
      }],
      appendTo: appendTo
    };
    return alertConfirm(options);
  }

  function confirm(message, appendTo) {
    var options = {
      title: message,
      appendTo: appendTo
    };
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

  function prompt(message, defaultValue, appendTo) {
    var options = {
      title: message,
      input: true,
      value: defaultValue,
      appendTo: appendTo,
      headerStyle: {
        border: 'none',
        'padding-bottom': 0
      },
      footerStyle: {
        border: 'none',
        'padding-top': 0
      }
    };
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
      appendTo: options.appendTo,
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
    $scope.clearFocusListCache = function() {
      $uibModalStack.clearFocusListCache();
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