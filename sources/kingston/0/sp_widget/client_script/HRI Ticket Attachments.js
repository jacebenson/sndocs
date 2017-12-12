function attachMate($scope, nowAttachmentHandler, $timeout, $rootScope, spUtil, snRecordWatcher, spModal) {
  $scope.errorMessages = [];
  $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
  $scope.data.action = "";

  snRecordWatcher.initList("sys_attachment", "table_sys_id=" + $scope.data.sys_id);
  $scope.$on('record.updated', function(name, data) {
    $scope.attachmentHandler.getAttachmentList();
  })

  $timeout(function() {
    var sizeLimit = 1024 * 1024 * 24; // 24MB
    $scope.attachmentHandler.setParams($scope.data.table, $scope.data.sys_id, sizeLimit);
    $scope.attachmentHandler.getAttachmentList();
  })

  $scope.hasAttachments = function() {
    return $scope.attachments && $scope.attachments.length != 0;
  }

	$scope.canWrite = function() {
		return $scope.data.canWrite;
	}

  $scope.confirmDeleteAttachment = function(attachment) {
		spModal.confirm("${Delete Attachment?}").then(function() {
          $scope.attachmentHandler.deleteAttachment(attachment);
		})
  }

  $scope.$on('added_attachment', function(evt) {
    $scope.data.action = "added";
    spUtil.update($scope);
  });

  $scope.$on('sp.record.can_write', function(evt, answer) {
    $scope.data.canWrite = answer;
  });

	$scope.$on('$viewContentLoaded', function() {
		applyClearfix();
	});
	
  function appendError(error) {
    $scope.errorMessages.push(error);
  }

  function setAttachments(attachments, action) {
    if ($scope.submitting == true)
      return;

    $scope.attachments = attachments;
	  
	if ($scope.data.checkAttachedByUser) {
		$scope.attachments = $scope.attachments.filter(function(attachment) {
			return attachment.sys_created_by == $scope.data.checkAttachedByUser;
		});
		
		if ($scope.hasAttachments())
			$rootScope.$broadcast('user.documents.uploaded');
		else
			$rootScope.$broadcast('user.documents.absent');
	}
	  
      if (!action)
		  return;
	  
	  $scope.data.action = action;
	  spUtil.update($scope);
  }
}