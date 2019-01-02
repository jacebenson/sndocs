var IncidentStateSNC = Class.create();

IncidentStateSNC.NEW                = "1";
IncidentStateSNC.IN_PROGRESS        = "2";
IncidentStateSNC.ACTIVE             = IncidentStateSNC.IN_PROGRESS;
IncidentStateSNC.ON_HOLD            = "3";
IncidentStateSNC.AWAITING_PROBLEM   = IncidentStateSNC.ON_HOLD;
IncidentStateSNC.AWAITING_USER_INFO = IncidentStateSNC.ON_HOLD;
IncidentStateSNC.AWAITING_EVIDENCE  = IncidentStateSNC.ON_HOLD;
IncidentStateSNC.RESOLVED           = "6";
IncidentStateSNC.CLOSED             = "7";
IncidentStateSNC.CANCELED           = "8";


IncidentStateSNC.prototype = {
    initialize: function() {
    },

    type: 'IncidentStateSNC'
};