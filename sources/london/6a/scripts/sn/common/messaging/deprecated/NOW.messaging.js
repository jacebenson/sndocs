/*! RESOURCE: /scripts/sn/common/messaging/deprecated/NOW.messaging.js */
(function(global) {
  "use strict";
  global.NOW = global.NOW || {};
  var messaging = global.NOW.messaging = global.NOW.messaging || {};
  messaging.snCustomEventAdapter = function(snCustomEvent, snTopicRegistrar, snDate, snUuid) {
    var busId = snUuid.generate();
    return {
      channel: function(channelName) {
        var topicRegistrations = snTopicRegistrar.create();
        var fireCall = 'fireAll';
        snCustomEvent.on(channelName, function(envelope) {
          var topic = envelope.topic;
          topicRegistrations.subscribersTo(topic).forEach(function(subscription) {
            subscription.callback(envelope.data, envelope);
          });
        });
        return {
          publish: function(topic, payload) {
            if (!topic)
              throw "'topic' argument must be supplied to publish";
            snCustomEvent[fireCall](channelName, envelope(topic, payload));
          },
          subscribe: function(topic, callback) {
            if (!topic)
              throw "'topic' argument must be supplied to subscribe";
            if (!callback)
              throw "'callback' argument must be supplied to subscribe";
            var sub = subscription(topic, callback);
            topicRegistrations.registerSubscriber(sub);
            return sub;
          },
          unsubscribe: function(subscription) {
            if (!subscription)
              throw "'subscription' argument must be supplied to unsubscribe";
            return topicRegistrations.deregisterSubscriber(subscription);
          },
          destroy: function() {
            topicRegistrations = null;
            snCustomEvent.un(channelName);
          }
        };

        function subscription(topic, callback) {
          return {
            get topic() {
              return topic
            },
            get callback() {
              return callback
            }
          }
        }

        function envelope(topic, payload) {
          return {
            channel: channelName,
            topic: topic,
            data: payload,
            timestamp: snDate.now(),
            messageId: snUuid.generate(),
            busId: busId
          }
        }
      }
    };
  };
  messaging.snTopicRegistrar = function() {
    var validTopicRegex = /^(\w+\.)*(\w+)$/;

    function validateSubscription(subscription) {
      if (!subscription)
        throw new Error("Subscription argument is required");
      if (!subscription.topic || !subscription.callback)
        throw new Error("Subscription argument must be a valid subscription");
    }

    function validateTopic(topic) {
      if (!topic)
        throw new Error("Topic argument is required");
      if (!validTopicRegex.test(topic))
        throw new Error("Invalid topic name: " + topic);
    }

    function regexForBinding(binding) {
      binding = binding.split('.').map(function(segment) {
        if (segment === '')
          throw new Error("Empty segment not allowed in topic binding: " + binding);
        if (segment === '*')
          return '[^.]+';
        if (segment === '#')
          return '(\\b.*\\b)?';
        if (segment.match(/\W/))
          throw new Error("Segments may only contain wildcards or word characters: " + binding + ' [' + segment + ']');
        return segment;
      }).join('\\.');
      return new RegExp('^' + binding + '$');
    }
    return {
      create: function() {
        var registrations = {};
        var bindingRegExps = {};
        return {
          registerSubscriber: function(subscription) {
            validateSubscription(subscription);
            if (!registrations[subscription.topic])
              registrations[subscription.topic] = [];
            registrations[subscription.topic].push(subscription);
            bindingRegExps[subscription.topic] = regexForBinding(subscription.topic);
            return subscription;
          },
          deregisterSubscriber: function(toRemove) {
            validateSubscription(toRemove);
            var topic = toRemove.topic;
            var regs = registrations[topic];
            if (regs) {
              registrations[topic] = regs.filter(function(subscription) {
                return subscription !== toRemove;
              });
              if (registrations[topic].length === 0) {
                delete registrations[topic];
                delete bindingRegExps[topic];
              }
            }
          },
          subscribersTo: function(topic) {
            validateTopic(topic);
            var bindings = Object.keys(registrations);
            return bindings.reduce(function(memo, binding) {
              var regex = bindingRegExps[binding];
              if (regex.test(topic))
                return memo.concat(registrations[binding]);
              return memo;
            }, []);
          }
        }
      }
    }
  };
  messaging.snDate = function() {
    return {
      now: function() {
        return new Date();
      }
    }
  };
  messaging.snUuid = function() {
    return {
      generate: function() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
      }
    };
  };
  global.NOW.MessageBus =
    messaging.snCustomEventAdapter(CustomEvent, messaging.snTopicRegistrar(), messaging.snDate(), messaging.snUuid());
})(this);;