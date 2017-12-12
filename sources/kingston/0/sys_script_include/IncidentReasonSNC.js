var IncidentReasonSNC = Class.create();

IncidentReasonSNC.AWAITING_CALLER   = "1";
IncidentReasonSNC.AWAITING_EVIDENCE = IncidentReasonSNC.AWAITING_CALLER;
IncidentReasonSNC.AWAITING_PROBLEM  = "3";
IncidentReasonSNC.AWAITING_VENDOR   = "4";
IncidentReasonSNC.AWAITING_CHANGE   = "5";

IncidentReasonSNC.prototype = {
    initialize: function() {
    },

    type: 'IncidentReasonSNC'
};