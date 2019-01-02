/*! RESOURCE: /scripts/sn/common/messaging/deprecated/NOW.messaging.record.js */
(function(global) {
  "use strict";
  if (typeof global.NOW === 'undefined' || typeof global.NOW.messaging === 'undefined') {
    console.error("Messaging API not defined, skipping creating of record messaging API");
    return;
  }
  var messaging = global.NOW.messaging = global.NOW.messaging || {};
  messaging.record = messaging.record || (function() {
    var recordChannel = global.NOW.MessageBus.channel('record');

    function basePayload(table, record, source) {
      return {
        table: table,
        record: record,
        source: source
      }
    }
    return {
      created: function(tableName, record, source) {
        recordChannel.publish('record.created', basePayload(tableName, record, source));
      },
      updated: function(tableName, record, changes, source) {
        var payload = basePayload(tableName, record, source);
        payload.changes = changes;
        recordChannel.publish('record.updated.field', payload);
      },
      deleted: function(tableName, record, source) {
        recordChannel.publish('record.deleted', basePayload(tableName, record, source));
      },
      commentAdded: function(tableName, record, comment, source) {
        var payload = basePayload(tableName, record, source);
        payload.comment = comment;
        recordChannel.publish('record.updated.comment.added', payload);
      }
    };
  })();
})(this);;