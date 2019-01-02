/*! RESOURCE: /scripts/app.ng_chat/util/service.uploadAttachment.js */
angular.module('sn.connect.util').service('uploadAttachmentService', function(
  $q, $rootScope, $timeout, snAttachmentHandler, maxAttachmentSize, liveProfileID, i18n, screenReaderStatus) {
  "use strict";
  var MAX_SIZE = maxAttachmentSize * 1024 * 1024;
  var attachmentHandlers = [];
  var filesInProgress = [];
  var uploadSuccess = "{0} successfully uploaded";
  var uploadFailure = "Failed to upload {0}: {1}";
  i18n.getMessages([uploadSuccess, uploadFailure], function(results) {
    uploadSuccess = results[uploadSuccess];
    uploadFailure = results[uploadFailure];
  });

  function remove(file) {
    var index = filesInProgress.indexOf(file);
    if (index < 0)
      return;
    return filesInProgress.splice(index, 1)[0];
  }

  function apply(fileFns, fnType, file) {
    var fn = fileFns[fnType];
    if (fn)
      fn(file);
    file.state = fnType;
    $rootScope.$broadcast('attachments_list.upload.' + fnType, file);
  }

  function progress(fileFns, file, loaded, total) {
    total = total || file.size;
    if (angular.isDefined(loaded)) {
      file.loaded = loaded;
      file.progress = Math.min(100.0 * loaded / total, 100.0);
    } else {
      file.loaded = total;
      file.progress = 100.0;
    }
    apply(fileFns, "progress", file);
  }

  function getAttachmentHandler(conversation) {
    var sysID = conversation.sysID;
    var attachmentHandler = attachmentHandlers[sysID];
    if (!attachmentHandler)
      attachmentHandler = attachmentHandlers[sysID] = conversation.isPending ?
      snAttachmentHandler.create("live_profile", liveProfileID) :
      snAttachmentHandler.create("live_group_profile", sysID);
    return attachmentHandler;
  }

  function attachFile(conversation, file, fileFns) {
    if (file.size > MAX_SIZE) {
      file.error = file.name + ' size exceeds the limit of ' + maxAttachmentSize + ' MB';
      apply(fileFns, "error", file);
      return $q.when(file);
    }
    filesInProgress.push(file);
    apply(fileFns, "start", file);
    progress(fileFns, file, 0);
    return getAttachmentHandler(conversation).uploadAttachment(file, null, {
      progress: function(event) {
        progress(fileFns, event.config.file, event.loaded, event.total);
      }
    }).then(function(response) {
      remove(file);
      file.sysID = response.sys_id;
      progress(fileFns, file);
      apply(fileFns, "success", file);
      screenReaderStatus.announce(i18n.format(uploadSuccess, file.name));
      return file;
    }, function(errorMessage) {
      remove(file);
      file.error = errorMessage;
      apply(fileFns, "error", file);
      screenReaderStatus.announce(i18n.format(uploadFailure, file.name, errorMessage));
      return file;
    });
  }

  function openFileSelector($event) {
    $event.stopPropagation();
    var target = angular.element($event.currentTarget);
    $timeout(function() {
      target.parent().find('input').click();
    });
  }
  return {
    get filesInProgress() {
      return Object.keys(filesInProgress).map(function(key) {
        return filesInProgress[key];
      });
    },
    attachFiles: function(conversation, files, fileFns) {
      fileFns = fileFns || {};
      var promises = [];
      angular.forEach(files, function(file) {
        promises.push(attachFile(conversation, file, fileFns));
      });
      return $q.all(promises);
    },
    openFileSelector: openFileSelector
  };
});;