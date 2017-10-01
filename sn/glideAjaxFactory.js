/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideAjaxFactory.js */
angular.module('sn.common.clientScript').factory('glideAjaxFactory', function($window, glideRequest) {
    $window.GlideAjax.glideRequest = glideRequest;
    return {
        create: function(processor) {
            return new $window.GlideAjax(processor);
        },
        getClass: function() {
            return $window.GlideAjax;
        }
    };
});;