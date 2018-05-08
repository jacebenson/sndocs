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
      $scope.$on('$destroy', function() {
        snCustomEvent.un($scope.closeEvent, destroyPopover);
      });
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
      $scope.popOverDisplaying = false;
      $scope.togglePopover = function(event) {
        if (!open) {
          showPopover(event);
        } else {
          destroyPopover();
        }
        $scope.popOverDisplaying = !$scope.popOverDisplaying;
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
      get type() {
        return data.type;
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
        if (conversationID === newSysID) {
          return;
        }
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
  $rootScope.$on("connect.action.create_record", function(evt, data, conversation) {
    if (conversation) {
      API.conversation = conversation;
    }
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
  var API = {
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
  return API;
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
  i18n.getMessages(['and', 'more', 'You have been mentioned', "New Conversation"], function(i18nNames) {
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
      name: i18nText["New Conversation"],
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
        snAttachmentHandler.create("live_group_profile", $scope.conversation.sysID).uploadAttachment(files.files[0], {
          sysparm_fieldname: "photo"
        }).then(function(response) {
          conversations.refreshConversation($scope.conversation.sysID);
          $scope.conversation.avatar = response.sys_id + ".iix";
          $scope.uploading = false;
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeaderControls.js */
angular.module('sn.connect').directive('snConversationHeaderControls', function(getTemplateUrl, i18n) {
  'use strict';
  var knowledgeBaseTitle = "";
  var documentTitle = "";
  i18n.getMessages(["Knowledge Base", "Document"], function(results) {
    knowledgeBaseTitle = results["Knowledge Base"];
    documentTitle = results["Document"];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationHeaderControls.xml'),
    replace: true,
    scope: {
      conversation: '=',
      collapsible: '@'
    },
    link: function(scope, element, attrs) {
      attrs.$observe('collapsible', function(value) {
        scope.collapsible = scope.$eval(value || 'true');
      });
    },
    controller: function($scope, $element, $animate, snConversationAsideHistory, $timeout) {
      $scope.expandDirection = "left";
      $scope.activeAside = "";
      $scope.buttons = $element.find('#conversationAsideButtons');
      var activeAsideButton;
      var helpDeskAsides = ["knowledge", "record", "pending_record"];
      var pendingRecordKeys = {};
      var defaultAsideScope = $scope.$new();
      var asideViews = {
        members: {
          template: "<sn-aside-member-list></sn-aside-member-list>",
          scope: defaultAsideScope
        },
        info: {
          template: "<sn-aside-info></sn-aside-info>",
          scope: defaultAsideScope
        },
        attachments: {
          template: "<sn-aside-attachments></sn-aside-attachments>",
          scope: defaultAsideScope
        },
        notifications: {
          template: "<sn-aside-notifications></sn-aside-notifications>",
          scope: defaultAsideScope
        },
        knowledge: {
          template: function() {
            return "<sn-aside-frame name='knowledge' url=\"/$knowledge.do\" title='" + knowledgeBaseTitle + "'></sn-aside-frame>";
          },
          width: "50%",
          cacheKey: function() {
            return $scope.conversation.sysID + ".knowledgeBase";
          }
        },
        record: {
          template: function() {
            return "<sn-aside-frame name='record' url=\"/" + $scope.conversation.table + ".do?sys_id=" + $scope.conversation.document + "\" title=\"" + documentTitle + "\"></sn-aside-frame>";
          },
          width: "50%",
          cacheKey: function() {
            return $scope.conversation.sysID + ".record";
          }
        },
        pending_record: {
          template: "",
          width: "50%",
          cacheKey: function() {
            return pendingRecordKeys[$scope.conversation.sysID] ? pendingRecordKeys[$scope.conversation.sysID] : $scope.conversation.sysID + ".pending_record";
          }
        }
      };
      $scope.isShowInfo = function() {
        return !$scope.conversation.isHelpDesk && ($scope.conversation.document || $scope.conversation.resources.links.length > 0 || $scope.conversation.resources.records.length > 0);
      };
      $scope.isShowRecord = function() {
        return $scope.conversation.isHelpDesk && $scope.conversation.document && $scope.conversation.table != 'chat_queue_entry'
      };

      function stringFunction(stringOrFunction) {
        if (angular.isFunction(stringOrFunction))
          return stringOrFunction();
        return stringOrFunction;
      }
      $scope.$on("sn.aside.open", function(e, view) {
        var cacheKey = stringFunction(view.cacheKey);
        if (cacheKey && cacheKey.indexOf("pending_record") > -1) {
          pendingRecordKeys[$scope.conversation.sysID] = cacheKey;
        }
      });
      $scope.$watch("conversation.sysID", function() {
        var historicalAside = snConversationAsideHistory.getHistory($scope.conversation.sysID);
        if ($scope.conversation.restricted) {
          $scope.$emit("sn.aside.close");
          return;
        }
        var historicalAsideScopeValid = (historicalAside && historicalAside.scope && historicalAside.scope.$parent && !historicalAside.scope.$parent["$$destroyed"]);
        if (historicalAside && historicalAsideScopeValid) {
          $scope.$evalAsync(function() {
            $scope.$emit("sn.aside.open", historicalAside);
          });
          return;
        }
        if (!$scope.activeAside)
          return;
        if (!$scope.showInfo && $scope.activeAside === "info") {
          $scope.$emit("sn.aside.close");
          return;
        }
        if (helpDeskAsides.indexOf($scope.activeAside) >= 0 && !$scope.conversation.isHelpDesk) {
          $scope.$emit("sn.aside.close");
          return;
        }
        if ($scope.activeAside === "record" && $scope.conversation.table === "chat_queue_entry") {
          $scope.$emit("sn.aside.close");
          return;
        }
        if ($scope.activeAside === "pending_record" && !$scope.conversation.pendingRecord) {
          $scope.$emit("sn.aside.close");
          return;
        }
        $scope.$emit("sn.aside.open", asideViews[$scope.activeAside], asideWidth($scope.activeAside));
      });

      function asideWidth(view) {
        return asideViews[view].width || $scope.buttons.width();
      }
      $scope.$on("sn.aside.trigger_control", function(e, view) {
        if (!asideViews.hasOwnProperty(view))
          return;
        if ($scope.activeAside === view) {
          if ($scope.collapsible)
            $scope.$emit("sn.aside.close");
          return;
        }
        $scope.activeAside = view;
        $timeout(function() {
          $scope.$emit("sn.aside.open", asideViews[view], asideWidth(view));
        }, 0, false);
      });
      $scope.openAside = function(view) {
        $scope.$emit("sn.aside.trigger_control", view);
      };
      $scope.$on("sn.aside.controls.active", function(e, data) {
        activeAsideButton = $element.find('[aside-view-name="' + data + '"]');
        $scope.activeAside = data;
      });
      $scope.$on("sn.aside.close", function() {
        if (activeAsideButton) {
          activeAsideButton.focus();
        }
        $scope.activeAside = void(0);
        activeAsideButton = void(0);
      });

      function resizeAside(unused, phase) {
        if (phase === "close" && $scope.activeAside && asideViews[$scope.activeAside]) {
          $scope.$emit("sn.aside.resize", asideWidth($scope.activeAside));
        }
      }
      $animate.on('addClass', $scope.buttons, resizeAside);
      $animate.on('removeClass', $scope.buttons, resizeAside);
      $scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.close");
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationItem.js */
angular.module('sn.connect.conversation').directive('snConversationItem', function(
  getTemplateUrl, inSupportClient, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snConversationItem.xml'),
    replace: true,
    scope: {
      conversation: '='
    },
    controller: function($scope, $rootScope) {
      $scope.isBadgeVisible = function() {
        return ($scope.conversation.unreadCount > 0) && !$scope.isTransferPending();
      };
      $scope.getUserFromProfile = function(conversation) {
        return conversation.isGroup ? conversation.lastMessage.profileData : conversation.peer;
      };
      $scope.remove = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        $event.stopPropagation();
        closeConversation();
      };

      function closeConversation() {
        if (conversations.close($scope.conversation.sysID)) {
          $rootScope.$broadcast("sn.aside.clearCache", $scope.conversation.sysID);
          activeConversation.clear($scope.conversation);
        }
      }
      return {
        closeConversation: closeConversation
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportConversationItem.js */
angular.module('sn.connect.conversation').directive('snSupportConversationItem', function(getTemplateUrl, inSupportClient) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snSupportConversationItem.xml'),
    replace: true,
    require: 'snConversationItem',
    scope: {
      conversation: '='
    },
    controller: function($scope, $rootScope, activeConversation, queueEntries,
      queueEntryNotifier, supportEnabled, inFrameSet, snConversationItemDirective) {
      var parent = snConversationItemDirective[0].controller.apply(this, arguments);
      $scope.supportEnabled = supportEnabled || false;
      for (var i = 0; i < $scope.conversation.members.length; i++)
        if ($scope.conversation.members[i].document === $scope.conversation.queueEntry.openedBy)
          $scope.openedBy = $scope.conversation.members[i];
      $scope.acceptTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.accept($scope.conversation.sysID);
        activeConversation.conversation = $scope.conversation;
      };
      $scope.rejectTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.reject($scope.conversation.sysID);
        if ($scope.conversation.queueEntry.transferShouldClose)
          parent.closeConversation();
      };
      $scope.cancelTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.cancel($scope.conversation.sysID);
      };
      $scope.isTransferPending = function() {
        return !!$scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending;
      };
      $scope.isSendingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringFromMe;
      };
      $scope.isReceivingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringToMe;
      };
      $rootScope.$on("connect.queueEntry.updated", queueEntryUpdated);
      queueEntryUpdated(undefined, $scope.conversation.queueEntry);

      function queueEntryUpdated(event, queueEntry, old) {
        if (queueEntry.conversationID !== $scope.conversation.sysID)
          return;
        if (!queueEntry)
          return;
        var initial = angular.isUndefined(old);
        if (!queueEntry.isTransferStateChanged && !initial)
          return;
        if ((inFrameSet || activeConversation.isEmpty) &&
          queueEntry.isTransferringToMe && queueEntry.isTransferPending)
          activeConversation.conversation = $scope.conversation;
        var isTransferNegative = queueEntry.isTransferCancelled || queueEntry.isTransferRejected;
        if (queueEntry.isTransferringToMe &&
          queueEntry.transferShouldClose &&
          isTransferNegative)
          parent.closeConversation();
        queueEntryNotifier.notify($scope.conversation);
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snChatTab.js */
angular.module('sn.connect.conversation').directive('snChatTab', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snChatTab.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $rootScope, $filter, conversations, activeConversation,
      inFrameSet, supportEnabled, supportAddMembers) {
      $scope.isSupportListEnabled = !supportEnabled && supportAddMembers;
      if (!inFrameSet) {
        var index = 0;
        $scope.$watch(function() {
          return activeConversation.sysID;
        }, function(sysID) {
          if (!sysID)
            return;
          index = conversations.find(activeConversation.conversation, filterConversations(true)).index;
          if (index < 0)
            index = 0;
        });
        $scope.$watchCollection(function() {
          return filterConversations(true);
        }, function(conversationList) {
          if (activeConversation.isSupport)
            return;
          if (conversationList.length === 0)
            return;
          if (!activeConversation.isEmpty)
            return;
          activeConversation.conversation = getIndexConversation(conversationList);
        });
        $scope.$on('connect.conversation.select', function(unused, tab, conversationID) {
          if (activeConversation.getTab(tab).isSupport)
            return;
          conversationID = conversationID || activeConversation.sysID;
          var conversationList = filterConversations(!conversationID);
          var conversation;
          if (conversationID)
            conversation = conversations.find(conversationID, conversationList).conversation;
          activeConversation.conversation = conversation || getIndexConversation(conversationList);
        });
        var getIndexConversation = function(conversationList) {
          if (index >= conversationList.length)
            index = conversationList.length - 1;
          if (index < 0)
            index = 0;
          return conversationList[index];
        }
      }
      $scope.supportConversationsFilter = function(conversations) {
        return supportEnabled ?
          [] :
          getConversations(conversations, true, true, $scope.searchTerm);
      };
      $scope.openConversationsFilter = function(conversations) {
        return getConversations(conversations, true, false, $scope.searchTerm);
      };
      $scope.closedConversationsFilter = function(conversations) {
        return getConversations(conversations, false, false, $scope.searchTerm);
      };

      function getConversations(conversations, visible, support, searchTerm) {
        var searchFiltered = $filter('searchTerm')(conversations, searchTerm);
        if (searchFiltered.length === 0)
          return [];
        return $filter('conversation')(searchFiltered, visible, support);
      }

      function filterConversations(visible) {
        if (!visible)
          return getConversations(conversations.all);
        return $scope.supportConversationsFilter(conversations.all)
          .concat($scope.openConversationsFilter(conversations.all));
      }
      $scope.triggerCreateConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $rootScope.$broadcast("connect.show_create_conversation_screen");
        $rootScope.$broadcast('connect.pane.close');
      };
      $scope.clearFilterText = function() {
        $scope.searchTerm = "";
      };
      $scope.hasSearchText = function() {
        return $scope.searchTerm && $scope.searchTerm.length > 0;
      };
      $scope.showOpenHeader = function() {
        return ($scope.hasSearchText() || hasSupportConversations()) &&
          hasOpenConversations();
      };
      $scope.showClosedHeader = function() {
        return $scope.hasSearchText() &&
          hasClosedConversations();
      };
      $scope.showMessageBlock = function() {
        return ($scope.showNoChatConversations() ||
          $scope.showNoSearchResults());
      };
      $scope.showNoChatConversations = function() {
        return !$scope.hasSearchText() &&
          filterConversations(true).length === 0;
      };
      $scope.showNoSearchResults = function() {
        return $scope.hasSearchText() &&
          !hasSupportConversations() &&
          !hasOpenConversations() &&
          !hasClosedConversations();
      };

      function hasSupportConversations() {
        return $scope.supportConversationsFilter(conversations.all).length > 0;
      }

      function hasOpenConversations() {
        return $scope.openConversationsFilter(conversations.all).length > 0;
      }

      function hasClosedConversations() {
        return $scope.closedConversationsFilter(conversations.all).length > 0;
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportTab.js */
angular.module('sn.connect.conversation').directive('snSupportTab', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snSupportTab.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $filter, conversations, activeConversation, inFrameSet) {
      if (!inFrameSet) {
        $scope.$watchCollection(function() {
          return filterConversations();
        }, function(conversationList) {
          if (!activeConversation.isSupport)
            return;
          if (conversationList.length === 0)
            return;
          if (activeConversation.isEmpty)
            activeConversation.conversation = conversationList[0];
        });
      }
      $scope.primarySupportConversationsFilter = function(conversations) {
        return supportConversationsFilter(conversations, true);
      };
      $scope.secondarySupportConversationsFilter = function(conversations) {
        return supportConversationsFilter(conversations, false);
      };

      function supportConversationsFilter(conversations, primary) {
        return $filter('conversation')(conversations, true, true).filter(function(conversation) {
          var queueEntry = conversation.queueEntry;
          return primary === (queueEntry.isAssignedToMe || queueEntry.isTransferringToMe);
        });
      };

      function filterConversations() {
        return $scope.primarySupportConversationsFilter(conversations.all)
          .concat($scope.secondarySupportConversationsFilter(conversations.all));
      }
      $scope.$on('connect.conversation.select', function(unused, tab, conversationID) {
        if (!activeConversation.getTab(tab).isSupport)
          return;
        if (!activeConversation.isEmpty && activeConversation.sysID === conversationID)
          return;
        conversationID = conversationID || activeConversation.sysID;
        var conversationList = filterConversations();
        var conversation;
        if (conversationID)
          conversation = conversations.find(conversationID, conversationList).conversation;
        activeConversation.conversation = conversation || conversationList[0];
      });
      $scope.showNoSupportSession = function() {
        return filterConversations().length === 0;
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationList.js */
angular.module('sn.connect.conversation').directive('snConversationList', function(getTemplateUrl, i18n) {
  'use strict';
  var unreadMessage = 'Unread Messages';
  i18n.getMessages([unreadMessage], function(i18nNames) {
    unreadMessage = i18nNames[unreadMessage];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationList.xml'),
    scope: {
      headerText: '@',
      isHelpDesk: '=?',
      filter: '&?',
      isHeaderVisible: '&?'
    },
    controller: function($scope, $rootScope, conversations, activeConversation, inSupportClient, inFrameSet) {
      var focusedConversation;
      $scope.isHelpDesk = $scope.isHelpDesk || false;
      $scope.conversations = [];
      $scope.inFrameSet = inFrameSet;
      if (angular.isUndefined($scope.isHeaderVisible)) {
        $scope.isHeaderVisible = function() {
          return function() {
            return $scope.conversations.length > 0;
          };
        }
      } else {
        var value = $scope.isHeaderVisible();
        if (!angular.isFunction(value)) {
          $scope.isHeaderVisible = function() {
            return function() {
              return value;
            };
          }
        }
      }
      $scope.$watchCollection(function() {
        if ($scope.filter)
          return $scope.filter()(conversations.all);
        return conversations.all;
      }, function(conversations) {
        $scope.conversations = conversations || [];
      });
      $scope.isActive = function(conversation) {
        return activeConversation.isActive(conversation) || conversation === focusedConversation;
      };
      $scope.selectConversation = function(conversation) {
        $rootScope.$broadcast('connect.open.floating', conversation);
        $rootScope.$broadcast("connect.new_conversation.cancelled");
        activeConversation.conversation = conversation;
      };
      $scope.focusConversation = function(conversation, reverse) {
        if (reverse && focusedConversation === conversation) {
          focusedConversation = undefined;
        } else {
          focusedConversation = conversation;
        }
      };
      $scope.getAriaText = function(conversation) {
        var text = inSupportClient ?
          conversation.description :
          conversation.name;
        text += conversation.unreadCount ?
          ' ' + conversation.formattedUnreadCount + ' ' + unreadMessage :
          '';
        return text;
      }
      $scope.conversationDelta = function(conversation) {
        return conversation.sysID + conversation.avatar + conversation.name;
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationListContainer.js */
angular.module('sn.connect.conversation').directive('snConversationListContainer', function(
  getTemplateUrl, conversations, i18n) {
  'use strict';
  var supportTabAriaLabel = "Support Conversations - {0} Unread Messages";
  i18n.getMessages([supportTabAriaLabel], function(results) {
    supportTabAriaLabel = results[supportTabAriaLabel];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationListContainer.xml'),
    replace: true,
    scope: {},
    link: function(scope, element) {
      conversations.loaded.then(function() {
        element.removeClass("loading");
      })
    },
    controller: function($scope, $rootScope, $filter, snCustomEvent, conversationFactory, queues,
      activeConversation, supportEnabled, inFrameSet, chatEnabled) {
      $scope.inFrameSet = inFrameSet;
      $scope.supportEnabled = supportEnabled;
      $scope.chatEnabled = chatEnabled;
      $scope.showTabs = function() {
        return supportEnabled && chatEnabled;
      };
      $scope.getSupportTabAriaLabel = function() {
        return i18n.format(supportTabAriaLabel, $scope.getSupportUnreadCount());
      };
      $scope.isUsersWaitingIndicatorShowing = function() {
        return (queues.getAllWaitingCount() > 0) && !$scope.isSupport();
      };
      snCustomEvent.observe('chat:open_conversation', function(profile) {
        var cachedPeerConversations = conversations.getCachedPeerConversations(profile.userID || profile.sys_id);
        if (cachedPeerConversations[0]) {
          activeConversation.tab = 'chat';
          activeConversation.conversation = cachedPeerConversations[0];
        } else {
          $rootScope.$broadcast("connect.show_create_conversation_screen", profile);
        }
      });
      $scope.isSupport = function() {
        return activeConversation.isSupport;
      };
      $scope.openChat = openTab('chat');
      $scope.openSupport = openTab('support');

      function openTab(tab) {
        return function() {
          activeConversation.tab = tab;
        }
      }
      $scope.getChatUnreadCount = getUnreadCount(false);
      $scope.getSupportUnreadCount = getUnreadCount(true);

      function getUnreadCount(isSupport) {
        return function() {
          var unreadCount = 0;
          $filter('conversation')(conversations.all, true, isSupport)
            .forEach(function(conversation) {
              if (isSupport && conversation.queueEntry && conversation.queueEntry.isTransferringToMe)
                return;
              unreadCount += conversation.unreadCount;
            });
          return conversationFactory.formatUnreadCount(unreadCount);
        }
      }
      $scope.$watch(function() {
        return $scope.getChatUnreadCount() + $scope.getSupportUnreadCount();
      }, function(unreadCount) {
        CustomEvent.fireTop('connect:message_notification.update', unreadCount);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationSearch.js */
angular.module('sn.connect.conversation').directive('snConversationSearch', function(getTemplateUrl, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      title: "@",
      table: "=",
      name: "=",
      icon: "@",
      qualifier: "=?",
      searchField: "=?",
      onSelect: "&"
    },
    templateUrl: getTemplateUrl('snConversationSearch.xml'),
    replace: true,
    link: function(scope, element) {
      scope.search = function(evt) {
        $timeout(function() {
          element.find(".select2-choice").triggerHandler("mousedown");
          evt.preventDefault();
        }, 0, false);
        return false;
      }
    },
    controller: function($scope) {
      $scope.descriptor = {
        reference: $scope.table,
        attributes: '',
        name: $scope.name,
        searchField: $scope.searchField,
        qualifier: $scope.qualifier
      };
      $scope.valueSelected = function() {
        $scope.onSelect({
          value: "live_profile." + $scope.field.value
        })
      };
      $scope.field = {};
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snCreateNewConversationHeader.js */
angular.module('sn.connect.conversation').directive('snCreateNewConversationHeader', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snCreateNewConversationHeader.xml'),
    replace: true,
    link: function(scope, elem) {
      var input;
      scope.focusOnInput = function() {
        if (!input)
          input = elem.find("input");
        input.focus();
      };
      scope.scrollRecipientListToBottom = function() {
        $timeout(function() {
          var recipientListElem = document.getElementById("create-conversation-recipient-list");
          recipientListElem.scrollTop = recipientListElem.scrollHeight;
        }, 0, false);
      };
      var unWatch = scope.$on("live.search.control.ready", function(evt, control) {
        if (control)
          input = control;
        $timeout(scope.focusOnInput, 0, false);
        unWatch();
      });
    },
    controller: function($scope, $rootScope, activeConversation, conversations, snCustomEvent) {
      snCustomEvent.observe('connect:member_profile.direct_message', function(suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });
      $rootScope.$on("connect.member_profile.direct_message", function(evt, suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });

      function updatePendingConversation() {
        var conversation = conversations.newConversation;
        var pendingRecipients = conversation.pendingRecipients;
        if (pendingRecipients.length === 1) {
          var userSysID = pendingRecipients[0].sysID;
          var cachedPeerConversation = conversations.getCachedPeerConversations(userSysID)[0];
          if (cachedPeerConversation) {
            conversation = angular.copy(cachedPeerConversation);
            conversation.isPending = true;
          }
        }
        activeConversation.pendingConversation = conversation;
      }
      $scope.pendingRecipients = function() {
        return conversations.newConversation.pendingRecipients;
      };
      $scope.isAddUserShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.ignoreList = function() {
        return conversations.newConversation.pendingRecipients.map(function(recipient) {
          return recipient.sysID;
        }).join(',');
      };
      $scope.selectedMember = function(id, suggestion) {
        var sys_id = suggestion.sys_id || suggestion.userID || suggestion.jid.split(".")[1];
        var recipient = {
          name: suggestion.name,
          jid: suggestion.jid || (suggestion.table + "." + sys_id),
          sysID: sys_id
        };
        var alreadyAdded = conversations.newConversation.pendingRecipients
          .some(function(obj) {
            return angular.equals(obj, recipient);
          });
        if (!alreadyAdded) {
          conversations.newConversation.pendingRecipients.push(recipient);
          updatePendingConversation();
        }
        $scope.scrollRecipientListToBottom();
      };
      $scope.removeRecipient = function(event, index) {
        if (event && event.keyCode === 9)
          return;
        conversations.newConversation.pendingRecipients.splice(index, 1);
        updatePendingConversation();
        $scope.focusOnInput();
      };
      $scope.$on("connect.search_control_key", function(evt, key) {
        $scope.$evalAsync(function() {
          if (key === "backspace") {
            conversations.newConversation.pendingRecipients.pop();
            updatePendingConversation();
          } else if (key === "enter")
            $rootScope.$broadcast("connect.message.focus", activeConversation.pendingConversation);
          else if (key === "escape")
            $scope.$emit("connect.new_conversation.cancelled");
        });
      });
      $scope.$on("connect.message_control_key", function(evt, key) {
        if (key === "escape")
          $scope.$emit("connect.new_conversation.cancelled");
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversation.js */
angular.module('sn.connect.conversation').directive('snFloatingConversation', function(getTemplateUrl, $timeout, $animate, isRTL) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snFloatingConversation.xml'),
    replace: true,
    scope: {
      position: '=',
      conversation: '='
    },
    link: function(scope, element) {
      scope.$watch('position', function() {
        $timeout(function() {
          var property = isRTL ? 'left' : 'right';
          element.css(property, scope.position);
          element.addClass('loaded');
        }, 0, false);
      });
      scope.animateClose = function() {
        return $animate.addClass(element, "state-closing");
      };
      scope.$watch('conversation.isFrameStateOpen', function(value, old) {
        if (value === old)
          return;
        scope.$broadcast('connect.auto_scroll.scroll_to_bottom', scope.conversation);
      });
      element.on("click", function(evt) {
        scope.focusOnConversation();
      });
    },
    controller: function($scope, $rootScope, activeConversation, resourcePersister, profiles, queueEntries,
      documentsService, userID, $timeout, snCustomEvent, audioNotifier, supportAddMembers,
      connectDropTargetService) {
      $scope.activeConversation = activeConversation;
      $scope.userID = userID;
      $scope.popoverOpen = function(evt) {
        var el = angular.element(evt.target).closest(".sn-navhub-content").find(".sub-avatar");
        $timeout(function() {
          angular.element(el).trigger('click')
        }, 0);
      };
      CustomEvent.observe('glide:nav_sync_list_with_form', function(conversation) {
        $scope.$apply(function() {
          setSpotlighted(conversation);
        })
      });
      $scope.$on("connect.spotlight", function(evt, conversation) {
        setSpotlighted(conversation);
      });

      function setSpotlighted(conversation) {
        $scope.isSpotlighted =
          conversation.table === $scope.conversation.table &&
          conversation.sysID === $scope.conversation.document;
      }
      $scope.focusOnConversation = function(event) {
        activeConversation.conversation =  $scope.conversation;
        if (!event)
          return;
        if (!$scope.conversation.isPending)
          return;
        if (angular.element(event.target).parents(".sn-add-users").length !== 0)
          return;
        $rootScope.$broadcast("connect.message.focus", $scope.conversation);
      };
      $scope.isCurrentConversation = function() {
        return activeConversation.isActive($scope.conversation);
      };
      $scope.isReadMessages = function() {
        return $scope.isCurrentConversation() && $scope.conversation.isFrameStateOpen;
      };
      $scope.isTransferPending = function() {
        var queueEntry = $scope.conversation.queueEntry;
        return queueEntry && queueEntry.isTransferPending && queueEntry.isTransferringToMe;
      };
      $scope.isCloseButtonShowing = function() {
        return !$scope.conversation.isPending || !$scope.conversation.firstMessage;
      };
      if ($scope.isTransferPending())
        audioNotifier.notify($scope.conversation.sysID);
      $scope.$on("connect.floatingConversationEscape", function(evt) {
        $scope.removeConversation(evt);
      });
      $scope.removeConversation = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        snCustomEvent.fireTop('snAvatar.closePopover');
        $rootScope.$broadcast('mentio.closeMenu');
        $scope.stopPropagation($event);
        $scope.animateClose().then(function() {
          if ($scope.conversation.isPending) {
            $rootScope.$broadcast("connect.new_conversation.cancelled");
            return;
          }
          $scope.conversation.closeFrameState();
          activeConversation.clear($scope.conversation);
        })
      };
      $scope.getWindowTarget = function() {
        return '_blank';
      };
      $scope.showDocument = function(table, sysID, $event) {
        $scope.stopPropagation($event);
        documentsService.show(table, sysID);
      };
      $scope.showDocumentIfExists = function($event) {
        if ($scope.isDocumentConversation())
          $scope.showDocument($scope.conversation.table, $scope.conversation.document, $event);
      };
      $scope.stopPropagation = function($event) {
        if ($event)
          $event.stopPropagation();
      };
      var toggleOpenLock;
      $scope.toggleOpen = function($event) {
        $scope.stopPropagation($event);
        if (toggleOpenLock && $event.timeStamp === toggleOpenLock) {
          toggleOpenLock = null;
          return;
        } else
          toggleOpenLock = $event.timeStamp;
        if ($scope.conversation.isFrameStateOpen) {
          snCustomEvent.fireTop('snAvatar.closePopover');
          $scope.conversation.minimizeFrameState();
          if (activeConversation.isActive($scope.conversation))
            activeConversation.clear();
        } else {
          $scope.conversation.openFrameState();
          $timeout(function() {
            activeConversation.conversation = $scope.conversation;
          }, 0, false);
        }
      };
      $scope.isPendingVisible = function() {
        return $scope.isTransferPending() || $scope.conversation.isPending;
      };
      $scope.isAddUserButtonVisible = function() {
        var conversation = $scope.conversation;
        if (!conversation.isHelpDesk)
          return conversation.isGroup;
        return supportAddMembers &&
          conversation.queueEntry.isActive;
      };
      $scope.activateDropTarget = function() {
        connectDropTargetService.activateDropTarget($scope.conversation);
      };
      $scope.deactivateDropTarget = function() {
        connectDropTargetService.deactivateDropTarget($scope.conversation);
      };
      $scope.onFileDrop = function(files) {
        connectDropTargetService.onFileDrop(files, $scope.conversation);
      };
      $scope.handleDropEvent = function(data) {
        connectDropTargetService.handleDropEvent(data, $scope.conversation);
      };
      $scope.getPrimary = function() {
        return $scope.conversation.isGroup ?
          $scope.conversation.lastMessage.profileData :
          $scope.conversation.peer;
      };
      $scope.$watch('conversation', function(conversation) {
        if (activeConversation.isActive(conversation) && !conversation.isFrameStateOpen)
          activeConversation.clear();
      });
      $scope.$watch('conversation.queueEntry', function updateAssignedToProfile() {
        if (!$scope.conversation.isHelpDesk)
          return;
        profiles.getAsync('sys_user.' + $scope.conversation.queueEntry.assignedTo).then(function(profile) {
          $scope.assignedToProfile = profile;
        });
      });
      $scope.acceptTransfer = function($event) {
        $scope.stopPropagation($event);
        queueEntries.accept($scope.conversation.sysID);
      };
      $scope.rejectTransfer = function($event) {
        $scope.stopPropagation($event);
        queueEntries.reject($scope.conversation.sysID);
        $scope.removeConversation();
      };
      $scope.isDocumentConversation = function() {
        return $scope.conversation.document !== '';
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationCompressed.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationCompressed', function(getTemplateUrl, $timeout, isRTL) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snFloatingConversationCompressed.xml"),
    replace: true,
    scope: {
      start: '=',
      position: '='
    },
    link: function(scope, element) {
      var positionProperty = isRTL ? 'left' : 'right';
      if (element.hideFix) {
        element.hideFix();
      }
      scope.$watch("start", setRightCoordinate);

      function setRightCoordinate() {
        $timeout(function() {
          element.css(positionProperty, scope.position);
        }, 0, false);
      }
      setRightCoordinate();
    },
    controller: function($scope, $rootScope, $filter, conversations, activeConversation) {
      $scope.filterConversations = function() {
        return $filter('frameSet')(conversations.all);
      };
      $scope.isVisible = function() {
        return $scope.compressConversations.length > 0;
      };
      $scope.openConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        $rootScope.$broadcast('connect.open.floating', conversation);
      };
      $scope.closeConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        conversation.closeFrameState();
        activeConversation.clear();
      };
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationContainer.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationContainer', function(
  getTemplateUrl, $rootScope, documentLinkMatcher, conversations, activeConversation) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snFloatingConversationContainer.xml'),
    scope: {},
    link: function(scope) {
      var mainFrame = angular.element("#gsft_main");
      if (mainFrame.length > 0) {
        scope.$watch(function() {
          return mainFrame[0].contentDocument.location.href;
        }, checkForRecord);
        mainFrame.on("load", function() {
          scope.$digest();
        });
        mainFrame.on("click", function() {
          scope.$apply(function() {
            checkForRecord(mainFrame[0].contentDocument.location.href)
          })
        })
      }
      CustomEvent.observe("connect:open_group", function(data) {
        conversations.followDocumentConversation(data).then(function(conversation) {
          activeConversation.conversation = conversation;
        })
      });
      CustomEvent.observe("connect:follow_document", conversations.followDocumentConversation);
      CustomEvent.observe("connect:unfollow_document", conversations.unfollowDocumentConversation);

      function checkForRecord(newValue) {
        if (!documentLinkMatcher.isLink(newValue))
          return;
        $rootScope.$broadcast("connect.spotlight", documentLinkMatcher.getRecordData(newValue));
      }
    },
    controller: function($scope, $element, $filter, $timeout, $window, snRecordPresence, conversationPersister, isRTL) {
      angular.element('document').append($element);
      var FRAME_SPACING = 350;
      var FRAME_COMPRESSED = 60;
      var FRAME_SEPARATOR = 10;
      var ASIDE_WIDTH = 285;
      $scope.activeConversation = activeConversation;
      conversations.refreshAll().then(function() {
        activeConversation.conversation = getFirstFocusConversation();
      });
      $scope.filterConversations = function() {
        return $filter('frameSet')(conversations.all);
      };
      $scope.visibleFilterConversations = function() {
        var convs = $scope.filterConversations();
        return convs.slice(0, $scope.getConversationDisplayCount()).reverse();
      };
      var isAsideOpen = false;
      CustomEvent.observe("connect:conversation_list:state", function(state) {
        isAsideOpen = state === "open";
        resize();
      });
      angular.element($window).bind('resize', resize);
      var conversationDisplayCount = calculateConversationDisplayCount();
      var resizeTimeout;

      function resize() {
        if (resizeTimeout)
          $timeout.cancel(resizeTimeout);
        resizeTimeout = $timeout(function() {
          conversationDisplayCount = calculateConversationDisplayCount();
        }, 100);
      }

      function calculateConversationDisplayCount() {
        var frameWidth = $window.innerWidth;
        if (isAsideOpen)
          frameWidth -= ASIDE_WIDTH;
        var allWidth = $scope.filterConversations().length * FRAME_SPACING;
        frameWidth -= (allWidth > frameWidth) ? FRAME_COMPRESSED : FRAME_SEPARATOR;
        return Math.max(Math.floor(frameWidth / FRAME_SPACING), 1);
      }
      $scope.getConversationDisplayCount = function() {
        return conversationDisplayCount - (activeConversation.pendingConversation ? 1 : 0);
      };
      $scope.getCompressPosition = function() {
        return $scope.getContainerPosition(conversationDisplayCount);
      };
      $scope.getContainerPosition = function(index) {
        return index * FRAME_SPACING + FRAME_SEPARATOR;
      };
      $scope.newConversation = function() {
        return conversations.newConversation;
      };
      $scope.$watch(function() {
        return activeConversation.sysID;
      }, function(sysID) {
        if (!sysID) {
          activeConversation.conversation = getFirstFocusConversation();
          sysID = activeConversation.sysID;
        }
        if (sysID)
          snRecordPresence.initPresence("live_group_profile", sysID);
      });

      function getFirstFocusConversation() {
        if (activeConversation.pendingConversation)
          return activeConversation.pendingConversation;
        var first = undefined;
        $scope.filterConversations()
          .some(function(conversation, index) {
            if (!conversation.isFrameStateOpen)
              return false;
            if (index > conversationDisplayCount)
              return false;
            first = conversation;
            return true;
          });
        return first;
      }
      $scope.$on("connect.show_create_conversation_screen", function(evt, preloadedMember) {
        if (activeConversation.pendingConversation)
          return;
        activeConversation.pendingConversation = conversations.newConversation.$reset();
        if (preloadedMember)
          $timeout(function() {
            $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember);
            $timeout(function() {
              $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember)
            }, 0, false);
          });
      });
      $scope.$on("connect.new_conversation.cancelled", function() {
        activeConversation.pendingConversation = undefined;
        if (activeConversation.isEmpty)
          activeConversation.conversation = getFirstFocusConversation();
      });
      $scope.$on("connect.new_conversation.complete", function(event, conversation) {
        activeConversation.pendingConversation = undefined;
        moveToTop(conversation);
      });
      $scope.$on("connect.open.floating", function(event, conversation) {
        moveToTop(conversation);
      });

      function moveToTop(conversation) {
        if (conversation.isPending)
          return;
        if (!conversation)
          return;
        conversation.openFrameState();
        var conversationList = $scope.filterConversations();
        var position = conversations.find(conversation, conversationList).index;
        if (position < 1) {
          activeConversation.conversation = conversation;
          $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
          return;
        }
        conversationList.splice(position, 1);
        conversationList.unshift(conversation);
        conversationPersister.changeFrameOrder(conversationList.map(function(conversation, index) {
          conversation.frameOrder = index;
          return conversation.sysID;
        }));
        activeConversation.conversation = conversation;
        $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
      }
      if (angular.element(document.body).data().layout) {
        var $connectFloating = $element.find('.sn-connect-floating');
        var positionProperty = isRTL ? 'left' : 'right';
        $connectFloating.css(positionProperty, "5px");
        $scope.$on("pane.collapsed", function(evt, position, collapsed) {
          $connectFloating.css(positionProperty, collapsed ? "5px" : "290px");
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.searchTerm.js */
angular.module('sn.connect.conversation').filter('searchTerm', function() {
  'use strict';
  return function(input, searchTerm) {
    if (!searchTerm || searchTerm.length === 0)
      return input;
    var directMessages = [],
      groupMessages = [];
    input.filter(function(item) {
      if (item.isGroup)
        groupMessages.push(item);
      else
        directMessages.push(item);
    });
    var tempA = [],
      tempB = [];
    directMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    directMessages = tempA.concat(tempB);
    tempA = [];
    tempB = [];
    groupMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0 || item.description.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    groupMessages = tempA.concat(tempB);
    var newInput = directMessages.concat(groupMessages);

    function contains(s, t) {
      var s2 = s.toUpperCase();
      var t2 = t.toUpperCase();
      return s2.indexOf(t2) > -1;
    }
    return newInput.filter(function(entry) {
      return contains(entry.name, searchTerm) || contains(entry.description, searchTerm)
    });
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.conversation.js */
angular.module('sn.connect.conversation').filter('conversation', function(
  inSupportClient, supportEnabled, supportAddMembers, closedConversationLimit) {
  'use strict';

  function isConversationDisplayable(conversation, isHelpDesk) {
    if (conversation.type == "interaction") {
      return false;
    }
    if (inSupportClient)
      return conversation.isHelpDesk && conversation.queueEntry.isOpenedByMe;
    if (isHelpDesk !== conversation.isHelpDesk)
      return false;
    if (!isHelpDesk)
      return true;
    return (supportEnabled || supportAddMembers) &&
      !conversation.queueEntry.isOpenedByMe;
  }

  function isOpenSession(conversation, isOpenSession) {
    if (!conversation.isHelpDesk)
      return false;
    return !isOpenSession ===
      (conversation.queueEntry.isClosedByAgent || conversation.queueEntry.isAbandoned);
  }

  function isVisible(conversation, visible) {
    return conversation.visible === visible;
  }

  function filter(input, filter, fn) {
    return angular.isUndefined(filter) ?
      input :
      input.filter(function(conversation) {
        return fn(conversation, filter);
      });
  }
  return function(input, visible, helpDesk, openSession) {
    if (angular.isObject(visible)) {
      var object = visible;
      visible = object.visible;
      helpDesk = object.helpDesk;
      openSession = object.openSession;
    }
    input = filter(input, visible, isVisible);
    input = filter(input, helpDesk, isConversationDisplayable);
    input = filter(input, openSession, isOpenSession);
    input.sort(function(conv1, conv2) {
      return conv2.sortIndex - conv1.sortIndex;
    });
    if (angular.isDefined(openSession) && !openSession && closedConversationLimit)
      input = input.slice(0, closedConversationLimit);
    return input;
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.frameSet.js */
angular.module('sn.connect.conversation').filter('frameSet', function() {
  'use strict';
  return function(input) {
    return input.filter(function(conversation) {
      return !conversation.isFrameStateClosed && conversation.visible;
    }).sort(function(conv1, conv2) {
      return conv1.frameOrder - conv2.frameOrder;
    });
  }
});;;