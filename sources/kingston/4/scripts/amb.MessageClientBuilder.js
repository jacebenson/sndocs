/*! RESOURCE: /scripts/amb.MessageClientBuilder.js */
(function() {
  'use strict';
  amb.getClient = function() {
    return getClient();
  };

  function getClient() {
    var client = getParentAmbClient(window);
    if (client) {
      return wrapClient(client, window);
    }
    client = wrapClient(buildClient(), window);
    setClient(client);
    return client;
  }

  function getParentAmbClient(clientWindow) {
    try {
      if (!(clientWindow.MSInputMethodContext && clientWindow.document.documentMode)) {
        while (clientWindow !== clientWindow.parent) {
          if (clientWindow.g_ambClient) {
            break;
          }
          clientWindow = clientWindow.parent;
        }
      }
      if (clientWindow.g_ambClient) {
        return clientWindow.g_ambClient;
      }
    } catch (e) {
      console.log('AMB getClient() tried to access parent from an iFrame. Caught error: ' + e);
    }
    return null;
  }

  function wrapClient(client, clientWindow) {
    if (typeof client.getClientWindow !== 'undefined') {
      var context = client.getClientWindow();
      if (context === clientWindow) {
        return client;
      }
    }
    var wrappedClient = clone({}, client);
    wrappedClient.getChannel = function(channelName, overrideWindow) {
      return client.getChannel(channelName, overrideWindow || clientWindow);
    };
    wrappedClient.subscribeToEvent = function(event, callback, overrideWindow) {
      return client.subscribeToEvent(event, callback, overrideWindow || clientWindow);
    };
    wrappedClient.unsubscribeFromEvent = function(id, overrideWindow) {
      return client.unsubscribeFromEvent(id, overrideWindow || clientWindow);
    };
    wrappedClient.getClientWindow = function() {
      return clientWindow;
    };
    return wrappedClient;
  }

  function clone(dest, source) {
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        dest[prop] = source[prop];
      }
    }
    return dest;
  }

  function setClient(client) {
    var _window = window.self;
    _window.g_ambClient = client;
    _window.addEventListener("unload", function() {
      _window.g_ambClient.disconnect();
    });
    var documentReadyState = _window.document ? _window.document.readyState : null;
    if (documentReadyState === 'complete') {
      autoConnect();
    } else {
      _window.addEventListener('load', autoConnect);
    }
    setTimeout(autoConnect, 10000);
    var initiatedConnection = false;

    function autoConnect() {
      if (!initiatedConnection) {
        initiatedConnection = true;
        _window.g_ambClient.connect();
      }
    }
  }

  function buildClient() {
    return (function() {
      var ambClient = new amb.MessageClient();
      var clientSubscriptions = buildClientSubscriptions();
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
        getChannel: function(channelName, windowContext) {
          var channel = ambClient.getChannel(channelName);
          var originalSubscribe = channel.subscribe;
          var originalUnsubscribe = channel.unsubscribe;
          windowContext = windowContext || window;
          channel.subscribe = function(listener) {
            clientSubscriptions.add(windowContext, channel, listener, function() {
              channel.unsubscribe(listener);
            });
            windowContext.addEventListener('unload', function() {
              ambClient.removeChannel(channelName);
            });
            originalSubscribe.call(channel, listener);
            return channel;
          };
          channel.unsubscribe = function(listener) {
            clientSubscriptions.remove(windowContext, channel, listener);
            return originalUnsubscribe.call(channel, listener);
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
        subscribeToEvent: function(event, callback, windowContext) {
          windowContext = windowContext || window;
          var id = ambClient.subscribeToEvent(event, callback);
          clientSubscriptions.add(windowContext, id, true, function() {
            ambClient.unsubscribeFromEvent(id);
          });
          return id;
        },
        unsubscribeFromEvent: function(id, windowContext) {
          windowContext = windowContext || window;
          clientSubscriptions.remove(windowContext, id, true);
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

    function buildClientSubscriptions() {
      var contexts = [];

      function addSubscription(clientWindow, id, callback, unsubscribe) {
        if (!clientWindow || !callback || !unsubscribe) {
          return;
        }
        removeSubscription(clientWindow, id, callback);
        var context = getContext(clientWindow);
        if (!context) {
          context = createContext(clientWindow);
        }
        if (context.unloading) {
          return;
        }
        context.subscriptions.push({
          id: id,
          callback: callback,
          unsubscribe: unsubscribe
        });
      }

      function removeSubscription(clientWindow, id, callback) {
        if (!clientWindow || !callback) {
          return;
        }
        var context = getContext(clientWindow);
        if (!context) {
          return;
        }
        var subscriptions = context.subscriptions;
        for (var i = subscriptions.length - 1; i >= 0; i--) {
          if (subscriptions[i].id === id && subscriptions[i].callback === callback) {
            subscriptions.splice(i, 1);
          }
        }
      }

      function getContext(clientWindow) {
        for (var i = 0, iM = contexts.length; i < iM; i++) {
          if (contexts[i].window === clientWindow) {
            return contexts[i];
          }
        }
        return null;
      }

      function createContext(clientWindow) {
        var context = {
          window: clientWindow,
          onUnload: function() {
            context.unloading = true;
            var subscriptions = context.subscriptions;
            var subscription;
            while (subscription = subscriptions.pop()) {
              subscription.unsubscribe();
            }
            destroyContext(context);
          },
          unloading: false,
          subscriptions: []
        };
        clientWindow.addEventListener('unload', context.onUnload);
        contexts.push(context);
        return context;
      }

      function destroyContext(context) {
        for (var i = 0, iM = contexts.length; i < iM; i++) {
          if (contexts[i].window === context.window) {
            contexts.splice(i, 1);
            break;
          }
        }
        context.subscriptions = [];
        context.window.removeEventListener('unload', context.onUnload);
        context.onUnload = null;
        context.window = null;
      }
      return {
        add: addSubscription,
        remove: removeSubscription
      };
    }
  }
})();;