/*! RESOURCE: /scripts/app.$sp/directive.spFacetLists.js */
angular.module('sn.$sp').directive('spFacetLists', function(spFacetManager) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          collapsed: '=',
          collapsedSearchsource: '=',
          toggleSearchsource: '=',
          listTitle: '=',
          searchSources: '='
        },
        template: '<div class="sp-facet-lists"><div ng-show="c.isLoading" class="loading-icon"><i class="fa fa-spinner fa-spin fa-3x fa-fw" style="font-size:24px"></i><span class="sr-only">{{::c.i18n.loading}}</span></div><div ng-show="c.show()"><div class="panel-heading heading"><div class="panel-title" aria-label="{{::listTitle}}">{{::listTitle}}</div></div><div ng-repeat="data in c.facets"><sp-facet-list collapsed="collapsed" collpased-map="c.facetToogleMap[data.searchSource]" collapsed-searchsource="c.isSearchSourceCollapsed(data.searchSource)" toggle-searchsource="toggleSearchsource" facets="data.facets" list-title="searchSources[data.searchSource].name" t="data.searchSource"></sp-facet-list></div></div></div>',
        controllerAs: 'c',
        controller: function($scope) {
            var c = this;
            c.facetToogleMap = {};
            c.searchSourceToggleMap = {};
            spFacetManager.subscribe("spFacets.refresh.data", "list", onFacetsData);
            spFacetManager.subscribe("spFacets.toggle.data", "list", onFacetToggle);
            spFacetManager.subscribe("spSearchSources.toggle.data", "list", onSearchSourceToggle);
            c.isLoading = true;
            c.show = function() {
              return !c.isLoading && !isEmpty(c.facetsObjectMap);
            };

            function onSearchSourceToggle(data) {
              c.searchSourceToggleMap[data.searchSource] = data.collapsed;
            }

            function onFacetToggle(data) {
              if (!c.facetToogleMap[data.searchSource]) {
                c.facetToogleMap[data.searchSource] = {};
              }
              c.facetToogleMap[data.searchSource][data.facetId] = data.collapsed;
            }
            c.isCollapsed = function(searchSource, facetId) {
                return c.facetToogleMap[searchSource] !== undefined && c.facetToogleMap[searchSource][facetI