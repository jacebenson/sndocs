/*! RESOURCE: /scripts/app.ng_chat/resource/factory.LiveLink.js */
angular.module("sn.connect.resource").factory("liveLinkFactory", function(
  $sce, $window, attachmentFactory, inFrameSet) {
  "use strict";

  function linkObject(link, external, type) {
    var isConnectType = (type === 'connect');
    external |= isConnectType;
    var url = (inFrameSet || external) ?
      link :
      "/nav_to.do?uri=" + encodeURIComponent(link);
    var target =
      (!inFrameSet && isConnectType) ? "_self" :
      (inFrameSet && !external) ? 'gsft_main' :
      "_blank";
    var classType = external ? "external-link" : "internal-link";
    return {
      url: url,
      target: target,
      classType: classType
    }
  }

  function fromObject(data, visible) {
    if (angular.isUndefined(visible))
      visible = true;
    var attachment = data.type_metadata && data.type_metadata.attachment;
    if (attachment)
      attachment = attachmentFactory.fromObject(attachment);
    return {
      sysID: data.sys_id,
      type: data.type,
      url: data.url,
      display: data.title || data.url,
      displayUrl: data.url.replace(/^(?:https?:\/)?\//, ''),
      title: data.title,
      shortDescription: data.short_description,
      siteName: data.site_name,
      timestamp: data.timestamp,
      external: data.external,
      displayFields: data.type_metadata && data.type_metadata.display_fields,
      embedLink: data.type_metadata && data.type_metadata.embed_link,
      imageLink: data.type_metadata && data.type_metadata.image_link,
      avatarID: data.type_metadata && data.type_metadata.avatar_id,
      avatarDisplay: data.type_metadata && data.type_metadata.avatar_display,
      createdOn: data.type_metadata && data.type_metadata.sys_created_on,
      updatedOn: data.type_metadata && data.type_metadata.sys_updated_on,
      isActive: data.state === "active",
      isPending: data.state === "pending",
      isError: data.state === "error",
      isUnauthorized: data.state === "unauthorized",
      isDeleted: data.state === "deleted",
      visible: visible,
      isRecord: data.type == "record",
      isImage: data.type === "image",
      attachment: attachment,
      get isHideable() {
        return ((attachment || this.isRecord) && this.isActive) || this.isImage;
      },
      open: function(event) {
        if (event.keyCode === 9)
          return;
        var link = linkObject(this.url, this.external, this.type);
        var newWindow = $window.open(link.url, link.target);
        newWindow.opener = null;
      },
      aTag: function(text) {
        var link = linkObject(this.url, this.external, this.type);
        var aTag = angular.element("<a />");
        aTag.attr('class', link.classType);
        aTag.attr('rel', "noreferrer");
        aTag.attr('target', link.target);
        aTag.attr('href', link.url);
        aTag[0].innerHTML = text;
        return $sce.getTrustedHtml(aTag[0].outerHTML);
      }
    };
  }
  return {
    fromObject: fromObject,
    linkObject: linkObject
  }
});;