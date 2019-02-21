/*! RESOURCE: /scripts/js_includes_overviewhelp.js */
/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
  "use strict";
  var events = (existingCustomEvent && existingCustomEvent.events) || {};
  var isFiringFlag = false;
  var trace = false;
  var suppressEvents = false;
  var NOW_MSG = 'NOW.PostMessage';

  function observe(eventName, fn) {
    if (trace)
      jslog("$CustomEventManager observing: " + eventName);
    on(eventName, fn);
  }

  function on(name, func) {
    if (!func || typeof func !== 'function')
      return;
    if (typeof name === 'undefined')
      return;
    if (!events[name])
      events[name] = [];
    events[name].push(func);
  }

  function un(name, func) {
    if (!events[name])
      return;
    var idx = -1;
    for (var i = 0; i < events[name].length; i++) {
      if (events[name][i] === func) {
        idx = i;
        break;
      }
    }
    if (idx >= 0)
      events[name].splice(idx, 1)
  }

  function unAll(name) {
    if (events[name])
      delete events[name];
  }

  function fire(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return fireEvent.apply(null, arguments);
  }

  function fireUp(eventName, args) {
    var win = window;
    while (win) {
      try {
        if (win.CustomEvent.fireEvent.apply(null, arguments) === false)
          return;
        win = win.parent === win ? null : win.parent;
      } catch (e) {
        return;
      }
    }
  }

  function fireEvent() {
    if (suppressEvents)
      return true;
    var args = Array.prototype.slice.apply(arguments);
    var name = args.shift();
    var eventList = events[name];
    if (!eventList)
      return true;
    var event = eventList.slice();
    isFiringFlag = true;
    for (var i = 0, l = event.length; i < l; i++) {
      var ev = event[i];
      if (!ev)
        continue;
      if (ev.apply(null, args) === false) {
        isFiringFlag = false;
        return false;
      }
    }
    isFiringFlag = false;
    return true;
  }

  function isFiring() {
    return isFiringFlag;
  }

  function forward(name, element, func) {
    on(name, func);
    element.addEventListener(name, function(e) {
      fireEvent(e.type, this, e);
    }.bind(api));
  }

  function isOriginInWhiteList(origin, whitelistStr) {
    if (!whitelistStr) {
      return false;
    }
    var delimiterRegex = /[\n, ]/;
    var whitelist = whitelistStr.split(delimiterRegex)
      .filter(function(whiteListedOrigin) {
        return whiteListedOrigin;
      })
      .map(function(whiteListedOrigin) {
        return whiteListedOrigin.toLowerCase();
      });
    if (~whitelist.indexOf(origin.toLowerCase())) {
      return true;
    }
    return false;
  }

  function shouldProcessMessage(sourceOrigin) {
    if (!window.g_concourse_onmessage_enforce_same_origin || sourceOrigin === window.location.origin) {
      return true;
    }
    return isOriginInWhiteList(sourceOrigin, window.g_concourse_onmessage_enforce_same_origin_whitelist);
  }

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
      if (!shouldProcessMessage(event.origin)) {
        console.warn('Incoming message ignored due to origin mismatch.');
        return;
      }
      var nowMessageJSON = event.data;
      var nowMessage;
      try {
        nowMessage = JSON.parse(nowMessageJSON.toString());
      } catch (e) {
        return;
      }
      if (!nowMessage.type == NOW_MSG) {
        return;
      }
      fire(nowMessage.eventName, nowMessage.args);
    }, false);
    NOW.registeredPostMessageEvent = true;
  }

  function doPostMessage(win, event, msg, targetOrigin) {
    var nowMessage = {
      type: NOW_MSG,
      eventName: event,
      args: msg
    };
    var nowMessageJSON;
    if (!win || !win.postMessage) {
      return
    }
    nowMessageJSON = JSON.stringify(nowMessage);
    win.postMessage(nowMessageJSON, targetOrigin);
  }

  function fireTop(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    fireEvent.apply(null, arguments);
    var t = getTopWindow();
    if (t !== null && window !== t)
      t.CustomEvent.fire(eventName, args);
  }

  function fireAll(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var topWindow = getTopWindow();
    notifyAllFrom(topWindow);

    function notifyAllFrom(rootFrame) {
      var childFrame;
      rootFrame.CustomEvent.fireEvent(eventName, args);
      for (var i = 0; i < rootFrame.length; i++) {
        try {
          childFrame = rootFrame[i];
          if (!childFrame)
            continue;
          if (childFrame.CustomEvent && typeof childFrame.CustomEvent.fireEvent === "function") {
            notifyAllFrom(childFrame);
          }
        } catch (e) {}
      }
    }
  }

  function fireToWindow(targetWindow, eventName, args, usePostMessage, targetOrigin) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + args.length);
    if (usePostMessage) {
      doPostMessage(targetWindow, eventName, args, targetOrigin);
    } else {
      targetWindow.CustomEvent.fireEvent(eventName, args);
    }
  }

  function getTopWindow() {
    var topWindow = window.self;
    try {
      while (topWindow.CustomEvent.fireEvent && topWindow !== topWindow.parent && topWindow.parent.CustomEvent.fireEvent) {
        topWindow = topWindow.parent;
      }
    } catch (e) {}
    return topWindow;
  }

  function isTopWindow() {
    return getTopWindow() == window.self;
  }

  function jslog(msg, src, dateTime) {
    try {
      if (!src) {
        var path = window.self.location.pathname;
        src = path.substring(path.lastIndexOf('/') + 1);
      }
      if (window.self.opener && window != window.self.opener) {
        if (window.self.opener.jslog) {
          window.self.opener.jslog(msg, src, dateTime);
        }
      } else if (parent && parent.jslog && jslog != parent.jslog) {
        parent.jslog(msg, src, dateTime);
      } else {
        if (window.console && window.console.log)
          console.log(msg);
      }
    } catch (e) {}
  }
  var api = {
    set trace(value) {
      trace = !!value;
    },
    get trace() {
      return trace;
    },
    set suppressEvents(value) {
      suppressEvents = !!value;
    },
    get suppressEvents() {
      return suppressEvents;
    },
    get events() {
      return events;
    },
    set events(value) {
      events = value;
    },
    on: on,
    un: un,
    unAll: unAll,
    forward: forward,
    isFiring: isFiring,
    fireEvent: fireEvent,
    observe: observe,
    fire: fire,
    fireTop: fireTop,
    fireAll: fireAll,
    fireToWindow: fireToWindow,
    isTopWindow: isTopWindow,
    fireUp: fireUp,
    toString: function() {
      return 'CustomEventManager';
    }
  };
  registerPostMessageEvent();
  return api;
})(NOW.CustomEvent);
NOW.CustomEvent = CustomEventManager;
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireUp = NOW.CustomEvent.fireUp.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.fireToWindow = NOW.CustomEvent.fireToWindow.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
  CustomEvent.events = NOW.CustomEvent.events;
  CustomEvent.isTopWindow = NOW.CustomEvent.isTopWindow.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};
