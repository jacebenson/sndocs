/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpPane.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpPane', function($timeout, getTemplateUrl, paneManager) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: getTemplateUrl('sn_embedded_help_pane.xml'),
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
            scope.actionClick = function(expression) {
                expression = expression.replace(/&quot;/g, '\'');
                return eval(expression);
            }

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
            scope.toggleHelpPane = function() {
                paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME, true);
                updateScrollButtons();
            }
            angular.element(window).on('resize', function() {
                updateScrollButtons();
            });
            $timeout(updateScrollButtons);
        }
    };
});;