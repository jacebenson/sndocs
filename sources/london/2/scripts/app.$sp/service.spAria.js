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