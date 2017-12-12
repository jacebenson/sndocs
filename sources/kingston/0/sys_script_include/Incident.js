var Incident = Class.create();
Incident.prototype = Object.extendsObject(IncidentSNC, {

	initialize: function(incidentGr) {
		IncidentSNC.prototype.initialize.call(this, incidentGr);
	},
	
    type: 'Incident'
});