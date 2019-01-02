var IncidentReasonSNC = Class.create();

IncidentReasonSNC.AWAITING_CALLER   = "1";
IncidentReasonSNC.AWAITING_EVIDENCE = "2";
IncidentReasonSNC.AWAITING_PROBLEM  = "3";
IncidentReasonSNC.AWAITING_VENDOR   = "4";

IncidentReasonSNC.prototype = {
    initialize: function() {
    },

    type: 'IncidentReasonSNC'
};