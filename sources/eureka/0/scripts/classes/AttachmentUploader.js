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
    var xhr = new XMLHttpRequest();
    this.xhr = xhr;
    var self = this;
    Event.observe(this.xhr.upload, "load", function(e) {
      if (self.control) {
        try {
          rel(self.control);
          $('header_attachment').style.height = 'auto';
        } catch (e) {}
      }
    }, false);
    Event.observe(this.xhr.upload, "progress", function(e) {
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        self._updateProgressBar(percentage);
      }
    }, false);
    Event.observe(this.xhr.upload, "error", function(e) {
      self._updateProgress(" error");
      if (self.control)
        self.control.style.backgroundColor = "tomato";
      self.destroy();
    }, false);
    Event.observe(this.xhr.upload, "loadstart", function(e) {
      self._updateProgress("started");
      if (self.control)
        self.control.style.backgroundColor = "LightCyan";
    }, false);
    Event.observe(this.xhr.upload, "abort", function(e) {
      self._updateProgress(" aborted");
      if (self.control)
        self.control.style.backgroundColor = "tomato";
      self.destroy();
    }, false);
    this.xhr.onreadystatechange = function() {
      if (self.xhr.readyState === 4) {
        var xml = self.xhr.responseXML;
        if (xml) {
          var sys_id = xml.documentElement.getAttribute("sys_id");
          if (sys_id == "") {
            alert("Attachment failed because file type does not match with file contents.");
          } else if (sys_id == "create.permission") {
            alert("You do not have ability to attach file to this record.");
          } else if (sys_id == "upload.error") {
            alert("Attachment failed. Invalid table name and/or sys_id when attempting to create attachment.");
          } else {
            var ga = new GlideAjax('AttachmentAjax');
            ga.addParam('sysparm_name', 'getIconSrc');
            ga.addParam('sysparm_type', 'icon');
            ga.addParam('sysparm_value', sys_id);
            ga.getXMLWait();
            var imgSrc = ga.getAnswer();
            if (!imgSrc)
              imgSrc = "images/attachment.gifx";
            addAttachmentNameToForm(sys_id, self.file.name, "New", imgSrc, self.canAttach, self.showView, self.showPopup);
            ga = new GlideAjax('AttachmentAjax');
            ga.addParam('sysparm_name', 'getCanDelete');
            ga.addParam('sysparm_type', 'canDelete');
            ga.addParam('sysparm_value', sys_id);
            ga.getXMLWait();
            var canDelete = ga.getAnswer();
            if (!canDelete)
              canDelete = true;
            var gr = new GlideRecord('sys_attachment');
            gr.get(sys_id);
            addAttachmentNameToDialog(sys_id, self.file.name, canDelete, gr.sys_created_by, gr.sys_created_on, gr.content_type, imgSrc);
            _saveAttachmentClose();
            if (typeof uploadedFunction == "function") {
              self.sys_id = sys_id;
              uploadedFunction.call(this, self);
            }
          }
        }
        self.destroy();
      }
    }
    var boundary = "AJAX--------------" + (new Date).getTime();
    var parts = [];
    var sys_id = this._getFieldEncoding("sysparm_sys_id", this.parent_sys_id);
    parts.push(sys_id);
    var table = this._getFieldEncoding("sysparm_table", this.table);
    parts.push(table);
    var nostack = this._getFieldEncoding("sysparm_nostack", "yes");
    parts.push(nostack);
    var sendXml = this._getFieldEncoding("sysparm_send_xml", "true");
    parts.push(sendXml);
    if (typeof g_ck != 'undefined' && g_ck != "") {
      var security_ck = this._getFieldEncoding("sysparm_ck", g_ck);
      parts.push(security_ck);
    }
    var getBinaryDataReader = new FileReader();
    if (typeof getBinaryDataReader.addEventListener == "undefined" ||
      typeof self.xhr.sendAsBinary == "undefined") {
      jslog("starting send file upload for " + self.file.name);
      getBinaryDataReader.onloadend = function(e) {
        var filePart = "";
        filePart += 'Content-Disposition: form-data; ';
        filePart += 'name="file"; ';
        filePart += 'filename="' + self.file.name + '"' + self.CRLF;
        var fileType = self.file.type;
        if (fileType == "")
          fileType = "application/octet-stream";
        filePart += "Content-Type: " + fileType;
        filePart += self.CRLF + self.CRLF;
        filePart += e.target.result + self.CRLF;
        parts.push(filePart);
        filePart = null;
        var request = "--" + boundary + self.CRLF;
        request += parts.join("--" + boundary + self.CRLF);
        request += "--" + boundary + "--" + self.CRLF;
        self.xhr.open("POST", "sys_attachment.do");
        var contentType = "multipart/form-data; boundary=" + boundary;
        self.xhr.setRequestHeader("Content-Type", contentType);
        var ui8a = new Uint8Array(request.length);
        for (var i = 0; i < request.length; i++) {
          ui8a[i] = (request.charCodeAt(i) & 0xff);
        }
        self.xhr.send(ui8a.buffer);
      }
    } else {
      jslog("starting sendAsBinary file upload for " + self.file.name);
      getBinaryDataReader.addEventListener("loadend", function(e) {
        var filePart = "";
        filePart += 'Content-Disposition: form-data; ';
        filePart += 'name="file"; ';
        filePart += 'filename="' + unescape(encodeURIComponent(self.file.name)) + '"' + self.CRLF;
        var fileType = self.file.type;
        if (fileType == "")
          fileType = "application/octet-stream";
        filePart += "Content-Type: " + fileType;
        filePart += self.CRLF + self.CRLF;
        filePart += e.target.result + self.CRLF;
        parts.push(filePart);
        fliePart = null;
        var request = "--" + boundary + self.CRLF;
        request += parts.join("--" + boundary + self.CRLF);
        request += "--" + boundary + "--" + self.CRLF;
        self.xhr.open("POST", "sys_attachment.do");
        var contentType = "multipart/form-data; boundary=" + boundary;
        self.xhr.setRequestHeader("Content-Type", contentType);
        console.log(request);
        self.xhr.sendAsBinary(request);
      }, false);
    }
    getBinaryDataReader.readAsBinaryString(this.file);
  },
  _updateProgress: function(txt) {
    if (this.progress)
      this.progress.innerHTML = txt;
  },
  _updateProgressBar: function(percentage) {
    if (this.progress)
      this.progress.innerHTML = "<progress value=\"" + percentage +
      "\" max=\"100\">" + percentage + "%";
  },
  _getFieldEncoding: function(name, value) {
    var part = 'Content-Disposition: form-data; ';
    part += 'name="' + name + '"' + this.CRLF + this.CRLF;
    part += value + this.CRLF;
    return part;
  },
  type: function() {
    return "AttachmentUploader";
  }
});
AttachmentUploader.addDropZone = function(dropZone, maxMegabytes, canAttach, showView, showPopup, extensions, uploadedFunction) {
  if (typeof FileReader == "undefined")
    return;
  if (canAttach == "false") {
    AttachmentUploader.noDropZone("File attachments not allowed");
    return;
  }
  if (maxMegabytes != "")
    maxMegabytes = parseInt(maxMegabytes, 10);
  else
    maxMegabytes = 0;
  if (isNaN(maxMegabytes))
    maxMegabytes = 0;
  var gotExtensions = false;
  if (extensions) {
    extensions.toLowerCase();
    extensions = extensions.split(",");
    gotExtensions = true;
  }
  Event.observe(dropZone, "dragover", function(event) {
    Event.stop(event);
    var headerAttachment = gel("header_attachment");
    if (headerAttachment && headerAttachment.style.backgroundColor != "orange") {
      headerAttachment.style.backgroundColor = "orange";
      needsReset = true;
    }
    var line = gel("header_attachment_line");
    if (line) {
      if (line.style.visibility == "hidden") {
        line.reverseOnCancel = "true";
        showObjectInline(gel("header_attachment_list_label"));
        line.style.visibility = "visible";
        line.style.display = "";
      }
      line.resetDisplay = "1";
    }
    setTimeout("AttachmentUploader._resetBackground(false)", 1000);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.dropEffect = "copy";
    return false;
  }, true);
  Event.observe(dropZone, "dragend", function(event) {
    AttachmentUploader._resetBackground(true);
  }, true);
  Event.observe(dropZone, "drop", function(event) {
    AttachmentUploader._resetBackground(true);
    var files = event.dataTransfer.files
    if (files.length < 1)
      return;
    Event.stop(event);
    if (dropZone.disableAttachments == "true") {
      alert(getMessage("Attachments are not allowed"));
      return;
    }
    $('header_attachment').style.height = 'auto';
    var line = gel("header_attachment_line");
    if (line)
      line.reverseOnCancel = "false";
    var attachments = gel("header_attachment_list");
    var containingSpan;
    var progressSpan = gel("attachment_upload_progress");
    progressSpan.innerHTML = "";
    var filesTooLarge = new Array();
    var filesBadExtension = new Array();
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var megs = file.size / 1048576;
      if (maxMegabytes > 0) {
        if (megs > maxMegabytes) {
          filesTooLarge.push(file.name + " (" + AttachmentUploader.getDisplaySize(file.size) + ")");
          files[i] = null;
          continue;
        }
      }
      if (gotExtensions) {
        var badExtension = false;
        var periodIndex = file.name.lastIndexOf(".");
        var extension = "(none)";
        if (periodIndex == -1)
          badExtension = true;
        else {
          extension = file.name.substring(periodIndex + 1).toLowerCase();
          if (extensions.indexOf(extension) == -1)
            badExtension = true;
        }
        if (badExtension) {
          filesBadExtension.push(file.name);
          continue;
        }
      }
      var p = cel("p");
      p.id = "upload_file_" + i;
      p.innerHTML = files[i].name + " (" + AttachmentUploader.getDisplaySize(files[i].size) + ") ";
      var span = cel("span");
      span.id = "upload_file_progress_" + i;
      p.appendChild(span);
      progressSpan.appendChild(p);
      var uploader = new AttachmentUploader(event, file, i, canAttach, showView, showPopup);
      uploader.send(uploadedFunction);
    }
    if ((filesTooLarge.length + filesBadExtension.length) > 0)
      AttachmentUploader.setWarning(filesTooLarge, filesBadExtension, maxMegabytes);
  }, true);
};
AttachmentUploader._resetBackground = function(doNow) {
  var line = gel("header_attachment_line");
  if (!line)
    return;
  if (doNow != true && typeof line.resetDisplay != "undefined") {
    var resetDisplay = parseInt(line.resetDisplay);
    resetDisplay++;
    line.resetDisplay = resetDisplay;
    if (resetDisplay < 10)
      return;
  }
  var headerAttachment = gel("header_attachment");
  if (headerAttachment)
    headerAttachment.style.backgroundColor = "";
  if (line.reverseOnCancel == "true") {
    line.reverseOnCanel = "false";
    hideObject(gel("header_attachment_list_label"));
    line.style.visibility = "hidden";
    line.style.display = "none";
  }
}
AttachmentUploader.getDisplaySize = function(sizeInBytes) {
  var kilobytes = Math.round(sizeInBytes / 1024);
  if (kilobytes < 1)
    kilobytes = 1;
  var reportSize = kilobytes + "K";
  if (kilobytes > 1024)
    reportSize = Math.round(kilobytes / 1024) + "MB";
  return reportSize;
}
AttachmentUploader.noDropZone = function(message) {
  var dropZone = document.body;
  Event.observe(dropZone, "dragover", function(event) {
    Event.stop(event);
    if (isChrome)
      event.dataTransfer.dropEffect = "copy";
    return true;
  }, true);
  Event.observe(dropZone, "dragleave", function(event) {
    Event.stop(event);
  }, true);
  Event.observe(dropZone, "drop", function(event) {
    Event.stop(event);
    alert(message);
  }, true);
}
AttachmentUploader.isAttachmentDisabled = function() {
  return document.body["disableAttachments"] === "true";
}
AttachmentUploader.disableAttachments = function() {
  document.body.disableAttachments = "true";
}
AttachmentUploader.enableAttachments = function() {
  document.body.disableAttachments = "false";
}
AttachmentUploader.setWarning = function(filesTooLarge, filesBadExtension, maxFileSize) {
  var warningString = "The following files were not uploaded:\n\n";
  if (filesTooLarge.length > 0) {
    warningString += "Files larger than the maximum file size (" + maxFileSize + "MB):\n";
    for (var i = 0; i < filesTooLarge.length; i++)
      warningString += "\t" + filesTooLarge[i] + "\n";
    warningString += "\n";
  }
  if (filesBadExtension.length > 0) {
    warningString += "Files with prohibited extensions:\n";
    for (var i = 0; i < filesBadExtension.length; i++)
      warningString += "\t" + filesBadExtension[i] + "\n";
  }
  alert(warningString);
}