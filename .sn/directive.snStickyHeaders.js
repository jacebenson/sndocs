/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
    "use strict";
    return {
        restrict: 'A',
        transclude: false,
        replace: false,
        link: function(scope, element, attrs) {
            element.addClass('sticky-headers');
            var containers;
            var scrollContainer = element.find('[sn-sticky-scroll-container]');
            scrollContainer.addClass('sticky-scroll-container');

            function refreshHeaders() {
                if (attrs.snStickyHeaders !== 'false') {
                    angular.forEach(containers, function(container) {
                        var stickyContainer = angular.element(container);
                        var stickyHeader = stickyContainer.find('[sn-sticky-header]');
                        var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
                        stickyContainer.addClass('sticky-container');
                        if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
                            stickyContainer.css('padding-top', stickyHeader.outerHeight());
                            stickyHeader.css('width', stickyHeader.outerWidth());
                            stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
                        } else {
                            stickyContainer.css('padding-top', '');
                            stickyHeader.css('width', '');
                            stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
                        }
                    });
                } else {
                    element.find('[sn-sticky-container]').removeClass('sticky-container');
                    element.find('[sn-sticky-container]').css('padding-top', '');
                    element.find('[sn-sticky-header]').css('width', '');
                    element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
                }
            }
            scope.$watch(function() {
                scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
                containers = element.find('[sn-sticky-container]');
                return attrs.snStickyHeaders;
            }, refreshHeaders);
            scope.$watch(function() {
                return scrollContainer[0].scrollHeight;
            }, refreshHeaders);
            scrollContainer.on('scroll', refreshHeaders);
        }
    };
});;