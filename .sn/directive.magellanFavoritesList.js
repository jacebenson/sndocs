/*! RESOURCE: /scripts/app.magellan/directive.magellanFavoritesList.js */
angular.module('Magellan').directive('magellanFavoritesList', ['getTemplateUrl', '$timeout', 'snCustomEvent', 'userPreferences', 'magellan_FavoritesList', 'i18n',
    function(getTemplateUrl, $timeout, snCustomEvent, userPreferences, magellan_FavoritesList, i18n) {
        return {
            restrict: 'E',
            templateUrl: getTemplateUrl('magellan_favorites_list.xml'),
            scope: {
                currentFavorite: '=',
                favoritesList: '=',
                isLoading: '=',
                editMode: '=',
                isCollapsed: '=',
                activeView: '='
            },
            controller: function($scope, $rootScope, $element) {
                var messages = {
                    up: 'Item moved up',
                    down: 'Item moved down',
                    top: 'Item moved to top',
                    bottom: 'Item moved to bottom'
                };
                i18n.getMessages([
                    messages.up,
                    messages.down,
                    messages.top,
                    messages.bottom
                ], function(translations) {
                    for (var key in messages) {
                        var messageToTranslate = messages[key];
                        messages[key] = translations[messageToTranslate];
                    }
                });
                $scope.remove = function(favorite, evt) {
                    magellan_FavoritesList.remove(favorite);
                    if (typeof evt != 'undefined') {
                        evt.preventDefault();
                    }
                }
                $scope.sortableOptions = {
                    disabled: true,
                    axis: 'y'
                };
                $scope.updateCurrentFavorite = function(favorite) {
                    if (favorite.separator)
                        return;
                    $scope.currentFavorite = favorite;
                    $scope.$broadcast('currentFavorite.changed', favorite);
                };
                $scope.checkEditMode = function($event) {
                    if ($scope.editMode) {
                        $event.preventDefault();
                    }
                };
                $scope.favoriteFiltered = function() {
                    if ($scope.activeView !== 'filtered') {
                        return false;
                    }
                    var favFiltered = false;
                    $scope.favoritesList.forEach(function(fav) {
                        if (fav.filtered === false) {
                            favFiltered = true;
                        }
                    });
                    return favFiltered;
                }
                $rootScope.$on('magellan_FavoritesList.change', function(evt, list) {
                    $scope.favoritesList = list;
                });
                $rootScope.$on('magellan_EditMode.change', function(evt, mode) {
                    $scope.sortableOptions.disabled = !mode;
                });
                var deactivateKeyboardReorderPromise = null;
                $scope.onDragHandleBlur = function() {
                    $scope.focusFavorite = null;
                    deactivateKeyboardReorderPromise = $timeout(function() {
                        $scope.isKeyboardReorderActive = false;
                    }, 0);
                };

                function activateKeyboardReorder() {
                    if (deactivateKeyboardReorderPromise) {
                        $timeout.cancel(deactivateKeyboardReorderPromise);
                    }
                    $scope.isKeyboardReorderActive = true;
                }
                $scope.onDragHandleFocus = function(favorite) {
                    $scope.focusFavorite = favorite;
                };
                $scope.onDragHandleKeydown = function($event, originIndex) {
                    var numFavorites = $scope.favoritesList.length;
                    if (numFavorites < 1) {
                        return;
                    }
                    var keyCode = $event.keyCode;
                    if (!$scope.isKeyboardReorderActive) {
                        if (keyCode === 13) {
                            activateKeyboardReorder();
                        }
                        return;
                    }
                    if (keyCode === 27 || keyCode === 13) {
                        $scope.isKeyboardReorderActive = false;
                        return;
                    }
                    $event.preventDefault();
                    $event.stopPropagation();
                    var isUp = keyCode === 38,
                        isDown = keyCode === 40,
                        isFirst = originIndex === 0,
                        lastIndex = numFavorites - 1,
                        isLast = originIndex === lastIndex;
                    if (!isUp && !isDown || (isFirst && isUp) || (isLast && isDown)) {
                        return;
                    }
                    var destinationIndex = isUp ? originIndex - 1 : originIndex + 1,
                        itemMoved = $scope.favoritesList[originIndex],
                        itemDisplaced = $scope.favoritesList[destinationIndex];
                    $scope.favoritesList[originIndex] = itemDisplaced;
                    $scope.favoritesList[destinationIndex] = itemMoved;
                    if (isUp) {
                        $scope.ariaMessageFavoriteMoved =
                            destinationIndex === 0 ? messages.top : messages.up;
                    } else {
                        $scope.ariaMessageFavoriteMoved =
                            destinationIndex === lastIndex ? messages.bottom : messages.down;
                    }
                    $timeout(function() {
                        activateKeyboardReorder();
                        $event.target.focus();
                    }, 0, false);
                };
                $scope.onDragHandleKeypress = function($event) {
                    if ($event.keyCode === 13) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                };
            },
            link: function(scope, element) {
                var collapsedId, expandedId;
                jQuery(element).on('show.bs.collapse', function(e) {
                    $timeout(function() {
                        var $this = jQuery(e.target).siblings('[data-sn-toggle="collapse"]');
                        var id = $this.data('id');
                        $this.addClass('expanded ');
                        if (id && id !== expandedId) {
                            magellan_FavoritesList.setOpen(id);
                            userPreferences.setPreference('favorite.' + id + '.expanded', 'true');
                            userPreferences.setPreference('favorite.' + id + '.collapsed', '');
                            collapsedId = '';
                            expandedId = id;
                        }
                    }, 200);
                });
                jQuery(element).on('hide.bs.collapse', function(e) {
                    $timeout(function() {
                        var $this = jQuery(e.target).siblings('[data-sn-toggle="collapse"]');
                        var id = $this.data('id');
                        $this.removeClass('expanded');
                        if (id && id !== collapsedId) {
                            magellan_FavoritesList.setClosed(id);
                            userPreferences.setPreference('favorite.' + id + '.expanded', '');
                            userPreferences.setPreference('favorite.' + id + '.collapsed', 'true');
                            expandedId = '';
                            collapsedId = id;
                        }
                    }, 200);
                });
                scope.init = function(first, favorite) {
                    scope.addTooltip(first);
                    scope.updateCurrentFavorite(favorite);
                };
                scope.addTooltip = function(first) {
                    if (first) {
                        $timeout(function() {
                            jQuery(element).find('.icon').tooltip({
                                placement: 'right',
                                container: 'body'
                            });
                            jQuery(element).find('.nav-icon').on('show.bs.tooltip', function() {
                                if (!scope.$parent.isCollapsed) {
                                    return false;
                                }
                            });
                        });
                    }
                };
                scope.$on('currentFavorite.changed', function(favorite) {
                    angular.element('#favorite-title').focus();
                });
            }
        };
    }
]);;