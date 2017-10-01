/*! RESOURCE: /scripts/app.$sp/directive.spMetatags.js */
angular.module('sn.$sp').directive('spMetatags', function(spMetatagService, $window) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            spMetatagService.subscribe(function(tags) {
                elem.find("meta[custom-tag]").remove();
                for (var key in tags) {
                    var tagElement = $window.document.createElement("meta");
                    tagElement.setAttribute("custom-tag", "");
                    tagElement.setAttribute("name", key);
                    tagElement.setAttribute("content", tags[key]);
                    elem.append(tagElement);
                }
            })
        }
    }
});;