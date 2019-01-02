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