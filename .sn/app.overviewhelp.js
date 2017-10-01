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