/*! RESOURCE: /scripts/amb.EventManager.js */
(function($) {
  amb['EventManager'] = Class.create();
  amb.EventManager.prototype = {
    initialize: function(events) {
      this._events = events;
      this._subscriptions = [];
      this._idCounter = 0;
    },
    subscribe: function(event, callback) {
      var id = this._idCounter++;
      this._subscriptions.push({
        event: event,
        callback: callback,
        id: id
      });
      return id;
    },
    unsubscribe: function(id) {
      for (var i = 0; i < this._subscriptions.length; i++)
        if (id == this._subscriptions[i].id)
          this._subscriptions.splice(i, 1);
    },
    publish: function(event, args) {
      var subscriptions = this._getSubscriptions(event);
      for (var i = 0; i < subscriptions.length; i++)
        subscriptions[i].callback.apply(null, args);
    },
    _getSubscriptions: function(event) {
      var subscriptions = [];
      for (var i = 0; i < this._subscriptions.length; i++) {
        if (this._subscriptions[i].event == event)
          subscriptions.push(this._subscriptions[i]);
      }
      return subscriptions;
    },
    getEvents: function() {
      return this._events;
    },
    type: 'amb.EventManager'
  }
})(jQuery);;