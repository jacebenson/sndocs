var IncidentSNC = Class.create();

IncidentSNC.prototype = {
	initialize: function(incidentGr) {
		this._gr = incidentGr;
	},
	
	_getGr: function() {
		return this._gr;
	},
	
	hasReopened: function() {
		var incidentGr = this._getGr();
		return (incidentGr.incident_state.changesFrom(IncidentState.RESOLVED) || 
				incidentGr.incident_state.changesFrom(IncidentState.CLOSED) || 
				incidentGr.incident_state.changesFrom(IncidentStateSNC.CANCELED)) && 
			incidentGr.incident_state != IncidentState.RESOLVED && 
			incidentGr.incident_state != IncidentState.CLOSED && 
			incidentGr.incident_state != IncidentState.CANCELED;
	},
	
	reopen: function(gr, email) {
		if (!gr)
			return null;
		
		if (gr.state == IncidentState.RESOLVED) {
			// If the incident is Resolved
			gr.state = IncidentState.IN_PROGRESS;
			gr.incident_state = IncidentState.IN_PROGRESS;
			gr.work_notes = gs.getMessage("The caller did not feel that this issue was resolved");
			gr.update();
			return gr;
		} else if (gr.state == IncidentState.CLOSED) {
			// Create a duplicate incident if this one is Closed
			var duplicateIncId = this.clone(gr.sys_id);
			var gr2 = new GlideRecord("incident");
			gr2.get(duplicateIncId);
			gr2.caller_id = email.from_sys_id;
			gr2.opened_by = email.from_sys_id;
			gr2.contact_type = "email";
			gr2.state = IncidentState.IN_PROGRESS;
			gr2.incident_state = IncidentState.IN_PROGRESS;
			gr2.work_notes = gs.getMessage("The caller did not feel that the incident {0} was resolved", [gr.number+""]);
			gr2.update();
			return gr2;
		}
	},
	
	clone: function(id) {
		var gr = new GlideRecord("incident");
		if (!gr.get(id))
			return null;
		
		var gr2 = new GlideRecord("incident");
		gr2.initialize();
		
		for (var i = 0; i < IncidentSNC.CLONE_FIELDS_ON_REOPEN.length; i++) {
			var field = IncidentSNC.CLONE_FIELDS_ON_REOPEN[i];
			gr2.setValue(field, gr.getValue(field));
		}
		
		return gr2.insert();
	},
	
	type: 'IncidentSNC'
};

IncidentSNC.DEFAULT_CLONE_FIELDS = "additional_assignee_list,assignment_group,business_service,caller_id,category,cmdb_ci,company,description,group_list,impact,knowledge,location,parent,parent_incident,priority,problem_id,rfc,severity,short_description,subcategory,urgency,watch_list";
IncidentSNC.CLONE_FIELDS_ON_REOPEN = gs.getProperty("com.snc.incident.clone_fields_on_reopen", IncidentSNC.DEFAULT_CLONE_FIELDS).split(",");