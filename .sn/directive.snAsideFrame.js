/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideFrame.js */
angular.module('sn.connect.resource').directive('snAsideFrame', function(getTemplateUrl, $timeout) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideFrame.xml'),
        link: function(scope, element, attrs) {
            scope.title = attrs.title;
            scope.url = attrs.url + (attrs.url.indexOf('?') < 0 ? '?' : '&') + "sysparm_clear_stack=true";
            scope.name = attrs.name;
            scope.$on("sn.aside.open", function() {
                $timeout(function() {
                    if (element.is(":visible"))
                        scope.$emit("sn.aside.controls.active", scope.name);
                }, 0, false);
            });
        },
        controller: function($scope) {
            $timeout(function() {
                $scope.$emit('sn.aside.controls.active', $scope.name);
            }, 0, false);
            $scope.close = function(evt) {
                if (evt.keyCode === 9)
                    return;
                $scope.$emit("sn.aside.close");
            }
        }
    }
});;