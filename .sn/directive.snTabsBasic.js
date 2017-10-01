/*! RESOURCE: /scripts/heisenberg/angular/directive.snTabsBasic.js */
(function($) {
    angular.module('heisenberg').directive('snTabsBasic', function() {
        return {
            restrict: 'C',
            link: function link(scope, elem) {
                elem.each(function() {
                    var $this = $(this);
                    if (!$this.data('sn.tabs'))
                        $this.tabs();
                });
            }
        }
    });
})(jQuery);;