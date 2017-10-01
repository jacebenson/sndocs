/*! RESOURCE: /scripts/app.guided_tours/constants.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedTourConstants == 'undefined') {
    top.NOW.guidedTourConstants = {};
    top.NOW.guidedTourConstants.events = {
        started: 'started',
        completed: 'completed',
        failed: 'failed',
        dismissed: 'dismissed',
        stepStarted: 'step_started'
    };
    top.NOW.guidedTourConstants.eventStreamName = 'gt-event';
};