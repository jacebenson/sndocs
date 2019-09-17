/*! RESOURCE: /scripts/app.ng_chat/message/js_includes_connect_message.js */
/*! RESOURCE: /scripts/app.ng_chat/message/_module.js */
angular.module("sn.connect.message", ["ng.common", "sn.connect.util", "sn.connect.profile"]);;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snAriaChatMessage.js */
angular.module('sn.connect.message').directive('snAriaChatMessage', function(getTemplateUrl, $templateCache, $interpolate, $sanitize) {
  'use strict';
  var ariaTemplate = $templateCache.get(getTemplateUrl('snAriaChatMessage.xml'));
  return {
    restrict: 'E',
    replace: true,
    template: "<div></div>",
    scope: {
      message: '='
    },
    link: function(scope, element) {
      var node = $interpolate(ariaTemplate)(scope);
      element.html($sanitize(node));
    },
    controller: function($scope) {
      $scope.displayedText = function() {
        if (!$scope.message.isMessageShowing) {
          return "";
        }
        return $scope.message.displayText;
      };
      $scope.attachmentMessage = function() {
        if (!$scope.message.attachments || !$scope.message.attachments.length) {
          return "";
        }
        var output = "";
        for (var i = 0, len = $scope.message.attachments.length; i < len; i++) {
          var attachment = $scope.message.attachments[i];
          output += i > 0 ? ' . ' : '';
          output += attachment.fileName + ', ' + attachment.byteDisplay;
        }
        return output;
      }
    }
  }
});;
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
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snMessageBatch.js */
angular.module('sn.connect.message').directive('snMessageBatch', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMessageBatch.xml'),
    scope: {
      batch: '=',
      isGroupConversation: '=',
      disableAvatarPopovers: '=?'
    },
    controller: function($scope, showAgentAvatar, inSupportClient) {
      $scope.isSystemMessage = function() {
        return $scope.batch.isSystemMessage;
      };
      $scope.inSupportClient = inSupportClient;
      $scope.isQueueAvatarShowing = function() {
        return (inSupportClient && !showAgentAvatar && $scope.batch.isFromPeer) || $scope.isFromQueue();
      };
      $scope.isFromQueue = function() {
        return $scope.batch.profileData && $scope.batch.profileData.table === 'chat_queue_entry';
      };
      $scope.isTextShowing = function(message) {
        return message.isMessageShowing && !message.uploadingFiles;
      };
      if (!$scope.batch.profileData) {
        var unwatch = $scope.$watch('batch.profileData', function(newVal) {
          if (newVal) {
            $scope.profileData = newVal;
            unwatch();
          }
        })
      } else {
        $scope.profileData = $scope.batch.profileData;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snUploadAttachmentList.js */
angular.module('sn.connect.message').directive('snUploadAttachmentList', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("snUploadAttachmentList.xml"),
    scope: {
      uploadingFiles: "="
    },
    controller: function($scope) {
      $scope.isFileNameShowing = function(file) {
        return file.state !== 'error';
      };
      $scope.isProgressBarShowing = function(file) {
        return file.state === 'progress';
      };
      $scope.getProgressStyle = function(file) {
        return {
          'width': file.progress + '%'
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/factory.Message.js */
angular.module('sn.connect.message').factory("messageFactory", function(
  liveProfileID, profiles, liveLinkFactory, attachmentFactory, resourcePersister) {
  "use strict";

  function buildMessageFromJSONObject(jsonObject) {
    jsonObject = jsonObject || {};
    var mentions = jsonObject.mentions || [];
    var links = [];
    var attachments = [];
    var isSystem = jsonObject.created_by === "system";
    angular.forEach((jsonObject.links || []), function(rawLink) {
      var link = liveLinkFactory.fromObject(rawLink, !isSystem);
      resourcePersister.addLink(jsonObject.group, link);
      this.push(link);
    }, links);
    angular.forEach((jsonObject.attachments || []), function(rawAttachment) {
      var attachment = attachmentFactory.fromObject(rawAttachment);
      resourcePersister.addAttachment(jsonObject.group, attachment);
      this.push(attachment)
    }, attachments);
    var text = jsonObject.formatted_message;
    var escapedText = htmlEscape(text);
    var displayText = replaceText(escapedText,
        "<a class='at-mention at-mention-user-$1'>@$2</a>",
        linkFormatter)
      .replace(/\r/g, "")
      .replace(/\n/g, "<br>");
    var cleanText = replaceText(escapedText, "@$2", "$2");

    function linkFormatter(wholeMatch, urlOrSysID, linkText) {
      var isSysID = urlOrSysID.match(/^[0-9A-F]{32}$/i);
      var matchedLink;
      var url;
      if (isSysID) {
        matchedLink = links.filter(function(link) {
          return link.sysID === urlOrSysID;
        })[0];
        url = matchedLink && matchedLink.url;
      } else {
        url = urlOrSysID;
        matchedLink = links.filter(function(link) {
          var escapedUrl = htmlEscape(link.url);
          return link.url === url || escapedUrl === url || htmlEscape(escapedUrl) === url;
        })[0];
      }
      if (matchedLink) {
        try {
          return matchedLink.aTag(linkText);
        } catch (unused) {}
      }
      return linkText;
    }
    return {
      sysID: jsonObject.sys_id,
      text: text,
      createdOn: jsonObject.created_on,
      conversationID: jsonObject.group,
      profile: jsonObject.profile,
      timestamp: jsonObject.timestamp,
      reflectedField: jsonObject.reflected_field,
      hasLinks: links.length > 0,
      id: jsonObject.id,
      pending: false,
      get cleanText() {
        return cleanText;
      },
      get profileData() {
        if (this.profile)
          return profiles.get(this.profile);
      },
      get isSystemMessage() {
        return isSystem;
      },
      get isFromPeer() {
        return this.profile !== liveProfileID;
      },
      get attachments() {
        return attachments;
      },
      get links() {
        return links;
      },
      get mentions() {
        return mentions;
      },
      get isMessageShowing() {
        if (!this._isMessageShowing)
          this._isMessageShowing = !shouldHide(this);
        return this._isMessageShowing;
      },
      get hasSystemLink() {
        return this.isSystemMessage && links[0];
      },
      get displayText() {
        return displayText;
      }
    }
  }

  function shouldHide(message) {
    if (onlyAttachmentMessage(message))
      return true;
    var links = message.links;
    return (links.length === 1) &&
      links[0].isHideable &&
      (replaceText(message.text, "X", "X").trim().length === 1);
  }

  function onlyAttachmentMessage(message) {
    var attachments = message.attachments;
    if (attachments.length === 0)
      return false;
    var text = message.text;
    message.attachments.forEach(function(attachment) {
      text = text.replace("File: " + attachment.fileName, "");
    });
    return text.trim().length === 0;
  }

  function replaceText(text, mentions, links) {
    if (!text)
      return "";
    return text
      .replace(/@M\[([^|]+?)\|([^\]]+?)]/gi, mentions)
      .replace(/@\[([^:\]]+?):([^\]]+)]/g, mentions)
      .replace(/@L\[([^|]+?)\|([^\]]*)]/gi, links);
  }

  function newPendingAttachmentMessage(conversation, files) {
    var message = newPendingMessage(conversation, "");
    message.uploadingFiles = files;
    return message;
  }

  function newPendingMessage(conversation, text, journalType) {
    var timestamp = new Date().getTime();
    var message = buildMessageFromJSONObject({
      sys_id: timestamp + Math.random(),
      profile: liveProfileID,
      group: conversation.sysID,
      created_on: getLocalCreatedOn(timestamp),
      formatted_message: text,
      reflected_field: journalType || "comments",
      timestamp: timestamp
    });
    message.pending = true;
    return message;
  }

  function getLocalCreatedOn(timestamp) {
    return new Date(timestamp)
      .toISOString()
      .replace(/(.*?)T(.*?)[.].*/g, "$1 $2");
  }

  function htmlEscape(str) {
    return angular.element("<textarea/>").text(str).html();
  }
  return {
    fromObject: buildMessageFromJSONObject,
    newPendingMessage: newPendingMessage,
    newPendingAttachmentMessage: newPendingAttachmentMessage
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.messageBatcher.js */
angular.module('sn.connect.message').service("messageBatcherService", function(i18n, $filter, liveProfileID) {
  "use strict";
  var yesterday = "Yesterday";
  var today = "Today";
  i18n.getMessages([yesterday, today], function(results) {
    yesterday = results[yesterday];
    today = results[today];
  });
  var MINIMUM_TIME = 20 * 60 * 1000;

  function getMonthCount(date) {
    return (date.getFullYear() * 12 + date.getMonth());
  }

  function getDayCount(date) {
    return (date.getFullYear() * 365 + date.getMonth() * 30 + date.getDate());
  }

  function MessageBatch(messages, isLastBatchFn) {
    return {
      messages: messages,
      get firstMessage() {
        return this.messages[0];
      },
      get lastMessage() {
        return this.messages[this.messages.length - 1]
      },
      get batchID() {
        return this.firstMessage.sysID + "" + this.lastMessage.sysID;
      },
      get isFromPeer() {
        return !!this.firstMessage.isFromPeer;
      },
      get isSystemMessage() {
        return !!this.firstMessage.isSystemMessage;
      },
      get profileData() {
        return this.firstMessage.profileData;
      },
      get createdOn() {
        return this.lastMessage.createdOn;
      },
      get timestamp() {
        return this.lastMessage.timestamp;
      },
      get isLastBatch() {
        return isLastBatchFn(this);
      },
      get systemMessageLink() {
        if (this.lastMessage.hasSystemLink)
          return this.lastMessage.links[0];
      },
      getSeparator: function() {
        var timestamp = new Date(this.lastMessage.timestamp);
        var now = new Date();
        var hasYear = now.getFullYear() - timestamp.getFullYear() > 0;
        if (hasYear && getMonthCount(now) - getMonthCount(timestamp) > 12)
          return $filter('date')(timestamp, 'yyyy');
        var hasMonth = now.getMonth() - timestamp.getMonth() > 0;
        if ((hasMonth || hasYear) && getDayCount(now) - getDayCount(timestamp) > 30)
          return $filter('date')(timestamp, 'MMMM yyyy');
        var hasDay = now.getDate() - timestamp.getDate() > 0;
        if (hasMonth || hasYear || hasDay) {
          if (now.getDate() - timestamp.getDate() === 1)
            return yesterday;
          return $filter('date')(timestamp, 'longDate');
        }
        return today;
      }
    }
  }
  var messageBatchers = {};
  var ariaMessages = {};

  function compare(message1, message2) {
    if (message1.id && message2.id)
      return message1.id < message2.id ? -1 : 1;
    return message1.timestamp - message2.timestamp;
  }

  function MessageBatcher() {
    var messageBatchMap = {};
    var batches = [];

    function isLastBatchFn(batch) {
      return lastBatch() === batch;
    }

    function lastBatch() {
      return batches[batches.length - 1];
    }

    function add(message) {
      if (batches.length == 0) {
        insertNewBatch(0, [message]);
        return true;
      }
      var batch = messageBatchMap[message.sysID];
      if (batch) {
        update(batch, message);
        return false;
      }
      for (var i = 0; i < batches.length; ++i) {
        batch = batches[i];
        var insert = insertAt(batch, message);
        if (insert === "after")
          continue;
        if (insert === "before") {
          insertNewBatch(i, [message]);
          return true;
        }
        var isLast = (insert === batch.messages.length);
        if (isBatchable(batch, message)) {
          if (isLast) {
            var next = batches[i + 1];
            if (next && compare(message, next.firstMessage) > 0)
              continue;
          }
          batch.messages.splice(insert, 0, message);
          messageBatchMap[message.sysID] = batch;
          coalesce(i);
          return true;
        }
        if (insert === 0) {
          insertNewBatch(i, [message]);
          return true;
        }
        if (!isLast) {
          split(i, insert);
          insertNewBatch(i + 1, [message]);
          return true;
        }
      }
      insertNewBatch(batches.length, [message]);
      return true;
    }

    function update(batch, message) {
      if (message.isPlaceholder)
        return;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          batch.messages[i] = message;
          break;
        }
      }
    }

    function insertAt(batch, message) {
      if (!isInRange(message, batch.firstMessage))
        return "before";
      if (!isInRange(batch.lastMessage, message))
        return "after";
      var messages = batch.messages;
      for (var i = 0; i < messages.length; ++i) {
        if (compare(message, messages[i]) < 0)
          return i;
      }
      return messages.length;
    }

    function isBatchable(batch, message) {
      if (message.isSystemMessage)
        return false;
      var first = batch.firstMessage;
      return !first.isSystemMessage &&
        (message.profile === first.profile);
    }

    function mapMessageToBatch(batch, messages) {
      messages.forEach(function(message) {
        messageBatchMap[message.sysID] = batch;
      });
    }

    function coalesce(batchIndex) {
      var curr = batches[batchIndex];
      var remove = batchIndex + 1;
      var next = batches[remove];
      if (!next)
        return;
      if (!isBatchable(curr, next.firstMessage))
        return;
      if (!isInRange(curr.lastMessage, next.firstMessage))
        return;
      batches.splice(remove, 1);
      curr.messages = curr.messages.concat(next.messages);
      mapMessageToBatch(curr, next.messages);
    }

    function split(batchIndex, messageIndex) {
      var batch = batches[batchIndex];
      insertNewBatch(batchIndex + 1, batch.messages.slice(messageIndex));
      batch.messages = batch.messages.slice(0, messageIndex);
    }

    function insertNewBatch(batchIndex, messages) {
      var batch = new MessageBatch(messages, isLastBatchFn);
      batches.splice(batchIndex, 0, batch);
      mapMessageToBatch(batch, messages);
    }

    function isInRange(message1, message2) {
      return message1.timestamp + MINIMUM_TIME >= message2.timestamp;
    }

    function removeFromBatch(batch, messageIndex) {
      var messages = batch.messages;
      messages.splice(messageIndex, 1);
      var batchIndex = batches.indexOf(batch);
      var length = messages.length;
      if (length === 0) {
        batches.splice(batchIndex, 1);
        return;
      }
      if (messageIndex === length)
        return;
      var prev = messages[messageIndex - 1];
      if (!prev)
        return;
      var curr = messages[messageIndex];
      if (isInRange(prev, curr))
        return;
      split(batchIndex, messageIndex);
    }

    function remove(message) {
      var batch = messageBatchMap[message.sysID];
      if (!batch)
        return false;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          removeFromBatch(batch, i);
          break;
        }
      }
      delete messageBatchMap[message.sysID];
      return true;
    }

    function isSeparator(index) {
      var currTimestamp = new Date(batches[index].timestamp);
      if (index === 0) {
        var now = new Date();
        return getDayCount(now) - getDayCount(currTimestamp) > 0;
      }
      var prevTimestamp = new Date(batches[index - 1].timestamp);
      var hasYear = currTimestamp.getFullYear() - prevTimestamp.getFullYear() > 0;
      var hasMonth = currTimestamp.getMonth() - prevTimestamp.getMonth() > 0;
      var hasDay = currTimestamp.getDate() - prevTimestamp.getDate() > 0;
      return hasYear || hasMonth || hasDay;
    }
    return {
      get batches() {
        return batches;
      },
      get lastBatch() {
        return lastBatch();
      },
      isSeparator: isSeparator,
      addMessage: add,
      removeMessage: remove
    }
  }

  function add(message, results) {
    if (!message.conversationID)
      return results;
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      batcher = messageBatchers[message.conversationID] = new MessageBatcher();
    var added = batcher.addMessage(message);
    if (added) {
      results.added.push(message);
      if (message.profile !== liveProfileID || message.isSystemMessage) {
        ariaMessages[message.conversationID] = ariaMessages[message.conversationID] || [];
        ariaMessages[message.conversationID].push(message);
        ariaMessages[message.conversationID].sort(compare);
      }
    } else {
      results.existing.push(message);
    }
    return results;
  }

  function remove(message, results) {
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      return results;
    var removed = batcher.removeMessage(message);
    if (removed)
      results.push(message);
    return results;
  }

  function callActionFn(messages, isPlaceholder, results, fn) {
    if (angular.isArray(messages)) {
      messages
        .sort(compare)
        .forEach(function(message) {
          message.isPlaceholder = isPlaceholder;
          fn(message, results);
        });
      return results;
    }
    messages.isPlaceholder = isPlaceholder;
    return fn(messages, results);
  }
  return {
    addMessages: function(messages, doNotUpdate) {
      return callActionFn(messages, doNotUpdate, {
        added: [],
        existing: []
      }, add);
    },
    removeMessages: function(messages) {
      return callActionFn(messages, undefined, [], remove);
    },
    getBatcher: function(conversationID) {
      var batcher = messageBatchers[conversationID];
      if (!batcher)
        batcher = messageBatchers[conversationID] = new MessageBatcher();
      return batcher;
    },
    removeMessageBatcher: function(conversationID) {
      delete messageBatchers[conversationID];
      delete ariaMessages[conversationID];
    },
    clearAriaMessages: function(conversationID) {
      ariaMessages[conversationID] = [];
    },
    getAriaMessages: function(conversationID, count) {
      if (angular.isUndefined(count))
        count = 1;
      count = -Math.abs(count);
      ariaMessages[conversationID] = ariaMessages[conversationID] || [];
      return ariaMessages[conversationID].slice(count);
    },
    getLastMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var lastBatch = batcher.lastBatch;
      return lastBatch && lastBatch.lastMessage;
    },
    getFirstMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var firstBatch = batcher.batches[0];
      return firstBatch && firstBatch.firstMessage;
    },
    _wipeOut_: function() {
      messageBatchers = {};
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.unreadCount.js */
angular.module('sn.connect.message').service('unreadCountService', function(conversationPersister, messageBatcherService) {
  'use strict';
  var unreadCountObjects = {};

  function setCount(conversationID, lastViewed, count) {
    if (!conversationID)
      return;
    if (angular.isUndefined(lastViewed))
      return;
    unreadCountObjects[conversationID] = {
      timestamp: lastViewed,
      count: count
    }
  }

  function resetCount(conversationID, doNotPersist) {
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var lastMessageTime = (batches.length > 0) ?
      batches[batches.length - 1].lastMessage.timestamp :
      new Date().getTime();
    var old = unreadCountObjects[conversationID];
    unreadCountObjects[conversationID] = {
      timestamp: lastMessageTime
    };
    if (doNotPersist)
      return;
    if (old && (old.timestamp === lastMessageTime))
      return;
    conversationPersister.lastViewed(conversationID, lastMessageTime);
  }

  function getCount(conversationID) {
    var unreadCountObject = unreadCountObjects[conversationID];
    if (!unreadCountObject)
      return 0;
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var count = 0;
    batches.forEach(function(batch) {
      if (count > 0) {
        count += batch.messages.length;
        return;
      }
      if (unreadCountObject.timestamp < batch.lastMessage.timestamp) {
        var messages = batch.messages;
        for (var i = 0; i < messages.length; ++i) {
          if (unreadCountObject.timestamp < messages[i].timestamp) {
            count = messages.length - i;
            break;
          }
        }
      }
    });
    return unreadCountObject.count ?
      Math.max(count, unreadCountObject.count) :
      count;
  }

  function getTimestamp(conversationID) {
    var unreadCounts = unreadCountObjects[conversationID];
    return unreadCounts ?
      unreadCounts.timestamp :
      0;
  }
  return {
    set: setCount,
    get: getCount,
    reset: resetCount,
    getLastTimestamp: getTimestamp
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.messages.js */
angular.module('sn.connect.message').value('CONNECT_CONTEXT', Date.now() + "" + Math.random() * Math.pow(10, 19));
angular.module('sn.connect.message').service("messageService", function(
  $q, $rootScope, snHttp, amb, userID, liveProfileID, messageFactory, unreadCountService, messageBatcherService,
  uploadAttachmentService, CONNECT_CONTEXT, snNotification, $timeout, isLoggedIn, sessionID) {
  "use strict";
  var CONVERSATIONS_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var context = CONNECT_CONTEXT;
  var allHistoryLoaded = {};
  var watches = [];
  var channelId = isLoggedIn ? userID : sessionID;
  amb.getChannel("/connect/message/" + channelId).subscribe(function(response) {
    addRawMessage(response.data);
  });
  amb.connect();

  function retrieveMessages(conversation, time) {
    if (!conversation)
      return $q.when([]);
    if (!conversation.sysID)
      return $q.when([]);
    if (conversation.isPending)
      return $q.when([]);
    if (time && allHistoryLoaded[conversation.sysID])
      return $q.when([]);
    var conversationID = conversation.sysID;
    var url = CONVERSATIONS_URL + conversationID + "/messages";
    if (time)
      url += "?before=" + time;
    return snHttp.get(url).then(function(response) {
      var processedMessages = [];
      angular.forEach(response.data.result, function(messageData) {
        processedMessages.push(messageFactory.fromObject(messageData));
      });
      if (time && processedMessages.length === 0)
        allHistoryLoaded[conversationID] = true;
      conversation.restricted = conversation.restricted || false;
      var added = messageBatcherService.addMessages(processedMessages).added;
      $rootScope.$broadcast('sn.TimeAgo.tick');
      return added;
    }, function(response) {
      if (response.status === 403)
        conversation.restricted = true;
      return $q.reject(response)
    });
  }

  function addRawMessage(messageData) {
    var message = messageFactory.fromObject(messageData);
    var isOldMessage = unreadCountService.getLastTimestamp(message.conversationID) > message.timestamp;
    $rootScope.$apply(function() {
      messageBatcherService.addMessages(message);
      $timeout(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 0, false);
    });
    if (isOldMessage)
      return message;
    if (message.profileID === liveProfileID)
      return message;
    angular.forEach(watches, function(watch) {
      watch(message);
    });
    return message;
  }

  function send(message) {
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return snHttp.post(CONVERSATIONS_URL + message.conversationID + "/messages", {
      group: message.conversationID,
      message: message.text,
      reflected_field: message.reflectedField || "comments",
      attachments: message.attachmentSysIDs,
      context: context
    }).then(function(response) {
      var newMessage = messageFactory.fromObject(response.data.result);
      $rootScope.$evalAsync(function() {
        messageBatcherService.removeMessages(message);
        messageBatcherService.addMessages(newMessage);
        unreadCountService.reset(message.conversationID);
      });
      return newMessage;
    }, function(response) {
      if (response.status === 403)
        snNotification.show("error", response.data.result);
      return $q.reject(response)
    });
  }

  function uploadAttachments(conversation, fileList) {
    if (fileList.length === 0)
      return $q.when({});
    var files = [];
    for (var i = 0; i < fileList.length; ++i)
      files.push(fileList[i]);
    var message = messageFactory.newPendingAttachmentMessage(conversation, files);
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return uploadAttachmentService.attachFiles(conversation, files, {
      error: function(file) {
        $rootScope.$broadcast("connect.conversation.attachment_errors", {
          conversation: conversation,
          errors: [file.name + ": " + file.error]
        });
      }
    }).then(function(files) {
      var array = files.filter(function(file) {
        return !file.error;
      });
      if (array.length === 0) {
        messageBatcherService.removeMessages(message);
        return;
      }
      message.attachmentSysIDs = array.map(function(file) {
        return file.sysID;
      });
      var text = "";
      array.forEach(function(file) {
        text += "File: " + file.name + "\n";
      });
      message.text = text.trim();
      return message;
    });
  }
  return {
    retrieveMessages: retrieveMessages,
    uploadAttachments: uploadAttachments,
    send: send,
    watch: function(callback) {
      watches.push(callback)
    }
  };
});;;