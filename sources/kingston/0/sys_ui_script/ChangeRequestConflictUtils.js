function initializeConflictDetection() {
	ensureConflictInfoIsUptodate();
	
	var trackerId = $('tracker_id').value;
	if (trackerId != "") {
		runBackgroundPoll(trackerId);
		showProgressButton(true);
	}
	
	// Ensure the warning message and check conflicts button are
	// correctly shown/hidden (Poll every 2 seconds in case User has
	// cleared one of the 3 mandatory conflict detection fields)
	setInterval(updateWarningBoxAndConflictButton, 2000);
	
	setTimeout(function() {
		if (!g_form.isNewRecord() && ($('tracker_id').value != "")) {
			if (updateWarningBoxAndConflictButton()) {
				updateConflictStatus();
				refreshConflicts();
			}
		}
	}, 1000);
	
	$("conflict_action_run").observe("click", function(event) {
		event.stop();
		
		// If we have unfilled mandatory fields then do not progress
		if (!g_form.mandatoryCheck())
			return;
		
		if (g_form.isNewRecord() || g_form.modified){
			// Add a hidden parameter to indicate that the run conflict detection should be run after the form has saved
			var afterSaveURL = new GlideURL();
			if (g_form.isNewRecord())
				afterSaveURL.setFromString(g_form.getTableName() + '.do?sys_id=' + g_form.getUniqueValue());
			else
				afterSaveURL.setFromCurrent();
			
			addHidden(g_form.getFormElement(), 'sysparm_goto_url', afterSaveURL.getURL({"sysparm_run_conflict_detection" : true}));
			g_form.save();
		} else
		runConflictDetection();
	});
}
	
function ensureConflictInfoIsUptodate() {
	if ($('update_conflict_info').value == 'true') {
		var ga = new GlideAjax("ChangeConflictAJAXProcessor");
		ga.addParam('sysparm_name', 'getConflictData');
		ga.addParam('sysparm_change_id', g_form.getUniqueValue());
		ga.getXMLAnswer(function(answer) {
			var conflictInfo = answer.evalJSON();
			if ($('conflictDetectionStatus').visible())
				return;
			
			if (conflictInfo.conflictCount === 0) {
				g_form.setValue('conflict_status', 'No Conflict');
				g_form.hideErrorBox('conflict_status');
			} else {
				g_form.setValue('conflict_status', 'Conflict');
				g_form.hideErrorBox('conflict_status');
				g_form.showErrorBox('conflict_status', new GwtMessage().getMessage("Conflicts detected, see the Conflicts section below"));
			}
				
			updateConflictLastRun(conflictInfo.timestamp);
			refreshConflicts();
		});
	}
}

