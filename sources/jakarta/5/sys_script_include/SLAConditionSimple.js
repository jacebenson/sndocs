var SLAConditionSimple = Class.create();

SLAConditionSimple.prototype = Object.extendsObject(SLAConditionBase, {
	
	// start if start_condition is true
	// (without testing stop_condition)
	attach: function() {
		this.lu.logInfo('SLAConditionSimple.attach called');
		return this._conditionMatches(this.sla.start_condition);
	},
	
	// reattach if reset_condition is true
	// (without testing start_condition)
	reattach: function() {
		this.lu.logInfo('SLAConditionSimple.reattach called');
		return this._conditionMatches(this.sla.reset_condition);
	},
	
	// cancel only if the attach (start_condition) is false *and* we're not paused
	// or if the task is switched to a different CI from the existing active service-offering SLA
	// (NB. tested after, and only if (complete() || reattach()) is false)
	cancel: function() {
		this.lu.logInfo('SLAConditionSimple.cancel called');
		return ((!this.attach() && !this.pause()) || this._cancelServiceOffering());
	},
	
	type: 'SLAConditionSimple'
	
});