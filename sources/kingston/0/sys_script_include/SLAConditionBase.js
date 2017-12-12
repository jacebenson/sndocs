var SLAConditionBase = Class.create();

SLAConditionBase.prototype = {
	initialize : function(slaGR, taskGR, taskSLAgr) {
		this.lu = new GSLog(this.SLA_CONDITION_LOG, this.type);
		this.lu.includeTimestamp();
		if (gs.getProperty(this.SLA_DATABASE_LOG, "db") == "node")
			this.lu.disableDatabaseLogs();
		
		if (slaGR && slaGR instanceof GlideElementReference) {
			this.sla = new GlideRecord("contract_sla");
			this.sla.addDomainQuery(taskGR);
			this.sla.get("" + slaGR);
		} else
			this.sla = slaGR;
		
		this.task = taskGR;
		this.taskSLA = taskSLAgr;
		
		this.caseSensitiveConditions = (gs.getProperty(this.SLA_CONDITION_CASE_SENSITIVE, 'false') == 'true');

		this.slaContractUtil = new SLAContractUtil();

		// if enable logging has been checked on the SLA definition up the log level to "debug"
		if (this.sla && this.sla.enable_logging)
			this.lu.setLevel(GSLog.DEBUG);
		
		// debug, etc
		this.timers = (gs.getProperty(this.SLA_CONDITION_TIMERS, 'false') == 'true');
		if (this.timers)
			this.sw = new GlideStopWatch();
	},
	
	SLA_CONDITION_LOG: 'com.snc.sla.condition.log',
	SLA_CONDITION_CASE_SENSITIVE: 'com.snc.sla.condition.case_sensitive',
	SLA_CONDITION_TIMERS: 'com.snc.sla.condition.timers',
	SLA_DATABASE_LOG: 'com.snc.sla.log.destination',
	SLA_SERVICE_OFFERING: 'com.snc.service.offering.field',
	
	ON_CONDITION: "on_condition",
	NO_MATCH: "no_match",
	NEVER: "never",
	
	// True if an instance of this SLA should be attached and started
	attach: function() {
		if (!this._conditionMatches(this.sla.start_condition))
			return false;
		return (!this.complete() && !this.cancel()); // don't start, if completion (stop) condition is also true
	},
	
	// True if an instance of this SLA should be paused.
	pause: function() {
		return (this._conditionMatches(this.sla.pause_condition));
	},
	
	resume: function() {
		// Only use the condition to resume if when to resume is on_consition.  All other cases, default to original behaviour
		if (this.sla.when_to_resume + "" == this.ON_CONDITION)
			return this._conditionMatches(this.sla.resume_condition);
		
		return !this._conditionMatches(this.sla.pause_condition);
	},
	
	// True if an instance of this SLA should be completed.
	complete: function() {
		// XXX: what happens if there isn't a stop_condition? Should we default to stopping when the task goes inactive?
		return (this._conditionMatches(this.sla.stop_condition));
	},
	
	// True if an instance of this SLA should be completed and a new one started
	reattach : function(newSLADefIds) {
		return (this._conditionMatches(this.sla.reset_condition) &&
		this.attach() && !this._slaAlreadyCreated(newSLADefIds, this.sla.sys_id + ''));
	},
	
	// True if an instance of this SLA should be cancelled
	// (tested after, and only if (complete() || reattach()) is false)
	cancel: function() {
		if (this.sla.when_to_cancel + "" == this.NEVER)
			return false;
		
		// If when_to_cancel is on_condition, use the cancel condition.  All other cases default to original behaviour
		var cancelMatch = false;
		if (this.sla.when_to_cancel + "" == this.ON_CONDITION)
			cancelMatch = this._conditionMatches(this.sla.cancel_condition);
		else
			cancelMatch = !(this._conditionMatches(this.sla.start_condition) && !this._conditionMatches(this.sla.stop_condition));
		
		if (!this.slaContractUtil.ignoreContract(this.task.getRecordClassName()))
			cancelMatch = cancelMatch || this._cancelContractSLA();
		
		// cancel if the attach (start) condition is no longer true
		// or if the CI has changed
		return (cancelMatch || this._cancelServiceOffering());
	},
	
	// true if the contract attached to task is changed, as the SLA's attached to the contract will be different
	_cancelContractSLA: function() {
		// Check whether processing non-contractual SLAs when task SLA does not have attached contract
		var contractGR = this.task.contract;
		if (!this.slaContractUtil.slaHasContract(this.sla.sys_id)){
			if ((this.task.getValue('contract') == null && !this.slaContractUtil.hasContractProperty()) // not cancel if task doesn't have contract either (for non-legacy instances having the contract table property)
				|| this.slaContractUtil.processNonContractualSLAs(contractGR)) // or if task attached to contract allows non-contractual SLAs
				return false;
		}
		// if task SLA has contract, check it is still the same contract as the task
		if (this.slaContractUtil.isContractAttachedToSLA(contractGR.sys_id, this.sla.sys_id))
			return false;

		this.lu.logInfo("canceling Contract SLA: " + this.sla.name + " - task is now against different contract");
		return true;
	},
	///////////
	
	// True if the task is switched to a different CI from the existing active service-offering SLA
	_cancelServiceOffering: function() {
		var soc = new GlideRecord("service_offering_commitment");
		if (!soc.isValid())
			return false;
		
		if (this.sla.sys_class_name != "service_offering_sla")
			return false;
		
		var serviceOfferingField = gs.getProperty(this.SLA_SERVICE_OFFERING, 'cmdb_ci');
		
		soc.addQuery("service_commitment.type", "SLA");
		soc.addQuery("service_commitment.sla", this.sla.sys_id + '');
		soc.addQuery("service_offering", this.task.getValue(serviceOfferingField));
		soc.query();		
		if (soc.hasNext())
			return false;
		
		this.lu.logInfo("canceling Service Offering SLA: " + this.sla.name + " - task is now against different CI");
		return true;
	},
	
	// true only if condition exists and matches, for this.task
	_conditionMatches: function(condition) {
		if (!condition)
			return false;
		var sw;
		if (this.timers)
			sw = new GlideStopWatch();
		
		var value;
		try {
			value = SNC.Filter.checkRecord(this.task, "" + condition, true, this.caseSensitiveConditions);
		}
		catch (e) {
			this.lu.logNotice('_conditionMatches: [' + condition + '] caught exception ' + e);
		}
		this.lu.logDebug('_conditionMatches: [' + condition + '] on ' + this.task.number + ' [' + this.task.sys_id +'] => ' + value);
		if (this.timers) {
			sw.log('_conditionMatches complete');
			this.sw.log('SLAConditionBase complete');
		}
		return value;
	},
	
	// true if in the same process already created an SLA instance which would
	// now be completed, followed by another SLA instance being created
	_slaAlreadyCreated : function(newSLADefIds, slaDefId) {
		var slaAlreadyCreated = false;
		if (JSUtil.notNil(newSLADefIds) && JSUtil.notNil(slaDefId)) {
			slaAlreadyCreated = (newSLADefIds.join().indexOf(slaDefId) > -1);
		}
		return slaAlreadyCreated;
	},
	
	type: 'SLAConditionBase'
};