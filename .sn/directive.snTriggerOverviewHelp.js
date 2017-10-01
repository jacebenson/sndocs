/*! RESOURCE: /scripts/app.overviewhelp/directive.snTriggerOverviewHelp.js */
angular.module('sn.overviewhelp').directive('snTriggerOverviewHelp', function(snCustomEvent) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.click(function() {
                var pageName = $attrs.snTriggerOverviewHelp;
                snCustomEvent.fire('overview_help.activate', {
                    pageName: pageName
                });
                $element.closest('.popover').popover('hide');
            });
        }
    }
});;