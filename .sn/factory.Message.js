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
            resourcePersister.addAttachment(jsonObject.group, attachment);
            this.push(attachment)
        }, attachments);
        var text = jsonObject.formatted_message;
        var escapedText = htmlEscape(text);
        var displayText = replaceText(escapedText,
                "<a class='at-mention at-mention-user-$1'>@$2</a>",
                linkFormatter)
            .replace(/\r/g, "")
            .replace(/\n/g, "<br>");
        var cleanText = replaceText(escapedText, "@$2", "$2");

        function linkFormatter(wholeMatch, urlOrSysID, linkText) {
            var isSysID = urlOrSysID.match(/^[0-9A-F]{32}$/i);
            var matchedLink;
            var url;
            if (isSysID) {
                matchedLink = links.filter(function(link) {
                    return link.sysID === urlOrSysID;
                })[0];
                url = matchedLink && matchedLink.url;
            } else {
                url = urlOrSysID;
                matchedLink = links.filter(function(link) {
                    var escapedUrl = htmlEscape(link.url);
                    return link.url === url || escapedUrl === url || htmlEscape(escapedUrl) === url;
                })[0];
            }
            if (matchedLink) {
                try {
                    return matchedLink.aTag(linkText);
                } catch (unused) {}
            }
            return linkText;
        }
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

    function replaceText(text, mentions, links) {
        if (!text)
            return "";
        return text
            .replace(/@M\[([^|]+?)\|([^\]]+?)]/gi, mentions)
            .replace(/@\[([^:\]]+?):([^\]]+)]/g, mentions)
            .replace(/@L\[([^|]+?)\|([^\]]*)]/gi, links);
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
            timestamp: timestamp
        });
        message.pending = true;
        return message;
    }

    function getLocalCreatedOn(timestamp) {
        return new Date(timestamp)
            .toISOString()
            .replace(/(.*?)T(.*?)[.].*/g, "$1 $2");
    }

    function htmlEscape(str) {
        return angular.element("<textarea/>").text(str).html();
    }
    return {
        fromObject: buildMessageFromJSONObject,
        newPendingMessage: newPendingMessage,
        newPendingAttachmentMessage: newPendingAttachmentMessage
    }
});;