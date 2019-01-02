gs.include("PrototypeServer");

var ArchiveTableList = Class.create();

ArchiveTableList.prototype = {

  process: function() {
     var list = new Array();
     var dd = new GlideRecord('sys_dictionary');
     dd.addNullQuery('element');
     dd.addQuery('name', 'STARTSWITH', 'ar_');
     dd.addQuery('name', 'NOT IN', this._getArchivedList());
     dd.query();
     while (dd.next())
        list.push(dd.name + '');

     return list;
  },

  _getArchivedList: function() {
     var list = new Array();
     var ar = new GlideRecord('sys_archive');
     ar.query();
     while (ar.next()) 
        list.push(ar.table + '');

     return list;
  },

  

  type: "ArchiveTableList"
};