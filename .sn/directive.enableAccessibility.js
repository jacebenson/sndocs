/*! RESOURCE: /scripts/concourse/directive.enableAccessibility.js */
angular.module('sn.concourse').directive('enableAccessibility', ['userPreferences', function(userPreferences) {
    return {
        template: '<a class="skip-links sr-only sr-only-focusable" href="#">{{::label}}</a>',
        restrict: 'E',
        replace: true,
        scope: {
            label: '@',
            confirm: '@'
        },
        link: function(scope, element) {
            element.on('click', function(evt) {
                evt.preventDefault();
                if (confirm(scope.confirm)) {
                    userPreferences.setPreference('glide.ui.accessibility', true).then(function() {
                        window.location.reload();
                    });
                }
            });
        }
    }
}]);;