var SLADefinitionAJAX = Class.create();

SLADefinitionAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
     * Creates an example breach time message.
     * 
     * @param sysparm_schedule String schedule id
     * @param sysparm_duration String duration
     * 
     * @return String
     */
    getExampleBreachTime: function() {
        var scheduleId = this.getParameter("sysparm_schedule");
        var duration = this.getParameter("sysparm_duration");

        if (!duration)
            return null;

        var startDate = new GlideDateTime();

        var slaDef = new SLADefinition();
        slaDef.setSchedule(scheduleId);
        slaDef.setDuration(duration);

        var endDate = slaDef.getExampleBreachTime(startDate);
        if (!endDate)
            return null;

        var dateDifference = endDate.getNumericValue() - startDate.getNumericValue();
        var actualElapsedTime = new GlideDuration(dateDifference);

        return gs.getMessage("An SLA starting now will breach on {0} (Actual elapsed time: {1})", [ endDate.getDisplayValue(), actualElapsedTime.getDisplayValue() ]);
    },
	
    type: 'SLADefinitionAJAX'
});