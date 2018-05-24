/*! RESOURCE: /scripts/amb.MessageClientBuilder.js */
(function($) {
  amb.getClient = function() {
    return getClient();
  }

  function getClient() {
    var _window = window.self;
    try {
      while (_window != _window.parent) {
        if (_window.g_ambClient)
          break;
        _window = _window.parent;
      }
      if (_window.g_ambClient)
        return _window.g_ambClient;
    } catch (e) {
      console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e);
    }
    var client = buildClient();
    setClient(client);
    return client;
  }

  function setClient(client) {
    var _window = window.self;
    _window.g_ambClient = client;
    $(_window).unload(function() {
      _window.g_ambClient.disconnect();
    });
    _window.g_ambClient.connect();
  }

  function buildClient() {
    return (function() {
      var ambClient = new amb.MessageClient();
      return {
        getServerConnection: function() {
          return ambClient.getServerConnection();
        },
        connect: function() {
          ambClient.connect();
        },
        abort: function() {
          ambClient.abort();
        },
        disconnect: function() {
          ambClient.disconnect();
        },
        getConnectionState: function() {
          return ambClient.getConnectionState();
        },
        getState: function() {
          return ambClient.getConnectionState();
        },
        getClientId: function() {
          return ambClient.getClientId();
        },
        getChannel: function(channelName) {
          var channel = ambClient.getChannel(channelName);
          var originalSubscribe = channel.subscribe;
          var originalUnsubscribe = channel.unsubscribe;
          channel.subscribe = function(listener) {
            originalSubscribe.call(channel, listener);
            $(window).unload(function(event) {
              originalUnsubscribe.call(channel);
            });
            return channel;
          };
          return channel;
        },
        getChannel0: function(channelName) {
          return ambClient.getChannel(channelName);
        },
        registerExtension: function(extensionName, extension) {
          ambClient.registerExtension(extensionName, extension);
        },
        unregisterExtension: function(extensionName) {
          ambClient.unregisterExtension(extensionName);
        },
        batch: function(block) {
          ambClient.batch(block);
        },
        subscribeToEvent: function(event, callback) {
          return ambClient.subscribeToEvent(event, callback);
        },
        unsubscribeFromEvent: function(id) {
          ambClient.unsubscribeFromEvent(id);
        },
        isLoggedIn: function() {
          return ambClient.isLoggedIn();
        },
        getConnectionEvents: function() {
          return ambClient.getConnectionEvents();
        },
        getEvents: function() {
          return ambClient.getConnectionEvents();
        },
        loginComplete: function() {
          ambClient.loginComplete();
        }
      };
    })();
  }
})(window.jQuery || window.Zepto);;