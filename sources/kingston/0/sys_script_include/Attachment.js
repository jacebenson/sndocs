gs.include("PrototypeServer");

var Attachment = Class.create();
Attachment.prototype = {

   ATTACHMENT_INDEXED : 'attachment_index',
   ATTACHMENT_EXTRACTOR : 'attachment_extractor',
   ATTACHMENT_EXTENSION : 'extension', 
   
   initialize: function() {
      this.attachment = null;
   },
   
   setRecord: function(attachment) {
      this.attachment = attachment;
   },

   isIndexed: function() {
      if (this.attachment == null)
         return false;

      var gr = new GlideRecord(this.getTable());
      gr.initialize();
      if (!gr.isValid())
         return false;

      if (!gr.getED().getBooleanAttribute(this.ATTACHMENT_INDEXED))
         return false;

      if (!this._indexedType())
         return false;

      return true;
   },
   
   getTable: function() {
      return this.attachment.table_name.toString();
   },

   getTableID: function() {
      return this.attachment.table_sys_id.toString();
   },

   getTarget: function() {
      var gr = new GlideRecord(this.getTable());
      gr.get(this.getTableID());
      return gr;
   },

   getTerms: function(id) {
      var att = new GlideAttachmentIndexDocument(id);
      return att.getTerms(true);
   },

   _indexedType: function() {
      if (this.attachment == null)
         return false;

      var type = this.getType();
      return GlideAttachmentIndexTypes.isIndexed(type);
   },

   getType: function() {
      var att_name = this.attachment.file_name.toString();
      var att_parts = att_name.split(".");
      return att_parts[att_parts.length-1].toLowerCase();
   },
   
   setTargetTable: function(name) {
     this.tablename = name;
   },
   
   setTargetID: function(id) {
     this.targetID = id;
   },
   
   setTarget: function(gr) {
     this.target = gr;
   },
   
   setFilename: function(name) {
     this.filename = name;
   },
   
   setContentType: function(type) {
     this.contentType = type;
   },
   
   setValue: function(val) {
     this.value = val;
   },
   
   attach: function() {
     if(this.target == null) {
       //build target via gliderecord call
       if(this.tablename == null || this.targetID == null)
         return "Table name and/or target sys id are null. Please specify valid parameters.";
       var targetRecord = new GlideRecord(this.tablename);
       if(!targetRecord.get(this.targetID))
         return "Could not find a record in table '" + this.tablename + "' with sys_id '" + this.targetID + "'";
       this.setTarget(targetRecord);
     }
     
     var sa = new GlideSysAttachment();
     var attachmentId = sa.write(this.target, this.filename, this.contentType, this.value);
     if(attachmentId)
         return "Attachment created and attached to '"+ this.tablename+"' record with sys_id: '"+ this.targetID+"'";
     else
         return "Attachment creation failed";
   },
   
   write: function(gr, filename, content_type, value) {
     this.setTarget(gr);
     this.setFilename(filename);
     this.setContentType(content_type);
     this.setValue(value);
     return this.attach();
   },
   
   write: function(name, id, filename, content_type, value) {
     this.setTargetTable(name);
     this.setTargetID(id);
     this.setFilename(filename);
     this.setContentType(content_type);
     this.setValue(value);
     return this.attach();
   },
      
   type: 'Attachment'
}