function runConflictDetection() {
	var dd = new GlideModal("simple_progress_viewer", true, "40em", "10.5em");
	dd.setTitle(new GwtMessage().getMessage("Checking conflicts"));
	dd.setPreference('sysparm_progress_name', "Conflict Checker");
	dd.setPreference("sysparm_renderer_expanded_levels", "0");
	dd.setPreference("sysparm_renderer_hide_drill_down", true);
	
	if ($('tracker_id').value == "") {
	dd.setPreference("sysparm_ajax_processor", "ChangeConflictAJAXProcessor");
	dd.setPreference("sysparm_sysid", g_form.getUniqueValue());
	} else
	dd.setPreference('sysparm_renderer_execution_id', $('tracker_id').value + "");
	
	dd.setPreference("sysparm_button_close", new GwtMessage().getMessage("Close"));
	
	dd.on("executionComplete", function(trackerObj) {
	receiveMessage(trackerObj);
	
	if (trackerObj.state == 4){
		var progressContainer = $("simple_progress_viewer");
		if (progressContainer)
			progressContainer.down("#container").innerHTML = $("conflict_canceled_progress_status").innerHTML;
	}

	var closeBtn = $("sysparm_button_close");
	if (closeBtn) {
		closeBtn.onclick = function() {
			showProgressButton(false);
			dd.destroy();
		};
	}
	
	var cancelButton = $('cancelButton');
	if (cancelButton)
		cancelButton.hide();
	
	var backgroundButton = $('runInBackgroundButton');
		if (backgroundButton)
			backgroundButton.hide();
	});
	
	dd.on("beforeclose", function() {
		runBackgroundPoll($('tracker_id').value);
	});
	
	dd.cancel = function() {
		cancelConflictDetection($('tracker_id').value);
	};
	
	dd.runInBackground = function() {
		runBackgroundPoll($('tracker_id').value);
		dd.destroy();
	};
	
	dd.on("renderStatus", function(trackerObj) {
		// Record the value of the tracker for future use
		$('tracker_id').value = trackerObj.sys_id;
	
		// Add the cancel button
		if (!dd.hasCancelButton){
			// Create a button that closes the dialog when it is clicked
			// (But continues to run conflict detection in the background)
			var button = new Element('button', {'id': 'cancelButton', 'class': 'btn btn-default', 'style': 'margin: 0px 4px 0px 4px;'});
			button.update(new GwtMessage().getMessage("Cancel"));
			button.observe("click", function(event) {
				dd.cancel();
			});
				
			// Add the button to the dialog and make a note of the fact that you added it
			var buttonPanel = $('buttonsPanel');
			buttonPanel.appendChild(button);
			dd.hasCancelButton = true;
		}
		
		// Add the Run in background button
		if (!dd.hasRunInBackgroundButton){
			// Create a button that closes the dialog when it is clicked
			// (But continues to run conflict detection in the background)
			var button = new Element('button', {'id': 'runInBackgroundButton', 'class': 'btn btn-primary', 'style': 'margin: 0px 4px 0px 4px;'});
			button.update(new GwtMessage().getMessage("Run in Background"));
			button.observe("click", function(event) {
				dd.runInBackground();
			});
			
			// Add the button to the dialog and make a note of the fact that you added it
			var buttonPanel = $('buttonsPanel');
			buttonPanel.appendChild(button);
			dd.hasRunInBackgroundButton = true;
		}
	});
		
	showProgressButton(true);
	dd.render();
}

function updateWarningBoxAndConflictButton() {
	// Get values of all fields to determine if conflict detection should be allowed or not
	var cmdbCi = g_form.getValue('cmdb_ci');
	var startDate = g_form.getValue('start_date');
	var endDate = g_form.getValue('end_date');
	var conflictMode = $('conflict_mode').value;
	var affectedItemCount = $('affected_item_count').value;
	
	// Get references to the two gui widgets you intend to enable/disable
	var warningBox = $('conflictDetectionStatus');
	var checkConflictsButton = $('conflict_action_run');
	
	// Case1: Basic Mode + Configuration Item + Planned Start Date + Planned End Date
	if (conflictMode == 'basic' && cmdbCi != '' && startDate != '' && endDate != '') {
		warningBox.hide();
		checkConflictsButton.enable();
		return true;
	}
	
	// Case2: Advanced Mode + Configuration Item + Planned Start Date + Planned End Date
	if (conflictMode == 'advanced' && cmdbCi != '' && startDate != '' && endDate != '') {
		warningBox.hide();
		checkConflictsButton.enable();
		return true;
	}
	
	// Case3: Advanced Mode + Affected Items + Planned Start Date + Planned End Date
	if (conflictMode == 'advanced' && parseInt(affectedItemCount) != 0 && startDate != '' && endDate != '') {
		warningBox.hide();
		checkConflictsButton.enable();
		return true;
	}
	
	// Default: Do not allow User to run conflict detection
	warningBox.show();
	checkConflictsButton.disable();
	return false;
}

function showProgressButton(boolValue) {
	if (boolValue) {
		$("conflict_run_state").value = "executing";
		$("conflict_action_run").innerHTML = new GwtMessage().getMessage("View Progress");
	} else {
		$("conflict_run_state").value = "ready";
		$("conflict_action_run").innerHTML = new GwtMessage().getMessage("Check Conflicts");
	}
}

function runBackgroundPoll(sysId) {
	if (sysId != "") {
		var ga = new GlideAjax('ChangeConflictAJAXProcessor');
		ga.addParam('sysparm_name', 'getTrackerRecord');
		ga.addParam('sysparm_tracker_id', sysId);
		ga.getXMLAnswer(function (answer){
			receiveMessage(answer.evalJSON());
		});
	}
}

