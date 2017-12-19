var SchemaCompare = Class.create();

SchemaCompare.prototype = {
  initialize : function(primaryPrefix, schemaSysId) {
     if (gs.nil(primaryPrefix))
         primaryPrefix = GlideDBUtil.getPrimaryPrefix();

     this.primaryDBI = this._getDBI(primaryPrefix);
     this.schemaSysId = schemaSysId;
  },

  startCompare: function() {
     var gr = new GlideRecord('sys_schema_check');

     if (!gr.get(this.schemaSysId)) {
         gr.state = "Error";
         gr.update();
         return;
     }

     gr.state = "Active";
     gr.update();

     this.compareAllTables();

     gr.state = "Completed";
     gr.update();
  },

  compareAllTables: function() {
     var gr = new GlideRecord('sys_dictionary');
     gr.addQuery('name', '!=', '');
     gr.addQuery('element', '');
     gr.orderBy('name');
     gr.query();

     while(gr.next()) {
       var tableName = gr.name.toString();
       var isArray = gr.array;

       if (tableName.startsWith("sysx_") || tableName.startsWith("v_"))
           continue;

       this.compareTable(tableName);
     }
  },

  compareTable: function(tableName) {
     var badjuju = false;
     var checkGr = new GlideRecord('sys_schema_check_table');
     checkGr.table_name = tableName;
     checkGr.parent = this.schemaSysId;
     var checkSysId = checkGr.insert();

     var dctFields = this._getTableColumnsFromDictionary(this.primaryDBI, tableName);
     var sqlFields = this._getTableColumnsFromSQL(this.primaryDBI, tableName);

     for(var i = dctFields.length - 1; i >= 0; i--) {
         var field = dctFields[i];

         var index = this._fieldIndexInArray(sqlFields, field.name);

         if (field.isArray == '1') {
             delete dctFields[i];

             var rolesTable = tableName + field.name;

             var exists = this.primaryDBI.hardCheck(rolesTable);
             if (!exists) {
                 var index = this._fieldIndexInArray(sqlFields, field.name);
                 if (index > -1) {
                       delete sqlFields[index];
                 } else {
                     this._insertMissingTable(rolesTable);
                     badjuju = true;
                 }
             }
         } else {
             var index = this._fieldIndexInArray(sqlFields, field.name);

             if (index > -1) {
                   var sqlField = sqlFields[index];
                   var dctField = dctFields[i];

                   var sf = new GlideSysField();
                   if (!sf.isAuto(dctField.name)) {
                       var ed = new GlideElementDescriptor(dctField.name, dctField.internal_type, dctField.max_length);
                       var dTypeName = ed.toSQLType(this.primaryDBI);

                       if (dTypeName.indexOf('(') > -1)
                           dTypeName = dTypeName.substring(0, dTypeName.indexOf('('));

                       var sTypeName = sqlField.type_name;

                       if (dctField.type != sqlField.type) {
                           if (dTypeName.toLowerCase() != sTypeName.toLowerCase()) {
                               this._insertDetail(checkSysId, field.name, 3, "Expected " + dTypeName + " but database type is " + sTypeName);
                               badjuju = true;
                           }
                       }
                   }

                   delete sqlFields[index];
                   delete dctFields[i];
             }
         }
     }

     for(var i = sqlFields.length - 1; i >= 0; i--) {
         var field = sqlFields[i];

         if (typeof field == 'undefined')
             continue;

         this._insertDetail(checkSysId, field.name, 1);
         badjuju = true;
     }

     for(var i = dctFields.length - 1; i >= 0; i--) {
         var field = dctFields[i];

         if (typeof field == 'undefined')
             continue;

         this._insertDetail(checkSysId, field.name, 2);
         badjuju = true;
     }

     if (badjuju) {
         checkGr.state = 2;
     } else {
         checkGr.state = 1;
     }

     checkGr.update();
  },

  _insertMissingTable: function(tableName) {
     var gr = new GlideRecord('sys_schema_check_table');
     gr.table_name = tableName;
     gr.parent = this.schemaSysId;
     gr.state = 4;
     gr.insert();
  },

  _insertDetail: function(checkSysId, fieldName, state, details) {
     var gr = new GlideRecord('sys_schema_check_detail');
     gr.field_name = fieldName;
     gr.parent = checkSysId;
     gr.state = state;
     gr.details = details;
     gr.insert();
  },

  close: function() {
    if (this.primaryDBI)
        this.primaryDBI.close();
  },

  _getDBI: function(prefix) {
    return new GlideDBConfiguration(prefix, true).configure();
  },

  _getTableColumnsFromDictionary: function(dbi, tableName) {
    var fields = new Array();

    var q = new GlideDBQuery(dbi, "sys_dictionary");
    q.setSuppressSeparation(true);
    q.setRawSelect(true);
    q.addQuery('name', tableName);
    q.addQuery('element', '!=', '');
    var t = q.execute();
    var it = t.getTableIterator();
    while (it.hasNext()) {
        var row = it.nextRow();

        var elementName = row.getValue('element');
        var itype = row.getValue("internal_type");
        var jtype = GlideDBTypes.fromGlideToJDBC(itype);
        var ed = GlideTableDescriptor.get(tableName).getElementDescriptor(elementName);

        fields.push({ name: elementName, type: jtype, internal_type: itype, max_length: row.getValue("max_length"), isArray: row.getValue("array") });
    }

    return fields;
  },

  _getTableColumnsFromSQL: function(dbi, tableName) {
    var fields = new Array();

    var al = GlideDBUtil.getFullColumnList(dbi, tableName);

    for(var c = 0; c < al.size(); c++) {
        var r = al.get(c);
        fields.push({ name: r.get("column_name"), type: r.get("data_type"), type_name: r.get("type_name") });
    }

    return fields;
  },

  _getColumnsFroMetaData: function(md) {
    var columnCount = md.getColumnCount();
    var columns = new Packages.java.util.ArrayList(columnCount);
    for (var i = columnCount; i > 0; i--)
        columns.add(md.getColumnName(i));
		
    //columns sorted in natural order as select may return columns in random order
    Packages.java.util.Collections.sort(columns);
		
    return columns;
  },

  _fieldIndexInArray: function(array, name) {
    for (var i = 0; i < array.length; i++) {
        var val = array[i];

        if (typeof val != 'undefined' && val.name == name) 
            return i;        
    }

    return -1;
  },

  type: "SchemaCompare"
}