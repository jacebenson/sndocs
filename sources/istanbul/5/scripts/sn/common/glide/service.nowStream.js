/*! RESOURCE: /scripts/sn/common/glide/service.nowStream.js */
angular.module('sn.common.glide').constant('nowStreamTimerInterval', 5000);
angular.module('sn.common.glide').factory('nowStream', function($q, $timeout, urlTools, nowStreamTimerInterval, snResource, $log) {
  'use strict';
  var Stream = function() {
    this.initialize.apply(this, arguments);
  };
  Stream.prototype = {
    initialize: function(table, query, sys_id, processor, interval, source, includeAttachments) {
      this.table = table;
      this.query = query;
      this.sysparmQuery = null;
      this.sys_id = sys_id;
      this.processor = processor;
      this.lastTimestamp = 0;
      this.inflightRequest = null;
      this.requestImmediateUpdate = false;
      this.interval = interval;
      this.source = source;
      this.includeAttachments = includeAttachments;
      this.stopped = true;
    },
    setQuery: function(sysparmQuery) {
      this.sysparmQuery = sysparmQuery;
    },
    poll: function(callback, preRequestCallback) {
      this.callback = callback;
      this.preRequestCallback = preRequestCallback;
      this._stopPolling();
      this._startPolling();
    },
    tap: function() {
      if (!this.inflightRequest) {
        this._stopPolling();
        this._startPolling();
      } else
        this.requestImmediateUpdate = true;
    },
    insert: function(field, text) {
      this.insertForEntry(field, text, this.table, this.sys_id);
    },
    insertForEntry: function(field, text, table, sys_id) {
      return this.insertEntries([{
        field: field,
        text: text
      }], table, sys_id);
    },
    expandMentions: function(entryText, mentionIDMap) {
      return entryText.replace(/@\[(.+?)\]/gi, function(mention) {
        var mentionedName = mention.substring(2, mention.length - 1);
        if (mentionIDMap[mentionedName]) {
          return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
        } else {
          return mention;
        }
      });
    },
    insertEntries: function(entries, table, sys_id, mentionIDMap) {
      mentionIDMap = mentionIDMap || {};
      var sanitizedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var entryText = entries[i].text;
        if (entryText && entryText.endsWith('\n'))
          entryText = entryText.substring(0, entryText.length - 1);
        if (!entryText)
          continue;
        entries[i].text = this.expandMentions(entryText, mentionIDMap);
        sanitizedEntries.push(entries[i]);
      }
      if (sanitizedEntries.length === 0)
        return;
      this._isInserting = true;
      var url = this._getInsertURL(table, sys_id);
      var that = this;
      return snResource().post(url, {
        entries: sanitizedEntries
      }).then(this._successCallback.bind(this), function() {
        $log.warn('Error submitting entries', sanitizedEntries);
      }).then(function() {
        that._isInserting = false;
      });
    },
    cancel: function() {
      this._stopPolling();
    },
    _startPolling: function() {
      var interval = this._getInterval();
      var that = this;
      var successCallback = this._successCallback.bind(this);
      that.stopped = false;

      function runPoll() {
        if (that._isInserting) {
          establishNextRequest();
          return;
        }
        if (!that.inflightRequest) {
          that.inflightRequest = that._executeRequest();
          that.inflightRequest.then(successCallback);
          that.inflightRequest.finally(function() {
            that.inflightRequest = null;
            if (that.requestImmediateUpdate) {
              that.requestImmediateUpdate = false;
              establishNextRequest(0);
            } else {
              establishNextRequest();
            }
          });
        }
      }

      function establishNextRequest(intervalOverride) {
        if (that.stopped)
          return;
        intervalOverride = (parseFloat(intervalOverride) >= 0) ? intervalOverride : interval;
        $timeout.cancel(that.timer);
        that.timer = $timeout(runPoll, intervalOverride);
      }
      runPoll();
    },
    _stopPolling: function() {
      if (this.timer)
        $timeout.cancel(this.timer);
      this.stopped = true;
    },
    _executeRequest: function() {
      var url = this._getURL();
      if (this.preRequestCallback) {
        this.preRequestCallback();
      }
      return snResource().get(url);
    },
    _getURL: function() {
      var params = {
        table: this.table,
        action: this._getAction(),
        sysparm_silent_request: true,
        sysparm_auto_request: true,
        sysparm_timestamp: this.lastTimestamp,
        include_attachments: this.includeAttachments
      };
      if (this.sys_id) {
        params['sys_id'] = this.sys_id;
      } else if (this.sysparmQuery) {
        params['sysparm_query'] = this.sysparmQuery;
      }
      var url = urlTools.getURL(this.processor, params);
      if (!this.sys_id) {
        url += "&p=" + this.query;
      }
      return url;
    },
    _getInsertURL: function(table, sys_id) {
      return urlTools.getURL(this.processor, {
        action: 'insert',
        table: table,
        sys_id: sys_id,
        sysparm_timestamp: this.timestamp || 0,
        sysparm_source: this.source
      });
    },
    _successCallback: function(response) {
      var response = response.data;
      if (response.entries && response.entries.length) {
        response.entries = this._filterOld(response.entries);
        if (response.entries.length > 0) {
          this.lastEntry = angular.copy(response.entries[0]);
          this.lastTimestamp = response.sys_timestamp || response.entries[0].sys_timestamp;
        }
      }
      this.callback.call(null, response);
    },
    _filterOld: function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].sys_timestamp == this.lastTimestamp) {
          if (!angular.equals(this._makeComparable(entries[i]), this._makeComparable(this.lastEntry)))
            continue;
        }
        if (entries[i].sys_timestamp <= this.lastTimestamp)
          return entries.slice(0, i);
      }
      return entries;
    },
    _makeComparable: function(entry) {
      var copy = angular.copy(entry);
      delete copy.short_description;
      delete copy.display_value;
      return copy;
    },
    _getAction: function() {
      return this.sys_id ? 'get_new_entries' : 'get_set_entries';
    },
    _getInterval: function() {
      if (this.interval)
        return this.interval;
      else if (window.NOW && NOW.stream_poll_interval)
        return NOW.stream_poll_interval * 1000;
      else
        return nowStreamTimerInterval;
    }
  };
  return {
    create: function(table, query, sys_id, processor, interval, source) {
      return new Stream(table, query, sys_id, processor, interval, source);
    }
  };
});;