function cancelConflictDetection(sysId) {
	if (sysId != "") {
		var ga = new GlideAjax('ChangeConflictAJAXProcessor');
		ga.addParam('sysparm_name', 'cancel');
		ga.addParam('sysparm_tracker_id', sysId);
		ga.getXML();
	}
}

function everyTenPercent(percent, handler) {
	this.data = this.data || [false, false, false, false, false, false, false, false, false, false, false];
	var slot = ((Math.round(percent / 10) * 10) / 10);
	if (this.data[slot])
		return;
	this.data[slot] = true;
	handler();
}

function refreshConflicts() {
	var conflictLists = GlideList2.getListsForTable("conflict");
	for (var i = 0; i < conflictLists.length; ++i)
		conflictLists[i].refresh();
}

function receiveMessage(tracker) {
	/**
	* 0 - Pending 1 - Running 2 - Successful 3 - Failed 4 - Cancelled
	*/
	if (tracker.state == 0 || tracker.state == 1) {
		everyTenPercent(tracker.percent_complete, refreshConflicts);
		$("conflict_status").update(new GwtMessage().getMessage("{0}% completed", tracker.percent_complete));
		setTimeout(function() {
			this.runBackgroundPoll($("tracker_id").value);
		}, 2000);
	} else {
		$("tracker_id").value = "";
		showProgressButton(false);
		
		switch (tracker.state - 0){
			case 2:
			refreshConflicts();
			updateConflictLastRun(tracker.timestamp);
			updateConflictStatus();
			$("conflict_status").update(new GwtMessage().getMessage("Completed"));
			break;
			case 3:
			case 4:
			deleteConflicts(tracker);
			break;
		}
		
		setTimeout(function() {
			$("conflict_status").update("");
		}, 5000);
	}
}

function deleteConflicts(trackerObj){
	if (trackerObj.state == 3)
		$("conflict_status").update(new GwtMessage().getMessage("Failed"));
	
	if (trackerObj.state == 4)
		$("conflict_status").update(new GwtMessage().getMessage("Canceled"));
	
	var ga = new GlideAjax('ChangeConflictAJAXProcessor');
	ga.addParam('sysparm_name', 'deleteConflicts');
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.getXML(function(){
		refreshConflicts();
		updateConflictLastRun("");
		g_form.setValue('conflict_status', 'Not Run');
		g_form.hideErrorBox('conflict_status');
	});
}

function updateConflictLastRun(timestamp) {
	// update the field which gets displayed when time displayed in 'calendar' or 'both' modes
	var conflictLastRunCalendar = $('sys_readonly.change_request.conflict_last_run');
	if (conflictLastRunCalendar)
		conflictLastRunCalendar.setValue(timestamp);
	
	// update the field which gets displayed when time displayed in 'timeAgo' mode
	var conflictLastRunTimeAgo = $('change_request.conflict_last_run.timeago');
	if (conflictLastRunTimeAgo)
		conflictLastRunTimeAgo.update(new GwtMessage().getMessage("Just now"));
}

function updateConflictStatus() {
	var conflictStatus = $('sys_readonly.change_request.conflict_status');
	var conflictLastRun = $('sys_readonly.change_request.conflict_last_run');
	var ga = new GlideAjax("ChangeConflictAJAXProcessor");
	ga.addParam('sysparm_name', 'getConflictData');
	ga.addParam('sysparm_change_id', g_form.getUniqueValue());
	ga.getXML(function(message) {
		var conflictInfo = message.responseXML.documentElement.getAttribute("answer").evalJSON();
		if (conflictInfo.conflictCount === 0) {
			if (conflictLastRun == '')
				g_form.setValue('conflict_status', 'Not Run');
			else {
				g_form.setValue('conflict_status', 'No Conflict');
				updateConflictLastRun(conflictInfo.timestamp);
			}
			g_form.hideErrorBox('conflict_status');
		} else {
			g_form.setValue('conflict_status', 'Conflict');
			g_form.hideErrorBox('conflict_status');
			g_form.showErrorBox('conflict_status', new GwtMessage().getMessage("Conflicts detected, see the Conflicts section below"));
			updateConflictLastRun(conflictInfo.timestamp);
		}
	});
}