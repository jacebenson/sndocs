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
        return c.facetToogleMap[searchSource] !== undefined && c.facetToogleMap[searchSource][facetId] !== undefined ? c.facetToogleMap[searchSource][menuId] : $scope.collapsed;
      }
      c.isSearchSourceCollapsed = function(searchSource) {
        return c.searchSourceToggleMap[searchSource] !== undefined ? c.searchSourceToggleMap[searchSource] : $scope.collapsedSearchsource;
      }

      function isEmpty(facetsObjectMap) {
        if (!facetsObjectMap) {
          return true;
        }
        for (var searchSource in facetsObjectMap) {
          if (facetsObjectMap[searchSource] && facetsObjectMap[searchSource].length > 0) {
            return false;
          }
        }
        return true;
      }

      function getFacets(facetsObjectMap) {
        var facetArray = [];
        for (var searchSource in facetsObjectMap) {
          var data = {};
          data.searchSource = searchSource;
          data.facets = facetsObjectMap[searchSource];
          data.order = $scope.searchSources[searchSource].order;
          facetArray.push(data);
        }
        facetArray.sort(function(a, b) {
          return a.order - b.order;
        });
        return facetArray;
      }

      function onFacetsData(params) {
        c.facetsObjectMap = params.data;
        c.facets = getFacets(c.facetsObjectMap);
        c.isLoading = false;
        updateFacet(params.query);
      }

      function updateFacet(queries) {
        var keys = Object.keys(queries),
          t = queries.t;
        keys.forEach(function(k) {
          var queryContent = queries[k];
          var values = [];
          if (queryContent.charAt(0) === '[' && queryContent.charAt(queryContent.length - 1) === ']') {
            queryContent = queryContent.substring(1, queryContent.length - 1);
            values = queryContent.split(",");
          } else {
            values.push(queryContent);
          }
          values.forEach(function(value) {
            value = value.split("%2C").join(",");
            var item = findItem(t, k, value);
            if (item) {
              item.selected = true;
              c.showClearAll = true;
            }
          });
        });
      }

      function findItem(t, key, value) {
        var facets = c.facetsObjectMap[t];
        if (facets && facets.length > 0) {
          var f = facets.filter(function(d) {
            return d.id === key;
          });
          if (f && f.length > 0) {
            var item = f[0].items.filter(function(i) {
              return i.value === value;
            });
            return item[0];
          }
          return null;
        }
      }
    }
  }
});;