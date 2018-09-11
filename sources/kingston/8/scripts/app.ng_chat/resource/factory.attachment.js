/*! RESOURCE: /scripts/app.ng_chat/resource/factory.attachment.js */
angular.module("sn.connect.resource").factory("attachmentFactory", function(fileSizeConverter, $window) {
  "use strict";

  function fromObject(data) {
    data.size = fileSizeConverter.getByteCount("" + data.size_bytes, 2);
    var downloadSource = "/sys_attachment.do?sys_id=" + data.sys_id;
    var newTabSource = "/" + data.sys_id + ".iix";
    return {
      rawData: data,
      sysID: data.sys_id,
      timestamp: data.sys_created_on,
      name: data.file_name || "Image",
      byteDisplay: data.size,
      canRead: data.can_read,
      fileName: data.file_name,
      sizeInBytes: data.size_bytes,
      compressSize: data.size_compressed,
      contentType: data.content_type,
      thumbSource: data.thumb_src,
      createdBy: data.sys_created_by,
      isImage: data.image,
      height: data.image_height,
      width: data.image_width,
      averageColor: data.average_image_color,
      newTabSource: newTabSource,
      downloadSource: downloadSource,
      open: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(newTabSource, "_blank");
      },
      download: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(downloadSource, "_self");
      }
    }
  }
  return {
    fromObject: fromObject
  }
});;