/*! RESOURCE: /scripts/js_knowledge_blocks_includes.js */
/*! RESOURCE: /scripts/directive.snKBSidebarPane.js */
angular.module('sn.knowledge_block_sidebar', ['sn.ngKnowledgeBlockInfo']);
angular.module('sn.knowledge_block_sidebar').directive('snKbSidebarPane', ['$timeout', 'getTemplateUrl', 'paneManager', '$window', function($timeout, getTemplateUrl, paneManager, $window) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: getTemplateUrl('sn_kb_sidebar_pane.xml'),
    scope: {
      paneCollapsed: '=',
      panePosition: '@',
      paneResizeable: '@',
      paneWidth: '=',
      paneToggle: '@'
    },
    link: function(scope) {
      scope.togglePane = function() {
        paneManager.togglePane("kb_sidebar_pane", true);
      };
      scope.createNewBlock = function() {
        $window.open("/kb_knowledge_block.do?sys_id=-1&sysparm_stack=kb_knowledge_block_list.do", '_blank');
      };
    }
  };
}]);
angular.module('sn.knowledge_block_sidebar').directive('snKbSidebarContent', ['getTemplateUrl', 'paneManager', function(getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_kb_sidebar_content.xml'),
    replace: true,
    scope: {
      collapsed: '=',
      url: '='
    },
    link: function(scope) {
      scope.closePane = function() {
        paneManager.togglePane("kb_sidebar_pane", true);
      };
    }
  };
}]);;
/*! RESOURCE: /scripts/controller.kbSidebar.js */
angular.module('sn.knowledge_block_sidebar').controller(
  'kbSidebar', [
    '$scope',
    '$rootScope',
    'snCustomEvent',
    'embeddedHelpService',
    'userPreferences',
    'paneManager',
    function($scope, $rootScope, snCustomEvent,
      embeddedHelpService, userPreferences,
      paneManager) {
      "use strict";
      $scope.kbSidebarCollapsed = true;
      $scope.loaded = false;
      $scope.content = '';
      $scope.actions = [];
      $scope.supressedTours = [];
      $scope.tours = [];
      $scope.showLanguageWarning = false;
      $scope.sysId = "";
      $scope.tableName = "";
      $scope.currentUrl = "";
      $scope.firstLoad = true;
      $scope.knowledgeBase = "";
      $scope.languageArticle = "";
      $scope.slidePanelOpen = false;
      paneManager.registerPane("kb_sidebar_pane");
      snCustomEvent.on('sn:kb_changed', function(data) {
        $scope.knowledgeBase = data;
        $rootScope.$broadcast('sn:kb_changed', data);
      });
      snCustomEvent.on('sn:kb_languageChanged', function(data) {
        $scope.languageArticle = data;
        $rootScope.$broadcast('sn:kb_languageChanged', data);
      });
      snCustomEvent.on("sn:kb_trigger_sidebar",
        function(args) {
          $scope.firstLoad = false;
          $scope.slidePanelOpen = true;
          paneManager.togglePane(
            "kb_sidebar_pane",
            $scope.kbSidebarCollapsed);
          if (args.knowledgeBase != $scope.knowledgeBase) {
            $scope.knowledgeBase = args.knowledgeBase;
          }
          $scope.$broadcast('sn:kb_changed', $scope.knowledgeBase);
          if (args.languageArticle != $scope.languageArticle) {
            $scope.languageArticle = args.languageArticle;
          }
          $scope.$broadcast('sn:kb_languageChanged', $scope.languageArticle);
          $scope.$broadcast('sn:kb_sildePanelRefresh');
        });
      snCustomEvent.on("sn:kb_sidebar_collapse",
        function() {
          if ($scope.slidePanelOpen)
            paneManager.togglePane(
              "kb_sidebar_pane",
              true);
        });
      snCustomEvent.observe('kb_sidebar_pane.toggle',
        function(collapsed,
          autoFocusFirstItem) {
          if (!$scope.kbSidebarCollapsed)
            $scope.slidePanelOpen = false;
          if ($scope.firstLoad == false) {
            $scope.kbSidebarCollapsed = !$scope.kbSidebarCollapsed;
            $rootScope.$broadcast('kb_sidebar_pane.collapsed',
              'right',
              $scope.kbSidebarCollapsed,
              autoFocusFirstItem);
          } else
            $rootScope.$broadcast('kb_sidebar_pane.collapsed',
              'right',
              true,
              autoFocusFirstItem);
        });
      $scope.$on('kb_sidebar_pane.collapsed',
        function(event, position,
          collapsed,
          autoFocusFirstItem) {
          var $body = angular
            .element('body');
          if ($body.data().layout) {
            if (collapsed)
              $body.data().layout
              .hide('east');
            else {
              $body.data().layout
                .show('east');
              $body.data().layout
                .sizePane(
                  'east',
                  285);
            }
          } else {
            var $layout = angular
              .element('.navpage-layout'),
              $pageRight = angular
              .element('.navpage-right'),
              $snkbSidebarContent = angular
              .element('.sn-kb-sidebar-pane-content');
            if (collapsed) {
              $layout.addClass('navpage-right-hidden');
              $pageRight.css('visibility', 'hidden');
              $snkbSidebarContent.addClass('sn-pane-hidden');
              $snkbSidebarContent.removeClass('sn-pane-visible');
            } else {
              $layout.removeClass('navpage-right-hidden');
              $pageRight.css('visibility', 'visible');
              $snkbSidebarContent.removeClass('sn-pane-hidden');
              $snkbSidebarContent.addClass('sn-pane-visible');
            }
            if (autoFocusFirstItem) {
              $snkbSidebarContent.one('transitionend',
                function() {
                  if ($snkbSidebarContent.hasClass('sn-pane-visible')) {
                    $snkbSidebarContent.find('.sn-widget-list-item')
                      .filter(':visible')
                      .filter(':first')
                      .focus();
                  }
                });
            }
          }
        });
    }
  ]);;
