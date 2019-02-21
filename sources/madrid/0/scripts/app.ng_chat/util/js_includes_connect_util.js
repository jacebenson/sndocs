/*! RESOURCE: /scripts/app.ng_chat/util/js_includes_connect_util.js */
/*! RESOURCE: /scripts/app.ng_chat/util/_module.js */
angular.module("sn.connect.util", ["sn.connect.resource", "sn.common.attachments", "sn.common.accessibility"]);;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.connectConversationBarToggle.js */
angular.module('sn.connect').directive('connectConversationBarToggle', [
  'getTemplateUrl',
  function(getTemplateUrl) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('connectConversationBarToggle.xml'),
      restrict: 'E',
      replace: true,
      controller: ['$scope', 'paneManager', function($scope, paneManager) {
        $scope.unreadMessages = 0;
        $scope.state = "closed";
        $scope.toggleConversationList = function() {
          paneManager.togglePane('connect:conversation_list', true);
        };
        CustomEvent.observe("connect:conversation_list:state", function(state) {
          $scope.state = state;
        });
        CustomEvent.observe('connect:message_notification.update', function(val) {
          $scope.unreadMessages = val;
        });
        $scope.formattedUnreadCount = function(count) {
          return (count <= 99) ? count : "99+";
        }
      }],
      link: function(scope, element) {
        scope.$on('pane.collapsed', function($event, position, isCollapsed, autoFocus) {
          if (isCollapsed && autoFocus) {
            element.focus();
          }
        });
      }
    }
  }
]);;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectHeader.js */
angular.module('sn.connect').directive('snConnectHeader', function(getTemplateUrl, activeConversation) {
  'use strict';
  return {
    templateUrl: getTemplateUrl('snConnectHeader.xml'),
    restrict: 'E',
    replace: true,
    controller: function($scope) {
      var asideTab = 'members';
      $scope.toggleAside = function(side) {
        $scope.$root.$broadcast('connect.pane.toggle.' + side);
        if (side === 'right') {
          $scope.$root.$broadcast('sn.aside.trigger_control', asideTab);
        }
      };
      $scope.$on('sn.aside.trigger_control', function(event, newAsideTab) {
        asideTab = newAsideTab;
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectContent.js */
angular.module('sn.connect').directive('snConnectContent', function(getTemplateUrl) {
  'use strict';
  return {
    templateUrl: getTemplateUrl('snConnectContent.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function(scope) {
      function togglePane(pane) {
        return function() {
          if (scope.activePane !== pane)
            scope.activePane = pane;
          else
            delete scope.activePane;
        };
      }

      function closePane() {
        delete scope.activePane;
      }
      scope.$on('connect.pane.toggle.left', togglePane('left'));
      scope.$on('connect.pane.toggle.right', togglePane('right'));
      scope.$on('connect.pane.close', closePane);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActions.js */
angular.module('sn.connect.util').directive('snActions', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snActions.xml"),
    replace: true
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActionsMenu.js */
angular.module("sn.connect.util").directive("snActionsMenu", function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snActionsMenu.xml"),
    scope: {
      conversation: "="
    },
    replace: true,
    link: function(scope, elem) {
      if (elem.hideFix)
        elem.hideFix();
    },
    controller: function($scope, $timeout, $rootScope) {
      $scope.runAction = function($event, chatAction) {
        if (chatAction.isActive) {
          $event.preventDefault();
          $event.stopPropagation();
          return;
        }
        if (chatAction.requiresArgs) {
          $timeout(function() {
            $scope.conversation.chatActions.currentAction = chatAction;
            $scope.$emit("connect.chat_action.require_options", $scope.conversation);
          }, 0, false)
        } else {
          chatAction.trigger($scope.conversation);
        }
      };
      $scope.addAttachment = function() {
        $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snDropTargetPopup.js */
angular.module("sn.connect.util").directive("snDropTargetPopup", function(getTemplateUrl, $window) {
  "use strict";
  return {
    restrict: "E",
    templateUrl: getTemplateUrl('snDropTargetPopup.xml'),
    replace: true,
    scope: {
      conversation: "="
    },
    link: function(scope, element) {
      var messageElement = element.find(".drop-target-message");
      scope.showDropTarget = false;
      scope.$on("connect.drop_target_popup.show", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        scope.showDropTarget = true;
        element.css({
          "z-index": 10
        });
        element.velocity({
          opacity: 1
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
        messageElement.velocity({
          "padding-top": "0px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
      scope.$on("connect.drop_target_popup.hide", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        element.velocity({
          opacity: 0
        }, {
          duration: 300,
          easing: "easeOutCubic",
          complete: function() {
            scope.showDropTarget = false;
            element.css({
              "z-index": -1
            })
          }
        });
        messageElement.velocity({
          paddingTop: "40px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingBar.js */
angular.module('sn.connect.util').directive('snLoadingBar', function() {
  "use strict";
  return {
    restrict: 'E',
    template: "<div class='sn-loading-bar'></div>",
    replace: true,
    link: function(scope, element) {
      scope.$on("connect.loading-bar.start", function() {
        element.velocity({
          width: 90 + "%"
        }, {
          easing: "linear",
          duration: 450
        });
      });
      scope.$on("connect.loading-bar.finish", function() {
        element.velocity({
          width: 100 + "%"
        }, {
          easing: "linear",
          duration: 50
        }).velocity({
          opacity: 0
        }, {
          easing: "linear",
          duration: 300
        }).velocity({
          width: 0,
          opacity: 1
        }, {
          duration: 0
        })
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPulse.js */
angular.module('sn.connect.util').directive('snPulse', function($timeout) {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var timeouts = scope.pulseTimeouts ? angular.fromJson(attrs.pulseTimeouts) : [10000, 10000, 10000, 10000];
      var classes = ['pulse-off', 'pulse-positive', 'pulse-warning', 'pulse-danger'];
      var index = 0;
      var timeout;
      var enabled = true;
      scope.$watch(function() {
        return attrs.pulseEnabled;
      }, function() {
        enabled = attrs.pulseEnabled === 'true';
        if (!enabled) {
          $timeout.cancel(timeout);
          element.removeClass(classes.join(' '));
        }
      });
      scope.$watch(function() {
        return attrs.pulseTimestamp;
      }, function() {
        index = 0;
        $timeout.cancel(timeout);
        if (attrs.pulseTimestamp && enabled) {
          var start = parseInt(attrs.pulseTimestamp, 10);
          var now = Date.now();
          var diff = now - start;
          var elapsedTime = 0;
          for (var i = 0; i < timeouts.length; i++) {
            if (diff >= elapsedTime) {
              index = i;
              elapsedTime += timeouts[i];
            }
          }
          updateClass();
        }
      });

      function updateClass() {
        element.removeClass(classes.join(' '));
        if (index > 0) {
          element.addClass(classes[index]);
        }
        if (index < timeouts.length - 1) {
          timeout = $timeout(updateClass, timeouts[index + 1]);
          index++;
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.liveIntroduction.js */
angular.module('sn.connect').directive('liveIntroduction', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveIntroduction.xml'),
    replace: true,
    scope: {},
    controller: function($scope, activeConversation) {
      $scope.activeConversation = activeConversation;
    }
  };
});;
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
    if (!message.isFromPeer)
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
        if ((!activeConversation.sysID || activeConversation.sysID === message.conversationID) &&
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
/*! RESOURCE: /scripts/app.ng_chat/util/service.uploadAttachment.js */
angular.module('sn.connect.util').service('uploadAttachmentService', function(
  $q, $rootScope, $timeout, snAttachmentHandler, maxAttachmentSize, liveProfileID, i18n, screenReaderStatus) {
  "use strict";
  var MAX_SIZE = maxAttachmentSize * 1024 * 1024;
  var attachmentHandlers = [];
  var filesInProgress = [];
  var uploadSuccess = "{0} successfully uploaded";
  var uploadFailure = "Failed to upload {0}: {1}";
  i18n.getMessages([uploadSuccess, uploadFailure], function(results) {
    uploadSuccess = results[uploadSuccess];
    uploadFailure = results[uploadFailure];
  });

  function remove(file) {
    var index = filesInProgress.indexOf(file);
    if (index < 0)
      return;
    return filesInProgress.splice(index, 1)[0];
  }

  function apply(fileFns, fnType, file) {
    var fn = fileFns[fnType];
    if (fn)
      fn(file);
    file.state = fnType;
    $rootScope.$broadcast('attachments_list.upload.' + fnType, file);
  }

  function progress(fileFns, file, loaded, total) {
    total = total || file.size;
    if (angular.isDefined(loaded)) {
      file.loaded = loaded;
      file.progress = Math.min(100.0 * loaded / total, 100.0);
    } else {
      file.loaded = total;
      file.progress = 100.0;
    }
    apply(fileFns, "progress", file);
  }

  function getAttachmentHandler(conversation) {
    var sysID = conversation.sysID;
    var attachmentHandler = attachmentHandlers[sysID];
    if (!attachmentHandler)
      attachmentHandler = attachmentHandlers[sysID] = conversation.isPending ?
      snAttachmentHandler.create("live_profile", liveProfileID) :
      snAttachmentHandler.create("live_group_profile", sysID);
    return attachmentHandler;
  }

  function attachFile(conversation, file, fileFns) {
    if (file.size > MAX_SIZE) {
      file.error = file.name + ' size exceeds the limit of ' + maxAttachmentSize + ' MB';
      apply(fileFns, "error", file);
      return $q.when(file);
    }
    filesInProgress.push(file);
    apply(fileFns, "start", file);
    progress(fileFns, file, 0);
    return getAttachmentHandler(conversation).uploadAttachment(file, null, {
      progress: function(event) {
        progress(fileFns, event.config.file, event.loaded, event.total);
      }
    }).then(function(response) {
      remove(file);
      file.sysID = response.sys_id;
      progress(fileFns, file);
      apply(fileFns, "success", file);
      screenReaderStatus.announce(i18n.format(uploadSuccess, file.name));
      return file;
    }, function(errorMessage) {
      remove(file);
      file.error = errorMessage;
      apply(fileFns, "error", file);
      screenReaderStatus.announce(i18n.format(uploadFailure, file.name, errorMessage));
      return file;
    });
  }

  function openFileSelector($event) {
    $event.stopPropagation();
    var target = angular.element($event.currentTarget);
    $timeout(function() {
      target.parent().find('input').click();
    });
  }
  return {
    get filesInProgress() {
      return Object.keys(filesInProgress).map(function(key) {
        return filesInProgress[key];
      });
    },
    attachFiles: function(conversation, files, fileFns) {
      fileFns = fileFns || {};
      var promises = [];
      angular.forEach(files, function(file) {
        promises.push(attachFile(conversation, file, fileFns));
      });
      return $q.all(promises);
    },
    openFileSelector: openFileSelector
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.fileSizeConverter.js */
angular.module("sn.connect.util").service("fileSizeConverter", function() {
  "use strict";
  return {
    getByteCount: function(bytes, precision) {
      if (bytes.slice(-1) === 'B')
        return bytes;
      var kb = 1024;
      var mb = kb * 1024;
      var gb = mb * 1024;
      if ((bytes >= 0) && (bytes < kb))
        return bytes + ' B';
      else if ((bytes >= kb) && (bytes < mb))
        return (bytes / kb).toFixed(precision) + ' KB';
      else if ((bytes >= mb) && (bytes < gb))
        return (bytes / mb).toFixed(precision) + ' MB';
      else if (bytes >= gb)
        return (bytes / gb).toFixed(precision) + ' GB';
      else
        return bytes + ' B';
    }
  };
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.notificationPreferences.js */
angular.module('sn.common.glide').factory("notificationPreferences", function(
  snHttp, $q, amb, unwrappedHTTPPromise, snNotifier, initGlobalNotificationPreferences, urlTools, snCustomEvent, isLoggedIn) {
  "use strict";
  var BASE_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var preferencesCache = {};

  function fromGlobalObject(rawGlobalPreference) {
    function update(field, preferenceValue) {
      rawGlobalPreference[field] = preferenceValue;
      var eventName = 'connect.notifications.' + field;
      var targetURL = urlTools.getURL('user_preference', {
        "sysparm_pref_name": eventName,
        "sysparm_action": "set",
        "sysparm_pref_value": "" + !!preferenceValue
      });
      snHttp.get(targetURL).then(function() {
        snCustomEvent.fireAll(eventName + '.update', preferenceValue);
      });
    }
    snCustomEvent.on('connect.notifications.mobile.update', function(newVal) {
      rawGlobalPreference.mobile = newVal;
    });
    snCustomEvent.on('connect.notifications.desktop.update', function(newVal) {
      rawGlobalPreference.desktop = newVal;
      updateDesktopNotificationPermission();
    });
    snCustomEvent.on('connect.notifications.email.update', function(newVal) {
      rawGlobalPreference.email = newVal;
    });
    snCustomEvent.on('connect.notifications.audio.update', function(newVal) {
      rawGlobalPreference.audio = newVal;
    });

    function updateDesktopNotificationPermission() {
      if (!rawGlobalPreference.desktop)
        return;
      if (snNotifier().canUseNativeNotifications())
        return;
      snNotifier().requestNotificationPermission();
    }
    updateDesktopNotificationPermission();
    return {
      get mobile() {
        return rawGlobalPreference.mobile
      },
      get desktop() {
        return rawGlobalPreference.desktop;
      },
      get email() {
        return rawGlobalPreference.email;
      },
      get audio() {
        return rawGlobalPreference.audio;
      },
      set mobile(value) {
        return update('mobile', value);
      },
      set desktop(value) {
        return update('desktop', value);
      },
      set email(value) {
        return update('email', value);
      },
      set audio(value) {
        return update('audio', value);
      }
    }
  }
  var globalPreferences = fromGlobalObject(initGlobalNotificationPreferences);

  function fromObject(rawPreferences) {
    function update(field, value) {
      rawPreferences[field] = value;
      if (rawPreferences.loading)
        return;
      snHttp.post(BASE_URL + rawPreferences.sys_id + "/notifications", rawPreferences).then(function(response) {
        addRaw(response.data.result);
      });
    }
    return {
      get loading() {
        return rawPreferences.loading;
      },
      get mobile() {
        return rawPreferences.push_notification_preference;
      },
      get desktop() {
        return rawPreferences.browser_notification_preference;
      },
      get email() {
        return rawPreferences.email_notification_preference;
      },
      get audio() {
        return rawPreferences.audio_notification_preference;
      },
      get canEmail() {
        return rawPreferences.can_email;
      },
      get systemMessage() {
        return rawPreferences.system_message_notification_preference;
      },
      set mobile(value) {
        update('push_notification_preference', value);
      },
      set desktop(value) {
        update('browser_notification_preference', value);
      },
      set email(value) {
        update('email_notification_preference', value);
      },
      set audio(value) {
        update('audio_notification_preference', value);
      },
      set canEmail(value) {
        update('can_email', value);
      },
      set systemMessage(value) {
        update('system_message_notification_preference', value);
      }
    }
  }

  function getPreferences(conversationID) {
    if (!preferencesCache[conversationID]) {
      addRaw({
        sys_id: conversationID,
        push_notification_preference: 'all',
        browser_notification_preference: 'all',
        email_notification_preference: 'all',
        audio_notification_preference: 'all',
        can_email: true,
        system_message_notification_preference: true,
        loading: true
      });
      snHttp.get(BASE_URL + conversationID + "/notifications").then(function(response) {
        addRaw(response.data.result);
      });
    }
    return preferencesCache[conversationID];
  }

  function addRaw(preference) {
    preferencesCache[preference.sys_id] = fromObject(preference);
  }
  return {
    get: getPreferences,
    addRaw: addRaw,
    globalPreferences: globalPreferences
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAutoScroll.js */
angular.module("sn.connect.util").directive('snAutoScroll', function($timeout, $window, $q, inFrameSet, activeConversation) {
  "use strict";

  function throttle(func, wait) {
    var initialCall = true,
      deferred = $q.defer(),
      timerId;
    if (typeof func != 'function') {
      return;
    }

    function throttled() {
      if (timerId) {
        return;
      }
      if (initialCall) {
        initialCall = false;
        deferred.resolve(func());
        return deferred.promise;
      }
      timerId = $timeout(function() {
        timerId = undefined;
        deferred.resolve(func());
      }, wait, false);
      return deferred.promise;
    }
    return throttled;
  }
  return {
    restrict: 'A',
    scope: {
      onScrollToTop: "&"
    },
    link: function(scope, element) {
      var HISTORY_THROTTLE_MS = 100;
      var SCROLL_THROTTLE_MS = 500;
      var RESIZE_THROTTLE_MS = 500;
      var STICKY_ZONE_HEIGHT = 32;
      var shouldStick = true;
      var activeTopRequest = false;
      var resizeTrigger = false;
      var el = element[0];
      var prevScrollPos = el.scrollTop;
      var lastScrollHeight = el.scrollHeight;
      var onScrollTop, heightAdjustUnwatch;

      function enforceSticky() {
        if (shouldStick) {
          el.scrollTop = el.scrollHeight;
        }
      }

      function forceScroll() {
        shouldStick = true;
        enforceSticky();
      }
      var scrollHandler = throttle(function() {
        if (resizeTrigger) {
          resizeTrigger = false;
          return;
        }
        var scrollPos = el.scrollTop;
        var scrollHeight = el.scrollHeight;
        var scrollUp = prevScrollPos > scrollPos;
        prevScrollPos = scrollPos;
        if (scrollUp) {
          shouldStick = false;
          if (angular.isFunction(scope.onScrollToTop) && !onScrollTop) {
            onScrollTop = throttle(scope.onScrollToTop, HISTORY_THROTTLE_MS);
          }
          if (scrollPos === 0) {
            var oldScrollHeight = scrollHeight;
            if (!activeTopRequest) {
              activeTopRequest = true;
              var topBatch = element.find(".sn-feed-message-holder:first-child");
              var topBatchLastMessage = topBatch.scope().batch.lastMessage;
              onScrollTop().finally(function(result) {
                activeTopRequest = false;
                if (!heightAdjustUnwatch) {
                  heightAdjustUnwatch = scope.$on("ngRepeat.complete", function() {
                    var heightAdjust = 0;
                    var potentialConflict = topBatch.prev();
                    var newTopBatch = element.find(".sn-feed-message-holder:first-child");
                    if (potentialConflict.length && potentialConflict.scope().batch.lastMessage.sysID === topBatchLastMessage.sysID) {
                      heightAdjust = topBatch[0].clientHeight;
                    } else if (topBatch[0] !== newTopBatch[0]) {
                      heightAdjust = topBatch.find('.sn-feed-message_date').outerHeight(true);
                    }
                    el.scrollTop = el.scrollHeight - oldScrollHeight - heightAdjust;
                    heightAdjustUnwatch();
                    heightAdjustUnwatch = void(0);
                  });
                }
                return result;
              });
            }
          }
          return;
        }
        if (scrollPos + el.clientHeight + STICKY_ZONE_HEIGHT >= scrollHeight) {
          shouldStick = true;
          enforceSticky();
        }
        lastScrollHeight = scrollHeight;
      }, SCROLL_THROTTLE_MS);
      var resizeHandler = throttle(function() {
        resizeTrigger = true;
        if (el.scrollTop <= STICKY_ZONE_HEIGHT) {
          shouldStick = true;
        }
        enforceSticky();
      }, RESIZE_THROTTLE_MS);
      el.scrollTop = el.scrollHeight;
      $timeout(function() {
        el.scrollTop = el.scrollHeight;
        prevScrollPos = el.scrollTop;
      }, 0, false);
      angular.element(el).on('scroll', scrollHandler);
      angular.element($window).on('resize', resizeHandler);
      scope.$on('connect.auto_scroll.scroll_to_bottom', forceScroll);
      scope.$on('connect.auto_scroll.jump_to_bottom', forceScroll);
      scope.$watch(enforceSticky);
      if (!inFrameSet)
        scope.$watch(function() {
          return activeConversation.sysID;
        }, function(newVal, oldVal) {
          if (newVal === oldVal)
            return;
          forceScroll();
        });
      scope.$on("$destroy", function() {
        angular.element(el).off('scroll', scrollHandler);
        angular.element($window).off('resize', resizeHandler);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snClickToEdit.js */
angular.module('sn.connect.util').directive('snClickToEdit', function($timeout, getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      currText: "=text",
      onSaveText: "&onsavetext",
      canEdit: "=condition"
    },
    transclude: true,
    templateUrl: getTemplateUrl("snClickToEdit.xml"),
    replace: true,
    controller: function($scope) {
      $scope.editingText = false;
      $scope.inputClick = function($event) {
        $event.stopPropagation();
        if (!$scope.canEdit) return;
        $scope.editingText = true;
        $scope.prevText = $scope.currText;
      }
      $scope.saveText = function() {
        if (!$scope.editingText || ($scope.prevText === $scope.currText) || !$scope.canEdit) {
          $scope.editingText = false
          return;
        }
        $scope.editingText = false;
        if ($scope.onSaveText) $scope.onSaveText({
          text: $scope.currText
        });
      }
      $scope.cancelEdit = function() {
        $scope.editingText = false;
        $scope.currText = $scope.prevText;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snEscape.js */
angular.module('sn.connect.util').directive('snEscape', function() {
  'use strict';
  return function(scope, element, attrs) {
    element.bind("keyup", function(event) {
      if (event.which !== 27)
        return;
      scope.$apply(function() {
        scope.$eval(attrs.snEscape);
      });
      event.preventDefault();
    });
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snFocusOnConversation.js */
angular.module('sn.connect.util').directive('snFocusOnConversation', function($timeout, $parse, $window, activeConversation) {
  'use strict';
  return {
    restrict: "A",
    link: function(scope, element, attr) {
      if (attr.disableAutofocus)
        return;
      scope.snFocusOnConversation = $parse(attr.snFocusOnConversation)(scope);
      scope.$watch(function() {
        return activeConversation.conversation;
      }, function(conversation) {
        if (window.getSelection().toString() !== "")
          return;
        if (!scope.snFocusOnConversation)
          return;
        if (!conversation)
          return;
        if (conversation.sysID !== scope.snFocusOnConversation.sysID)
          return;
        $timeout(function() {
          focusOnMessageInput();
        });
      });

      function focusOnMessageInput() {
        if ($window.ontouchstart)
          return;
        $timeout(function() {
          element.focus();
        });
      }
      focusOnMessageInput();
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingIndicator.js */
angular.module('sn.connect.util').directive('snLoadingIndicator', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      active: "="
    },
    transclude: true,
    templateUrl: getTemplateUrl("snLoadingIndicator.xml"),
    replace: true
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOnload.js */
angular.module('sn.connect.util').directive('snOnload', function() {
  return {
    scope: {
      callBack: '&snOnload'
    },
    link: function(scope, element) {
      element.on('load', function() {
        scope.callBack();
        scope.$apply();
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOptions.js */
angular.module('sn.connect.util').directive('snOptions', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snOptions.xml"),
    replace: true
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPane.js */
angular.module('sn.connect.util').directive('snPane', function($timeout, getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: getTemplateUrl('snPane.xml'),
    scope: {
      paneCollapsed: '=',
      panePosition: '@',
      paneResizeable: '@',
      paneWidth: '=',
      paneToggle: '@'
    },
    link: function(scope, element) {
      var scrollPromise;
      var mouseHeldDown = false;
      var mouseClicked = true;
      scope.toggleConversationList = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        paneManager.togglePane('connect:conversation_list', true);
      };
      scope.$watch('paneWidth', function() {
        if (scope.paneWidth) {
          element.width(scope.paneWidth);
        }
      });
      scope.isMobile = function() {
        return angular.element('html').width() <= 800;
      };
      scope.scrollMousedown = function(moveBy) {
        scrollPromise = $timeout(function() {
          mouseHeldDown = true;
          mouseClicked = false;
          updateScrollPosition(moveBy);
        }, 300);
      };
      scope.scrollMouseup = function() {
        $timeout.cancel(scrollPromise);
        scrollPromise = void(0);
        if (!mouseClicked) {
          mouseHeldDown = false;
        }
      };
      scope.scrollUpCick = function() {
        if (mouseClicked) {
          var scrollContainer = element.find('.pane-scroll-container');
          updateScrollPosition(-scrollContainer.height());
        }
        mouseClicked = true;
        mouseHeldDown = false;
      };
      scope.scrollDownCick = function() {
        if (mouseClicked) {
          var scrollContainer = element.find('.pane-scroll-container');
          updateScrollPosition(scrollContainer.height());
        }
        mouseClicked = true;
        mouseHeldDown = false;
      };
      scope.openConnect = function($event) {
        $event.stopPropagation();
        if ($event && $event.keyCode === 9)
          return;
        window.open("$c.do", "_blank");
      };

      function updateScrollPosition(moveBy) {
        var scrollContainer = element.find('.pane-scroll-container');
        scrollContainer.animate({
          scrollTop: scrollContainer[0].scrollTop + moveBy
        }, 300, 'linear', function() {
          if (mouseHeldDown) {
            updateScrollPosition(moveBy);
          }
        });
      }

      function updateScrollButtons() {
        var scrollContainer = element.find('.pane-scroll-container');
        if (scope.paneCollapsed && !scope.isMobile() && scrollContainer.get(0)) {
          if (scrollContainer.outerHeight() < scrollContainer.get(0).scrollHeight) {} else {}
        } else {}
      }
      scope.togglePane = function() {
        scope.paneCollapsed = !scope.paneCollapsed;
        scope.$root.$broadcast('pane.collapsed', scope.panePosition, scope.paneCollapsed);
        updateScrollButtons();
      }
      angular.element(window).on('resize', function() {
        updateScrollButtons();
      });
      $timeout(updateScrollButtons);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPaneManager.js */
angular.module('sn.connect.util').directive('snPaneManager', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.resourcePaneClass = attrs.snPaneManager;
      scope.resourcePaneClasses = {
        'closed': 'pane-closed',
        'large': 'pane-large large-resource-pane',
        'compact': 'pane-compact compact-resource-pane'
      };
      scope.$on('conversation.resource.open', function($evt, data) {
        scope.$broadcast('conversation.resource.show', data);
        scope.resizePane(data.type);
      });
      scope.$on('conversation.resource.close', function() {
        scope.resizePane('closed');
      });
      scope.resizePane = function(type) {
        angular.forEach(scope.resourcePaneClasses, function(resourcePaneClass) {
          element.removeClass(resourcePaneClass);
        });
        scope.resourcePaneClass = scope.resourcePaneClasses[type || 'closed'];
        element.addClass(scope.resourcePaneClass);
      };
      scope.resizePane(attrs.snPaneManager);
    }
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPod.js */
angular.module('sn.connect.util').directive('snPod', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snPod.xml"),
    replace: true,
    scope: {
      user: '=',
      label: '=label',
      showLabel: '=showLabel',
      removeTitle: '@removeTitle',
      removeClick: '&removeClick'
    },
    controller: function($scope) {
      $scope.onRemove = function($event) {
        if ($scope.removeClick) {
          $event.stopPropagation();
          $scope.removeClick({
            $event: $event
          });
        }
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPopOver.js */
angular.module('sn.connect.util').directive('snPopover', function($window, $rootScope) {
  'use strict';
  if ($window.jQuery)
    $window.jQuery('html').on('click', function(e) {
      $rootScope.$broadcast("popover-html-click", e);
    });
  return {
    restrict: 'A',
    scope: {
      options: '=snPopover',
      enabled: '=snPopoverEnabled'
    },
    link: function(scope, element) {
      scope.popoverID = scope.$id;

      function getContent() {
        if (!$content) {
          if (angular.isObject(scope.options) && scope.options.target) {
            $content = angular.element(scope.options.target).detach().show();
          } else if (typeof scope.options == "string") {
            $content = angular.element(scope.options).detach().show();
          } else {
            $content = element.siblings('.popover-body').eq(0).detach().show();
          }
        }
        return $content;
      }
      var $content = getContent();
      if (!angular.element('html').hasClass('touch')) {
        if (scope.options && scope.options.popoverID)
          scope.popoverID = scope.options.popoverID;
        var options = {
          placement: 'left',
          html: true,
          content: getContent,
          container: 'body',
          template: '<div scope-id="' + scope.popoverID + '" class="popover" role="tooltip" onClick="event.stopPropagation();"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
          trigger: 'hover',
          hideOnBlur: true,
          onShow: function() {},
          onHide: function() {}
        };
        angular.extend(options, scope.options);
        var oldHide = element[0].hide;
        if (oldHide) {
          element[0].prototypeHide = oldHide;
          element[0].hide = function() {
            if (!jQuery.event.triggered && this.prototypeHide) {
              this.prototypeHide();
            }
          }
        }
        if (!element.popover)
          return;
        scope.$popover = element.popover(options);
        scope.$popover.on("hidden.bs.popover", function(e) {
          options.onHide(e);
        });
        scope.$popover.on("shown.bs.popover", function(e) {
          options.onShow(e);
        });
        scope.$watch('enabled', function() {
          element.popover(scope.enabled || scope.enabled == undefined ? 'enable' : 'disable');
        });
        scope.$on('$destroy', function() {
          angular.element('[scope-id=' + scope.popoverID + ']').remove();
        });
        scope.$on('popover-html-click', function($evt, e) {
          if (element.find(e.target).length > 0 || options.hideOnBlur === false)
            return;
          element.popover('hide');
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAriaUnreadNotifications.js */
angular.module('sn.connect.util').directive('snAriaUnreadNotifications', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snAriaUnreadNotifications.xml'),
    controller: function($scope, $timeout) {
      $scope.messages = [];
      $scope.$on("connect.aria.new_unread_message", function(evt, message) {
        $scope.messages.push(message);
        $timeout(function() {
          $scope.messages.shift();
        }, 5000, false);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snRepeatEventEmitter.js */
angular.module('sn.connect.util').directive('snRepeatEventEmitter', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope) {
      if (scope.$first === true) {
        scope.$evalAsync(function() {
          scope.$emit("ngRepeat.complete");
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/filter.truncate.js */
angular.module('sn.connect.util').filter('truncate', function() {
  "use strict";
  var MAX_LENGTH = 75;
  return function(text) {
    if (text) {
      if (text.length <= MAX_LENGTH) {
        return text;
      }
      return text.substring(0, MAX_LENGTH).trim() + "...";
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snHttp.js */
angular.module('sn.connect.util').factory('snHttp', function($http, $q, $rootScope, $timeout) {
  $http.defaults.headers.common["Cache-Control"] = "no-cache";
  $http.defaults.headers.common["Pragma"] = "no-cache";
  var http = function() {
    if (arguments.length) {
      var deferred = $q.defer();
      $http.apply($http, arguments).then(success(deferred), error(deferred));
      return deferred.promise;
    }
  };
  var retryCodes = [0];
  var errorCount = 0;
  var responseWithError;
  var retryPromise;
  var pollPeriods = [10, 20, 30, 60, 90, 120];
  var retryListener;

  function success(deferred) {
    return function(response) {
      if (errorCount > 0) {
        errorCount = 0;
        responseWithError = void(0);
        $rootScope.$broadcast('http-error.hide');
        pollPeriods = [10, 20, 30, 60, 90, 120];
        if (retryListener)
          retryListener();
      }
      deferred.resolve(response);
    };
  }

  function error(deferred) {
    return function(response) {
      if (retryCodes.indexOf(response.status) < 0) {
        deferred.reject(response);
        return;
      }
      errorCount++;
      if (errorCount === 2 || (response.config && response.config.retry)) {
        responseWithError = response;
        var pollTime = pollPeriods.shift() || 120;
        $rootScope.$broadcast('http-error.show', pollTime);
        retryPromise = $timeout(function() {
          response.config.retry = true;
          http(response.config);
        }, pollTime * 1000);
        retryListener = $rootScope.$on('http-error.retry', function() {
          $timeout.cancel(retryPromise);
          retryPromise = void(0);
          responseWithError.config.retry = true;
          http(responseWithError.config);
          retryListener();
        });
      }
      deferred.reject(response);
    };
  }
  var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'];
  angular.forEach(methods, function(method) {
    http[method] = function() {
      var deferred = $q.defer();
      $http[method].apply($http, arguments).then(success(deferred), error(deferred));
      return deferred.promise;
    };
  });
  return http;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.sysNumberData.js */
angular.module("sn.connect.util").factory("sysNumberData", function(snHttp, nowServer) {
  "use strict";
  return {
    getListPrefixes: function() {
      var url = nowServer.getURL("number_data");
      return snHttp.get(url).then(function(result) {
        return result.data
      });
    }
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/factory.commandFactory.js */
angular.module('sn.connect.util').factory('commandFactory', function($http, $rootScope) {
  var service = {};
  var SN_Commands = {
    "commands": {
      'key': 'commands',
      'args': 0,
      'value': function() {
        angular.element("#commandPopupModal").detach().appendTo("body").modal()
      },
      'description': "Displays a list of all available commands. If unknown command is entered, defaults to this."
    },
    "snip": {
      'key': 'snip',
      'args': 0,
      'value': function() {
        $rootScope.$broadcast("conversation.enable_snippet_search", true);
      },
      'description': "Opens snippet search window"
    }
  };
  var Customer_Commands = {};
  var commands = angular.extend(SN_Commands, Customer_Commands);
  service.commands = commands;
  service.commandNames = [];
  service.arr = Object.keys(commands);
  for (var i = 0; i < service.arr.length; i++)
    service.arr[i] = "/" + service.arr[i];
  service.commandNames = Object.keys(commands);
  service.setMessageFilter = function(m) {
    service.messageFilter = m;
  };
  service.getMessageFilter = function() {
    return service.messageFilter;
  }
  service.addSNCommand = function(key, args, value, description) {
    if (commands[key])
      return false;
    commands[key] = {
      'key': key,
      'args': args,
      'value': value,
      'official': true,
      'description': description
    };
    return true;
  };
  service.getCommand = function(entry) {
    var tokens = entry.split(" ");
    tokens[0] = tokens[0].slice(1);
    var key = tokens[0] || "commands";
    var comm = commands[key] || commands["commands"];
    var f = comm['value'];
    return f(entry);
  };
  return service;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/factory.snHotKey.js */
angular.module("sn.connect.util").factory("snHotKey", function() {
  "use strict";
  var commonKeys = {
    "ENTER": 13,
    "TAB": 9,
    "ESC": 27,
    "ESCAPE": 27,
    "SPACE": 32,
    "LEFT": 37,
    "UP": 38,
    "RIGHT": 39,
    "DOWN": 40
  };
  var modKeys = {
    "SHIFT": "shiftKey",
    "CTRL": "ctrlKey",
    "CONTROL": "ctrlKey",
    "ALT": "altKey",
    "OPT": "altKey",
    "OPTION": "altKey",
    "CMD": "metaKey",
    "COMMAND": "metaKey",
    "APPLE": "metaKey",
    "META": "metaKey"
  };

  function HotKey(options) {
    options = options || {};
    this.callback = angular.isFunction(options.callback) ? options.callback : void(0);
    this.modifiers = {
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false
    };
    if (typeof options.key === "number")
      this.key = options.key;
    else if (typeof options.key === "string") {
      if (options.key.length === 1)
        this.key = options.key.toUpperCase().charCodeAt(0);
      else
        this.key = commonKeys[options.key.toUpperCase()];
    }
    if (options.modifiers) {
      var modifier;
      if (typeof options.modifiers === "string") {
        modifier = modKeys[options.modifiers.toUpperCase()];
        this.modifiers[modifier] = true;
      } else if (angular.isArray(options.modifiers)) {
        for (var i = 0, len = options.modifiers.length; i < len; i++) {
          modifier = modKeys[options.modifiers[i].toUpperCase()];
          this.modifiers[modifier] = true;
        }
      }
    }
  }
  HotKey.prototype.trigger = function(e) {
    for (var key in this.modifiers)
      if (this.modifiers.hasOwnProperty(key))
        if (this.modifiers[key] !== e[key])
          return;
    this.callback(e);
  };
  return HotKey;
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.hotKeyHandler.js */
angular.module("sn.connect.util").factory("hotKeyHandler", function(snHotKey) {
  "use strict";
  var activeHotKeys = {};
  var html = angular.element('html')[0];
  var oldKeyDown = html.onkeydown;

  function addHotKey(hotKey) {
    if (!arguments.length)
      return false;
    if (!hotKey instanceof snHotKey)
      hotKey = new snHotKey(hotKey);
    activeHotKeys[hotKey.key] = activeHotKeys[hotKey.key] || [];
    activeHotKeys[hotKey.key].push(hotKey);
    return hotKey;
  }

  function removeHotKey(hotKey) {
    if (!hotKey instanceof snHotKey || !activeHotKeys[hotKey.key].length)
      return false;
    var loc = activeHotKeys[hotKey.key].indexOf(hotKey);
    if (loc !== -1)
      return activeHotKeys[hotKey.key].splice(loc, 1);
    return false;
  }
  html.onkeydown = function(e) {
    if (typeof oldKeyDown === "function")
      oldKeyDown();
    angular.forEach(activeHotKeys[e.keyCode], function(handler) {
      handler.trigger(e)
    })
  };
  return {
    add: addHotKey,
    remove: removeHotKey
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/factory.snChatAction.js */
angular.module("sn.connect.util").factory("snChatAction", function(snHotKey) {
  "use strict";
  var order = 100;

  function defaultOrder() {
    return order += 10;
  }

  function ChatAction(config) {
    this.name = config.name || "";
    this.id = config.id || this.name;
    this.icon = config.icon || "";
    if (config.order && typeof config.order === "string")
      config.order = parseInt(config.order);
    this.$order = typeof config.order === "number" ? config.order : defaultOrder();
    this.numArgs = config.numArgs || 0;
    this.requiresArgs = !!config.requiresArgs;
    this.description = config.description || "";
    this.isActive = config.isActive || false;
    this.showInMenu = angular.isUndefined(config.showInMenu) ? true : !!config.showInMenu;
    if (angular.isFunction(config.isVisible))
      this.isVisible = config.isVisible;
    else {
      var isVisibleValue = angular.isUndefined(config.isVisible) ? true : config.isVisible;
      this.isVisible = function() {
        return isVisibleValue;
      };
    }
    this.shortcut = "/" + config.shortcut;
    this.hint = this.shortcut;
    this.argumentHint = config.argumentHint || '';
    if (this.requiresArgs)
      this.hint += "     " + this.argumentHint;
    this.action = angular.isFunction(config.action) ? config.action : void(0);
    if (config.hotKey) {
      if (config.hotKey instanceof snHotKey)
        this.hotKey = config.hotKey;
      else
        this.hotKey = new snHotKey(config.hotKey);
      this.hotKey.callback = this.trigger;
    }
  }
  ChatAction.prototype.trigger = function() {
    if (this.isValid() && this.isVisible(arguments[0]))
      this.action.apply(this, arguments);
  };
  ChatAction.prototype.isValid = function() {
    return this.action && this.id;
  };
  ChatAction.prototype.canRun = function(commandText) {
    return this.shortcut.toLowerCase().indexOf(commandText.trim().toLowerCase()) === 0;
  };
  return ChatAction;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.ChatActionHandler.js */
angular.module("sn.connect.util").factory("ChatActionHandler", function(
  $http, $q, $rootScope, i18n, snChatAction, hotKeyHandler, isLoggedIn) {
  "use strict";
  var i18nDeferred = $q.defer();
  i18n.getMessages([
    'Transfer', 'Transfer the support conversation to another agent or queue',
    'Escalate', 'Escalate the support conversation to another queue',
    'End Session', 'End the support conversation session',
    'Create VTB Task', 'Creates a VTB Task on the conversations VTB'
  ], function(i18nNames) {
    var actions = [
      new snChatAction({
        id: 'transfer',
        name: i18nNames['Transfer'],
        shortcut: "transfer",
        description: i18nNames['Transfer the support conversation to another agent or queue'],
        icon: 'icon-arrow-right',
        order: 70,
        isVisible: function(conversation) {
          return conversation.isHelpDesk &&
            conversation.queueEntry.isAssignedToMe &&
            !conversation.queueEntry.isTransferPending;
        },
        action: function(conversation) {
          $rootScope.$broadcast('connect.support.conversation.transfer', conversation);
        }
      }),
      new snChatAction({
        id: 'escalate',
        name: i18nNames['Escalate'],
        shortcut: "escalate",
        description: i18nNames['Escalate the support conversation to another queue'],
        icon: 'icon-my-feed',
        order: 60,
        isVisible: function(conversation) {
          if (!conversation.isHelpDesk)
            return false;
          var queueEntry = conversation.queueEntry;
          if (!queueEntry.isAssignedToMe)
            return false;
          if (queueEntry.isTransferPending)
            return false;
          var queue = queueEntry.queue;
          return queue && queue.escalateTo && queue.escalationQueue.available;
        },
        action: function() {
          $rootScope.$broadcast('dialog.escalation-confirm.show');
        }
      }),
      new snChatAction({
        id: 'End Session',
        name: i18nNames['End Session'],
        shortcut: "end",
        description: i18nNames['End the support conversation session'],
        icon: 'icon-cross',
        order: 9999,
        isVisible: function(conversation) {
          return conversation.isHelpDesk &&
            conversation.queueEntry.isAssignedToMe;
        },
        action: function(conversation) {
          $rootScope.$broadcast('connect.support_conversation.close_prompt', conversation, false);
        }
      })
    ];
    i18nDeferred.resolve(actions);
  });
  var actionHandlers = {};

  function createHandler(conversation) {
    var actionHandler = actionHandlers[conversation.sysID];
    if (!actionHandler)
      actionHandler = actionHandlers[conversation.sysID] = new Handler(conversation);
    actionHandler.reload();
    return actionHandler;
  }

  function Handler(conversation) {
    if (!conversation)
      throw "conversation object must be set";
    var shortcutMap = {};
    var idMap = {};
    var actions = [];
    var currentAction;
    var loading;
    i18nDeferred.promise.then(function(actions) {
      angular.forEach(actions, function(action) {
        add(action);
      });
    });

    function reload() {
      if (!conversation.sysID)
        return;
      if (loading)
        return;
      loading = true;
      var url = isLoggedIn ? 'api/now/connect/conversations/' + conversation.sysID + '/actions' :
        'api/now/connect/support/anonymous/conversations/' + conversation.sysID + '/actions';
      $http.get(url).then(function(response) {
        loading = false;
        shortcutMap = {};
        idMap = {};
        actions = [];
        currentAction = undefined;
        i18nDeferred.promise.then(function(actions) {
          angular.forEach(actions, function(action) {
            add(action);
          });
        });
        angular.forEach(response.data.result, function(actionData) {
          actionData.action = function(conversation, argString) {
            $http.post(url, {
              action: actionData.sys_id,
              text: argString
            }).then(function(resp) {
              if (!resp.data)
                return;
              if (!resp.data.result)
                return;
              var result = resp.data.result;
              $rootScope.$emit(result.event, result.data, conversation);
            });
          };
          actionData.name = actionData.name || actionData.title;
          add(new snChatAction(actionData));
        });
      });
    }

    function add(action) {
      if (!arguments.length)
        return false;
      if (!action instanceof snChatAction)
        action = new snChatAction(action);
      actions.push(action);
      idMap[action.id] = action;
      if (action.shortcut) {
        shortcutMap[action.shortcut] = shortcutMap[action.shortcut] || [];
        shortcutMap[action.shortcut].push(action);
      }
      if (action.hotKey)
        hotKeyHandler.add(action.hotKey);
      return action;
    }

    function clearAction() {
      currentAction = undefined;
    }

    function getVisible() {
      return actions
        .filter(function(chatAction) {
          return chatAction.isVisible(conversation);
        });
    }
    return {
      reload: reload,
      get: function(id) {
        return idMap[id];
      },
      run: function(cmdString) {
        cmdString = cmdString.toLowerCase();
        var cmdArray = cmdString.split(" ");
        var possibleActions = shortcutMap[cmdArray[0]];
        var args = cmdArray.slice(1);
        var argString = args.join(" ");
        if (currentAction) {
          currentAction.trigger.call(currentAction, conversation, argString);
          currentAction = void(0);
          return true;
        }
        if (possibleActions && possibleActions.length) {
          var selectedAction = possibleActions[0];
          selectedAction.trigger.call(selectedAction, conversation, argString);
          clearAction();
          return true;
        }
        return false;
      },
      hasRequiredArguments: function(cmdString) {
        cmdString = cmdString.toLowerCase();
        var cmdArray = cmdString.split(" ");
        var possibleActions = shortcutMap[cmdArray[0]];
        var args = cmdArray.slice(1);
        if (!possibleActions || !possibleActions.length)
          return false;
        currentAction = possibleActions[0];
        if (currentAction.requiresArgs)
          return args.length > 0;
        return true;
      },
      hasMatchingAction: function(text) {
        if (!text)
          return false;
        text = text.trim().toLowerCase();
        return getVisible().some(function(action) {
          var shortcut = action.shortcut.toLowerCase();
          return text === shortcut || text.indexOf(shortcut + " ") === 0;
        })
      },
      getCommands: function(filterText) {
        if (filterText)
          filterText = filterText.toLowerCase();
        return getVisible()
          .filter(function(command) {
            return filterText ? command.shortcut.toLowerCase().indexOf(filterText) === 0 : true;
          })
          .sort(function(a, b) {
            return a.shortcut > b.shortcut;
          });
      },
      getMenuActions: function() {
        return getVisible()
          .filter(function(chatAction) {
            return chatAction.showInMenu;
          })
          .sort(function(a, b) {
            return a.$order - b.$order;
          });
      }
    }
  }
  return {
    create: createHandler
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.connectDropTarget.js */
angular.module('sn.connect.util').service('connectDropTargetService', function($rootScope, activeConversation) {
  'use strict';

  function isIgnoreDrop(conversation) {
    if (!conversation.amMember)
      return false;
    if (conversation.isPending && !conversation.isPendingNoRecipients)
      return false;
    return (conversation.isHelpDesk && conversation.queueEntry.isPermanentlyClosed)
  }
  return {
    activateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.show", conversation.sysID);
    },
    deactivateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.hide", conversation.sysID);
    },
    onFileDrop: function(files, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop.files", files, conversation.sysID);
    },
    handleDropEvent: function(data, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop", data, conversation.sysID);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.durationFormatter.js */
angular.module('sn.connect.util').service('durationFormatter', function($filter, i18n) {
  'use strict';
  var units = {
    years: 365 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000
  };
  var names;
  i18n.getMessages([
      'month', 'months',
      'week', 'weeks',
      'day', 'days',
      'hour', 'hours'
    ],
    function(results) {
      names = results;
    });

  function durationYearFn(duration, startTimestamp, endTimestamp) {
    return function() {
      if (duration.years > 0) {
        var start = Math.abs(Date.now() - startTimestamp);
        var end = Math.abs(Date.now() - endTimestamp);
        var date = new Date((start > end) ? startTimestamp : endTimestamp);
        return $filter('date')(date, 'mediumDate');
      }
    };
  }

  function durationGeneralFn(duration, single, plural, format) {
    return function() {
      if (duration)
        return stringFormat(duration + ' ' + ((duration === 1) ? single : plural), format);
    }
  }

  function stringFormat(value, format) {
    return format.replace(/\{0}/, value);
  }
  return {
    format: function(timestamp, format) {
      return this.formatWithRange(Date.now(), timestamp, format);
    },
    formatWithRange: function(startTimestamp, endTimestamp, format) {
      format = format || "{0}";
      var duration = {};
      var remaining = Math.abs(startTimestamp - endTimestamp);
      angular.forEach(units, function(value, key) {
        duration[key] = Math.floor(remaining / value);
        remaining -= duration[key] * value;
      });
      var durationFunction = [
        durationYearFn(duration.years, startTimestamp, endTimestamp),
        durationGeneralFn(duration.months, names['month'], names['months'], format),
        durationGeneralFn(duration.weeks, names['week'], names['weeks'], format),
        durationGeneralFn(duration.days, names['day'], names['days'], format),
        durationGeneralFn(duration.hours, names['hour'], names['hours'], format)
      ];
      for (var i = 0; i < durationFunction.length; ++i) {
        var value = durationFunction[i]();
        if (value)
          return value;
      }
      return stringFormat(duration.minutes + ':' +
        (duration.seconds < 10 ? '0' + duration.seconds : duration.seconds), format);
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectDuration.js */
angular.module('sn.connect.util').directive('snConnectDuration', function($interval, $sanitize, durationFormatter) {
  'use strict';
  var listenerCount = 0;
  var listeners = {};
  $interval(tick, 1000, 0, false);

  function tick() {
    angular.forEach(listeners, function(listenerFn) {
      if (typeof listenerFn !== "function")
        return;
      listenerFn();
    })
  }

  function onTick(fn) {
    listenerCount++;
    listeners[listenerCount] = fn;
    return listenerCount;
  }

  function remove(listenerCount) {
    delete listeners[listenerCount];
  }
  return {
    template: '<span></span>',
    restrict: 'E',
    replace: true,
    scope: {
      startTimestamp: '=?',
      endTimestamp: '=?',
      placeholder: '@'
    },
    link: function(scope, element, attrs) {
      var listenerIndex;

      function calculate() {
        var duration = attrs.placeholder || '';
        if (scope.startTimestamp && scope.endTimestamp) {
          duration = durationFormatter.formatWithRange(scope.startTimestamp, scope.endTimestamp);
        } else if (scope.startTimestamp) {
          duration = durationFormatter.format(scope.startTimestamp);
        } else if (scope.endTimestamp) {
          duration = durationFormatter.format(scope.endTimestamp);
        }
        element.html($sanitize(duration));
      }
      listenerIndex = onTick(calculate);
      scope.$on('$destroy', function() {
        remove(listenerIndex);
      });
      calculate();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConversationAsideHistory.js */
angular.module("sn.connect.util").service("snConversationAsideHistory", function() {
  "use strict";
  var conversationAsides = {};

  function getHistory(conversation) {
    if (conversationAsides.hasOwnProperty(conversation))
      return conversationAsides[conversation];
    return false;
  }

  function saveAsideHistory(conversation, view) {
    conversationAsides[conversation] = view;
  }

  function clearAsideHistory(conversation) {
    delete conversationAsides[conversation];
  }
  return {
    getHistory: getHistory,
    saveHistory: saveAsideHistory,
    clearHistory: clearAsideHistory
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectAsideManager.js */
angular.module("sn.connect.util").service("snConnectAsideManager", function(paneManager) {
  "use strict";
  return {
    setup: function() {
      if (angular.element('body').data().layout)
        paneManager.registerPane('connect:conversation_list');
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snTypingTracker.js */
angular.module('sn.connect.util').service("snTypingTracker", function($rootScope, $timeout) {
  "use strict";
  var typingTimeout;
  var newKeystroke = false;

  function notifyTyping() {
    newKeystroke = true;
    if (!typingTimeout) {
      $rootScope.$broadcast("record.typing", {
        status: "typing"
      });
      waitForTypingToStop();
    }
  }

  function cancelTypingTimer() {
    $rootScope.$broadcast("record.typing", {
      status: "viewing"
    });
    newKeystroke = false;
    if (!typingTimeout)
      return;
    $timeout.cancel(typingTimeout);
    typingTimeout = void(0);
  }

  function waitForTypingToStop() {
    newKeystroke = false;
    typingTimeout = $timeout(function() {
      if (newKeystroke) {
        waitForTypingToStop()
      } else {
        cancelTypingTimer();
      }
    }, 3000)
  }
  return {
    typing: notifyTyping,
    cancelTyping: cancelTypingTimer
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.screenWidth.js */
angular.module("sn.connect.util").service("screenWidth", function($window, $timeout) {
  "use strict";
  var window = angular.element($window);
  var thresholdTimeout;
  return {
    get width() {
      return window.width();
    },
    onResize: function(fn) {
      var self = this;
      window.on('resize', function() {
        fn(self.width);
      });
    },
    isAbove: function(width) {
      return this.width > width;
    },
    threshold: function(threshold, fn, debounce) {
      var lastState;
      this.onResize(function(curr) {
        $timeout.cancel(thresholdTimeout);
        thresholdTimeout = $timeout(function() {
          var state = curr >= threshold;
          if (state === lastState)
            return;
          fn(state, curr);
          lastState = state;
        }, debounce);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.titleFlasher.js */
angular.module('sn.connect.util').service('titleFlasher', function($document, $window, i18n, snTabActivity) {
  "use strict";
  var singleMessage = "1 New Message",
    manyMessages = "{0} New Messages";
  i18n.getMessages(["1 New Message", "{0} New Messages"], function(results) {
    singleMessage = results[singleMessage];
    manyMessages = results[manyMessages];
  });
  var initialTitle,
    FLASH_DELAY = 500,
    numMessages = 0,
    changedTitle = false,
    flashTimer;

  function flash(doNotIncrement) {
    if (snTabActivity.isVisible || !snTabActivity.isPrimary)
      return reset();
    if (!doNotIncrement)
      numMessages++;
    if (doNotIncrement && changedTitle)
      setTitle(initialTitle);
    else if (numMessages - 1)
      setTitle(manyMessages);
    else
      setTitle(singleMessage);
    if (flashTimer)
      $window.clearTimeout(flashTimer);
    flashTimer = $window.setTimeout(function() {
      flash(true);
    }, FLASH_DELAY);
  }

  function reset() {
    if (!flashTimer) {
      return;
    }
    numMessages = 0;
    setTitle(initialTitle);
    $window.clearTimeout(flashTimer);
    flashTimer = void(0);
  }

  function setTitle(newTitle) {
    if (newTitle.indexOf("{0}") >= 0)
      newTitle = newTitle.replace("{0}", numMessages);
    changedTitle = newTitle !== initialTitle;
    $document[0].title = newTitle;
  }
  snTabActivity.on("tab.primary", reset);
  snTabActivity.on("tab.secondary", reset);
  return {
    flash: function() {
      if (!flashTimer) {
        initialTitle = $document[0].title;
      }
      flash(false);
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectMention.js */
angular.module("sn.connect.util").factory("snConnectMention", function(liveProfileID, $q, snMention) {
  "use strict";

  function retrieveMembers(conversation, term) {
    if (!conversation.table || !conversation.document) {
      var deferred = $q.defer();
      deferred.resolve(conversation.members.filter(function(mem) {
        return (mem.name.toUpperCase().indexOf(term.toUpperCase()) >= 0 && liveProfileID !== mem.sysID);
      }).slice(0, 5));
      return deferred.promise;
    }
    return snMention.retrieveMembers(conversation.table, conversation.document, term);
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snInfiniteScroll.js */
angular.module("sn.connect.util").directive('snInfiniteScroll', function($q, $interval, $window, $timeout, infiniteScrollFactory) {
  var SCROLL_THROTTLE_MS = 50;
  var LOOK_AHEAD = 0.15;
  var snInfiniteScrollService;

  function throttle(func, wait) {
    var initialCall = true,
      deferred = $q.defer(),
      timerId;
    if (typeof func != 'function') {
      return;
    }

    function throttled() {
      if (timerId) {
        return;
      }
      if (initialCall) {
        initialCall = false;
        deferred.resolve(func());
        return deferred.promise;
      }
      timerId = $timeout(function() {
        timerId = undefined;
        deferred.resolve(func());
      }, wait, false);
      return deferred.promise;
    }
    return throttled;
  }
  return {
    restrict: 'A',
    scope: {
      scrollConfig: '='
    },
    bindToController: true,
    controllerAs: '$ctrl',
    link: function(scope, element) {
      var el = element[0];
      var scrollHandler = function() {
        snInfiniteScrollService.onScroll(el.scrollTop, el.scrollHeight, el.clientHeight);
      };
      el.onscroll = scrollHandler;
      angular.element($window).on('resize', scrollHandler);
    },
    controller: function() {
      this.scrollConfig = this.scrollConfig || {};
      this.scrollConfig.lookAhead = LOOK_AHEAD;
      this.scrollConfig.throttleFunc = throttle;
      this.scrollConfig.scrollThrottleInMs = SCROLL_THROTTLE_MS;
      snInfiniteScrollService = infiniteScrollFactory.get(this.scrollConfig);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.infiniteScrollFactory.js */
"use strict";
var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var InfiniteScrollService = function() {
  function InfiniteScrollService(_ref) {
    var onScrollUp = _ref.onScrollUp,
      onScrollDown = _ref.onScrollDown,
      onScrollMissing = _ref.onScrollMissing,
      throttleFunc = _ref.throttleFunc,
      scrollThrottleInMs = _ref.scrollThrottleInMs,
      lookAhead = _ref.lookAhead;
    _classCallCheck(this, InfiniteScrollService);
    this.onScrollUp = onScrollUp;
    this.onScrollDown = onScrollDown;
    this.onScrollMissing = onScrollMissing;
    this.lookAhead = lookAhead;
    this.throttleFunc = throttleFunc;
    this.scrollThrottleInMs = scrollThrottleInMs;
    this.prevScrollPos = 0;
  }
  _createClass(InfiniteScrollService, [{
    key: "onScroll",
    value: function onScroll(scrollPos, scrollHeight, clientHeight) {
      var _this = this;
      this.throttleFunc(function() {
        if (_this.isScrollBarMissing(scrollHeight, clientHeight)) {
          _this.onScrollMissing();
          return;
        }
        var scrollUp = _this.prevScrollPos > scrollPos;
        var scrollDown = _this.prevScrollPos < scrollPos;
        _this.prevScrollPos = scrollPos;
        var upperBoundary = Math.ceil(scrollHeight * _this.lookAhead);
        var lowerBoundary = Math.ceil(scrollHeight * (1 - _this.lookAhead));
        if (scrollPos + clientHeight >= lowerBoundary && scrollDown) {
          _this.onScrollDown();
        } else if (scrollPos <= upperBoundary && scrollUp) {
          _this.onScrollUp();
        }
      }, this.scrollThrottleInMs)();
    }
  }, {
    key: "isScrollBarMissing",
    value: function isScrollBarMissing(scrollHeight, clientHeight) {
      if (scrollHeight > clientHeight) {
        return false;
      } else {
        return true;
      }
    }
  }]);
  return InfiniteScrollService;
}();
angular.module('sn.connect.util').factory('infiniteScrollFactory', function() {
  return {
    get: function(options) {
      return new InfiniteScrollService(options);
    }
  }
});;;