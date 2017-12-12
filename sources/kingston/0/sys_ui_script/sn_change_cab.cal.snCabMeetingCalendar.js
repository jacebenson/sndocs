angular.module('sn.change_management.cab.calendar').directive('snCabMeetingCalendar', ['CAB', 'modelUtil', 'meetingCalendar', 'spUtil', 'getTemplateUrl', 'CalendarView', '$timeout', '$log', '$compile', '$document', 'filterFilter', '$window', '$location', 'isAccessibilityEnabled', function (CAB, modelUtil, meetingCalendar, spUtil, getTemplateUrl, CalendarView, $timeout, $log, $compile, $document, filterFilter, $window, $location, isAccessibilityEnabled) {
	return {
		restrict: 'E',
		scope: {
			timeformat: '<',
		},
		templateUrl: getTemplateUrl('cab_workbench_meeting_calendar.xml'),
		link: function ($scope, el, attrs, Ctrl) {
			var SPACE = 32;
			var ENTER = 13;
			var ESCAPE = 27;
			var TAB = 9;
			var popoverTimerPromise, resizeTimerPromise;
			var userTzName;
			var isA11yEnabled = isAccessibilityEnabled();
			var popoverScopes = [];
			var eventbarMap = {};
			var eventIndex = 0;
			var activePopoverId = "";
			function destroyPopoverScopes() {
				for (var i = 0; i < popoverScopes.length; i++)
					popoverScopes[i].$destroy();
				popoverScopes.length = 0;
				eventbarMap = {};
				eventIndex = 0;
			}

			function buildEventTemplate(meeting) {
				return "<span>" + meeting.name.value + "<br />" + meeting.manager.display_value + "</span>";
			}
				
			function meetingToEvent(meeting) {
				// Just incase start doesn't have a timezone, grab it here on each map.
				if (!userTzName && meeting.start.tz_name)
					userTzName = meeting.start.tz_name;
				
				return {
					id: meeting.sys_id.value,
					start_date: new Date(meeting.start.display_value_ms),
					end_date: new Date(meeting.end.display_value_ms),
					text: buildEventTemplate(meeting),
					meeting: meeting
				};
			}

			$scope.events = [];
			$scope.ready = false; // When this directive is rendered, it might be within ng-hide. Initing scheduler code then will render it collapsed.
			function renderPopoverEvent(container, ev, width, height, header_content, body_content, templates) {

				var $container = angular.element(container);
				$container.attr("tabindex", 0);
				eventIndex++;
				var eventKey = ev.id + "_" + eventIndex;
				var popoverScope = recompileEvent(container, eventKey);
				var html = "<div style='overflow: hidden; width: " + width + "px; height: "+ height +"px;' >";
				html += "<div class='dhx_event_move dhx_header' style='width:" + width + "'></div>";
				if ($scope.view != "day")
					html += "<div class='dhx_event_move dhx_title' style='width:" + width + "'>" + header_content + "</div>";

				html += "<div class='dhx_body' style='width:" + width + "'>" + body_content+ "</div>";
				html += "<div class='dhx_event_resize dhx_footer' style='width:" + width + "'></div>";
				html += "</div>";
				popoverScope.ev = ev;
				angular.element(container).append(($compile(html))(popoverScope));
				return true;
			}

			$scope.popoverTemplate = "cab_meeting_cal_popover";
			$scope.view = 'month';

			var myPlacement = "auto right";
			$scope.popoverPlacement = function() {
				return myPlacement;
			};

			$scope.config = {
				date: new Date(),
				viewTimeFormat: $scope.timeformat,
				multiDay: true,
				allTimed: true,
				allowCreate: false,
				allowResize: false,
				allowMoving: false,
				readOnly: true,
				supportedModes: [CalendarView.DAY, CalendarView.WEEK, CalendarView.MONTH],
				mode: CalendarView.MONTH,
				useSelectMenuSpace: true,
				renderEvent: renderPopoverEvent,
				timeoutToDisplay: 60000,
				templates: {
					event_class: function(start,end,ev) {
					    return "cab_event_class";
					},
					// Month view time.  Slight hack as the date starts a div, the text ends it.
					event_bar_date: function(start, end, ev, scheduler) {
						var html = "<b>" + (scheduler.date.date_to_str($scope.timeformat))(start) + "</b> ";
						return html;
					},
					event_bar_text: function(start, end, ev, scheduler) {
						return ev.text;
					},
					// Week/Day view header
					event_header: function(start, end, ev, scheduler) {
						var dateFormat = scheduler.date.date_to_str($scope.timeformat);
						if (scheduler.getState().mode == CalendarView.WEEK)
							return "<b>" + dateFormat(start) + " - " + dateFormat(end) +"</b> ";
						return "";
					}
				}
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

			$scope.onSchedulerResize = function(schedulerInstance){

				for(var p in eventbarMap) {
					if(eventbarMap[p]) {
						activePopoverId = p;
						break;
					}
				}

				destroyPopoverScopes();
				updateEvents();
			};

			function bindGlobalEvents(){
				$document.on("click", handleDocumentClickEvent);
				$document.on("keyup", handleEscape);
			}

			function unbindGlobalEvents(){
				$document.off("click", handleDocumentClickEvent);
				$document.off("keyup", handleEscape);
			}

			function clearPopovers(shiftFocus){
				unbindGlobalEvents();
				var eventKey = "";
				for(var p in eventbarMap){
					if(eventbarMap[p])
						eventKey = p;
					eventbarMap[p] = false;
				}

				if(!shiftFocus)
					return;
				if(eventKey.length == 0)
					return;

				var el = angular.element($document).find("#" + eventKey);

				if(el.length == 0)
					return;

				el.focus();
			}

			function handleEscape($event) {
				if($event.keyCode != ESCAPE)
					return;
				var shiftFocus = angular.element($event.target).closest(".popover").length != 0;
				$scope.$apply(function() {
					clearPopovers(shiftFocus);
				});
			}

			function handleDocumentClickEvent($event) {
				var $el = angular.element($event.target);
				// return if clicked on popover dialog.
				if($el.closest(".popover").length != 0 )
					return;
				$scope.$apply(function() {
					clearPopovers(false);
				});
			}

			$scope.$on("$destroy", function(){
				clearPopovers();
			});

			function togglePopover(eventKey) {
				var isOpen = !eventbarMap[eventKey];
				for(var p in eventbarMap)
					eventbarMap[p] = false;

				unbindGlobalEvents();
				eventbarMap[eventKey]= isOpen;
				if(!isOpen)
					return;
				if(popoverTimerPromise)
					$timeout.cancel(popoverTimerPromise);
				popoverTimerPromise = null;

				popoverTimerPromise = $timeout(function() {
					bindGlobalEvents();
					if(!isA11yEnabled)
						return;
					var elFocus = angular.element($document).find("#cab_event_dialog_" + eventKey);
					if(elFocus.length >= 1)
						elFocus.focus();
				}, 30, false);
			}

			$scope.isPopoverOpen = function(eventKey){
				if(typeof eventbarMap[eventKey] == 'undefined')
					eventbarMap[eventKey] = false;
				return eventbarMap[eventKey];
			};

			$scope.onPopoverEventClick = function($event, eventKey){
				togglePopover(eventKey);
			};

			function updateEvents(){
				if ($scope.view != CalendarView.MONTH)
					return;
				if(resizeTimerPromise)
					$timeout.cancel(resizeTimerPromise);
				resizeTimerPromise = undefined;
				resizeTimerPromise = $timeout(function() {
					var evEl = $document.find("div[event_id]");
					for (var i=0; i < evEl.length; i++)
						recompileEvent(evEl[i], $scope.events[i].id + "_" + i);
				}, 100, false);
			}

			function recompileEvent(el, eventKey) {

				var $container = angular.element(el);
				$container.attr("id", eventKey);
				$container.attr("uib-popover-template", "popoverTemplate");
				$container.attr("popover-placement", "{{popoverPlacement()}}");
				$container.attr("popover-trigger", "none");
				$container.attr("popover-is-open", "isPopoverOpen('" + eventKey + "')");
				$container.attr("ng-click", "onPopoverEventClick($event, '" +  eventKey  + "')");
				$container.attr("data-popover-index", eventKey);
				var popoverScope = $scope.$new();
				popoverScope.tabindex = $container.attr("tabindex");
				popoverScope.eventIndex = eventKey;
				popoverScope.cab_a11y = isA11yEnabled ? "cab_a11y" : "";
				popoverScope.ev = filterFilter($scope.events, {id: $container.attr("event_id")})[0];
				if(activePopoverId == eventKey) {
					eventbarMap[activePopoverId] = true;
					activePopoverId  = '';
				}else
					eventbarMap[eventKey] = false;
				popoverScopes.push(popoverScope);
				$compile($container)(popoverScope);
				return popoverScope;
			}

			$scope.onEventClick = function (eventId) {
				$window.location.href = spUtil.getHost() + $location.path() + '?id=' + CAB.WORKBENCH + '&sys_id=' + eventId;
			};
			$scope.onEventKeydown = function(event, eventId, elementId){
				if(event.which == ENTER){
					$window.location.href = spUtil.getHost() + $location.path() + '?id=' + CAB.WORKBENCH + '&sys_id=' + eventId;
				} else if(event.which == TAB){
					togglePopover(eventId);
					angular.element('#'+elementId).focus();
					event.preventDefault();
				}
			}

			$scope.onViewChange = function (view) {
				$scope.view = view;
				// Deal with placement of the popover in different views
				if (view == CalendarView.DAY)
					myPlacement = "auto top";
				else
					myPlacement = "auto right";

				destroyPopoverScopes();
			};

			$scope.onDateRangeChange = function() {
				destroyPopoverScopes();
			};

			$scope.fetchEvents = function (startDate, endDate) {
				// Start Date and endDate are in the forced users's timezone.  Need to adjust accordingly.
				var startMs = startDate.getTime() - modelUtil.getTzToLocalMSDiff(startDate.getTime(), userTzName);
				var endMs = endDate.getTime() - modelUtil.getTzToLocalMSDiff(endDate.getTime(), userTzName);

				meetingCalendar.getMeetingsBetween(startMs, endMs).then(
					function (meetings) {
						$scope.events = meetings.map(function (meeting) {
							return meetingToEvent(meeting);
						});
						//Funky. Should be bound to the render of the month view events.
						// Also destruction of popover scopes should be bound to the destruction of the event.
						updateEvents();
					});
				};

			el.on('keydown','.cab_event_class', function(event){
				if(event.which == ENTER){
					angular.element(event.target).click();
				}
			});

			}
		};
	}]);