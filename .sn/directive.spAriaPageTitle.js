/*! RESOURCE: /scripts/app.$sp/directive.spAriaPageTitle.js */
angular.module("sn.$sp").directive('spAriaPageTitle', function(spAriaFocusManager) {
    function link(scope, elem, attr) {
        spAriaFocusManager.registerPageTitleFocus(function() {
            scope.$evalAsync(function() {
                elem.attr('tabIndex', '-1').focus();
            });
        });
    }
    return {
        restrict: 'E',
        replace: true,
        scope: {
            pageTitle: '='
        },
        template: "<h1 class='sr-only'>{{pageTitle}}</h1>",
        link: link
    }
});;