gs.include("PrototypeServer");

// fields are auto-mapped if they have the same name
// these fields are special mapped
var g_mySQLMap = {
  handler_read_rnd_next: 'h_read_rnd_next',
  handler_delete:	'h_delete',
  handler_read_first:	'h_read_first',
  handler_read_key:	'h_read_key',
  handler_read_next:	'h_read_next',
  handler_read_rnd:	'h_read_rnd',
  handler_update:	'h_update',
  handler_write:	'h_write',
  table_locks_immediate: 'table_locks_immediat',

  created_tmp_disk_tables: 'new_tmp_tables',
  created_tmp_files: 'new_tmp_files',
  created_tmp_tables:'new_tmp_disk_tables',
  qcache_queries_in_cache: 'qcache_in_cache',

  com_insert: 'inserts',
  com_select: 'selects',
  com_update: 'updates',
  com_delete: 'deletes'
} 


var MySQLStats= Class.create();
MySQLStats.prototype =  Object.extendsObject(InstanceStats, {
   
   initialize: function() {
     this.instanceName = GlideServlet.getSystemID();
     this.snc_mi = this._getMI(this.instanceName);
   },
   
   /**
    * Gather stats 
    */
   run: function() {
      if (!this._isMYSQL())
         return;

      this.gr = new GlideRecord('cmdb_metric_mysql_statements');
      this.gr.snc_mi =  this.snc_mi;
	  
      var dbi = GlideDBConfiguration.getDBI('sys_dictionary');
      var rs = new SncMysqlStatsSqlFactory().getSysDictionaryStatus(dbi);
      
      while (rs.next()) {
         var name = rs.getString(1).toLowerCase();
         var fieldName = name;
         if (!this.gr.isValidField(fieldName)) {
           if (!g_mySQLMap[name])
             continue;
             
           fieldName = g_mySQLMap[name];
         }
         
         this.gr.setValue([fieldName], rs.getString(2));
      }
      
      rs.close();
      dbi.close();
  
      this.gr.insert();
   },

   _isMYSQL : function() {
      var dbi = GlideDBConfiguration.getDBI('sys_dictionary');
      var answer = dbi.isMySQL();
      dbi.close();
      return answer;
   },
      
   
   z: null
});

