/*! RESOURCE: /scripts/app.$sp/directive.spSearchNav.js */
angular.module('sn.$sp').directive('spSearchNav', function(i18n, $location, spFacetManager, $location) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      searchSources: '=',
      q: '=',
      t: '=',
      listView: '=',
      showToggle: '='
    },
    templateUrl: 'sp_search_nav.xml',
    controllerAs: 'c',
    controller: function($scope) {
      var c = this;
      c.i18n = {
        all: i18n.getMessage('All'),
        sources: i18n.getMessage('Sources'),
        search_categories: i18n.getMessage('Search Categories')
      };
      c.searchSources = getSearchSources($scope.searchSources);
      $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);

      function onLocationChangeSuccess(event, newUrl, oldUrl) {
        var page = pageChanged(newUrl, oldUrl);
        if (!pageChanged(newUrl, oldUrl) && searchSourceChanged(newUrl, oldUrl)) {
          var newUrlParams = newUrl.match(/t=.+/);
          if (!newUrlParams) {
            updateSelectedSearchSource(null);
          } else {
            updateSelectedSearchSource(newUrlParams[0].split("&")[0].substring(2));
          }
        }
      }

      function pageChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(/id=.+/),
          oldUrlParams = oldUrl.match(/id=.+/);
        if (!newUrlParams && !oldUrlParams) {
          return false;
        }
        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
          return true;
        }
        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
      }

      function searchSourceChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(/t=.+/),
          oldUrlParams = oldUrl.match(/t=.+/);
        if (!newUrlParams && !oldUrlParams) {
          return false;
        }
        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
          return true;
        }
        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
      }
      c.onSearchSourceClick = function(menu, input) {
        spFacetManager.clearAllFacet();
        $location.search("spa", "1");
        $location.search("q", $scope.q);
        if (input && input.value) {
          $location.search("t", input.value);
        } else {
          $location.search("t", null);
        }
        updateSelectedSearchSource(input.value);
      };

      function updateSelectedSearchSource(value) {
        var items = c.searchSources.items;
        if (value) {
          items.forEach(function(searchSource) {
            if (searchSource.value === value) {
              searchSource.selected = true;
            } else {
              searchSource.selected = false;
            }
          });
        } else {
          items.forEach(function(searchSource) {
            if (!searchSource.value) {
              searchSource.selected = true;
            } else {
              searchSource.selected = false;
            }
          });
        }
        c.searchSources.items = items;
      }

      function getSearchSources(data) {
        return {
          label: c.i18n.sources,
          id: 'searchSources',
          items: getSearchSourceItems(data)
        };
      }

      function getSearchSourceItems(data) {
        var values = _.values(data),
          sources = [];
        values.forEach(function(value) {
          sources.push({
            label: value.name,
            value: value.id,
            selected: value.id == $scope.t,
            order: value.order
          });
        })
        sources.sort(function(a, b) {
          return a.order - b.order;
        });
        sources.unshift({
          label: c.i18n.all,
          value: null,
          selected: !$scope.t
        });
        return sources;
      }
    }
  }
});;