gs.include("PrototypeServer");

var ImportSetCleaner = Class.create();

ImportSetCleaner.prototype = {
   initialize : function(import_set_table) {
      this.drop_table = false;
      this.maps = false;
      this.daysAgo = 0;
      this.isetsChunk = 1000;
      this.cleanedImportSetRowTables = [];
      if (import_set_table) {
         this.table = import_set_table;
         var gr = new GlideRecord(import_set_table);
         gr.initialize();
         this.table_label = gr.sys_meta.label;
      }
   },
   
   setDaysAgo : function(daysAgo) {
      this._log('Cleaning import sets > ' + daysAgo + " days old");
      this.daysAgo = daysAgo;
   },
   
   setDataOnly : function(data_only) {
      this.drop_table = !data_only;
   },
   
   setDeleteMaps : function(maps) {
      this.maps = maps;
   },
   
   clean : function() {
      var isets = this._queryIsets();
      
      while(isets.length > 0) {
         this._removeData(isets);
         this._cleanArtifacts(isets);
         isets = this._queryIsets();
      }
      
      if (this.maps)
         this._deleteMaps();
      
      if (this.drop_table) {
         this._removeModule();
         this._dropTable();
      } else {
      	 this._removeOrphanedImportSetRows();
      }
   },
   
   _queryIsets : function() {
      var gr = new GlideRecord('sys_import_set');
      gr.setLimit(this.isetsChunk);
      
      if (this.table)
         gr.addQuery('table_name', this.table);
      
      if (this.daysAgo > 0)
         gr.addEncodedQuery('sys_created_onRELATIVELE@dayofweek@ago@' + this.daysAgo);
      
      gr.query();
      var isets = new Array();
      while (gr.next()) {
         this._log('Cleaning import set ' + gr.number);
         isets.push(gr.sys_id + '');
      }
      
      return isets;
   },
   
   _cleanArtifacts : function(isets) {
      this._log('Removing import set artifacts (import_sets error entries, and run history');
      
      this._cleanTable('sys_import_set_run', 'setIN' + isets.join(','));
      this._tableClean('sys_import_set_row_error');
      this._cleanTable('sys_import_set', 'sys_idIN' + isets.join(','));
   },
   
   // clean the table using the TableCleaner
   //
   _tableClean : function(table) {
      var tc = new GlideTableCleaner(table, this.daysAgo*86400000, 'sys_created_on');
      tc.clean();
   },

   // clean the table using multiple delete database action
   //
   _cleanTable : function(table_name, query) {
      this._log('Cleaning table ' + table_name + ' query:' + query);
      var deleted = 0;
      var total = 0;
      do {
         var md = new GlideMultipleDelete(table_name);
         md.addQueryString(query);
         md.execute();
         deleted = md.getUpdateCount();
         total += deleted;
      } while (deleted > 0);

      this._log(".. " + total + " rows removed from " + table_name);
   },
   
   _removeData : function(isets) {
      if (this.table) {
         this._log('Removing all data from import set table ' + this.table_label);
         this._tableClean(this.table);
         return;
      }
      
      // we only want to delete rows from tables related to
      // the import sets we found
      for(i = 0; i < isets.length; i++) {
         var gr = new GlideRecord("sys_import_set");
         if (gr.get(isets[i])) {
            this._log('Removing data from import set table ' + gr.table_name + ' where import set=' + gr.number);
 			//this.cleanedImportSetRowTables.push(gr.table_name + '');
            this._cleanTable(gr.table_name, 'sys_import_set=' + gr.sys_id);
         }
      }
   },
   
   _deleteMaps : function() {
      if (this.table.indexOf("imp_") == 0)
         return;
      
      var igr = new GlideRecord("sys_transform_map");
      igr.addQuery("source_table", this.table);
      igr.query();
      while(igr.next()) {
         this._log("Deleting referenced transform map: " + igr.name);
         
         var egr = new GlideRecord("sys_transform_entry");
         egr.addQuery("map", igr.sys_id);
         egr.query();
         while(egr.next()) {
            egr.deleteRecord();
         }
         
         igr.deleteRecord();
      }
   },
   
   _dropTable : function() {
      if (this.table.indexOf("imp_") == 0)
         return;
      
      this._log('Removing table structure, dictionary, and associated documentation');
      var db = GlideScriptSystemUtilDB;
      // remove list forms
      db.removeUIList(this.table);
      
      // remove form sections and ui elements
      db.removeUISection(this.table);
      
      // drop the table
      gs.dropTable(this.table);
   },
   
   _removeModule : function() {
      if (this.table.indexOf("imp_") == 0)
         return;
      
      this._log("Removing application module");
      var mgr = new GlideRecord("sys_app_module");
      mgr.addQuery("application", "import_sets");
      mgr.addQuery("order", "1100");
      mgr.addQuery("name", this.table);
      mgr.query();
      if(mgr.next()) {
         this._log("Deleting import set table module: " + mgr.title);
         mgr.deleteRecord();
      }
      
      // now remove from system_web_services
      mgr = new GlideRecord("sys_app_module");
      mgr.addQuery("query", "v_ws_editor.do?sysparm_query=name=" + this.table + "^element=");
      mgr.query();
      if(mgr.next()) {
         this._log("Deleting web service import set table module: " + mgr.title);
         mgr.deleteRecord();
      }
   },
   _removeOrphanedImportSetRows:function() {
	   if(this.table){
		   this._log("Deleting orphaned import set row records if any by querying for import set sys_id being empty for table: " +this.table);
	   // import set row record might still have Import set sysid but querying for import set sys_id which doesnt exist returns list of orphaned import set row records
		   this._cleanTable(this.table, 'sys_import_set.sys_idISEMPTY');
	   } else if(this.cleanedImportSetRowTables.length > 0) {
		   for(var i = 0; i < this.cleanedImportSetRowTables.length; i++) {
			this._log("Deleting orphaned import set row records if any by querying for import set sys_id being empty for table: " +this.cleanedImportSetRowTables[i]);   
			this._cleanTable(this.cleanedImportSetRowTables[i], 'sys_import_set.sys_idISEMPTY');   
		   }
	   }
   },
   _log : function(message) {
      var lgr = new GlideRecord("import_log");
      lgr.initialize();
      lgr.level = "0";
      lgr.message = message;
      lgr.source = "Cleanup";
      lgr.insert();
      gs.print("Import Set Cleaner:: " + message);
   }
   
}