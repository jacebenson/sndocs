/*! RESOURCE: /scripts/app.ng_chat/conversation/js_includes_connect_conversation.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
  "use strict";
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs, snCustomEvent) {
      snCustomEvent.observe('list.record_select', recordSelectDataHandler);

      function recordSelectDataHandler(data, event) {
        if (!data || !event)
          return;
        event.stopPropagation();
        var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
        if (data.ref === ref) {
          if (window.g_form) {
            if ($attrs.addOption) {
              addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
            } else {
              var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
              window.g_form._setValue(fieldValue, data.value, data.displayValue);
              clearDerivedFields(data.value);
            }
          }
          if ($scope.field) {
            $scope.field.value = data.value;
            $scope.field.displayValue = data.displayValue;
          }
        }
      }

      function clearDerivedFields(value) {
        if (window.DerivedFields) {
          var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
          df.clearRelated();
          df.updateRelated(value);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: function(elem, attrs) {
      return getTemplateUrl(attrs.buttonTemplate);
    },
    controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService) {
      $scope.type = $attrs.complexPopoverType || "complex_popover";
      if ($scope.closeEvent) {
        snCustomEvent.observe($scope.closeEvent, destroyPopover);
        $scope.$on($scope.closeEvent, destroyPopover);
      }
      $scope.$parent.$on('$destroy', destroyPopover);
      var newScope;
      var open;
      var popover;
      var content;
      var popoverDefaults = {
        container: 'body',
        html: true,
        placement: 'auto',
        trigger: 'manual',
        template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
      $scope.loading = false;
      $scope.initialized = false;
      $scope.togglePopover = function(event) {
        if (!open) {
          showPopover(event);
        } else {
          destroyPopover();
        }
      };

      function showPopover(e) {
        if ($scope.loading)
          return;
        $scope.$toggleButton = angular.element(e.target);
        $scope.loading = true;
        $scope.$emit('list.toggleLoadingState', true);
        _getTemplate()
          .then(_insertTemplate)
          .then(_createPopover)
          .then(_bindHtml)
          .then(function() {
            $scope.initialized = true;
            if (!$scope.loadEvent)
              _openPopover();
          });
      }

      function destroyPopover() {
        if (!newScope)
          return;
        $scope.$toggleButton.on('hidden.bs.popover', function() {
          open = false;
          $scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
          $scope.$toggleButton = null;
          snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
        });
        $scope.$toggleButton.popover('hide');
        snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
        newScope.$broadcast('$destroy');
        newScope.$destroy();
        newScope = null;
        $scope.initialized = false;
        angular.element(window).off({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
      }

      function _getTemplate() {
        return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
      }

      function _createPopover() {
        $scope.$toggleButton.popover(popoverConfig);
        return $q.when(true);
      }

      function _insertTemplate(response) {
        newScope = $scope.$new();
        if ($scope.loadEvent)
          newScope.$on($scope.loadEvent, _openPopover);
        content = $compile(response.data)(newScope);
        popoverConfig.content = content;
        newScope.open = true;
        snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
        return $q.when(true);
      }

      function _bindHtml() {
        angular.element(window).on({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
        return $q.when(true);
      }

      function complexHtmlHandler(e) {
        var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
        if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
          _eventClosePopover(e);
          destroyPopover(e);
        }
      }

      function keyDownHandler(e) {
        if (e.keyCode != 27)
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
          _eventClosePopover(e);
          destroyPopover();
        }
      }

      function _eventClosePopover(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      function createAndActivateFocusTrap(popover) {
        var deferred = $q.defer();
        if (!window.focusTrap) {
          deferred.reject('Focus trap not found');
        } else {
          if (!$scope.focusTrap) {
            $scope.focusTrap = window.focusTrap(popover, {
              clickOutsideDeactivates: true
            });
          }
          try {
            $scope.focusTrap.activate({
              onActivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to activate focus trap", e);
          }
        }
        return deferred.promise;
      }

      function deactivateAndDestroyFocusTrap() {
        var deferred = $q.defer();
        if (!$scope.focusTrap) {
          deferred.reject("Focus trap not found");
        } else {
          try {
            $scope.focusTrap.deactivate({
              returnFocus: false,
              onDeactivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to deactivate focus trap", e);
          }
          $scope.focusTrap = null;
        }
        return deferred.promise;
      }

      function _openPopover() {
        if (open) {
          return;
        }
        open = true;
        $timeout(function() {
          $scope.$toggleButton.popover('show');
          $scope.loading = false;
          snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
          $scope.$toggleButton.on('shown.bs.popover', function(evt) {
            var popoverObject = angular.element(evt.target).data('bs.popover'),
              $tooltip,
              popover;
            $tooltip = popoverObject && popoverObject.$tip;
            popover = $tooltip && $tooltip[0];
            if (popover) {
              createAndActivateFocusTrap(popover);
            }
            snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
          });
          $scope.$toggleButton.on('hide.bs.popover', function() {
            deactivateAndDestroyFocusTrap().finally(function() {
              $scope.$toggleButton.focus();
            });
          });
        }, 0);
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/conversation/_module.js */
angular.module("sn.connect.conversation", ["ng.common", "sn.connect.util", "sn.connect.profile", "sn.connect.message", "sn.connect.resource", 'sn.connect.presence', 'sn.common.ui.popover']);;
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
/*! RESOURCE: /scripts/app.ng_chat/conversation/service.activeConversation.js */
angular.module('sn.connect.conversation').service('activeConversation', function(
  $rootScope, $filter, $location, $q, i18n, userPreferences, conversations, documentsService, messageService,
  snTabActivity, startingTab, inFrameSet, inSupportClient, supportEnabled, chatEnabled, supportAddMembers, messageBatcherService,
  snNotification) {
  "use strict";
  var WINDOW_TYPE = inFrameSet ? 'frameSet' : 'standAlone';
  var PREFERENCE_ROOT = 'connect.conversation_list.active_list.' + WINDOW_TYPE;
  var restrictedConversationText = 'The conversation you requested could not be found';
  i18n.getMessages([restrictedConversationText], function(array) {
    restrictedConversationText = array[restrictedConversationText];
  });

  function ConversationHandler(preferenceName, isSupport) {
    var conversationID;

    function contains(conversation) {
      if (!conversation)
        return false;
      if (!conversation.sysID)
        return false;
      if (conversation.isPending)
        return false;
      var isSupportConv = (supportEnabled || !supportAddMembers) ? isSupport : undefined;
      var conversationList = $filter('conversation')(conversations.all, true, isSupportConv);
      return conversations.find(conversation, conversationList).index >= 0;
    }
    return {
      get sysID() {
        return conversationID;
      },
      set sysID(newSysID) {
        conversationID = newSysID;
        setPreference(preferenceName, conversationID);
      },
      get conversation() {
        return conversations.indexed[this.sysID] || conversations.emptyConversation;
      },
      set conversation(newConversation) {
        this.sysID = contains(newConversation) ? newConversation.sysID : undefined;
      }
    };
  }
  var inFrameSetConversationHandler;
  if (inFrameSet)
    inFrameSetConversationHandler = new ConversationHandler(PREFERENCE_ROOT + ".id");

  function TabData(isSupport) {
    var tab = isSupport ? "support" : "chat";
    var preferenceName = PREFERENCE_ROOT + '.' + tab + '.id';
    var conversationHandler = inFrameSetConversationHandler || new ConversationHandler(preferenceName, isSupport);
    if (!inSupportClient) {
      var startingLocation = location();
      if (!inFrameSet && (startingLocation.tab === tab) && startingLocation.conversationID) {
        initialize(startingLocation.conversationID, true).catch(function() {
          snNotification.show('error', restrictedConversationText);
          setPreference(preferenceName);
        });
      } else {
        userPreferences.getPreference(preferenceName).then(initialize).catch(function() {
          setPreference(preferenceName);
        });
      }
    }

    function initialize(id, makeVisible) {
      if (!id || id === "null")
        return $q.when();
      return conversations.get(id).then(function(conversation) {
        if (!conversation)
          return;
        if (!conversation.visible && !makeVisible)
          return;
        conversationHandler.sysID = conversation.sysID;
      });
    }
    return {
      get tab() {
        return tab;
      },
      get isSupport() {
        return isSupport;
      },
      get sysID() {
        return conversationHandler.sysID;
      },
      get conversation() {
        return conversationHandler.conversation;
      },
      set conversation(conv) {
        conversationHandler.conversation = conv;
      }
    };
  }
  var tabDataList = {
    chat: new TabData(false),
    support: new TabData(true)
  };
  var tab = checkedLocation().tab || (inSupportClient ? tabDataList.support.tab : startingTab[WINDOW_TYPE]);
  if (tab == "chat" && !chatEnabled)
    tab = "support";
  else if (tab == "support" && !supportEnabled)
    tab = "chat";
  var activeTabData = tabDataList[tab];
  $rootScope.$on("connect.action.create_record", function(evt, data) {
    documentsService.create(activeTabData.conversation, data);
  });

  function setPreference(name, value) {
    if (inSupportClient)
      return;
    userPreferences.setPreference(name, value || '');
  }
  messageService.watch(function(message) {
    if (activeTabData.sysID !== message.conversationID)
      $rootScope.$broadcast("connect.aria.new_unread_message", message);
    conversations.get(message.conversationID).then(function(conversation) {
      if (!conversation)
        return;
      if (conversation.isGroup)
        message.groupName = conversation.name;
      if (!message.isSystemMessage && (message.timestamp > conversation.lastReadMessageTime))
        conversation.visible = true;
      if (conversation.sysID !== activeTabData.sysID)
        return;
      if (snTabActivity.idleTime >= snTabActivity.defaultIdleTime)
        return;
      if (!snTabActivity.isVisible)
        return;
      conversation.resetUnreadCount();
    });
  });
  snTabActivity.on("tab.primary", function() {
    if (snTabActivity.isActive())
      activeTabData.conversation.resetUnreadCount();
  });

  function location() {
    var path = $location.path().split('/');
    return {
      tab: path[1],
      conversationID: path[2]
    };
  }

  function checkedLocation() {
    var path = location();
    if (path.tab === 'with')
      return {
        profileID: path.conversationID
      };
    return isValidTab(path.tab) ? path : {};
  }

  function isValidTab(tab) {
    return angular.isDefined(tabDataList[tab])
  }
  var pendingConversation;
  return {
    get tab() {
      return activeTabData.tab;
    },
    get sysID() {
      return activeTabData.sysID;
    },
    get conversation() {
      return activeTabData.conversation;
    },
    get isEmpty() {
      return !this.sysID || this.conversation.isEmpty;
    },
    get isSupport() {
      return activeTabData.isSupport;
    },
    get location() {
      return checkedLocation();
    },
    getTab: function(tab) {
      if (!isValidTab(tab))
        throw "Not a valid tab name";
      return tabDataList[tab];
    },
    set conversation(conv) {
      if (conv)
        conv.visible = true;
      else
        conv = conversations.emptyConversation;
      var old = activeTabData.conversation;
      if (!old.isEmpty) {
        old.resetUnreadCount();
        if (conv.sysID !== old.sysID)
          messageBatcherService.clearAriaMessages(old.sysID);
      }
      activeTabData.conversation = conv;
      if (this.isEmpty)
        return;
      if (inFrameSet)
        conv.openFrameState();
      this.conversation.resetUnreadCount();
      $rootScope.$broadcast("connect.message.focus", this.conversation);
    },
    set tab(newTab) {
      if (this.tab === newTab)
        return;
      activeTabData = this.getTab(newTab);
      if (!this.isEmpty)
        this.conversation.resetUnreadCount();
      setPreference(PREFERENCE_ROOT, newTab);
    },
    clear: function(check) {
      if (!check || check.sysID === this.sysID)
        this.conversation = undefined;
    },
    isActive: function(conversation) {
      return !this.pendingConversation && !this.isEmpty && conversation && conversation.sysID === this.sysID;
    },
    get pendingConversation() {
      return pendingConversation;
    },
    set pendingConversation(pending) {
      pendingConversation = pending;
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/service.conversationPersister.js */
angular.module('sn.connect.conversation').service('conversationPersister', function(
  snHttp, CONNECT_CONTEXT, isLoggedIn) {
  "use strict";
  var REST_API_PATH = isLoggedIn ? '/api/now/connect/conversations' : '/api/now/connect/support/anonymous/conversations';

  function createGroup(optionalParams) {
    optionalParams = optionalParams || {};
    return snHttp.post(REST_API_PATH, optionalParams).then(extractResult);
  }

  function addUser(conversationID, profileID) {
    return snHttp.post(REST_API_PATH + '/' + conversationID + '/members', {
      "member_id": profileID
    }).then(extractResult);
  }

  function removeUser(conversationID, profileID) {
    return snHttp.delete(REST_API_PATH + '/' + conversationID + '/members/' + profileID).then(extractResult);
  }

  function update(conversationID, data) {
    return snHttp.put(REST_API_PATH + '/' + conversationID, data).then(extractResult);
  }

  function extractResult(response) {
    return response.data.result;
  }
  var conversationURL = REST_API_PATH;
  return {
    createGroup: createGroup,
    addUser: addUser,
    removeUser: removeUser,
    update: update,
    getConversations: function(queueID) {
      if (queueID) {
        conversationURL = isLoggedIn ? '/api/now/connect/support/queues/' + queueID + '/sessions' :
          '/api/now/connect/support/anonymous/queues/' + queueID + '/sessions';
      }
      return snHttp.get(conversationURL).then(extractResult);
    },
    getConversation: function(conversationID) {
      return snHttp.get(REST_API_PATH + '/' + conversationID)
        .then(extractResult)
    },
    lastViewed: function(conversationID, timestamp) {
      return update(conversationID, {
        last_viewed: timestamp
      })
    },
    visible: function(conversationID, visible) {
      return update(conversationID, {
        visible: visible
      });
    },
    frameState: function(conversationID, state) {
      var data = {
        frame_state: state
      };
      if (state === 'closed')
        data.frame_order = -1;
      return update(conversationID, data);
    },
    changeFrameOrder: function(conversations) {
      var data = {
        frame_order: conversations.join(',')
      };
      return snHttp.post(REST_API_PATH + '/order', data).then(extractResult);
    },
    createConversation: function(groupName, recipients, message) {
      var recipientJIDs = recipients.map(function(recipient) {
        return recipient.jid;
      });
      var data = {
        group_name: groupName,
        recipients: recipientJIDs,
        message: message.text,
        reflected_field: message.reflectedField || "comments",
        attachments: message.attachmentSysIDs,
        context: CONNECT_CONTEXT
      };
      return snHttp.post(REST_API_PATH, data).then(extractResult);
    },
    createDocumentConversation: function(table, sysID) {
      var data = {
        table: table,
        sys_id: sysID
      };
      return snHttp.post(REST_API_PATH + '/records', data).then(extractResult);
    },
    setDocument: function(profileID, table, document) {
      var data = {
        table: table,
        document: document
      };
      return snHttp.put(REST_API_PATH + '/' + profileID + '/records', data);
    }
  };
});;
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
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversation.js */
angular.module('sn.connect.conversation').directive('snConversation', function(
  getTemplateUrl, $rootScope, $timeout, messageService, activeConversation, profiles) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversation.xml"),
    replace: true,
    scope: {
      conversation: "=",
      shouldAnnounce: "=readmessages",
      showSenderPresence: "@"
    },
    link: function(scope, element) {
      scope.loading = false;
      scope.$watch("messagesLoadedOnce", function() {
        var isConversationActive = !activeConversation.pendingConversation;
        if (isConversationActive)
          $timeout(function() {
            var el = element.find('.new-message');
            el.focus()
          }, 0, false);
        $timeout(function() {
          scope.loading = !scope.messagesLoadedOnce && isConversationActive;
        }, 0, true);
      });
      scope.checkForUnloadedMessages = function() {
        $timeout(function() {
          var scrollHeight = element.find(".sn-feed-messages")[0].scrollHeight;
          var containerHeight = element.find(".sn-feed-messages").height();
          if (scrollHeight < containerHeight) {
            scope.retrieveMessageHistory().then(function(retrievedMessages) {
              if (retrievedMessages.length === 30)
                scope.checkForUnloadedMessages();
              else
                $timeout(function() {
                  scope.$broadcast('connect.auto_scroll.jump_to_bottom');
                }, 0, false);
            });
          }
        });
      };

      function onClick(evt) {
        $timeout(function() {
          var profileID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
          profiles.getAsync(profileID).then(function(profile) {
            scope.showPopover = true;
            scope.mentionPopoverProfile = profile;
            scope.clickEvent = evt;
          });
        }, 0, false);
      }
      element.on("click", ".at-mention", function(evt) {
        if (scope.showPopover) {
          var off = scope.$on("snMentionPopover.showPopoverIsFalse", function() {
            onClick(evt);
            off();
          });
        } else {
          onClick(evt);
        }
      });
      element.on("click", function(evt) {
        scope.focusOnConversation();
      });
    },
    controller: function($scope, $element, $q, snRecordPresence, queueEntries, hotKeyHandler, snHotKey,
      snComposingPresence, userID, inFrameSet) {
      $scope.messagesLoadedOnce = false;
      $scope.showLoading = true;
      $scope.rawMessages = [];
      $scope.asideOpen = false;
      $scope.$on("sn.aside.open", function() {
        $scope.asideOpen = true;
      });
      $scope.$on("sn.aside.close", function() {
        $scope.asideOpen = false;
      });
      $scope.isComposingHidden = function() {
        return $scope.conversation.isHelpDesk && !$scope.conversation.queueEntry.isActive;
      };
      var closeHotKey = new snHotKey({
        key: "ESC",
        callback: function() {
          $scope.$broadcast("snippets.hide", $scope.conversation);
          hotKeyHandler.remove(closeHotKey);
        }
      });
      $scope.escalateOk = function() {
        queueEntries.escalate($scope.conversation);
      };
      $rootScope.$on('http-error.hide', function() {
        messageService.retrieveMessages($scope.conversation);
      });
      $scope.isNoRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 0;
      };
      $scope.isOneRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 1;
      };
      $scope.isGroupMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length > 1;
      };

      function hasNoMessage() {
        return !$scope.conversation.firstMessage;
      }

      function isVisible() {
        return ($element[0].offsetWidth !== 0) && ($element[0].offsetHeight !== 0);
      }
      $scope.$watch(isVisible, function(visible) {
        if (!visible || $scope.conversation.isPending)
          return;
        if (inFrameSet && $scope.conversation.isFrameStateMinimize)
          return;
        $scope.conversation.resetUnreadCount();
      });
      $scope.$watch("conversation.sysID", function(newSysID) {
        if (!newSysID)
          return;
        if ($scope.conversation.isPending)
          return;
        $scope.messagesLoadedOnce = false;
        $scope.conversationAlreadyViewed = $scope.conversation.unreadCount > 0;
        $scope.rawMessages = [];
        $scope.previousProfileID = void(0);
        if (!$scope.conversation)
          return;
        if ($scope.conversation.sysID) {
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: [],
            typing: []
          });
          snRecordPresence.initPresence("live_group_profile", $scope.conversation.sysID);
        }
        refreshMessages().then(function(loadedMessages) {
          if (loadedMessages.length === 30)
            $scope.checkForUnloadedMessages();
        });
      });
      $scope.$root.$on("sn.sessions", function(name, data) {
        if (!$scope.conversation || !$scope.conversation.members)
          return;
        var viewing = {};
        var typing = {};
        angular.forEach(data, function(value) {
          if (value.user_id === userID)
            return;
          var conversationID = $scope.conversation.sysID;
          if (value.sys_id === conversationID) {
            if (value.status === "typing") {
              typing[value.user_id] = true;
              delete viewing[value.user_id];
            } else if ((value.status === "viewing" || value.status === "entered") && !typing[value.user_id]) {
              viewing[value.user_id] = true;
            }
          }
        });
        var conversationViewing = [];
        var conversationTyping = [];
        if ($scope.conversation.amMember) {
          angular.forEach($scope.conversation.members, function(member) {
            if (viewing[member.document])
              conversationViewing.push(member);
            if (typing[member.document])
              conversationTyping.push(member);
          });
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: conversationViewing,
            typing: conversationTyping
          });
        }
      });
      $scope.$on("conversation.refresh_messages", function(e, data) {
        if ($scope.conversation.sysID !== data.sysID)
          return;
        refreshMessages();
      });
      $scope.$on("amb.connection.recovered", refreshMessages);

      function refreshMessages() {
        return messageService.retrieveMessages($scope.conversation)
          .then(function(loadedMessages) {
            $timeout(function() {
              $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
            }, 500);
            $scope.messagesLoadedOnce = true;
            return loadedMessages;
          })
          .catch(function() {
            $scope.messagesLoadedOnce = true;
            return [];
          });
      }
      $scope.focusOnConversation = function() {
        if (activeConversation.pendingConversation)
          $rootScope.$broadcast("connect.message.focus", this.conversation);
        else
          activeConversation.conversation = $scope.conversation;
      };
      $scope.retrieveMessageHistory = function() {
        if ($scope.conversation.isPending ||
          $scope.conversation.restricted ||
          !$scope.conversation.messageBatcher.batches.length)
          return $q.when([]);
        var earliestReceivedTime = $scope.conversation.firstMessage.timestamp;
        var promise = messageService.retrieveMessages($scope.conversation, earliestReceivedTime);
        if (!promise)
          return $q.when([]);
        var deferred = $q.defer();
        promise.then(function(retrievedMessages) {
          $scope.messagesLoadedOnce = false;
          $scope.rawMessages = [];
          $scope.messagesLoadedOnce = true;
          deferred.resolve(retrievedMessages);
        });
        return deferred.promise;
      };
      $scope.$on("ngRepeat.complete", function(e) {
        if (angular.equals(e.targetScope, $scope))
          return;
        $scope.$broadcast("ngRepeat.complete");
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationFooter.js */
angular.module('sn.connect.conversation').directive('snConversationFooter', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversationFooter.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $rootScope, amb, uploadAttachmentService, queueEntries, inSupportClient, showActionsForClosedCases) {
      $scope.amb = amb;
      var snHttpError = false;
      $scope.$on('http-error.show', function() {
        snHttpError = true;
      });
      $scope.$on('http-error.hide', function() {
        snHttpError = false;
      });

      function getNoticeType() {
        if (isQueueEntry("isClosedByAgent"))
          return "closed session";
        if ($scope.conversation.restricted)
          return "restricted";
        if (amb.interrupted || snHttpError)
          return "connection error";
        if (inSupportClient && !isQueueEntry("isActive") && !isQueueEntry("isClosedByAgent"))
          return "rejoin";
        if (!inSupportClient && isQueueEntry("isWaiting"))
          return "agent waiting";
        if ($scope.conversation.isPendingNoRecipients)
          return "no recipients";
        if (uploadAttachmentService.filesInProgress.length > 0)
          return "upload in progress";
      }
      $scope.isNoticeShowing = function() {
        return !!getNoticeType();
      };
      $scope.isClosedSessionShowing = function() {
        return getNoticeType() === "closed session";
      };
      $scope.isConnectionErrorShowing = function() {
        return getNoticeType() === "connection error";
      };
      $scope.isRestrictedShowing = function() {
        return getNoticeType() === "restricted";
      };
      $scope.isRejoinShowing = function() {
        return getNoticeType() === "rejoin";
      };
      $scope.isAgentWaitingShowing = function() {
        return getNoticeType() === "agent waiting";
      };
      $scope.isNewConversationNoRecipientsShowing = function() {
        return getNoticeType() === "no recipients";
      };
      $scope.isUploadInProgressShowing = function() {
        return getNoticeType() === "upload in progress";
      };
      $scope.isError = function() {
        return $scope.isRestrictedShowing() || $scope.isConnectionErrorShowing();
      };
      $scope.isQueueNameShowing = function() {
        return isQueueEntry("queue");
      };
      $scope.isQueueNumberShowing = function() {
        return $scope.conversation.table == 'chat_queue_entry';
      };
      $scope.isDocumentNumberShowing = function() {
        return $scope.conversation.hasRecord;
      };

      function isQueueEntry(field) {
        return $scope.conversation.isHelpDesk && $scope.conversation.queueEntry[field];
      }
      $scope.selectSnippet = function(snippet) {
        $scope.$broadcast("connect.conversation.insert_snippet", snippet);
      };
      $scope.rejoin = function() {
        queueEntries.rejoin($scope.conversation.sysID);
      };
      $scope.isMenuVisible = function() {
        return !inSupportClient &&
          !$scope.conversation.isEmpty &&
          $scope.conversation.chatActions &&
          $scope.conversation.chatActions.getMenuActions().length > 0 &&
          (!isQueueEntry("isClosedByAgent") || showActionsForClosedCases);
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationAddUserButton.js */
angular.module('sn.connect.conversation').directive('snConversationAddUserButton', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      conversation: "="
    },
    templateUrl: getTemplateUrl("snConversationAddUserButton.xml"),
    controller: function($scope, $rootScope, conversations, activeConversation) {
      $scope.userSelected = function(user) {
        conversations.addUser($scope.conversation.sysID, user)
          .then(function(conversation) {
            activeConversation.conversation = conversation;
          })
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationContainer.js */
angular.module('sn.connect.conversation').directive('snConversationContainer', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationContainer.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $timeout, conversations, activeConversation, screenWidth) {
      $scope.activeConversation = activeConversation;
      var loading = true;
      conversations.loaded.then(function() {
        loading = false;
      });
      $scope.$on("connect.new_conversation.cancelled", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.new_conversation.complete", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.show_create_conversation_screen", function(unused, preloadedMember) {
        activeConversation.pendingConversation = conversations.newConversation.$reset();
        activeConversation.tab = 'chat';
        if (preloadedMember)
          $timeout(function() {
            $scope.$emit("connect.member_profile.direct_message", preloadedMember);
          });
      });
      $scope.showLoading = function() {
        return loading;
      };
      $scope.showIntroduction = function() {
        return !loading && activeConversation.isEmpty;
      };
      $scope.showConversation = function() {
        return !loading && !activeConversation.isEmpty;
      };
      $scope.showSidePanel = function() {
        return $scope.showConversation() && screenWidth.isAbove(800);
      };
      $scope.isCloseNewConversationShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.closeNewConversation = function() {
        $scope.$emit("connect.new_conversation.cancelled");
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeader.js */
angular.module('sn.connect').directive('snConversationHeader', function(getTemplateUrl) {
      'use strict';
      return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snConversationHeader.xml'),
        replace: true,
        scope: {
          conversation: '='
        },
        controller: function($scope, $element, $timeout, conversations, snAttachmentHandler, userID) {
            $scope.conversationTemp = {};
            $scope.middleAlignName = false;
            $scope.userID = userID;
            $scope.canEdit = function() {
              return $scope.conversation && $scope.conversation.isGroup;
            };
            $scope.getPrimaryUser = function() {
              return $scope.conversation.isGroup ?
                $scope.conversation.lastMessage.profileData :
                $scope.conversation.peer;
            };
            $scope.onlyShowName = function() {
              if ($scope.conversation.isHelpDesk)
                return false;
              if ($scope.conversation.isGroup)
                return !$scope.showDescription();
              if (!$scope.conversation.peer)
                return true;
              var detail = $scope.conversation.peer.detail;
              return !detail || !(detail.department || detail.city);
            };
            $scope.showDescription = function() {
              return $scope.conversation.isGroup && !(!$scope.conversation.description || $scope.conversation.description === "") &&
                !($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending);
            };
            $scope.isEditable = function() {
              return $scope.conversation.isGroup && !$scope.conversation.isHelpDesk && $scope.conversation.amMember;
            };
            $scope.saveGroupEdit = function() {
              conversations.update($scope.conversation.sysID, $scope.conversationTemp);
            };
            $scope.openModal = function(evt) {
              if (evt.keyCode === 9 || !$scope.isEditable())
                return;
              $scope.conversationTemp = {
                name: $scope.conversation.name,
                description: $scope.conversation.description,
                access: $scope.conversation.access
              };
              angular.element("#chatGroupPopupModal").modal('show').find("#groupName").focus();
            };
            $scope.stopProp = function(event) {
              event.stopPropagation();
            };
            $scope.uploadNewGroupImage = function() {
              if ($scope.conversation.amMember)
                $timeout(function() {
                  $element.find(".message-attach-file").click();
                }, 0, false);
            };
            $scope.getImageBackground = function() {
              return {
                'background-image': "url('" + $scope.conversation.avatar + "')"
              }
            };
            $scope.attachFiles = function(files) {
                $scope.uploading = true;
                snAttachmentHandler.create("live_group_profile", $scope.conversation.sysID).uploadAtt