/*! RESOURCE: /scripts/app.$sp/directive.spAgentChat.js */
angular.module('sn.$sp').directive('spAgentChat', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_agent_chat.xml',
    controllerAs: 'c',
    scope: true,
    controller: function($window, spAgentChat, i18n, $rootScope) {
      var c = this;
      var _portalId = $rootScope.portal_id;
      c.isVisible = false;
      c.isOpen = false;
      c.hasUnreadMessage = false;
      c.frameUrl = null;
      c.i18n = {
        startSupportConvo: i18n.getMessage('Start Support Conversation'),
        endSupportConvo: i18n.getMessage('End Support Conversation'),
        agentChatWindow: i18n.getMessage('Agent Chat Window')
      };
      c.toggle = function($event) {
        if ($event)
          $event.currentTarget.blur();
        c.isOpen = !c.isOpen;
        c.hasUnreadMessage = false;
        $('body').toggleClass('disable_overflow_scrolling');
        spAgentChat.setState({
          isOpen: c.isOpen
        });
        if (c.frameUrl !== undefined)
          return;
        spAgentChat.getFrameUrl().then(function(frameUrl) {
          c.frameUrl = frameUrl;
        });
      }
      spAgentChat.init(_portalId).then(function(config) {
        c.frameUrl = config.frameUrl;
        c.isVisible = config.isVisible;
        c.hasUnreadMessage = config.hasUnreadMessage;
        if (c.isOpen !== config.isOpen)
          c.toggle();
      });
      spAgentChat.subscribe(spAgentChat.events.NEW_UNREAD_MESSAGE, function() {
        if (!c.isOpen)
          c.hasUnreadMessage = true;
      });
      spAgentChat.subscribe(spAgentChat.events.REAUTH, function() {
        $window.location.reload(true);
      });
      spAgentChat.subscribe(spAgentChat.events.STATE_CHANGE, function(config) {
        c.isOpen = config.isOpen;
      });
    }
  }
});;