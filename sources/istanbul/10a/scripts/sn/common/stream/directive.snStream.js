/*! RESOURCE: /scripts/sn/common/stream/directive.snStream.js */
angular.module("sn.common.stream").directive("snStream", function(getTemplateUrl, $http, $sce, $sanitize) {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      table: "=",
      query: "=?",
      sysId: "=?",
      active: "=",
      controls: "=?",
      showCommentsAndWorkNotes: "=?",
      previousActivity: "=?",
      sessions: "=",
      attachments: "=",
      board: "=",
      formJournalFields: "=",
      useMultipleInputs: "=?",
      preferredInput: "=",
      labels: "=",
      subStream: "=",
      expandEntries: "=",
      scaleAnimatedGifs: "=",
      scaleImages: "=",
      pageSize: "=",
      maxEntries: "@"
    },
    templateUrl: getTemplateUrl("ng_activity_stream.xml"),
    controller: function($scope, $attrs, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, snMention, i18n) {
      var stream;
      var processor = $attrs.processor || "list_history";
      var interval;
      var FROM_LIST = 'from_list';
      var FROM_FORM = 'from_form';
      var source = $scope.sysId ? FROM_FORM : FROM_LIST;
      var amb = false;
      var _firstPoll = true;
      var _firstPollTimeout;
      var primaryJournalFieldOrder = ["comments", "work_notes"];
      var primaryJournalField = null;
      $scope.defaultShowCommentsAndWorkNotes = ($scope.sysId != null && !angular.isUndefined($scope.sysId) && $scope.sysId.length > 0);
      $scope.canWriteWorkNotes = false;
      $scope.inputTypeValue = "";
      $scope.entryTemplate = getTemplateUrl($attrs.template || "list_stream_entry");
      $scope.isFormStream = $attrs.template === "record_stream_entry.xml";
      $scope.allFields = null;
      $scope.fields = null;
      $scope.fieldColor = "transparent";
      $scope.multipleInputs = $scope.useMultipleInputs;
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
      $scope.emailClientOpenPop = function(replyType, replyID) {
        if (!$scope.sysId)
          return;
        var url = new GlideURL("email_client.do");
        url.addParam("sysparm_table", $scope.table);
        url.addParam("sysparm_sys_id", $scope.sysId);
        url.addParam("sysparm_target", $scope.table);
        if (replyType != null) {
          url.addParam("replytype", replyType);
          url.addParam("replyid", replyID);
        }
        if (popupOpenEmailClient) {
          popupOpenEmailClient(url.getURL() + g_form.serializeChangedAll());
        }
      };
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
      }
      $scope.reduceMentions = function(text) {
        if (!text)
          return text;
        var regexMentionParts = /[\w\d\s/\']+/gi;
        text = text.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
          var mentionParts = mention.match(regexMentionParts);
          if (mentionParts.length === 2) {
            var name = mentionParts[1];
            var userID = mentionParts[0];
            mentionMap[name] = userID;
            return "@[" + name + "]";
          }
          return mentionParts;
        });
        return text;
      }
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
      $scope.parseSpecial = function(text) {
        var parsedText = $scope.parseLinks($sanitize(text));
        parsedText = $scope.parseMentions(parsedText);
        return $sce.trustAsHtml(parsedText);
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
          journal.new_value = response.data.result.replace(/\n/g, '<br/>');
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
          if (entry && entry.short_description) {
            return entry.short_description;
          } else if (entry && entry.shortDescription) {
            return entry.shortDescription;
          }
        },
        showCreatedBy: function() {
          return true;
        },
        hideCommentLabel: function(journal) {
          return false;
        },
        showRecord: function($event, entry) {},
        showRecordLink: function() {
          return true;
        }
      };
      if ($scope.controls) {
        for (var attr in $scope.controls) {
          $scope.defaultControls[attr] = $scope.controls[attr];
        }
      }
      $scope.controls = $scope.defaultControls;
      if ($scope.showCommentsAndWorkNotes === undefined) {
        $scope.showCommentsAndWorkNotes = $scope.defaultShowCommentsAndWorkNotes;
      }
      snCustomEvent.observe('sn.stream.change_input_display', function(table, display) {
        if (table != $scope.table)
          return;
        $scope.showCommentsAndWorkNotes = display;
        $scope.$apply();
      });
      $scope.$on("$destroy", function() {
        cancelStream();
      });
      $scope.$on('sn.stream.interval', function($event, time) {
        interval = time;
        reschedulePoll();
      });
      $scope.$on("sn.stream.tap", function() {
        if (stream)
          stream.tap();
        else
          startPolling();
      });
      $scope.$on('window_visibility_change', function($event, hidden) {
        interval = (hidden) ? 120000 : undefined;
        reschedulePoll();
      });
      $scope.$on("sn.stream.refresh", function(event, data) {
        stream._successCallback(data.response);
      });
      $scope.$on("sn.stream.reload", function() {
        startPolling();
      });
      $scope.$on('sn.stream.input_value', function(otherScope, value) {
        $scope.inputTypeValue = value;
      });
      $scope.$watchCollection('[table, query, sysId]', startPolling);
      $scope.changeInputType = function(field) {
        $scope.inputType = field.checked ? field.name : primaryJournalField;
        userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
      };
      $scope.$watch('inputType', function() {
        if (!$scope.inputType || !$scope.preferredInput)
          return;
        $scope.preferredInput = $scope.inputType;
      });
      $scope.submitCheck = function(event) {
        var key = event.keyCode || event.which;
        if (key === 13) {
          $scope.postJournalEntryForCurrent(event);
        }
      };
      $scope.postJournalEntry = function(type, entry, event) {
        type = type || primaryJournalFieldOrder[0];
        event.stopPropagation();
        var requestTable = $scope.table || "board:" + $scope.board.sys_id;
        stream.insertForEntry(type, entry.journalText, requestTable, entry.document_id);
        entry.journalText = "";
        entry.commentBoxVisible = false;
        snRecordPresence.termPresence();
      };
      $scope.postJournalEntryForCurrent = function(event) {
        event.stopPropagation();
        var entries = [];
        if ($scope.multipleInputs) {
          angular.forEach($scope.fields, function(item) {
            if (!item.value)
              return;
            entries.push({
              field: item.name,
              text: item.value
            });
          })
        } else {
          entries.push({
            field: $scope.inputType,
            text: $scope.inputTypeValue
          })
        }
        var request = stream.insertEntries(entries, $scope.table, $scope.sysId, mentionMap);
        if (request) {
          request.then(function() {
            for (var i = 0; i < entries.length; i++) {
              fireInsertEvent(entries[i].field, entries[i].text);
            }
          });
        }
        clearInputs();
        return false;
      };

      function fireInsertEvent(name, value) {
        snCustomEvent.fire('sn.stream.insert', name, value);
      }

      function clearInputs() {
        $scope.inputTypeValue = "";
        angular.forEach($scope.fields, function(item) {
          if (item.value)
            item.filled = true;
          item.value = "";
        });
      }
      $scope.showCommentBox = function(entry, event) {
        event.stopPropagation();
        if (entry !== $scope.selectedEntry)
          $scope.closeEntry();
        $scope.selectedEntry = entry;
        entry.commentBoxVisible = !entry.commentBoxVisible;
        if (entry.commentBoxVisible) {
          snRecordPresence.initPresence($scope.table, entry.document_id);
        }
      };
      $scope.showMore = function(journal, event) {
        event.stopPropagation();
        journal.showMore = true;
      };
      $scope.showLess = function(journal, event) {
        event.stopPropagation();
        journal.showMore = false;
      };
      $scope.closeEntry = function() {
        if ($scope.selectedEntry)
          $scope.selectedEntry.commentBoxVisible = false;
      };
      $scope.previewAttachment = function(evt, attachmentUrl) {
        snCustomEvent.fire('sn.attachment.preview', evt, attachmentUrl);
      }
      $scope.$on('sn.sessions', function(someOtherScope, sessions) {
        if ($scope.selectedEntry && $scope.selectedEntry.commentBoxVisible)
          $scope.selectedEntry.sessions = sessions;
      });
      $scope.$watch("inputTypeValue", function() {
        emitTyping($scope.inputTypeValue);
      });
      $scope.$watch("selectedEntry.journalText", function(newValue) {
        if ($scope.selectedEntry)
          emitTyping(newValue || "");
      });
      $scope.$watch('useMultipleInputs', function() {
        setMultipleInputs();
      });

      function emitTyping(inputValue) {
        var status = inputValue.length ? "typing" : "viewing";
        $scope.$emit("record.typing", {
          status: status,
          value: inputValue,
          table: $scope.table,
          sys_id: $scope.sys_id
        });
      }

      function preloadedData() {
        if (typeof window.NOW.snActivityStreamData === 'object' &&
          window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId]) {
          _firstPoll = false;
          var data = window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId];
          stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
            processor, interval, source, $scope.attachments);
          stream.callback = onPoll;
          stream.preRequestCallback = beforePoll;
          stream.lastTimestamp = data.sys_timestamp;
          if (data.entries && data.entries.length) {
            stream.lastEntry = angular.copy(data.entries[0]);
          }
          _firstPollTimeout = setTimeout(function() {
            stream.poll(onPoll, beforePoll);
            _firstPollTimeout = false;
          }, 20000);
          beforePoll();
          onPoll(data);
          return true;
        }
        return false;
      }

      function scheduleNewPoll(lastTimestamp) {
        cancelStream();
        stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
          processor, interval, source, $scope.attachments);
        stream.lastTimestamp = lastTimestamp;
        stream.poll(onPoll, beforePoll);
      }

      function reschedulePoll() {
        var lastTimestamp = stream ? stream.lastTimestamp : 0;
        if (cancelStream()) {
          scheduleNewPoll(lastTimestamp);
        }
      }

      function reset() {
        $scope.loaded = false;
        startPolling();
      }

      function startPolling() {
        if ($scope.loading && !$scope.loaded)
          return;
        if (!$scope.active)
          return;
        $scope.entries = [];
        $scope.allEntries = [];
        $scope.showAllEntriesButton = false;
        $scope.loaded = false;
        $scope.loading = true;
        if (_firstPoll && preloadedData()) {
          return;
        }
        scheduleNewPoll();
      }

      function onPoll(response) {
        $scope.loading = false;
        if (response.primary_fields)
          primaryJournalFieldOrder = response.primary_fields;
        if (!$scope.fields)
          processFields(response.fields);
        processEntries(response.entries);
        if (!$scope.loaded) {
          $scope.loaded = true;
          $scope.$emit("sn.stream.loaded", response);
        }
      }

      function beforePoll() {
        $scope.$emit("sn.stream.requested");
      }

      function processFields(fields) {
        if (!fields || !fields.length)
          return;
        $scope.fields = {};
        $scope.allFields = fields;
        setShowAllFields();
        $scope.fieldsVisible = 0;
        var i = 0;
        angular.forEach(fields, function(field) {
          if (!field.isJournal)
            return;
          if (i == 0)
            $scope.firstJournal = field.name;
          i++;
          $scope.fields[field.name] = field;
          $scope.fields[field.name].visible = $scope.formJournalFields ? false : true;
          if ($scope.fields[field.name].visible)
            $scope.fieldsVisible++;
          var fieldColor = field.color;
          if (fieldColor)
            fieldColor = field.color.replace(/background-color: /, '')
          if (!fieldColor || fieldColor == 'transparent')
            fieldColor = null;
          $scope.fields[field.name].color = fieldColor;
        });
        setFieldVisibility();
        setPrimaryJournalField();
        setMultipleInputs();
      }
      $scope.$watch('formJournalFields', function() {
        setFieldVisibility();
        setPrimaryJournalField();
        setMultipleInputs();
      }, true);

      function setFieldVisibility() {
        if (!$scope.formJournalFields || !$scope.fields || !$scope.showCommentsAndWorkNotes)
          return;
        $scope.fieldsVisible = 0;
        angular.forEach($scope.formJournalFields, function(formField) {
          if (!$scope.fields[formField.name])
            return;
          $scope.fields[formField.name].value = formField.value;
          $scope.fields[formField.name].mandatory = formField.mandatory;
          $scope.fields[formField.name].label = formField.label;
          $scope.fields[formField.name].messages = formField.messages;
          $scope.fields[formField.name].visible = formField.visible && !formField.readonly;
          if ($scope.fields[formField.name].visible)
            $scope.fieldsVisible++;
        });
      }

      function setPrimaryJournalField() {
        if (!$scope.fields || !$scope.showCommentsAndWorkNotes)
          return;
        angular.forEach($scope.fields, function(item) {
          item.isPrimary = false;
        });
        var visibleFields = Object.keys($scope.fields).filter(function(item) {
          return $scope.fields[item].visible;
        });
        if (visibleFields.indexOf($scope.preferredInput) != -1) {
          $scope.inputType = $scope.preferredInput;
          $scope.fields[$scope.preferredInput].checked = true;
        }
        for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
          var fieldName = primaryJournalFieldOrder[i];
          if (visibleFields.indexOf(fieldName) != -1) {
            $scope.fields[fieldName].isPrimary = true;
            primaryJournalField = fieldName;
            if (!$scope.inputType)
              $scope.inputType = fieldName;
            break;
          }
        }
        if (!$scope.inputType && visibleFields.length > 0) {
          primaryJournalField = visibleFields[0];
          $scope.inputType = primaryJournalField;
          $scope.fields[primaryJournalField].isPrimary = true;
        }
      }

      function setShowAllFields() {
        $scope.showAllFields = $scope.allFields && !$scope.allFields.some(function(item) {
          return !item.isActive;
        });
        $scope.hideAllFields = !$scope.allFields || !$scope.allFields.some(function(item) {
          return item.isActive;
        });
      }
      $scope.setPrimary = function(entry) {
        angular.forEach($scope.fields, function(item) {
          item.checked = false;
        });
        for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
          var fieldName = primaryJournalFieldOrder[i];
          if (entry.writable_journal_fields.indexOf(fieldName) != -1) {
            entry.primaryJournalField = fieldName;
            entry.inputType = fieldName;
            return;
          }
        }
        if (!entry.inputType) {
          var primaryField = entry.writable_journal_fields[0];
          entry.primaryJournalField = primaryField;
          entry.inputType = primaryField;
        }
      }
      $scope.updateFieldVisibilityAll = function() {
        $scope.showAllFields = !$scope.showAllFields;
        angular.forEach($scope.allFields, function(item) {
          item.isActive = $scope.showAllFields;
        });
        $scope.updateFieldVisibility();
      }
      $scope.updateFieldVisibility = function() {
        var activeFields = $scope.allFields.filter(function(item) {
          return item.isActive;
        }).map(function(item) {
          return item.name + ',' + item.isActive;
        });
        setShowAllFields();
        userPreferences
          .setPreference($scope.table + '.activity.filter', activeFields.join(';'))
          .then(function() {
            reset();
          })
      }
      $scope.configureAvailableFields = function() {
        $window.personalizer($scope.table, 'activity', $scope.sysId);
      }
      $scope.toggleMultipleInputs = function(val) {
        userPreferences.setPreference('glide.ui.activity_stream.multiple_inputs', val ? 'true' : 'false')
          .then(function() {
            $scope.useMultipleInputs = val;
            setMultipleInputs();
          });
      };
      $scope.changeEntryInputType = function(fieldName, entry) {
        var checked = $scope.fields[fieldName].checked;
        entry.inputType = checked ? fieldName : entry.primaryJournalField;
      };

      function processEntries(entries) {
        if (!entries || !entries.length)
          return;
        entries = entries.reverse();
        var newEntries = [];
        angular.forEach(entries, function(entry) {
          var entriesToAdd = [entry];
          if (entry.attachment) {
            entry.type = getAttachmentType(entry.attachment);
            entry.attachment.extension = getAttachmentExt(entry.attachment);
          } else if (entry.is_email === true) {
            entry.email = {};
            var allFields = entry.entries.custom;
            for (var i = 0; i < allFields.length; i++) {
              entry.email[allFields[i].field_name] = {
                label: allFields[i]['field_label'],
                displayValue: allFields[i]['new_value']
              };
            }
            entry['entries'].custom = [];
          } else if ($scope.sysId) {
            entriesToAdd = extractJournalEntries(entry);
          } else {
            entriesToAdd = handleJournalEntriesWithoutExtraction(entry);
          }
          if (entriesToAdd instanceof Array) {
            entriesToAdd.forEach(function(e) {
              $scope.entries.unshift(e);
              newEntries.unshift(e);
            });
          } else {
            $scope.entries.unshift(entriesToAdd);
            newEntries.unshift(entriesToAdd)
          }
          if (source != FROM_FORM)
            $scope.entries = $scope.entries.slice(0, 49);
          if ($scope.maxEntries != undefined) {
            var maxNumEntries = parseInt($scope.maxEntries, 10);
            $scope.entries = $scope.entries.slice(0, maxNumEntries);
          }
        });
        if ($scope.loaded) {
          $scope.$emit("sn.stream.new_entries", newEntries);
          triggerResize();
        } else if ($scope.pageSize && $scope.entries.length > $scope.pageSize)
          setUpPaging();
      }

      function setUpPaging() {
        $scope.showAllEntriesButton = true;
        $scope.allEntries = $scope.entries;
        $scope.entries = [];
        loadEntries(0, $scope.pageSize);
      }
      $scope.loadMore = function() {
        if ($scope.entries.length + $scope.pageSize > $scope.allEntries.length) {
          $scope.loadAll();
          return;
        }
        loadEntries($scope.loadedEntries, $scope.loadedEntries + $scope.pageSize);
      }
      $scope.loadAll = function() {
        $scope.showAllEntriesButton = false;
        loadEntries($scope.loadedEntries, $scope.allEntries.length);
      }

      function loadEntries(start, end) {
        $scope.entries = $scope.entries.concat($scope.allEntries.slice(start, end));
        $scope.loadedEntries = $scope.entries.length;
      }

      function getAttachmentType(attachment) {
        if (attachment.content_type.startsWith('image/') && attachment.size_bytes < 5 * 1024 * 1024 && attachment.path.indexOf(attachment.sys_id) == 0)
          return 'attachment-image';
        return 'attachment';
      }

      function getAttachmentExt(attachment) {
        var filename = attachment.file_name;
        return filename.substring(filename.lastIndexOf('.') + 1);
      }

      function handleJournalEntriesWithoutExtraction(oneLargeEntry) {
        if (oneLargeEntry.entries.journal.length === 0)
          return oneLargeEntry;
        for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
          newLinesToBR(oneLargeEntry.entries.journal);
        }
        return oneLargeEntry;
      }

      function extractJournalEntries(oneLargeEntry) {
        var smallerEntries = [];
        if (oneLargeEntry.entries.journal.length === 0)
          return oneLargeEntry;
        for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
          var journalEntry = angular.copy(oneLargeEntry);
          journalEntry.entries.journal = journalEntry.entries.journal.slice(i, i + 1);
          newLinesToBR(journalEntry.entries.journal);
          journalEntry.entries.changes = [];
          journalEntry.type = 'journal';
          smallerEntries.unshift(journalEntry);
        }
        oneLargeEntry.entries.journal = [];
        oneLargeEntry.type = 'changes';
        if (oneLargeEntry.entries.changes.length > 0)
          smallerEntries.unshift(oneLargeEntry);
        return smallerEntries;
      }

      function newLinesToBR(entries) {
        angular.forEach(entries, function(item) {
          if (!item.new_value)
            return;
          item.new_value = item.new_value.replace(/\n/g, '<br/>');
        });
      }

      function cancelStream() {
        if (_firstPollTimeout) {
          clearTimeout(_firstPollTimeout);
          _firstPollTimeout = false;
        }
        if (!stream)
          return false;
        stream.cancel();
        stream = null;
        return true; 
      }

      function setMultipleInputs() {
        $scope.multipleInputs = $scope.useMultipleInputs;
        if ($scope.useMultipleInputs === true || !$scope.formJournalFields) {
          return;
        }
        var numAffectedFields = 0;
        angular.forEach($scope.formJournalFields, function(item) {
          if (item.mandatory || item.value)
            numAffectedFields++;
        });
        if (numAffectedFields > 0)
          $scope.multipleInputs = true;
      }

      function triggerResize() {
        if (window._frameChanged)
          setTimeout(_frameChanged, 0);
      }
    },
    link: function(scope, element) {
      element.on("click", ".at-mention", function(evt) {
        var userID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
        $http({
          url: '/api/now/form/mention/user/' + userID,
          method: "GET"
        }).then(function(response) {
          scope.showPopover = true;
          scope.mentionPopoverProfile = response.data.result;
          scope.clickEvent = evt;
        }, function() {
          $http({
            url: '/api/now/live/profiles/' + userID,
            method: "GET"
          }).then(function(response) {
            scope.showPopover = true;
            var tempProfile = response.data.result;
            tempProfile.userID = tempProfile.sys_id = response.data.result.document;
            scope.mentionPopoverProfile = tempProfile;
            scope.mentionPopoverProfile.sysID = response.data.result["userID"];
            scope.clickEvent = evt;
          })
        });
      });
      scope.toggleEmailIframe = function(email, event) {
        email.expanded = email.expanded ? false : true;
        event.preventDefault();
      };
    }
  };
});;