/*! RESOURCE: /scripts/app.ng_chat/conversation/service.conversations.js */
angular.module('sn.connect.conversation').service('conversations', function(
    $rootScope, $q, $timeout, amb, i18n, conversationFactory, conversationPersister, documentsService, liveProfileID,
    userID, snHttp, queueEntries, snComposingPresence, snCustomEvent, snTabActivity, snNotification, profiles,
    snNotifier, userPreferences, messageBatcherService, isLoggedIn, sessionID, supportEnabled) {
    "use strict";
    var i18nText;
    i18n.getMessages(['and', 'more', 'You have been mentioned'], function(i18nNames) {
        i18nText = i18nNames;
    });
    var currentLiveProfile;
    profiles.getAsync(liveProfileID).then(function(liveProfile) {
        currentLiveProfile = liveProfile;
    });
    var conversationsIndex = {};
    var onNextUpdate = function() {};
    var lastRefresh = $q.when();
    var firstRefresh = $q.defer();
    var loaded = false;
    var channelId = isLoggedIn ? userID : sessionID;
    amb.getChannel("/connect/" + channelId).subscribe(function(response) {
        var event = response.data;
        var type = event.event_type;
        var data = event.event_data;
        var conversationID = event.event_target || event.group || data.conversation_id;
        var conversation = conversationsIndex[conversationID];
        if (!conversation)
            return;
        if (type === "conversation_member_removed") {
            conversation.removeMember(data);
            if (data.sys_id !== liveProfileID)
                return;
            if (conversation.isPending)
                return;
            snComposingPresence.set(conversation.sysID, [], []);
            delete conversationsIndex[conversation.sysID];
            return;
        }
        if (type === "conversation_member_added") {
            conversation.addMember(data);
            if (data.sys_id === liveProfileID) {
                $rootScope.$broadcast("conversation.refresh_messages", conversation);
            }
            return;
        }
        if (type === "conversation_deauthorized") {
            conversation.restricted = true;
            return;
        }
        if (type === "conversation_updated")
            refreshConversation(conversationID).then(onNextUpdate).then(function() {
                onNextUpdate = function() {};
            });
    });
    amb.getChannel("/notifications/" + liveProfileID).subscribe(function(message) {
        userPreferences.getPreference("connect.notifications.desktop").then(function(value) {
            var allowWebNotifications = angular.isString(value) ? value === "true" : value;
            if (allowWebNotifications && snTabActivity.isPrimary) {
                var body = i18nText[message.data.message] || message.data.message;
                snNotifier().notify(message.data.title, {
                    body: body,
                    lifespan: 7000,
                    onClick: function() {
                        window.open("/nav_to.do?uri=/" + message.data.table + ".do?sys_id=" + message.data.document, "_blank");
                    }
                });
            }
        });
    });
    amb.connect();
    snCustomEvent.observe('connect:set_document', function(data) {
        conversationPersister.setDocument(data.conversation, data.table, data.document)
            .then(function() {
                onNextUpdate = function(conversation) {
                    documentsService.show(conversation.table, conversation.document);
                };
            });
    });
    $rootScope.$on("amb.connection.recovered", function() {
        refreshAll();
    });
    snTabActivity.on("tab.primary", function() {
        refreshAll();
    });

    function refreshAll(queueID) {
        var deferred = $q.defer();
        lastRefresh = deferred.promise;
        conversationPersister.getConversations(queueID).then(function(conversations) {
            if (!loaded) {
                loaded = true;
                firstRefresh.resolve();
            }
            conversationsIndex = {};
            angular.forEach(conversations, addRawConversation);
            deferred.resolve();
        });
        return lastRefresh;
    }

    function refreshConversation(id) {
        return conversationPersister.getConversation(id).then(addRawConversation,
            function(response) {
                if (response.status === 403)
                    snNotification.show("error", response.data.result);
                return $q.reject(response)
            });
    }

    function addRawConversation(conversationData) {
        if (!conversationData)
            return;
        var conversation = new conversationFactory.fromRawConversation(conversationData);
        return conversationsIndex[conversation.sysID] = conversation;
    }

    function _get(conversationID) {
        if (conversationsIndex[conversationID])
            return $q.when(conversationsIndex[conversationID]);
        return refreshConversation(conversationID).then(function() {
            if (conversationID === 'pending')
                return NewConversation();
            if (!conversationsIndex[conversationID])
                throw "Conversation " + conversationID + " does not exist";
            return conversationsIndex[conversationID];
        })
    }

    function get(conversationID) {
        return lastRefresh.then(function() {
            return _get(conversationID);
        }, function() {
            return _get(conversationID);
        })
    }

    function getCachedPeerConversations(userSysID) {
        return allConversations().filter(function(conversation) {
            return conversation.isDirectMessage && conversation.members.some(function(member) {
                return member.userID === userSysID;
            });
        });
    }

    function allConversations() {
        return Object.keys(conversationsIndex).map(function(key) {
            return conversationsIndex[key];
        });
    }

    function find(conversation, conversationList) {
        conversationList = conversationList || allConversations();
        var sysID = conversation.sysID || conversation;
        for (var i = 0; i < conversationList.length; ++i) {
            var conv = conversationList[i];
            if (conv.sysID === sysID)
                return {
                    conversation: conv,
                    index: i
                };
        }
        return {
            index: -1
        };
    }

    function close(conversationID) {
        var conversation = conversationsIndex[conversationID];
        if (!conversation)
            return false;
        if (!conversation.isHelpDesk) {
            remove(conversation);
            return true;
        }
        var queueEntry = conversation.queueEntry;
        if (queueEntry.isWaiting || queueEntry.isEscalated || queueEntry.isTransferRejected || queueEntry.isTransferCancelled) {
            removeSupport(conversation.sysID);
            return true;
        }
        if (queueEntry.isClosedByAgent || !queueEntry.isAssignedToMe) {
            if (!supportEnabled && !conversation.restricted) {
                $rootScope.$broadcast('connect.non_agent_conversation.close_prompt', conversation);
                return false;
            }
            closeSupport(conversationID, true);
            return true;
        }
        $rootScope.$broadcast('connect.support_conversation.close_prompt', conversation, true);
        return false;
    }

    function remove(conversation) {
        conversation.closeFrameState();
        conversation.resetUnreadCount();
        conversation.visible = false;
    }

    function closeSupport(conversationID, agentLeave) {
        queueEntries.close(conversationID, agentLeave);
        if (agentLeave)
            removeSupport(conversationID);
    }

    function removeSupport(conversationID) {
        queueEntries.remove(conversationID);
        delete conversationsIndex[conversationID];
    }

    function removeUser(conversationID, userID) {
        var conversation = conversationsIndex[conversationID];
        if (userID === liveProfileID) {
            remove(conversation);
            if (conversation.isHelpDesk)
                removeSupport(conversation.sysID);
        }
        conversationPersister.removeUser(conversationID, userID);
    }

    function exists(conversationID) {
        return conversationID in conversationsIndex;
    }
    var NewConversation = function() {
        messageBatcherService.removeMessageBatcher("pending");

        function listRecipients(recipients, shorten) {
            var names = recipients.map(function(recipient) {
                return shorten ?
                    recipient.name.split(" ")[0] :
                    recipient.name;
            });
            var and = shorten ?
                " & " :
                (" " + i18nText["and"] + " ");
            var more = shorten ?
                (" +" + (recipients.length - 3)) :
                (and + (recipients.length - 3));
            more += " " + i18nText["more"];
            switch (recipients.length) {
                case 0:
                    return "";
                case 1:
                    return names[0];
                case 2:
                    return names[0] + and + names[1];
                case 3:
                    return names[0] + ", " + names[1] + ", " + and + names[2];
                case 4:
                    return names[0] + ", " + names[1] + ", " + names[2] + ", " + and + names[3];
                default:
                    return names[0] + ", " + names[1] + ", " + names[2] + ", " + more;
            }
        }
        return {
            sysID: "pending",
            isPending: true,
            pendingRecipients: [],
            name: "New Conversation",
            frameState: 'open',
            frameOrder: 0,
            get messageBatcher() {
                return messageBatcherService.getBatcher(this.sysID);
            },
            get firstMessage() {
                return messageBatcherService.getFirstMessage(this.sysID);
            },
            get isPendingNoRecipients() {
                return this.pendingRecipients.length === 0;
            },
            getGroupName: function() {
                var nameArray = this.pendingRecipients.slice();
                nameArray.unshift(currentLiveProfile);
                return listRecipients(nameArray, true);
            },
            get displayRecipients() {
                return listRecipients(this.pendingRecipients, false);
            },
            closeFrameState: function() {},
            openFrameState: function() {},
            $reset: function() {
                return newConversation = new NewConversation();
            }
        };
    };
    var newConversation = new NewConversation();
    var emptyConversation = conversationFactory.fromObject({});
    emptyConversation.isEmpty = true;
    return {
        get all() {
            return allConversations();
        },
        get indexed() {
            return conversationsIndex;
        },
        loaded: firstRefresh.promise,
        get: get,
        getCachedPeerConversations: getCachedPeerConversations,
        refreshAll: refreshAll,
        refreshConversation: refreshConversation,
        exists: exists,
        find: find,
        addUser: function(conversationID, userID) {
            return conversationPersister.addUser(conversationID, userID).then(get, function(response) {
                if (response.status === 403)
                    snNotification.show("error", response.data.result);
                return $q.reject(response)
            });
        },
        removeUser: removeUser,
        followDocumentConversation: function(data) {
            return conversationPersister.createDocumentConversation(data.table, data.sysID).then(addRawConversation);
        },
        unfollowDocumentConversation: function(data) {
            var conversationID = data.conversationID;
            if (conversationID === "undefined")
                conversationID = undefined;
            if (!conversationID) {
                for (var id in conversationsIndex) {
                    if (!conversationsIndex.hasOwnProperty(id))
                        continue;
                    var conversation = conversationsIndex[id];
                    if (conversation.document === data.sysID) {
                        conversationID = conversation.sysID;
                        break;
                    }
                }
            }
            return removeUser(conversationID, liveProfileID);
        },
        close: close,
        closeSupport: closeSupport,
        update: function(conversationID, data) {
            var conversation = conversationsIndex[conversationID];
            data.name = data.name.trim();
            if (data.name.length === 0)
                data.name = conversation.name;
            data.description = data.description.trim();
            if (data.description.length === 0)
                data.description = conversation.description;
            if ((data.name === conversation.name) &&
                (data.description === conversation.description) &&
                (data.access === conversation.access))
                return;
            conversation.name = data.name;
            conversation.description = data.description;
            conversation.access = data.access;
            var element = {
                name: data.name,
                short_description: data.description,
                access: data.access
            };
            return conversationPersister.update(conversationID, element).then(addRawConversation);
        },
        beginNewConversation: function(groupName, recipients, message) {
            messageBatcherService.addMessages(message);
            return conversationPersister.createConversation(groupName, recipients, message).then(addRawConversation);
        },
        get newConversation() {
            return newConversation;
        },
        get emptyConversation() {
            return emptyConversation;
        }
    }
});;