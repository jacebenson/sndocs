/*! RESOURCE: /scripts/app.magellan/directive.magellanEditFavorites.js */
angular.module('Magellan').directive('magellanEditFavorites', ['getTemplateUrl', 'magellan_FavoritesList', 'userPreferences', function(getTemplateUrl, magellan_FavoritesList, userPreferences) {
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('magellan_edit_favorites.xml'),
        scope: {
            favoritesList: '=',
            currentFavorite: '='
        },
        controller: function($scope, $rootScope) {
            userPreferences.getPreference('glide.ui.edit_favorites.hide_confirm').then(function(hideConfirm) {
                $scope.hideConfirm = hideConfirm == "true" ? true : false;
            });
            $rootScope.$on('magellanColorPicker:colorSelected', function(evt, color) {
                if ($scope.currentFavorite) {
                    if ($scope.currentFavorite.group && $scope.currentFavorite.favorites) {
                        for (var i = 0; i < $scope.currentFavorite.favorites.length; i++) {
                            $scope.currentFavorite.favorites[i].color = color;
                        }
                    } else {
                        $scope.currentFavorite.color = color;
                    }
                }
            });
            $rootScope.$on('magellanIconPicker:iconSelected', function(evt, icon) {
                if ($scope.currentFavorite) {
                    $scope.currentFavorite.icon = icon;
                }
            });
            $scope.contains = function(id) {
                for (var i = 0; i < $scope.favoritesList; i++) {
                    if (id == $scope.favoritesList[i].id) {
                        return true;
                    }
                }
                return false;
            };
            $rootScope.$on('magellan_FavoritesList.updateFavorites', function() {
                $scope.updateFavorites();
            });
            $scope.updateFavorites = function() {
                magellan_FavoritesList.update($scope.favoritesList);
                $rootScope.$broadcast('magellan_closeEditFavorites');
            };
            $rootScope.$on('magellan_FavoritesList.change', function() {
                if (!$scope.currentFavorite || !$scope.currentFavorite.id) {
                    $scope.currentFavorite = magellan_FavoritesList.currentFavorite;
                }
            });
            $scope.removeFavorite = function() {
                magellan_FavoritesList.remove($scope.currentFavorite).then(function() {
                    jQuery('.popover').popover('hide');
                    $scope.favoritesList = magellan_FavoritesList.favoritesList;
                    $scope.currentFavorite = magellan_FavoritesList.currentFavorite;
                    if (!$scope.favoritesList || $scope.favoritesList.length === 0) {
                        $rootScope.$broadcast('magellan_closeEditFavorites');
                    }
                });
            };
        },
        link: function(scope, element) {
            element.on('change', '[name=hide-confirm]', function() {
                var hideConfirm = angular.element(this).prop('checked');
                scope.hideConfirm = hideConfirm;
                if (hideConfirm) {
                    userPreferences.setPreference('glide.ui.edit_favorites.hide_confirm', 'true');
                    scope.removeFavorite();
                } else {
                    userPreferences.setPreference('glide.ui.edit_favorites.hide_confirm', '');
                }
            });
        }
    };
}]);;