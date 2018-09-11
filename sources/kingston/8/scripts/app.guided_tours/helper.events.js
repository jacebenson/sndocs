/*! RESOURCE: /scripts/app.guided_tours/helper.events.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursEventsHelper == 'undefined') {
  top.NOW.guidedToursEventsHelper = {};
  var eventNames = top.NOW.guidedTourConstants.events;
  top.NOW.guidedToursEventsHelper.createEventData = function(name, service, options) {
    var evtObj = {
      event: name,
      tour: service.currentSysId,
      timestamp: Date.now(),
      details: ''
    };
    switch (name) {
      case eventNames.stepStarted:
        if (options && typeof(options.step) !== 'undefined') {
          evtObj.attribute = options.step;
        }
        break;
      case eventNames.started:
      case eventNames.completed:
      case eventNames.failed:
      case eventNames.dismissed:
        break;
      default:
        return null;
    }
    return evtObj;
  }
};