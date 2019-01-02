function($scope, CAB, runtimeState, timerService, meetingAgenda, approval, filterFilter, $uibModal, $window, $log, i18n, $timeout) {
	var c = this;
	$scope.getCurrentAgendaAriaLabel = function (taskLbl) {
		if (taskLbl)
			return i18n.format(c.data.i18n.currentAgendaAriaLabel, taskLbl);
	};
	$scope.getAriaScheduledTime = function (ms) {
		if (ms)
			return i18n.format(c.data.i18n.ariaScheduledTime, [parseInt(ms/1000/60)]);
	};

	// Definition of lastApproval structure.
	$scope.lastApproval = {
		requiredUserApproval: false,
		approved: false,
		rejected: false,
		requestMade: false
	};

	var modalConfig = {
		animation: true,
		controller: 'confirmApproval'
	};

	$scope.confirmApprove = function() {
		modalConfig.templateUrl = "cab-approve-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(comment){
			$scope.lastApproval = {
				requiredUserApproval: true,
				approved: true,
				requestMade: true
			};
			approval.approve($scope.item.task.value, comment)
				.then(function() {
					$scope.lastApproval.requestMade = false;
				$scope.focusToAgendaLinkControls(CAB.ACTION_APPROVE);
				});

		}, null);
	};

	$scope.confirmReject = function() {
		modalConfig.templateUrl = "cab-reject-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(comment){
			$scope.lastApproval = {
				requiredUserApproval: true,
				rejected: true,
				requestMade: true
			};
			$scope.focusToAgendaLinkControls(CAB.REJECT);
			approval.reject($scope.item.task.value, comment)
				.then(function() {
					$scope.lastApproval.requestMade = false;
				$scope.focusToAgendaLinkControls(CAB.ACTION_REJECT);
				});
		}, null);
	};

	$scope.confirmNextAgendaItem = function(e) {
		//e.stopPropagation();
		modalConfig.templateUrl = "cab-skip-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(){
			$scope.noDecisionNextItem();
			$scope.focusToAgendaLinkControls(CAB.ACTION_CURRENT_AGENDA_ITEM);
		}, null);
	};

	$scope.confirmFinishAgenda = function(e) {
		//e.stopPropagation();
		modalConfig.templateUrl = "cab-finish-agenda-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(){
			runtimeState.noDecisionNextAgendaItem();
		}, null);
	};

	$scope.confirmEndMeeting = function() {
		modalConfig.templateUrl = "cab-end-meeting-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(){
			$scope.endMeeting();
		}, null);
	};

	function changeCurrentAgendaItem(itemId) {
		if (!itemId || itemId=="" || itemId == "undefined") {
			clearCurrentAgendaItem();
			return;
		}
		
		if ($scope.unwatchItemState)
			$scope.unwatchItemState();

		var ai = meetingAgenda.getAgendaItem(itemId);
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();

		if (ai) {
			//Check if were are following the current agenda item. If we are, update the local viewing
			if ($scope.rs.localState && $scope.rs.localState.viewing && $scope.item && $scope.rs.localState.viewing == $scope.item.sys_id.value)
				$scope.rs.localState.viewing = ai.sys_id.value;

			$scope.item = ai;
			// for cab_manager, if meeting is started, focus is shifted to current agenda item, else localstate is given preference
			if ($scope.isCABManager() && $scope.meetingStarted) {
				$scope.setViewAgendaItem($scope.item);
				$timeout(function() {
					var curentAgendaEle = angular.element('#current-agenda-item-widget');
					if (curentAgendaEle && curentAgendaEle.is(":visible"))
						curentAgendaEle.focus();
					});
				if ($scope.meetingStarted)
					$scope.meetingStarted = false;
			}
			$scope.timer = timerService.getTimer(ai.sys_id.value);

			//Calculate the elapsed time if the item is in progress.
			if ($scope.item.state.value == CAB.IN_PROGRESS) {
				// Adjust now for differences between local time and server time.
				var now = Date.now() - $scope.rs.localState.time_offset;
				var then = $scope.rs.current_agenda_item_start.value_ms;
				var totalElapsed = now - then;

				if (ai.elapsed_time.value_ms)
					totalElapsed = totalElapsed + $scope.item.elapsed_time.value_ms;

				$scope.timer.elapsed = totalElapsed;
				$scope.timer.start();
			} else {
				$scope.timer.elapsed = $scope.item.elapsed_time.value_ms;
			}
			
			//Add a watch to monitor changes in pause/unpause.
			$scope.unwatchItemState = $scope.$watch('item.state.value', function(newValue, oldValue) {
				if (newValue == CAB.PAUSED && oldValue == CAB.IN_PROGRESS && $scope.timer.running)
					$scope.timer.stop();
				else if (newValue== CAB.IN_PROGRESS && oldValue == CAB.PAUSED && !$scope.timer.running)
					$scope.timer.start();
			});

		} else
			clearCurrentAgendaItem();
	}

	function refreshItemState(aiDelta) {
		if (!aiDelta.sys_id)
			return;

		var item = meetingAgenda.getAgendaItem(aiDelta.sys_id);
		if (!item)
			return;
		item.state = aiDelta.state;
	}

	function clearCurrentAgendaItem() {
		if ($scope.unwatchItemState)
			$scope.unwatchItemState();
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();
		delete($scope.item);
		$scope.timer = null;
		$scope.approval = null;
		$scope.lastApproval = {};
	}

	// Initial setup
	runtimeState.get($scope.data.meeting_id).then(function(rs) {
		$scope.rs = rs;

		meetingAgenda.get($scope.data.meeting_id).then(function(agenda) {
			$scope.agenda = agenda;

			// Deal with changes to the 
			$scope.$watch('rs.current_agenda_item.value', function(itemId) {
				if ($scope.rs.current_agenda_item.value) {
					var ai = meetingAgenda.getAgendaItem($scope.rs.current_agenda_item.value);
					if (ai) {
						approval.get(ai.task.value).then(function(approvalModel) {
							$scope.lastApproval = {};
							$scope.approval = approvalModel;
						});
					}
				}
				changeCurrentAgendaItem(rs.current_agenda_item.value);
			});

			// If meeting is started, set a flag which will be used to shift the focus of cab_manager to current agenda item
			$scope.$watch('rs.cab_meeting.record.state.value', function(newRecordState, oldRecordState) {
				if (oldRecordState == CAB.PENDING && newRecordState == CAB.IN_PROGRESS) {
					$scope.meetingStarted = true;
				}
			});
		});
	});

	//Scope API
	$scope.isCABManager = function() {
		return runtimeState.isCABManager($window.NOW.user_id);
	};

	// Set up the display state for the current item.
	$scope.notifyAvailable = function(agendaItem) {
		return false;
	};

	$scope.alreadyBeingNotified = function(agendaItem) {
		return true;
	};

	$scope.isCurrentAgendaItem = function() {
		return true;
	};

	$scope.setViewAgendaItem = function(agendaItem) {
		if (runtimeState.getViewAgendaItem() == agendaItem.sys_id.value)
			return;

		runtimeState.setViewAgendaItem(agendaItem.sys_id.value);
	};

	$scope.hasPendingAgendaItems = function() {
		var items = filterFilter($scope.agenda, {'state': {'value': 'pending'}});
		return (items && items.length > 0);
	};

	$scope.hasNextItem = function() {
		return (typeof meetingAgenda.getNextPendingAgendaItem() != "undefined");
	};

	$scope.nextAgendaItem = function(e) {
		//e.stopPropagation();
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();
		var agendaItem = meetingAgenda.getNextPendingAgendaItem();
		if (agendaItem && agendaItem.sys_id)
			runtimeState.nextAgendaItem(agendaItem.sys_id.value);
		$scope.focusToAgendaLinkControls(CAB.ACTION_CURRENT_AGENDA_ITEM);
	};

	$scope.noDecisionNextItem = function() {
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();

		var agendaItem = meetingAgenda.getNextPendingAgendaItem();
		if (agendaItem && agendaItem.sys_id)
			runtimeState.noDecisionNextAgendaItem(agendaItem.sys_id.value);
	};

	$scope.pauseAgendaItem = function(e) {
		//e.stopPropagation();
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();
		$scope.focusToAgendaLinkControls(CAB.ACTION_RESUME);
		runtimeState.pauseCurrentAgendaItem();
	};

	$scope.resumeAgendaItem = function(e) {
		//e.stopPropagation();
		if ($scope.timer && !$scope.timer.running)
			$scope.timer.start();
		$scope.focusToAgendaLinkControls(CAB.ACTION_PAUSE);
		runtimeState.resumeCurrentAgendaItem();
	};

	$scope.finishAgenda = function(e) {
		//e.stopPropagation();
		runtimeState.nextAgendaItem();
	};

	$scope.isViewingCurrent = function() {
		return runtimeState.isViewingCurrent();
	};

	$scope.isViewAgendaItem = function(id) {
		if (id == runtimeState.getViewAgendaItem())
			return false;

		return true;
	};

	$scope.isMeetingInProgress = function(){
		return $scope.rs.cab_meeting.record.state.value == CAB.IN_PROGRESS;
	};

	$scope.endMeeting = function(){
		runtimeState.endMeeting();
	};



}