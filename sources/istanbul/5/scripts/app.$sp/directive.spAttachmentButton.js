/*! RESOURCE: /scripts/app.$sp/directive.spAttachmentButton.js */
angular.module('sn.$sp').directive('spAttachmentButton', function(cabrillo, $rootScope, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<a href="#" id="attachment_add" ng-click="showAttachOptions()" class="panel-button sp-attachment-add"><span class="glyphicon glyphicon-camera"></span></a>';
      } else {
        inputTemplate = '<input type="file" style="display: none" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input"/>';
        inputTemplate += '<a href="javascript:void(0)" id="attachment_add" ng-click="attachmentHandler.openSelector($event)" class="panel-button sp-attachment-add"><span class="glyphicon glyphicon-paperclip"></span></a>';
      }
      return [
        '<span class="file-upload-input">',
        inputTemplate,
        '</span>'
      ].join('');
    },
    controller: function($element, $scope) {
      $scope.attachmentClassNames = 'btn-default attachment-btn btn-primary icon-paperclip icon-camera list-group-btn';
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
        $timeout(function() {
          $($element).find('.sp-attachments-input').click();
        });
      });
    }
  }
});;