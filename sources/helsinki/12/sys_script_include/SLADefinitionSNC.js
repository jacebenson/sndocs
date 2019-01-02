var SLADefinitionSNC = Class.create();

SLADefinitionSNC.SLA_DEF = "contract_sla";
SLADefinitionSNC.SCHEDULE = "cmn_schedule";

SLADefinitionSNC.prototype = {

    initialize: function(slaDefGr) {
        this.slaDefGr = null;
        this.schedule = null;
        this.duration = null;

        if (slaDefGr && slaDefGr instanceof GlideRecord && slaDefGr.getRecordClassName() == "contract_sla") {
            this.slaDefGr = slaDefGr;
            this.duration = new GlideDuration(this.slaDefGr.getValue("duration"));

            if (!this.slaDefGr.schedule.nil())
                this.schedule = new GlideSchedule(this.slaDefGr.getValue("schedule"));
        }
    },

    /**
     * Generates a possible breach time for the given schedule and duration.
     * 
     * This method does not generate a end date using relative durations.
     * 
     * @param startTime - GlideDateTime
     * @returns GlideDateTime representing the breach time of an SLA
     */
    getExampleBreachTime: function(startTime) {
        if (!this.duration && !this.durationType)
            return null;

        if (!startTime)
            startTime = new GlideDateTime();

        // Get a new duration every time to prevent issues with multiple calls without re-setting the duration
        var duration = new GlideDuration(this.duration);
        var endTimeGdt = new GlideDateTime(startTime);
        if (!this.schedule) {
            endTimeGdt.add(duration.getNumericValue());
            return endTimeGdt;
        }

        return this.schedule.add(endTimeGdt, duration);
    },

    /**
     * Creates a new GlideSchedule object from the given scheduleId and sets it
     * 
     * @param scheduleId
     * @returns Boolean whether the variable was set or not
     */
    setSchedule: function(scheduleId) {
        if (!scheduleId) {
            this.schedule = null;
            return false;
        }

        var scheduleGr = new GlideRecord(SLADefinitionSNC.SCHEDULE);
        if (!scheduleGr.get(scheduleId)) {
            this.schedule = null;
            return false;
        }

        this.schedule = new GlideSchedule(scheduleId);
        return true;
    },

    /**
     * Creates a new Duration object from the given duration and sets it
     * 
     * @param duration
     * @returns Boolean whether the variable was set or not
     */
    setDuration: function(duration) {
        if (!duration)
            return false;

        this.duration = new GlideDuration(duration);
    },

    type: 'SLADefinitionSNC'
};