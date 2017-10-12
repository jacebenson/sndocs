/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snFileUploadInput.js */
angular.module('sn.common.attachments').directive('snFileUploadInput', function(cabrillo, $document) {
  'use strict';
  return {
    restrict: 'E',
    scope: {
      attachmentHandler: '=',
      customClassNames: '@classNames'
    },
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button class="{{classNames}}" ng-click="showAttachOptions($event)"><span class="upload-label"><translate key="Add Attachment" /></span></button>';
      } else {
        inputTemplate = '<button class="{{classNames}}" ng-file-select="onFileSelect($files)"><span class="upload-label"><translate key="Add Attachment" /></span></button>';
      }
      return [
        '<div class="file-upload-input">',
        inputTemplate,
        '</div>'
      ].join('');
    },
    controller: function($element, $scope) {
      var classNames = 'btn btn-icon attachment-btn icon-paperclip';
      if ($scope.customClassNames) {
        classNames += ' ' + $scope.customClassNames;
      }
      $scope.classNames = classNames;
      $scope.showAttachOptions = function($event) {
        var handler = $scope.attachmentHandler;
        var target = angular.element($event.currentTarget);
        var elRect = target[0].getBoundingClientRect();
        var body = $document[0].body;
        var rect = {
          x: elRect.left + body.scrollLeft,
          y: elRect.top + body.scrollTop,
          width: elRect.width,
          height: elRect.height
        };
        var options = {
          sourceRect: rect
        };
        cabrillo.attachments.addFile(
          handler.getTableName(),
          handler.getSysID(),
          null,
          options
        ).then(function(data) {
          console.log('Attached new file', data);
          handler.addAttachment(data);
        }, function() {
          console.log('Failed to attach new file');
        });
      };
      $scope.onFileSelect = function($files) {
        $scope.attachmentHandler.uploadAttachments($files);
      };
      $scope.showFileSelector = function($event) {
        $event.stopPropagation();
        var target = angular.element($event.currentTarget);
        var input = target.parent().find('input');
        input.triggerHandler('click');
      };
    }
  }
});;