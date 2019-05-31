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
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        self._updateProgressBar(percentage);
      }
    }, false);
    Event.observe(this.xhr.upload, "error", function() {
      self._updateProgress(" error");
      if (self.control)
        self.control.style.backgroundColor = "tomato";
      self.destroy();
    }, false);
    Event.observe(this.xhr.upload, "loadstart", function() {
      self._updateProgress("started");
      if (self.control)
        self.control.style.backgroundColor = "LightCyan";
    }, false);
    Event.observe(this.xhr.upload, "abort", function() {
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
          if (sys_id == "attachment.refused") {
            alert("Attachment refused because file type not allowed or type does not match file contents.");
          } else if (sys_id == "create.permission") {
            alert("You do not have ability to attach file to this record.");
          } else if (sys_id == "upload.error") {
            alert("Attachment failed. " +
              "Invalid table name and/or sys_id when attempting to create attachment.");
          } else {
            var ga = new GlideAjax('AttachmentAjax');
            ga.addParam('sysparm_name', 'getIconSrc');
            ga.addParam('sysparm_type', 'icon');
            ga.addParam('sysparm_value', sys_id);
            ga.getXMLWait();
            var imgSrc = ga.getAnswer();
            if (!imgSrc)
              imgSrc = "images/attachment.gifx";
            addAttachmentNameToForm(sys_id, self.file.name, "New", imgSrc,
              self.canAttach, self.showView, self.showPopup);
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
            addAttachmentNameToDialog(sys_id, self.file.name, canDelete,
              gr.sys_created_by, gr.sys_created_on, gr.content_type, imgSrc);
            _saveAttachmentClose();
            if (typeof uploadedFunction == "function") {
              self.sys_id = sys_id;
              uploadedFunction.call(this, self);
            }
          }
        }
        self.destroy();
      }
    };
    this._checkCompatibleFile(function() {
      var formData = new FormData();
      formData.append("sysparm_sys_id", self.parent_sys_id);
      formData.append("sysparm_table", self.table);
      formData.append("sysparm_nostack", "yes");
      formData.append("sysparm_send_xml", "true");
      if (window.g_ck)
        formData.append("sysparm_ck", window.g_ck);
      formData.append("attachFile", self.file, self.file.name);
      self.xhr.open("POST", "sys_attachment.do", true);
      self.xhr.send(formData);
      jslog("starting send file upload for " + self.file.name);
    })
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
  _checkCompatibleFile: function(sendFunction) {
    var reader = new FileReader();
    var self = this;
    reader.onerror = function() {
      self._outputIncompatible();
    }
    reader.onloadend = function(evt) {
      if (evt.target.error)
        return;
      sendFunction();
    }
    reader.readAsArrayBuffer(this.file);
  },
  _isIWorkFile: function() {
    var fileName = this.file.name;
    return fileName.endsWith('.key') ||
      fileName.endsWith('.pages') ||
      fileName.endsWith('.numbers') ||
      fileName.endsWith('.keynote');
  },
  _outputIncompatible: function() {
    var errMsg = "There was an error uploading \"{0}.\" ";
    if (this._isIWorkFile())
      errMsg += "Some iWork files cannot be added through drag and drop. ";
    errMsg += "Please select the file and upload through the paperclip icon above.";
    g_form.addErrorMessage(new GwtMessage().getMessage(errMsg, this.file.name));
    if (this.control)
      this.control.style.display = "none";
    this.destroy();
  },
  type: function() {
    return "AttachmentUploader";
  }
});
AttachmentUploader.uploadBlob = function(blob, filename, url, data) {
  var form = this._getFormBuilder();
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      form.append(key, data[key]);
    }
  }
  form.append('file', blob, filename);
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    onSuccess({
      data: xhr.response,
      xml: xhr.responseXML,
      sys_id: xhr.responseXML.documentElement.getAttribute('sys_id')
    });
  };
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        var sys_id = xhr.responseXML.documentElement.getAttribute("sys_id");
        if (!sys_id) {
          return onError(new Error("Attachment failed because file type does not match with file contents."));
        }
        if (sys_id == "create.permission") {
          return onError(new Error("You do not have ability to attach file to this record."));
        }
        if (sys_id == "upload.error") {
          return onError(new Error("Attachment failed. " +
            "Invalid table name and/or sys_id when attempting to create attachment."));
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          return onError(new Error('server responded with: ' + xhr.status));
        }
        onSuccess({
          sys_id: sys_id
        });
      } catch (e) {
        onError(new Error('server responded with unusable data'));
      }
    }
  };
  xhr.open("POST", url);
  xhr.send(form);

  function listen(event, listener) {
    if (!xhr.addEventListener)
      xhr.attachEvent(event, listener);
    else
      xhr.addEventListener(event, listener, false);
  }
  listen('progress', function(e) {
    if (e.lengthComputable) {
      onProgress({
        total: e.total,
        loaded: e.loaded,
        percent: Math.round((e.loaded * 100) / e.total)
      });
    }
  });
  listen('error', function(e) {
    onError(e);
  });
  var errFuns = [];

  function onError(data) {
    errFuns.forEach(function(fun) {
      fun(data);
    });
  }
  var sucFuns = [];

  function onSuccess(data) {
    sucFuns.forEach(function(fun) {
      fun(data);
    });
  }
  var proFuns = [];

  function onProgress(data) {
    proFuns.forEach(function(fun) {
      fun(data);
    });
  }
  return {
    success: function(fun) {
      sucFuns.push(fun);
      return this;
    },
    progress: function(fun) {
      proFuns.push(fun);
      return this;
    },
    error: function(fun) {
      errFuns.push(fun);
      return this;
    }
  }
};
AttachmentUploader.uploadDataURLAttachment = function(dataUrl, name, table, sys_id) {
  var parts = AttachmentUploader._parseDataUrl(dataUrl);
  if (name) {
    name = (parts.ext && name.indexOf('.') == -1) ? name + parts.ext : name;
  } else {
    name = 'pasted_image' + (parts.ext ? parts.ext : '.unknown');
  }
  var data = {
    'sysparm_sys_id': sys_id,
    'sysparm_table': table
  };
  return this.uploadBlob(parts.blob, name, 'sys_attachment.do', data);
};
AttachmentUploader.uploadDataURLDBImage = function(dataUrl, name) {
  var parts = AttachmentUploader._parseDataUrl(dataUrl);
  if (name) {
    name = (parts.ext && name.indexOf('.') == -1) ? name + parts.ext : name;
  } else {
    name = 'pasted_image' + (parts.ext ? parts.ext : '.unknown');
  }
  var data = {
    sysparm_table: 'db_image',
    sysparm_sys_id: 'new_db_image'
  };
  return this.uploadBlob(parts, name, 'sys_user_image.do', data);
};
AttachmentUploader._getFormBuilder = function() {
  var form = new FormData();
  form.append('sysparm_nostack', 'yes');
  form.append('sysparm_send_xml', 'true');
  if (window.g_ck)
    form.append('sysparm_ck', window.g_ck);
  return form;
};
AttachmentUploader._parseDataUrl = function(str) {
  if (typeof window.Blob == 'undefined')
    return new Error('cannot create Blobs on this browser');
  var exts = {
    'image/jpeg': '.jpg',
    'image/bmp': '.bmp',
    'image/gif': '.gif',
    'image/png': '.png',
    'image/tiff': '.tiff',
    'image/svg+xml': '.svg',
    'image/x-icon': '.ico'
  };
  var mime = str.substring(str.indexOf(':') + 1, str.indexOf(';'));
  var base64Str = str.substring(str.indexOf(',') + 1);
  var byteString = atob(base64Str);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0, l = byteString.length; i < l; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return {
    blob: new Blob([ia], {
      type: mime
    }),
    mime: mime,
    ext: exts[mime]
  };
};
AttachmentUploader.addDropZone = function(dropZone, maxMegabytes, canAttach, showView, showPopup, extensions, uploadedFunction) {
  if (typeof FileReader == "undefined")
    return;
  if (canAttach == "false") {
    AttachmentUploader.noDropZone("File attachments not allowed");
    return;
  }
  if (maxMegabytes !== "")
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
        if ($$('attachment_list_items').length > 0) {
          showObjectInline(gel("header_attachment_list_label"));
        }
        line.style.visibility = "visible";
        line.style.display = "";
      }
      line.resetDisplay = "1";
    }
    setTimeout("AttachmentUploader._resetBackground(false)", 1000);
    if (!(isMSIE || isMSIE11)) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.dropEffect = "copy";
    }
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
    if (isFirefox) {
      $('header_attachment').style.height = '3em';
    }
    var line = gel("header_attachment_line");
    if (line)
      line.reverseOnCancel = "false";
    var progressSpan = gel("attachment_upload_progress");
    progressSpan.innerHTML = "";
    var filesTooLarge = [];
    var filesBadExtension = [];
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
      addClassName(p, 'file');
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
    var files = event.dataTransfer.files
    if (files.length < 1)
      return;
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
};