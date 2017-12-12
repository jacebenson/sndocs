var ChangeRequestStateHandlerSNC = Class.create();

ChangeRequestStateHandlerSNC.LOG_PROPERTY = "com.snc.change_management.core.log";

ChangeRequestStateHandlerSNC.DRAFT = "draft";
ChangeRequestStateHandlerSNC.ASSESS = "assess";
ChangeRequestStateHandlerSNC.AUTHORIZE = "authorize";
ChangeRequestStateHandlerSNC.SCHEDULED = "scheduled";
ChangeRequestStateHandlerSNC.IMPLEMENT = "implement";
ChangeRequestStateHandlerSNC.REVIEW = "review";
ChangeRequestStateHandlerSNC.CLOSED = "closed";
ChangeRequestStateHandlerSNC.CANCELED = "canceled";

ChangeRequestStateHandlerSNC.prototype = {
    /**
     * Keep a mapping of the state values and their label equivalent to make the models (ChangeRequestStateModel_normal...etc)
     * easier to work with
     */
    STATE_NAMES: {
        "-5": ChangeRequestStateHandlerSNC.DRAFT,
        "-4": ChangeRequestStateHandlerSNC.ASSESS,
        "-3": ChangeRequestStateHandlerSNC.AUTHORIZE,
        "-2": ChangeRequestStateHandlerSNC.SCHEDULED,
        "-1": ChangeRequestStateHandlerSNC.IMPLEMENT,
        "0": ChangeRequestStateHandlerSNC.REVIEW,
        "3": ChangeRequestStateHandlerSNC.CLOSED,
        "4": ChangeRequestStateHandlerSNC.CANCELED
    },

    NORMAL: "normal",
    EMERGENCY: "emergency",
    STANDARD: "standard",

    /**
     * @param changeRequestGr - GlideRecord
     */
    initialize: function(changeRequestGr) {
        this.log = new GSLog(ChangeRequestStateHandlerSNC.LOG_PROPERTY, this.type);
        this.log.setLog4J();
		
		this._changeUtils = new ChangeUtils();

        if (!changeRequestGr)
            return;

        this._gr = changeRequestGr;
        this._resetModel();
    },

    isNext: function(state) {
    	var nextStates = this.getNextStates();
		
		if (!nextStates)
			return false;
    	
    	for (var i = 0; i < nextStates.length; i++)
    		if (state == nextStates[i])
    			return true;

		return false;
    },

    /**
     * Moves the change request to the next state.
     * 
     * The record's state is set but the record is not saved.
     * 
     * @returns {Boolean}
     */
    next: function() {
        var nextStates = this.getNextStates();
        
        if (!nextStates || nextStates.length == 0)
        	return false;
        
        this.log.debug("[next] trying to move to " + nextStates[0]);

        if (this.canMoveTo(nextStates[0])) {
            var currentState = this.getStateName(this._gr.getValue('state'));
            this._model[currentState][nextStates[0]].moving.call(this._model);
            this._gr.state = this.getStateValue(nextStates[0]);
            return true;
        }

        return false;
    },

    /**
     * Moves the change request to the given state
     * 
     * The record's state is set but the record is not saved.
     * 
     * @param toState String - name of the state to move to
     * @returns {Boolean}
     */
    moveTo: function(toState) {
        if (this.canMoveTo(toState)) {
            var currentState = this.getStateName(this._gr.getValue('state'));
            this._model[currentState][toState].moving.call(this._model);
            this._gr.state = this.getStateValue(toState);

            return true;
        }

        return false;
    },

    /**
     * Confirms that the move was allowed and executes the 'moving' function for this specific transition
     * 
     * @param toState String - name of the state to move to
     * @returns {Boolean}
     */
    moveFrom: function(fromState) {
        if (this.canMoveFrom(fromState)) {
            var currentState = this.getStateName(this._gr.getValue('state'));
            this._model[fromState][currentState].moving.call(this._model);

            return true;
        }

        return false;
    },

    /**
     * Checks if the change request at its current state is allowed to move to the given state
     * 
     * @param toState (optional) Name of the state
     * @returns {Boolean}
     */
    canMoveTo: function(toState) {
        if (!toState) {
            this.log.debug("[canMoveTo] needs a state to move to");
            return false;
        }

        var currentState = this.getStateName(this._gr.getValue('state'));
        if (!this._model[currentState]) {
            this.log.debug("[canMoveTo] " + currentState + " is not a valid state for this change");
            return false;
        }

        if (this._model[currentState][toState])
            return this._model[currentState][toState].canMove.call(this._model);

        this.log.debug("[canMoveTo] " + toState + " is not a valid state to move to");

        return false;
    },

    /**
     * Checks if the change request at its current state was allowed to move from the state provided
     * 
     * @param fromState (optional) Name of the state
     * @returns {Boolean}
     */
    canMoveFrom: function(fromState) {
        if (!fromState) {
            this.log.debug("[canMoveFrom] needs the previous state");
            return false;
        }

        var currentState = this.getStateName(this._gr.getValue('state'));
        if (!this._model[currentState]) {
            this.log.debug("[canMoveFrom] " + currentState + " is not a valid state for this change");
            return false;
        }

        if (!this._model[fromState]) {
            this.log.debug("[canMoveFrom] " + fromState + " is not a valid state for this change to have moved from");
            return false;
        }

        if (this._model[fromState][currentState])
            return this._model[fromState][currentState].canMove.call(this._model);

        this.log.debug("[canMoveFrom] " + currentState + " is not a valid state to move from " + fromState);

        return false;
    },

    /**
     * Returns the array of next states this change to may move to.
     * 
     * @returns String array state name
     */
    getNextStates: function() {
        var currentState = this.getStateName(this._gr.getValue('state'));
        if (!currentState)
            return null;

        var stateObj = this._model[currentState];

        if (!stateObj) {
            this.log.debug("[getNextStates] " + currentState + " is not a valid state for this change");
            return null;
        }

        if (!stateObj.nextState || stateObj.nextState.length === 0) {
            this.log.debug("[getNextStates] there is no 'next' state to move to from '" + currentState + "'");
            return null;
        }

        return stateObj.nextState;
    },

    /**
     * Dissociate approvals from a particular workflow activity to preserve the history.
     */
    disassociateApprovalsFromWorkflow: function() {
        if (!this._gr)
            return;

        var existingApprovalsGr = new GlideMultipleUpdate("sysapproval_approver");
        existingApprovalsGr.addQuery("sysapproval", this._gr.getUniqueValue());
        existingApprovalsGr.addQuery("state", "!=", "cancelled");
        existingApprovalsGr.setValue("wf_activity", "");
        existingApprovalsGr.execute();

        existingApprovalsGr = new GlideMultipleUpdate("sysapproval_group");
        existingApprovalsGr.addQuery("parent", this._gr.getUniqueValue());
        existingApprovalsGr.addQuery("approval", "!=", "cancelled");
        existingApprovalsGr.setValue("wf_activity", "");
        existingApprovalsGr.execute();
    },

    /**
     * Uses the current change request's type to determine and set the state model class
     */
    _resetModel: function() {
        this._model = null;
        switch (this._gr.getValue('type') + "") {
            case this.NORMAL:
                this._model = new ChangeRequestStateModel_normal(this._gr);
                break;
            case this.EMERGENCY:
                this._model = new ChangeRequestStateModel_emergency(this._gr);
                break;
            case this.STANDARD:
                this._model = new ChangeRequestStateModel_standard(this._gr);
                break;
        }
    },
	
	getStateModel: function() {
		var stateModel = {};
		stateModel['types'] = [];
		stateModel['stateValueByName'] = {};
		stateModel['stateNameByValue'] = {};
		stateModel['stateLabelByValue'] = {};
		
		var states = this._changeUtils.getFieldChoices('state');
		for (var i = 0; i < states.size(); i++) {
			var state = states.get(i);
			var stateValue = state.getValue();
			stateModel.stateLabelByValue[stateValue] = state.getLabel();
			var stateName = this.getStateName(stateValue);
			if (stateName) {
				stateModel.stateNameByValue[stateValue] = stateName;
				stateModel.stateValueByName[stateName] = stateValue;
			}
		}

		var types = this._changeUtils.getFieldChoices('type');
		if (!types || types.size() == 0)
			return stateModel;

		var chgType;
		for (var i = 0; i < types.size(); i++) {
			chgType = types.get(i);
			var chgTypeValue = chgType.getValue();
			if (!chgTypeValue)
				continue;
			stateModel.types.push(chgTypeValue);
			stateModel[chgTypeValue] = this._getStateModelByType(chgTypeValue);
		}
		
		return stateModel;
	},
	
	_getStateModelByType: function(type) {
		var typeStateModel = {};
		
		var outerScope = JSUtil.getGlobal();
		var changeRequestStateModel_type = "ChangeRequestStateModel_" + type; 
		var stateModel;
		var stateModelClass = outerScope[changeRequestStateModel_type].prototype;
		if (typeof stateModelClass === "undefined")
			return typeStateModel;

		for (var stateValue in this.STATE_NAMES) {
			var stateName = this.getStateName(stateValue);
			var stateInClass = stateModelClass[stateName];
			if (!stateInClass)
				continue;
			
			typeStateModel[stateName] = {nextState: []};
			if (stateInClass.nextState)
				typeStateModel[stateName].nextState = stateInClass.nextState;
		}
		
		return typeStateModel;
	},

    getStateName: function(value) {
        return this.STATE_NAMES[value + ""];
    },

    getStateValue: function(stateName) {
        for ( var prop in this.STATE_NAMES) {
            if (this.STATE_NAMES[prop] == stateName)
                return prop;
        }
    },

    isOnHold: function() {
        return this._model.isOnHold.call(this._model);
    },

    type: "ChangeRequestStateHandlerSNC"
};