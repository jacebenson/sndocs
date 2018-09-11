/*! RESOURCE: /scripts/app.ng_chat/util/service.audioNotifier.js */
angular.module('sn.connect.util').service('audioNotifier', function(
  notifySound, $timeout, messageService, snTabActivity, pageLoadTimestamp,
  notificationPreferences, userPreferences, $q, liveProfileID) {
  "use strict";
  var audio = new Audio(notifySound),
    AUDIO_COOLDOWN = Math.max(1000, (audio.duration * 1000 + 100)),
    cdTimer,
    notifyQueued = false,
    notifyAvailable = true,
    lastMessageTime = pageLoadTimestamp || 0;

  function notify(message) {
    if (angular.isString(message))
      message = {
        conversationID: message,
        timestamp: lastMessageTime + 1
      };
    if (message.timestamp < lastMessageTime)
      return;
    if (!notifyAvailable)
      return notifyQueued = true;
    lastMessageTime = message.timestamp + 1;
    if (!snTabActivity.isPrimary)
      return;
    notifyAvailable = false;
    notifyQueued = false;
    var promises = [],
      allowAudioNotifications = false;
    promises.push(userPreferences.getPreference("connect.notifications.audio").then(function(value) {
      allowAudioNotifications = angular.isString(value) ? value === "true" : value;
    }));
    $q.all(promises).then(function() {
      if (!allowAudioNotifications)
        return;
      if (message.conversationID) {
        var preferences = notificationPreferences.get(message.conversationID);
        if (preferences.audio === "off")
          return;
        if (preferences.audio === "mention") {
          if (!message.mentions || message.mentions.length === 0)
            return;
          var mentioned = message.mentions.some(function(mention) {
            return mention.mention = liveProfileID;
          });
          if (!mentioned)
            return;
        }
      }
      audio.play();
      cdTimer = $timeout(function() {
        notifyAvailable = true;
        if (notifyQueued)
          notify(message);
      }, AUDIO_COOLDOWN, false);
    });
  }
  return {
    notify: notify,
    registerMessageServiceWatch: function(activeConversation, additionalRequirements) {
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