function($scope, $rootScope, $timeout, spUtil, $location, $window, nowAttachmentHandler, snRecordWatcher, runtimeState, meetingAgenda, $log, go, CAB, $element) {
	var wChan, isEventDelegatorRegistered = false;
	var ctrl = this;
	var ENTER = 13;
	$scope.meetingFinished = false; // end_meeting is clicked manually
	$scope.agendaFinished = false; // finish is clicked after all agenda items are done
	$scope.currentItemOrLocalStateSelected = false; // we still want to see the pending agenda items form, even if meeting is finished, instead of the "finish message"
	$scope.meetingCancelled = false;

	$scope.openChangeRecord = function(sysId) {
		go.toChangeFormModal(sysId);
	};

	function buildTabbedSections() {
		var cabTabSections = {"Change" : []};
		var cabTabLabels = ["Change"];
		if ($scope.data.f && $scope.data.f._sections) {
			$scope.data.f._sections.forEach(function(section){
				if (!section.caption || section.caption=="") {
					cabTabSections["Change"].push(section);
					return;
				}
				if (!cabTabSections[section.caption])
					cabTabSections[section.caption] = [];
				cabTabSections[section.caption].push(section);
				if(cabTabLabels.indexOf(section.caption) == -1)
					cabTabLabels.push(section.caption);
			});
			$scope.data.f.cabTabSections = cabTabSections;
			$scope.data.f.cabTabLabels = cabTabLabels;

			//implemented for PRB1081223: edit button is not accessible using tab
			if (!isEventDelegatorRegistered) {
				isEventDelegatorRegistered = true;
				$timeout(function() {
					$element.on("click keydown",".form-modal-icon",function(event) {
						if (event.keyCode == ENTER || !event.keyCode) {
							$scope.openChangeRecord($scope.data.sys_id);
						}
					});
				});
			}
		}
	}

	function loadForm(table, sys_id) {
		var f = {};
		$scope.data.table = f.table = table;
		$scope.data.sys_id = f.sys_id = sys_id;
		f.view = $scope.data.view;
		return $scope.server.update().then(buildTabbedSections);
	}

	$scope.$on('spModel.fields.rendered', function() {
		if (ctrl.panels)
			ctrl.panels.removeClass('shift-out').addClass('shift-in');
		// This is CAB specific customization
		// form fields got rendered . so apply the fields values again
		// so autosize will set the height of the textarea.
			$scope.refreshFormTab();
	});

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		g_form = gFormInstance;
	});

	function failNicely(response) {
		$log.error("Failed data request");
		$log.error(response);
	}

	$scope.startMeeting = function() {
		runtimeState.startMeetingAndSelectNextAgenda();
	};

	$scope.endMeeting = function() {
		runtimeState.endMeeting();
	};

	function applyWatcherOnChangeRecord(curChangeRecordSysId) {
		if (wChan)
			wChan.unsubscribe();
		wChan = snRecordWatcher.initChannel("change_request", "sys_id=" + curChangeRecordSysId);
		wChan.subscribe(function(response) {
			loadForm("change_request", curChangeRecordSysId);
		});
	}

	function loadChangeRequestForm(agendaItemSysId) {
		if (agendaItemSysId && typeof agendaItemSysId !== 'undefined') {
			var agendaItem = meetingAgenda.getAgendaItem(agendaItemSysId);
			applyWatcherOnChangeRecord(agendaItem.task.value);
			$scope.currentItemOrLocalStateSelected = true;
			loadForm("change_request", agendaItem.task.value);
		}
	}

	runtimeState.get($scope.data.meetingId).then(function(rs) {
				var timeoutCode;
				$scope.rs = rs;
				meetingAgenda.get($scope.data.meetingId).then(function(agenda) {
					$scope.agenda = agenda;
					loadChangeRequestForm($scope.rs.current_agenda_item.value);
					$scope.$watch('rs.current_agenda_item.value', function() {
						if (!rs.current_agenda_item.value && !meetingAgenda.getNextPendingAgendaItem()) {
							$scope.agendaFinished = true;
							$scope.currentItemOrLocalStateSelected = false;
						}
						if (runtimeState.isViewingCurrent()) {
							loadChangeRequestForm($scope.rs.current_agenda_item.value);
						}
					});
					$scope.$watch('rs.localState.viewing', function() {
						var timeoutForAgendaItemAnimation = 350;  // since transition time for agenda-item = 0.3s
						clearTimeout(timeoutCode);
						timeoutCode = setTimeout(function() {
							loadChangeRequestForm($scope.rs.localState.viewing);
						},timeoutForAgendaItemAnimation);
					});
					$scope.$watch('rs.cab_meeting.record.state.value', function(recordState) {
						if (recordState == CAB.COMPLETE) {
							$scope.meetingFinished = true;
							$scope.currentItemOrLocalStateSelected = false;
						} else if (recordState == CAB.CANCELED) {
							$scope.meetingCancelled = true;
						}
					});
				},
				function(response) {
					failNicely(response);
				}
				);
			},
		function(response) {
			failNicely(response);
		}
	);

	$scope.isCABManager = function() {
		return runtimeState.isCABManager($window.NOW.user_id);
	};

	$scope.isMeetingInProgress = function() {
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return;
		return $scope.rs.cab_meeting.record.state.value == CAB.IN_PROGRESS;
	};

	$scope.isMeetingPending = function() {
		if (!$scope.rs || !$scope.rs.cab_meeting)
			return;
		return $scope.rs.cab_meeting.record.state.value == CAB.PENDING;
	};
/*
   This is CAB specific customization
   we are showing form fields in a tab control.
	 autosize for textarea will not take effect when element is in "inactive tab".
	 so whenever tab changes we are reapplying the value to fields. So that autosize
	 for textarea will set the height for element.
*/
	$scope.refreshFormTab = function() {
		if(!g_form)
			return;
		var tabSection = scope.data.f.cabTabSections[scope.activeChangeTabKey];
		if(!tabSection)
			return;
		for(var i = 0; i < tabSection.length;i++){
			if(!tabSection[i].columns)
				continue;
			for(var j = 0; j < tabSection[i].columns.length; j++) {
				var fields = tabSection[i].columns[j].fields;
				if(!fields || fields.length == 0)
					continue;
				for(var k = 0; k < fields.length; k++) {
					if(!fields[k].type)
						continue;

					var fName = fields[k].name;
					if(!scope.data.f._fields[fName])
						continue;
					if(scope.data.f._fields[fName].type != 'string')
						continue; // we are interested only textarea
					var fValue = scope.data.f._fields[fName].displayValue;
					// same vlaue will not work . because field is readonly
					// we can add '\n' to take effect and nothing goes wrong.
					g_form.setValue(fName, fValue + '\n');
				}
			}
		}
	};
}