/*! RESOURCE: /scripts/sn.dragdrop/directive.snDragEventBlocker.js */
angular.module("sn.dragdrop").directive("snDragEventBlocker", function() {
    "use strict";
    return {
        restrict: "A",
        link: function(scope, element) {
            element.bind("dragenter", killEvent)
            element.bind("dragover", killEvent);
            element.bind("drop", killEvent);
            element.bind("dragleave", killEvent)

            function killEvent(e) {
                if (e.stopPropagation)
                    e.stopPropagation();
                if (e.preventDefault)
                    e.preventDefault();
                return false;
            }
        }
    }
});