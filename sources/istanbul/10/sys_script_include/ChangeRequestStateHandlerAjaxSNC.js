var ChangeRequestStateHandlerAjaxSNC = Class.create();
ChangeRequestStateHandlerAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
        this.log = new GSLog(ChangeRequestStateHandlerSNC.LOG_PROPERTY);
        this.log.setLog4J();
    },

    /**
     * Confirms whether the state value is a valid "next" state for the change to move to
     * 
     * @param sysparm_change_sys_id sys_id of a change_request record
     * @param sysparm_next_state name of the state to check. E.g. assess, authorized, etc.
     */
    ajaxFunction_isNextState: function() {
        var sysId = this.getParameter("sysparm_change_sys_id");
        var changeGr = this._getChangeGr(sysId);
        if (!changeGr) {
            this.log.debug("[isNextState] could not find change_request with sys_id = " + sysId);
            return false;
        }

        return new ChangeRequestStateHandler().isNext(this.getParameter("sysparm_next_state"));
    },

    /**
     * Returns an array containing the values of the next states for an existing change
     * 
     * @param sysparm_change_sys_id sys_id of a change_request record
     */
    ajaxFunction_getNextStateValues: function() {
        var changeId = this.getParameter("sysparm_change_sys_id");
		var changeType = '' + this.getParameter("sysparm_change_type");
        if (!changeId && !changeType)
            return "";

		var gr;
		gr = new GlideRecord("change_request");
		if (!gr.get(changeId)) {
			this.log.debug("[getNextStateValues] could not find change_request with sys_id = " + changeId);
			gr = ChangeRequest.newChange(changeType).getGlideRecord();
		} 	
		
		var stateValues = [];

		var stateHandler = new ChangeRequestStateHandler(gr);
		var nextStates = stateHandler.getNextStates();
		if (nextStates) {
			for (var i = 0; i < nextStates.length; i++)
				stateValues.push(stateHandler.getStateValue(nextStates[i]));
		}
		
		return JSON.stringify(stateValues);
    },

    /**
     * Returns the name of the state given its numeric value. E.g. -4 = assess, -3 = authorize
     * 
     * @param sysparm_state_name name of the state to convert. E.g. assess, authorize, etc
     */
    ajaxFunction_getStateValue: function() {
        var stateName = this.getParameter("sysparm_state_name");
        if (!stateName)
            return "";

        var stateValue = new ChangeRequestStateHandler().getStateValue(stateName);

        this.log.debug("[getStateValue] state with name '" + stateName + "' return with value '" + stateValue + "'");

        return stateValue || "";
    },

    _getChangeGr: function(sysId) {
        if (!sysId)
            return null;

        var gr = new GlideRecord("change_request");
        if (gr.get(sysId))
            return gr;

        return null;
    },

    type: "ChangeRequestStateHandlerAjaxSNC"
});