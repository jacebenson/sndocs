/*! RESOURCE: /scripts/app.$sp/directive.spOnTransition.js */
angular.module('sn.$sp').directive('spOnTransition', function($rootScope) {
    function detectEvent() {
        var t, el = document.createElement("test");
        var transitions = {
            "transition": "transitionend",
            "OTransition": "oTransitionEnd",
            "MozTransition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        };
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    var transition = detectEvent();
    return {
        restrict: 'A',
        scope: {
            spOnTransition: '='
        },
        link: function(scope, element) {
            $(element).on(transition, function() {
                $rootScope.$broadcast(scope.spOnTransition.event);
            });
        }
    }
});;