/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.nowAttachmentsList.js */
angular.module('sn.common.attachments').directive('nowAttachmentsList', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl("attachments_list.xml"),
        link: function(scope, elem, attrs, $parse) {
            scope.icons = {
                preview: attrs.previewIcon,
                edit: attrs.editIcon,
                delete: attrs.deleteIcon,
                ok: attrs.okIcon,
                cancel: attrs.cancelIcon
            };
            scope.listClass = "list-group";
            var inline = scope.$eval(attrs.inline);
            if (inline)
                scope.listClass = "list-inline";
            scope.entryTemplate = getTemplateUrl(attrs.template || "attachment");
        }
    };
});;