var ChangeRequestDateMessage = Class.create();

ChangeRequestDateMessage.prototype = {
	
    initialize: function(_gr) {
        this.gr = _gr;
    },
	
    /**
     * Gets the description message for the change request planned start/end date based on the state.
     * 
     * @returns the message to display or empty string if not applicable
     */
    getDateMsg: function() {
        if (!this.gr)
            return "";

		var state = this.gr.getValue("state");
		if (state == 4) // canceled
			state = this._getPreviousState();
        return this._getDateMessage(state);
    },

	_getDateMessage: function(state) {
		switch(state.toString()){
			case "-5": // new
			case "-4": // assess
			case "-3": // authorize
				return gs.getMessage("Time between planned start date and planned end date is the requested change window");
			case "-2": // scheduled
			case "-1": // implement
			case "0": // review
			case "3": // closed
				return gs.getMessage("Time between planned start date and planned end date is the authorized change window");
			default:
				return "";
		}
	},

	_getPreviousState: function() {
		var gr = new GlideRecord("sys_history_line");
		gr.addEncodedQuery("field=state^set.id=" + this.gr.sys_id + "^set.table=change_request^ORDERBYDESCupdate");
		gr.query();
		if (gr.next())
			return gr.getValue("old_value");
	},

    type: "ChangeRequestDateMessage"
};