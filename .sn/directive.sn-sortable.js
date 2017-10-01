/*! RESOURCE: /scripts/sn.dragdrop/directive.sn-sortable.js */
angular.module("sn.dragdrop").directive("snSortable", function(uiSortableDirective) {
    "use strict";
    return {
        require: uiSortableDirective[0].require,
        scope: {
            ngModel: '=',
            uiSortable: '='
        },
        compile: function(tElement, tAttrs) {
            var options = tAttrs.snSortable || angular.toJson({
                connectWith: tAttrs.sortableContainer
            });
            tAttrs.$set("uiSortable", options);
            return uiSortableDirective[0].link;
        }
    };
});