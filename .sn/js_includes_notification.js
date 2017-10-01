/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize', 'sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/notification/factory.notificationWrapper.js */
angular.module("sn.common.notification").factory("snNotificationWrapper", function($window, $timeout) {
    "use strict";

    function assignHandler(notification, handlerName, options) {
        if (typeof options[handlerName] === "function")
            notification[handlerName.toLowerCase()] = options[handlerName];
    }
    return function NotificationWrapper(title, options) {
        var defaults = {
            dir: 'auto',
            lang: 'en_US',
            decay: true,
            lifespan: 4000,
            body: "",
            tag: "",
            icon: '/native_notification_icon.png'
        };
        var optionsOnClick = options.onClick;
        options.onClick = function() {
            if (angular.isFunction($window.focus))
                $window.focus();
            if (typeof optionsOnClick === "function")
                optionsOnClick();
        }
        var result = {};
        options = angular.extend(defaults, options);
        var previousOnClose = options.onClose;
        options.onClose = function() {
            if (angular.isFunction(result.onclose))
                result.onclose();
            if (angular.isFunction(previousOnClose))
                previousOnClose();
        }
        var notification = new $window.Notification(title, options);
        assignHandler(notification, "onShow", options);
        assignHandler(notification, "onClick", options);
        assignHandler(notification, "onError", options);
        assignHandler(notification, "onClose", options);
        if (options.decay && options.lifespan > 0)
            $timeout(function() {
                notification.close();
            }, options.lifespan)
        result.close = function() {
            notification.close();
        }
        return result;
    }
});
/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function($window, snNotificationWrapper) {
    "use strict";
    return function(settings) {
        function requestNotificationPermission() {
            if ($window.Notification && $window.Notification.permission === "default")
                $window.Notification.requestPermission();
        }

        function canUseNativeNotifications() {
            return ($window.Notification && $window.Notification.permission === "granted");
        }
        var currentNotifications = [];
        settings = angular.extend({
            notifyMethods: ["native", "glide"]
        }, settings);
        var methods = {
            'native': nativeNotify,
            'glide': glideNotify
        };

        function nativeNotify(title, options) {
            if (canUseNativeNotifications()) {
                var newNotification = snNotificationWrapper(title, options);
                newNotification.onclose = function() {
                    stopTrackingNotification(newNotification)
                };
                currentNotifications.push(newNotification);
                return true;
            }
            return false;
        }

        function glideNotify(title, options) {
            return false;
        }

        function stopTrackingNotification(newNotification) {
            var index = currentNotifications.indexOf(newNotification);
            if (index > -1)
                currentNotifications.splice(index, 1);
        }

        function notify(title, options) {
            if (typeof options === "string")
                options = {
                    body: options
                };
            options = options || {};
            for (var i = 0, len = settings.notifyMethods.length; i < len; i++)
                if (typeof settings.notifyMethods[i] == "string") {
                    if (methods[settings.notifyMethods[i]](title, options))
                        break;
                } else {
                    if (settings.notifyMethods[i](title, options))
                        break;
                }
        }

        function clearAllNotifications() {
            while (currentNotifications.length > 0)
                currentNotifications.pop().close();
        }
        return {
            notify: notify,
            canUseNativeNotifications: canUseNativeNotifications,
            clearAllNotifications: clearAllNotifications,
            requestNotificationPermission: requestNotificationPermission
        }
    }
});;
/*! RESOURCE: /scripts/sn/common/notification/directive.snNotification.js */
angular.module('sn.common.notification').directive('snNotification', function($timeout, $rootScope) {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="notification-container"></div>',
        link: function(scope, element) {
            scope.addNotification = function(payload) {
                    if (!payload)
                        payload = {};
                    if (!payload.text)
                        payload.text = '';
                    if (!payload.classes)
                        payload.classes = '';
                    if (!payload.duration)
                        payload.duration = 5000;
                    angular.element('<div/>').qtip({
                        content: {
                            text: payload.text,
                            title: {
                                button: false
                            }
                        },
                        position: {
                            target: [0, 0],
                            container: angular.element('.notification-container')
                        },
                        show: {
                            event: false,
                            ready: true,
                            effect: function() {
                                angular.element(this).stop(0, 1).animate({
                                    height: 'toggle'
                                }, 400, 'swing');
                            },
                            delay: 0,
                            persistent: false
                        },
                        hide: {
                            event: false,
                            effect: function(api) {
                                angular.element(this).stop(0, 1).animate({
                                    height: 'toggle'
                                }, 400, 'swing');
                            }
                        },
                        style: {
                            classes: 'jgrowl' + ' ' + payload.classes,
                            tip: false
                        },
                        events: {
                            render: function(event, api) {
                                if (!api.options.show.persistent) {
                                    angular.element(this).bind('mouseover mouseout', function(e) {
                                            clearTimeout(api.timer);
                                            if (e.type !== 'mouseover') {
                                                api.timer = setTimeout(function() {
                                                    api.hide(e);
                                                }, payload.duration);
                                            }
                                        })
                                        .triggerHandler('mouseout');
                                }
                            }
                        }
                    });
                },
                scope.$on('notification.notify', function(event, payload) {
                    scope.addNotification(payload);
                });
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope, $timeout, $q, getTemplateUrl, $http, i18n) {
    'use strict';
    var openNotifications = [],
        timeouts = {},
        options = {
            top: 20,
            gap: 10,
            duration: 5000
        };
    return {
        show: function(type, message, duration, onClick, container) {
            return createNotificationElement(type, message).then(function(element) {
                displayNotification(element, container);
                checkAndSetDestroyDuration(element, duration);
                return element;
            });
        },
        hide: hide,
        setOptions: function(opts) {
            if (angular.isObject(opts))
                angular.extend(options, opts);
        }
    };

    function getTemplate() {
        var templateName = 'sn_notification.xml',
            template = $templateCache.get(templateName),
            deferred = $q.defer();
        if (!template) {
            var url = getTemplateUrl(templateName);
            $http.get(url).then(function(result) {
                    $templateCache.put(templateName, result.data);
                    deferred.resolve(result.data);
                },
                function(reason) {
                    return $q.reject(reason);
                });
        } else
            deferred.resolve(template);
        return deferred.promise;
    }

    function createNotificationElement(type, message) {
        var thisScope, thisElement;
        var icon = 'icon-info';
        if (type == 'error') {
            icon = 'icon-cross-circle';
        } else if (type == 'warning') {
            icon = 'icon-alert';
        } else if (type = 'success') {
            icon = 'icon-check-circle';
        }
        return getTemplate().then(function(template) {
            thisScope = $rootScope.$new();
            thisScope.type = type;
            thisScope.message = message;
            thisScope.icon = icon;
            thisElement = $compile(template)(thisScope);
            return angular.element(thisElement[0]);
        });
    }

    function displayNotification(element, container) {
        var container = $document.find(container || 'body'),
            id = 'elm' + Date.now(),
            pos;
        container.append(element);
        pos = options.top + openNotifications.length * getElementHeight(element);
        positionElement(element, pos);
        element.addClass('visible');
        element.attr('id', id);
        element.find('button').bind('click', function(e) {
            hideElement(element);
        });
        openNotifications.push(element);
        if (options.duration > 0)
            timeouts[id] = $timeout(function() {
                hideNext();
            }, options.duration);
    }

    function hide(element) {
        $timeout.cancel(timeouts[element.attr('id')]);
        element.removeClass('visible');
        element.addClass('hidden');
        element.find('button').eq(0).unbind();
        element.scope().$destroy();
        element.remove();
        repositionAll();
    }

    function hideElement(element) {
        var index = openNotifications.indexOf(element);
        openNotifications.splice(index, 1);
        hide(element);
    }

    function hideNext() {
        var element = openNotifications.shift();
        if (element)
            hide(element);
    }

    function getElementHeight(element) {
        return element[0].offsetHeight + options.gap;
    }

    function positionElement(element, pos) {
        element[0].style.top = pos + 'px';
    }

    function repositionAll() {
        var pos = options.top;
        openNotifications.forEach(function(element) {
            positionElement(element, pos);
            pos += getElementHeight(element);
        });
    }

    function checkAndSetDestroyDuration(element, duration) {
        if (duration) {
            timeouts[element.attr('id')] = $timeout(function() {
                hideElement(element);
            }, duration);
        }
    }
});;;