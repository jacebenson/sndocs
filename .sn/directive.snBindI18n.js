/*! RESOURCE: /scripts/sn/common/i18n/directive.snBindI18n.js */
angular.module('sn.common.i18n').directive('snBindI18n', function(i18n, $sanitize) {
    return {
        restrict: 'A',
        link: function(scope, iElem, iAttrs) {
            i18n.getMessage(iAttrs.snBindI18n, function(translatedValue) {
                var sanitizedValue = $sanitize(translatedValue);
                iElem.append(sanitizedValue);
            });
        }
    }
});;