/*! RESOURCE: /scripts/app.$sp/service.spCodeEditorAutocomplete.js */
angular.module('sn.$sp').factory('spCodeEditorAutocomplete', ['$rootScope', '$q', '$http', function($rootScope, $q, $http) {
    'use strict';
    var configCache = {};
    var codeEditorAutocompleteAPI = "/api/now/sp/editor/autocomplete";
    return {
        getConfig: function(tableName, field) {
            if (configCache[tableName + "." + field])
                return $q.when(configCache[tableName + "." + field]);
            return $http.get(codeEditorAutocompleteAPI + "/table/" + tableName + "/field/" + field).then(function(response) {
                var responseConfig = response.data.result;
                configCache[tableName + "." + field] = responseConfig;
                return responseConfig;
            });
        }
    };
}]);;