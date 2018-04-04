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
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snChatActionOptionsPopup.js */
angular.module('sn.connect.util').directive('snChatActionOptionsPopup', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snChatActionOptionsPopup.xml"),
    replace: true,
    controller: function($scope, $element, hotKeyHandler, snHotKey, $timeout) {
      $scope.currentAction = {};
      $scope.argString = '';
      $scope.visible = false;
      $scope.isShown = false;
      $scope.input = $element.find('input');
      var closeHotKey = new snHotKey({
        key: "ESC",
        callback: function() {
          if ($scope.isShown)
            $scope.close();
        }
      });
      hotKeyHandler.add(closeHotKey);
      $scope.$on("connect.chat_action.require_options", function(e, conversation) {
        if (conversation.sysID !== $scope.conversation.sysID)
          return;
        $scope.currentAction = conversation.chatActions.currentAction;
        $scope.isShown = true;
        $scope.error = false;
        $timeout(function() {
          $scope.input.focus();
        }, 0, false);
      });
      $scope.close = function() {
        if (!$scope.isShown)
          return;
        $scope.currentAction = {};
        $scope.isShown = false;
        $scope.argString = '';
        $scope.error = false;
        $scope.$evalAsync(function() {
          $scope.$root.$broadcast("connect.message.focus", $scope.conversation);
        });
      };
      $scope.runAction = function() {
        if (!$scope.argString.trim().length) {
          $timeout(function() {
            $scope.error = true;
          });
          return;
        }
        var queryString = $scope.currentAction.shortcut + " " + $scope.argString;
        $scope.conversation.chatActions.run(queryString);
        $scope.close();
      };
      $scope.input.on("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
          $scope.runAction();
        }
      });
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
angular.mod