/*! RESOURCE: /scripts/kbblock/js_knowledge_block_content_includes.js */
/*! RESOURCE: /scripts/kbblock/directive.snKbBlockContent.js */
angular.module('sn.ngKnowledgeBlockInfo', ['sn.common.util', 'ngSanitize']);
angular.module('sn.ngKnowledgeBlockInfo')
  .directive('snKbBlockContent', ['$location', '$window', 'getTemplateUrl', function($location, $window, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl("sn_kb_block_content.xml"),
      scope: {
        filterprofile: '@',
        knowledgeBase: '@',
        languageArticle: '@'
      },
      link: function(scope) {
        scope.$on('sn:kb_sildePanelRefresh', function(e) {
          scope.searchKBBlocks = "";
          scope.getKBlockRecords();
        });
        scope.$on('sn:kb_changed', function(e, data) {
          scope.knowledgeBase = data;
          scope.searchKBBlocks = "";
          scope.getKBlockRecords();
        });
        scope.$on('sn:kb_languageChanged', function(e, data) {
          scope.languageArticle = data;
          scope.searchKBBlocks = "";
          scope.getKBlockRecords();
        });
      },
      controller: function($scope, $http, $timeout, $sanitize) {
        $scope.getKBlockRecords = function(searchInput, knowledgeBase, languageArticle) {
          var queryParams = {
            SearchKeyWord: searchInput,
            KnowledgeBase: knowledgeBase,
            ArticleLanguage: languageArticle
          };
          var queryString = jQuery.param(queryParams);
          $http.get("/api/now/kbblocks/getkbblocksInformation?" + queryString)
            .success(function(answer) {
              $scope.kbBlockResults = answer;
            });
        };
        $scope.insertBlock = function(sys_id, number, short_description, can_read, cannot_read) {
          var kbContentWindow = document.getElementById('gsft_main').contentWindow;
          var time = new Date();
          var id = 'kbblock_' + number + '_' + time.getTime() + '_kbblock';
          var sanitizedShortDescription = $sanitize(short_description);
          var kbBlockSnippet = '<div id="' + id + '" class="kb-block-content-item mceNonEditable" contenteditable="false" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; disabled: true; display: block; color: #343d47;text-overflow: ellipsis; overflow: hidden; white-space: nowrap; line-height: 1.42857;font-weight: 700; width: 95%;">' +
            '<div class="block-info" style="display: inline-block; vertical-align: top;">' + number + '</br><span class="block-info" style="display:block;margin-top: 3px;">' + sanitizedShortDescription + '</span></br></div>' +
            '</div><br/> ';
          kbContentWindow.g_form.insertContentAtCursor('text', kbBlockSnippet);
          kbContentWindow.g_form.addInfoMessage(new kbContentWindow.GwtMessage().getMessage('Knowledge Block "{0}" has been inserted', sanitizedShortDescription));
        };
        $scope.advancedSearch = function(searchTxt, knowledgeBase, languageArticle) {
          var kbContentWindow = document.getElementById('gsft_main').contentWindow;
          var searchPath = "/kb_knowledge_block_list.do?sysparm_view=knowledge_block_search&sysparm_stack=kb_knowledge_list.do&sysparm_fixed_query=kb_knowledge_base%3D" + knowledgeBase + "%5Eworkflow_state%3Dpublished";
          searchPath += "^active=" + "true";
          searchPath += "^valid_to>=" + "javascript:gs.beginningOfToday()";
          searchTxt = $scope.appendPartialSearch(searchTxt);
          if (languageArticle) {
            if (!searchTxt)
              searchPath += "%5Elanguage%3D" + languageArticle;
            else
              searchPath += "%5Elanguage%3D" + languageArticle + "&sysparm_query=GOTO123TEXTQUERY321%3D" + searchTxt;
          } else if (searchTxt)
            searchPath += "&sysparm_query=GOTO123TEXTQUERY321%3D" + searchTxt;
          kbContentWindow.popupOpenStandard(searchPath);
        };
        $scope.openBlock = function(sys_id_in) {
          var theCompletePath = "/kb_knowledge_block.do?sys_id=" + sys_id_in;
          $window.open(theCompletePath, '_blank');
        };
        $scope.appendPartialSearch = function(searchTerm) {
          if (searchTerm.indexOf("*") == -1 &&
            searchTerm.indexOf('"') == -1 &&
            searchTerm.indexOf("'") != 0 &&
            searchTerm.indexOf("'") != (searchTerm.length - 1) &&
            searchTerm != "AND" &&
            searchTerm != "OR" &&
            searchTerm != "|")
            return searchTerm += "*";
          return searchTerm;
        };
      }
    };
  }]);;;;