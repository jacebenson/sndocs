angular.module("sn.change_management.cab.calendar")
	.service("meetingCalendar", ['CAB', 'modelUtil', '$http', '$q', '$log', function(CAB, modelUtil, $http, $q, $log) {
		var meetingCalendar = this;
		
		meetingCalendar.getMeetingsBetween = function(startDateMs, endDateMs) {
			var deferred = $q.defer();
			$http.get(CAB.SERVICE.MEETING_CALENDAR + startDateMs + "/" + endDateMs ).then(
				function(response){
					response.data.result.forEach(function(meeting){
						modelUtil.addValueMSToAll(meeting);
					});
					
					return deferred.resolve(response.data.result);
				},
				function(response){
					modelUtil.failNicely(response);
					return deferred.reject(response);
				}
			);
			
			return deferred.promise;
		};
	}]);