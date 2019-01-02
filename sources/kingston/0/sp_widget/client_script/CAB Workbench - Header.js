function($scope, dataUtil, getController, CtrlIds, meetingUtil, i18n, $timeout, $filter, runtimeState, timerService, meetingAgenda, $window, CAB, TIME, $log, $element, isAccessibilityEnabled, spUtil) {
    var c = this;
	var RIGHT = 39, LEFT = 37, ESC = 27, ENTER = 13, SPACE = 32;
	getController.register(CtrlIds.MEETING_HEADER, c);
	c.timerEnabled = false;

	function updateDuration() {
		var actualStart = $scope.rs.cab_meeting.record.actual_start.value_ms;
		var meetingStart = $scope.rs.cab_meeting.record.start.value_ms;
		var meetingEnd = $scope.rs.cab_meeting.record.end.value_ms;
		
		if (actualStart && actualStart < meetingStart)
			$scope.timer.duration = meetingEnd - actualStart;
		else
			$scope.timer.duration = meetingEnd - meetingStart;
		
		if (!$scope.display)
			$scope.display={};
		
		$scope.display.scheduled_for = i18n.format(i18n.getMessage("Scheduled {0} minutes"), Math.ceil((meetingEnd - meetingStart)/TIME.MINUTE));
	}
	
	function updateElapsed() {
		if ($scope.timer.running)
			return;
		
		// Copmensate for differences between local time and server time.
		var now = $window.Date.now() - $scope.rs.localState.time_offset;
		var actualStart = $scope.rs.cab_meeting.record.actual_start.value_ms;
		var actualEnd = $scope.rs.cab_meeting.record.actual_end.value_ms;
		var meetingStart = $scope.rs.cab_meeting.record.start.value_ms;
		var meetingEnd = $scope.rs.cab_meeting.record.end.value_ms;
		
		var checkpoint = actualEnd ? actualEnd : now; 
		
		if (actualStart && actualStart < meetingStart && actualStart < checkpoint) {
			$scope.timer.elapsed = checkpoint - actualStart;
			return;
		}
		
		if (meetingStart < checkpoint)
			$scope.timer.elapsed = checkpoint - meetingStart;
		
	}
	
	function updateConferenceDetails() {
		
	}
	
	runtimeState.get($scope.data.meetingId)
		.then(function(rs) {
			$scope.rs = rs;
			$scope.timer = timerService.getTimer($scope.data.meetingId);
			updateDuration();

			//If the meeting has started
			if ($scope.rs.cab_meeting.record.state.value == CAB.IN_PROGRESS) {
				updateElapsed();
				$scope.timer.start();
			} else if ($scope.rs.cab_meeting.record.state.value == CAB.COMPLETE) {
				updateElapsed();
			}

			//Register watch on the meeting state
			$scope.$watch("rs.cab_meeting.record.state.value", function(newValue, oldValue){
				if (newValue == CAB.IN_PROGRESS) {
					updateDuration();
					updateElapsed();
					$scope.timer.start();
				}
				else if (newValue == CAB.COMPLETE) {
					$scope.timer.stop();
				}
			});
		},
		null
	);

	// Convenience method to update count badge.
	c.updateNavCount = function (navId, newCount) {
		var navItem = $filter('filter')(c.data.navs, {id: navId})[0];
		if (!navItem) {
			$log.warn('Cannot update count of nav_item with id "' + navId + '" as it doesn\'t exist ' +
					  '(possibly because user does not have access)');
			return;
		}

		navItem.count = newCount;
	};

	if (c.data.sys_id) {
		var mtgUtil = new meetingUtil(c.data.sys_id);
		var dereg1 = mtgUtil.registerMeetingChangeWatcher(function (meeting) {
			if(!meeting.conference_details.display_value)
				meeting.conference_details.display_value = '';
			meeting.conference_details.html =
				"<div class='conf-details-head'>${Conference details}</div><div class='conf-details-body'>" +
				meeting.conference_details.display_value + "</div>";
			meeting.start = dataUtil.wsToJsDate(meeting.start).getTime();
			meeting.end = dataUtil.wsToJsDate(meeting.end).getTime();
			c.timerEnabled = false;
			c.data.meeting = meeting;
			c.meetingDuration = meeting.end - meeting.start;
		});
	}

	c.toggle = function (nav, idx) {
		if (!nav.widget_data) {
			alert('Widget not yet available'); // Translation not needed
			return;
		}
		nav.show = !nav.show;
		var isShow = nav.show;
		if (isShow) {
			c.data.navs.forEach(function (nav, i) {
				if (i != idx)
					nav.show = false;
			});
			if ($scope.isAccessibilityEnabled)
				spUtil.addInfoMessage(i18n.format(c.data.msg.dialog_shown, nav.title));
		} else if ($scope.isAccessibilityEnabled)
			spUtil.addInfoMessage(i18n.format(c.data.msg.dialog_hidden, nav.title));
	};

	$scope.isMeetingPending = function(){
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return;

		return $scope.rs.cab_meeting.record.state.value == CAB.PENDING;
	};

	$scope.isMeetingCancelled = function(){
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return false;

		return $scope.rs.cab_meeting.record.state.value == CAB.CANCELED;
	};

	$scope.isCABManager = function() {
		return runtimeState.isCABManager($window.NOW.user_id);
	};
	
	$scope.startMeeting = function() {
		runtimeState.startMeetingAndSelectNextAgenda();
	};
	
	$scope.getMeetingTitle = function() {
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return;
		
		var meeting = $scope.rs.cab_meeting.record;
		return meeting.name.display_value + ': ' + meeting.start.display_value;
	};

	function onConfInfoPopoverOpen() {
		if (!$scope.isPopoverOpen)
			return;

		$timeout(function() {
			var $confBody = $element.find('.conf-details-body');
			if ($confBody.length == 0) {
				onConfInfoPopoverOpen();
				return;
			}

			var lineHeight = (parseInt($confBody.css('line-height')) || 0) + 5;
			$confBody.css({'line-height' : (lineHeight + 'px')});
			
			$confBody.parent().attr({
				'id': 'conf_details_tooltip',
				'role': 'tooltip',
				'tabindex': 0
			}).focus();
		}, 30, false);
	}
	
	$(document).on('keydown.cab_meeting_header', '#conf_details_tooltip', function (event) {
		if (event.keyCode == ESC) {
			$scope.$apply(function () {
				$scope.isPopoverOpen = false;
			});
		}
	});
	$(document).on('blur.cab_meeting_header', '#conf_details_tooltip', function () {
		$scope.$apply(function () {
			$scope.isPopoverOpen = false;
		});
	});

	$scope.focus = function (id) {
		angular.element('#'+id).focus();
	};

	$scope.isAccessibilityEnabled = isAccessibilityEnabled();
	$scope.navigateToolbar = function ($event, $index) {
		var valid = false;
		if ($event.keyCode == RIGHT) {
			$index++;
			valid = true;
		} else if ($event.keyCode == LEFT) {
			$index--;
			valid = true;
		}
		if (valid) {
			if ($index < 0)
				$index = c.data.navs.length; // Actual length is this +1 since Conf info is not in navs list.
			else if ($index > c.data.navs.length)
				$index = 0;
			$scope.focus('header_nav_item_' + $index);
			$event.preventDefault();
			return true;
		}
		return false;
	};

	$scope.toggleConfInfoPopover = function ($event) {
		if ($event.keyCode == ENTER || $event.keyCode == SPACE) {
			$event.stopPropagation();
			$scope.isPopoverOpen = !$scope.isPopoverOpen;
		}
	};

	$scope.$watch('isPopoverOpen', onConfInfoPopoverOpen);

	$scope.$on('$destroy', function () {
		getController.deregister(CtrlIds.MEETING_HEADER);
		$(document).off('.cab_meeting_header');
		if (dereg1)
			dereg1();
	});
}