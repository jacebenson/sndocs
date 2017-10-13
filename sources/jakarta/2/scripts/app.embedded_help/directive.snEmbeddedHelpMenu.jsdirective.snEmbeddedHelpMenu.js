/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpMenu.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpMenu', ['getTemplateUrl', 'embeddedHelpService',
  function(getTemplateUrl, embeddedHelpService) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isContextMenu: '=',
        label: "@"
      },
      templateUrl: getTemplateUrl('sn_embedded_help_menu.xml'),
      controller: function($scope, $rootScope) {
        $scope.documentationLink = embeddedHelpService.getDocumentationLink();
        $rootScope.$on(EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE, function(event, documentLink) {
          $scope.documentationLink = documentLink;
        });
      }
    };
  }
]);;