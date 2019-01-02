var IncidentReason = Class.create();

IncidentReason.AWAITING_CALLER   = IncidentReasonSNC.AWAITING_CALLER;
IncidentReason.AWAITING_EVIDENCE = IncidentReasonSNC.AWAITING_EVIDENCE;
IncidentReason.AWAITING_PROBLEM  = IncidentReasonSNC.AWAITING_PROBLEM;
IncidentReason.AWAITING_VENDOR   = IncidentReasonSNC.AWAITING_VENDOR;
IncidentReason.AWAITING_CHANGE   = IncidentReasonSNC.AWAITING_CHANGE;

IncidentReason.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getIncidentReason: function() {
		return new JSON().encode(IncidentReason);
	},

    type: 'IncidentReason'
});