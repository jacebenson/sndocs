angular.module('sn.itsm.vcab.calendar', ['sn.common', 'sn.calendar', 'sn.itsm.vcab.common', 'ui.bootstrap', 'ui.bootstrap.popover']);
(function ($) {
	'use strict';
	var ALL_FILTER = 'all';
	var NONE_FILTER = 'none';
	var ENTER = 13, SPACE = 32, ESC = 27, F7 = 118, LEFT = 37, RIGHT = 39, TAB = 9, E = 69;

	// Used to serialize filter options for user preference.
	// Compared to JSON.stringify this creates more readable text.
	function serializeObj(o) {
		var s = '';
		var keys = Object.keys(o);
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			if (typeof o[k] === 'undefined' || k === ALL_FILTER || k === NONE_FILTER)
				continue;
			if (i > 0)
				s += ',';
			s += k + '=' + o[k];
		}
		return s;
	}
	function deserializeObj(s) {
		var o = {};
		if (s) {
			var d = s.split(',');
			for (var i = 0; i < d.length; i++) {
				var p = d[i].split('=');
				if (p[0] === ALL_FILTER || p[0] === NONE_FILTER)
					continue;
				o[p[0]] = p[1] === 'true';
			}
		}
		return o;
	}
	function getPhantomKey(d) {
		return d.getDate() + '~' + d.getMonth();
	}

	var UIDC = 1;
	function uid() {
		return UIDC++ + '';
	}

	angular.module('sn.itsm.vcab.calendar')
	.directive('snCabChangeCalendar', function (getTemplateUrl, CalendarView, vcabDataSource, dataUtil, $timeout, TimelineView, i18n, calendarUtils, calendarAccessibilityUtils, 
			$compile, userPreferences, $q, go, cancellablePromise, $rootScope, isAccessibilityEnabled, CAB, $sanitize) {
		return {
			restrict: 'E',
			templateUrl: getTemplateUrl('vcab_sn_vcab_calendar.xml'),
			scope: {
				change: '=',
				onWarn: '&',
				isUpdatable: '@', // true/false - Default false
				isConfigAvailable: '@', // true/false - Default false
				configOptions: '=?',
				dayViewOptions: '=?',
				weekViewOptions: '=?',
				configDescription: '@',
				autoSaveAndFetchOptionsAsUserPref: '@', // true/false - Default false
				timeformat: '<',
				dateTimeFormat: '<',
				keyNav: '@'
			},
			link: function ($scope, el, attrs) {
				dataUtil.setDateTimeFormat($scope.dateTimeFormat);
				dataUtil.setTimeFormat($scope.timeformat);
				var BLACKOUT_SECTION = 10, MAINT_SECTION = 20, CURR_CHANGE_SECTION = 30, RELATED_CHANGE_SECTION = 40;
				var BLACKOUT_TYPE = 1, MAINT_TYPE = 2, BOTH_TYPE = 3;
				var HAS_SPACE = 1, NO_SPACE = 0, NO_SPACE_FOR_ANYTHING = -1;
				var LBL_MAINTENANCE_SCHEDULE = i18n.getMessage('Maintenance Window');
				var LBL_BLACKOUT_SCHEDULE = i18n.getMessage('Blackout Schedule');
				var LBL_MAINTENANCE_SCHEDULES = i18n.getMessage('Maintenance Windows');
				var LBL_BLACKOUT_SCHEDULES = i18n.getMessage('Blackout Schedules');
				var LBL_BOTH_SCHEDULES = i18n.getMessage('Blackout & Maint Schedules');
				var LBL_MULTIPLE_MAINTENANCE_SCHEDULES = i18n.getMessage('Multiple Maintenance Windows');
				var LBL_MULTIPLE_BLACKOUT_SCHEDULES = i18n.getMessage('Multiple Blackout Schedules');
				$scope.SETTINGS_TAB = 1;
				$scope.CONFIG_TAB = 2;
				$scope.CalendarView = CalendarView;
				var focusTimer, focusIDAfterUpdate;
				$scope.changeFilterOpen = false;
				var CHANGE_FILTER_BUTTON = 'change_filter';
				var CHANGE_FILTER_POPOVER = 'cab_change_filter_popover';
				var PARENT_EVENT_ID = "parent_event_id";
				var filterPopoverTimer;
				function setFocus(id, timeoutValue) {
					if(!id)
						return;
					timeoutValue = timeoutValue || 100;
					if(focusTimer)
						$timeout.cancel(focusTimer);
					focusTimer = $timeout(function() {
						focusTimer = undefined;
						var parentEl = $('div[' + PARENT_EVENT_ID + '="' + id + '"]:not(.event_details), td[' + PARENT_EVENT_ID + ' = "' + id + '"]');
						parentEl.focus();
					}, timeoutValue, false);
				}

				$(el).on('keydown', '#dhx_minical_icon', function($event) {
					if($event.which != TAB)
						return;

					var finalTarget;
					var $this = $(this);
					if($event.shiftKey) {
						$event.stopPropagation();
						$event.preventDefault();
						$rootScope.$broadcast(CAB.FOCUS_TO_CHANGE_TAB);
					}
					if(!finalTarget)
						return;
					$event.preventDefault();
					$timeout(function() {
						finalTarget.focus();
					},10, false);
				});

				$(el).on('click', '#'+ CHANGE_FILTER_BUTTON, function($event){

					if(filterPopoverTimer)
						$timeout.cancel(filterPopoverTimer);
					$timeout(function(){
						if(!$scope.changeFilterOpen)
							return;

						filterPopoverTimer = undefined;
						$("#" + CHANGE_FILTER_POPOVER).focus();
					},100,false);
				});

				function getCommonCalCtrl() {
					return angular.element('.common-cal', el).controller('snDhtmlxScheduler');
				}
				function hasEnoughSpaceToShowEventText(start, end) {
					var ctrl = getCommonCalCtrl();
					if (ctrl) {
						var width = ctrl.getEstimatedEventWidthInPx(start, end);
						return width > 70 ? HAS_SPACE : (width >= 34 ? NO_SPACE : NO_SPACE_FOR_ANYTHING);
					}
					return NO_SPACE;
				}
				function getChangeLabel(change) {
					var v = $sanitize(change.short_description.display_value);
					if (v) {
						v = v.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
					}

					return "<span tabindex='0' class='inline-block'><small>" + $sanitize(change.number.display_value)
						+ "</small><p><strong><sn-cab-line-clamp max-lines='2' text='" + v + "'>"
						+ "</sn-cab-line-clamp></strong></p></span>";
				}
				function getWindowLabel(windowDisplayValue) {
					return "<span class='cab_window_label' tabindex = '0'>" + $sanitize(windowDisplayValue) + "</span>";
				}
				function getWindowEventText(id, data, start, end, sectionId) {
					var t = "<div class='event_details' event_id='" + id + "'>";
					if ($scope.viewMode === CalendarView.MONTH) {
						t += '<strong>' + $sanitize(data.title) + '</strong>';
					} else {
						var spc = hasEnoughSpaceToShowEventText(start, end);
						var c = 'badge';
						if (angular.isArray(data)) {
							if (spc === NO_SPACE_FOR_ANYTHING)
								c += ' size_zero_event';
							else if (spc === NO_SPACE)
								c += ' no_text_event';
						}
						if (spc === HAS_SPACE) {
							var f = $scope.viewMode === CalendarView.DAY ? $scope.filters.dayView : $scope.filters.weekView;
							if (f.dateTime) {
								t += "<span class='date_range'>"
										+ dataUtil.dateRangeToFriendlyText(start, end)
									+ "</span>";
							}
							if (sectionId === BLACKOUT_SECTION)
								t += "<p>" + LBL_BLACKOUT_SCHEDULE;
							else
								t += "<p>" + LBL_MAINTENANCE_SCHEDULE;
						}
						if (angular.isArray(data)) {
							t += " <span class='" + c + "' uib-popover-template='\"cab_multi_window_popover.html\"'"
							+" popover-append-to-body='true' popover-placement='right' popover-trigger='none' popover-is-open='isBadgePopupOpen'"
							+" popover-class='cab_change_calendar_popover' popover-animation='false'"
							+" ng-mouseenter='openBadgePopup()' ng-mouseleave='closeBadgePopup()'>" + data.length + "</span> ";
						}
						if (spc === HAS_SPACE) {
							t+= "</p>";
						}
					}
					t += "</div>";
					return t;
				}
				function getChangeEventText(id, change, start, end) {
					var t = "<div class='event_details' event_id='" + id + "' id = " + id + '_content';
					var hasEnoughSpace = false;
					//var t = "<div class='event_details' event_id='" + id + "'>";
					if ($scope.viewMode === CalendarView.MONTH) {
						t += '> <strong>' + $sanitize(change.number.display_value) + '</strong>';
					} else {
						hasEnoughSpace = hasEnoughSpaceToShowEventText(start, end) === HAS_SPACE;
						if(!hasEnoughSpace)
							t += " aria-label = '" + $sanitize(change.number.display_value) + "' ";
							t += ">";
						if (hasEnoughSpace) {
							var f = $scope.viewMode === CalendarView.DAY ? $scope.filters.dayView : $scope.filters.weekView;
							if (f.dateTime) {
								t += "<span class='date_range'>"
										+ dataUtil.dateRangeToFriendlyText(start || change.start_date, end || change.end_date)
									+ "</span>";
							}
							if (f.number || (f.shortDescription && change.short_description.display_value))
								t += "<p>";
							if (f.number)
								t += "<strong>" + $sanitize(change.number.display_value) + "</strong> ";
							if (f.shortDescription && change.short_description.display_value)
								t += $sanitize(change.short_description.display_value);
							if (f.number || (f.shortDescription && change.short_description.display_value))
								t += "</p>";
							if ($scope.viewMode === CalendarView.DAY) {
								if ((f.assignee && change.assigned_to.display_value) || (f.group && change.assignment_group.display_value))
									t += "<p>";
								if (f.assignee && change.assigned_to.display_value)
									t += $sanitize(change.assigned_to.display_value);
								if (f.group && change.assignment_group.display_value) {
									if (f.assignee && change.assigned_to.display_value)
										t += '&nbsp;&nbsp;&nbsp;';
									t += $sanitize(change.assignment_group.display_value);
								}
								if ((f.assignee && change.assigned_to.display_value) || (f.group && change.assignment_group.display_value))
									t += "</p>";
							}
						}
					}
					t += "</div>";
					return t;
				}
				function getNoNullStartDate(d) {
					if (d)
						return d;
					return new Date(0);
				}
				function getNoNullEndDate(d) {
					if (d)
						return d;
					// If the event spans many many years like a 1000yrs then for some reason clicking that
					// dhtmlx hangs the browser for a really long time. The time taken to respond to click is directly
					// proportional to length of event span. So, below we generate a time which hopefully
					// long enough that user won't see the end of it and not that long to cause considerable slow down.
					return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // Sometime way way into future, 100yrs from now
				}
				function changeToEvent(change, sectionId) {
					var s = change.start_date = dataUtil.wsToJsDate(change.start_date);
					var e = change.end_date = dataUtil.wsToJsDate(change.end_date);
					var id = change.sys_id.value;
					var ns = getNoNullStartDate(s);
					var ne = getNoNullEndDate(e);
					var e = {
							id: id,
							start_date: ns,
							end_date: ne,
							text: getChangeEventText(id, change, ns, ne),
							change: change,
							timeline_section: sectionId
					};
					return e;
				}
				function scheduleToEvents(schedule, sectionId) {
					var events = [];
					schedule.date_ranges.forEach(function (d, index) {
						var id = schedule.sys_id;
						if (schedule.date_ranges.length > 1)
							id += "-" + (index + 1);
						var s = d.start = dataUtil.wsToJsDate(d.start);
						var e = d.end = dataUtil.wsToJsDate(d.end);
						var e = {
								id: id,
								start_date: getNoNullStartDate(s),
								end_date: getNoNullEndDate(e),
								text: getWindowEventText(id, schedule, s, e, sectionId),
								schedule: schedule,
								date_range: d,
								timeline_section: sectionId
						};
						events.push(e);
					});
					return events;
				}
				function updateEvent(eid) {
					var ctrl = getCommonCalCtrl();
					if (ctrl) {
						ctrl.updateEvent(eid, !isRelatedSectionOpen);
						return true;
					}
					return false;
				}
				function updateEventText(e) {
					e.text = getChangeEventText(e.id, e.change, e.start_date, e.end_date);
					updateEvent(e.id);
				}
				function refreshEventsText(notify) {
					var eventUpdated = false;
					if ($scope.events) {
						$scope.events.forEach(function (e) {
							if (e.change) {
								e.text = getChangeEventText(e.id, e.change, e.start_date, e.end_date);
							} else {
								var data = e.is_multievent ? e.events : e.schedule;
								e.text = getWindowEventText(e.id, data, e.start_date, e.end_date, e.timeline_section);
							}
							if (notify)
								eventUpdated = updateEvent(e.id);
						});
						if (eventUpdated)
							addPopoversToEventsIfNeeded();
					}
				}
				function getEventFromId(id) {
					if ($scope.events) {
						for (var i = 0; i < $scope.events.length; i++)
							if ($scope.events[i].id === id) {
								return $scope.events[i];
							}
					}
					if ($scope.phantomEvents) {
						for (var k in $scope.phantomEvents) {
							if ($scope.phantomEvents[k].id === id) {
								return $scope.phantomEvents[k];
							}
						}
					}
					return null;
				}
				function compileTimelineLabels() {
					$timeout(function () {
						$('.dhx_scell_name', el).each(function () {
							var needsCompilation = !$(this).hasClass('ng-scope');
							if (needsCompilation) {
								$compile(this)($scope);
							}
						});
					}, 100);
				}

				var isDatePickerOpen = false;
				$scope.$on("dp.show", function(){
					isDatePickerOpen = true;
				});
				$scope.$on("dp.hide", function() {
					$timeout(function(){
						isDatePickerOpen = false;
					}, 10, false);
				});
				$(document).on('keydown.' + CHANGE_FILTER_POPOVER, '#' + CHANGE_FILTER_POPOVER, function($event) {
					if($event.keyCode == LEFT || $event.keyCode == RIGHT) {
						var targetIndex = 0;
						var index = parseInt($event.target.getAttribute('data-index'));
						var count = $('#cab_change_filter_popover .icon').length - 1;
						if($event.keyCode == LEFT)
							targetIndex = index - 1;
						else
							targetIndex = index + 1;

						if(targetIndex < 0)
							targetIndex = count;
						else if(targetIndex > count)
							targetIndex = 0;
						var selector = '#cab_change_filter_popover div[data-index="';
						selector += targetIndex + '"].icon';
						var $target = $(selector);
						$target.click();
						$target.focus();
						$event.stopPropagation();
						$event.preventDefault();
					}
				});

				// Attach listeners to document since the popovers are directly appended to body
				$(document).on('keydown.cab_change_popover', function ($event) {
					if ($event.keyCode == ESC) {

						if($scope.changeFilterOpen) {
							$scope.$apply(function() {
								$scope.changeFilterOpen = false;
							});
							$timeout(function(){
								$('#' + CHANGE_FILTER_BUTTON).focus();
							}, 100, false);
							return;
						}
						// if datetimepicker is open, close it.
						if(isDatePickerOpen)
							return;

						var $el = $($event.target).closest('div[' + PARENT_EVENT_ID + ']');
						var id = $el.attr(PARENT_EVENT_ID);
						$scope.$apply(function () {
							$scope.closeChangePopups();
							setFocus(id,500); // because we are recreating the scopes , 500 has given
						});
					}
				});

				$(el).on('keydown.cab_change_popover', 'td.cab_event .dhx_month_head > a', function ($event) {
					if ($event.keyCode == F7) {
						$($event.target)
							.parents('td.cab_event')
							.trigger($.Event('keypress', {keyCode: ENTER}));
					}
				});

				var eventScopes = {};
				var eventDuplicateCounts = {};
				// This not only adds popovers but compiles the full event dom,
				// so popover badges inside the event bars too are activated by this code.
				function addPopoversToEventsIfNeeded() {
					var defer = $q.defer();
					$scope.closeChangePopups();
					$timeout(function () {
						var sameEventCounts = {};
						$('.cab_event', el).each(function () { // Querying all event doms
							var $this = $(this);
							var needsCompilation = !$this.attr('uib-popover-template');
							var eid = $('.event_details', this).attr('event_id');
							if (!sameEventCounts[eid])
								sameEventCounts[eid] = 1;
							else
								sameEventCounts[eid]++;
							var scopeKey = eid + ':' + sameEventCounts[eid]; // In non-timeline views there could be multiple instances of same event.
							var scope = eventScopes[scopeKey];
							var createNewScope = false;
							if (!scope) {
								createNewScope = true;
							} else if (needsCompilation) {
								// We are about to recompile so we will destroy current scope
								// so that old popovers having watch on this scope are destroyed.
								scope.$destroy();
								createNewScope = true;
							}
							if (createNewScope) {
								scope = $scope.$new(true);
								(function () {
									var id = uid();
									scope.getPopupId = function () {
										return 'cab_calendar_popup_' + id;
									};
								}());
								scope.isBadgePopupOpen = false;
								scope.isPopupOpen = false;
								eventScopes[scopeKey] = scope;
								eventDuplicateCounts[eid] = sameEventCounts[eid];
							}
							// Syncing up scope.eventData with actual event data.
							scope.eventData = getEventFromId(eid);
							if (scope.eventData) {
								var isChange = !!scope.eventData.change;
								var isCurrChange = isChange && scope.eventData.timeline_section === CURR_CHANGE_SECTION;
								var isMultiEvent = scope.eventData.is_multievent;
								var isPhantomEvent = scope.eventData.is_phantom;
								var isSingleEventPhantom = isPhantomEvent && scope.eventData.events.length === 1;
							}
							if (isMultiEvent) {
								if (scope.eventData.timeline_section === BLACKOUT_SECTION)
									scope.schedulesTitle = LBL_BLACKOUT_SCHEDULES;
								else if (scope.eventData.timeline_section === MAINT_SECTION)
									scope.schedulesTitle = LBL_MAINTENANCE_SCHEDULES;
								if (createNewScope) {
									scope.openBadgePopup = function () {
										if (!scope.isPopupOpen)
											scope.isBadgePopupOpen = true;
									};
									scope.closeBadgePopup = function () {
										scope.isBadgePopupOpen = false;
									};
									scope.$watch('isPopupOpen', function (open) {
										if (open) {
											scope.closeBadgePopup();
										}
									});
								}
							}
							if (isPhantomEvent) {
								if (scope.eventData.type === BLACKOUT_TYPE)
									scope.schedulesTitle = LBL_BLACKOUT_SCHEDULES;
								else if (scope.eventData.type === MAINT_TYPE)
									scope.schedulesTitle = LBL_MAINTENANCE_SCHEDULES;
								else if (scope.eventData.type === BOTH_TYPE)
									scope.schedulesTitle = LBL_BOTH_SCHEDULES;
								if (isSingleEventPhantom) {
									scope.eventData = scope.eventData.events[0];
								}
							}
							if (createNewScope) {
								if (isChange) {
									scope.canShowAssignedTo = function () {
										if ($scope.viewMode === CalendarView.DAY)
											return $scope.filters.dayView.assignee;
										else if ($scope.viewMode === CalendarView.WEEK)
											return $scope.filters.weekView.assignee;
										return true;
									};
									scope.canShowGroup = function () {
										if ($scope.viewMode === CalendarView.DAY)
											return $scope.filters.dayView.group;
										else if ($scope.viewMode === CalendarView.WEEK)
											return $scope.filters.weekView.group;
										return true;
									};
									scope.canShowShortDescription = function () {
										if ($scope.viewMode === CalendarView.DAY)
											return $scope.filters.dayView.shortDescription;
										else if ($scope.viewMode === CalendarView.WEEK)
											return $scope.filters.weekView.shortDescription;
										return true;
									};
									scope.canShowDateTime = function () {
										if ($scope.viewMode === CalendarView.DAY)
											return $scope.filters.dayView.dateTime;
										else if ($scope.viewMode === CalendarView.WEEK)
											return $scope.filters.weekView.dateTime;
										return true;
									};
								} else {
									scope.openScheduleForm = function (sysId) {
										scope.isPopupOpen = false;
										go.toFormModal('cmn_schedule', sysId, {
											title: i18n.getMessage('Schedule Form'),
											endOfDialog: i18n.getMessage('End of dialog')
										});
									};
								}
								scope.onUpdateClick = function(){
									focusIDAfterUpdate = scope.parentEventId;
									scope.update();
								};
								scope.onCloseClick = function(){
									scope.close();
									setFocus(scope.parentEventId, 100);
								};
								scope.close = function () {
									scope.isPopupOpen = false;
								};
								changePopupClosers[scopeKey] = scope.close;

								// Adding methods for accessibility
								scope.onEventClick = function($event) {
									$timeout(function () {
										angular.element('#' + scope.getPopupId()).focus();
									}, 100);
								};
								scope.openPopup = function ($event) {
									if ($event.keyCode == ENTER || $event.keyCode == SPACE) {
										$scope.closeChangePopups();
										$event.preventDefault();
										$event.stopPropagation();
										scope.isPopupOpen = true;
										$scope.changeFilterOpen = false;
										$timeout(function () {
											//$timeout(function () {
												angular.element('#' + scope.getPopupId()).focus();
											//}, 100);
										}, 100);
										return true;
									}
								};
								scope.$watch('isPopupOpen', function () {
									if ($scope.keyNav === 'false')
										return;
									if (!scope.isPopupOpen) {
										$scope.config.keyNav = true;
									} else {
										$timeout(function () {
											// By this time isPopupOpen is false watch would
											// have been fired for other previously opened popups.
											$scope.config.keyNav = false; // Disable left-right arrow keys to change dates when popup is open
										}, 10);
									}
								});
							}
							var isEditableChange = isCurrChange && $scope.isUpdatable === 'true';
							if (isEditableChange && createNewScope) {
								// Added methods to editable change popup's scope
								scope.update = function () {
									scope.updating = true;
									vcabDataSource.change.update({
										sys_id: scope.eventData.change.sys_id.value,
										start_date: dataUtil.jsToWsDate(scope.dates.start),
										end_date: dataUtil.jsToWsDate(scope.dates.end)
									}).then(function (change) {
										scope.updating = false;
										scope.close();
										if (isCurrChange) {
											$scope.change = change;
											scope.changeWillUpdate = true;
										}
										// TODO If other changes need updation, we need to use updateEvent
										// alongwith calls to refreshEventsText() and addPopoversToEventsIfNeeded().
									}, function () {
										scope.updating = false;
										scope.close();
									});
								};
								scope.$watch('isPopupOpen', function (open) {
									if (open) {
										$scope.closeChangePopups(scopeKey); // Close other editable popups, if any.
										if (scope.unsavedDates)
											scope.dates = scope.unsavedDates;
										else {
											// We are reading dates from change and not the event since
											// event could have pseudo dates if change is unbounded.
											// Also another reason is dummy events. See comments in config.templates.event_class
											// for details.
											scope.dates = {
													start: scope.eventData.change.start_date,
													end: scope.eventData.change.end_date
											};
										}
									} else {
										if (scope.unsavedDates) {
											// Unsaved dates were provided then that means event data already has the updated date.
											// We will now check if change data was saved into backend, if not then we need to restore
											// event dates.
											scope.unsavedDates = undefined;
											if (!scope.changeWillUpdate) {
												angular.extend(scope.eventData, changeToEvent(scope.eventData.change, scope.eventData.timeline_section));
												updateEvent(scope.eventData.id);
												//setFocus(scopeKey, 100);
												addPopoversToEventsIfNeeded();
											}
										}
									}
								});
							}
							if (needsCompilation) {
								if (scope.eventData) {
									if (isChange) {
										if (isEditableChange)
											$this.attr('uib-popover-template', '"cab_editable_change_event_popover.html"');
										else
											$this.attr('uib-popover-template', '"cab_readonly_change_event_popover.html"');
									} else if (isMultiEvent || (isPhantomEvent && !isSingleEventPhantom))
										$this.attr('uib-popover-template', '"cab_multi_window_event_popover.html"');
									else
										$this.attr('uib-popover-template', '"cab_window_event_popover.html"');

									if($scope.viewMode !== CalendarView.DAY) {
										var startDate;
										if(scope.eventData.events)
											startDate = scope.eventData.events[0].end_date;
										else
											startDate = scope.eventData.start_date;
									}
									$this.attr('popover-class', 'cab_change_calendar_popover');
									if(isEditableChange)
										$this.attr('popover-placement', 'auto bottom');
									else
										$this.attr('popover-placement', 'auto');
									$this.attr('popover-append-to-body', 'true');
									$this.attr('popover-is-open', 'isPopupOpen');
									$this.attr('popover-trigger', 'click outsideClick');
									$this.attr('popover-animation', 'false');
									$this.attr('ng-keydown', 'openPopup($event)');
									$this.attr("ng-click", 'onEventClick($event)');
									$this.attr('tabindex', '-1');
									if(isChange)
										$this.attr('aria-labelledby', scope.eventData.id + "_content");
									else {
										if($scope.viewMode == CalendarView.DAY) {
											if(scope.eventData.timeline_section == BLACKOUT_SECTION)
												$this.attr("aria-label", LBL_BLACKOUT_SCHEDULE);
											else if(scope.eventData.timeline_section == MAINT_SECTION)
												$this.attr("aria-label", LBL_MAINTENANCE_SCHEDULE);
										}
									}
									scope.parentEventId = scopeKey;
									scope.dateTimeFormat = $scope.dateTimeFormat;
									$this.attr(PARENT_EVENT_ID, scopeKey);
									// We do this from here instead of CSS so that if
									// enhancement fails users do not see the hand icon.
									$this.css('cursor', 'pointer');
									$compile(this)(scope);
								}
							}
						});
						garbageCollectOldEventScopes();
						defer.resolve();
					}, 100);
					return defer.promise;
				}
				function garbageCollectOldEventScopes() {
					for (var scopeKey in eventScopes) {
						var s = eventScopes[scopeKey];
						var id = scopeKey.split(':')[0];
						var count = parseInt(scopeKey.split(':')[1]);
						var maxCount = eventDuplicateCounts[id] || 0;
						var e = getEventFromId(id);
						var destroy = false;
						if (s && !e) {
							destroy = true;
							eventDuplicateCounts[id] = 0;
						} else if (s && e && count > maxCount) {
							// Garbage collecting duplicate scopes of current event
							// but when there is no longer need for these many duplicates.
							destroy = true;
						}
						if (destroy) {
							s.$destroy();
							eventScopes[scopeKey] = undefined;
							if (changePopupClosers[scopeKey])
								changePopupClosers[scopeKey] = undefined;
						}
					}
				}
				function getFirstScope(ev) {
					return eventScopes[ev.id + ':1'];
				}
				var isRelatedSectionOpen = true;
				function setVerticalUnits(currChangeLabel, showBlackoutSection, showMaintSection, showRelatedSection) {
					var sections = [];
					if (showBlackoutSection)
						sections.push({key: BLACKOUT_SECTION, label: getWindowLabel(LBL_BLACKOUT_SCHEDULE)});
					if (showMaintSection)
						sections.push({key: MAINT_SECTION, label: getWindowLabel(LBL_MAINTENANCE_SCHEDULE)});
					sections.push({key: CURR_CHANGE_SECTION, label: currChangeLabel}); // Current Change
					if (showRelatedSection)
						sections.push({key: RELATED_CHANGE_SECTION, label: i18n.getMessage('Related Changes'), open: isRelatedSectionOpen, children: $scope.relatedChangeLabels});

					$scope.config.timeline.verticalUnits = sections;
					compileTimelineLabels();
				}

				$scope.events = [];
				$scope.phantomEvents = {}; // Stores date to phantom event map. Phantom events are not actually sent to dhtmlx as events.
				$scope.relatedChangeLabels = [];
				$scope.ready = false; // When this directive is rendered, it might be within ng-hide. Initing scheduler code then will render it collapsed.
				$scope.verticalUnits = null;
				if (!$scope.configDescription)
					$scope.configDescription = i18n.getMessage('Set filters to choose how related Changes are discovered.');

				$scope.config = {
						date: dataUtil.currentDateAsPerUserProfile(),
						allowCreate: false,
						allowResize: $scope.isUpdatable === 'true',
						allowMoving: $scope.isUpdatable === 'true',
						weekStartDay: calendarUtils.getNormalizedWeekStartDay(dataUtil.getFirstDayOfWeek()),
						viewTimeFormat: $scope.timeformat,
						nativeEventNavigation: false,
						timeline: {
							displayButtonInUI: false,
							enabled: true, // It is needed here since $scope.onViewChange is not invoked until there is a change in view.
							support: true,
							property: {
								value: 'timeline_section'
							},
							renderType: TimelineView.TREE,
							section_autoheight: false,
							dy: 68, // This value is used in CSS too.
							dx: 215,
							event_dy: 'full',
							folder_dy: 23
						},
						xy: {
							scale_height: 36,
							day_scale_height: 30
						},
						templates: {
							week_scale_date: function (date, mode, schedulerInstance, jumptoAttr) {
								// For some reason I am getting real mode as 2nd arg, whereas the documentation does not say that.
								return "<a href='#' " + jumptoAttr + ">" + schedulerInstance.date.date_to_str("%j %D")(date) + "</a>";
							},
							event_class: function (start, end, ev) {
								var c;
								if (ev.timeline_section === BLACKOUT_SECTION)
									c = "cab_blackout_event cab_window_event";
								else if (ev.timeline_section === MAINT_SECTION)
									c = "cab_maint_event cab_window_event";
								else if (ev.timeline_section === CURR_CHANGE_SECTION)
									c = "cab_current_change_event cab_change_event";
								else
									c = "cab_related_change_event cab_change_event";
								c += " cab_event";
								if (viewStartDate && ev.start_date.getTime() < viewStartDate.getTime()) {
									c += " cab_event_extends_left";
								}
								if (viewEndDate && ev.end_date.getTime() > viewEndDate.getTime()) {
									c += " cab_event_extends_right";
								}
								if (ev.is_multievent)
									c += " cab_multievent";
								if (ev.change) {
									if (!ev.hasOwnProperty('change')) {
										// Means this is a dummy copy. This is done in basic views where same event spans multiple rows.
										// The dummy copy's prototype is set to actual event object. However, it overrides start_date & end_date.
										// The end_date is the actual end date but start date is always the change data's start date.
										// The last span has reference to original event object.
										c += " cab_event_extends_right";
										if (!ev._first_chunk)
											c += " cab_event_extends_left";
										Object.getPrototypeOf(ev)._hasDummyCopy = true;
									} else {
										// Relies on that fact that if there are dummy events then they are rendered before,
										// and the actual event is last span.
										if (ev._hasDummyCopy)
											c += " cab_event_extends_left";
										ev._hasDummyCopy = false;
									}
								}
								return c;
							},
							month_date_class: function (date) {
								// This might get called before fetchWindow finishes. In that case this will be
								// working on incorrect phantom data. However, when fetchWindow finishes that triggers
								// buildEventArr() which further recreates the events array causing its watch to fire
								// in common calendar; which then renders the scheduler, case this method to be invoked
								// again.
								var key = getPhantomKey(date);
								var ev = $scope.phantomEvents[key];
								if (ev) {
									var c;
									if (ev.type === BLACKOUT_TYPE)
										c = "cab_blackout_event cab_window_event";
									else if (ev.type === MAINT_TYPE)
										c = "cab_maint_event cab_window_event";
									else if (ev.type === BOTH_TYPE)
										c = "cab_blackout_event cab_maint_event cab_window_event";
									c += " cab_event";
									return c;
								}
								return '';
							},
							month_day: function (date, schedulerInstance, jumptoAttr, tabindex, ariaDayName) {
								var dateToStr_func = schedulerInstance.date.date_to_str(schedulerInstance.config.month_day);
								var d = dateToStr_func(date);
								var key = getPhantomKey(date);
								var ev = $scope.phantomEvents[key];
								var html = "<a  tabindex='-1' ";
								var ariaAttr = " role='link' aria-label='" + ariaDayName + ". ";
								if (ev) {
									if (ev.type === BLACKOUT_TYPE)
										ariaAttr = ariaAttr + i18n.getMessage('This day has blackout window scheduled. Press F7 for popup with more details.');
									else if (ev.type === MAINT_TYPE)
										ariaAttr = ariaAttr + i18n.getMessage('This day has maintenance window scheduled. Press F7 for popup with more details.');
									else if (ev.type === BOTH_TYPE)
										ariaAttr = ariaAttr + i18n.getMessage('This day has both blackout and maintenance windows scheduled. Press F7 for popup with more details.');
								} else
									ariaAttr = ariaAttr + i18n.getMessage('This day has no blackout or maintenance windows scheduled.');
								ariaAttr = ariaAttr + "' ";
								if (ev)
									return html + "class='event_details month_date' event_id='" + ev.id + "' "
										+ jumptoAttr + ariaAttr + " href='#'>"  + d + "</a>";
								else
									return html + "class='month_date' " + jumptoAttr + ariaAttr + " href='#'>" + d + "</a>";
							},
							event_bar_date: function (start, end, ev) {
								return ''; // Used to remove dates from single day month views.
							},
							tooltip_text: function (start, end, ev) {
								var t = dataUtil.dateRangeToFriendlyText(start, end);
								if (ev.schedule) {
									if (ev.timeline_section === BLACKOUT_SECTION)
										t += "<p>" + LBL_BLACKOUT_SCHEDULE + "</p>";
									else
										t += "<p>" + LBL_MAINTENANCE_SCHEDULE + "</p>";
								} else if (ev.is_multievent) {
									if (ev.timeline_section === BLACKOUT_SECTION)
										t += "<p>" + LBL_MULTIPLE_BLACKOUT_SCHEDULES + "</p>";
									else
										t += "<p>" + LBL_MULTIPLE_MAINTENANCE_SCHEDULES + "</p>";
								} else if (ev.change)
									t += "<p>" + $sanitize(ev.change.short_description.display_value) + "</p>";
								return t;
							}
						},
						mode: CalendarView.DAY,
						readOnly: false
				};

				function isReady() {
					if (el.height() === 0) {// Means it is not yet visible
						$timeout(isReady, 300);
						return;
					}
					$scope.ready = true;
				}
				isReady();

				var loadingCallsCounter = 0;
				$scope.enableLoading = function () {
					$scope.isLoading = true;
					loadingCallsCounter++;
				};
				$scope.disableLoading = function () {
					if (loadingCallsCounter === 0)
						return;
					loadingCallsCounter--;
					if (loadingCallsCounter === 0)
						$scope.isLoading = false;
				};

				setVerticalUnits(i18n.getMessage('No change selected'));

				$scope.viewMode = $scope.config.mode;
				$scope.onViewChange = function (newView) {
					var oldView = $scope.viewMode;
					$scope.viewMode = newView;
					$scope.closeChangePopups();
					if (newView === CalendarView.DAY || newView === CalendarView.WEEK) {
						$scope.config.timeline.enabled = true;
						if (oldView === CalendarView.MONTH)
							buildEventArr();
						fetchRelatedChanges();
					} else if (newView === CalendarView.MONTH) {
						$scope.config.timeline.enabled = false;
						buildEventArr(); // Need to do so that phantom events can be built
					}
					$timeout(function(){
						$('.dhx_cal_data .cab_window_event').attr("tabindex","-1");
					});
				};
				$scope.onSchedulerResize = function($scheduler) {
					$scope.onViewChange($scope.viewMode);
				};
				$scope.onAfterViewChange = function () {
					if ($scope.viewMode === CalendarView.DAY || $scope.viewMode === CalendarView.WEEK)
						compileTimelineLabels();
					refreshEventsText(true);
					addPopoversToEventsIfNeeded();
				};
				var viewStartDate;
				var viewEndDate;
				$scope.onDateRangeChange = function (start, end) {
					viewStartDate = start;
					viewEndDate = end;
					$scope.closeChangePopups();
					if ($scope.viewMode !== CalendarView.MONTH)
						buildEventArrIfNotAlreadyBuilt();
					buildMarkedSpans();
					addPopoversToEventsIfNeeded();
				};
				$scope.onFolderToggle = function (isOpen) {
					// Toggling folder collapse re-renders the section labels and events,
					// hence we need to re-sprinkle magic dust.
					compileTimelineLabels();
					addPopoversToEventsIfNeeded();
					isRelatedSectionOpen = isOpen;
				};
				$scope.onBeforeTooltip = function (ev) {
					return false;
				};
				$scope.onBeforeDrag = function (ev) {
					if (ev.change) {
						$scope.closeChangePopups(); // Close all the existing pop-ups when dragging is started
						return $scope.viewMode === CalendarView.DAY && ev.timeline_section === CURR_CHANGE_SECTION;
					}
					else
						return false;
				};
				var isLastDragCancelled;
				$scope.onBeforeEventChanged = function (ev, originalEv) {
					isLastDragCancelled = true;
					if (ev.timeline_section !== originalEv.timeline_section) // Disallow section change. Currently there does not seem to be a better way.
						return false;
					var ctrl = getCommonCalCtrl();
					if (ctrl) {
						var extraGapInMs = 10 / ctrl.getEstimatedPxPerMs(); // 10px gap in ms
						if (ev.end_date.getTime() < (viewStartDate.getTime() + extraGapInMs)) // If span is out of view then popup can't be displayed
							return false;
						if (ev.start_date.getTime() > (viewEndDate.getTime() - extraGapInMs))
							return false;
					}
					isLastDragCancelled = false;
					return true;
				};
				$scope.onDragEnd = function (ev) {
					$scope.changeFilterOpen = false;
					var scope = getFirstScope(ev);
					if(scope.isPopupOpen)
						return;
					updateEventText(ev);

					var showPopup = !isLastDragCancelled;
					compileTimelineLabels();
					addPopoversToEventsIfNeeded().then(function () {
						if (showPopup) {
							scope = getFirstScope(ev);
							if (scope) {
								// We use date from event and not Change
								// since on drag only event's dates change,
								// and Change data needs to be synced with it.
								scope.unsavedDates = {
									start: ev.start_date,
									end: ev.end_date
								};
								scope.isPopupOpen = true;
								$timeout(function(){
									angular.element('#' + scope.getPopupId()).focus();
								},100,false);
							}
						}
					});

				};
				$scope.$watch('events', function () {
					buildMarkedSpans();
					compileTimelineLabels();
					addPopoversToEventsIfNeeded().then(function(){
						setFocus(focusIDAfterUpdate,500);
						focusIDAfterUpdate = undefined;
					});
				});
				var changePopupClosers = {};
				$scope.closeChangePopups = function (exceptWithScopeKey) {
					for (var k in changePopupClosers) {
						if (k === exceptWithScopeKey)
							continue;
						if (changePopupClosers[k])
							changePopupClosers[k]();
					}
				};

				var currentChangeEvent;
				var currentChangeLabel;
				$scope.enableLoading();
				$scope.$watch('change', function (currentChange) {
					if (currentChange) {
						// When we update change we reassign it to $scope.change so it is updated, but
						// cloning helps prevent any possible infinite loop if we ever decide to deep watch this object.
						currentChange = angular.extend({}, currentChange);
						currentChangeEvent = changeToEvent(currentChange, CURR_CHANGE_SECTION);
						currentChangeLabel = getChangeLabel(currentChange);
						$scope.disableLoading();

						setVerticalUnits(currentChangeLabel, true, true); // TODO turn off windows section if that is turned off using properties

						if (currentChange.start_date)
							$scope.config.date = new Date(currentChange.start_date.getTime()); // changeToEvent has already converted WS date to JS Date.

						$scope.events = [currentChangeEvent];
						$scope.fetchEvents(startDate, endDate);
					} else {
						setVerticalUnits(i18n.getMessage('No change selected'));
						$scope.events = [];
					}
					$scope.ready = false;
					isReady();
				});

				function mergeOverlappingWindowEvents(events) {
					var rangeBuckets = [];
					for (var i = 0; i < events.length; i++) {
						var e = events[i];
						var eligibleBuckets = [];
						for (var j = 0; j < rangeBuckets.length; j++) {
							var b = rangeBuckets[j];
							if (calendarUtils.testRangesIntersect(e.start_date, e.end_date, b.start, b.end))
								eligibleBuckets.push(j);
						}
						var targetB = {
							events: [e],
							start: e.start_date,
							end: e.end_date
						};
						rangeBuckets.push(targetB);
						// Merging all eligible buckets as one single bucket.
						// All events in eligible buckets will be emptied into
						// bucket targetB and then those buckets will be deleted.
						for (j = eligibleBuckets.length - 1; j >= 0; j--) {
							var currB = rangeBuckets[eligibleBuckets[j]];
							if (targetB.start.getTime() > currB.start.getTime())
								targetB.start = currB.start;
							if (targetB.end.getTime() < currB.end.getTime())
								targetB.end = currB.end;

							targetB.events = dataUtil.mergeSortedArrays(targetB.events, currB.events, function (e1, e2) {
								return e1.start_date.getTime() - e2.start_date.getTime();
							});

							// Since values in eligibleBuckets always progressively increases
							// hence when iterating in reverse we can safely delete the merged buckets.
							rangeBuckets.splice(eligibleBuckets[j], 1);
						}
					}
					return rangeBuckets.map(function (b) {
						if (b.events.length > 1) {
							var leaderEvent = b.events[0];
							var id = b.events.map(function (e) { return e.id; }).join(',');
							return {
								id: id,
								start_date: b.start,
								end_date: b.end,
								text: getWindowEventText(id, b.events, b.start, b.end, leaderEvent.timeline_section),
								is_multievent: true,
								events: b.events,
								timeline_section: leaderEvent.timeline_section
							};
						} else {
							return b.events[0];
						}
					});
				}
				function buildPhantomEventMap() {
					$scope.phantomEvents = {};
					var events = [];
					if ($scope.blackoutSchedules && $scope.blackoutSchedules.length)
						events = events.concat($scope.blackoutSchedules);
					if ($scope.maintenanceSchedules && $scope.maintenanceSchedules.length)
						events = events.concat($scope.maintenanceSchedules);
					events.forEach(function (e) {
						calendarUtils.getAllDaysInDateRange(e.start_date, e.end_date).forEach(function (d) {
							var key = getPhantomKey(d);
							var pe = $scope.phantomEvents[key];
							if (!pe) {
								pe = {
									id: uid(),
									date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
									is_phantom: true,
									type: undefined,
									events: []
								};
								$scope.phantomEvents[key] = pe;
							}
							if (e.timeline_section === BLACKOUT_SECTION) {
								if (!pe.type)
									pe.type = BLACKOUT_TYPE;
								else if (pe.type === MAINT_TYPE)
									pe.type = BOTH_TYPE;
							} else if (e.timeline_section === MAINT_SECTION) {
								if (!pe.type)
									pe.type = MAINT_TYPE;
								else if (pe.type === BLACKOUT_TYPE)
									pe.type = BOTH_TYPE;
							} else
								throw 'Programming error! Only schedule type events are expected here.';
							pe.events.push(e);
						});
					});
				}
				function getCurrentEventBuildMarker() {
					if (viewStartDate)
						return viewStartDate.getTime() + $scope.viewMode;
					return undefined;
				}
				function buildEventArrIfNotAlreadyBuilt() {
					if (eventBuildMarker === getCurrentEventBuildMarker())
						return;
					buildEventArr();
				}
				var eventBuildMarker;
				function buildEventArr() {
					if (currentChangeEvent) {
						$scope.events = [currentChangeEvent];
						if ($scope.viewMode !== CalendarView.MONTH) {
							$scope.relatedChangeLabels = [];
							var evs;
							if ($scope.blackoutSchedules && $scope.blackoutSchedules.length) {
								evs = $scope.blackoutSchedules;
								evs = mergeOverlappingWindowEvents(evs);
								$scope.events = $scope.events.concat(evs);
							}
							if ($scope.maintenanceSchedules && $scope.maintenanceSchedules.length) {
								evs = $scope.maintenanceSchedules;
								evs = mergeOverlappingWindowEvents(evs);
								$scope.events = $scope.events.concat(evs);
							}
							if ($scope.relatedChanges && $scope.relatedChanges.length) {
								evs = $scope.relatedChanges.filter(function (e) {
									if (!viewStartDate)
										return false;
									if (e.end_date.getTime() > viewStartDate.getTime() && e.start_date.getTime() < viewEndDate.getTime()) {
										$scope.relatedChangeLabels.push({
											key: e.timeline_section,
											label: getChangeLabel(e.change)
										});
										return true;
									}
									return false;
								});
								setVerticalUnits(currentChangeLabel, true, true, evs.length > 0);
								$scope.events = $scope.events.concat(evs);
							} else {
								setVerticalUnits(currentChangeLabel, true, true, false);
							}
						} else {
							buildPhantomEventMap();
						}
					} else {
						$scope.blackoutSchedules = [];
						$scope.maintenanceSchedules = [];
						$scope.relatedChanges = [];
						$scope.relatedChangeLabels = [];
						setVerticalUnits(currentChangeLabel, true, true, false);
						$scope.events = [];
					}
					eventBuildMarker = getCurrentEventBuildMarker();
				}
				function buildMarkedSpans() {
					if (currentChangeEvent) {
						var c = 'current_change_span_mark';
						if (viewStartDate && currentChangeEvent.start_date.getTime() < viewStartDate.getTime())
							c += ' left_extends_beyond';
						if (viewEndDate && currentChangeEvent.end_date.getTime() > viewEndDate.getTime())
							c += ' right_extends_beyond';
						$scope.markedSpans = [{
							start_date: currentChangeEvent.start_date,
							end_date: currentChangeEvent.end_date,
							type: 'current_change_marker',
							css: c
						}];
						return;
					}
					$scope.markedSpans = [];
				}

				var startDate;
				var endDate;
				$scope.fetchEvents = function (start, end) {
					// Recording current date ranges
					startDate = start;
					endDate = end;

					fetchWindows();
					if ($scope.viewMode !== CalendarView.MONTH)
						fetchRelatedChanges();
				};

				var windowFetchPromise;
				function fetchWindows() {
					if (windowFetchPromise) {
						windowFetchPromise.cancel();
						$scope.disableLoading();
					}
					if (!currentChangeEvent) { // Change info not available, deferring fetch until it is available.
						return;
					}
					if (!startDate) { // Ignore since date range is not known yet.
						return;
					}
					// We do this since Scheduler timemap seems to truncate the time part, so in another timezone
					// that might become another range narrower range. So if we extend the range by +-24hrs then
					// we can guarantee the range is big enough to cater this bug.
					var start = calendarUtils.getStartOfPreviousDay(startDate);
					var end = calendarUtils.getStartOfNextDay(endDate);

					$scope.enableLoading();
					windowFetchPromise = cancellablePromise(vcabDataSource.change.getRelatedWindows(currentChangeEvent.id, start, end));
					windowFetchPromise.then(function (data) {
						$scope.blackoutSchedules = [];
						$scope.maintenanceSchedules = [];
						data.maintenance.forEach(function (m) {
							$scope.maintenanceSchedules = $scope.maintenanceSchedules.concat(scheduleToEvents(m, MAINT_SECTION));
						});
						data.blackout.forEach(function (b) {
							$scope.blackoutSchedules = $scope.blackoutSchedules.concat(scheduleToEvents(b, BLACKOUT_SECTION));
						});
						if (data.warn_invalid_conflict_checker)
							$scope.onWarn({
								$msg: i18n.getMessage('The ChangeCheckConflicts script include has been modifed and does not contain the required API. Cannot collect maintenance and blackout schedules. Please contact system administrator.')
							});
						buildEventArr();
						$scope.disableLoading();
					}, function () {
						$scope.blackoutSchedules = [];
						$scope.maintenanceSchedules = [];
						buildEventArr();
						$scope.disableLoading();
					});
				}

				var relatedChangeFetchPromise;
				function fetchRelatedChanges() {
					if (relatedChangeFetchPromise) {
						relatedChangeFetchPromise.cancel();
						$scope.disableLoading();
					}
					if (!currentChangeEvent) { // Change info not available, deferring fetch until it is available.
						return;
					}
					if (!startDate) { // Ignore since date range is not known yet. We don't need exact view dates
									// since in buildEventArr we filter the ones out of view.
						return;
					}
					if ($scope.filters.config.assignee || $scope.filters.config.group || $scope.filters.config.ci) {
						$scope.enableLoading();
						relatedChangeFetchPromise = cancellablePromise(vcabDataSource.change.getRelatedChanges($scope.change.sys_id.value,
								startDate, endDate, $scope.filters.config.assignee, $scope.filters.config.group, $scope.filters.config.ci));
						relatedChangeFetchPromise.then(function (changes) {
								var sectionId = RELATED_CHANGE_SECTION;
								$scope.relatedChanges = changes.map(function (change) {
									sectionId += 10;
									return changeToEvent(change, sectionId);
								});
								buildEventArr();
								$scope.disableLoading();
							}, function () {
								$scope.relatedChanges = [];
								buildEventArr();
								$scope.disableLoading();
							});
					} else {
						$scope.relatedChanges = [];
						buildEventArr();
					}
				}

				// Handling filters
				function setAllAndNone(c) {
					var score = 0;
					var total = 0;
					for (var k in  c) {
						if (k === ALL_FILTER || k === NONE_FILTER)
							continue;
						total++;
						if (c[k])
							score++;
					}
					if (total === 0)
						return;
					c.all = false;
					c.none = false;
					if (score === total)
						c.all = true;
					if (score === 0)
						c.none = true;
				}
				if (!$scope.configOptions)
					$scope.configOptions = {};
				if (!$scope.dayViewOptions)
					$scope.dayViewOptions = {};
				if (!$scope.weekViewOptions)
					$scope.weekViewOptions = {};
				$scope.filters = {
						config: $scope.configOptions,
						dayView: $scope.dayViewOptions,
						weekView: $scope.weekViewOptions,
						tabSelection: $scope.SETTINGS_TAB
				};
				if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
					var q = $q.all(
								[userPreferences.getPreference('cab_workbench.day_view_options'),
								userPreferences.getPreference('cab_workbench.week_view_options'),
								userPreferences.getPreference('cab_workbench.config_options')]
							);
					q.then(function (r) {
						$scope.dayViewOptions = {
								dateTime: true,
								number: true,
								shortDescription: true,
								assignee: true,
								group: true
							};
						$scope.filters.dayView = angular.extend($scope.dayViewOptions, deserializeObj(r[0]));

						$scope.weekViewOptions = {
								dateTime: true,
								number: true,
								shortDescription: true
							};
						$scope.filters.weekView = angular.extend($scope.weekViewOptions, deserializeObj(r[1]));

						$scope.configOptions = {
								assignee: false,
								group: false,
								ci: true
							};
						$scope.filters.config = angular.extend($scope.configOptions, deserializeObj(r[2]));
					});
				} else {
					$scope.filters.config.ci = true;
					$scope.filters.dayView.all = true;
					$scope.filters.weekView.all = true;
				}

				// Config filters
				$scope.$watch('filters.config.all', function (all) {
					if (all) {
						$scope.filters.config.none = false;
						$scope.filters.config.assignee = true;
						$scope.filters.config.group = true;
						$scope.filters.config.ci = true;
					}
				});
				$scope.$watch('filters.config.none', function (none) {
					if (none) {
						$scope.filters.config.all = false;
						$scope.filters.config.assignee = false;
						$scope.filters.config.group = false;
						$scope.filters.config.ci = false;
					}
				});
				$scope.$watchGroup(['filters.config.assignee', 'filters.config.group', 'filters.config.ci'], function () {
					setAllAndNone($scope.filters.config);
					fetchRelatedChanges();
				});
				$scope.saveConfigOptions = function () {
					if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
						$timeout(function () {
							var s = serializeObj($scope.configOptions);
							if (s)
								userPreferences.setPreference('cab_workbench.config_options', s);
						});
					}
				};

				// Day view filters
				$scope.$watch('filters.dayView.all', function (all) {
					if (all) {
						$scope.filters.dayView.none = false;
						$scope.filters.dayView.dateTime = true;
						$scope.filters.dayView.number = true;
						$scope.filters.dayView.shortDescription = true;
						$scope.filters.dayView.assignee = true;
						$scope.filters.dayView.group = true;
					}
				});
				$scope.$watch('filters.dayView.none', function (none) {
					if (none) {
						$scope.filters.dayView.all = false;
						$scope.filters.dayView.dateTime = false;
						$scope.filters.dayView.number = false;
						$scope.filters.dayView.shortDescription = false;
						$scope.filters.dayView.assignee = false;
						$scope.filters.dayView.group = false;
					}
				});
				$scope.$watchGroup(['filters.dayView.dateTime',
				                    'filters.dayView.number',
				                    'filters.dayView.shortDescription',
				                    'filters.dayView.assignee',
				                    'filters.dayView.group'], function () {
					setAllAndNone($scope.filters.dayView);
					refreshEventsText(true);
				});
				$scope.saveDayViewOptions = function () {
					if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
						$timeout(function () {
							var s = serializeObj($scope.dayViewOptions);
							if (s)
								userPreferences.setPreference('cab_workbench.day_view_options', s);
						});
					}
				};

				// Week view filters
				$scope.$watch('filters.weekView.all', function (all) {
					if (all) {
						$scope.filters.weekView.none = false;
						$scope.filters.weekView.dateTime = true;
						$scope.filters.weekView.number = true;
						$scope.filters.weekView.shortDescription = true;
					}
				});
				$scope.$watch('filters.weekView.none', function (none) {
					if (none) {
						$scope.filters.weekView.all = false;
						$scope.filters.weekView.dateTime = false;
						$scope.filters.weekView.number = false;
						$scope.filters.weekView.shortDescription = false;
					}
				});
				$scope.$watchGroup(['filters.weekView.dateTime',
				                    'filters.weekView.number',
				                    'filters.weekView.shortDescription'], function () {
					setAllAndNone($scope.filters.weekView);
					refreshEventsText(true);
				});
				$scope.saveWeekViewOptions = function () {
					if ($scope.autoSaveAndFetchOptionsAsUserPref === 'true') {
						$timeout(function () {
							var s = serializeObj($scope.weekViewOptions);
							if (s)
								userPreferences.setPreference('cab_workbench.week_view_options', s);
						});
					}
				};

				$scope.$watch('keyNav', function () {
					if ($scope.keyNav === 'false')
						$scope.config.keyNav = false;
					else
						$scope.config.keyNav = true;
				});

				$scope.$on('$destroy', function () {
					$scope.events = [];
					$(document).off('.cab_change_popover');
					$(document).off('.' + CHANGE_FILTER_POPOVER);
					garbageCollectOldEventScopes();
				});

				function sortComprator(event1, event2){
					var dateStr1 = $(event1).find('a').attr('jump_to');
					var dateStr2 = $(event2).find('a').attr('jump_to');
					var date1 = dateStr1 ? moment(dateStr1, "DD-MM-YYYY hh:mm") : moment(getCommonCalCtrl().getEvent($(event1).attr('event_id')).start_date);
					var date2 = dateStr2 ? moment(dateStr2, "DD-MM-YYYY hh:mm") : moment(getCommonCalCtrl().getEvent($(event2).attr('event_id')).start_date);
					return date1.isAfter(date2)? 1: -1;
				}
				calendarAccessibilityUtils.addShortcut('events','.cab_event', E, undefined, undefined, sortComprator);
				el.on('keydown','.cab_event', function(event){
					if(event.which == ENTER){
						event.stopPropagation();
					}
				});
			}
		};
	});
} (jQuery));