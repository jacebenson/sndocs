/*! RESOURCE: /scripts/amb.ChannelRedirect.js */
(function($) {
  amb['ChannelRedirect'] = Class.create();
  amb.ChannelRedirect.prototype = {
    initialize: function(ambClient, serverConnection,
      channelProvider) {
      this._eventManager = new amb.EventManager({
        CHANNEL_REDIRECT: 'channel.redirect'
      });
      this._LOGGER = new amb.Logger(this.type);
      this._client = ambClient;
      this._serverConnection = serverConnection;
      this._channelProvider = channelProvider;
      this._initializeChannelWhenReady();
    },
    _initializeChannelWhenReady: function() {
      var metaChannel = this._channelProvider('/sn/meta/channel_redirect/' + this._client.getClientId());
      metaChannel.newListener(this._serverConnection, null).subscribe(this._onAdvice.bind(this));
    },
    _onAdvice: function(advice) {
      this._LOGGER.debug('_onAdvice:' + advice.data.clientId);
      var fromChannel = this._channelProvider(advice.data.fromChannel);
      var toChannel = this._channelProvider(advice.data.toChannel);
      this._eventManager.publish(this.getEvents().CHANNEL_REDIRECT, [fromChannel, toChannel]);
      this._LOGGER.debug(
        'published channel switch event, fromChannel:' + fromChannel.getName() +
        ', toChannel:' + toChannel.getName());
    },
    subscribeToEvent: function(event, callback) {
      return this._eventManager.subscribe(event, callback);
    },
    unsubscribeToEvent: function(id) {
      this._eventManager.unsubscribe(id);
    },
    getEvents: function() {
      return this._eventManager.getEvents();
    },
    type: 'amb.ChannelRedirect'
  }
})(jQuery);;