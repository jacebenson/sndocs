/*! RESOURCE: /scripts/app.magellan/factory.magellan_FavoritesList.js */
angular.module('Magellan').factory('magellan_FavoritesList', ['$rootScope', '$q', 'magellan_Endpoint', 'snCustomEvent', 'glideUrlBuilder', function($rootScope, $q, magellan_Endpoint, snCustomEvent, glideUrlBuilder) {
        var favoritesList = [];
        var currentFavorite;

        function Favorite(favorite) {
          return {
            id: favorite.id,
            order: favorite.order,
            title: favorite.title,
            type: favorite.type,
            table: favorite.table,
            targetSysId: favorite.targetSysId,
            color: favorite.color,
            group: favorite.group,
            image: favorite.image,
            icon: favorite.icon,
            flyout: favorite.flyout,
            url: buildFavoritesURL(favorite),
            filtered: favorite.filtered,
            applicationId: favorite.applicationId,
            favorites: buildFavoritesList(favorite.favorites),
            open: favorite.open,
            windowName: favorite.windowName,
            module: favorite.module,
            separator: favorite.separator
          };
        }

        function buildFavoritesList(favorites) {
          if (favorites && favorites.length > 0) {
            var list = [];
            for (var i = 0; i < favorites.length; i++) {
              if (!favorites[i].icon && !favorites[i].separator)
                favorites[i].icon = "article-document";
              if (!favorites[i].color && !favorites[i].separator)
                favorites[i].color = "normal";
              list.push(new Favorite(favorites[i]));
            }
            return list;
          }
          return [];
        }

        function buildFavoritesURL(favorite) {
          if (typeof favorite === 'undefined')
            return;
          if (favorite.type !== 'LIST')
            return favorite.url;
          var url = glideUrlBuilder.newGlideUrl(favorite.url);
          url.encode = false;
          url.addParam('sysparm_clear_stack', 'true');
          return url.getURL();
        }

        function filter(filterText) {
          var i, j, k, list, subList, showParent, showSeparator;
          if (typeof filterText === 'undefined' || filterText.length === 0) {
            clearFiltered();
            return false;
          }
          filterText = filterText.toLowerCase();
          for (i = 0; i < favoritesList.length; i++) {
            if (hasText(favoritesList[i], filterText)) {
              showListSection(favoritesList[i]);
            } else {
              favoritesList[i].filtered = true;
              showParent = false;
              if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
                list = favoritesList[i].favorites;
                for (j = 0; j < list.length; j++) {
                  if (hasText(list[j], filterText)) {
                    showListSection(list[j]);
                    showParent = true;
                  } else {
                    list[j].filtered = true;
                    showSeparator = false;
                    if (list[j].favorites && list[j].favorites.length) {
                      subList = list[j].favorites;
                      for (k = 0; k < subList.length; k++) {
                        if (hasText(subList[k], filterText)) {
                          showListSection(subList[k]);
                          showParent = true;
                          showSeparator = true;
                        } else {
                          subList[k].filtered = true;
                        }
                      }
                      if (showSeparator) {
                        list[j].filtered = false;
                      }
                    }
                  }
                }
                if (showParent) {
                  favoritesList[i].filtered = false;
                }
              }
            }
          }
          return true;
        }

        function showListSection(favorite) {
          if (typeof favorite === 'undefined') {
            return;
          }
          var i, j, sublist, list;
          favorite.filtered = false;
          if (favorite.favorites && favorite.favorites.length) {
            list = favorite.favorites;
            for (i = 0; i < list.length; i++) {
              list[i].filtered = false;
              if (list[i].favorites && list[i].favorites.length) {
                subList = list[i].favorites;
                for (j = 0; j < subList.length; j++) {
                  subList[j].filtered = false;
                }
              }
            }
          }
        }

        function hasText(favorite, filterText) {
          return favorite.title && favorite.title.toLowerCase().indexOf(filterText) != -1;
        }

        function clearFiltered() {
          for (var i = 0; i < favoritesList.length; i++) {
            favoritesList[i].filtered = undefined;
            if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
              var list = favoritesList[i].favorites;
              for (var j = 0; j < list.length; j++) {
                list[j].filtered = undefined;
                if (list[j].favorites && list[j].favorites.length) {
                  var subList = list[j].favorites;
                  for (var k = 0; k < subList.length; k++) {
                    subList[k].filtered = undefined;
                  }
                }
              }
            }
          }
        }

        function loadData() {
          var deferred = $q.defer();
          magellan_Endpoint.Favorites.get().then(function(result) {
            populate(result.list);
            deferred.resolve();
          }, function() {
            deferred.reject();
          });
          return deferred.promise;
        }

        function populate(favorites) {
          window.NOW = window.NOW || {};
          window.NOW.favoritesList = buildFavoritesList(favorites);
          favoritesList = buildFavoritesList(favorites);
          removeEmptySeparators();
          if (favoritesList) {
            currentFavorite = favoritesList[0];
          } else {
            currentFavorite = {};
          }
          if (window.top && window.top.Magellan && window.top.Magellan.favorite) {
            window.top.Magellan.current = favoritesList;
          }
          $rootScope.$emit('magellan_FavoritesList.change', favoritesList);
          snCustomEvent.fireAll('magellan_FavoritesList.change', favoritesList);
        }

        function update(favorites) {
          magellan_Endpoint.Groups.update(favorites).then(function(result) {
            populate(favorites);
          });
        }

        function add(favorite) {
          magellan_Endpoint.Favorites.create(favorite).then(function(result) {
            snCustomEvent.fireAll('magellanNavigator:favoriteSaved', new Favorite(result.favorite));
          });
        }
        snCustomEvent.observe('magellanNavigator:createFavorite', function(favorite) {
          add(favorite);
        });
        snCustomEvent.observe('magellanNavigator:favoriteSaved', function(favorite) {
          addFavorite(new Favorite(favorite));
        });
        snCustomEvent.observe('magellanNavigator:favoriteGroupSaved', function(favorite) {
          addFavorite(new Favorite(favorite));
        });
        snCustomEvent.observe('magellanNavigator:favoriteGroupRemoved', function(id) {
          for (var i = 0; i < favoritesList.length; i++) {
            if (favoritesList[i].applicationId && favoritesList[i].applicationId == id) {
              removeModulesFromList(favoritesList[i]);
              break;
            }
          }
          for (i = 0; i < favoritesList.length; i++) {
            if (favoritesList[i].applicationId && favoritesList[i].applicationId == id) {
              favoritesList.splice(i, 1);
              populate(favoritesList);
              return;
            }
          }
        });
        snCustomEvent.observe('magellanNavigator:favoriteModuleRemoved', function(id) {
          var removing = true;
          while (removing) {
            removing = removeModule(id);
          }
        });
        snCustomEvent.observe('magellanNavigator:favoriteRemoved', function(id) {
          var removing = true;
          while (removing) {
            removing = removeID(id);
          }
        });

        function removeID(id) {
          return removeFavorite('id', id);
        }

        function removeModule(id) {
          return removeFavorite('module', id);
        }

        function removeFavorite(prop, id) {
          for (var i =