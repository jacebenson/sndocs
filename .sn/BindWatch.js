/*! RESOURCE: /scripts/sn/common/bindWatch/BindWatch.js */
angular.module('sn.common.bindWatch').factory('BindWatch', function() {
    "use strict";
    return function(scope, map) {
        if (!scope || !map)
            throw new Error('No scope or map provided');
        Object.keys(map).forEach(function(key) {
            scope.$watch(map[key], function(key, n, o) {
                if (n !== o)
                    scope.$broadcast('$$applyTwoWayBinding::' + key);
            }.bind(null, key));
        });
    }
});;