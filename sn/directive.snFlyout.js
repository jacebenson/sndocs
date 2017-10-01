/*! RESOURCE: /scripts/sn/common/ui/directive.snFlyout.js */
angular.module('sn.common.ui').directive('snFlyout', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        replace: 'true',
        templateUrl: getTemplateUrl('sn_flyout.xml'),
        scope: true,
        link: function($scope, element, attrs) {
            $scope.open = false;
            $scope.more = false;
            $scope.position = attrs.position || 'left';
            $scope.flyoutControl = attrs.control;
            $scope.register = attrs.register;
            var body = angular.element('.flyout-body', element);
            var header = angular.element('.flyout-header', element);
            var tabs = angular.element('.flyout-tabs', element);
            var distance = 0;
            var position = $scope.position;
            var options = {
                duration: 800,
                easing: 'easeOutBounce'
            }
            var animation = {};
            if ($scope.flyoutControl) {
                $('.flyout-handle', element).hide();
                var controls = angular.element('#' + $scope.flyoutControl);
                controls.click(function() {
                    angular.element(this).trigger("snFlyout.open");
                });
                controls.on('snFlyout.open', function() {
                    $scope.$apply(function() {
                        $scope.open = !$scope.open;
                    });
                });
            }
            var animate = function() {
                element.velocity(animation, options);
            }
            var setup = function() {
                animation[position] = -distance;
                if ($scope.open)
                    element.css(position, 0);
                else
                    element.css(position, -distance);
            }
            var calculatePosition = function() {
                if ($scope.open) {
                    animation[position] = 0;
                } else {
                    if ($scope.position === 'left' || $scope.position === 'right')
                        animation[position] = -body.outerWidth();
                    else
                        animation[position] = -body.outerHeight();
                }
            }
            $scope.$watch('open', function(newValue, oldValue) {
                if (newValue === oldValue)
                    return;
                calculatePosition();
                animate();
            });
            $scope.$watch('more', function(newValue, oldValue) {
                if (newValue === oldValue)
                    return;
                var moreAnimation = {};
                if ($scope.more) {
                    element.addClass('fly-double');
                    moreAnimation = {
                        width: body.outerWidth() * 2
                    };
                } else {
                    element.removeClass('fly-double');
                    moreAnimation = {
                        width: body.outerWidth() / 2
                    };
                }
                body.velocity(moreAnimation, options);
                header.velocity(moreAnimation, options);
            });
            if ($scope.position === 'left' || $scope.position === 'right') {
                $scope.$watch(element[0].offsetWidth, function() {
                    element.addClass('fly-from-' + $scope.position);
                    distance = body.outerWidth();
                    setup();
                });
            } else if ($scope.position === 'top' || $scope.position === 'bottom') {
                $scope.$watch(element[0].offsetWidth, function() {
                    element.addClass('fly-from-' + $scope.position);
                    distance = body.outerHeight() + header.outerHeight();
                    setup();
                });
            }
            $scope.$on($scope.register + ".bounceTabByIndex", function(event, index) {
                $scope.bounceTab(index);
            });
            $scope.$on($scope.register + ".bounceTab", function(event, tab) {
                $scope.bounceTab($scope.tabs.indexOf(tab));
            });
            $scope.$on($scope.register + ".selectTabByIndex", function(event, index) {
                $scope.selectTab($scope.tabs[index]);
            });
            $scope.$on($scope.register + ".selectTab", function(event, tab) {
                $scope.selectTab(tab);
            });
        },
        controller: function($scope, $element) {
            $scope.tabs = [];
            var baseColor, highLightColor;
            $scope.selectTab = function(tab) {
                if ($scope.selectedTab)
                    $scope.selectedTab.selected = false;
                tab.selected = true;
                $scope.selectedTab = tab;
                normalizeTab($scope.tabs.indexOf(tab));
            }

            function expandTab(tabElem) {
                tabElem.queue("tabBounce", function(next) {
                    tabElem.velocity({
                        width: ["2.5rem", "2.125rem"],
                        backgroundColorRed: [highLightColor[0], baseColor[0]],
                        backgroundColorGreen: [highLightColor[1], baseColor[1]],
                        backgroundColorBlue: [highLightColor[2], baseColor[2]]
                    }, {
                        easing: "easeInExpo",
                        duration: 250
                    });
                    next();
                });
            }

            function contractTab(tabElem) {
                tabElem.queue("tabBounce", function(next) {
                    tabElem.velocity({
                        width: ["2.125rem", "2.5rem"],
                        backgroundColorRed: [baseColor[0], highLightColor[0]],
                        backgroundColorGreen: [baseColor[1], highLightColor[1]],
                        backgroundColorBlue: [baseColor[2], highLightColor[2]]
                    }, {
                        easing: "easeInExpo",
                        duration: 250
                    });
                    next();
                });
            }
            $scope.bounceTab = function(index) {
                if (index >= $scope.tabs.length || index < 0)
                    return;
                var tabScope = $scope.tabs[index];
                if (!tabScope.selected) {
                    var tabElem = $element.find('.flyout-tab').eq(index);
                    if (!baseColor) {
                        baseColor = tabElem.css('backgroundColor').match(/[0-9]+/g);
                        for (var i = 0; i < baseColor.length; i++)
                            baseColor[i] = parseInt(baseColor[i], 10);
                    }
                    if (!highLightColor)
                        highLightColor = invertColor(baseColor);
                    if (tabScope.highlighted)
                        contractTab(tabElem);
                    for (var i = 0; i < 2; i++) {
                        expandTab(tabElem);
                        contractTab(tabElem);
                    }
                    expandTab(tabElem);
                    tabElem.dequeue("tabBounce");
                    tabScope.highlighted = true;
                }
            }
            $scope.toggleOpen = function() {
                $scope.open = !$scope.open;
            }
            this.addTab = function(tab) {
                $scope.tabs.push(tab);
                if ($scope.tabs.length === 1)
                    $scope.selectTab(tab)
            }

            function normalizeTab(index) {
                if (index < 0 || index >= $scope.tabs.length || !$scope.tabs[index].highlighted)
                    return;
                var tabElem = $element.find('.flyout-tab').eq(index);
                tabElem.velocity({
                    width: ["2.125rem", "2.5rem"]
                }, {
                    easing: "easeInExpo",
                    duration: 250
                });
                tabElem.css('backgroundColor', '');
                $scope.tabs[index].highlighted = false;
            }

            function invertColor(rgb) {
                if (typeof rgb === "string")
                    var color = rgb.match(/[0-9]+/g);
                else
                    var color = rgb.slice(0);
                for (var i = 0; i < color.length; i++)
                    color[i] = 255 - parseInt(color[i], 10);
                return color;
            }
        }
    }
}).directive("snFlyoutTab", function() {
    "use strict";
    return {
        restrict: "E",
        require: "^snFlyout",
        replace: true,
        scope: true,
        transclude: true,
        template: "<div ng-show='selected' ng-transclude='' style='height: 100%'></div>",
        link: function(scope, element, attrs, flyoutCtrl) {
            flyoutCtrl.addTab(scope);
        }
    }
});