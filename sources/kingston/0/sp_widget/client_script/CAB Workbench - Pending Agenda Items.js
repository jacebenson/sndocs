function($scope, runtimeState, timerService, meetingAgenda, agendaNotification, agendaItemFilterFilter, $window, CAB, $log, $timeout, i18n, $uibModal) {
	// widget controller
	var c = this;
	var startMeetingPopupShown = false;
	var modalConfig = {
		animation: true,
		controller: 'confirmApproval'
	};
	$scope.getAgendaAriaLabel = function (agendaItem) {
		if (!agendaItem.task || !agendaItem.task.record)
			return c.data.i18n.agendaAriaLabel.permissionDenied;
		var msg;
		if (agendaItem.state.value == 'pending')
			msg = c.data.i18n.agendaAriaLabel.pending;
		else if (agendaItem.state.value == 'in_progress')
			msg = c.data.i18n.agendaAriaLabel.current;
		else if (agendaItem.state.value == 'paused')
			msg = c.data.i18n.agendaAriaLabel.paused;
		else if (agendaItem.state.value == 'no_decision')
			msg = c.data.i18n.agendaAriaLabel.noDecision;
		else if (agendaItem.state.value == 'complete') {
			if (agendaItem.decision.value == 'approved')
				msg = c.data.i18n.agendaAriaLabel.completeApproved;
			else if (agendaItem.decision.value == 'rejected')
				msg = c.data.i18n.agendaAriaLabel.completeRejected;
			else if (agendaItem.decision.value == 'preapproved')
				msg = c.data.i18n.agendaAriaLabel.completePreapproved;
		}
		if (msg) {
			return i18n.format(msg, [agendaItem.task.display_value]);
		}
	};

	$scope.getDonutAriaLabel = function (lbl) {
		if (lbl)
			return i18n.format(c.data.i18n.donutAriaLabel, [lbl]);
		else
			return data.i18n.donutAriaLabelNotKnown;
	};

	$scope.getViewAgendaItemAriaLabel = function (agendaItem) {
		return i18n.format(c.data.i18n.viewAgendaItemAriaLabel, [agendaItem.task.display_value]);
	};

	$scope.getNotifyAriaLabel = function (agendaItem) {
		return i18n.format(c.data.i18n.notifyAriaLabel, [agendaItem.task.display_value]);
	};

	$scope.getPromoteAriaLabel = function (agendaItem) {
		return i18n.format(c.data.i18n.promoteAriaLabel, [agendaItem.task.display_value]);
	};

	$scope.startMeeting = function() {
		runtimeState.startMeetingAndSelectNextAgenda();
	};

	$scope.focus = function (id) {
		$timeout(function () {
			$timeout(function () { // Run after two digest cycle runs
				var el = $('#' + id);
				if (el.length)
					el.focus();
				else
					$log.warn('Could not find element with id ', id);
			});
		}, 100);
	};

	$scope.isCurrentAgendaItem = function() {
		return false;
	};

	$scope.notifyAvailable = function(agendaItem) {
		return agendaNotification.notifyAvailable(agendaItem);
	};

	$scope.alreadyBeingNotified = function(agendaItem) {
		return agendaNotification.alreadyBeingNotified(agendaItem, $scope.data.userId);
	};

	$scope.notifyMe = function(event, agendaItem, id) {
		event.stopPropagation();
		agendaNotification.updateRecipients(agendaItem, $scope.data.userId, "add", function () {
			$scope.focus(id);
		});
	};

	$scope.dontNotifyMe = function(agendaItem) {
		agendaNotification.updateRecipients(agendaItem, $scope.data.userId, "remove");
	};

	runtimeState.get($scope.data.meetingId).then(function(rs) {
		$scope.rs = rs;
	});

	meetingAgenda.get($scope.data.meetingId).then(function(agenda) {
		$scope.agenda = agenda;
	});

	$scope.setCurrentAgendaItem = function(id) {
		$log.info($scope.rs);
		runtimeState.setCurrentAgendaItem(id);
	};

	$scope.showStartMeetingPopup = function() {
		startMeetingPopupShown = true;
		modalConfig.templateUrl = "cab-start-meeting-pop";
		var modal = $uibModal.open(modalConfig);
		modal.result.then(function() {
			$scope.startMeeting();
		}, null);
	};

	$scope.setViewAgendaItem = function(item, firstAgenda) {
		if (!startMeetingPopupShown && $scope.isCABManager() && $scope.isMeetingPending() && firstAgenda) {
			$scope.showStartMeetingPopup();
		}
		runtimeState.setViewAgendaItem(item.sys_id.value);
	};

	$scope.isMeetingPending = function() {
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return;
		return $scope.rs.cab_meeting.record.state.value == CAB.PENDING;
	};

	$scope.isMeetingCancelled = function(){
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return false;

		return $scope.rs.cab_meeting.record.state.value == CAB.CANCELED;
	};

	$scope.isViewAgendaItem = function(id) {
		return (id == runtimeState.getViewAgendaItem());
	};

	$scope.isViewingCurrent = function() {
		return runtimeState.isViewingCurrent();
	};


	//Scope API
	$scope.isCABManager = function() {
		return runtimeState.isCABManager($scope.data.userId);
	};

	$scope.promoteItem = function(event, agendaItem, id) {
		event.stopPropagation();
		meetingAgenda.promoteItem(agendaItem, function () {
			$scope.focus(id);
		});
	};
}