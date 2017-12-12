angular.module("sn.change_management.cab.attendees")
	.service("meetingAttendees", ['CAB', 'modelUtil', 'snRecordWatcher', '$http', '$q', '$log', function(CAB, modelUtil, snRecordWatcher, $http, $q, $log) {
		var meetingAttendees = this;
			
		var mId = "";
		var aInf = {};
		var defReq;
		var wChan;
			
		function setupService(response) {
			if (wChan)
				wChan.unsubscribe();

			modelUtil.patchObject(aInf, response.data.result);

			wChan = snRecordWatcher.initChannel(CAB.ATTENDEE, CAB.MEETING + "=" + aInf.meetingId);
			wChan.subscribe(function(response) {
				init(aInf.meetingId);
			});
		}

		function init(meetingId) {
			var deferred = $q.defer();
			defReq = deferred;
			$http.get(CAB.SERVICE.ATTENDEE + meetingId).then(
				function(response){
					setupService(response); // Set up record watcher on attendees for this meeting
					defReq = null;
					deferred.resolve(aInf);
				},
				function(response){
					modelUtil.failNicely(response);
					defReq = null;
					deferred.reject(response);
				});
				
			return deferred.promise;
		}
			
		meetingAttendees.get = function(meetingId) {
			if (mId == meetingId) { // If the same attendee info is being requested.
				if (defReq)
					return defReq.promise;

				var deferred = $q.defer();
				deferred.resolve(aInf);
				return deferred.promise;
			}
				
			return init(meetingId);
		};
			
		meetingAttendees.userJoinedMeeting = function(meetingId, userId) {
			if (!userId || !meetingId)
				return ;

			$http.get(CAB.SERVICE.ATTENDEE + "joinedmeeting/" + meetingId + "/" + userId).then(
					null,
					function(response) {
						$log.warn("Failed to update attendee");
						$log.warn(response);
					}
				);
		};
		
		meetingAttendees.cleanup = function() {
			// cleanup code.
		};
	}]);