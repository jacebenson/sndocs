/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
    "use strict";
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var value = scope.$eval(attrs.snBindOnce);
            var sanitizedValue = $sanitize(value);
            element.append(sanitizedValue);
        }
    }
});