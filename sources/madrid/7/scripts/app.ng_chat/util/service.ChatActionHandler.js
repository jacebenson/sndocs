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