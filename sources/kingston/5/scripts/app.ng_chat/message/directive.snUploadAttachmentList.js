/*! RESOURCE: /scripts/app.ng_chat/message/directive.snUploadAttachmentList.js */
angular.module('sn.connect.message').directive('snUploadAttachmentList', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("snUploadAttachmentList.xml"),
    scope: {
      uploadingFiles: "="
    },
    controller: function($scope) {
      $scope.isFileNameShowing = function(file) {
        return file.state !== 'error';
      };
      $scope.isProgressBarShowing = function(file) {
        return file.state === 'progress';
      };
      $scope.getProgressStyle = function(file) {
        return {
          'width': file.progress + '%'
        };
      };
    }
  }
});;