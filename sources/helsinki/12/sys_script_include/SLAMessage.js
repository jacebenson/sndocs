var SLAMessage = Class.create();

SLAMessage.prototype = {
    SLA_ALWAYS_POPULATE_BUSINESS: 'com.snc.sla.always_populate_business_fields',
	
    initialize: function(_gr) {
		this.alwaysPopulateBusiness = (gs.getProperty(this.SLA_ALWAYS_POPULATE_BUSINESS, 'false') == 'true');
        this.gr = _gr;
    },

    /**
     * Calculates the message to be used the Task SLA form describing how the
     * actual and business values will be calculated.
     * 
     * @param gr
     * @returns
     */
    getBusinessValuesCalculatedMsg: function() {
        if (!this.gr)
            return "";

        var message;
        if (this.gr.schedule.isNil()) {
			if (this.alwaysPopulateBusiness)
				message = gs.getMessage("Business values will be the same as Actual values when no schedule is applied");
			else
				message = gs.getMessage("Business values are not populated as there is no schedule applied");			
		} else
            message = gs.getMessage("Business values are calculated using the '{0}' schedule", this.gr.schedule.name);
        
        return message;
    },

    type: "SLAMessage"
};