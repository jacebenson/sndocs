/*! RESOURCE: /scripts/app.guided_tours/service.analytics.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursAnalytics == 'undefined') {
  var eventNames = top.NOW.guidedTourConstants.events;
  var sessionKey = 'play_id';
  var sessionStoreKey = 'guided_tour_analytics' + sessionKey;

  function AnalyticsService() {
    this.sessionId = sessionStorage.getItem(sessionStoreKey) || null;
    this.buffer = [];
    this.url = '/api/now/guided_tours/analytics';
    this.isEnabled = true;
  }
  AnalyticsService.prototype.queue = function(data) {
    var self = this;
    if (data.event === eventNames.started) {
      this.send({
        event: data.event,
        tour: data.tour,
        timestamp: data.timestamp
      }, function(e, d) {
        if (!e && d[sessionKey]) {
          self.sessionId = d[sessionKey];
          sessionStorage.setItem(sessionStoreKey, self.sessionId);
          while (self.buffer.length > 0) {
            var d = self.buffer.shift();
            d[sessionKey] = self.sessionId;
            self.send(d);
          }
        }
      });
    } else {
      this.buffer.push(data);
    }
  };
  AnalyticsService.prototype.send = function(data, cb) {
    window.jQuery.ajax(this.url, {
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      method: 'POST',
      processData: false,
      success: function(d) {
        cb && cb(null, d.result);
      },
      error: function(e) {
        cb && cb(e);
      }
    });
  };
  AnalyticsService.prototype.listenTo = function(eventEmitter, eventName) {
    var self = this;
    eventEmitter.on(eventName, function(d) {
      if (!self.isEnabled) {
        return;
      }
      if (!d) return;
      if (!d.timestamp) {
        d.timestamp = Date.now();
      }
      if (!self.sessionId) {
        self.queue(d);
      } else {
        d[sessionKey] = self.sessionId;
        self.send(d);
      }
      if (d.event === eventNames.completed || d.event === eventNames.dismissed || d.event === eventNames.failed) {
        sessionStorage.removeItem(sessionStoreKey)
        self.sessionId = null;
      }
    });
  };
  top.NOW.guidedToursAnalytics = new AnalyticsService();
};