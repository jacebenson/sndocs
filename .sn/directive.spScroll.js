/*! RESOURCE: /scripts/app.$sp/directive.spScroll.js */
angular.module('sn.$sp').directive('spScroll', function() {
    function scrollTo(el, options) {
        var offset = $(options.offset).height() || 0;
        $(el).animate({
            scrollTop: $(options.selector).offset().top - offset - 10
        }, options.time);
    }

    function link($scope, el) {
        $scope.$on('$sp.scroll', function(e, options) {
            if (options.selector) {
                return scrollTo(el, options);
            }
            $(el).scrollTop(options.position || 0);
        });
    };
    return {
        restrict: 'C',
        link: link
    }
});;