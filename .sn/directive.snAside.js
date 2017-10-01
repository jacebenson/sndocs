/*! RESOURCE: /scripts/sn.angularstrap/directive.snAside.js */
angular.module('sn.angularstrap').directive('snAside', function(getTemplateUrl, $aside, $animate, $timeout) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        template: '<div />',
        scope: {
            name: '@'
        },
        link: function(scope, element, attrs) {
            var broadcastPrefix = 'sn.aside' + (attrs.name ? '.' + attrs.name : '');
            scope.options = {
                title: '',
                content: '',
                placement: 'right',
                backdrop: false,
                keyboard: false,
                element: element,
                scope: scope,
                show: false,
                template: getTemplateUrl('sn_aside.xml')
            };
            scope.aside = $aside(scope.options);
            scope.$on(broadcastPrefix + '.open', _openAside);
            scope.$on(broadcastPrefix + '.deferred.open', function(e, view, widthOverride) {
                scope.aside.$promise.then(function() {
                    _openAside(e, view, widthOverride);
                });
            });

            function _openAside(e, view, widthOverride) {
                if (!scope.$isShown) {
                    scope.aside.show();
                    scope.$isShown = true;
                    scope.aside.$element.addClass('sn-aside_open');
                    scope.aside.$element.addClass('sn-aside-hide');
                    $timeout(function() {
                        scope.aside.$element.removeClass('sn-aside-hide');
                    }, 0, false);
                }
                applyManualWidth(widthOverride);
                if (view)
                    scope.$broadcast(broadcastPrefix + '.load', view);
            }
            scope.$on(broadcastPrefix + '.resize', function(e, width) {
                applyManualWidth(width);
            });
            scope.$on(broadcastPrefix + '.close', function(e, killAnimation) {
                if (!scope.$isShown)
                    return;
                scope.$isShown = false;
                var element = scope.aside.$element;
                if (killAnimation === true) {
                    element.addClass('disableAnimations');
                    scope.$broadcast(broadcastPrefix + '.unload');
                } else {
                    $animate.addClass(element, 'sn-aside-hide', function() {
                        scope.$broadcast(broadcastPrefix + '.unload');
                    });
                }
                element.removeClass('disableAnimations');
            });
            scope.$on('aside.hide.before', function() {
                scope.aside.$element.removeClass('sn-aside_open');
            });
            scope.$on('aside.hide', function() {
                scope.$isShown = false;
                scope.aside.$element.addClass('sn-aside-hide');
            });

            function applyManualWidth(width) {
                if (angular.isString(width))
                    return scope.aside.$element.css('width', width).find('.aside-dialog').css('min-width', width);
                if (angular.isNumber) {
                    var newWidth = Math.max(320, width);
                    return scope.aside.$element.innerWidth(newWidth).find('.aside-dialog').css('min-width', newWidth);
                }
            }
        }
    };
});;