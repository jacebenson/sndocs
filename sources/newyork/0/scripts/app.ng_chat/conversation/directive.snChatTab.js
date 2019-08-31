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
        var cachedConversationsIndex;
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
      $scope.$watch('searchTerm', function(newVal, oldVal) {
        $scope.$emit("connect.search_text", $scope.searchTerm);
        if (newVal === oldVal) {
          return;
        }
        if (!oldVal) {
          cachedConversationsIndex = conversations.indexed;
        }
        if (!newVal) {
          conversations.loadConversationsFromCache(cachedConversationsIndex);
          return;
        }
        conversations.updateConversations(newVal);
      });
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
          $scope.showNoSearchResults() ||
          $scope.isLoading());
      };
      $scope.showNoChatConversations = function() {
        return !$scope.hasSearchText() &&
          filterConversations(true).length === 0;
      };
      $scope.isLoading = function() {
        return conversations.isLoading;
      };
      $scope.showNoSearchResults = function() {
        return $scope.hasSearchText() &&
          !$scope.isLoading() &&
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