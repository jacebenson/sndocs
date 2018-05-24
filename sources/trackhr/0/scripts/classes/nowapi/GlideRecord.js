/*! RESOURCE: /scripts/classes/nowapi/GlideRecord.js */
(function(exports) {
  'use strict';

  function GlideRecord() {
    this.initialize.apply(this, arguments);
  }
  var objDef = {
    AJAX_PROCESSOR: "AJAXGlideRecord",
    initialized: false,
    initialize: function(tableName) {
      this.currentRow = -1;
      this.rows = [];
      this.conditions = [];
      this.encodedQuery = "";
      this.orderByFields = [];
      this.orderByDescFields = [];
      this.displayFields = [];
      this.maxQuerySize = -1;
      if (tableName)
        this.setTableName(tableName);
      if (this.initialized == false) {
        this.ignoreNames = {};
        for (var xname in this) {
          this.ignoreNames[xname] = true;
        }
      } else {
        for (var xname in this) {
          if (this.ignoreNames[xname] && this.ignoreNames[xname] == true)
            continue;
          delete this[xname];
        }
      }
      this.initialized = true;
    },
    addQuery: function() {
      var fName;
      var fOper;
      var fValue;
      if (arguments.length == 2) {
        fName = arguments[0];
        fOper = '=';
        fValue = arguments[1];
      } else if (arguments.length == 3) {
        fName = arguments[0];
        fOper = arguments[1];
        fValue = arguments[2];
      }
      this.conditions.push({
        'name': fName,
        'oper': fOper,
        'value': fValue
      });
    },
    getEncodedQuery: function() {
      var ec = this.encodedQuery;
      for (var i = 0; i < this.conditions.length; i++) {
        var q = this.conditions[i];
        ec += "^" + q['name'] + q['oper'] + q['value'];
      }
      return ec;
    },
    deleteRecord: function(responseFunction) {
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "delete");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this._getXMLSerialized());
      if (typeof responseFunction != 'function') {
        ajax.getXML();
        return;
      }
      ajax.getXML(this._deleteRecord0.bind(this, responseFunction));
    },
    _deleteRecord0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      responseFunction(this);
    },
    get: function(id) {
      this.initialize();
      this.addQuery('sys_id', id);
      this.query();
      return this.next();
    },
    getTableName: function() {
      return this.tableName;
    },
    hasNext: function() {
      return (this.currentRow + 1 < this.rows.length);
    },
    insert: function(responseFunction) {
      return this.update(responseFunction);
    },
    gotoTop: function() {
      this.currentRow = -1;
    },
    next: function() {
      if (!this.hasNext())
        return false;
      this.currentRow++;
      this.loadRow(this.rows[this.currentRow]);
      return true;
    },
    loadRow: function(r) {
      for (var i = 0; i < r.length; i++) {
        var name = r[i].name;
        var value = r[i].value;
        if (this.isDotWalkField(name)) {
          var start = this;
          var parts = name.split(/-/);
          for (var p = 0; p < parts.length - 1; p++) {
            var part = parts[p];
            if (typeof start[part] != 'object')
              start[part] = new Object();
            start = start[part];
          }
          var fieldName = parts[parts.length - 1];
          start[fieldName] = value;
        } else {
          this[name] = value;
        }
      }
    },
    getValue: function(fieldName) {
      return this[fieldName];
    },
    setValue: function(fieldName, value) {
      this[fieldName] = value;
    },
    isDotWalkField: function(name) {
      for (var i = 0; i < this.displayFields.length; i++) {
        var fieldName = this.displayFields[i];
        if (fieldName.indexOf(".") == -1)
          continue;
        var encodedFieldName = fieldName.replace(/\./g, "-");
        if (name == encodedFieldName)
          return true;
      }
      return false;
    },
    addOrderBy: function(f) {
      this.orderByFields.push(f);
    },
    orderBy: function(f) {
      this.orderByFields.push(f);
    },
    orderByDesc: function(f) {
      this.orderByDescFields.push(f);
    },
    setDisplayFields: function(fields) {
      this.displayFields = fields;
    },
    query: function() {
      var responseFunction = this._parseArgs(arguments);
      if (this._getBaseLine()) {
        var rxml = loadXML(g_filter_description.getBaseLine());
        this._queryResponse(rxml);
        return;
      }
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "query");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this.getEncodedQuery());
      if (this.getLimit() != -1)
        ajax.addParam("sysparm_max_query", this.getLimit());
      if (this.orderByFields.length > 0)
        ajax.addParam("sysparm_orderby", this.orderByFields.join(","));
      if (this.orderByDescFields.length > 0)
        ajax.addParam("sysparm_orderby_desc", this.orderByDescFields.join(","));
      if (this.displayFields.length > 0)
        ajax.addParam("sysparm_display_fields", this.displayFields.join(","));
      ajax.getXML(this._query0.bind(this, responseFunction));
    },
    _parseArgs: function(args) {
      var responseFunction = null;
      var i = 0;
      while (i < args.length) {
        if (typeof args[i] == 'function') {
          responseFunction = args[i];
          i++;
          continue;
        }
        if (i + 1 < args.length) {
          this.conditions.push({
            'name': args[i],
            'oper': '=',
            'value': args[i + 1]
          });
          i += 2;
        } else
          i++;
      }
      return responseFunction;
    },
    _query0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      this._queryResponse(response.responseXML);
      responseFunction(this);
    },
    _queryResponse: function(rxml) {
      var rows = [];
      var items = rxml.getElementsByTagName("item");
      for (var i = 0; i < items.length; i++) {
        if ((items[i].parentNode.parentNode == rxml)) {
          var grData = items[i];
          var cnodes = grData.childNodes;
          var fields = [];
          for (var z = 0; z < cnodes.length; z++) {
            var field = cnodes[z];
            var name = field.nodeName;
            var value = getTextValue(field);
            if (!value)
              value = "";
            fields.push({
              'name': name,
              'value': value
            });
          }
          if (cnodes.length && cnodes.length > 0)
            rows.push(fields);
        }
      }
      this.setRows(rows);
    },
    setRows: function(r) {
      this.rows = r;
    },
    setTableName: function(tableName) {
      this.tableName = tableName;
    },
    update: function(responseFunction) {
      var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
      ajax.addParam("sysparm_type", "save_list");
      ajax.addParam("sysparm_name", this.getTableName());
      ajax.addParam("sysparm_chars", this._getXMLSerialized());
      if (typeof responseFunction != 'function')
        responseFunction = doNothing;
      ajax.getXML(this._update0.bind(this, responseFunction));
    },
    _update0: function(responseFunction, response) {
      if (!response || !response.responseXML)
        return;
      var answer = this._updateResponse(response.responseXML);
      responseFunction(this, answer);
    },
    _updateResponse: function(rxml) {
      var items = rxml.getElementsByTagName("item");
      if (items && items.length > 0)
        return getTextValue(items[0]);
    },
    setLimit: function(maxQuery) {
      this.maxQuerySize = maxQuery;
    },
    getLimit: function() {
      return this.maxQuerySize;
    },
    _getXMLSerialized: function() {
      var xml = loadXML("<record_update/>");
      var root = xml.documentElement;
      if (this.sys_id)
        root.setAttribute("id", this.sys_id);
      root.setAttribute('table', this.getTableName());
      var item = xml.createElement(this.getTableName());
      root.appendChild(item);
      for (var xname in this) {
        if (this.ignoreNames[xname])
          continue;
        var f = xml.createElement(xname);
        item.appendChild(f);
        var v = this[xname];
        if (!v)
          v = "NULL";
        var t = xml.createTextNode(v);
        f.appendChild(t);
      }
      return getXMLString(xml);
    },
    _getBaseLine: function() {
      return window.g_filter_description &&
        typeof g_filter_description.getBaseLine() != 'undefined' &&
        this.getTableName() == 'cmdb_baseline' &&
        this.getEncodedQuery() &&
        this.orderByFields.length < 1 &&
        this.displayFields.length < 1;
    },
    z: null
  };
  GlideRecord.prototype = objDef;

  function getTextValue(node) {
    if (node.textContent)
      return node.textContent;
    var firstNode = node.childNodes[0];
    if (!firstNode)
      return null;
    if (firstNode.data)
      return firstNode.data;
    return firstNode.nodeValue;
  }

  function loadXML(r) {
    var xml = r.responseXML;
    if (typeof xml != 'undefined')
      return xml;
    var dom = null;
    try {
      dom = new DOMParser().parseFromString(r, 'text/xml');
    } catch (e) {}
    return dom;
  }

  function doNothing() {}

  function getXMLString(node) {
    var xml = "???";
    if (node.xml) {
      xml = node.xml;
    } else if (window.XMLSerializer) {
      xml = (new XMLSerializer()).serializeToString(node);
    }
    return xml;
  }
  exports.GlideRecord = window.GlideRecord || GlideRecord;
})(nowapi);;