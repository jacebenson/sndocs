/*! RESOURCE: /scripts/app.ng_chat/util/service.messageNotifier.js */
angular.module('sn.connect.util').service('messageNotifier', function(
    $window, $q, snNotifier, i18n, profiles, pageLoadTimestamp, liveProfileID, snTabActivity,
    conversations, userPreferences, notificationPreferences, activeConversation, messageService, titleFlasher) {
    "use strict";
    var lastMessageTime = pageLoadTimestamp || 0;
    var glideNotificationText;
    var securedLinkNotificationText;
    i18n.getMessages(["New Message From {0}: {1}", "You don't have permission to access this document/content"],
        function(results) {
            glideNotificationText = results["New Message From {0}: {1}"];
            securedLinkNotificationText = results["You don't have permission to access this document/content"];
        });

    function notify(message) {
        var shouldExit = !(message.isFromPeer || message.isSystemMessage) ||
            messageIsOlderThanMostRecentNotification(message);
        if (shouldExit)
            return;
        if (!notificationPreferences.globalPreferences.desktop)
            return;
        lastMessageTime = message.timestamp + 1;
        if (!snTabActivity.isPrimary)
            return;
        var promises = [];
        var allowWebNotifications = false;
        var conversationID = message.conversationID;
        promises.push(userPreferences.getPreference("connect.notifications.desktop").then(function(value) {
            allowWebNotifications = angular.isString(value) ? value === "true" : value;
        }));
        $q.all(promises).then(function() {
            if (!allowWebNotifications)
                return;
            var preferences = notificationPreferences.get(message.conversationID);
            if (preferences.desktop === "off")
                return;
            if (preferences.desktop === "mention") {
                if (!message.mentions || message.mentions.length === 0)
                    return;
                var mentioned = message.mentions.some(function(mention) {
                    return mention.mention === liveProfileID;
                });
                if (!mentioned)
                    return;
            }
            if (message.isSystemMessage && !preferences.systemMessage)
                return;
            titleFlasher.flash();
            var notifyAvatar = null;
            conversations.get(conversationID).then(function(conversation) {
                var promise;
                if (message.conversationID && message.isSystemMessage) {
                    var profile = (conversation.profileData || conversation.profile);
                    if (profile)
                        promise = $q.when(profile.name);
                    else {
                        promise = profiles.getAsync(message.profile).then(function(profile) {
                            return (profile && profile.name) ? profile.name : "Unknown User";
                        });
                    }
                } else {
                    promise = profiles.getAsync(message.profile).then(function(profile) {
                        if (conversation.isGroup) {
                            notifyAvatar = conversation.avatar || null;
                            return (profile && profile.name) ? profile.name + " in " + conversation.name : "Unknown User" + " in " + conversation.name;
                        } else {
                            notifyAvatar = profile.avatar || null;
                            return (profile && profile.name) ? profile.name : "Unknown User";
                        }
                    });
                }
                promise.then(function(title) {
                    var body;
                    if (snNotifier().canUseNativeNotifications()) {
                        body = message.cleanText;
                    } else {
                        body = glideNotificationText.replace(/\{0\}/, title).replace(/\{1\}/, message.cleanText);
                    }
                    snNotifier().notify(title, {
                        body: body,
                        lifespan: 7000,
                        icon: notifyAvatar || '/native_notification_icon.png',
                        tag: message.sysID,
                        onClick: function() {
                            activeConversation.conversation = conversation;
                        }
                    });
                });
            });
        });
    }

    function messageIsOlderThanMostRecentNotification(message) {
        return message.timestamp < lastMessageTime;
    }
    return {
        notify: notify,
        registerMessageServiceWatch: function(additionalRequirements) {
            messageService.watch(function(message) {
                if (activeConversation.sysID === message.conversationID &&
                    snTabActivity.idleTime < snTabActivity.defaultIdleTime &&
                    snTabActivity.isVisible)
                    return;
                if (angular.isFunction(additionalRequirements) && !additionalRequirements(message))
                    return;
                notify(message);
            });
        }
    }
});;