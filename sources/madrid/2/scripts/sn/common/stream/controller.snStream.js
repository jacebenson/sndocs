/*! RESOURCE: /scripts/sn/common/stream/controller.snStream.js */
angular.module("sn.common.stream").controller("snStream", function($rootScope, $scope, $attrs, $http, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, $sce, snMention, i18n, getTemplateUrl) {
      "use strict";
      if (angular.isDefined($attrs.isInline)) {
        bindInlineStreamAttributes();
      }

      function bindInlineStreamAttributes() {
        var streamAttributes = {};
        if ($attrs.table) {
          streamAttributes.table = $attrs.table;
        }
        if ($attrs.query) {
          streamAttributes.query = $attrs.query;
        }
        if ($attrs.sysId) {
          streamAttributes.sysId = $attrs.sysId;
        }
        if ($attrs.active) {
          streamAttributes.active = ($attrs.active == "true");
        }
        if ($attrs.template) {
          streamAttributes.template = $attrs.template;
        }
        if ($attrs.preferredInput) {
          streamAttributes.preferredInput = $attrs.preferredInput;
        }
        if ($attrs.useMultipleInputs) {
          streamAttributes.useMultipleInputs = ($attrs.useMultipleInputs == "true");
        }
        if ($attrs.expandEntries) {
          streamAttributes.expandEntries = ($attrs.expandEntries == "true");
        }
        if ($attrs.pageSize) {
          streamAttributes.pageSize = parseInt($attrs.pageSize, 10);
        }
        if ($attrs.truncate) {
          streamAttributes.truncate = ($attrs.truncate == "true");
        }
        if ($attrs.attachments) {
          streamAttributes.attachments = ($attrs.attachments == "true");
        }
        if ($attrs.showCommentsAndWorkNotes) {
          streamAttributes.attachments = ($attrs.showCommentsAndWorkNotes == "true");
        }
        angular.extend($scope, streamAttributes)
      }
      var stream;
      var processor = $attrs.processor || "list_history";
      var interval;
      var FROM_LIST = 'from_list';
      var FROM_FORM = 'from_form';
      var source = $scope.sysId ? FROM_FORM : FROM_LIST;
      var _firstPoll = true;
      var _firstPollTimeout;
      var fieldsInitialized = false;
      var primaryJournalFieldOrder = ["comments", "work_notes"];
      var primaryJournalField = null;
      $scope.defaultShowCommentsAndWorkNotes = ($scope.sysId != null && !angular.isUndefined($scope.sysId) && $scope.sysId.length > 0);
      $scope.canWriteWorkNotes = false;
      $scope.inputTypeValue = "";
      $scope.entryTemplate = getTemplateUrl($attrs.template || "list_stream_entry");
      $scope.isFormStream = $attrs.template === "record_stream_entry.xml";
      $scope.allFields = null;
      $scope.fields = {};
      $scope.fieldColor = "transparent";
      $scope.multipleInputs = $scope.useMultipleInputs;
      $scope.checkbox = {};
      var typing = '{0} is typing',
        viewing = '{0} is viewing',
        entered = '{0} has entered';
      var probablyLeft = '{0} has probably left',
        exited = '{0} has exited',
        offline = '{0} is offline';
      i18n.getMessages(
        [
          typing,
          viewing,
          entered,
          probablyLeft,
          exited,
          offline
        ],
        function(results) {
          typing = results[typing];
          viewing = results[viewing];
          entered = results[entered];
          probablyLeft = results[probablyLeft];
          exited = results[exited];
          offline = results[offline];
        }
      );
      $scope.parsePresence = function(sessionData) {
        var status = sessionData.status;
        var name = sessionData.user_display_name;
        switch (status) {
          case 'typing':
            return i18n.format(typing, name);
          case 'viewing':
            return i18n.format(viewing, name);
          case 'entered':
            return i18n.format(entered, name);
          case 'probably left':
            return i18n.format(probablyLeft, name);
          case 'exited':
            return i18n.format(exited, name);
          case 'offline':
            return i18n.format(offline, name);
          default:
            return '';
        }
      };
      $scope.members = [];
      $scope.members.loading = true;
      var mentionMap = {};
      $scope.selectAtMention = function(item) {
        if (item.termLengthIsZero)
          return (item.name || "") + "\n";
        mentionMap[item.name] = item.sys_id;
        return "@[" + item.name + "]";
      };
      var typingTimer;
      $scope.searchMembersAsync = function(term) {
        $scope.members = [];
        $scope.members.loading = true;
        $timeout.cancel(typingTimer);
        if (term.length === 0) {
          $scope.members = [{
            termLengthIsZero: true
          }];
          $scope.members.loading = false;
        } else {
          typingTimer = $timeout(function() {
            snMention.retrieveMembers($scope.table, $scope.sysId, term).then(function(members) {
              $scope.members = members;
              $scope.members.loading = false;
            }, function() {
              $scope.members = [{
                termLengthIsZero: true
              }];
              $scope.members.loading = false;
            });
          }, 500);
        }
      };
      $scope.expandMentions = function(text) {
        return stream.expandMentions(text, mentionMap)
      };
      $scope.reduceMentions = function(text) {
        if (!text)
          return text;
        var regexMentionParts = /[\w\d\s/\']+/gi;
        text = text.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
          var mentionParts = mention.match(regexMentionParts);
          if (mentionParts.length === 2) {
            var name = mentionParts[1];
            mentionMap[name] = mentionParts[0];
            return "@[" + name + "]";
          }
          return mentionParts;
        });
        return text;
      };
      $scope.parseMentions = function(entry) {
        var regexMentionParts = /[\w\d\s/\']+/gi;
        entry = entry.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
          var mentionParts = mention.match(regexMentionParts);
          if (mentionParts.length === 2) {
            return '<a class="at-mention at-mention-user-' + mentionParts[0] + '">@' + mentionParts[1] + '</a>';
          }
          return mentionParts;
        });
        return entry;
      };
      $scope.parseLinks = function(text) {
        var regexLinks = /@L\[([^|]+?)\|([^\]]*)]/gi;
        return text.replace(regexLinks, "<a href='$1' target='_blank'>$2</a>");
      };
      $scope.trustAsHtml = function(text) {
        return $sce.trustAsHtml(text);
      };
      $scope.parseSpecial = function(text) {
        var parsedText = $scope.parseLinks(text);
        parsedText = $scope.parseMentions(parsedText);
        return $scope.trustAsHtml(parsedText);
      };
      $scope.isHTMLField = function(change) {
        return change.field_type === 'html' || change.field_type === 'translated_html';
      };
      $scope.getFullEntryValue = function(entry, event) {
        event.stopPropagation();
        var index = getEntryIndex(entry);
        var journal = $scope.entries[index].entries.journal[0];
        journal.loading = true;
        $http.get('/api/now/ui/stream_entry/full_entry', {
          params: {
            sysparm_sys_id: journal.sys_id
          }
        }).then(function(response) {
          journal.sanitized_new_value = journal.new_value = response.data.result.replace(/\n/g, '<br/>');
          journal.is_truncated = false;
          journal.loading = false;
          journal.showMore = true;
        });
      };

      function getEntryIndex(entry) {
        for (var i = 0, l = $scope.entries.length; i < l; i++) {
          if (entry === $scope.entries[i]) {
            return i;
          }
        }
      }
      $scope.$watch('active', function(n, o) {
        if (n === o)
          return;
        if ($scope.active)
          startPolling();
        else
          cancelStream();
      });
      $scope.defaultControls = {
          getTitle: function(entry) {
              if (entry && e