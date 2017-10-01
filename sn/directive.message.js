/*! RESOURCE: /scripts/sn/common/i18n/directive.message.js */
angular.module('sn.common.i18n').directive('nowMessage', function(i18n) {
    return {
        restrict: 'E',
        priority: 0,
        template: '',
        replace: true,
        compile: function(element, attrs, transclude) {
            var value = element.attr('value');
            if (!attrs.key || !value)
                return;
            i18n.loadMessage(attrs.key, value);
        }
    };
});;