/*! RESOURCE: /scripts/amb.ServerConnection.js */
(function($) {
  amb['ServerConnection'] = Class.create();
  amb.ServerConnection.prototype = {
    initialize: function(cometd) {
      this._cometd = cometd;
      this._connected = false;
      this._disconnecting = false;
      this._eventManager = new amb.EventManager({
        CONNECTION_INITIALIZED: 'connection.initialized',
        CONNECTION_OPENED: 'connection.opened',
        CONNECTION_CLOSED: 'connection.closed',
        CONNECTION_BROKEN: 'connection.broken',
        SESSION_LOGGED_IN: 'session.logged.in',
        SESSION_LOGGED_OUT: 'session.logged.out'
      });
      this._state = "closed";
      this._LOGGER = new amb.Logger(this.type);
      this._initializeMetaChannelListeners();
      this._loggedIn = true;
      this._loginWindow = null;
      this._loginWindowEnabled = amb['properties']['loginWindow'] == 'true';
      this._lastError = null;
      this._errorMessages = {
        UNKNOWN_CLIENT: '402::Unknown client'
      };
      this._loginWindowOverride = false;
    },
    _initializeMetaChannelListeners: function() {
      this._cometd.addListener('/meta/handshake', this, this._metaHandshake);
      this._cometd.addListener('/meta/connect', this, this._metaConnect);
    },
    _metaHandshake: function(message) {
      if (message.successful)
        this._connectionInitialized();
    },
    _metaConnect: function(message) {
      if (this._disconnecting) {
        this._connected = false;
        this._connectionClosed();
        return;
      }
      var error = message['error'];
      if (error)
        this._lastError = error;
      this._sessionStatus(message);
      var wasConnected = this._connected;
      this._connected = (message.successful === true);
      if (!wasConnected && this._connected)
        this._connectionOpened();
      else if (wasConnected && !this._connected)
        this._connectionBroken();
    },
    _connectionInitialized: function() {
      this._LOGGER.debug('Connection initialized');
      this._state = "initialized";
      this._eventManager.publish(this.getEvents().CONNECTION_INITIALIZED);
    },
    _connectionOpened: function() {
      this._LOGGER.debug('Connection opened');
      this._state = "opened";
      this._eventManager.publish(this.getEvents().CONNECTION_OPENED);
    },
    _connectionClosed: function() {
      this._LOGGER.debug('Connection closed');
      this._state = "closed";
      this._eventManager.publish(this.getEvents().CONNECTION_CLOSED);
    },
    _connectionBroken: function() {
      this._LOGGER.addErrorMessage('Connection broken');
      this._state = "broken";
      this._eventManager.publish(this.getEvents().CONNECTION_BROKEN);
    },
    getEvents: function() {
      return this._eventManager.getEvents();
    },
    subscribeToEvent: function(event, callback) {
      if (this.getEvents().CONNECTION_OPENED === event && this._connected) {
        callback();
        return;
      }
      return this._eventManager.subscribe(event, callback);
    },
    unsubscribeFromEvent: function(id) {
      this._eventManager.unsubscribe(id);
    },
    getConnectionState: function() {
      return this._state;
    },
    _getLastError: function() {
      return this._lastError;
    },
    _setLastError: function(error) {
      this._lastError = error;
    },
    _getErrorMessages: function() {
      return this._errorMessages;
    },
    _sessionStatus: function(message) {
      var ext = message['ext'];
      if (ext) {
        var sessionStatus = ext['glide.session.status'];
        this._loginWindowOverride = ext['glide.amb.login.window.override'] === true;
        this._LOGGER.debug('session.status - ' + sessionStatus);
        switch (sessionStatus) {
          case 'session.logged.out':
            if (this._loggedIn)
              this._logout();
            break;
          case 'session.logged.in':
            if (!this._loggedIn)
              this._login();
            break;
          default:
            this._LOGGER.debug("unknown session status - " + sessionStatus);
            break;
        }
      }
    },
    _login: function() {
      this._loggedIn = true;
      this._LOGGER.debug("LOGGED_IN event fire!");
      this._eventManager.publish(this.getEvents().SESSION_LOGGED_IN);
      this.loginHide();
    },
    _logout: function() {
      this._loggedIn = false;
      this._LOGGER.debug("LOGGED_OUT event fire!");
      this._eventManager.publish(this.getEvents().SESSION_LOGGED_OUT);
      this.loginShow();
    },
    isLoggedIn: function() {
      return this._loggedIn;
    },
    loginShow: function() {
      if (!this._loginWindowEnabled)
        return;
      if (this._loginWindowOverride)
        return;
      var dialog = new GlideModal('amb_disconnect_modal');
      if (dialog['renderWithContent']) {
        dialog.template = this._modalTemplate;
        dialog.renderWithContent(this._modalContent);
      } else {
        dialog.setBody(this._modalContent);
        dialog.render();
      }
      this._loginWindow = dialog;
    },
    loginHide: function() {
      if (!this._loginWindow)
        return;
      this._loginWindow.destroy();
      this._loginWindow = null;
    },
    loginComplete: function() {
      this._login();
    },
    connect: function() {
      if (this._connected) {
        console.log(">>> connection exists, request satisfied");
        return;
      }
      this._LOGGER.debug('Connecting to glide amb server -> ' + amb['properties']['servletURI']);
      this._cometd.configure({
        url: this._getRelativePath(amb['properties']['servletURI']),
        logLevel: amb['properties']['logLevel']
      });
      this._cometd.handshake();
    },
    abort: function() {
      this._cometd.getTransport().abort();
    },
    disconnect: function() {
      this._LOGGER.debug('Disconnecting from glide amb server..');
      this._disconnecting = true;
      this._cometd.disconnect();
    },
    _getRelativePath: function(uri) {
      var relativePath = "";
      for (var i = 0; i < window.location.pathname.match(/\//g).length - 1; i++) {
        relativePath = "../" + relativePath;
      }
      return relativePath + uri;
    },
    type: 'amb.ServerConnection',
    _modalContent: '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>',
    _modalTemplate: '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
      '  <div class="modal-dialog small-modal" style="width:450px">' +
      '     <div class="modal-content">' +
      '        <header class="modal-header">' +
      '           <h4 id="small_modal1_title" class="modal-title">Login</h4>' +
      '        </header>' +
      '        <div class="modal-body">' +
      '        </div>' +
      '     </div>' +
      '  </div>' +
      '</div>'
  }
})(jQuery);;