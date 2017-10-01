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