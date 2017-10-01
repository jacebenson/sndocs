/*! RESOURCE: /scripts/app.$sp/factory.spUIActionsExecuter.js */
angular.module('sn.$sp').factory('spUIActionsExecuter', function($q, glideUIActionsApi, spModal, i18n, $http, spAuthentication, glideUserSession, cabrillo, $cookies, spAuthModal) {
    'use strict';
    var NOW_REAUTHENTICATE_CODE = 'NOW.REAUTHENTICATE';

    function executeListAction(actionSysId, tableName, recordSysId, requestParams) {
        return execute(actionSysId, 'list', tableName, recordSysId, undefined, undefined, requestParams)
    }

    function executeFormAction(actionSysId, tableName, recordSysId, fields, encodedRecord, requestParams) {
        return execute(actionSysId, 'form', tableName, recordSysId, fields, encodedRecord, requestParams);
    }

    function execute(actionSysId, type, tableName, recordSysId, fields, encodedRecord, requestParams) {
        var $request = glideUIActionsApi.execute(
            actionSysId,
            type,
            tableName,
            recordSysId,
            fields,
            encodedRecord,
            requestParams
        );
        return $request.then(function(response) {
            var result = response.data.result,
                username = requestParams.username,
                userSysId = requestParams.userSysId;
            if (result.response_code === NOW_REAUTHENTICATE_CODE) {
                return spAuthModal.prompt(requestParams, username, userSysId).then(function() {
                    if (!angular.isDefined(requestParams)) {
                        requestParams = {};
                    }
                    requestParams[NOW_REAUTHENTICATE_CODE] = userSysId;
                    return execute(
                        actionSysId,
                        type,
                        tableName,
                        recordSysId,
                        fields,
                        encodedRecord,
                        requestParams
                    );
                }, function() {
                    console.error("Re-auth failed");
                });
            }
        });
    }
    return {
        executeListAction: executeListAction,
        executeFormAction: executeFormAction
    };
});;