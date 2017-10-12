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
            var q = this.con