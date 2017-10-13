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