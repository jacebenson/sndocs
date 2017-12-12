var IncidentUtils = Class.create();
IncidentUtils.prototype = Object.extendsObject(IncidentUtilsSNC, {
    initialize: function(request, responseXML, gc) {
	IncidentUtilsSNC.prototype.initialize.call(this, request, responseXML, gc);
    },

    /***************Custom changes****************/

    type: 'IncidentUtils'
});

IncidentUtils.isCopyIncidentEnabled = function(current) {
	var incidentUtils = new IncidentUtils();
	return incidentUtils.isCopyIncidentFlagValid();

};

IncidentUtils.isCreateChildIncidentEnabled = function(current) {
	var incidentUtils = new IncidentUtils();
	return incidentUtils.isCreateChildIncidentFlagValid();

};