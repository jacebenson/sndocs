/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
    "use strict";
    var ambClient = null;
    var _window = $window.self;
    var loginWindow = null;
    var sameScope = false;
    ambClient = amb.getClient();
    if (_window.g_ambClient) {
        sameScope = true;
    }
    if (sameScope) {
        var serverConnection = ambClient.getServerConnection();
        serverConnection.loginShow = function() {
            if (!serverConnection.isLoginWindowEnabled())
                return;
            if (loginWindow && loginWindow.isVisible())
                return;
            if (serverConnection.isLoginWindowOverride())
                return;
            loginWindow = new AMBOverlay();
            loginWindow.render();
            loginWindow.show();
        };
        serverConnection.loginHide = function() {
            if (!loginWindow)
                return;
            loginWindow.hide();
            loginWindow.destroy();
            loginWindow = null;
        }
    }
    var AUTO_CONNECT_TIMEOUT = 20 * 1000;
    var connected = $q.defer();
    var connectionInterrupted = false;
    var monitorAMB = false;
    $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
    connected.promise.then(startMonitoringAMB);

    function startMonitoringAMB() {
        monitorAMB = true;
    }

    function ambInterrupted() {
        var state = ambClient.getState();
        return monitorAMB && state !== "opened" && state !== "initialized"
    }
    var interruptionTimeout;
    var extendedInterruption = false;

    function setInterrupted(eventName) {
        connectionInterrupted = true;
        $rootScope.$broadcast(eventName);
        if (!interruptionTimeout) {
            interruptionTimeout = $timeout(function() {
                extendedInterruption = true;
            }, 30 * 1000)
        }
        connected = $q.defer();
    }
    var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
        $rootScope.$broadcast("amb.connection.opened");
        if (interruptionTimeout) {
            $timeout.cancel(interruptionTimeout);
            interruptionTimeout = null;
        }
        extendedInterruption = false;
        if (connectionInterrupted) {
            connectionInterrupted = false;
            $rootScope.$broadcast("amb.connection.recovered");
        }
        connected.resolve();
    });
    var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
        setInterrupted("amb.connection.closed");
    });
    var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
        setInterrupted("amb.connection.broken");
    });
    var onUnloadWindow = function() {
        ambClient.unsubscribeFromEvent(connectOpenedEventId);
        ambClient.unsubscribeFromEvent(connectClosedEventId);
        ambClient.unsubscribeFromEvent(connectBrokenEventId);
        angular.element($window).off('unload', onUnloadWindow);
    };
    angular.element($window).on('unload', onUnloadWindow);
    var documentReadyState = $window.document ? $window.document.readyState : null;
    if (documentReadyState === 'complete') {
        autoConnect();
    } else {
        angular.element($window).on('load', autoConnect);
    }
    $timeout(autoConnect, 10000);
    var initiatedConnection = false;

    function autoConnect() {
        if (!initiatedConnection) {
            initiatedConnection = true;
            ambClient.connect();
        }
    }
    return {
        getServerConnection: function() {
            return ambClient.getServerConnection();
        },
        connect: function() {
            if (initiatedConnection) {
                ambClient.connect();
            }
            return connected.promise;
        },
        get interrupted() {
            return ambInterrupted();
        },
        get extendedInterruption() {
            return extendedInterruption;
        },
        get connected() {
            return connected.promise;
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
        getClientId: function() {
            return ambClient.getClientId();
        },
        getChannel: function(channelName) {
            return ambClient.getChannel(channelName);
        },
        registerExtension: function(extensionName, extension) {
            ambClient.registerExtension(extensionName, extension);
        },
        unregisterExtension: function(extensionName) {
            ambClient.unregisterExtension(extensionName);
        },
        batch: function(batch) {
            ambClient.batch(batch);
        },
        getState: function() {
            return ambClient.getState();
        },
        getFilterString: function(filter) {
            filter = filter.
            replace(/\^EQ/g, '').
            replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
            replace(/^GOTO/, '');
            return btoa(filter).replace(/=/g, '-');
        },
        getChannelRW: function(table, filter) {
            var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
            return this.getChannel(t);
        },
        isLoggedIn: function() {
            return ambClient.isLoggedIn();
        },
        subscribeToEvent: function(event, callback) {
            return ambClient.subscribeToEvent(event, callback);
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
});;