(function () {
	'use strict';

	var instances = {};

	/*
	 * Meant to be used by meeting dashboard widgets and directives.
	 * It provides managed access to meeting related data.
	 *
	 * Usage: var mtg = new meetingUtil(meetingId);
	 *
	 * APIs:-
	 *
	 * registerCurrentChangeWatcher(callback) - The callback will be invoked with change
	 * of the current agenda. The callback will be called whenever the current agenda changes.
	 *
	 * registerCurrentAgendaWatcher(callback) - The callback will be invoked with the current
	 * agenda. The callback will be called whenever the current agenda changes.
	 *
	 * getAgendaCount(callback) - The callback will be invoked periodically with the total agenda
	 * count, pending agenda count, and the count of agenda by which the meeting is running ahead
	 * in schedule. If meeting is just on schedule then the count will be zero. If it is running
	 * behind schedule, say, by 2 agenda items, then it will return -2.
	 *
	 * registerMeetingChangeWatcher(callback) - The callback will be called with meeting data object
	 * whenever meeting data is updated. The meeting data object will always contain the updated data.
	 */
	angular.module('sn.itsm.vcab.common')
	.factory('meetingUtil', function (vcabDataSource, amb, Tables, dataUtil, $q, $timeout, $log) {
		function ListenerCollection() {
			var list = [];
			this.add = function (cb) {
				list.push(cb);
			};
			this.remove = function (cb) {
				list.some(function (f, idx) {
					if (f === cb) {
						list.splice(idx, 1);
						return true;
					}
				});
			};
			this.notify = function () {
				var args = Array.prototype.slice.call(arguments);
				list.forEach(function (cb) {
					cb.apply(undefined, args);
				});
			};
		}

		function watch(table, filter, cb) {
			var ch = amb.getChannelRW(table, filter);
			ch.subscribe(cb);
			amb.connect();
		}

		function patchObjWithChanges(obj, msg) {// Where msg is the object returned by record watcher.
			if (msg.data.operation === 'update') {
				for (var i = 0; i < msg.data.changes.length; i++) {
					var attr = msg.data.changes[i];
					angular.extend(obj[attr], msg.data.record[attr]);
				}
			} else {
				$log.error('patchObjWithChanges: Unsupported operation ' + msg.data.operation);
			}
		}

		function MeetingUtil(meetingId) {
			if (instances[meetingId])
				return instances[meetingId];

			var currChangeWatchers = new ListenerCollection();
			var currAgendaWatchers = new ListenerCollection();
			var agendaCountWatchers = new ListenerCollection();
			var meetingWatchers = new ListenerCollection();

			var currentChange;
			var currentAgenda;

			var meetingData;
			var meetingTotalDuration; // In ms
			var runningCount;
			var lastRunningCount;
			var totalAgendaCount;
			var totalPendingAgendaCount;

			function onNewMeetingData(meeting, msg) {
				meeting.start.js = dataUtil.wsToJsDate(meeting.start);
				meeting.end.js = dataUtil.wsToJsDate(meeting.end);
				meetingTotalDuration = meeting.end.js.getTime() - meeting.start.js.getTime();
				refreshRunningStatus();
				meetingWatchers.notify(angular.extend({}, meeting), msg);
			}

			vcabDataSource.meeting.get(meetingId).then(function (meeting) {
				meetingData = meeting;
				onNewMeetingData(meetingData);

				watch(Tables.MEETING, 'sys_id=' + meetingId, function (msg) {
					if (recalTimer)
						$timeout.cancel(recalTimer);
					patchObjWithChanges(meetingData, msg);
					onNewMeetingData(meetingData, msg);
				});
			});

			var recalTimer;
			function recalRunningStatus(forceNotify) {
				var timePerAgenda = meetingTotalDuration / totalAgendaCount;
				var elapsedTime = dataUtil.dateNowAsPerUserProfile() - meetingData.start.js.getTime();
				var howManyShouldHaveBeenDone = Math.floor(elapsedTime / timePerAgenda);
				var howManyActuallyDone = totalAgendaCount - totalPendingAgendaCount - 1; // Removing the in-progress one
				runningCount = howManyActuallyDone - howManyShouldHaveBeenDone;
				if (runningCount !== lastRunningCount || forceNotify)
					agendaCountWatchers.notify(totalAgendaCount, totalPendingAgendaCount, runningCount);
				lastRunningCount = runningCount;

				recalTimer = $timeout(recalRunningStatus, 1000);
			}

			function refreshRunningStatus() {
				$q.all([
			        vcabDataSource.agenda.count('cab_meeting=' + meetingId),
			        vcabDataSource.agenda.count('state=pending^cab_meeting=' + meetingId)
		        ]).then(function (res) {
		        	totalAgendaCount = res[0];
		        	totalPendingAgendaCount = res[1];
		        	recalRunningStatus(true);
		        });
			}

			function getCurrentAgendaAndNotify() {
				vcabDataSource.agenda.query('state=in_progress^cab_meeting=' + meetingId).then(function (agendas) {
					if (agendas.length > 0) { // It is expected that only one agenda will be in in_progress
						refreshAgenda(undefined, agendas[0]);
					}
				});
			}

			function refreshChange (agendaId) {
				vcabDataSource.change.getByAgendaId(agendaId).then(function (change) {
					currentChange = change;
					currChangeWatchers.notify(change);
				});
			}

			function refreshAgenda (agendaId, agenda) {
				function processAgenda(agenda) {
					currentAgenda = agenda;
					currAgendaWatchers.notify(agenda);

					refreshChange(agenda.sys_id.value);
				}
				if (agenda)
					processAgenda(agenda);
				else
					vcabDataSource.agenda.get(agendaId).then(processAgenda);
			}

			getCurrentAgendaAndNotify();
			watch(Tables.AGENDA, 'state=in_progress^cab_meeting=' + meetingId, function (msg) {
				var sysId = msg.data.sys_id;
				if (msg.data.changes.indexOf('state') > -1) { // If other fields change then we don't care.
					refreshAgenda(sysId);
					refreshRunningStatus();
				}
			});

			this.registerCurrentChangeWatcher = function (cb) {
				currChangeWatchers.add(cb);
				if (currentChange)
					cb(currentChange);

				return function () {
					currChangeWatchers.remove(cb);
				};
			};

			this.registerCurrentAgendaWatcher = function (cb) {
				currAgendaWatchers.add(cb);
				if (currentAgenda)
					cb(currentAgenda);

				return function () {
					currAgendaWatchers.remove(cb);
				};
			};

			this.getAgendaCount = function (cb) {
				agendaCountWatchers.add(cb);
				if (typeof runningCount !== 'undefined')
					cb(totalAgendaCount, totalPendingAgendaCount, runningCount);

				return function () {
					agendaCountWatchers.remove(cb);
				};
			};

			this.registerMeetingChangeWatcher = function (cb) {
				meetingWatchers.add(cb);
				if (meetingData)
					cb(angular.extend({}, meetingData));

				return function () {
					meetingWatchers.remove(cb);
				};
			};

			instances[meetingId] = this;
		}
		return MeetingUtil;
	});

} ());