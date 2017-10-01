/*! RESOURCE: /scripts/sn/common/form/data/js_includes_data.js */
/*! RESOURCE: /scripts/sn/common/form/data/_module.js */
angular.module('sn.common.form.data', []);;
/*! RESOURCE: /scripts/sn/common/form/data/glideUIActionsApi.js */
angular.module('sn.common.form.data').factory('glideUIActionsApi', function($http) {
    'use strict';
    return {
        execute: execute
    };

    function execute(actionSysId, type, tableName, recordSysId, fields, encodedRecord, requestParams) {
        return $http.post('/api/now/mobile/ui_actions/' + actionSysId + '/execute', {
            sysparm_type: type,
            sysparm_table: tableName,
            sysparm_sys_id: recordSysId,
            sysparm_encoded_record: encodedRecord,
            sysparm_fields: fields,
            sysparm_request_params: requestParams
        });
    }
});;;