/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntryNotifier.js */
angular.module('sn.connect.queue').service('queueEntryNotifier', function(
  $window, snNotifier, i18n, profiles, userPreferences, activeConversation, snNotification, inFrameSet) {
  'use strict';
  var A_TAG = '<a href="/$c.do#/support" target="_self">{0}</a>';
  var LOCAL_STORAGE_KEY = 'sn.connect.queueEntryNotifier.lastUpdatedOn';
  var NOTIFICATION_TEMPLATE = ['You have an incoming case transfer from {0}.',
    'To view the conversation, accept or decline the request,'
  ].join(' ');
  var transferPendingText,
    transferAcceptedText,
    transferRejectedText,
    transferCancelledText,
    transferPendingNotificationText;
  i18n.getMessages([
    'Incoming chat transfer',
    'Accepted {0}',
    'Rejected {0}',
    'Cancelled transfer {0}',
    'click here',
    NOTIFICATION_TEMPLATE
  ], function(results) {
    transferPendingText = results['Incoming chat transfer'];
    transferAcceptedText = results['Accepted {0}'];
    transferRejectedText = results['Rejected {0}'];
    transferCancelledText = results['Cancelled transfer {0}'];
    transferPendingNotificationText = results[NOTIFICATION_TEMPLATE] + " " + A_TAG.replace(/(\{0})/g, results['click here']);
  });
  var lastUpdatedOn;
  angular.element($window).on('storage', function(e) {
    if (e.originalEvent.key !== LOCAL_STORAGE_KEY)
      return;
    lastUpdatedOn = $window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastUpdatedOn) {
      lastUpdatedOn = new Date(lastUpdatedOn)
    }
  });
  return {
    notify: function(conversation) {
      var queueEntry = conversation.queueEntry;
      if (!inFrameSet && !activeConversation.isSupport && queueEntry.isTransferringToMe) {
        profiles.getAsync('sys_user.' + queueEntry.assignedTo).then(function(profile) {
          snNotification.show('info', i18n.format(transferPendingNotificationText, profile.name))
            .then(function(element) {
              element.on('click', function() {
                snNotification.hide(element);
                activeConversation.conversation = conversation;
              });
            });
        });
      }
      userPreferences.getPreference('connect.notifications.desktop').then(function(value) {
        if (value === 'false')
          return;
        if (!queueEntry.isTransferStateChanged)
          return;
        if (queueEntry.transferUpdatedOn <= lastUpdatedOn)
          return;
        var body, userID;
        if (queueEntry.isTransferringToMe) {
          if (queueEntry.isTransferPending) {
            userID = queueEntry.assignedTo;
            body = transferPendingText + "\n" + queueEntry.number + " - " + queueEntry.shortDescription;
          }
          if (queueEntry.isTransferCancelled) {
            userID = queueEntry.assignedTo;
            body = transferCancelledText.replace(/\{0\}/, queueEntry.number);
          }
        } else if (queueEntry.isTransferringFromMe) {
          if (queueEntry.isTransferAccepted) {
            userID = queueEntry.assignedTo;
            body = transferAcceptedText.replace(/\{0\}/, queueEntry.number);
          }
          if (queueEntry.isTransferRejected) {
            userID = queueEntry.transferTo;
            body = transferRejectedText.replace(/\{0\}/, queueEntry.number);
          }
        }
        if (!body)
          return;
        $window.localStorage.setItem(LOCAL_STORAGE_KEY, queueEntry.transferUpdatedOn);
        profiles.getAsync('sys_user.' + userID).then(function(profile) {
          snNotifier().notify(profile.name, {
            body: body,
            onClick: function() {
              activeConversation.conversation = conversation;
            }
          });
        });
      });
    }
  }
});;