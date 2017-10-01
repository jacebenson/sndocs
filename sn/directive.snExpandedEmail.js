/*! RESOURCE: /scripts/sn/common/stream/directive.snExpandedEmail.js */
angular.module("sn.common.stream").directive("snExpandedEmail", function() {
    "use strict";
    return {
        restrict: "E",
        replace: true,
        scope: {
            email: "="
        },
        template: "<iframe style='width: 100%;' class='card' src='{{::emailBodySrc}}'></iframe>",
        controller: function($scope) {
            $scope.emailBodySrc = "email_display.do?email_id=" + $scope.email.sys_id.displayValue;
        },
        link: function(scope, element) {
            element.load(function() {
                var bodyHeight = $j(this).get(0).contentWindow.document.body.scrollHeight + "px";
                $j(this).height(bodyHeight);
            });
        }
    };
});;