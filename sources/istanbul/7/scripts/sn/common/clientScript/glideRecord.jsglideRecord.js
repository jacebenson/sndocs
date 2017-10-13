/*! RESOURCE: /scripts/sn/common/clientScript/glideRecord.js */
(function(exports, undefined) {
  'use strict';

  function GlideRecord(table) {
    if (!(this instanceof GlideRecord)) {
      return new GlideRecord(table);
    }
    this.initialize.apply(this, arguments);
  }
  GlideRecord.glideRequest = exports.glideRequest;
  GlideRecord.prototype = {
    initialize: function(table) {
      this.tableName = table;
      this.encodedQuery = '';
      this.conditions = [];
      this.orderByFields = [];
      this.limit = 0;
      this._callback = null;
      this.currentRow = -1;
      this.recordSet = [];
    },
    addQuery: function() {
      var args = [];
      Array.prototype.push.apply(args, arguments);
      var name = args.shift(),
        oper, value;
      oper = args.length == 1 ? "=" : args.shift();
      value = args.shift();
      this.conditions.push({
        'name': name,
        'oper': oper,
        'value': value
      });
    },
    setEncodedQuery: function(queryString) {
      this.encodedQuery = queryString;
    },
    getEncodedQuery: function() {
      var qc = [];
      var ec = this.encodedQuery;
      if (ec) {
        qc.push(ec);
      }
      for (var i = 0; i < this.conditions.length; i++) {
        var q = this.conditions[i];
        qc.push(q['name'] + q['oper'] + q['value']);
      }
      return '^' + qc.join('^');
    },
    addOrderBy: function(field) {
      this.orderByFields.push(field);
    },
    setLimit: function(maxRows) {
      this.limit = maxRows;
    },
    getLimit: function() {
      return this.limit;
    },
    get: function() {
      this.initialize(this.tableName);
      this.setLimit(1);
      var callback;
      if (arguments.length == 2) {
        this.addQuery('sys_id', arguments[0]);
        callback = arguments[1];
      } else if (arguments.length == 3) {
        this.addQuery(arguments[0], arguments[1]);
        callback = arguments[2];
      }
      if (!callback) {
        _logWarn('GET:NOCB', 'Get must be called with a callback function');
        return;
      }
      this.query(this._getResponse.bind(this, callback));
    },
    _getResponse: function(callback) {
      this.next();
      callback(this);
    },
    query: function(callback) {
      if (typeof callback !== 'function') {
        _logWarn('Q:NOCB', 'Query must be called with a callback function');
        return;
      }
      var glideRequest = GlideRecord.glideRequest;
      var src = glideRequest.getAngularURL('gliderecord', {
        operation: 'query'
      });
      glideRequest.post(src, {
        dataType: 'json',
        data: {
          table: this.tableName,
          query: this.getEncodedQuery(),
          orderBy: this.orderByFields.join(','),
          limit: this.getLimit()
        }
      }).then(this._queryResponse.bind(this, callback));
    },
    _queryResponse: function(callback, response) {
      this._loadRecordSet(response.data.records);
      callback(this);
    },
    deleteRecord: function() {
      _logError('UNSUPPORTED', 'deleteRecord is not supported on mobile');
    },
    update: function() {
      _logError('UNSUPPORTED', 'update is not supported on mobile');
    },
    hasNext: function() {
      return this.currentRow + 1 < this.recordSet.length;
    },
    next: function() {
      if (!this.hasNext())
        return false;
      this.loadRow(this.currentRow + 1);
      return true;
    },
    loadRow: function(index) {
      var row = this.recordSet[index];
      this.currentRow = index;
      var currentRow = this.getCurrentRow();
      for (var i in currentRow) {
        if (!currentRow.hasOwnProperty(i)) {
          continue;
        }
        this[i] = currentRow[i].value;
      }
    },
    _loadRecordSet: function(records) {
      this.recordSet = records || [];
    },
    getValue: function(fieldName) {
      var current = this.getCurrentRow();
      return current ? current[fieldName].value : '';
    },
    getDisplayValue: function(fieldName) {
      var current = this.getCurrentRow();
      if (!fieldName) {
        return current ? current['$$displayValue'] : '';
      }
      return current ? current[fieldName].displayvalue : '';
    },
    getCurrentRow: function() {
      return this.recordSet[this.currentRow];
    },
    getRowCount: function() {
      return this.recordSet.length;
    },
    getTableName: function() {
      return this.tableName;
    },
    toString: function() {
      return 'GlideRecord';
    }
  };

  function _logError(code, msg) {
    if (console && console.error) {
      console.error('(GlideRecord) [' + code + '] ' + msg);
    }
  }

  function _logWarn(code, msg) {
    if (console && console.warn) {
      console.warn('(GlideRecord) [' + code + '] ' + msg);
    }
  }
  exports.GlideRecord = GlideRecord;
})(window);;