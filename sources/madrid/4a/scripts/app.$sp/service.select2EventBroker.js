/*! RESOURCE: /scripts/app.$sp/service.select2EventBroker.js */
angular.module('sn.$sp').factory('select2EventBroker', function() {
  var subscribers = {};
  var uuid = -1;

  function _openSelect2Element() {
    for (var key in subscribers) {
      subscribers[key]();
    }
  }

  function _onSelect2Opening(callback) {
    var subscriptionToken = (++uuid).toString();
    subscribers[subscriptionToken] = callback.bind(this);
    return function unsubscribe() {
      delete subscribers[subscriptionToken];
    }
  }
  return {
    publishSelect2Opening: _openSelect2Element,
    subscribeSelect2Opening: _onSelect2Opening
  }
});;