/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPane.js */
angular.module('sn.connect.util').directive('snPane', function($timeout, getTemplateUrl, paneManager) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: getTemplateUrl('snPane.xml'),
        scope: {
            paneCollapsed: '=',
            panePosition: '@',
            paneResizeable: '@',
            paneWidth: '=',
            paneToggle: '@'
        },
        link: function(scope, element) {
            var scrollPromise;
            var mouseHeldDown = false;
            var mouseClicked = true;
            scope.toggleConversationList = function($event) {
                if ($event && $event.keyCode === 9)
                    return;
                paneManager.togglePane('connect:conversation_list', true);
            };
            scope.$watch('paneWidth', function() {
                if (scope.paneWidth) {
                    element.width(scope.paneWidth);
                }
            });
            scope.isMobile = function() {
                return angular.element('html').width() <= 800;
            };
            scope.scrollMousedown = function(moveBy) {
                scrollPromise = $timeout(function() {
                    mouseHeldDown = true;
                    mouseClicked = false;
                    updateScrollPosition(moveBy);
                }, 300);
            };
            scope.scrollMouseup = function() {
                $timeout.cancel(scrollPromise);
                scrollPromise = void(0);
                if (!mouseClicked) {
                    mouseHeldDown = false;
                }
            };
            scope.scrollUpCick = function() {
                if (mouseClicked) {
                    var scrollContainer = element.find('.pane-scroll-container');
                    updateScrollPosition(-scrollContainer.height());
                }
                mouseClicked = true;
                mouseHeldDown = false;
            };
            scope.scrollDownCick = function() {
                if (mouseClicked) {
                    var scrollContainer = element.find('.pane-scroll-container');
                    updateScrollPosition(scrollContainer.height());
                }
                mouseClicked = true;
                mouseHeldDown = false;
            };
            scope.openConnect = function($event) {
                $event.stopPropagation();
                if ($event && $event.keyCode === 9)
                    return;
                window.open("$c.do", "_blank");
            };

            function updateScrollPosition(moveBy) {
                var scrollContainer = element.find('.pane-scroll-container');
                scrollContainer.animate({
                    scrollTop: scrollContainer[0].scrollTop + moveBy
                }, 300, 'linear', function() {
                    if (mouseHeldDown) {
                        updateScrollPosition(moveBy);
                    }
                });
            }

            function updateScrollButtons() {
                var scrollContainer = element.find('.pane-scroll-container');
                if (scope.paneCollapsed && !scope.isMobile() && scrollContainer.get(0)) {
                    if (scrollContainer.outerHeight() < scrollContainer.get(0).scrollHeight) {} else {}
                } else {}
            }
            scope.togglePane = function() {
                scope.paneCollapsed = !scope.paneCollapsed;
                scope.$root.$broadcast('pane.collapsed', scope.panePosition, scope.paneCollapsed);
                updateScrollButtons();
            }
            angular.element(window).on('resize', function() {
                updateScrollButtons();
            });
            $timeout(updateScrollButtons);
        }
    };
});;