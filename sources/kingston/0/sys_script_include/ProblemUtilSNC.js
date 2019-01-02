var ProblemUtilSNC = Class.create();
ProblemUtilSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	SOLVED_PERMANENTLY: "Solved (Permanently)",
	
	initialize: function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},
	
	checkResolveIncidents: function(problemGR) {
		var resolveAction = false;
		var transaction = GlideTransaction.get();
		if (transaction)
			resolveAction = "resolve_incidents" == transaction.getRequestParameter("sys_action");
		return resolveAction || (problemGR.isValidRecord() && problemGR.problem_state.changesTo(4));
	},
	
	resolveIncidents: function(problemGR) {
		var problemSysId = this.getParameter("sysparm_problem_sys_id");
		if (JSUtil.nil(problemSysId) && problemGR)
			problemSysId = problemGR.getUniqueValue();
		
		var notes = this.getParameter("sysparm_notes");
		if (JSUtil.nil(notes) && problemGR)
			notes = problemGR.getValue("close_notes");
		
		if (JSUtil.nil(problemSysId) || JSUtil.nil(notes))
			return gs.getMessage("Problem sys_id and close notes are required");
		
		if (!problemGR) {
			problemGR = new GlideRecord("problem");
			problemGR.get(problemSysId);
		}
		
		var problemNumber = problemGR.getValue("number");
		var resolvedBy = gs.getUserID();
		var resolvedAt = new GlideDateTime();
		var updatedCloseNotes = gs.getMessage("Related problem {0} closed with the following Close Notes", problemNumber);
		updatedCloseNotes += "\n" + notes;
		
		var incidentGR = new GlideRecord("incident");
		incidentGR.addQuery("problem_id", problemSysId);
		incidentGR.addQuery("state", IncidentState.AWAITING_PROBLEM);
		incidentGR.addQuery("hold_reason", IncidentReason.AWAITING_PROBLEM);
		incidentGR.query();
		
		if (!incidentGR.hasNext())
			return gs.getMessage("There are no related incidents awaiting resolution of this problem");
		
		while (incidentGR.next()) {
			var incidentCloseNotes = incidentGR.getDisplayValue("close_notes");
			incidentGR.setValue("state", IncidentState.RESOLVED);
			incidentGR.setValue("close_code", this.SOLVED_PERMANENTLY);
			incidentGR.setValue("close_notes", updatedCloseNotes + "\n" + incidentCloseNotes);
			incidentGR.setValue("resolved_by", resolvedBy);
			incidentGR.setValue("resolved_at", resolvedAt);
			incidentGR.update();
		}
		
		var url = this._getResolvedIncidentsURL(problemSysId, resolvedBy, resolvedAt);
		return gs.getMessage("<a href='{0}'>Related incidents</a> moved to Resolved state", url);
	},
	
	_getResolvedIncidentsURL: function(problemSysId, resolvedBy, resolvedAt) {
		var resolvedIncidentsGR = new GlideRecord("incident");
		resolvedIncidentsGR.addQuery("problem_id", problemSysId);
		resolvedIncidentsGR.addQuery("state", IncidentState.RESOLVED);
		resolvedIncidentsGR.addQuery("close_code", this.SOLVED_PERMANENTLY);
		resolvedIncidentsGR.addQuery("resolved_by", resolvedBy);
		resolvedIncidentsGR.addQuery("resolved_at", resolvedAt);
		
		var url = new GlideURL("incident_list.do");
		url.set("sysparm_query", resolvedIncidentsGR.getEncodedQuery());
		return url.toString();
	},

    type: 'ProblemUtilSNC'
});