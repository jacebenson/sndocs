/*! RESOURCE: /scripts/classes/nowapi/util/GlideUrlBuilder.js */
(function(exports, angular) {
    "use strict";
    angular.injector(['ng', 'sn.common.glide']).invoke(function(glideUrlBuilder) {
        exports.GlideURLBuilder = glideUrlBuilder;
        exports.GlideURL = glideUrlBuilder.newGlideUrl;
    });
})(window.nowapi, angular);;