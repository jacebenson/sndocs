var SchemaProcessor = Class.create();

SchemaProcessor.prototype = {
  initialize : function() {
    this.glideOutputWriter = GlideOutputWriterFactory.get(g_request, g_response);
    g_response.setContentType("text/xml");
    this.output = new Packages.java.io.PrintWriter(this.glideOutputWriter);
  },

  getTableList : function(){
    this.output.write('<tables>');
    this.writeTablesFromSysDictionary();
    this.writeTablesFromDBView();
    this.output.write('</tables>');
  },

  writeTablesFromSysDictionary: function() {
    var gr = new GlideRecord('sys_dictionary');
    var encQ = 'elementISEMPTY';
    gr.addEncodedQuery(encQ);
    this.writeTables(gr);
  },

  writeTablesFromDBView: function() {
    var gr = new GlideRecord('sys_db_view');
    if (!gr.isValid())
      return;

    this.writeTables(gr);
  },
 
  isRotationExtension: function(tableName) {
    var td = new GlideTableDescriptor.get(tableName);
    return td.isRotationExtension();
  },

  isTextIndexTable: function(tableName) {
    return tableName.startsWith('ts_index_');
  },

  writeTables: function(gr) {
    gr.query();
    while (gr.next()){
      var tableName = gr.getValue('name');
      if ( JSUtil.nil(tableName))
          continue;

      var grtable = new GlideRecord(tableName);
      if (!grtable.isValid())
        continue;

      if (!this.isTextIndexTable(tableName) && !this.isRotationExtension(tableName) && grtable.canRead()){
        this.output.write('<element name="');
        this.output.write(String(tableName));
        this.output.write('" />');
      }
    }     
  },

  finish : function() {
    this.output.flush();
    this.output.close();

    if (this.glideOutputWriterHasWriteToMethod())
      this.glideOutputWriter.writeTo(g_response.getOutputStream());
  },

  process : function(){
     this.output.write("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>");
     // first , get all of the tables names
     //check to see if the list of tables is being requested, the g_target will be navpage
     if ( g_target == 'navpage'){
        this.getTableList();
        this.finish();
        return;
     }

     var gr = new GlideRecord(g_target);
	 var validator = new sn_ws.WebServicePolicyValidator(g_target, g_request);
	 
	 if (!validator.validate()) {
	 	this.output.write('<error>Insufficient rights to access table: ' + g_target + '</error>');
        this.finish();
        return;
	 }
	           
     if (!gr.isValid()){
        this.output.write('<error>Invalid table: ' + g_target + '</error>');
        this.finish();
        return;
     }
     if (!gr.canRead()){
        this.output.write('<error>Insufficient rights to access table: ' + g_target + '</error>');
        this.finish();
        return;
     }

     this.output.write("<" + g_target + ">");
     var schemaHM = new GlideTableDescriptor.get(g_target);
     var target = new GlideRecord(g_target);
     var map = schemaHM.getSchema();
     var keys = map.keySet();
     
     var iter = keys.iterator();
     while( iter.hasNext()){
       var o = iter.next();
       var ge = target.getElement(o);
       if (!JSUtil.nil(ge) && !ge.canRead())
         continue;

       var ed = map.get(o);
       this.output.write('<element name="'  + o.toString()
                         + '" internal_type="' + ed.getInternalType() 
                         + '" max_length="'    + ed.getLength() 
                         + '" choice_list="' + this.isChoiceList(ed) + '"'
                         + this.getReferenceDisplayField(ed) 
                         + this.getReferenceAdditionalInfo(ed) 
                         +' />');
     }

     this.output.write('</' + g_target + '>');
     this.finish();
  },

  getReferenceDisplayField: function(ed) {
      var referenceTable = ed.getReference();
      if (JSUtil.nil(referenceTable)) 
          return "";

      var ref = new GlideTableDescriptor.get(referenceTable);
      return ' display_field="'  +ref.getDisplayName() + '"';
  },

  getReferenceAdditionalInfo: function(ed) {
      var referenceTable = ed.getReference();
      if (JSUtil.nil(referenceTable)) 
          return "";

      var refInfo = ' reference_table="' + referenceTable + '" ';
      var ref = new GlideTableDescriptor.get(referenceTable);

      if (!JSUtil.nil(ref)) {
          var refFieldName = ref.getDisplayName();
          var refTableSchemaMap = ref.getSchema();
          var refFieldED = refTableSchemaMap.get(refFieldName);

          if (!JSUtil.nil(refFieldED))
             refInfo += ' reference_field_max_length="' + refFieldED.getLength() + '" ';
      }
      return refInfo;
  },

  isChoiceList: function(ed) { 
     if (ed.isChoiceTable())
        return "true";

     return "false";
  },

  glideOutputWriterHasWriteToMethod: function() {
    return GlideJSUtil.javaObjectHasMethod(this.glideOutputWriter, "writeTo");
  }
}