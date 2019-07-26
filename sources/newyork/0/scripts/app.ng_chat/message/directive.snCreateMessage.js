/*! RESOURCE: /scripts/app.ng_chat/message/directive.snCreateMessage.js */
angular.module('sn.connect.message').directive('snCreateMessage', function(
  $timeout, $rootScope, getTemplateUrl, i18n, messageFactory, messageService, activeConversation, conversations,
  snTypingTracker, snNotification, inFrameSet, isLoggedIn) {
  "use strict";
  var i18nText;
  i18n.getMessages([
    'Worknote',
    'Comment (customer visible)',
    'Message',
    'Attachments cannot be uploaded',
    'Upload attachment'
  ], function(results) {
    i18nText = results;
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snCreateMessage.xml"),
    replace: true,
    scope: {
      conversation: "=",
      autofocusOnInput: "=?"
    },
    link: function(scope, element) {
      var lastTypeaheadSuggestion;
      var preventSubmitAfterMentioSelection;
      var input = element.find('.new-message');
      if (navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)) {
        scope.autofocusOnInput = false;
      }
      if (scope.autofocusOnInput === undefined)
        scope.autofocusOnInput = true;
      input.typeahead({
        hint: true,
        highlight: false,
        minLength: 1
      }, {
        name: 'commands',
        displayKey: 'hint',
        source: function(q, cb) {
          if (scope.conversation.pendingMessage && scope.conversation.pendingMessage.indexOf("/") === 0)
            cb(scope.conversation.chatActions.getCommands(q));
          else
            cb([]);
        },
        templates: {
          suggestion: function(command) {
            return '<div class="command-row"><div class="col-sm-4 command-key">' + command.shortcut + '</div><div class="col-sm-8 command-description">' + command.description + '</div></div>';
          }
        }
      });
      input[0].spellcheck = true;
      var ttTypeahead = input.data("ttTypeahead");
      ttTypeahead.input.off("blurred");
      ttTypeahead.input.$hint.css('display', 'none');
      input.on("typeahead:render", function(event, suggestion) {
        lastTypeaheadSuggestion = suggestion;
      });
      input.on("typeahead:cursorchange", function(event, suggestion) {
        lastTypeaheadSuggestion = suggestion;
      });
      ttTypeahead.input._managePreventDefault = function managePreventDefaultModified(keyName, $e) {
        var preventDefault = false;
        if (keyName === "up" || keyName === "down")
          preventDefault = !ttTypeahead.menu._allDatasetsEmpty();
        if (preventDefault)
          $e.preventDefault();
      };
      input.on("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey)
          event.preventDefault();
        var openMenus = angular.element("mentio-menu").filter(function(index, element) {
          return element.style.display === "block";
        });
        preventSubmitAfterMentioSelection = openMenus.length > 0;
        if (event.keyCode === 27 && !preventSubmitAfterMentioSelection) {
          if (!scope.conversation.isPending)
            scope.$emit("connect.floatingConversationEscape");
          else
            scope.$emit("connect.message_control_key", "escape");
        }
        if (event.keyCode === 13 && !event.shiftKey && !preventSubmitAfterMentioSelection) {
          input.trigger("enterkey-pressed");
          if (!scope.conversation.pendingMessage)
            return;
          if (!handleSlashCommand()) {
            addMessage();
            if (activeConversation.pendingConversation && activeConversation.pendingConversation.sysID === scope.conversation.sysID) {
              conversations.get(activeConversation.pendingConversation.sysID).then(function(conversation) {
                if ((inFrameSet && conversation.isFrameStateOpen) || (!inFrameSet && conversation.visible)) {
                  $rootScope.$broadcast("connect.new_conversation.cancelled");
                }
              });
            }
          }
          closeTypeahead();
        } else {
          snTypingTracker.typing()
        }
      });

      function handleSlashCommand() {
        var pendingMessage = scope.conversation.pendingMessage;
        if (pendingMessage[0] !== "/")
          return false;
        if (lastTypeaheadSuggestion) {
          var lastSuggestionIsValid = lastTypeaheadSuggestion.canRun(pendingMessage);
          $timeout(function() {
            if (lastSuggestionIsValid) {
              scope.conversation.pendingMessage = lastTypeaheadSuggestion.shortcut + " ";
              input.triggerHandler("blur")
            }
            lastTypeaheadSuggestion = void(0);
          });
          return true;
        }
        if (scope.conversation.chatActions.hasMatchingAction(pendingMessage)) {
          if (scope.conversation.chatActions.hasRequiredArguments(pendingMessage)) {
            scope.conversation.chatActions.run(pendingMessage);
            scope.conversation.pendingMessage = "";
            scope.$apply();
          } else {
            scope.$emit("connect.chat_action.require_options", scope.conversation);
          }
          return true;
        }
        return false;
      }

      function closeTypeahead() {
        ttTypeahead.input.query = "";
        ttTypeahead.menu.empty();
        ttTypeahead.input.resetInputValue();
        ttTypeahead.input.trigger("blurred");
        input.typeahead('close');
      }

      function addMessage() {
        $rootScope.$broadcast("connect.auto_scroll.jump_to_bottom");
        snTypingTracker.cancelTyping();
        var newMessageText = scope.conversation.pendingMessage;
        if (!newMessageText)
          return;
        var message = messageFactory.newPendingMessage(scope.conversation, newMessageText, scope.messageType);
        scope.sendMessage(message);
        scope.conversation.pendingMessage = "";
      }
      var waitForConversationCreation = false;
      scope.sendMessage = function(message) {
        if (!message) {
          return;
        }
        if (!activeConversation.pendingConversation || (message.conversationID === activeConversation.sysID)) {
          messageService.send(message);
          return;
        }
        var conversation = activeConversation.pendingConversation;
        if (!conversation.isPending) {
          message.conversationID = conversation.sysID;
          messageService.send(message);
          done(conversation, false);
          return;
        }
        if (waitForConversationCreation)
          return;
        waitForConversationCreation = true;
        var newConversation = conversations.newConversation;
        if (newConversation.pendingRecipients.length === 0)
          return;
        var recipients = newConversation.pendingRecipients;
        var groupName = newConversation.getGroupName();
        conversations.beginNewConversation(groupName, recipients, message)
          .then(function(conversation) {
            waitForConversationCreation = false;
            done(conversation, true);
          });
      };

      function done(conversation, isNew) {
        activeConversation.conversation = conversation;
        $rootScope.$broadcast("connect.new_conversation.complete", conversation, isNew);
        $rootScope.$broadcast("connect.focus", conversation);
      }
      input.on("blur", function() {
        input.val(scope.conversation.pendingMessage);
      });
      scope.$on("connect.message.focus", function(event, conversation) {
        if (inFrameSet) {
          if (!conversation)
            return;
          if (!scope.conversation)
            return;
          if (conversation.sysID !== scope.conversation.sysID)
            return;
          if (conversation !== scope.conversation &&
            scope.conversation.isPending) {
            return;
          }
        }
        focus();
      });
      scope.$on("connect.message.focus.type", function(event, newInputType) {
        if (newInputType !== "chat")
          return;
        focus();
      });

      function focus() {
        if (window.getSelection().toString())
          return;
        $timeout(function() {
          input.focus();
        }, 0, false);
      }
      scope.focus = focus;
      scope.$on("connect.attachment_dialog.open", function(e, sysID) {
        if (sysID !== scope.conversation.sysID)
          return;
        $timeout(function() {
          element.find('.message-attach-file').click();
        }, 0, false);
      });
      if (element.find(".document-message-type .dropup").hideFix)
        element.find(".document-message-type .dropup").hideFix();
      $timeout(focus, 0, false);
    },
    controller: function($scope, liveProfileID, messageService, messageFactory, uploadAttachmentService,
      snConnectMention, inSupportClient) {
      $scope.members = [];
      $scope.members.loading = false;
      $scope.searchMembers = function(term) {
        if ($scope.conversation.isDirectMessage) {
          $scope.members = [];
        } else {
          if (!$scope.conversation.document || !$scope.conversation.table)
            return snConnectMention.retrieveMembers($scope.conversation, term).then(function(members) {
              $scope.members = members;
            });
          $scope.members.loading = true;
          if (term.length === 0) {
            $scope.members = [{
              termLengthIsZero: true
            }];
            $scope.members.loading = false;
          } else {
            snConnectMention.retrieveMembers($scope.conversation, term).then(function(members) {
              $scope.members = members;
              $scope.members.loading = false;
            });
          }
        }
      };
      $scope.selectAtMention = function(item) {
        if (item.termLengthIsZero)
          return item.name;
        return "@[" + item.name + "]";
      };
      $scope.openAttachFileDialog = function($event) {
        if ($scope.isAttachmentDisabled())
          return;
        if ($scope.conversation.amMember || $scope.conversation.isPending)
          uploadAttachmentService.openFileSelector.apply(this, arguments);
      };
      $scope.$on("connect.drop.files", function(event, files, conversationID) {
        var isDropable = $scope.conversation.isPending ?
          !$scope.conversation.isPendingNoRecipients :
          conversationID === $scope.conversation.sysID;
        if (isDropable)
          $scope.sendFiles(files);
      });
      $scope.sendFiles = function(files) {
        if ($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferringToMe) {
          $scope.$broadcast('dialog.attachment-transfer.show');
          return;
        }
        if ($scope.isWorknote()) {
          $scope.okAttachmentsAsComment = function() {
            attachFiles(files);
          };
          $scope.$broadcast('dialog.attachment-work-notes.show');
          return;
        }
        attachFiles(files);
      };

      function attachFiles(files) {
        $rootScope.$broadcast("connect.auto_scroll.scroll_to_bottom");
        messageService.uploadAttachments($scope.conversation, files).then(function(message) {
          return $scope.sendMessage(message);
        }).then(function() {
          $timeout(function() {
            if (activeConversation.conversation.sysID === $scope.conversation.sysID)
              $scope.focus();
          }, 0, false);
        });
      }
      $scope.isAttachmentDisabled = function() {
        return $scope.isWorknote() ||
          ($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferringToMe) || !isLoggedIn;
      };
      $scope.getAttachmentTitle = function() {
        return $scope.isAttachmentDisabled() ?
          i18nText['Attachments cannot be uploaded'] :
          i18nText['Upload attachment'];
      };
      $scope.$watch("conversation.sysID", function() {
        initializeMessageType();
      });
      $scope.$watch('conversation.queueEntry.sysID', function() {
        initializeMessageType();
      });
      $scope.setAsWorkNote = function() {
        $scope.messageType = "work_notes";
      };
      $scope.setAsComment = function() {
        $scope.messageType = "comments";
      };
      $scope.isWorknote = function() {
        return $scope.messageType === "work_notes";
      };

      function isComment() {
        return $scope.messageType === 'comments';
      }
      $scope.isDocumentGroup = function() {
        return $scope.conversation.isDocumentGroup && !inSupportClient;
      };
      $scope.isMessageTypeVisible = function() {
        return $scope.isDocumentGroup() && !hasPendingTransferToMe() && $scope.conversation.canSaveWorkNotes && $scope.conversation.canSaveComments;
      };
      $scope.isEndChatVisible = function() {
        return $scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isAssignedToMe;
      };

      function hasPendingTransferToMe() {
        return $scope.conversation.isHelpDesk &&
          $scope.conversation.queueEntry.isTransferringToMe &&
          $scope.conversation.queueEntry.isTransferPending;
      }
      $scope.placeholderText = function() {
        if ($scope.isDocumentGroup() && $scope.conversation.canSaveWorkNotes && $scope.conversation.canSaveComments) {
          if (isComment())
            return i18nText['Comment (customer visible)'];
          if ($scope.isWorknote())
            return i18nText['Worknote'];
        }
        return i18nText['Message'];
      };

      function initializeMessageType() {
        if (hasPendingTransferToMe()) {
          $scope.setAsWorkNote();
          return;
        }
        if ($scope.isDocumentGroup() &&
          !$scope.conversation.isHelpDesk &&
          $scope.conversation.table !== "vtb_board" &&
          $scope.conversation.canSaveWorkNotes) {
          $scope.setAsWorkNote();
          return;
        }
        if ($scope.isDocumentGroup() &&
          !$scope.conversation.isHelpDesk &&
          $scope.conversation.table !== "vtb_board" &&
          $scope.conversation.canSaveComments) {
          $scope.setAsComment();
          return;
        }
        if ($scope.conversation.isDirectMessage || $scope.conversation.isGroup) {
          $scope.messageType = undefined;
          return;
        }
      }
      $scope.closeSupportConversation = function() {
        conversations.closeSupport($scope.conversation.sysID, false);
      };

      function addLinkMessage(link) {
        $scope.sendMessage(messageFactory.newPendingMessage($scope.conversation, link));
      }
      $scope.$on("conversation.resource.add", function(event, data) {
        addLinkMessage(data.link);
      });
      $scope.$on("connect.drop", function(event, data, conversationID) {
        if (conversationID !== $scope.conversation.sysID && !$scope.conversation.isPending)
          return;
        var link;
        if (data.type === "document") {
          link = data.href;
        } else if (data.type === "record") {
          link = data.payload.url;
        } else if (data.type === "link") {
          link = data.payload;
        } else if (data.icon && data.icon === "form" && data.url) {
          link = data.url;
        } else {
          return;
        }
        addLinkMessage(link);
      });
      $scope.openDropup = function($event) {
        $event.stopPropagation();
        angular.element($event.target)
          .siblings(".dropdown-menu")
          .dropdown("toggle");
      };
    }
  };
});;