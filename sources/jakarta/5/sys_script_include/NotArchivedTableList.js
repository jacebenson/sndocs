gs.include("PrototypeServer");

var NotArchivedTableList = Class.create();

NotArchivedTableList.prototype = {

  process: function() {
     this.tableList = new Array();
     var dd = new GlideRecord('sys_dictionary');
     dd.addNullQuery('element');
     dd.addQuery('name', 'NOT MATCHES', 'ar\\_%');
     dd.addQuery('name', 'NOT MATCHES', 'ts\\_%');

	 function deduplicatedHierarchy(archivedTables) {
		var answer = [];
		var collectionOfHierarchies = {};

		for(var idx in archivedTables) {
			var tableHierarchy = GlideDBObjectManager.get().getHierarchy(archivedTables[idx]);
			for (var x = 0; x < tableHierarchy.size(); ++x)
				collectionOfHierarchies[tableHierarchy.get(x)] = tableHierarchy.get(x);
		}

		for (var x in collectionOfHierarchies)
			answer.push(x);

		return answer;
	 }

	 dd.addQuery('name', 'NOT IN', deduplicatedHierarchy(this._getArchivedList()));
     var qc = dd.addQuery('attributes', 'DOES NOT CONTAIN', 'update_synch=true');
     qc.addOrCondition('attributes', '=', '');
     dd.orderBy('name');
     dd.query();
	 while (dd.next())
        this._addEntry(dd.name + '');

     return this.tableList;
  },

  _addEntry: function(tableName) {
     if (SncTableRotationExtensions.isRotationExtension(tableName))
        return;

     if (SncTableRotationExtensions.isRotated(tableName))
        return;

     this.tableList.push(tableName);
  },

  _getArchivedList: function() {
     var list = new Array();
     var ar = new GlideRecord('sys_archive');
     ar.query();
     while (ar.next()) 
        list.push(ar.table + '');

     return list;
  },

  type: "NotArchiveTableList"
};