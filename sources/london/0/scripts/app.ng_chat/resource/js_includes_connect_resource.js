/*! RESOURCE: /scripts/app.ng_chat/resource/js_includes_connect_resource.js */
/*! RESOURCE: /scripts/app.ng_chat/resource/_module.js */
angular.module("sn.connect.resource", ["ng.common"]);;
/*! RESOURCE: /scripts/app.ng_chat/resource/factory.LiveLink.js */
angular.module("sn.connect.resource").factory("liveLinkFactory", function(
  $sce, $window, attachmentFactory, inFrameSet) {
  "use strict";

  function linkObject(link, external, type) {
    var isConnectType = (type === 'connect');
    external |= isConnectType;
    var url = (inFrameSet || external) ?
      link :
      "/nav_to.do?uri=" + encodeURIComponent(link);
    var target =
      (!inFrameSet && isConnectType) ? "_self" :
      (inFrameSet && !external) ? 'gsft_main' :
      "_blank";
    var classType = external ? "external-link" : "internal-link";
    return {
      url: url,
      target: target,
      classType: classType
    }
  }

  function fromObject(data, visible) {
    if (angular.isUndefined(visible))
      visible = true;
    var attachment = data.type_metadata && data.type_metadata.attachment;
    if (attachment)
      attachment = attachmentFactory.fromObject(attachment);
    return {
      sysID: data.sys_id,
      type: data.type,
      url: data.url,
      display: data.title || data.url,
      displayUrl: data.url.replace(/^(?:https?:\/)?\//, ''),
      title: data.title,
      shortDescription: data.short_description,
      siteName: data.site_name,
      timestamp: data.timestamp,
      external: data.external,
      displayFields: data.type_metadata && data.type_metadata.display_fields,
      embedLink: data.type_metadata && data.type_metadata.embed_link,
      imageLink: data.type_metadata && data.type_metadata.image_link,
      avatarID: data.type_metadata && data.type_metadata.avatar_id,
      avatarDisplay: data.type_metadata && data.type_metadata.avatar_display,
      createdOn: data.type_metadata && data.type_metadata.sys_created_on,
      updatedOn: data.type_metadata && data.type_metadata.sys_updated_on,
      isActive: data.state === "active",
      isPending: data.state === "pending",
      isError: data.state === "error",
      isUnauthorized: data.state === "unauthorized",
      isDeleted: data.state === "deleted",
      visible: visible,
      isRecord: data.type == "record",
      isImage: data.type === "image",
      attachment: attachment,
      get isHideable() {
        return ((attachment || this.isRecord) && this.isActive) || this.isImage;
      },
      open: function(event) {
        if (event.keyCode === 9)
          return;
        var link = linkObject(this.url, this.external, this.type);
        var newWindow = $window.open(link.url, link.target);
        newWindow.opener = null;
      },
      aTag: function(text) {
        var link = linkObject(this.url, this.external, this.type);
        var aTag = angular.element("<a />");
        aTag.attr('class', link.classType);
        aTag.attr('rel', "noreferrer");
        aTag.attr('target', link.target);
        aTag.attr('href', link.url);
        aTag[0].innerHTML = text;
        return $sce.getTrustedHtml(aTag[0].outerHTML);
      }
    };
  }
  return {
    fromObject: fromObject,
    linkObject: linkObject
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/factory.attachment.js */
angular.module("sn.connect.resource").factory("attachmentFactory", function(fileSizeConverter, $window) {
  "use strict";

  function fromObject(data) {
    data.size = fileSizeConverter.getByteCount("" + data.size_bytes, 2);
    var downloadSource = "/sys_attachment.do?sys_id=" + data.sys_id;
    var newTabSource = "/" + data.sys_id + ".iix";
    return {
      rawData: data,
      sysID: data.sys_id,
      timestamp: data.sys_created_on,
      name: data.file_name || "Image",
      byteDisplay: data.size,
      canRead: data.can_read,
      fileName: data.file_name,
      sizeInBytes: data.size_bytes,
      compressSize: data.size_compressed,
      contentType: data.content_type,
      thumbSource: data.thumb_src,
      createdBy: data.sys_created_by,
      isImage: data.image,
      height: data.image_height,
      width: data.image_width,
      averageColor: data.average_image_color,
      newTabSource: newTabSource,
      downloadSource: downloadSource,
      open: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(newTabSource, "_blank");
      },
      download: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(downloadSource, "_self");
      }
    }
  }
  return {
    fromObject: fromObject
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/service.resourcePersister.js */
angular.module('sn.connect.resource').service('resourcePersister', function(
  $q, snHttp, liveLinkFactory, attachmentFactory, $timeout, isLoggedIn) {
  "use strict";
  var CONVERSATION_PATH = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var FETCH_THRESHOLD = 25;
  var conversations = {};
  var limit = FETCH_THRESHOLD;

  function addLink(conversationID, link) {
    var field = (link.isRecord) ? "records" : "links";
    addToArray(conversationID, field, link, linkEquals);
  }

  function linkEquals(link1, link2) {
    return link1.url === link2.url;
  }

  function addAttachment(conversationID, attachment) {
    addToArray(conversationID, "attachments", attachment, attachmentEquals);
  }

  function attachmentEquals(attachment1, attachment2) {
    function cmp(field) {
      var field1 = attachment1[field];
      var field2 = attachment2[field];
      return !!field1 && field1 === field2;
    }
    return attachment1.isImage &&
      cmp("sizeInBytes") &&
      cmp("compressSize") &&
      cmp("contentType") &&
      cmp("height") &&
      cmp("width") &&
      cmp("averageColor");
  }

  function addToArray(conversationID, field, element, equalsFn) {
    var resources = conversations[conversationID];
    if (!resources) {
      conversations[conversationID] = newResource();
      conversations[conversationID][field] = [element];
      return;
    }
    var array = resources[field];
    for (var i = 0; i < array.length; i += 1) {
      var item = array[i];
      if (item.sysID === element.sysID) {
        array[i] = element;
        return;
      }
      if (equalsFn(item, element)) {
        if (item.timestamp > element.timestamp)
          return;
        array.splice(i, 1);
        break;
      }
    }
    for (i = 0; i < array.length; ++i) {
      if (array[i].timestamp <= element.timestamp) {
        array.splice(i, 0, element);
        return;
      }
    }
    array.push(element);
  }

  function newResource() {
    return {
      links: [],
      records: [],
      attachments: []
    };
  }

  function retrieve(conversationID) {
    var resources = conversations[conversationID];
    if (resources && (resources.loading || resources.retrieved))
      return;
    if (!resources) {
      resources = conversations[conversationID] = newResource();
    }
    resources.loading = true;
    $timeout(function() {
      snHttp.get(CONVERSATION_PATH + conversationID + "/resources?sysparm_limit=" + limit).then(function(response) {
        delete conversations[conversationID].loading;
        conversations[conversationID].retrieved = true;
        limit = limit + FETCH_THRESHOLD;
        var result = response.data.result;
        result.links.forEach(function(rawLink) {
          addLink(conversationID, liveLinkFactory.fromObject(rawLink));
        });
        result.attachments.forEach(function(rawAttachment) {
          addAttachment(conversationID, attachmentFactory.fromObject(rawAttachment));
        });
        resources.retrieved = true;
      });
    })
  }
  return {
    get: function(conversationID) {
      retrieve(conversationID);
      return conversations[conversationID];
    },
    addLink: addLink,
    addAttachment: addAttachment
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/service.supportTabHandler.js */
angular.module('sn.connect.resource').service('supportTabHandler', function() {
  'use strict';
  var tabs = {};
  var watches = {};
  var globalWatches = [];

  function addTab(channelID, tab) {
    if (!channelID || !tab)
      return false;
    tabs[channelID] = tabs[channelID] || [];
    if (ngObjectIndexOf(tabs[channelID], tab) !== -1)
      return tab;
    tabs[channelID].push(tab);
    callWatches(channelID, tab);
    return tab;
  }

  function removeTab(channelID, tab) {
    if (!channelID || !tab || !tabs[channelID])
      return false;
    var loc = ngObjectIndexOf(tabs[channelID], tab);
    if (loc !== -1) {
      var removedTab = tabs[channelID].splice(loc, 1)[0];
      callWatches(channelID, removedTab);
      return removedTab;
    }
    return false;
  }

  function removeChannel(channelID) {
    if (!channelID || !tabs[channelID])
      return false;
    tabs[channelID] = [];
    callWatches(channelID, []);
    return true;
  }

  function getTabs(channelID, sort) {
    if (!tabs[channelID])
      return [];
    return sort ? tabs[channelID].sort(function(a, b) {
      return a.$order - b.$order;
    }) : tabs[channelID];
  }

  function ngObjectIndexOf(arr, obj) {
    for (var i = 0, len = arr.length; i < len; i++)
      if (angular.equals(arr[i], obj))
        return i;
    return -1;
  }

  function watch(func, channelID) {
    if (channelID) {
      watches[channelID] = watches[channelID] || [];
      watches[channelID].push(func)
    } else {
      globalWatches.push(func);
    }
    return func;
  }

  function unwatch(func, channelID) {
    var i, len;
    if (channelID && watches[channelID]) {
      for (i = 0, len = watches[channelID].length; i < len; i++) {
        var watchLoc = watches[channelID].indexOf(func);
        if (watchLoc !== -1)
          watches[channelID].splice(watchLoc, 1);
      }
    } else {
      for (i = 0, len = globalWatches.length; i < len; i++) {
        var globalWatchLoc = globalWatches.indexOf(func);
        if (globalWatchLoc !== -1)
          globalWatches.splice(globalWatchLoc, 1);
      }
    }
  }

  function callWatches(channelID, response) {
    var i, len;
    if (channelID && watches[channelID] && watches[channelID].length) {
      for (i = 0, len = watches[channelID].length; i < len; i++)
        watches[channelID][i](response);
    }
    for (i = 0, len = globalWatches.length; i < len; i++)
      globalWatches[i](response);
  }
  return {
    add: addTab,
    remove: removeTab,
    get: getTabs,
    removeChannel: removeChannel,
    watch: watch,
    unwatch: unwatch
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideMemberList.js */
angular.module('sn.connect.resource').directive('snAsideMemberList', function(
  getTemplateUrl, $timeout, activeConversation) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideMemberList.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "members");
        }, 0, false);
      });
      scope.changeMode = function(evt, mode) {
        if (!scope.conversation.amMember || evt.keyCode === 9)
          return;
        scope.mode = mode;
        if (mode == 'add') {
          $timeout(function() {
            element.find('.form-control-search.tt-input').focus();
          }, 200);
        }
      };
    },
    controller: function($scope, conversations, liveProfileID, supportAddMembers) {
      $scope.mode = 'view';
      $scope.$emit("sn.aside.controls.active", "members");
      $scope.viewProfile = function(evt, member) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.open", {
          templateUrl: getTemplateUrl("snAsideMemberList_profile.xml"),
          isChild: true,
          scope: {
            profile: member,
            showDirectMessage: !$scope.conversation.isDirectMessage && !$scope.conversation.isHelpDesk
          }
        });
      };
      $scope.isAddUserButtonVisible = function() {
        if ($scope.mode !== 'view')
          return false;
        return isButtonVisible(function() {
          return true;
        });
      };
      $scope.isLeaveButtonVisible = function() {
        var queueEntryCheckFn = function(queueEntry) {
          return !queueEntry.isAssignedToMe;
        };
        return isButtonVisible(queueEntryCheckFn);
      };
      $scope.isRemoveUserButtonVisible = function(userID) {
        var queueEntryCheckFn = function(queueEntry) {
          return queueEntry.openedBy !== userID &&
            queueEntry.assignedTo !== userID;
        };
        return isButtonVisible(queueEntryCheckFn);
      };

      function isButtonVisible(queueEntryCheckFn) {
        var conversation = $scope.conversation;
        if (!conversation.isHelpDesk)
          return conversation.isGroup;
        var queueEntry = conversation.queueEntry;
        return supportAddMembers &&
          queueEntryCheckFn(queueEntry) &&
          queueEntry.isActive;
      }
      $scope.user = false;
      $scope.findUser = function() {
        for (var i = 0; i < $scope.conversation.members.length; i++) {
          if ($scope.conversation.members[i].sysID === liveProfileID) {
            $scope.user = $scope.conversation.members[i];
            return;
          }
        }
        $scope.user = false;
      };
      $scope.findUser();
      $scope.$watch('conversation.sysID', function() {
        $scope.findUser();
      });
      $scope.addMember = function(memberID) {
        conversations.addUser($scope.conversation.sysID, memberID);
        $scope.mode = 'view';
        if (!$scope.user)
          $scope.findUser();
      };
      $scope.showRemoveMember = function() {
        return $scope.conversation.amMember && $scope.conversation.isGroup;
      };
      $scope.removeMember = function($event, memberID) {
        if ($event && $event.keyCode === 9)
          return;
        $event.stopPropagation();
        conversations.removeUser($scope.conversation.sysID, memberID);
        if (memberID === liveProfileID) {
          activeConversation.clear($scope.conversation);
          $scope.user = null;
        }
      };
      $scope.showAddMembers = function() {
        return !$scope.conversation.isHelpDesk && $scope.conversation.isGroup && $scope.mode == 'view'
      };
      $scope.showUser = function() {
        return user && $scope.memberFilterText && user.name.indexOf($scope.memberFilterText) > -1;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfo.js */
angular.module('sn.connect.resource').directive('snAsideInfo', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfo.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "info");
        }, 0, false);
      });
    },
    controller: function($scope) {
      $scope.$emit("sn.aside.controls.active", "info");
      $scope.isFieldVisible = function(field) {
        return field.displayValue && field.type !== 'journal_input' && field.type !== 'journal_list';
      };
      $scope.historyBack = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.historyBack");
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoItem', function(getTemplateUrl) {
  'use strict';
  var iconMap = {
    record: "icon-article-document",
    link: "icon-link",
    connect: "icon-collaboration",
    uipage: "icon-document",
    search: "icon-search",
    list: "icon-list",
    chart: "icon-poll",
    update: "icon-form",
    image: "icon-image",
    video: "icon-video",
    unauthorized: "icon-locked sn-highlight_negative",
    error: "icon-alert-triangle",
    pending: "icon-loading"
  };
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfoItem.xml'),
    scope: {
      isLink: "=",
      title: "@",
      description: "@",
      link: "="
    },
    controller: function($scope) {
      $scope.isExternalIcon = function() {
        return !$scope.link.isPending && $scope.link.external;
      };
      $scope.getExternalIcon = function() {
        return "https://www.google.com/s2/favicons?domain=" + $scope.link.url.toLowerCase();
      };
      $scope.getIcon = function() {
        if ($scope.link.isUnauthorized)
          return iconMap.unauthorized;
        if ($scope.link.isError)
          return iconMap.error;
        if ($scope.link.isPending)
          return iconMap.pending;
        return iconMap[$scope.link.type] || iconMap.link;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoViewAllItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoViewAllItem', function(getTemplateUrl) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfoViewAllItem.xml'),
    scope: {
      title: "@",
      templateUrl: "@",
      minCount: "@",
      links: "="
    },
    controller: function($scope) {
      $scope.isShowing = function() {
        return $scope.links.length > $scope.minCount;
      };
      $scope.openView = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.open", {
          templateUrl: getTemplateUrl($scope.templateUrl),
          isChild: true,
          scope: $scope.$parent
        });
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideAttachments.js */
angular.module('sn.connect.resource').directive('snAsideAttachments', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideAttachments.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "attachments");
        }, 0, false);
      });
    },
    controller: function($scope, $rootScope, resourcePersister) {
      $scope.$emit("sn.aside.controls.active", "attachments");
      $scope.$watch("conversation.sysID", rawifyAttachments);
      $scope.$watchCollection("conversation.resources.attachments", rawifyAttachments);

      function rawifyAttachments() {
        $scope.attachments = $scope.conversation.resources.attachments.map(function(attachment) {
          return attachment.rawData;
        });
      }
      rawifyAttachments();
      $scope.attachFiles = function(evt) {
        if (evt.keyCode === 9)
          return;
        if ($scope.conversation.amMember)
          $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
      };
      $scope.isAddButtonShowing = function() {
        return !$scope.conversation.isHelpDesk || !$scope.conversation.queueEntry.isClosedByAgent;
      }
      $scope.scrollConfig = {
        onScrollUp: function() {
          console.info("Up!");
        },
        onScrollDown: function() {
          console.info("Down!");
          $scope.conversation.resources.retrieved = false;
          resourcePersister.get($scope.conversation.sysID);
        },
        onScrollMissing: function() {
          console.info("Missing!");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotifications.js */
angular.module('sn.connect.resource').directive('snAsideNotifications', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideNotifications.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "notifications");
        }, 0, false);
      });
    },
    controller: function($scope, notificationPreferences) {
      $scope.$emit("sn.aside.controls.active", "notifications");
      $scope.showSystemMessage = function() {
        return !$scope.conversation.isDirectMessage &&
          notificationPreferences.globalPreferences.mobile &&
          $scope.conversation.preferences.mobile === "all";
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotificationItem.js */
angular.module('sn.connect.resource').directive('snAsideNotificationItem', function(getTemplateUrl) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideNotificationItem.xml'),
    scope: {
      conversation: "=",
      section: "@",
      disableText: "@",
      disableLinkText: "@",
      description: "@",
      type: '@'
    },
    controller: function($scope, notificationPreferences) {
      $scope.globalPreferences = notificationPreferences.globalPreferences;
      $scope.enable = function(event) {
        if (event.keyCode === 9)
          return;
        $scope.globalPreferences[$scope.type] = true;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideFrame.js */
angular.module('sn.connect.resource').directive('snAsideFrame', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideFrame.xml'),
    link: function(scope, element, attrs) {
      scope.title = attrs.title;
      scope.url = attrs.url + (attrs.url.indexOf('?') < 0 ? '?' : '&') + "sysparm_clear_stack=true";
      scope.name = attrs.name;
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", scope.name);
        }, 0, false);
      });
    },
    controller: function($scope) {
      $timeout(function() {
        $scope.$emit('sn.aside.controls.active', $scope.name);
      }, 0, false);
      $scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.close");
      }
    }
  }
});;;