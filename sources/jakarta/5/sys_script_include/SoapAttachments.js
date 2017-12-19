var SoapAttachments = Class.create();

SoapAttachments.prototype = {
   eccQueueRecord: null,
   
   initialize : function(current) {
      this.eccQueueRecord = current;
      
   },
   getFileName : function(){
      var fileType = this.eccQueueRecord.name.split(":");
      var fileName = fileType[0];
      return fileName;
   },
   getContentType : function(){
      var fileType = this.eccQueueRecord.name.split(":");
      var contentType = fileType[1];
      return contentType;
   },
   getTableName : function(){
      var recordInfo = this.eccQueueRecord.source.split(":");
      var tableName = recordInfo[0];
      return tableName;
   },
   getTableRecordSysId : function(){
      var recordInfo = this.eccQueueRecord.source.split(":");
      var sysId = recordInfo[1];
      return sysId;
   },
   
   createAttachmentFromAttachedEncodedString : function(){
      var attrecord = new GlideRecord("sys_attachment");
      attrecord.addQuery("table_sys_id", this.eccQueueRecord.sys_id);
      attrecord.query();
      if (attrecord.next()){
         var encodedAttachment = this.getEncodedAttachmentRecord(attrecord);
         var decodedAttachmentId = this.decodeAttachment(attrecord, encodedAttachment);
         var attachmentAssociated = this.associateAttachmentWithRecord(decodedAttachmentId);
         this.deleteAttachment(encodedAttachment);
         
         if(attachmentAssociated) {
             this.eccQueueRecord.payload = "Attachment created and attached to '";
             this.eccQueueRecord.payload += this.getTableName() + "' record with sys_id: '";
             this.eccQueueRecord.payload += this.getTableRecordSysId() + "'";
         } else {
             this.eccQueueRecord.payload = "Attachment creation failed";
         }
      }
   },
   
   getEncodedAttachmentRecord : function(attachmentRecord){
      var StringUtil = GlideStringUtil;
      var sa = new GlideSysAttachment();
      
      var attachment = sa.getAttachments("ecc_queue", attachmentRecord.table_sys_id);
      if(!attachment.next()){
         gs.log("ERROR: Couldn't find a matching attachment");
         return null;
      } else {
         return attachment;
      }
      
   },
   
   decodeAttachment : function(attachmentRecord, encodedAttachment){
      var sa = new GlideSysAttachment();
      var StringUtil = GlideStringUtil;
      var bytesContent = sa.getBytes(encodedAttachment);
      var strData = Packages.java.lang.String(bytesContent);
      var fileName = this.getFileName(this.eccQueueRecord);
      var contentType = this.getContentType(this.eccQueueRecord);
      
      var binData = StringUtil.base64DecodeAsBytes(strData);
      var sysIdNewAttachment = sa.write(attachmentRecord, fileName, contentType, binData);
      return sysIdNewAttachment;
   },
   
   associateAttachmentWithRecord : function(decodedAttachmentId){
      var attachmentAssociated = false;
      var tableName = this.getTableName(this.eccQueueRecord);
      var attachment = new GlideRecord("sys_attachment");
      attachment.addQuery("sys_id", decodedAttachmentId);
      attachment.query();
      if(attachment.next()){
         attachment.file_name = this.getFileName(this.eccQueueRecord);
         attachment.content_type = this.getContentType(this.eccQueueRecord);
         attachment.table_name = this.getTableName(this.eccQueueRecord);
         attachment.table_sys_id = this.getTableRecordSysId(this.eccQueueRecord);
         attachmentAssociated = attachment.update();
      }
      return attachmentAssociated;
   },
   
   deleteAttachment : function(record){
      var sa = new GlideSysAttachment();
      sa.deleteAttachment(record.sys_id);
   },
   
   createAttachmentFromEccQueue : function(){
      var StringUtil = GlideStringUtil;
      
      //var normalized = this.eccQueueRecord.payload.replaceAll('\n',"");
      //gs.log("received payload: " + normalized);
      var value = StringUtil.base64DecodeAsBytes(this.eccQueueRecord.payload);
      
      var tableName = this.getTableName();
      var sys_id = this.getTableRecordSysId();
      
      var filename = this.getFileName();
      var content_type = this.getContentType();
      var attachment = new Attachment();
      this.eccQueueRecord.payload = attachment.write(tableName, sys_id, filename, content_type, value);
   }
   
   
};