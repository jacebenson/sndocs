angular.module("sn.change_management.cab.agenda")
	.service("meetingAgenda", ['CAB', 'modelUtil', '$http', '$q', 'snRecordWatcher', 'filterFilter', '$log', function(CAB, modelUtil, $http, $q, snRecordWatcher, filterFilter, $log) {
		var meetingAgenda = this;
		var mAd = []; //Agenda items
		var mTId = {}; //Attached against array index
		var mId; // Meeting Id
		var rMId; // Requested meeting Id. Prevents double requests if
		// the REST takes a while.
		var defReq; // If we have a request in progress
		var wChanTask;
		var wChanAgenda;

		/**
		 * Rebuilds the task agenda item index when elements are added removed or base agenda
		 */
		function rebuildTaskIndex() {
			mTId = {};
			for (var i=0; 1 < mAd.length; i++)
				mTId[mAd.task.value] = i;
		}

		/**
		 * Sort the agenda items array by the order value
		 */
		function sortAgendaItems() {
			mAd.sort(function(a,b) {
				return a.order.value - b.order.value;
			});
		}
				
		/**
		 * Keep the underlying tasks fresh
		 */
		function subscribeTaskWatcher() {
			if (wChanTask)
				wChanTask.unsubscribe();
						
			wChanTask = snRecordWatcher.initChannel(CAB.CHANGE_REQUEST, "sys_idIN" + Object.keys(mTId).join());
			wChanTask.subscribe(function(response) {
				// Get the location of the task in the array from the index
				var loc = mTId[response.data.sys_id];
				if (!isNaN(loc))
					modelUtil.patchObject(mAd[loc].task.record, response.data.record);
			});
		}
				
		function buildAgenda(response) {
			mId = rMId;
			rMId = "";
			mTId = {};
			mAd.length = 0; // Clears array

			if (wChanAgenda)
				wChanAgenda.unsubscribe();

			// Push items from rest response onto array
			// REST service orders items so we don't have to worry about that here
			for (var i = 0; i < response.data.result.length; i++) {
				modelUtil.addValueMSToAll(response.data.result[i]);
				modelUtil.addValueMSToAll(response.data.result[i].task.record);
				modelUtil.glideListToArray(response.data.result[i].notification_recipients);
				mAd.push(response.data.result[i]);
				mTId[response.data.result[i].task.value] = mAd.length - 1;
			}

			//No we've built the agenda, subscribe the task watcher
			subscribeTaskWatcher();
					
			if (!wChanAgenda)
				wChanAgenda = snRecordWatcher.initChannel(CAB.AGENDA_ITEM, CAB.MEETING + "=" + mId);
					
			wChanAgenda.subscribe(function(response) {
				var operation = response.data.operation;
						
				if (operation == "delete") {
					var i = meetingAgenda.getAgendaItemIndex(response.data.sys_id);
					var rem = mAd.splice(i, 1); // Remove the element
							
					// Remove the element from the task idx.
					if (rem.length > 0)
						delete (mTId[rem[0].task.value]);
							
					subscribeTaskWatcher();
				} else if (operation == "insert") {
					$http.get(CAB.AGENDA_SERVICE + "item/" + response.data.sys_id).then(function(response) {
						//Get the data from the response and push onto the array
						modelUtil.addValueMSToAll(response.data.result);
						modelUtil.addValueMSToAll(response.data.result.task.record);
						mAd.push(response.data.result);
						sortAgendaItems();
						rebuildTaskIndex();
						subscribeTaskWatcher();
					},
					modelUtil.failNicely);
				} else {
					// Transform the recipients if they've been modified
					if (response.data.changes.indexOf("notification_recipients") != -1)
						modelUtil.glideListToArray(response.data.record.notification_recipients);

					modelUtil.patchObject(meetingAgenda.getAgendaItem(response.data.sys_id), response.data.record);

					// If there was a change to the ordering, rebuild the task index.
					if (response.data.changes.indexOf("order") != -1) {
						sortAgendaItems();
						rebuildTaskIndex();
					}
				}
			});
		}

		// API
		/**
		 * Returns the specific agenda item from the current agenda
		 * specified by agendaItemId
		 */
		meetingAgenda.getAgendaItem = function(agendaItemId) {
			if (mAd.length == 0)
				return;

			var ai = filterFilter(mAd, { 'sys_id' : { 'value' : agendaItemId }});
			if (ai && ai.length > 0)
				return ai[0];
		};

		/**
		 * Returns the index of the agenda item in the agenda array
		 */
		meetingAgenda.getAgendaItemIndex = function(agendaItemId) {
			for (var i = 0; i < mAd.length; i++) {
				if (mAd[i].sys_id.value == agendaItemId)
					return i;
			}
			return -1;
		};
				
		/**
		 * Returns the next pending the agenda item if there is one 
		 */
		meetingAgenda.getNextPendingAgendaItem = function(){
			if (mAd.length == 0)
				return;

			for (var i = 0; i < mAd.length; i++)
				if (mAd[i].state.value == 'pending')
					return mAd[i];
					
			return;
		};
				
		/**
		 * Promote the selected agenda item to top of the pending list
		 */
		meetingAgenda.promoteItem = function(agendaItem, cb) {
			if (!agendaItem)
				return;

			$http.post("/api/sn_change_cab/cab/agenda/item/" + agendaItem.sys_id.value + "/promote").then(function () {
				if (cb)
					cb();
			}, null);
		};

		// LIFECYCLE --------------
		meetingAgenda.cleanup = function() {
			// cleanup code.
			mAd.length = 0;
			mId = "";
			rMid = "";
			defReq = null;
		};

		/**
		 * Initialises the meeting agenda
		 */
		function init(meetingSysId) {
			if (!meetingSysId)
				return;

			var deferred = $q.defer();
			defReq = deferred;

			$http.get(CAB.AGENDA_SERVICE + meetingSysId).then(function(response) {
				buildAgenda(response);
				defReq = null;
				deferred.resolve(mAd);
			}, function(response) {
				modelUtil.failNicely(response);
				defReq = null;
				deferred.reject(response);
			});

			return deferred.promise;
		}

		/**
		 * Gets the agenda for the meeting meetingSysId
		 */
		meetingAgenda.get = function(meetingSysId) {
			if (!meetingSysId || (mId && mId == meetingSysId) || meetingSysId == rMId) {
				if (defReq) // We're waiting on the request
					return defReq.promise;

				var deferred = $q.defer();
				deferred.resolve(mAd);
				return deferred.promise;
			}
			
			rMId = meetingSysId;
			return init(meetingSysId);
		};
	}]);