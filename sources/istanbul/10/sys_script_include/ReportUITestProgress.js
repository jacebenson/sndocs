function TestResultResponse(status, message) {
	this.status = status;
	this.message = message;
}
var GLIDE_SYSTEM_FORMAT_FOR_ATF = "yyyy-MM-dd HH:mm:ss";

var ReportUITestProgress = Class.create();
ReportUITestProgress.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	reportStepProgress: function() {
		var batch_tracker_sys_id = this.getParameter('sysparm_batch_execution_tracker_sys_id');
		var batch_length = this.getParameter('sysparm_batch_length');
		var next_step_index = this.getParameter('sysparm_next_step_index');
		var step_result = this.getParameter('sysparm_step_result');
		var test_result_id = this.getParameter('sysparm_test_result_sys_id');

		gs.debug("Reporting step progress");
		gs.debug("batch_tracker_sys_id " + batch_tracker_sys_id);
		gs.debug("next_step_index " + next_step_index);
		gs.debug("batch_length " + batch_length);

		//save the step result
		var success = false;
		var stepResult = JSON.parse(step_result);
		var stepResultGR = this._findResultItemRecord(test_result_id, stepResult.sys_atf_step_sys_id);
		if(gs.nil(stepResultGR) || !stepResultGR.isValidRecord()) {
			success = false;
			gs.warn("Unable to find item record with: result sys_id: " + test_result_id + ", step sys_id: " + stepResult.sys_atf_step_sys_id);
		} else {
			this._populateTestResultItem(stepResultGR, stepResult, test_result_id, "step_result", stepResult.message);
			if(!stepResultGR.update()){
				gs.warn("failed to update item record with: sys_id: " + stepResultGR.sys_id);
				success = false;
			} else {
				success = true;
			}
		}
		
		// init response
		var response = {};
		response.cancel_request_received = false;
		response.report_step_progress_success = success;

		// check if the batch tracker receives cancel request
		if (sn_atf.ATFTrackerUtil.batchTrackerReceivesCancelRequest(batch_tracker_sys_id)) {
			response.cancel_request_received = true;
			return JSON.stringify(response);
		}
		
		if (success && next_step_index <= batch_length) {
			//a step is done, update the tracker to say it is running the next one
			response.report_step_progress_success = sn_atf.ATFTrackerUtil.reportStepProgress(batch_tracker_sys_id, next_step_index, batch_length);
		}
		
		return JSON.stringify(response);
	},

	_logAndFormatError: function (message){
		gs.error("Returning due to error: {0}", message);
		return JSON.stringify(new TestResultResponse("error", message));
	},

	reportBatchResult: function() {
		var sysAtfTestResultSysId = this.getParameter('sysparm_test_result_sys_id');
		var test_result = this.getParameter('sysparm_test_result');
		var batch_tracker_sys_id = this.getParameter('sysparm_batch_tracker_sys_id');
		var isTestDebugEnabled = sn_atf.AutomatedTestingFramework.isDebugEnabled();

		gs.debug("Processing Batch Result for Test Result sys_id: " + sysAtfTestResultSysId);
		gs.debug("batch_tracker_sys_id " + batch_tracker_sys_id);

		if (!sysAtfTestResultSysId)
			return this._logAndFormatError("missing test_result_sys_id");

		if (!test_result)
			return this._logAndFormatError("missing test_result data");

		// sys_atf_test_result record to update
		var gr = new GlideRecord("sys_atf_test_result");
		if (!gr.get(sysAtfTestResultSysId))
			return this._logAndFormatError("ReportUITestProgress: failed to find sys_atf_test_result record by id: " + sysAtfTestResultSysId);

		// set test result payload, if debug is enabled.
		if(isTestDebugEnabled){
			// This is just a batch so append to the existing value if there is one
			if (gs.nil(gr.test_result_json))
				gr.test_result_json = '"frontendTest" : ' + test_result;
			else
				gr.test_result_json = gr.test_result_json + ', \n "frontendTest" : ' + test_result;
		}

		var testResultObject = JSON.parse(test_result);

		// append user agent string if it's unique
		if (gs.nil(gr.user_agents))
			gr.user_agents = testResultObject.userAgent;
		else if (gr.user_agents.indexOf(testResultObject.userAgent) === -1)
			gr.user_agents = gr.user_agents + ',\n' + testResultObject.userAgent;

		if (!gr.update())
			return this._logAndFormatError("failed to update test result");

		if(!this._processResultItems(sysAtfTestResultSysId, testResultObject))
			return this._logAndFormatError("Failed to create or update one or more result item records.");

		var isSuccess = (!testResultObject.hasFailure);

		gs.debug("testResultObject.isCanceled: " + testResultObject.isCanceled);
		gs.debug("testResultObject.hasFailure: " + testResultObject.hasFailure);
		gs.debug("test result is success: " + isSuccess);

		if (testResultObject.isCanceled)
			sn_atf.ATFTrackerUtil.cancelTracker(batch_tracker_sys_id);
		else if (isSuccess)
			sn_atf.ATFTrackerUtil.successTracker(batch_tracker_sys_id);
		else
			sn_atf.ATFTrackerUtil.failTracker(batch_tracker_sys_id);

		return JSON.stringify(new TestResultResponse("success", sysAtfTestResultSysId));
	},

	_findResultItemRecord: function(sysAtfTestResultSysId, stepSysId) {
		var testResultItemGR = new GlideRecord("sys_atf_test_result_step");
		testResultItemGR.addQuery("test_result", sysAtfTestResultSysId);
		testResultItemGR.addQuery("step", stepSysId);
		testResultItemGR.query();
		if(!testResultItemGR.next())
			return null;

		return testResultItemGR;
	},

	_processResultItems: function(sysAtfTestResultSysId, /*test result json object*/ testResultObject) {
		var savedLogsOK = this._saveStepEvents(sysAtfTestResultSysId, testResultObject.consoleLogs);
		var savedAlertsOK = this._saveStepEvents(sysAtfTestResultSysId, testResultObject.uiNotifications);
		var savedErrorsOK = this._saveStepEvents(sysAtfTestResultSysId, testResultObject.consoleErrors);

		return savedLogsOK && savedAlertsOK && savedErrorsOK;
	},

	/**
     * persist all events of an event type that occurred during the current step
     */
	_saveStepEvents: function(sysAtfTestResultSysId, /*StepEvent*/ items) {
		var success = true;
		for(var i=0; i < items.length; i++){
			var item = items[i];

			var itemEventGR = new GlideRecord("sys_atf_test_result_item");
			this._populateTestResultItem(itemEventGR, item, sysAtfTestResultSysId, item.type, item.object);

			if(!itemEventGR.insert()){
				gs.warn("failed to update item record for alert: " + item.object);
				success = false;
			}
		}
		return success;
	},

	_populateTestResultItem: function(itemGR, item, sysAtfTestResultSysId, type, output) {
          itemGR.test_result = sysAtfTestResultSysId;
          itemGR.type = type;
          itemGR.output = output;
          
          if (itemGR.getRecordClassName() == 'sys_atf_test_result_step')
          	this._updateOutputVars(itemGR, item);

          if (GlideStringUtil.notNil(item.status))
              itemGR.status = item.status;

          // set start and end times in UTC (incoming values are UTC, store as UTC)
          var gdtStartTimeEvent = new GlideDateTime();
          var gdtEndTimeEvent = new GlideDateTime();

		if (!gs.nil(item.start_time)) {
          gdtStartTimeEvent.setValueUTC(item.start_time, GLIDE_SYSTEM_FORMAT_FOR_ATF);
          itemGR.setValue("start_time", gdtStartTimeEvent.getValue());
		}
	
		if (!gs.nil(item.end_time)) {
          gdtEndTimeEvent.setValueUTC(item.end_time, GLIDE_SYSTEM_FORMAT_FOR_ATF);
          itemGR.setValue("end_time", gdtEndTimeEvent.getValue());
		}

          var duration = GlideDateTime.subtract(gdtStartTimeEvent, gdtEndTimeEvent);
          itemGR.setValue("run_time", duration.getDurationValue());
	},

	_updateOutputVars: function(stepResultGR, item) {
		var outputs = stepResultGR.outputs;
		var names = outputs.getVariableNames();
	    for (var i=0; i<names.length; i++) {
	    	if (names[i] in item.outputs) {
	    		outputs[names[i]] = item.outputs[names[i]];
	    	}
	    }
	},
	
	type: 'ReportUITestProgress'
});