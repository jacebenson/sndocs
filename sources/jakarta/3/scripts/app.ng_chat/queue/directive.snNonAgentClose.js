/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snNonAgentClose.js */
angular.module('sn.connect.queue').directive('snNonAgentClose', function(
  getTemplateUrl, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snNonAgentClose.xml'),
    scope: {},
    controller: function($scope) {
      $scope.$on('connect.non_agent_conversation.close_prompt', function(event, conversation) {
        $scope.conversation = conversation;
        $scope.$broadcast('dialog.queue-non-agent-modal.show');
      });
      $scope.close = function() {
        conversations.closeSupport($scope.conversation.sysID, true);
        activeConversation.clear($scope.conversation);
      };
    }
  };
});;