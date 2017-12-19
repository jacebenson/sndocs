var ReadOnlyTaskSLAControllerSNC = Class.create();
ReadOnlyTaskSLAControllerSNC.prototype = Object.extendsObject(TaskSLAController, {
	ATTR_SYS_ID: 'sys_id',
	ATTR_SYS_CREATED_ON: 'sys_created_on',

	initialize: function() {
		TaskSLAController.prototype.initialize.call(this);
		this.slaUtil = new SLAUtilSNC();
	},

	initNewTaskSLA: function(taskGr, contractSLAGr, taskUpdatesGrFromHistory) {
		if (!this._checkIfContractSLAIsAvailableToTaskDomain(contractSLAGr, taskGr))
			return;

		this.setTaskGR(taskGr);
		var slac = this._newSLACondition(contractSLAGr, taskGr);
		var startMatches = slac.attach();
		if (!startMatches)
			return;
		var taskSLAParams = {
			dryRun: true
		};
		var taskSLA = new TaskSLA(contractSLAGr, taskGr, true, taskSLAParams);
		taskSLA.currentStage = taskSLA.STAGE_STARTING;
		taskSLA.taskSLAgr.duration = new GlideDuration(0);
		taskSLA.taskSLAgr.business_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.pause_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.business_pause_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.sys_created_on = taskGr.sys_updated_on;
		taskSLA.taskSLAgr.sys_domain = taskGr.sys_domain;
		//check for retroactive pause time
		if (contractSLAGr.retroactive && contractSLAGr.retroactive_pause) {
			this._adjustPauseFromHistory(taskUpdatesGrFromHistory, taskSLA, taskGr, contractSLAGr);
			this.setTaskGR(taskGr);
		}
		taskSLA.setUpdateTime(taskGr.sys_updated_on);
		taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);

		//Check if pause is met for current time.
		this._pauseUnpause(taskSLA);
		if (taskSLA.taskSLAgr.stage != taskSLA.STAGE_PAUSED)
			taskSLA._calculate(true, taskSLA.updateTime);

		return taskSLA;
	},

	updateTaskSLA: function(taskGr, taskSLA, contractSLAGr) {
		this.setTaskGR(taskGr);
		var slaIsRetroactive = contractSLAGr.retroactive;
		taskSLA.setUpdateTime(taskGr.sys_updated_on);
		if ((!slaIsRetroactive && taskGr.sys_updated_on >= taskSLA.taskSLAgr.start_time) || (
				slaIsRetroactive)) {
			if (!this._stopCancel(taskSLA, true)) {
				this._pauseUnpause(taskSLA);
			}
			//Re-Calculate end times after change of stage
			if (taskSLA.taskSLAgr.stage != taskSLA.STAGE_PAUSED)
				taskSLA._calculate(true, taskSLA.updateTime);

		}
		return taskSLA;
	},

	copyTaskSLA: function(contractSLAGr, taskGr, taskSLAgrToCopy, retroactivePauseDataListToCopy) {
		var taskSLA = new TaskSLA(contractSLAGr, taskGr, true, {
			dryRun: true
		});
		taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
		taskSLA.taskSLAgr = taskSLAgrToCopy;
		taskSLA.retroactivePauseDataList = retroactivePauseDataListToCopy;
		return taskSLA;
	},

	_checkIfContractSLAIsAvailableToTaskDomain: function(contractSLAGrToTest, taskGr) {
		var contractSLAGr = new GlideRecord(contractSLAGrToTest.getRecordClassName());
		contractSLAGr.addDomainQuery(taskGr);
		contractSLAGr.addQuery(this.ATTR_SYS_ID, contractSLAGrToTest.getUniqueValue());
		contractSLAGr.addNotNullQuery(this.ATTR_SYS_CREATED_ON);
		contractSLAGr.query();
		if (contractSLAGr.next())
			return true;

		return false;
	},

	_adjustPauseFromHistory: function(taskUpdatesGrFromHistory, taskSLA, taskGr, contractSLAGr) {
		var i = 0;
		var retroactivePauseDataList = [];
		taskSLA.setUpdateTime(taskUpdatesGrFromHistory[0].sys_updated_on);
		taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
		var prevStage = taskSLA.STAGE_IN_PROGRESS;
		var currStage = taskSLA.STAGE_IN_PROGRESS;
		var retroactivePauseData = {};
		while(i < (taskUpdatesGrFromHistory.length - 1) && taskUpdatesGrFromHistory[i].sys_updated_on < taskGr.sys_updated_on && taskGr.sys_updated_on >= taskSLA.taskSLAgr.start_time) {
			taskSLA.setUpdateTime(taskUpdatesGrFromHistory[i].sys_updated_on);
			this.setTaskGR(taskUpdatesGrFromHistory[i]);
			prevStage = '' + taskSLA.getGlideRecord().stage;
			taskSLA.getGlideRecord().sys_updated_on = taskUpdatesGrFromHistory[i].sys_updated_on;
			this._pauseUnpause(taskSLA);
			//Re-Calculate end times after change of stage
			if (taskSLA.taskSLAgr.stage != taskSLA.STAGE_PAUSED)
				taskSLA._calculate(true, taskSLA.updateTime);

			var taskSLAGr = taskSLA.getGlideRecord();
			currStage = taskSLAGr.stage;
			if ((prevStage == taskSLA.STAGE_PAUSED || currStage == taskSLA.STAGE_PAUSED) && currStage != prevStage) {
				retroactivePauseData = {
					responsibleTaskGr: this.slaUtil.copyGlideRecord(taskUpdatesGrFromHistory[i]),
					taskSLAGr: this.slaUtil.copyGlideRecord(taskSLA.getGlideRecord())
				};
				//Record if exiting or entering pause
				retroactivePauseDataList.push(retroactivePauseData);
			}
			i++;
		}
		taskSLA.retroactivePauseDataList = retroactivePauseDataList;
	},

	type: 'ReadOnlyTaskSLAControllerSNC'
});