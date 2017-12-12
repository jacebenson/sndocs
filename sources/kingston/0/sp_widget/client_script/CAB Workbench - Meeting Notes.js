function ($scope, SNAPI, TIME, runtimeState, $http, $interval, $timeout, $window, $log, $uibModal, modelUtil, spUtil, $element) {
	var c = this;
	var tinyMceEditor;
	$scope.notificationMsg = c.data.i18n.msgMeetingNotesSaved;
	$scope.isSharingNotesInProgress = false;
	$scope.showNotification = false;
	$scope.focusEditor = function () {
		if (tinyMceEditor && $scope.canEditMeetingNotes())
			tinyMceEditor.execCommand('mceFocus', false, 'cab_meeting_notes_txt');
	};
	var lastKeyupTime = 0;
	$scope.tinymceConfig = {
		menubar:false,
		theme:'modern',
		skin:'lightgray', //Heisenberg appears to be broken.
		plugins:[
		    'advlist lists link charmap anchor',
		    'searchreplace visualblocks code ',
		    'insertdatetime'
		],
		height: 500,
		toolbar:'styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link',
		toolbar_items_size:'small',
		statusbar:false,
		setup: function (editor) {
			tinyMceEditor = editor;
			editor.on("keyup", function(ed, l) {
				lastKeyupTime = Date.now();
			});
		}
	};

	var unwatchWorkingCopy //unmount for the working copy watcher
	var autosaveHttpPromise;
	var autosaveTimer, notificationTimer;
	var modalConfig = {
		animation: true,
		controller: "confirmSharing",
		templateUrl: "cab-sharenotes-confirmation"
	};


	function canEditMeetingNotes() {
		return runtimeState.isCABManager($window.NOW.user_id);
	}

	function debounceNotification() {
		// if the animation is already in Queue, it means auto save triggered again
		// so we need to show the notification some more time

		if(notificationTimer)
			$timeout.cancel(notificationTimer);

		notificationTimer = $timeout(function() {
			showAutoAgendaDecision = false;
			$scope.showNotification = false;
			notificationTimer = undefined;
			}, 2000);
	}

	function onFinalizeSaveNotes(args,isErrorCall) {
		autosaveHttpPromise = null;
		if(autosaveTimer) {
			$timeout.cancel(autosaveTimer);
			autosaveTimer = null;
		}

		if(!isErrorCall) {
			if(!notificationTimer) {
				$scope.notificationMsg = showAutoAgendaDecision ? c.data.i18n.msgSync: c.data.i18n.msgMeetingNotesSaved;
				$scope.showNotification = true;
				debounceNotification();
			}
			else
				debounceNotification();
		}
		/*
		case #1. before http call returns , user has typed more data.
		case #2. Due to network errors , we may not updated the notes content at backend.

		So if we call the "saveMeetingNotes" again, the above 2 cases get solved.
		we are giving some time . so that we don't hamper the browser.
		*/

		autosaveTimer = $timeout(function() {
			saveMeetingNotes();
		}, 1000, false);
	}

	function saveMeetingNotes() {

		var currentTime = Date.now();
		if( (currentTime - lastKeyupTime) < AUTO_SAVE_TIME) {
			$timeout.cancel(autosaveTimer);
			autosaveTimer = $timeout(saveMeetingNotes, AUTO_SAVE_TIME);
			return;
		}
		// Concurrent update.  Don't save.
		if ($scope.editor.concurrentUpdate)
			return;
		// already saving is in-progress, go back.
		if(autosaveHttpPromise)
			return;

		// No changes, don't save.
		if ($scope.editor.savedCopy == $scope.editor.workingCopy)
			return;

		var prevSaved = $scope.editor.savedCopy;
		$scope.editor.savedCopy = $scope.editor.workingCopy;
		// Push the saved copy to the server.
		var post = {'meeting_notes': $scope.editor.savedCopy};
		autosaveHttpPromise = $http.patch(SNAPI.SERVICE.TABLE + "cab_meeting/" + $scope.data.meetingId, post).then(
			onFinalizeSaveNotes,
			function(data) {
				$log.info("Failed save request, resetting savedCopy state");
				$scope.editor.savedCopy = prevSaved;
				onFinalizeSaveNotes(data, true);
			}
		);
	}


	function resetMeetingNotes() {
		$scope.editor = {
			'workingCopy': $scope.rs.cab_meeting.record.meeting_notes.display_value,
			'savedCopy':  $scope.rs.cab_meeting.record.meeting_notes.display_value,
			'concurrentUpdate': false,
			'autosave': true
		};
	}

	function clearAgendaDecisions() {

		c.server.get({
			"command": c.data.command.CLEAR_AGENDA_DECISIONS,
			"sys_id": c.data.meetingId
		}).then(function() {
			$scope.agendaDecisions = '';
		}, function(r) {
			$scope.agendaDecisions = '';
			modelUtil.failNicely(r);
		});

	}

	var syncTimer;
	$scope.agendaDecisions = '';
	var AUTO_DECISIONS_UPDATE_TIME = 3000;
	var AUTO_SAVE_TIME = 2000;
	var showAutoAgendaDecision = false;
	function syncAgendaDecisions() {
		if($scope.agendaDecisions.length == 0)
			return;
		syncTimer = undefined;
		if(!canEditMeetingNotes())
			return;
		var idleTime = Date.now() - lastKeyupTime;
		if(idleTime < AUTO_DECISIONS_UPDATE_TIME && $element.is(":visible")) {
			syncTimer = $timeout(syncAgendaDecisions, 1000);
			return;
		}
		lastKeyupTime = 0;
		showAutoAgendaDecision = true;
		$scope.notificationMsg = c.data.i18n.msgSync;
		try {
			$scope.editor.workingCopy = ($scope.editor.workingCopy || "") + $scope.agendaDecisions;
			tinyMceEditor.setContent($scope.editor.workingCopy);
			// this sets the cursor to end of the text.
			setTimeout(function() {
				tinyMceEditor.selection.select(tinyMceEditor.getBody(), true);
				tinyMceEditor.selection.collapse(false);
			}, 10);
		}catch(e) {
			$log.info("Agenda items upate error");
		}
		clearAgendaDecisions();
	}

	function onAutoAgendaDecisionChanged(newVal, oldVal) {
		if(newVal.value.length == 0) {
			$scope.agendaDecisions = '';
			return;
		}
		$scope.agendaDecisions = newVal.value;
		syncAgendaDecisions();
	}

	function setupNotesMgmt() {
		lastKeyupTime = 0;
		// If it's changed to a state where we can now edit the notes.
		if (canEditMeetingNotes()) {
			$scope.editor.savedCopy = $scope.editor.workingCopy = $scope.rs.cab_meeting.record.meeting_notes.display_value;
			syncAgendaDecisions();
			if (!unwatchWorkingCopy)
				unwatchWorkingCopy = $scope.$watch('editor.workingCopy',saveMeetingNotes);
		} else {

			if(autosaveTimer) {
				$timeout.cancel(autosaveTimer);
				autosaveTimer = null;
			}

			if (unwatchWorkingCopy) {
				unwatchWorkingCopy();
				unwatchWorkingCopy = null;
			}
		}
	}

	runtimeState.get(c.data.meetingId).then(function(rs) {
		$scope.rs = rs;
		resetMeetingNotes();
		setupNotesMgmt();
		if(runtimeState.isCABManagerDelegate($window.NOW.user_id) || canEditMeetingNotes()) {
			if(c.data.autoGenerateAgendaDecisions)
				$scope.$watch('rs.agenda_decisions_buffer', onAutoAgendaDecisionChanged);
			$scope.$watch('rs.host', setupNotesMgmt);
			$scope.$watch('rs.cab_meeting.record.cab_manager.value', setupNotesMgmt);
		}
	});

	$scope.canEditMeetingNotes = canEditMeetingNotes;
	$scope.saveMeetingNotes = saveMeetingNotes;

	$scope.shareMeetingNotes = function() {
		if (!canEditMeetingNotes())
			return;

		var modal = $uibModal.open(modalConfig);
		modal.result.then(function(){

			$scope.isSharingNotesInProgress = true;
				c.server.get({
					"command": c.data.command.SHARE,
					"sys_id": c.data.meetingId
				}).then(function() {
					spUtil.addInfoMessage('${Successfully shared notes to Attendees}');
					$scope.isSharingNotesInProgress = false;
				}, function(r) {
					$scope.isSharingNotesInProgress = false;
					modelUtil.failNicely(r);
				});

		}, null);
	};
}