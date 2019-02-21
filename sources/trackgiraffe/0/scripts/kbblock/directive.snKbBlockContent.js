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
  }]);;