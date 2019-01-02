gs.include("PrototypeServer"); 

var TableRotationList = Class.create();

TableRotationList.prototype = {

   initialize : function() {
      this.objectManager = new GlideDBObjectManager.get();
      this.rotationList = new Object();
      this._initList();
   },

   _initList: function() {
      var r = new GlideRecord('sys_table_rotation');
      r.addQuery('name', '!=', 'sys_replication_queue');
      r.query();
      while (r.next()) 
         this.rotationList[r.name.toString()] = new TableRotation(r.name.toString());
   },

   getList : function() {
      return this.rotationList;
   },

   _z : function() {
      return "TableRotation";
   }

};