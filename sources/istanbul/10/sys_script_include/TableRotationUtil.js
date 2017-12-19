gs.include("PrototypeServer"); 

var TableRotationUtil = Class.create();

TableRotationUtil.prototype = {

   initialize : function() {
      this.suffix = '';
      this.objectManager = new GlideDBObjectManager.get();
   },

   synchronize : function() {
      gs.log("Received request to synchronize table rotations with current table definitions");
      var list = new TableRotationList().getList();
      for (rotation in list) 
         list[rotation].synchronize();
   },

   // Create an extension table for the given table
   create : function(tableName) {
      this.targetTable = tableName;
      this.suffix = this._getRotationSuffix();
      gs.log("Create extension tables for " + this.targetTable);
      this.extList = this._getExtensions(tableName);
      this._createTables();
      return this._getRotationName(tableName);
   }, 

   // Create all extensions necessary for a table
   _createTables : function() {
      gs.log("Going to create extensions: " + this.extList);
      if (this.extList.size() == 0) 
         this._createRotation(this.targetTable, null);

      else for (var i = 0; i < this.extList.size(); i++) {
         var tblObject = this.extList.get(i);
         this.targetTable = tblObject.getName()+'';
         var parentName = null;
         if (tblObject.getParent())
            parentName = tblObject.getParent().getName()+'';

         this._createRotation(this.targetTable, parentName);
      }
   },

   // Create an rotation that extends a table
   _createRotation : function(tableName, parentName) {
      var tName = this._getRotationName(tableName);
      var gr = new GlideRecord(tableName);
      gr.initialize();
      var td = GlideTableDescriptor.get(tableName);
      this.displayName = td.getDisplayName();
      var tLabel = gr.getLabel();
      this.creator = new TableDescriptor(tName, tLabel);
      var parent = parentName;
      if (parent != null) {
         ex = this._getRotationName(parent);
         this.creator.setExtends(ex);
      }

      this.creator.setFields(gr);
      this.creator.copyAttributes(td);
      this.creator.create();
      this.creator.copyIndexes(tableName, tName);
      this.rotationTableName = tName;
   },

   _setReference : function (ca) {
      var ref = this.currentFieldObject.getED().getReference();
      if (ref == null || ref == '')
         return;
     
      ca.setReferenceTable(ref);
   },

   // Get all the extensions for the table
   _getExtensions : function (tableName) {
      var list = this._getChildren(tableName);
      if (list.size() > 0)
         this._addParents(list);

      return list;
   },

   _getChildren : function(tableName) {
      return this.objectManager.getAllChildrenOf(tableName);
   }, 

   _addParents : function(list) {
      var o = list.get(0);
      var p = o.getParent();
      while (p) {
         list.add(0, p);
         p = p.getParent();
      }
   },

   _getRotationSuffix : function() {
      return this._getRotation(this.targetTable);
   },
 
   // Build the rotation name which is the next larger sequence number
   _getRotationName : function(name) {
      return name + this.suffix;
   },

   _getRotation : function(name) {
      var rotation = this._getMaxRotation(name);
      if (!rotation || rotation.length <= name.length)
          rotation = "-1";
      else
          rotation = rotation.substring(name.length);

      rotation = (parseFloat(rotation)+1) + '';
      while (rotation.length < 4)
         rotation = '0' + rotation;

      return rotation;
   },

   _getMaxRotation : function(name) {
      var xx = new GlideRecord('sys_dictionary');
      xx.addQuery('name', 'STARTSWITH', name);
      xx.addQuery('name', 'DOES NOT CONTAIN', name + "_");
      xx.addNullQuery('element');
      xx.orderByDesc('name');
      xx.query();
      xx.next();
      var answer = xx.name.toString();
      return answer;
   },

   _z : function() {
      return "TableRotationUtil";
   }

};
