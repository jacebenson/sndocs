/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snAttachmentList.js */
angular.module('sn.common.attachments').directive('snAttachmentList', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $q) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list.xml"),
      scope: {
        tableName: "=?",
        sysID: "=?sysId",
        attachmentList: "=?",
        uploadFileFn: "&",
        deleteFileFn: "=?",
        canEdit: "=?",
        canRemove: "=?",
        canAdd: "=?",
        canDownload: "=?",
        showHeader: "=?",
        clickImageFn: "&?",
        confirmDelete: "=?"
      },
      controller: function($scope) {
        $scope.canEdit = $scope.canEdit || false;
        $scope.canDownload = $scope.canDownload || false;
        $scope.canRemove = $scope.canRemove || false;
        $scope.canAdd = $scope.canAdd || false;
        $scope.showHeader = $scope.showHeader || false;
        $scope.clickImageFn = $scope.clickImageFn || function() {};
        $scope.confirmDelete = $scope.confirmDelete || false;
        $scope.filesInProgress = {};
        $scope.attachmentToDelete = null;

        function refreshResources() {
          var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
          handler.getAttachments().then(function(files) {
            $scope.attachmentList = files;
          });
        }
        if (!$scope.attachmentList) {
          $scope.attachmentList = [];
          refreshResources();
        }
        $scope.$on('attachments_list.update', function(e, tableName, sysID) {
          if (tableName === $scope.tableName && sysID === $scope.sysID) {
            refreshResources();
          }
        });

        function removeFromFileProgress(fileName) {
          delete $scope.filesInProgress[fileName];
        }

        function updateFileProgress(file) {
          if (!$scope.filesInProgress[file.name])
            $scope.filesInProgress[file.name] = file;
        }
        $scope.$on('attachments_list.upload.progress', function(e, file) {
          updateFileProgress(file);
        });
        $scope.$on('attachments_list.upload.success', function(e, file) {
          removeFromFileProgress(file.name);
        });
        $scope.attachFiles = function(files) {
          if ($scope.tableName && $scope.sysID) {
            var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
            var promises = [];
            files.forEach(function(file) {
              var promise = handler.uploadAttachment(file, null, {
                progress: function(e) {
                  var file = e.config.file;
                  file.progress = 100.0 * event.loaded / event.total;
                  updateFileProgress(file);
                },
                success: function(data) {
                  removeFromFileProgress(data.file_name);
                }
              });
              promises.push(promise);
            });
            $q.all(promises).then(function() {
              refreshResources();
            });
          } else {
            if ($scope.uploadFileFn)
              $scope.uploadFileFn({
                files: files
              });
          }
        };
        $scope.getProgressStyle = function(fileName) {
          return {
            'width': $scope.filesInProgress[fileName].progress + '%'
          };
        };
        $scope.openSelector = function($event) {
          $event.stopPropagation();
          var target = angular.element($event.currentTarget);
          $timeout(function() {
            target.parent().find('input').click();
          });
        };
        $scope.confirmDeleteAttachment = function(attachment) {
          $scope.attachmentToDelete = attachment;
          $scope.$broadcast('dialog.confirm-delete.show');
        };
        $scope.deleteAttachment = function() {
          snAttachmentHandler.deleteAttachment($scope.attachmentToDelete.sys_id).then(function() {
            var index = $scope.attachmentList.indexOf($scope.attachmentToDelete);
            $scope.attachmentList.splice(index, 1);
          });
        };
      }
    };
  })
  .directive('snAttachmentListItem', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $parse) {
    'use strict';
    return {
      restrict: "E",
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list_item.xml"),
      link: function(scope, element, attrs) {
        function translateAttachment(att) {
          return {
            content_type: att.content_type,
            file_name: att.file_name,
            image: (att.thumbSrc !== undefined),
            size_bytes: att.size,
            sys_created_by: "",
            sys_created_on: "",
            sys_id: att.sys_id,
            thumb_src: att.thumbSrc
          };
        }
        scope.attachment = ($parse(attrs.attachment.size_bytes)) ?
          scope.$eval(attrs.attachment) :
          translateAttachment(attrs.attachment);
        var fileNameView = element.find('.sn-widget-list-title_view');
        var fileNameEdit = element.find('.sn-widget-list-title_edit');

        function editFileName() {
          fileNameView.hide();
          fileNameEdit.show();
          element.find('.edit-text-input').focus();
        }

        function viewFileName() {
          fileNameView.show();
          fileNameEdit.hide();
        }
        viewFileName();
        scope.editModeToggle = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          scope.editMode = !scope.editMode;
          if (scope.editMode)
            editFileName();
          else
            viewFileName();
        };
        scope.updateName = function() {
          scope.editMode = false;
          viewFileName();
          snAttachmentHandler.renameAttachment(scope.attachment.sys_id, scope.attachment.file_name);
        };
      },
      controller: function($scope, snCustomEvent) {
        $scope.editMode = false;
        $scope.buttonFocus = false;
        $scope.removeAttachment = function(attachment, index) {
          if ($scope.deleteFileFn !== undefined && $scope.deleteFileFn instanceof Function) {
            $scope.deleteFileFn.apply(null, arguments);
            return;
          }
          if ($scope.confirmDelete) {
            $scope.confirmDeleteAttachment($scope.attachment);
            return;
          }
          snAttachmentHandler.deleteAttachment($scope.attachment.sys_id).then(function() {
            $scope.attachmentList.splice($scope.$index, 1);
          });
        };
        var contentTypeMap = {
          "application/pdf": "icon-document-pdf",
          "text/plain": "icon-document-txt",
          "application/zip": "icon-document-zip",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "icon-document-doc",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "icon-document-ppt",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "icon-document-xls",
          "application/vnd.ms-powerpoint": "icon-document-ppt"
        };
        $scope.getDocumentType = function(contentType) {
          return contentTypeMap[contentType] || "icon-document";
        };
        $scope.handleAttachmentClick = function(event) {
          if (event.keyCode === 9)
            return;
          if ($scope.editMode)
            return;
          if (!$scope.attachment)
            return;
          if ($scope.attachment.image)
            openImageInLightBox(event);
          else
            downloadAttachment();
        };

        function downloadAttachment() {
          if (!$scope.attachment.sys_id)
            return;
          $window.location.href = 'sys_attachment.do?sys_id=' + $scope.attachment.sys_id;
        }

        function openImageInLightBox(event) {
          if (!$scope.attachment.size)
            $scope.attachment.size = $scope.getSize($scope.attachment.size_bytes, 2);
          $scope.clickImageFn({
            file: $scope.attachment
          });
          snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment);
        }
        $scope.getSize = function(bytes, precision) {
          if (typeof bytes === 'string' && bytes.slice(-1) === 'B')
            return bytes;
          var kb = 1024;
          var mb = kb * 1024;
          var gb = mb * 1024;
          if ((bytes >= 0) && (bytes < kb))
            return bytes + ' B';
          else if ((bytes >= kb) && (bytes < mb))
            return (bytes / kb).toFixed(precision) + ' KB';
          else if ((bytes >= mb) && (bytes < gb))
            return (bytes / mb).toFixed(precision) + ' MB';
          else if (bytes >= gb)
            return (bytes / gb).toFixed(precision) + ' GB';
          else
            return bytes + ' B';
        }
        $scope.onButtonFocus = function() {
          $scope.buttonFocus = true;
        }
        $scope.onButtonBlur = function() {
          $scope.buttonFocus = false;
        }
      }
    };
  });;