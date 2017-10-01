/*! RESOURCE: /scripts/app.$sp/directive.spAttachmentButton.js */
angular.module('sn.$sp').directive('spAttachmentButton', function(cabrillo, $rootScope, i18n) {
    'use strict';
    return {
        restrict: 'E',
        template: function() {
            var inputTemplate;
            if (cabrillo.isNative()) {
                inputTemplate = '<button href="#" title="" ng-click="showAttachOptions()" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-camera"></span></button>';
            } else {
                inputTemplate = '<input type="file" style="display: none" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input"/>';
                inputTemplate += '<button title="" ng-click="attachmentHandler.openSelector($event)" class="panel-button sp-attachment-add btn btn-link" aria-label=""><span class="glyphicon glyphicon-paperclip"></span></button>';
            }
            return [
                '<span class="file-upload-input">',
                inputTemplate,
                '</span>'
            ].join('');
        },
        controller: function($element, $scope) {
            $scope.showAttachOptions = function() {
                var handler = $scope.attachmentHandler;
                cabrillo.attachments.addFile(
                    handler.tableName,
                    handler.tableId,
                    null, {
                        maxWidth: 1000,
                        maxHeight: 1000
                    }
                ).then(function(data) {
                    handler.getAttachmentList();
                    $rootScope.$broadcast("added_attachment");
                }, function() {
                    console.log('Failed to attach new file');
                });
            };
            $scope.$on('attachment_select_files', function(e) {
                $scope.$evalAsync(function() {
                    $($element).find('.sp-attachments-input').click();
                });
            });
        },
        link: function(scope, el, attr) {
            i18n.getMessage("Add attachment", function(msg) {
                el.find("button").attr("title", msg);
                el.find("button").attr("aria-label", msg);
            });
        }
    }
});;