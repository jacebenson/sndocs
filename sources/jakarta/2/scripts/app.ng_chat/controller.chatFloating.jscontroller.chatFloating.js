/*! RESOURCE: /scripts/app.ng_chat/controller.chatFloating.js */
angular.module('sn.connect').controller('chatFloating', function(
  $scope, $rootScope, userPreferences, snTabActivity, snConnectAsideManager, messageNotifier, conversations,
  audioNotifier, isRTL, activeConversation, paneManager) {
  'use strict';
  paneManager.registerPane('connect:conversation_list');
  $scope.conversationListCollapsed = true;
  snTabActivity.setAppName("sn.connect");
  messageNotifier.registerMessageServiceWatch(shouldSendNotification);
  audioNotifier.registerMessageServiceWatch(activeConversation, shouldSendNotification);

  function shouldSendNotification(message) {
    if (!snTabActivity.isVisible)
      return true;
    var conversation = conversations.indexed[message.conversationID];
    if (snTabActivity.isIdle)
      return (conversation && conversation.isFrameStateOpen) ? false : true;
    if (conversation && conversation.isFrameStateOpen)
      return false;
    return $scope.conversationListCollapsed;
  }
  $scope.$watch("conversationListCollapsed", function(listCollapsed) {
    CustomEvent.fireTop("connect:conversation_list:state", (listCollapsed) ? "closed" : "open");
  });
  CustomEvent.observe("connect:conversation_list.toggle", function(manualSave, autoFocusPane) {
    $scope.conversationListCollapsed = !$scope.conversationListCollapsed;
    $rootScope.$broadcast("pane.collapsed", 'right', $scope.conversationListCollapsed, autoFocusPane);
    if (manualSave)
      userPreferences.setPreference("connect:conversation_list.opened", !$scope.conversationListCollapsed);
  });
  snConnectAsideManager.setup();
  $scope.$on('pane.collapsed', function(event, position, collapsed, autoFocusPane) {
    var UI15Layout = angular.element(document.body).data().layout,
      $snConnect = angular.element('.sn-connect-content'),
      $layout = angular.element('.navpage-layout'),
      $pageRight = angular.element('.navpage-right');
    var pane = isRTL ? 'west' : 'east';
    if (collapsed) {
      if (UI15Layout) {
        UI15Layout.hide(pane);
      } else {
        $layout.addClass('navpage-right-hidden');
        $pageRight.css('visibility', 'hidden');
      }
      $snConnect.addClass('sn-pane-hidden');
      $snConnect.removeClass('sn-pane-visible');
    } else {
      if (UI15Layout) {
        UI15Layout.show(pane);
        UI15Layout.sizePane(pane, 285);
      } else {
        $layout.removeClass('navpage-right-hidden');
        $pageRight.css('visibility', 'visible');
      }
      $snConnect.removeClass('sn-pane-hidden');
      $snConnect.addClass('sn-pane-visible');
      if (autoFocusPane) {
        $snConnect.one('transitionend', function() {
          if ($snConnect.hasClass('sn-pane-visible')) {
            var el = $snConnect.find('input').filter(':first');
            el.focus();
          }
        });
      }
    }
  });
});;