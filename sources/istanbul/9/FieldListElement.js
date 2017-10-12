/*! RESOURCE: /scripts/classes/FieldListElement.js */
var FieldListElement = Class.create({
      initialize: function(name, dependent, dependentTable, defaultDisplayName, newRecord) {
        this.name = name;
        this.dependent = dependent;
        this.table = dependentTable == "null" ? null : dependentTable;
        this.defaultDisplayName = (defaultDisplayName == "true");
        if (this.defaultDisplayName)
          this.tableChanged = (newRecord == "true");
        else
          this.tableChanged = false;
        this.displayName = "";
        this.lastValue = "";
        this.initialSetup = true;
      },
      onLoad: function() {
        if (!this.table) {
          var table = resolveDependentValue(this.name, this.dependent, this.table);
          this.table = table;
        }
        this._listCols();
      },
      depChange: function() {
        gel(this.name).value = "";
        this._setTableName();
      },
      moveOptionUpdate: function(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel,
        direction, property) {
        moveOption(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel,
          direction, property);
        this._setListValues();
      },
      moveUpUpdate: function(select) {
        moveUp(gel(select));
        this._setListValues();
      },
      moveDownUpdate: function(select) {
        moveDown(gel(select));
        this._setListValues();
      },
      _listCols: function() {
        var colist = gel(this.name);
        var url = "xmlhttp.do?sysparm_processor=ListColumns&sysparm_expanded=0&sysparm_name=" + this.table +
          "&sysparm_include_display_name=true";
        if (colist.value.length > 0)
          url += "&sysparm_col_list=" + colist.value;
        jslog("FieldListElement: _listCols calling AJAX " + url);
        serverRequest(url, this._colsReturned.bind(this), null);
      },
      _colsReturned: function(request) {
          jslog("FieldListElement: _colsReturned AJAX response received");
          var tcols = request.responseXML;
          var scols = gel("ni." + this.name + ".select_1");
          scols.options.length = 0;
          var acols = gel("ni." + this.name + ".select_0");
          acols.options.length = 0;
          var colist = gel(this.name);
          var mfields = new Array();
          var useSpecFields = false;
          var root = tcols.getElementsByTagName("xml")[0];
          this.displayName = root.getAttribute("displayName");
          if (this.tableChanged) {
            if (this.defaultDisplayName)
              colist.value = this.displayName;
            else
              colist.value = '';
          }
          if (colist.value.length > 0) {
            mfields = colist.value.split(",");
            if (mfields.length > 0)
              useSpecFields = true;
          }
          var items = tcols.getElementsByTagName("item");
          for (var i = 0; i != items.length; i++) {
            var item = items[i];
            var value = item.getAttribute("value");
            var label = item.getAttribute("label");
            var ref = item.getAttribute("reference");
            if (ref) {
              if (ref == '')
                ref = null;
            }
            if (valueExistsInArray(value, mfields)) {
              scols.options[scols.