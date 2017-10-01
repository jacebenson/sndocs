/*! RESOURCE: /scripts/snm/cabrillo/attachments.js */
(function(window, cabrillo, undefined) {
    'use strict';
    var PACKAGE = 'attachments';
    cabrillo.extend(cabrillo, {
        attachments: {
            addFile: addFile,
            viewFile: viewFile
        }
    });
    var ADD_ATTACHMENTS_URL = '/angular.do?sysparm_type=ngk_attachments&action=add&load_attachment_record=true';

    function addFile(tableName, sysID, params, options) {
        var uploadParams = cabrillo.extend({
            attachments_modified: 'true',
            sysparm_table: tableName,
            sysparm_sys_id: sysID,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: ''
        }, params || {});
        var apiPath = ADD_ATTACHMENTS_URL + '&sys_id=' + sysID + '&table=' + tableName;
        options = options || {};
        return callMethod('addFile', {
            apiPath: apiPath,
            params: uploadParams,
            uploadParamName: 'attachFile',
            sourceRect: options.sourceRect,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            jpgQuality: options.jpgQuality
        }).then(function(response) {
            return response.results;
        });
    }

    function viewFile(attachment, sourceRect, sourceBase64) {
        return callMethod('viewFile', {
            attachment: {
                sys_id: attachment.sys_id,
                content_type: attachment.content_type,
                file_name: attachment.file_name,
                sys_updated_on: attachment.sys_updated_on,
                path: attachment.sys_id + '.iix',
                thumbnail_path: attachment.thumbSrc
            },
            sourceRect: sourceRect,
            sourceBase64: sourceBase64
        });
    }

    function callMethod(methodName, data) {
        return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
    }
})(window, window['snmCabrillo']);;