var SLATimelineAPI = Class.create();
SLATimelineAPI.prototype = {
	 // sys_properties
	SLA_ENGINE_ASYNC: 'com.snc.sla.engine.async',
	SLA_TASK_SLA_CONTROLLER_LOG: 'com.snc.sla.task_sla_controller.log',
	SLA_TASK_SLA_CONTROLLER_TIMERS: 'com.snc.sla.task_sla_controller.timers',
	SLA_TASK_SLA_DEFAULT_CONDITIONCLASS: 'com.snc.sla.default_conditionclass',
	SLA_RETROACTIVE_PAUSE: 'com.snc.sla.retroactive_pause',
	SLA_DATABASE_LOG: 'com.snc.sla.log.destination',
	SLA_SERVICE_OFFERING: 'com.snc.service.offering.field',
	  // constants
	BASE_CONDITIONCLASSNAME: 'SLAConditionBase',

	SLA_SCHEDULE_SOURCE: 'com.snc.sla.schedule.source',
	SLA_TIMEZONE_SOURCE: 'com.snc.sla.timezone.source',
	// internal stage choice values
	STAGE_STARTING:    'starting',
	STATE_IN_PROGRESS : 'in_progress',
	STATE_PAUSED      : 'paused',
	STATE_CANCELLED   : 'cancelled',
	STATE_COMPLETED   : 'completed',

    initialize: function(slaGR, taskGR) {
		this.stateChanges = {};
		
		var taskTable;
		var slaTable;
		if (slaGR)
			slaTable = new TableUtils(slaGR.getRecordClassName());
		if (taskGR)
			taskTable = new TableUtils(taskGR.getRecordClassName());

		//task_sla record
		if (slaTable.getAbsoluteBase() == 'task_sla') {
			this.slaGR = slaGR.sla.getRefRecord();
			if(slaGR.task)
				this.taskGR = slaGR.task.getRefRecord();
			else if(taskTable && taskTable.getAbsoluteBase() == 'task')
				this.taskGR = taskGR;
			this.taskSLAgr = slaGR;
		}
		//task and sla records
		else if (slaTable.getAbsoluteBase() == 'contract_sla' &&
               taskTable && taskTable.getAbsoluteBase() == 'task') {
			this.slaGR = slaGR;
			this.taskGR = taskGR;
		}
		if (this.slaGR) {
			this.sv_offering = false;
			if (this.slaGR.isValidField('sys_class_name') && this.slaGR.getValue('sys_class_name')=='service_offering_sla')
				this.sv_offering = true;
			if(slaTable.getAbsoluteBase() == 'contract_sla')
				this._processNewSLA();
		}
		
		//Default Service Offering field
	    this.serviceOfferingField = gs.getProperty(this.SLA_SERVICE_OFFERING, 'cmdb_ci');
    },

	getScheduleGR : function(sla, task) {
		var contractSlaGR = new GlideRecord('contract_sla');
		if (!contractSlaGR.get(sla))
			return;
		
		var scheduleGR = new GlideRecord('cmn_schedule');
		var schSource = contractSlaGR.schedule_source + ''; // default value: 'sla.schedule', others: 'task.cmdb_ci.schedule'
		var tzSource = contractSlaGR.timezone_source + '';  // default value: 'task.caller_id.time_zone', others: various.. see SLATimezone.source()
		var gr = new GlideRecord('task_sla');
		gr.setValue('task',task);
		gr.setValue('sla',sla);
		var scheduleId = SLASchedule.source(schSource, gr);
		if (scheduleId)
			scheduleGR.get(scheduleId);
		var tz = SLATimezone.source(tzSource, gr);  // i.e. gr.task.caller_id.time_zone
		if (!tz)
			// explicitly use the system timezone, if an empty/NULL value was returned above
		tz = gs.getSysTimeZone();

		return new GlideSchedule(scheduleGR.sys_id,tz);
	},
	
	getServOfStatus: function(sla, task) {
		var soc = new GlideRecord("service_offering_commitment");
		if (!soc.isValid()|| !task.getValue(this.serviceOfferingField) )
			return false;
		soc.addQuery("service_commitment.type", "SLA");
		soc.addQuery("service_commitment.sla", sla.sys_id);
		soc.addQuery("service_offering", task.getValue(this.serviceOfferingField));
		soc.query();
		if (!soc.hasNext())
			return false;
		else
			return true;
	},

	_processNewSLA: function() {
		if(this._processNewSLA_criticalSection(this.slaGR, this.taskGR))
			this.taskSLAgr = this._checkNewSLA();
	},
	_checkNewSLA: function() {
		var task_sla = new GlideRecord("task_sla");
		task_sla.setValue("sla", this.slaGR.sys_id);
		var slac = this.newSLACondition(task_sla.sla, this.taskGR);
		var startMatches = slac.attach();

		this.stateChanges["attach"] = startMatches;

		if(!startMatches)
			return;
		var taskSLAgr = new GlideRecord("task_sla");
		taskSLAgr.sla = this.slaGR.sys_id;
		if(this.taskGR.sys_id)
			taskSLAgr.task = this.taskGR.sys_id;
		taskSLAgr.stage = this.STATE_IN_PROGRESS;
		return taskSLAgr;
	},
	//check whether to start a new sla, if not, return
	_processNewSLA_criticalSection : function(sla, task){
		if (sla.collection != task.getRecordClassName())
			return;
		if (!this._hasSLAContract(sla.collection))
			return;
		if (this.sv_offering)
			return this.getServOfStatus(sla, task);
		return true;
	},

	getTaskSLA: function(){
		return this.taskSLAgr;
	},
	
	getStateChanges: function() {
		return this.stateChanges;
	},
	
	setStateChanges: function(stateChanges) {
		if (!stateChanges)
			return;
		
		var currentStateChanges = this.getStateChanges();
		for (var stateChange in stateChanges)
			if (stateChange in currentStateChanges)
				currentStateChanges[stateChange] = stateChanges[stateChange];
	},
	
	getNewTaskSLA: function(){
		return this.newTaskSLAgr;
	},
	
	setProcessReset: function() {
		this.processReset = true;
	},
	
	getRelDurationEndDate: function(start_date, slaGR, task) {
		var dc = new DurationCalculator();

		//Retrieve record in case the GlideRecord passed in is a task record.
		var retrievedTask = new GlideRecord(task.getRecordClassName());
		if (retrievedTask.get(task.getUniqueValue())) {
			dc.setStartDateTime(start_date);
			if (slaGR.sla.schedule) 
				dc.setSchedule(slaGR.sla.schedule, slaGR.sla.timezone);
			  
			var ocurrent = null;
			if (typeof current !== 'undefined')
				ocurrent = current;

			 // Set "current" to point to either the "task_sla" record or the "table" record associated with the "SLA Definition"		  
			 if (slaGR.relative_duration_works_on == "SLA record")
				 current = slaGR;
			 else 
				 current = retrievedTask;

			 // Perform the relative calculation using the revised value of "current"
			 dc.calcRelativeDuration(slaGR.sla.duration_type);
         
			 // Reset "current" to point back to its original value 
			 if (ocurrent)
				 current = ocurrent;
		 }  

	     return dc.getEndDateTime();
	},

	
	
	_updateState : function(newState) {
		this.taskSLAgr.stage = newState;
	},

	//for sla contract add-on
	_hasSLAContract: function(classname) {
		var contractTables = gs.getProperty('com.snc.sla.contract.tables', '');
		if (!classname)
			classname = this.taskGR.getRecordClassName();
		var list = contractTables.replaceAll(' ', '').split(',');
		if (new ArrayUtil().contains(list, classname)) {
			var gr = new GlideRecord("contract_rel_contract_sla");
			gr.addQuery("contract",this.taskGR.contract);
			gr.addQuery("contract_sla",this.slaGR.sys_id);
			gr.query();
			if(gr.next())
				return true;
			return false;
		}
		return true;
	},

	checkExistingSLA : function(dur_retroactive) {
		if (!this._stopCancel(dur_retroactive))
			this._pauseUnpause();
	},

	_pauseUnpause: function() {
		// a "relative-duration" SLA cannot pause, whatever conditions might be in the SLA Definition record
		if (this.slaGR.duration_type != '')
			return false;

		var slac = this.newSLACondition(this.taskSLAgr.sla, this.taskGR);
		var pauseMatches = slac.pause();
		var resumeMatches = slac.resume();
		
		this.stateChanges["pause"] = pauseMatches;
		this.stateChanges["resume"] = resumeMatches;
		
        if (this.taskSLAgr.stage == this.STATE_IN_PROGRESS && pauseMatches && !resumeMatches)
			this._updateState(this.STATE_PAUSED);
		else if (this.taskSLAgr.stage == this.STATE_PAUSED && !pauseMatches && resumeMatches)
			this._updateState(this.STATE_IN_PROGRESS);
	},

	_stopCancel: function(dur_retroactive) {
		var slac = this.newSLACondition(this.taskSLAgr.sla, this.taskGR);
		var completeMatches = slac.complete();
		this.stateChanges["complete"] = completeMatches;

		var resetMatches = false;
        if (!this.processReset) {
			resetMatches = slac.reattach(this.sla);
			this.stateChanges["reattach"] = resetMatches;
		} else
			this.stateChanges["reattach"] = true;
		
        if ((completeMatches || resetMatches) && !dur_retroactive) {
			this._updateState(this.STATE_COMPLETED);
         // Re-evaluate conditions for this specific taskSLA,
         //      to allow a 'Complete and reapply' mode of operation
            if (resetMatches && !dur_retroactive) {
                var newTaskSLA = this._checkNewSLA();
				// and just in case it should need to transition to Paused state immediately upon creation
				// make sure the "updateTime" is correct as it may not be if we've been doing a retroactive calculation
				this.newTaskSLAgr = newTaskSLA;
			 }
			 return true; // state was changed
        } else {
            var cancelMatches = slac.cancel();
			this.stateChanges["cancel"] = cancelMatches;
            if (cancelMatches && !dur_retroactive) {
				this._updateState(this.STATE_CANCELLED);
				return true; // state was changed
			}
		}
		
		return false;
	},
	/*
	get current sla class
	 */
	newSLACondition: function(slaGR, taskGR) {
		// Use the same class, as default, during any one instance of the TaskSLAController
		if (!this._outerScope)
			this._outerScope = JSUtil.getGlobal();
		if (!this._SLADefaultConditionClass) {
			this._SLADefaultConditionClass = this._outerScope[this.SLADefaultConditionClassName];
			// check that this._SLADefaultConditionClass is defined, and looks valid as an SLA Condition Class
			if (!this._isValidSLAConditionClass(this._SLADefaultConditionClass)) {
				this._SLADefaultConditionClass = this._outerScope[this.BASE_CONDITIONCLASSNAME];
				this.SLADefaultConditionClassName = this.BASE_CONDITIONCLASSNAME;
			}
		}

		var slaConditionClass = this._SLADefaultConditionClass;
		// if the SLA Definition references a specific Condition Class then use that
		// (as long as it looks valid)
		if (JSUtil.notNil(slaGR.condition_class) && slaGR.condition_class.active) {
			slaConditionClass = this._outerScope[slaGR.condition_class.class_name.name];

			if (!this._isValidSLAConditionClass(slaConditionClass)) {
				slaConditionClass = this._SLADefaultConditionClass;
			}
		}
		var sco = new slaConditionClass(slaGR, taskGR);
		return sco;
	},
	// does klass look valid as an SLAConditionClass?
	_isValidSLAConditionClass: function(klass) {
		if (typeof klass == 'undefined')
			return false;

		var conditionMethods = ['attach', 'pause', 'complete', 'reattach', 'cancel'];
		for (var i = 0; i < conditionMethods.length; i++)
			if (typeof klass.prototype[conditionMethods[i]] == 'undefined')
			return false;
		return true;
	},

    type: 'SLATimelineAPI'
};