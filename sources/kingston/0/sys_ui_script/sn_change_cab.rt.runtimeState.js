angular.module("sn.change_management.cab.runtime_state")
	.service("runtimeState", ['CAB', 'modelUtil', 'meetingAgenda', 'snRecordWatcher', '$http', '$q', '$log', function(CAB, modelUtil, meetingAgenda, snRecordWatcher, $http, $q, $log) {			
		var runtimeState = this;  // For convenience
		var wChan;  // Watcher for the runtime state
		var wMtgChan; // Watcher for meeting table
		var rSt = {'localState': {}}; // Runtime state
		var mId; // Meeting Id
		var rMId; // Requested meeting ID
		var defReq; //Deferred request
		
		// The latest modification from Record Watcher
		var rwMod = {
			"cab_runtime_state": null,
			"cab_meeting": null
		};

		// Builds the state from the REST service return
		function buildState(response) {
			if (wChan)
				wChan.unsubscribe();

			if (wMtgChan)
				wMtgChan.unsubscribe();

			// Clear the object without breaking references
			for (var key in rSt)
				if (rSt.hasOwnProperty(key))
					delete(rSt[key]);
			
			rSt.localState = {};
			modelUtil.patchObject(rSt, response.data.result);
			// Add MS values for all dates in the nested CAM Meeting record
			modelUtil.addValueMSToAll(rSt.cab_meeting.record);
			modelUtil.glideListToArray(rSt.cab_meeting.record.delegates);
			
			rSt.localState.time_offset = Date.now() - rSt.request_time_ms;
			
			mId = rSt.cab_meeting.value;
			rMId = "";
			
			// Set up a record watcher if one doesn't exist.
			if (!wChan)
				wChan = snRecordWatcher.initChannel(CAB.RUNTIME_STATE, "sys_id=" + rSt.sys_id.value);
			
			wChan.subscribe(function(response) {
				modelUtil.patchObject(rSt, response.data.record);
				rwMod[CAB.RUNTIME_STATE] = response;
			});
				
			if (!wMtgChan)
				wMtgChan = snRecordWatcher.initChannel(CAB.MEETING, "sys_id=" + rSt.cab_meeting.value);
			
			wMtgChan.subscribe(function(response) {
				if (!rSt.cab_meeting.record)
					rSt.cab_meeting.record = {};
				modelUtil.patchObject(rSt.cab_meeting.record, response.data.record);
				modelUtil.glideListToArray(rSt.cab_meeting.record.delegates);
				rwMod[CAB.MEETING] = response;
			});
		}
		
		// API
		/**
		 * Sets the current agenda item for the meeting. Patches the runtime
		 * state if amb is not turned on
		 */
		runtimeState.nextAgendaItem = function(nextAgendaItemId) {
			//TODO: On success, if amb is turned off update local state
			$http.get(CAB.SERVICE.RUNTIME+ "next_item/" + mId + "/" + nextAgendaItemId)
				.then(null, modelUtil.failNicely);
		};
			
		runtimeState.noDecisionNextAgendaItem = function(nextAgendaItemId) {
			//TODO: On success, if amb is turned off update local state
			$http.get(CAB.SERVICE.RUNTIME+ "nd_next_item/" + mId + "/" + nextAgendaItemId)
				.then(null, modelUtil.failNicely);
		};
			
		runtimeState.pauseCurrentAgendaItem = function() {
			//TODO: On success, if amb is turned off update local state
			$http.get(CAB.SERVICE.RUNTIME+ "pause_current_item/" + mId)
				.then(null, modelUtil.failNicely);
		};
		
		runtimeState.resumeCurrentAgendaItem = function() {
			//TODO: On success, if amb is turned off update local state
			$http.get(CAB.SERVICE.RUNTIME+ "resume_current_item/" + mId)
				.then(null, modelUtil.failNicely);
		};

		/**
		 * If the user is following the current agenda item
		 */
		runtimeState.isViewingCurrent = function() {
			if (rSt.localState && rSt.localState.viewing && rSt.current_agenda_item)
				return rSt.localState.viewing == rSt.current_agenda_item.value;
			return true;
		};

		/**
		 * Starts the meeting and selects next pending agenda as current agenda
		 */
		runtimeState.startMeetingAndSelectNextAgenda = function() {
			if (mId) {
				meetingAgenda.get(mId).then(function(agenda) {
					if (agenda && agenda.length != 0) {
						runtimeState.startMeeting();
						var agendaItem = meetingAgenda.getNextPendingAgendaItem();
						if (agendaItem && agendaItem.sys_id)
							runtimeState.nextAgendaItem(agendaItem.sys_id.value);
					}
				});
			}
		};

		/**
		 * Set the agenda item the user is following
		 */
		runtimeState.setViewAgendaItem = function(agendaItemId) {
			rSt.localState.viewing = agendaItemId;
		};
			
		/**
		 * Returns the id if the agenda item being viewed
		 */
		runtimeState.getViewAgendaItem = function() {
			if (rSt.localState && rSt.localState.viewing)
				return rSt.localState.viewing;
			
			if (rSt.current_agenda_item)
				return rSt.current_agenda_item.value;
		};
			
		/**
		 * Returns true if the given user is the cab manager
		 */
		runtimeState.isCABManager = function(userSysId) {
			if (rSt.host && rSt.host.value) 
				return rSt.host.value === userSysId;

			if (rSt.cab_meeting && rSt.cab_meeting.record)
				return rSt.cab_meeting.record.manager.value === userSysId;

			return false;
		};
		
		/**
		 * Return true if the given user id is a delegate.
		 */
		runtimeState.isCABManagerDelegate = function(userSysId) {
			if (!(rSt.cab_meeting && rSt.cab_meeting.record))
				return false;
			
			// If they're the CAB Manager, the're always a delegate
			if (rSt.cab_meeting.record.manager.value == userSysId)
				return true;
			
			// If they're one of the delegates, they're a delegate
			if (rSt.cab_meeting.record.delegates.value.indexOf(userSysId) > -1)
				return true;
			
			return false;
		};
		
		/**
		 * Starts the meeting if it's not already in progress
		 */
		runtimeState.startMeeting = function() {
			if (rSt.cab_meeting && rSt.cab_meeting.record && rSt.cab_meeting.record.state.value == CAB.PENDING)
				$http.get(CAB.SERVICE.RUNTIME+ "start/" + mId)
					.then(null, modelUtil.failNicely);
		};
		

		runtimeState.hostMeeting = function(newHostId){
			if (!(mId && rSt.cab_meeting)) //If the meeting is not set up don't allow host change
				return;
			
			var params = {
					newHost:newHostId
					};
			var path = CAB.SERVICE.HOST_MEETING + mId;
			return $http.post(path,params);
		};
		
		/**
		 * Ends the meeting if it's in progress
		 */
		runtimeState.endMeeting = function() {
			if (rSt.cab_meeting && rSt.cab_meeting.record && rSt.cab_meeting.record.state.value == CAB.IN_PROGRESS)
				$http.get(CAB.SERVICE.RUNTIME+ "end/" + mId)
					.then(null, modelUtil.failNicely);
		};
		
		// LIFE CYCLE ----------
		/**
		 * Cleanup the service.
		 */
		runtimeState.cleanup = function() {
			if (wChan)
				wChan.unsubscribe();
			
			if (wMtgChan)
				wMtgChan.unsubscribe();
			
			for (var key in rSt)
				if (rSt.hasOwnProperty(key))
					delete(rSt[key]);
				
			rSt.localState = {};
		};
			
		/**
		 * Initialise the meeting state. Leaves the meeting state in it's
		 * original state if it fails.
		 */
		function init(meetingSysId) {
			if (!meetingSysId)
				return;

			var deferred = $q.defer();
			defReq = deferred;
			$http.get(CAB.SERVICE.RUNTIME + meetingSysId)
			.then(
				function(response){
					buildState(response);
					defReq = null;
					deferred.resolve(rSt);
				}, 
				function(response) {
					modelUtil.failNicely(response);
					defReq = null;
					deferred.reject(response);
				}
			);
			return deferred.promise;
		}
		
		/**
		 * Refreshes the current meeting state using the REST service
		 */
		runtimeState.refresh = function() {
			var deferred = $q.defer();
			$http.get(CAB.SERVICE.RUNTIME + this.mId)
			.then(
				function(response) {
					modelUtil.patchObject(rSt, response.data.result);
					modelUtil.addMSValueToAll(rSt.cab_meeting.record);
					deferred.resolve(rSt);
				},
				function(response) {
					modelUtil.failNicely(response);
					deferred.reject(response);
				}
			);
			return deferred.promise;
		};
		
		/**
		 * Get the meeting state for the given sys id. Returns the current state
		 * if the meetingId matches, initialises against the new id if not.
		 */
		runtimeState.get = function(meetingSysId) {
			if (!meetingSysId || (mId && mId == meetingSysId) || meetingSysId == rMId) {
				if (defReq)  //If we're on a promise
					return defReq.promise;
					
				var deferred = $q.defer();
				deferred.resolve(rSt);
				return deferred.promise;
			}
			return init(meetingSysId);
		};

		/**
		 * Returns the Record Watcher modifications object.
		 * Record watcher responses are set against named values to determine when data from record watcher
		 * was received.  Name of the trigger is usually the table name of the modified table.
		 */
		runtimeState.getRWMod = function() {
			return rwMod;
		};
		
	}]);