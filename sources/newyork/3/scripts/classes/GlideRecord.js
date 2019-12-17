/*! RESOURCE: /scripts/classes/GlideRecord.js */
var GlideRecord = Class.create({
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
        this._wantSessionMessages = true;
        this._additionalParams = {};
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
      setEncodedQuery: function(queryString) {
        this.encodedQuery = queryString;
      },
      getEncodedQuery: function() {
        var qc = [];
        if (this.encodedQuery) {
          qc.push(this.encodedQuery);
        }
        for (var i = 0; i < this.conditions.length; i++) {
          var q = this.conditions[i];
          qc.push(q.name + q.oper + q.value);
        }
        return qc.join('^');
      },
      deleteRecord: function(responseFunction) {
        var ajax = new GlideAjax(this.AJAX_PROCESSOR);
        ajax.addParam("sysparm_type", "delete");
        ajax.addParam("sysparm_name", this.getTableName());
        ajax.addParam("sysparm_chars", this._getXMLSerialized());
        ajax.addParam('sysparm_want_session_messages', this._wantSessionMessages);
        if (typeof responseFunction == 'undefined') {
          var sw = new StopWatch();
          sw.jslog("*** WARNING *** GlideRecord synchronous query for table: " + this.getTableName());
        }
        if (typeof responseFunction != 'function') {
          ajax.getXML();
          return;
        }
        ajax.getXML(this._deleteRecord0.bind(this), null, responseFunction);
      },
      _deleteRecord0: function(response, responseFunction) {
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
        return this._next();
      },
      _next: function() {
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
          var ajax = new GlideAjax(this.AJAX_PROCESSOR);
          ajax.addParam("sysparm_type", "query");
          ajax.addPar