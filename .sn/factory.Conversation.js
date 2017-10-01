/*! RESOURCE: /scripts/app.ng_chat/conversation/factory.Conversation.js */
angular.module('sn.connect.conversation').factory('conversationFactory', function(
    conversationPersister, unreadCountService, profiles, messageFactory, ChatActionHandler, liveProfileID,
    notificationPreferences, queueEntries, documentsService, resourcePersister, messageBatcherService, inSupportClient) {
    'use strict';

    function formatUnreadCount(count) {
        return count > 99 ? "99+" : count;
    }

    function fromObject(data) {
        var frameState = data.frame_state || 'open';
        var frameOrder = data.frame_order || 0;
        var amMember = true;
        var visible = data.visible;
        var pendingMessage = "";
        try {
            pendingMessage = sessionStorage.getItem("messagePersist." + data.sys_id) || "";
        } catch (ignored) {}
        unreadCountService.set(data.sys_id, data.last_viewed, data.unread_messages);
        messageBatcherService.addMessages(messageFactory.fromObject(data.last_message), true);

        function getMemberIndexByID(id) {
            for (var i = 0, len = data.members.length; i < len; i++)
                if (data.members[i].sys_id === id)
                    return i;
            return -1;
        }

        function setFrameState(value) {
            if (frameState === value)
                return;
            frameState = value;
            conversationPersister.frameState(data.sys_id, value);
        }
        if (!data.members) {
            data.members = [];
        }
        var memberProfiles = [];
        profiles.addMembers(data.members);
        if (data.queueEntry)
            queueEntries.addRaw(data.queueEntry);
        return {
            get name() {
                return (!data.group && this.peer) ? this.peer.name : data.name;
            },
            set name(newName) {
                if (!data.group)
                    return;
                data.name = newName;
            },
            get access() {
                return data.access || "unlisted";
            },
            set access(newAccess) {
                data.access = newAccess;
            },
            get peer() {
                if (data.group || !this.members || this.members.length < 2) {
                    return null;
                }
                return (this.members[0].sysID === liveProfileID) ? this.members[1] : this.members[0];
            },
            get members() {
                if (memberProfiles.length !== data.members.length) {
                    memberProfiles.length = 0;
                    angular.forEach(data.members, function(member) {
                        if (member.table !== 'sys_user')
                            return;
                        var memberProfile = profiles.get(member.sys_id || member);
                        if (!memberProfile)
                            return;
                        if (memberProfiles.indexOf(memberProfile) >= 0)
                            return;
                        memberProfiles.push(memberProfile);
                    });
                }
                return memberProfiles;
            },
            get avatarMembers() {
                if (!data.isHelpDesk)
                    return this.members;
                return this.members.filter(function(member) {
                    return member.sys_id !== liveProfileID;
                });
            },
            get pendingMessage() {
                return pendingMessage
            },
            set pendingMessage(message) {
                pendingMessage = message;
                try {
                    sessionStorage.setItem("messagePersist." + this.sysID, message);
                } catch (ignored) {}
            },
            get description() {
                return data.description;
            },
            set description(newDescription) {
                data.description = newDescription;
            },
            resetUnreadCount: function() {
                if (this.sysID)
                    unreadCountService.reset(this.sysID);
            },
            get messageBatcher() {
                return messageBatcherService.getBatcher(this.sysID);
            },
            get ariaMessages() {
                var messages = messageBatcherService.getAriaMessages(this.sysID, 5);
                return messages.filter(function(message) {
                    return message.timestamp >= data.last_viewed;
                });
            },
            get lastMessage() {
                return messageBatcherService.getLastMessage(this.sysID) || {};
            },
            get firstMessage() {
                return messageBatcherService.getFirstMessage(this.sysID) || {};
            },
            get hasUnreadMessages() {
                return this.unreadCount > 0;
            },
            get unreadCount() {
                return unreadCountService.get(this.sysID);
            },
            get lastReadMessageTime() {
                return unreadCountService.getLastTimestamp(this.sysID);
            },
            get formattedUnreadCount() {
                return formatUnreadCount(this.unreadCount);
            },
            get isDirectMessage() {
                return !(this.isGroup || this.isDocumentGroup || this.isHelpDesk);
            },
            get isGroup() {
                return data.group;
            },
            get isHelpDesk() {
                return !!this.queueEntry && !!this.queueEntry.sysID;
            },
            get queueEntry() {
                return queueEntries.get(this.sysID);
            },
            get isDocumentGroup() {
                return !!data.document || this.isHelpDesk;
            },
            restricted: data.restricted,
            avatar: data.avatar,
            get sysID() {
                return data.sys_id;
            },
            get href() {
                return '/$c.do#/' + (this.isHelpDesk ? 'support' : 'chat') + '/' + this.sysID;
            },
            get document() {
                return data.document;
            },
            get table() {
                return data.table;
            },
            get hasRecord() {
                var documentDetails = this.documentDetails;
                return documentDetails && !!documentDetails.sysID;
            },
            get documentDetails() {
                if (data.table === 'chat_queue_entry')
                    return;
                if (!this._documentsServiceRetrieve) {
                    this._documentsServiceRetrieve = true;
                    documentsService.retrieve(data.table, data.document);
                }
                return documentsService.getDocument(data.document);
            },
            get resources() {
                return resourcePersister.get(this.sysID);
            },
            get preferences() {
                return notificationPreferences.get(this.sysID);
            },
            get chatActions() {
                if (!this.chatActionHandler)
                    this.chatActionHandler = ChatActionHandler.create(this);
                return this.chatActionHandler;
            },
            frameOrder: frameOrder,
            openFrameState: function() {
                setFrameState('open');
            },
            get isFrameStateOpen() {
                return frameState === 'open';
            },
            minimizeFrameState: function() {
                setFrameState('minimized');
            },
            get isFrameStateMinimize() {
                return frameState === 'minimized';
            },
            closeFrameState: function() {
                setFrameState('closed');
            },
            get isFrameStateClosed() {
                return frameState === 'closed';
            },
            get amMember() {
                return amMember || getMemberIndexByID(liveProfileID) !== -1;
            },
            get visible() {
                return visible;
            },
            set visible(value) {
                if (visible === value)
                    return;
                visible = value;
                conversationPersister.visible(this.sysID, visible);
            },
            get sortIndex() {
                if (inSupportClient && this.isHelpDesk) {
                    var queueEntry = this.queueEntry;
                    if (queueEntry.workEnd)
                        return queueEntry.workEnd;
                    if (queueEntry.workStart)
                        return queueEntry.workStart;
                }
                return this.lastMessage.timestamp || 0;
            },
            get canSaveWorkNotes() {
                return data.can_save_work_notes;
            },
            addMember: function(member) {
                if (getMemberIndexByID(member.sys_id) < 0) {
                    data.members.push(member);
                    if (member.sys_id === liveProfileID)
                        amMember = true;
                }
            },
            removeMember: function(member) {
                var memberIndex = getMemberIndexByID(member.sys_id);
                if (memberIndex < 0)
                    return;
                data.members.splice(memberIndex, 1);
                memberProfiles.splice(memberIndex, 1);
                if (member.sys_id === liveProfileID)
                    amMember = false;
            }
        };
    }
    return {
        fromObject: fromObject,
        fromRawConversation: function(data) {
            data.memberData = data.members;
            var preference = data.notification_preference;
            preference.sys_id = data.sys_id;
            notificationPreferences.addRaw(preference);
            return fromObject(data);
        },
        formatUnreadCount: formatUnreadCount
    };
});;