var GTAnalyticsController = Class.create();

GTAnalyticsController.prototype = {
  events: {
	started    : 'started',
    completed  : 'completed',
    failed     : 'failed',
    dismissed  : 'dismissed',
    stepStarted: 'step_started'
  },
  tableNames: {
    analytics : 'sys_guided_tour_analytics',
    events    : 'sys_guided_tour_analytics_event'
  },
  errorMessages: {
    permissionDenied : gs.getMessage('permission denied'),
    eventRequired    : gs.getMessage('event is required'),
    tourRequired     : gs.getMessage('tour is required'),
    playIdRequired   : gs.getMessage('play_id is required'),
    playIdInvalid    : gs.getMessage('play_id is not valid'),
    internalError    : gs.getMessage('internal error'),
    success          : gs.getMessage('ok')
  }
};

GTAnalyticsController.prototype.addToAnalyticsTable = function(data, currentUser) {
  var gr = new GlideRecord(this.tableNames.analytics);
  gr.last_status = this.events.started;
  gr.user = currentUser.getID();
  gr.tour = escape(data.tour);
  gr.last_step = null;
  gr.insert();
  return gr.getUniqueValue();
}

GTAnalyticsController.prototype.addToAnalyticsEventTable = function(data) {
  var gr = new GlideRecord(this.tableNames.events);
  gr.name = escape(data.event);
  gr.analytics_instance = escape(data.play_id);
  if (typeof(data.attribute) !== 'undefined') {
    gr.attribute = escape(data.attribute);
  }
  if (typeof(data.timestamp) !== 'undefined') {
    gr.timestamp = escape(data.timestamp);
  } else   {
  	gr.timestamp = new Date();
  }
  gr.details = data.details ? escape(data.details) : null;
  gr.insert();
}

GTAnalyticsController.prototype.updateAnalyticsTable = function(data) {
  var gr = new GlideRecord(this.tableNames.analytics);
  gr.addQuery('sys_id', '=', escape(data.play_id));
  gr.query();
  if (gr.next()) {
  	var lastStatus = gr.last_status.toString();
  	if (lastStatus === this.events.completed || lastStatus === this.events.dismissed) {
    	return null;
  	}
  	gr.last_status = escape(data.event);
  	if (data.event == this.events.stepStarted && typeof(data.attribute) !== 'undefined') {
    	gr.last_step = escape(data.attribute);
  	}
  	gr.update();
  	return gr.getUniqueValue();
  } else {
    return null;
  }
}

GTAnalyticsController.prototype.handlePost = function(payload, cb) {

  var grAnalytics = new GlideRecord(this.tableNames.analytics);
  var grAnalyticsEvents = new GlideRecord(this.tableNames.events);
  var currentUser = gs.getUser();
  var id = null;
  var response = null;

  // Validate payload and user permissions
  if (!payload || typeof(payload.event) === 'undefined' || payload.event.length === 0) {
    cb && cb(true, {msg: this.errorMessages.eventRequired});
    return;
  }
  
  switch(payload.event) {
  case this.events.started:
    if (typeof(payload.tour) === 'undefined' || payload.tour.length === 0) {
      cb && cb(true, {msg: this.errorMessages.tourRequired});
      return;
    }
    id = this.addToAnalyticsTable(payload, currentUser);
    if (id) {
      payload.play_id = id;
      this.addToAnalyticsEventTable(payload);
      cb && cb(null, {play_id: id});
    } else {
      cb && cb(true, {msg: this.errorMessages.internalError});
    }
  break;
  default:
    if (typeof(payload.play_id) === 'undefined' || payload.play_id.length === 0) {
      cb && cb(true, {msg: this.errorMessages.playIdRequired});
      return;
    }
    id = this.updateAnalyticsTable(payload);
    if(id) {
      this.addToAnalyticsEventTable(payload);
      cb(false, {msg: this.errorMessages.success});
    } else {
      cb && cb(true, {msg: this.errorMessages.internalError});
    }
  }
};