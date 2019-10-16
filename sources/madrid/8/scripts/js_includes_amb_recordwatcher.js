/*! RESOURCE: /scripts/js_includes_amb_recordwatcher.js */
/*! RESOURCE: /scripts/amb.RecordWatcher.js */
(function($) {
    amb['RecordWatcher'] = Class.create();
    amb.RecordWatcher.prototype = {
        initialize: function(messageClient) {
          this._messageClient = messageClient;
        },
        getChannel: function(table, queryCondition, actionPrefix) {
          if (!table) {
            console.log("[rw] getChannel: invalid table: " + table);
            return;
          }
          var channelName = this._encodeChannelName(table, queryCondition, actionPrefix);
          console.log("[rw] Registering filter: " + queryCondition + " on channel: " + channelName);
          return this._messageClient.getChannel(channelName);
        },
        _encodeChannelName: function(table, query, actionPrefix) {
            var base64EncodeQuery = btoa(query).replace(/=/g, '-');
            if (!actionPrefix)
              actionPrefix = 'default';
            ret