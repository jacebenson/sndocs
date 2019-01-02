
(function () {
	'use strict';

	/*
	 * Use this service in angular components and vcab widgets to access the data.
	 */
	angular.module('sn.itsm.vcab.common')
	.factory('vcabDataSource', function ($http, $q, Tables, $log, dataUtil, $rootScope) {
		var URI_BASE = '/api/now/table/';
		var AGG_URI_BASE = '/api/now/stats/';
		var CHANGE_META_API = '/api/now/change_request_calendar/change/';
		var RELATED_CHANGE_API = '/api/now/change_request_calendar/change/related/';
		var UI_NOTIFICATIONS = '/api/now/session/notification';

		function getAllNotifications() {
			return $http.get(UI_NOTIFICATIONS);
		}

		function getConfig(params) {
			var c = {
				params: {
					sysparm_exclude_reference_link: true,
					sysparm_display_value: 'all'
				}
			};
			if (params) {
				for (var k in  params) {
					if (typeof params[k] === 'undefined')
						delete c.params[k];
					else
						c.params[k] = params[k];
				}
			}
			return c;
		}

		function getNewPromise(promise, transformResult) {
			return $q(function (resolve, reject) {
				promise.then(function (response) {
					var r = response.data.result;
					if (transformResult)
						r = transformResult(r);
					resolve(r);
				}, function (response) {
					$log.info("sn.change_management.cab.vcabDataSource: REST Failure");
					$log.info(response);
					if (response.data && response.data.error) {
						getAllNotifications().then(function (resp) {
							var r = resp.data.result;
							if (r) {
								r.forEach(function (e) {
									// On service portal this is auto caught and presented on UI.
									$rootScope.$broadcast("$$uiNotification", {type: e.type, message: e.text});
								});
							}
						});
					}
					reject(response);
				});
			});
		}

		function get(table, sysId) {
			return getNewPromise($http.get(URI_BASE + table + '/' + sysId, getConfig()));
		}

		function query(table, filter) {
			if (!filter) {
				$log.warn('query invoked without any filter!');
				if (console.trace)
					console.trace();
			}
			return getNewPromise($http.get(URI_BASE + table, getConfig({
				sysparm_query: filter,
				sysparm_suppress_pagination_header: true
			})));
		}

		function update(table, obj, changedFields) {
			if (!obj.sys_id)
				throw 'Cannot update object, it is not saved probably. Anyway no sys_id field found in it.';
			var keys = Object.keys(obj);
			var data = {};
			for (var k in keys) {
				if (changedFields && changedFields.indexOf(k) === -1) {
					continue;
				}
				var v = obj[keys[k]];
				if (v && v.value)
					v = v.value;
				if(keys[k] != 'sys_id')
				data[keys[k]] = v;
			}
			return getNewPromise($http.patch(URI_BASE + table + '/' + dataUtil.getValue(obj.sys_id), data, getConfig()));
		}

		function multiUpdate(table, objs, changedFields) {
			var counter = 0;
			var def = $q.defer();
			var failedObjs = [];
			var savedObjs = [];
			function onDone() {
				counter--;
				if (counter === 0)
					def.resolve(savedObjs, failedObjs);
			}
			if (!objs || objs.length === 0)
				def.resolve(savedObjs, failedObjs);
			else
				objs.forEach(function (obj) {
					var p = update(table, obj, changedFields);
					counter++;
					p.then(function (d) {
						savedObjs.push(d);
						onDone();
					}, function (d) {
						failedObjs.push(obj);
						onDone();
					});
				});
			return def.promise;
		}

		function count(table, query) {
			return getNewPromise($http.get(AGG_URI_BASE + table, getConfig({
				sysparm_query: query,
				sysparm_count: true,
				sysparm_exclude_reference_link: undefined
			})), function (res) {
				return res.stats.count * 1; // The returned count is string, converting to number
			});
		}

		var Source = {
			meeting: {
				get: function (sysId) {
					return get(Tables.MEETING, sysId);
				},
				query: function (filter) {
					return query(Tables.MEETING, filter);
				},
				update: function(changeObject, changedFields) {
				return update(Tables.MEETING, changeObject, changedFields);
				}
			},
			agenda: {
				get: function (sysId) {
					return get(Tables.AGENDA, sysId);
				},
				query: function (filter) {
					return query(Tables.AGENDA, filter);
				},
				update: function (agenda, changedFields) {
					return update(Tables.AGENDA, agenda, changedFields);
				},
				multiUpdate: function (agendas, changedFields) {
					return multiUpdate(Tables.AGENDA, agendas, changedFields);
				},
				count: function (query) {
					return count(Tables.AGENDA, query);
				}
			},
			attendee: {
				get: function (sysId) {
					return get(Tables.ATTENDEE, sysId);
				},
				query: function (filter) {
					return query(Tables.ATTENDEE, filter);
				},
				count: function (query) {
					return count(Tables.ATTENDEE, query);
				}
			},
			change: {
				get: function (sysId) {
					return get(Tables.CHANGE, sysId);
				},
				getByAgendaId: function (agendaId) {
					return query(Tables.CHANGE, 'JOIN' + Tables.CHANGE + '.sys_id=' + Tables.AGENDA_BASE + '.task!sys_id=' + agendaId).then(function (r) {
						if (r && r.length > 0)
							return r[0];
						else
							return null;
					}, function (res) {
						return res;
					});
				},
				query: function (filter) {
					return query(Tables.CHANGE, filter);
				},
				queryByMeetingId: function (meetingId, filter) {
					if (!filter)
						filter = '';
					else
						filter = '^' + filter;
					return query(Tables.CHANGE, 'SUBQUERYsys_id,task,cab_agenda_item^cab_meeting=' + meetingId + '^ENDSUBQUERY' + filter);
				},
				update: function (change, changedFields) {
					return update(Tables.CHANGE, change, changedFields);
				},
				multiUpdate: function (changes, changedFields) {
					return multiUpdate(Tables.CHANGE, changes, changedFields);
				},
				getRelatedWindows: function (sysId, startDate, endDate) {
					return getNewPromise($http.get(CHANGE_META_API + sysId + '/' + dataUtil.jsToWsDate(startDate) + '/' + dataUtil.jsToWsDate(endDate)));
				},
				getRelatedChanges: function (sysId, startDate, endDate, byAssignee, byGroups, byPrimaryCi) {
					var f = [];
					if (byAssignee)
						f.push('assigned_to');
					if (byGroups)
						f.push('group');
					if (byPrimaryCi)
						f.push('primary_ci');
					return getNewPromise($http.get(RELATED_CHANGE_API + sysId, {
						params: {
							start_date: dataUtil.jsToWsDate(startDate),
							end_date: dataUtil.jsToWsDate(endDate),
							filter: f.join(',')
						}
					}));
				}
			}
		};
		return Source;
	});

} ());