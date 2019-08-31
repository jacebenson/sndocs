/*! RESOURCE: /scripts/app.ng_chat/message/factory.Message.js */
angular.module('sn.connect.message').factory("messageFactory", function(
  liveProfileID, profiles, liveLinkFactory, attachmentFactory, resourcePersister) {
  "use strict";
  var AT_MENTIONS = /(?:&#64;|@)M\[([^|]+?)\|([^\]]+?)]/gi;
  var AT_MENTION_OLD = /(?:&#64;|@)\[([^:\]]+?):([^\]]+)]/g;
  var LINKS = /(?:&#64;|@)L\[([^|]+?)\|([^\]]*)]/gi;
  var SYS_ID = /^[0-9A-F]{32}$/i;
  var CARRIAGE_RETURN = /\r/g;
  var LINE_FEED = /\n/g;
  var TIMESTAMP = /([^T]*)T([^.]*)[.].*/g;
  var REUSE_DIV = document.createElement('div');

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
      resourcePersister.addAttachment(jsonObject.group, attachment);
      this.push(attachment)
    }, attachments);
    var text = jsonObject.formatted_message;
    var displayText = createDisplayText(text, links);
    var cleanText = createCleanText(text, jsonObject.pending);
    return {
      sysID: jsonObject.sys_id,
      text: text,
      createdOn: jsonObject.created_on,
      conversationID: jsonObject.group,
      profile: jsonObject.profile,
      timestamp: jsonObject.timestamp,
      reflectedField: jsonObject.reflected_field,
      hasLinks: links.length > 0,
      id: jsonObject.id,
      pending: false,
      get cleanText() {
        return cleanText;
      },
      get profileData() {
        if (this.profile)
          return profiles.get(this.profile);
      },
      get isSystemMessage() {
        return isSystem;
      },
      get isFromPeer() {
        return this.profile !== liveProfileID;
      },
      get attachments() {
        return attachments;
      },
      get links() {
        return links;
      },
      get mentions() {
        return mentions;
      },
      get isMessageShowing() {
        if (!this._isMessageShowing)
          this._isMessageShowing = !shouldHide(this);
        return this._isMessageShowing;
      },
      get hasSystemLink() {
        return this.isSystemMessage && links[0];
      },
      get displayText() {
        return displayText;
      }
    }
  }

  function shouldHide(message) {
    if (onlyAttachmentMessage(message))
      return true;
    var links = message.links;
    return (links.length === 1) &&
      links[0].isHideable &&
      (replaceText(message.text, "X", "X").trim().length === 1);
  }

  function onlyAttachmentMessage(message) {
    var attachments = message.attachments;
    if (attachments.length === 0)
      return false;
    var text = message.text;
    message.attachments.forEach(function(attachment) {
      text = text.replace("File: " + attachment.fileName, "");
    });
    return text.trim().length === 0;
  }

  function createDisplayText(text, links) {
    function linkFormatter(wholeMatch, urlOrSysID, linkText) {
      var isSysID = urlOrSysID.match(SYS_ID);
      var fn = isSysID ?
        function(link) {
          return link.sysID === urlOrSysID;
        } :
        function(link) {
          var url = urlOrSysID;
          var escapedLinkUrl = removeHtml(link.url);
          var escapedLinkUrl2 = removeHtml(escapedLinkUrl);
          return link.url === url || escapedLinkUrl === url || escapedLinkUrl2 === url;
        };
      var matchedLink = links.filter(fn)[0];
      if (matchedLink) {
        try {
          return matchedLink.aTag(linkText);
        } catch (unused) {}
      }
      return linkText;
    }
    return replaceText(text, "<a class='at-mention at-mention-user-$1'>@$2</a>", linkFormatter)
      .replace(CARRIAGE_RETURN, '')
      .replace(LINE_FEED, '<br/>');
  }

  function replaceText(text, mentions, links) {
    if (!text)
      return "";
    return text
      .replace(AT_MENTIONS, mentions)
      .replace(AT_MENTION_OLD, mentions)
      .replace(LINKS, links);
  }

  function newPendingAttachmentMessage(conversation, files) {
    var message = newPendingMessage(conversation, "");
    message.uploadingFiles = files;
    return message;
  }

  function newPendingMessage(conversation, text, journalType) {
    var timestamp = new Date().getTime();
    var message = buildMessageFromJSONObject({
      sys_id: timestamp + Math.random(),
      profile: liveProfileID,
      group: conversation.sysID,
      created_on: getLocalCreatedOn(timestamp),
      formatted_message: text,
      reflected_field: journalType || "comments",
      timestamp: timestamp,
      pending: true
    });
    message.pending = true;
    return message;
  }

  function getLocalCreatedOn(timestamp) {
    return new Date(timestamp)
      .toISOString()
      .replace(TIMESTAMP, "$1 $2");
  }

  function removeHtml(html, unsanitized) {
    if (unsanitized)
      return html;
    REUSE_DIV.innerHTML = html;
    return REUSE_DIV.textContent || REUSE_DIV.innerText || '';
  }

  function createCleanText(html, pending) {
    var text = removeHtml(html, pending);
    return replaceText(text, '@$2', '$2')
  }
  return {
    fromObject: buildMessageFromJSONObject,
    newPendingMessage: newPendingMessage,
    newPendingAttachmentMessage: newPendingAttachmentMessage
  }
});;