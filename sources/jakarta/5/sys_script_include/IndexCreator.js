gs.include("PrototypeServer");

var IndexCreator = Class.create();

IndexCreator.prototype = {
  initialize: function(tableName, fieldNames, unique, email, index_name) {
     this.tableName = tableName;
     this.fieldNames = fieldNames;
     if (index_name)
        this.indexName = index_name;
     else
        this.indexName = "index";
     this.unique = unique;
     this.email = email;
  },


  execute: function() {
     if (!gs.hasRole('admin') && gs.isInteractive())
         return;

     var start = new GlideDateTime();
     var al = GlideStringUtil.split(this.fieldNames);
     var id = new GlideIndexDescriptor(this.tableName, this.indexName, al);
     this.actualName = id.getIndexName();
     if (this.unique)
       id.setUnique(true);
	 var answer = false;
	 var exists = id.hasIndex();
	 if (exists)
	   id.close();
	 else {
       answer = id.create();
       id.close();
       var end = new GlideDateTime();
       if (!answer)
         this.errorCode = id.getErrorCode();
       else {
         var tu = new TableRotation(this.tableName);
         if (tu.isValid())
           tu.synchronize();
       }
     }
     this._sendNotification(exists, answer, start, end);
     return (answer || exists);
  },

  schedule: function() {
     if (!gs.hasRole('admin'))
         return;
	 // Add an index record to sys_index (if one doesn't already exist)
	 if (!this._hasIndexRecord(this.tableName, this.fieldNames)) {
	    var dbgr = new GlideRecord('sys_db_object');
	    dbgr.addQuery('name', this.tableName);
	    dbgr.query();
	    var tableSysId;
	    if (dbgr.next())
	        tableSysId = dbgr.getValue('sys_id');
        var gr = new GlideRecord('sys_index');
        var gList = this._createGlideListOfColumns();
        if (gList == "")
            return;
	    gr.setValue('index_col_name', gList);
	    gr.setValue('col_name_string', this.fieldNames);
	    gr.setValue('logical_table_name', this.tableName);
	    gr.setValue('table', tableSysId);
	    gr.setValue('unique_index', this.unique);
	    gr.insert();
	 }
     var script = "gs.include('IndexCreator');";
     script += "var c = new IndexCreator('" + this.tableName + "', '" + this.fieldNames + "', " + this.unique + ", '" + this.email + "', '" + this.indexName + "');";
     script += "c.execute();";
     GlideRunScriptJob.scheduleScript(script);
  },

  _hasIndexRecord: function(tableName, fieldNames) {
     //checks to see if a record for this table and columns already exists in sys_index
     var gr = new GlideRecord('sys_index');
     gr.addQuery('logical_table_name', this.tableName);
     gr.addQuery('col_name_string', this.fieldNames);
     gr.query();
     if (gr.next()) {
        gs.log("Skipping insert: A record for this index already exists in sys_index");
        return true;
     } else {
        return false;
     }
  },

  _createGlideListOfColumns: function() {
     //returns a glidelist of column sys_ids for this index
     var al = this.fieldNames.split(",");
	 var gList = "";
	 var gtd = GlideTableDescriptor.get(this.tableName);
	 if (!gtd.isValid()) {
	    gs.warn("Cannot create index, table '" + this.tableName + "' is not valid");
	    return "";
	 }
	 for (var i = 0; i < al.length; i += 1) {
		var ed = gtd.getElementDescriptor(al[i]);
		if (ed != null) {
		   gList += ed.getUniqueID() + ",";
	    } else {
	        gs.warn("Cannot create index, column '" + al[i] + "' does not exist");
	        return "";
	    }
	 }
	 return gList;
  },

  _sendNotification: function(exists, success, start, end) {
     if (!this.email)
        return;


     var subject = "Index Creation Results : ";
     if (exists)
	   subject += "SKIPPED (see body for details)";
	 else if (success)
       subject += "SUCCESS";
     else
       subject += "FAILURE (see body for details)";

     var body = "Index creation began at " + start.getDisplayValue() + "\n";
	 if (exists) {
		body += "Index creation skipped:\n";
		body += "Requested index for table (" + this.tableName + ") on columns (" + this.fieldNames + ") already exists.";
     }
	 else if (success) {
        body += "Index creation completed successfully at " + end.getDisplayValue() + "\n";
        body += "Generated Index Name : " + this.actualName;
     } else {
        body += "Index creation FAILED at " + end.getDisplayValue() + " with error code:\n";
        body += this.errorCode;
     }

     var mail = new GlideEmailOutbound();
     mail.setSubject(subject);
     mail.addRecipient(this.email);
     mail.setBody(body);
     mail.save();
  }

};
