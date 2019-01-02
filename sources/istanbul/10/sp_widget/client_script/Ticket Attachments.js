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

	$scope.$on('dialog.upload_too_large.show', function(e){
		console.log($scope.data.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
	});

	$scope.$on('added_attachment', function(evt) {
		$scope.data.action = "added";
		spUtil.update($scope);
	});

	$scope.$on('sp.record.can_write', function(evt, answer) {
		$scope.data.canWrite = answer;
	});

	function appendError(error) {
		$scope.errorMessages.push(error);
	}

	function setAttachments(attachments, action) {
		if ($scope.submitting == true)
			return;

		$scope.attachments = attachments;
		if (!action)
			return;

		$scope.data.action = action;
		spUtil.update($scope);
	}
}