/*! RESOURCE: /scripts/sn.angularstrap/directive.snAsideContent.js */
angular.module('sn.angularstrap').directive('snAsideContent', function(getTemplateUrl, $compile, $templateCache, $timeout, $window) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    template: '<div class="aside-content" />',
    link: function(scope, element, attrs) {
      var broadcastPrefix = 'sn.aside' + (attrs.name ? '.' + attrs.name : '');
      scope.history = [];
      var findPrefix = '#snAsideContent_',
        viewPrefix = findPrefix.slice(1),
        cachedViews = {},
        cachedViewScopes = {},
        cachedViewKeys = [],
        asideContainer = element.parent().parent();
      var asideTransitionDuration = parseFloat(asideContainer.css('transition-duration'), 10) * 1000 || 500;

      function stringFunction(stringOrFunction) {
        if (angular.isFunction(stringOrFunction))
          return stringOrFunction();
        return stringOrFunction;
      }
      scope.loadView = function(view) {
        var container;
        if (!view)
          return;
        if (view.cacheKey && cachedViewKeys.indexOf(stringFunction(view.cacheKey)) >= 0) {
          if (!view.isChild)
            unloadView(true);
          var escapedKey = stringFunction(view.cacheKey).replace(/\./g, '\\.');
          container = element.find(findPrefix + escapedKey);
          container.show().siblings().hide();
          focusOnFirstChild(container);
          return;
        }
        var subScope = scope.$new();
        var historyObj = {
          view: view,
          cacheKey: stringFunction(view.cacheKey),
          subScope: subScope
        };
        if (view.scope) {
          if (view.scope.constructor === scope.constructor) {
            subScope.$destroy();
            delete historyObj.subScope;
            subScope = view.scope.$new();
            historyObj.subScope = subScope;
          } else {
            for (var prop in view.scope) {
              if (view.scope.hasOwnProperty(prop) && !subScope.hasOwnProperty(prop))
                subScope[prop] = view.scope[prop];
            }
          }
        }
        var template = view.templateUrl ? $templateCache.get(view.templateUrl) : stringFunction(view.template);
        var compiledTemplate = $compile(template)(subScope);
        if (!view.isChild)
          unloadView(true);
        scope.history.push(historyObj);
        if (view.cacheKey)
          cachedViewKeys.push(stringFunction(view.cacheKey));
        var containerID = viewPrefix;
        containerID += view.cacheKey ? stringFunction(view.cacheKey) : scope.history.length;
        element.append('<div id="' + containerID + '" />');
        containerID = containerID.replace(/\./g, '\\.');
        container = element.find('#' + containerID);
        container.html(compiledTemplate).siblings().hide();
        if (asideContainer.hasClass("sn-aside-hide")) {
          $timeout(function() {
            focusOnFirstChild(container);
          }, asideTransitionDuration, false);
        } else {
          focusOnFirstChild(container);
        }
      };
      scope.$on(broadcastPrefix + '.historyBack', function() {
        scope.historyBack();
      });
      scope.historyBack = function(evt) {
        if (scope.history.length <= 1 || (evt && evt.keyCode === 9))
          return;
        unloadView();
        var previousView = scope.history[scope.history.length - 1];
        if (previousView.cacheKey) {
          element.find(findPrefix + previousView.cacheKey).show();
        } else {
          element.find(findPrefix + scope.history.length).show();
        }
        scope.$emit(broadcastPrefix + '.historyBack.completed', previousView.view);
      };

      function unloadView(unloadAll) {
        if (!scope.history.length)
          return;
        var numViews = scope.history.length,
          historyView = scope.history.pop(),
          escapedKey = '',
          contentDiv;
        if (historyView.cacheKey) {
          escapedKey = historyView.cacheKey.replace(/\./g, "\\.");
          contentDiv = element.find(findPrefix + escapedKey);
          contentDiv.hide();
          cachedViews[historyView.cacheKey] = historyView.view;
          if (historyView.subScope)
            cachedViewScopes[historyView.cacheKey] = historyView.subScope;
        } else {
          contentDiv = element.find(findPrefix + numViews);
          contentDiv.remove();
          if (historyView.subScope)
            historyView.subScope.$destroy();
        }
        if (unloadAll)
          unloadView(unloadAll);
      }

      function clearCache(key) {
        var keys = cachedViewKeys.slice();
        for (var i = 0, len = keys.length; i < len; i++) {
          if (keys[i].indexOf(key) !== 0)
            continue;
          if (cachedViews[keys[i]])
            delete cachedViews[keys[i]];
          if (cachedViewScopes[keys[i]]) {
            cachedViewScopes[keys[i]].$destroy();
            delete cachedViewScopes[keys[i]];
          }
          var escapedKey = keys[i].replace(/\./g, '\\.');
          element.find(findPrefix + escapedKey).remove();
          cachedViewKeys.splice(cachedViewKeys.indexOf(keys[i]), 1);
        }
      }

      function focusOnFirstChild(container) {
        if (!$window.tabbable)
          return;
        $timeout(function() {
          var firstFocusable = $window.tabbable(container[0])[0];
          if (firstFocusable)
            firstFocusable.focus();
        }, 0, false);
      }
      scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        scope.$emit(broadcastPrefix + '.close');
      };
      scope.$on(broadcastPrefix + '.unload', function() {
        unloadView(true);
      });
      scope.$on(broadcastPrefix + '.load', function(e, view) {
        if (!view)
          return;
        if (scope.history.length) {
          var currentView = scope.history[scope.history.length - 1];
          if (angular.equals(currentView.view, view) && currentView.key === stringFunction(view.cacheKey))
            return;
        }
        scope.loadView(view);
      });
      scope.$on(broadcastPrefix + '.clearCache', function(e, cacheKey) {
        clearCache(cacheKey);
      })
    }
  }
});;