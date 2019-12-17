/*! RESOURCE: /scripts/app.ng_chat/message/factory.Message.js */
angular.module('sn.connect.message').factory("messageFactory", function(
      liveProfileID, profiles, liveLinkFactory, attachmentFactory, resourcePersister) {
      "use strict";

      function buildMessageFromJSONObject(jsonObject) {
        jsonObject = jsonObject || {};
        var mentions = jsonObject.mentions || [];
        var links = [];
        var attachments = [];
        var isSystem = jsonObject.created_by === "system";
        angular.forEach((jsonObject.links || []), function(rawLink) {
          var link = liveLinkFactory.fromObject(rawLink, !isSystem);
          resourcePersister.addLink(jsonObject.group, link);
          this.push(link);
        }, links);
        angular.forEach((jsonObject.attachments || []), function(rawAttachment) {
              var attachment = attachmentFactory.fromObject(rawAttachment);
              resourcePersister.add