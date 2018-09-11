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
      controller: function($scope, $rootScope, snCustomEvent) {
        $scope.documentationLink = embeddedHelpService.getDocumentationLink();
        $scope.isLeft = g_text_direction == 'ltr';
        snCustomEvent.observe(EmbeddedHelpEvents.CONTENT_LOAD, function(contentExists) {
          $scope.contentExists = contentExists;
        });
        $rootScope.$on(EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE, function(event, documentLink) {
          $scope.documentationLink = documentLink;
        });
        $rootScope.$on(EmbeddedHelpEvents.CONTENT_LOAD, function(event, link) {
          $scope.editArticleLink = link;
        });
        $scope.trackUserGuideEvent = function() {
          window.GlideWebAnalytics.trackEvent(WebaEvents.CATEGORY, WebaEvents.USER_GUIDE_KEY, WebaEvents.USER_GUIDE_VALUE, 0);
        }
        $scope.trackSearchDocEvent = function() {
          window.GlideWebAnalytics.trackEvent(WebaEvents.CATEGORY, WebaEvents.SEARCH_DOC_KEY, WebaEvents.SEARCH_DOC_VALUE, 0);
        }
      }
    };
  }
]);;