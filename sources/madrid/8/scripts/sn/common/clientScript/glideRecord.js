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
  var changeValues = [];
  GlideRecord.prototype = {
    initialized: false,
    initialize: function(table) {
      this.tableName = table;
      this.encodedQuery = '';
      this.conditions = [];
      this.orderByFields = [];
      this.orderByDescFields = [];
      this.limit = 0;
      this._callback = null;
      this.currentRow = -1;
      this.recordSet = [];
      if (!this.initialized) {
        this.ignoreNames = {};
        for (var xname in this) {
          this.ignoreNames[xname] = true;
        }
      } else {
        for (var xname in this) {
          if (this.ignoreNames[xname])
            continue;
          delete this[xname];
        }
      }
      this.initialized = true;
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
    orderBy: function(field) {
      this.addOrderBy(field);
    },
    orderByDesc: function(field) {
      this.orderByDescFields.push(field);
    },
    setLimit: function(maxRows) {
      this.limit = maxRows;
    },
    getLimit: function() {
      return this.limit;
    },
    get: function() {
      if (arguments.length == 1) {
        _logWarn('GET:NOCB', 'Get must be called with a callback function');
      }
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
          orderByDesc: this.orderByDescFields.join(','),
          limit: this.getLimit()
        }
      }).then(this._queryResponse.bind(this, callback));
    },
    _queryResponse: function(callback, response) {
      this._loadRecordSet(response.data.records);
      callback(this);
    },
    deleteRecord: function(callback) {
      if (typeof callback !== 'function') {
        _logError('Q:NOCB', 'DeleteRecord must be called with a callback function');
        return;
      }
      var glideRequest = GlideRecord.glideRequest;
      var src = glideRequest.getAngularURL('gliderecord', {
        operation: 'delete'
      });
      glideRequest.post(src, {
        dataType: 'json',
        data: {
          table: this.tableName,
          query: this.getEncodedQuery(),
          sysid: this.getValue('sysid')
        }
      }).then(callback(this));
    },
    updateRecord: function(callback) {
      if (typeof callback !== 'function') {
        _logError('Q:NOCB', 'UpdateRecord must be called with a callback function');
        return;
      }
      var glideRequest = GlideRecord.glideRequest;
      var src = glideRequest.getAngularURL('gliderecord', {
        operation: 'update'
      });
      glideRequest.post(src, {
        dataType: 'json',
        data: {
          table: this.tableName,
          sysid: this.getValue('sysid'),
          serializedRecord: changedFields(this)
        }
      }).then(callback(this));
    },
    hasNext: function() {
      return this.currentRow + 1 < this.recordSet.length;
    },
    next: function() {
      return this._next();
    },
    _next: function() {
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
    setValue: function(fieldName, value) {
      getChangeValues(fieldName, value);
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

  function getChangeValues(fieldName, fieldValue) {
    changeValues.push({
      'fieldName': fieldName,
      'value': fieldValue
    });
  }

  function changedFields(object) {
    for (var fieldName in object) {
      if (object.ignoreNames[fieldName])
        continue;
      if (object.getValue(fieldName) === object[fieldName])
        continue;
      changeValues.push({
        'fieldName': fieldName,
        'value': object[fieldName]
      });
    }
    return changeValues;
  }

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