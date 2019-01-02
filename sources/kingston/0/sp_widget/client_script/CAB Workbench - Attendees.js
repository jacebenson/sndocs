function($scope, runtimeState, meetingAttendees, getController, CtrlIds, snPresence, $window, $timeout, $log, $rootScope) {
	var c = this;
	var headerCtrl = getController(CtrlIds.MEETING_HEADER);
	c.isOpen = false;
	c.DELAY_BEFORE_USER_ATTENDING = 10000; // number of milliseconds before we mark a user as joining the meeting

	$scope.getAttendeeById = function(userId) {
		if (!userId)
			return;
		var attendee = $scope.data.attendeeData.attendees[userId];
		return attendee;
	};
	
	$scope.userJoinedMeeting = function(userId) {
		meetingAttendees.userJoinedMeeting($scope.rs.cab_meeting.record.sys_id.value, userId);
	};

	$scope.isCABManager = function() {
		return runtimeState.isCABManager($window.NOW.user_id);
	};

	$scope.canBecomeHost = function() {
		return !runtimeState.isCABManager($window.NOW.user_id) && runtimeState.isCABManagerDelegate($window.NOW.user_id);
	};

	$scope.hostMeeting = function() {
		c.isHostingInProgress = true;
		var p = runtimeState.hostMeeting(c.data.currentUserId, c.data.meetingId);
		p.then(function(s){
			c.isHostingInProgress = false;
		},function(e){
			c.isHostingInProgress = false;
		});
	};

	runtimeState.get($scope.data.meetingId).then(function(rs) {
		$scope.rs = rs;

		if ($scope.data.meetingId) {
			meetingAttendees.get($scope.data.meetingId).then(function(attendeeModel) {
				$scope.data.attendeeData = attendeeModel;
				var meetingState = rs.cab_meeting.record.state.value;
				var attendee = $scope.getAttendeeById($scope.data.currentUserId);
				// if this user is already an attendee and "Joined meeting at" is already set there's nothing to do
				if (attendee && attendee.joined_at.value)
					return;

				$scope.addAttendeeTimer = $timeout(function() {
					// the meeting may have gone in progress while we were waiting to make sure
					// this user is definitely attending so update now if necessary
					if ($scope.rs.cab_meeting.record.state.value == "in_progress")
						$scope.userJoinedMeeting($scope.data.currentUserId);
					else
						$scope.$watch('rs.cab_meeting.record.state.value', function() {
							if ($scope.rs.cab_meeting.record.state.value == "in_progress")
								$scope.userJoinedMeeting($scope.data.currentUserId);
						});
				}, c.DELAY_BEFORE_USER_ATTENDING);
			});
		}
	});

	headerCtrl.updateNavCount("attendees", 0);
	var onPresence = function(event, presenceArray) {
		if (presenceArray && presenceArray.length > 0) {
			c.onlines = 0;
			angular.forEach(presenceArray, function(item) {
				if (item.status == 'online') {
					if ($scope.data.attendeeData.attendees[item.user])
							c.onlines++;
				}
			});
			headerCtrl.updateNavCount("attendees", c.onlines);
		}
	};

	c.onlines = 0;
	var presenceListener = $rootScope.$on("sn.presence", onPresence);
	snPresence.init();
	
	$scope.$on('$destroy', function () {
		if(presenceListener)
			presenceListener();
		if ($scope.addAttendeeTimer)
			$timeout.cancel($scope.addAttendeeTimer);
	});

}