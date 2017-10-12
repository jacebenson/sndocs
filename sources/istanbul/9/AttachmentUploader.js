/*! RESOURCE: /scripts/classes/AttachmentUploader.js */
var AttachmentUploader = Class.create({
      initialize: function(event, file, fileNumber, canAttach, showView, showPopup) {
        this.target = Event.element(event);
        this.file = file;
        this.fileNumber = fileNumber;
        this.showView = showView;
        this.showPopup = showPopup;
        this.canAttach = canAttach;
        this.control = gel("upload_file_" + this.fileNumber);
        this.progress = gel("upload_file_progress_" + this.fileNumber);
        this.CRLF = "\r\n"
        var sys_id = gel("sys_uniqueValue");
        if (!sys_id)
          sys_id = gel("sysparm_item_guid");
        this.parent_sys_id = sys_id.value;
        var table = gel("sys_target");
        if (!table)
          table = gel("ni.attachment_target");
        this.table = table.value;
      },
      destroy: function() {
        this.target = null;
        this.xhr = null;
        this.file = null;
        this.control = null;
        this.progress = null;
      },
      send: function(uploadedFunction) {
          this.xhr = new XMLHttpRequest();
          var self = this;
          Event.observe(this.xhr.upload, "load", function() {
            if (self.control) {
              try {
                rel(self.control);
                $('header_attachment').style.height = 'auto';
              } catch (ex) {}
            }
          }, false);
          Event.observe(this.xhr.upload, "progress", function(e) {
                if (e.l