/*! RESOURCE: /scripts/app.overviewhelp/app.overviewhelp.js */
(function() {
  angular.module('sn.overviewhelp', ['sn.base', 'ng.common']);
  angular.module('sn.overviewhelp').directive('overviewhelp', function(getTemplateUrl, snCustomEvent, $document) {
    "use strict";
    return {
      restrict: 'E',
      scope: {
        pageName: "@",
        active: "@",
        embedded: "@"
      },
      templateUrl: getTemplateUrl('ng_overview_help.xml'),
      link: function($scope, $element, $attrs) {
        $attrs.$observe('active', function() {
          $scope.active = $scope.$eval($attrs.active);
        });
        $scope.$on('overviewhelp.active', function() {
          setTimeout(function() {
            $element.find('a, button').first().focus();
          }, 0);
        });
        $element.on('keydown', function(evt) {
          var $firstItem = $element.find('a, button').first();
          var $lastItem = $element.find('a, button').last();
          if (evt.keyCode != 9)
            return;
          if ($firstItem.is(evt.target) && evt.shiftKey) {
            $lastItem.focus();
            evt.stopPropagation();
            evt.preventDefault();
          } else if ($lastItem.is(evt.target) && !evt.shiftKey) {
            $firstItem.focus();
            evt.stopPropagation();
            evt.preventDefault();
          }
        });
        $document.on("keydown", function(evt) {
          if ($scope.active && evt.keyCode == 27) {
            $scope.close();
          }
        });
      },
      controller: function($scope, $http, urlTools, $element, userPreferences) {
        var $carousel = null;
        $scope.currentPanel = 0;
        snCustomEvent.observe('overview_help.activate', function(data) {
          if (data.pageName && data.pageName == $scope.pageName)
            activate();
        });
        $scope.$watch('active', function(newValue) {
          if (newValue)
            activate();
        });
        $scope.$watch('loaded', function(newValue) {
          if (newValue) {
            $carousel = $element.carousel({
              interval: 10000,
              wrap: true,
              pause: 'hover'
            });
          }
        })

        function activate() {
          var url = urlTools.urlFor('overview_help', {
            page: $scope.pageName
          });
          $http.get(url).success(function(response) {
            $scope.panels = response.panels;
            $scope.icon_buttons = response.icon_buttons;
            $scope.footer_bg = response.footer_bg;
            $scope.hasNext = $scope.panels.length > 1;
            $scope.loaded = true;
            $scope.active = true;
            $scope.$broadcast('overviewhelp.active');
            if ($carousel) {
              $carousel.carousel('cycle');
            }
          });
        }
        $scope.next = function() {
          $carousel.carousel('next');
        }
        $element.on('slide.bs.carousel', function(evt) {
          $scope.currentPanel = parseInt(evt.relatedTarget.getAttribute('data-panel-number'), 10);
          $scope.$apply();
        });
        $scope.$watch('currentPanel + loaded', function() {
          if (!$scope.panels) {
            $scope.hasNext = false;
            $scope.hasPrev = false;
            return;
          }
          $scope.hasNext = $scope.currentPanel + 1 < $scope.panels.length;
        });
        $scope.close = function() {
          $carousel.carousel('pause');
          userPreferences.setPreference('overview_help.visited.' + $scope.pageName, 'true').then(function() {
            snCustomEvent.fireAll('overview_help.finished', {
              id: $scope.pageName
            });
            if ($scope.embedded == 'true')
              $scope.active = false;
          });
        }
      }
    }
  });
})();;
/*! RESOURCE: /scripts/app.overviewhelp/directive.snTriggerOverviewHelp.js */
angular.module('sn.overviewhelp').directive('snTriggerOverviewHelp', function(snCustomEvent) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      $element.click(function() {
        var pageName = $attrs.snTriggerOverviewHelp;
        snCustomEvent.fire('overview_help.activate', {
          pageName: pageName
        });
        $element.closest('.popover').popover('hide');
      });
    }
  }
});;;