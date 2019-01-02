var IncidentState = Class.create();

IncidentState.NEW                = IncidentStateSNC.NEW;
IncidentState.IN_PROGRESS        = IncidentStateSNC.IN_PROGRESS;
IncidentState.ACTIVE             = IncidentStateSNC.ACTIVE;
IncidentState.ON_HOLD            = IncidentStateSNC.ON_HOLD;
IncidentState.AWAITING_PROBLEM   = IncidentStateSNC.AWAITING_PROBLEM;
IncidentState.AWAITING_USER_INFO = IncidentStateSNC.AWAITING_USER_INFO;
IncidentState.AWAITING_EVIDENCE  = IncidentStateSNC.AWAITING_EVIDENCE;
IncidentState.RESOLVED           = IncidentStateSNC.RESOLVED;
IncidentState.CLOSED             = IncidentStateSNC.CLOSED;
IncidentState.CANCELED           = IncidentStateSNC.CANCELED;

IncidentState.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getIncidentState: function() {
		return new JSON().encode(IncidentState);
	},

    type: 'IncidentState'
});