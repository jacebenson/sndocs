var AttachmentAjax = Class.create();

AttachmentAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
  IMAGE_TYPES: { "jpeg": true, "jpg": true, "gif": true, "bmp": true, "png": true },

  process: function() {
      if (this.getType() == "list")
          this.list();
      else if (this.getType() == "delete")
          this.deleteAttachment();
      else if (this.getType() == "rename")
          return this.renameAttachment(false);
      else if (this.getType() == "initialRename")
          return this.renameAttachment(true);
      else if (this.getType() == "icon" )
          return this.getIconSrc();
      else if (this.getType() == "attachmentCount")
          return this.getAttachmentCount();
      else if (this.getType() == "attachmentParentSysId")
          return this.getAttachmentParentSysId();
  },

  list: function() {
      var sa = new GlideSysAttachment();
      var gr = sa.getAttachments(this.getName(), this.getValue());
      while (gr.next()) {
          var fileName = gr.getValue("file_name");
          
          if (this.getChars() == "image" && !this.isImage(fileName))
              continue;

          var item = this.newItem();
          item.setAttribute("label", gr.file_name);
          item.setAttribute("value", gr.sys_id);
      }
  },
  renameAttachment: function(initialRename) {
     var s = new GlideSysAttachment();
     return s.renameAttachment(this.getValue(), this.getName(), initialRename);
  },


  getIconSrc: function() {
      var s = new GlideSysAttachment();
      return s.selectIcon(this.getValue());
  },

  deleteAttachment: function() {
      var s = new GlideSysAttachment();
      s.deleteAttachment(this.getValue());
  },

  isImage: function(fileName) {
      if (gs.nil(fileName) || fileName.lastIndexOf(".") < 0)
          return false;

      for(var key in this.IMAGE_TYPES) {
          if (fileName.endsWith("." + key))
              return true;
      }
        
      return false;
  },

  getAttachmentCount: function() {
	var gr = new GlideRecord('sys_attachment');
	gr.addQuery('table_sys_id', this.getValue());
	gr.query();
	var count = 0;
	while (gr.next())
		count++;
	return count;
  },

  getAttachmentParentSysId: function() {
        var gr = new GlideRecord('sys_attachment');
	gr.addQuery('sys_id', this.getValue());
	gr.query();
        gr.next();
        return gr.table_sys_id;
  },

  type: "AttachmentAjax"
});