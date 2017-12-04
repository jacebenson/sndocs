/*! RESOURCE: /scripts/app.magellan/js_includes_magellan.js */
/*! RESOURCE: /scripts/magellan.js */
$j(function($) {
  "use strict";
  var TEXT = 'text';
  var MESSAGES = window.top.Magellan.globals.messages;
  $('#nav_west').tooltip({
    placement: 'bottom',
    container: 'body',
    selector: '.nav-views.sn-navhub-content>div'
  });
  $(document).on('dragover', '#nav_west_center', function(event) {
    event.preventDefault();
  });
  $(document).on('drop', '#nav_west_center', function(event) {
    event.preventDefault();
    var t = event.originalEvent.dataTransfer.getData('text');
    if (typeof t == 'string' && t.length) {
      try {
        t = JSON.parse(t);
        CustomEvent.fireAll('magellanNavigator:createFavorite', t);
      } catch (e) {}
    }
  });
  var $doc, $win;
  $('#gsft_main').on('load', function() {
    $doc = $(this.contentWindow.document);
    $doc.on('drop', function(event) {
      event.preventDefault();
      CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_STOP);
    });
    $doc.on('dragstart', 'a, img', function(event) {
      onFavoriteDragStart(event, this);
    });
    $doc.on('dragend', 'a, img', function(event) {
      CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_STOP);
    });
    $win = $(this.contentWindow).on('unload', function() {
      $doc.off();
      $doc.unbind();
      $doc = null;
      $win.off();
      $win.unbind();
      $win = null;
    });
  });
  var onFavoriteDragStart = function(event, elem) {
    var $elem = $(elem);
    var container;
    if ($elem.hasClass('sn-breadcrumb-filter')) {
      container = $elem.parents('.breadcrumb-container');
      setBreadcrumb(event, $elem, container, 'sn-breadcrumb-filter');
    } else if ($elem.hasClass('breadcrumb_link')) {
      container = $elem.parents('.breadcrumb_container');
      setBreadcrumb(event, $elem, container, 'breadcrumb_link');
    } else if ($elem.hasClass('breadcrumb') && $elem.attr('name') == 'breadcrumb') {
      event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
        icon: 'book',
        url: $elem.attr('href'),
        table: table,
        title: table + ": " + $elem.text()
      }));
    } else if ($elem.hasClass('list-select-record') || $elem.hasClass('linked') || $elem.hasClass('report_link') || $elem.hasClass('kb_link') || $elem.hasClass('service_catalog')) {
      event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
        icon: 'form',
        url: $elem.attr('href').replace(/.*nav_to.do\?uri=/i, ''),
        title: $elem.text()
      }));
    } else {
      return
    }
    CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_START);
  };
  var setBreadcrumb = function(event, $elem, container, linkClass) {
    var table = container.attr('table');
    var fixedQuery = container.attr('fixed_query');
    var view = container.attr('view');
    var filter = $elem.attr('filter');
    event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
      icon: 'book',
      url: table + '_list.do?sysparm_query=' + (filter ? encodeURIComponent(filter) : '') +
        '&sysparm_fixed_query=' + (fixedQuery ? encodeURIComponent(fixedQuery) : '') +
        (view ? '&sysparm_view=' + view : ''),
      table: table,
      title: table + ": " + getBreadcrumbText($elem, container, linkClass)
    }));
  }
  var getBreadcrumbText = function($elem, container, linkClass) {
    var textArray = [];
    var links = container.find('a.' + linkClass);
    var index = links.index($elem);
    links.each(function(idx) {
      var text = $(this).find('b').text();
      if (!text) {
        text = $(this).find('[aria-hidden=true]').text();
      }
      if (!text) {
        text = $(this).text();
      }
      textArray.push(text);
      if (idx == index)
        return false;
    });
    return textArray.join(' > ');
  };
  $('.magellan_navigator').on('keydown', function(evt) {
    if (evt.keyCode == 38 || evt.keyCode == 40) {
      var focused = $(document.activeElement);
      var nav = focused.parents('.magellan_navigator');
      if (nav.length) {
        evt.preventDefault();
        var list = $('#gsft_nav a:visible, #filter').not('.app-node, .nav-expandable, .nav-favorite-app, .sn-widget-list_v2, .icon-chevron-right, .sn-aside-btn');
        var highlight = $('#gsft_nav a:focus, #gsft_nav a.state-active');
        var index, next;
        if (highlight && highlight.length) {
          index = list.index(highlight);
          highlight.removeClass('state-active');
        }
        if (typeof index == 'undefined' || index == -1) {
          index = list.index(focused);
        }
        if (evt.keyCode == 40) {
          next = list.get(index + 1);
          if (next)
            next.focus();
        } else if (evt.keyCode == 38) {
          next = list.get(index - 1);
          if (next && index != 0)
            next.focus();
        }
      }
    }
  });
  $('.magellan_navigator').on('dblclick', '.allApps.state-active', function() {
    var openList = $('#gsft_nav').find('.nav-application-tree > .sn-widget > .collapse.in');
    var el = $('#concourse_application_tree')[0];
    var scope = angular.element(el).scope();
    if (openList.length) {
      scope.closeAllApplications().then(function() {
        openList.collapse('hide');
      });
    } else {
      scope.renderAllApplications().then(function() {
        var appsList = $('#gsft_nav').find('.nav-application-tree > .sn-widget > .collapse');
        appsList.collapse('show');
      });
    }
  });
  $('.magellan_navigator').on('click', '.nav-favorite-module', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var $this = $(this);
    var id = $this.data('id');
    if (id) {
      if ($this.hasClass('icon-star-empty')) {
        setFavorite($this, true);
        $this.parent().addClass('state-overwrite');
        $.ajax({
          url: '/api/now/ui/favorite/module',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          },
          data: JSON.stringify({
            'id': id
          })
        }).done(function(response) {
          if (response && response.result && response.result.favorite) {
            CustomEvent.fireAll('magellanNavigator:favoriteSaved', response.result.favorite);
          }
        });
      } else {
        $this.parent().removeClass('state-overwrite');
        $.ajax({
          url: '/api/now/ui/favorite/module?id=' + id,
          type: 'DELETE',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          }
        }).done(function() {
          CustomEvent.fireAll('magellanNavigator:favoriteModuleRemoved', id);
          setFavorite($('[data-id=' + id + '].nav-favorite-module'), false);
        })
      }
    }
  });
  $('.magellan_navigator').on('click', '.nav-favorite-app', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var $this = $(this);
    if ($this.hasClass('icon-star-empty')) {
      var id = $this.data('id');
      var title = $this.data('favorite-title');
      $this.parent().addClass('state-overwrite');
      if (id && title) {
        setFavorite($this, true);
        var modules = $this.parents('li').find('.nav-favorite-module');
        setFavorite(modules, true);
        $.ajax({
          url: '/api/now/ui/favorite/application',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          },
          data: JSON.stringify({
            'application': id,
            'title': title
          })
        }).done(function(response) {
          if (response && response.result && response.result.group) {
            CustomEvent.fireAll('magellanNavigator:favoriteGroupSaved', response.result.group);
          }
        });
      }
    } else {
      var id = $this.data('id');
      $this.parent().removeClass('state-overwrite');
      if (id) {
        $.ajax({
          url: '/api/now/ui/favorite/application?id=' + id,
          type: 'DELETE',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          }
        }).done(function() {
          CustomEvent.fireAll('magellanNavigator:favoriteGroupRemoved', id);
          CustomEvent.fireAll('magellanNavigator:unstarFavoritedGroup', id);
        });
      }
    }
  });
  $('.magellan_navigator').on('click', '.nav-edit-app', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var id = $(this).data('id');
    window.open('/sys_app_application.do?sysparm_clear_stack=true&sys_id=' + id, 'gsft_main');
  });
  $('.magellan_navigator').on('click', '.nav-edit-module', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var id = $(this).data('id');
    window.open('/sys_app_module.do?sysparm_clear_stack=true&sys_id=' + id, 'gsft_main');
  });
  CustomEvent.observe('magellanNavigator:unstarFavoritedGroup', function(id) {
    var app = $('[data-id=' + id + '].nav-favorite-app');
    setFavorite(app, false);
    var modules = app.parents('li').find('.nav-favorite-module');
    setFavorite(modules, false);
  });
  CustomEvent.observe('magellanNavigator:favoriteSaved', function(favorite) {
    if (favorite && favorite.module) {
      var module = $('[data-id=' + favorite.module + '].nav-favorite-module');
      setFavorite(module, true);
    }
  });
  CustomEvent.observe('magellanNavigator:favoritedModuleRemoved', function(favorite) {
    if (favorite && favorite.module) {
      var module = $('[data-id=' + favorite.module + '].nav-favorite-module');
      setFavorite(module, false);
    }
  });
  CustomEvent.observe('magellan_EditMode.change', function(mode) {
    if (mode) {
      $('.navpage-layout').addClass('magellan-edit-mode');
      setTimeout(function() {
        var editFavorites = $('#nav_edit_favorites_hidden');
        var takeover = $('<div id="nav_edit_favorites_takeover" role="main" aria-labelledby="nav_edit_favorites_title">');
        takeover.css({
          'left': '-100%'
        });
        takeover.append(editFavorites.children().detach());
        $('body').append(takeover);
        $('main').css('visibility', 'hidden');
        $('.navpage-right').css('display', 'none');
        takeover.velocity({
          'left': '0'
        }, {
          easing: 'easeInQuad',
          complete: function() {
            $('#favorite-title').focus();
          }
        });
      }, 400);
    } else {
      $('main').css('visibility', 'visible');
      $('.navpage-right').css('display', 'block');
      var takeover = $('#nav_edit_favorites_takeover');
      if (takeover.length) {
        takeover.velocity({
          'left': '-100%'
        }, {
          easing: 'easeOutQuad',
          complete: function() {
            $('#nav_edit_favorites_hidden').append(takeover.children().detach());
            takeover.remove();
            $('[aria-controls="nav_edit_favorites"]').focus();
          }
        });
      }
      setTimeout(function() {
        $('.navpage-layout').removeClass('magellan-edit-mode');
      }, 400);
    }
  });

  function setFavorite($el, isFavorite) {
    if (isFavorite) {
      $el.parent().addClass('state-overwrite');
      $el.removeClass('icon-star-empty')
        .addClass('icon-star')
        .attr({
          'title': MESSAGES.remove_from_favorites,
          'aria-label': MESSAGES.remove_from_favorites
        });
    } else {
      $el.parent().removeClass('state-overwrite');
      $el.removeClass('icon-star')
        .addClass('icon-star-empty')
        .attr({
          'title': MESSAGES.add_to_favorites,
          'aria-label': MESSAGES.add_to_favorites
        });
    }
    $el.attr('aria-pressed', isFavorite);
  }
  window.top.Magellan = (function() {
    this.favorite = (function() {
      var current;
      return {
        current: current
      };
    })();
    return this;
  }).call(window.top.Magellan);
});;
/*! RESOURCE: /scripts/app.magellan/app.js */
angular.module('Magellan', ['sn.base', 'sn.common', 'sn.dragdrop', 'sn.timeAgo', 'heisenberg', 'ng.shims.placeholder', 'Magellan.createFavorite'])
  .constant('VIEW_NAMES', {
    History: 'history',
    AllApps: 'allApps',
    Favorites: 'favorites',
    Filtered: 'filtered'
  }).config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false
    });
  }]).config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|javascript):/);
  }]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_Endpoint.js */
angular.module('Magellan').factory('magellan_Endpoint', function($http) {
  return {
    Navigator: {
      getApplications: function() {
        var url = '/api/now/ui/navigator';
        return $http.get(url).then(function(response) {
          if ((!response.data || !response.data.result) && response.status === 202) {
            return $http.get(url).then(function(response) {
              return response.data.result;
            });
          }
          return response.data.result;
        });
      },
      getApplicationsAndFavorites: function() {
        var url = '/api/now/ui/navigator/favorites';
        return $http.get(url).then(function(response) {
          if ((!response.data || !response.data.result) && response.status === 202) {
            return $http.get(url).then(function(response) {
              return response.data.result;
            });
          }
          return response.data.result;
        });
      }
    },
    Favorites: {
      create: function(favorite) {
        return $http.post('/api/now/ui/favorite', favorite).then(function(response) {
          return response.data.result;
        });
      },
      get: function() {
        return $http.get('/api/now/ui/favorite').then(function(response) {
          return response.data.result;
        });
      },
      remove: function(id, group) {
        return $http.delete('/api/now/ui/favorite?id=' + id + '&group=' + group).then(function(response) {});
      }
    },
    Groups: {
      update: function(favoritesList) {
        return $http.put('/api/now/ui/favorite/multiple', {
          'favorites': favoritesList
        }).then(function(response) {
          return response;
        });
      }
    },
    NavigatorHistory: {
      getHistory: function() {
        return $http.get('/api/now/ui/history').then(function(response) {
          return response;
        });
      },
      create: function() {
        return $http.post('/api/now/ui/history').then(function(response) {
          return response;
        });
      }
    }
  };
});;
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
    for (var i = 0; i < favoritesList.length; i++) {
      if (favoritesList[i][prop] && favoritesList[i][prop] == id) {
        favoritesList.splice(i, 1);
        populate(favoritesList);
        return true;
      }
      if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
        var list = favoritesList[i].favorites;
        for (var j = 0; j < list.length; j++) {
          if (list[j][prop] && list[j][prop] == id) {
            list.splice(j, 1);
            populate(favoritesList);
            return true;
          }
          if (list[j].favorites && list[j].favorites.length) {
            var subList = list[j].favorites;
            for (var k = 0; k < subList.length; k++) {
              if (subList[k][prop] && subList[k][prop] == id) {
                subList.splice(k, 1);
                populate(favoritesList);
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  function getByUrl(url) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].url == url) {
        return list[i];
      }
    }
  }

  function getByTableTargetAndType(params) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].table == params.table &&
        list[i].targetSysId == params.targetSysId &&
        list[i].type == params.type) {
        return list[i];
      }
    }
  }

  function remove(favorite) {
    var deferred = $q.defer();
    if (favorite.group && favorite.applicationId) {
      snCustomEvent.fireAll('magellanNavigator:unstarFavoritedGroup', favorite.applicationId);
    }
    if (favorite.module) {
      snCustomEvent.fireAll('magellanNavigator:favoritedModuleRemoved', favorite);
    }
    snCustomEvent.fireAll('magellanNavigator:favoriteRemoved', favorite.id);
    magellan_Endpoint.Favorites.remove(favorite.id, favorite.group).then(function() {
      removeFavoriteFromList(favorite);
      populate(favoritesList);
      deferred.resolve();
    }, function() {
      deferred.reject();
    });
    return deferred.promise;
  }

  function addFavorite(favorite) {
    var i;
    if (!favorite.id) {
      return;
    }
    var list = favoritesList;
    for (i = 0; i < list.length; i++) {
      if (list[i].id == favorite.id) {
        list[i] = new Favorite(favorite);
        populate(list);
        return;
      }
      if (list[i].favorites) {
        for (var j = 0; j < list[i].favorites.length; j++) {
          if (list[i].favorites[j].id == favorite.id) {
            list[i].favorites[j] = new Favorite(favorite);
            populate(list);
            return;
          }
        }
      }
    }
    list.push(new Favorite(favorite));
    populate(list);
  }

  function removeFavoriteFromList(favorite) {
    if (favorite && favorite.id) {
      removeFavorite('id', favorite.id);
    }
  }

  function removeModulesFromList(favorite) {
    var removing;
    if (favorite && favorite.favorites) {
      var list = favorite.favorites;
      for (var i = 0; i < list.length; i++) {
        removing = true;
        while (removing) {
          removing = removeModule(list[i].module);
        }
      }
    }
  }

  function setOpen(id) {
    var f = findFavoriteById(id);
    if (f) {
      f.open = true;
    }
  }

  function setClosed(id) {
    var f = findFavoriteById(id);
    if (f) {
      f.open = false;
    }
  }

  function findFavoriteById(id) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        return list[i];
      }
      if (list[i].favorites) {
        for (var j = 0; j < list[i].favorites.length; j++) {
          if (list[i].favorites[j].id == id) {
            return list[i].favorites[j];
          }
          if (list[i].favorites[j].favorites && list[i].favorites[j].favorites.length) {
            var subList = list[i].favorites[j].favorites;
            for (var k = 0; k < subList.length; k++) {
              if (subList[k].id == id) {
                return subList[k];
              }
            }
          }
        }
      }
    }
  }

  function findEmptySeparators() {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].favorites && list[i].favorites.length) {
        var subList = list[i].favorites;
        for (var j = 0; j < subList.length; j++) {
          if (subList[j].separator && subList[j].favorites && subList[j].favorites.length == 0) {
            return subList[j];
          }
        }
      }
    }
    return false;
  }

  function removeEmptySeparators() {
    var empty = findEmptySeparators();
    if (empty) {
      remove(empty);
    }
  }
  return {
    getByUrl: getByUrl,
    getByTableTargetAndType: getByTableTargetAndType,
    add: add,
    update: update,
    remove: remove,
    loadData: loadData,
    filter: filter,
    populate: populate,
    setOpen: setOpen,
    setClosed: setClosed,
    get favoritesList() {
      return favoritesList;
    },
    currentFavorite: currentFavorite
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_Permalink.js */
angular.module('Magellan').factory('magellan_Permalink', ['snCustomEvent', '$location', '$timeout', function(snCustomEvent, $location, $timeout) {
  return {
    init: function() {
      var originalTitle, formattedTitle;
      var setLocation = function(obj) {
        if (typeof obj.relativePath == 'string' && obj.relativePath != '')
          $timeout(function() {
            $location.path('nav_to.do').search({
              uri: obj.relativePath
            }).replace();
          }, 10);
        setTitle(obj.title);
      };
      var setTitle = function(title) {
        if (typeof title == 'string' && title != '' && title != originalTitle) {
          if (title.indexOf(formattedTitle) == -1)
            title += formattedTitle;
          document.title = title;
        } else
          document.title = originalTitle;
      };
      var initTitle = function(title) {
        originalTitle = title;
        formattedTitle = ' | ' + title;
      };
      initTitle(document.title);
      snCustomEvent.observe('magellanNavigator.permalink.set', function(obj) {
        if (obj)
          setLocation(obj);
      });
      snCustomEvent.observe('glide.product.name', function(value) {
        if (typeof value === "undefined" || value == "")
          value = 'ServiceNow';
        initTitle(value);
        setTitle(value);
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_HistoryList.js */
angular.module('Magellan').factory('magellan_HistoryList', ['snCustomEvent', '$rootScope', 'glideUrlBuilder', function(snCustomEvent, $rootScope, glideUrlBuilder) {
  var historyList = [];

  function NavigatorHistory(history) {
    this.id = history.id;
    this.title = history.title;
    this.targetSysId = history.targetSysId;
    this.table = history.table;
    this.url = history.url;
    this.prettyTitle = history.prettyTitle;
    this.description = history.description;
    this.createdString = history.createdString;
    this.timestamp = history.timestamp;
    this.timestampOffset = history.timestampOffset;
  }
  NavigatorHistory.prototype.getCreatedDate = function() {
    return new Date(this.timestamp).getTime();
  };

  function populate(list) {
    historyList = [];
    for (var i = 0; i < list.length; i++) {
      historyList.push(new NavigatorHistory(list[i]));
    }
  }

  function add(history) {
    removeDuplicates(history);
    historyList.unshift(new NavigatorHistory(history));
    $rootScope.$broadcast('magellan_HistoryList.change', historyList);
  }

  function removeDuplicates(history) {
    if (history.timestampOffset) {
      for (var i = 0; i < historyList.length; i++) {
        var compare = historyList[i];
        if (compare.timestamp > history.timestampOffset) {
          if (sameUrl(compare.url, history.url)) {
            historyList.splice(i, 1);
          }
        } else {
          break;
        }
      }
    }
  }

  function sameUrl(a, b) {
    var blacklist;
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    a = a.replace('/', '');
    b = b.replace('/', '');
    if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.paramBlacklist) {
      blacklist = window.top.Magellan.globals.paramBlacklist;
    }
    if (blacklist) {
      var urlA = glideUrlBuilder.newGlideUrl(a);
      var urlB = glideUrlBuilder.newGlideUrl(b);
      var keys = Object.keys(jQuery.extend({}, urlA.getParams(), urlB.getParams()));
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        if (blacklist && blacklist.indexOf(key) != -1) {
          continue;
        }
        if (urlA.getParam(key) == urlB.getParam(key)) {
          continue;
        }
        return false;
      }
      return urlA.contextPath === urlB.contextPath;
    } else {
      return a === b;
    }
  }
  snCustomEvent.observe('magellanNavigator.historyAdded', function(data) {
    add(data.history);
  });
  return {
    get historyList() {
      return historyList;
    },
    populate: populate,
    add: add
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/controller.MagellanCtrl.js */
angular.module('Magellan').controller('MagellanCtrl',
  function(
    $scope,
    $rootScope,
    $element,
    i18n,
    magellan_Endpoint,
    magellan_FavoritesList,
    magellan_HistoryList,
    $timeout,
    snCustomEvent,
    userPreferences,
    VIEW_NAMES,
    keyboardRegistry,
    magellan_Permalink,
    $animate,
    snTabActivity,
    concourseNavigatorService
  ) {
    'use strict';
    snTabActivity.setAppName("magellan");
    $animate.enabled($element, false);
    magellan_Permalink.init();
    var ActiveViewPrefKey = 'navigator.activeView';
    var CollapsedNavPrefKey = 'navigator.collapsed';
    var animatingEditPane = false;
    $scope.views = [{
        viewName: VIEW_NAMES.AllApps,
        icon: "icon-all-apps",
        title: i18n.getMessage("All applications"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.Favorites,
        icon: "icon-star",
        title: i18n.getMessage("Favorites"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.History,
        icon: "icon-history",
        title: i18n.getMessage("Your history"),
        isEnabled: true,
        isActive: false
      }
    ];
    $scope.navigatorLoaded = false;
    $scope.editMode = false;
    $scope.isCollapsed = false;
    $scope.filterText = '';
    $scope.defaultView = loadDefaultView();
    $scope.data = {
      isLoading: true,
      favoritesList: magellan_FavoritesList.favoritesList,
      currentFavorite: magellan_FavoritesList.currentFavorite,
      historyList: magellan_HistoryList.historyList
    };
    $scope.changeActiveView = function(viewName) {
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', -1);
      $scope.activeView = viewName;
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', 0).focus();
      $scope.filterTextValue('');
      if ([VIEW_NAMES.AllApps, VIEW_NAMES.Favorites].indexOf(viewName) != -1)
        userPreferences.setPreference('navigator.activeView', viewName);
    };
    $scope.keyChangeActiveView = function(e) {
      if (!(e.keyCode == 39 || e.keyCode == 37))
        return;
      e.preventDefault();
      for (var i = 0; i < $scope.views.length; i++) {
        if ($scope.views[i].viewName == $scope.activeView) {
          if (e.keyCode == 39)
            $scope.changeActiveView($scope.views[(i + 1) % $scope.views.length].viewName);
          else if (e.keyCode == 37)
            $scope.changeActiveView($scope.views[(i - 1 + $scope.views.length) % $scope.views.length].viewName);
          return;
        }
      }
    }
    $scope.navigate = function(url, target) {
      if (url) {
        if (target && target != 'gsft_main') {
          window.open(url, target);
        } else {
          jQuery('#gsft_main').attr('src', url);
          snCustomEvent.fire("glide:nav_open_url", {
            url: url,
            openInForm: false
          });
        }
      }
    };
    $scope.clearFilterText = function() {
      $scope.filterTextValue('');
      $scope.focusFilter();
    };
    $scope.toggleCollapse = function(toggleBodyClass, collapsed, evt) {
      if (evt && evt.keyCode && (evt.keyCode == 13 || evt.keyCode == 9))
        return;
      if (!$scope.editMode) {
        if (typeof collapsed !== 'undefined') {
          $scope.isCollapsed = collapsed;
        } else {
          $scope.isCollapsed = !$scope.isCollapsed;
        }
        if ($scope.isCollapsed == true)
          userPreferences.setPreference('navigator.collapsed', "yes");
        else
          userPreferences.setPreference('navigator.collapsed', "no");
        if (toggleBodyClass)
          jQuery('#nav_west_north, #nav_west_center').hide();
        jQuery('.navpage-layout').toggleClass('navpage-nav-collapsed');
        $timeout(function() {
          jQuery('#nav_west_north, #nav_west_center').fadeIn(400);
        }, 200);
        if ($scope.isCollapsed) {
          $scope.preservedView = $scope.activeView;
          $scope.changeActiveView(VIEW_NAMES.Favorites);
          jQuery(document).trigger('nav.collapsed');
        } else {
          $scope.activeView = "allApps";
          jQuery(document).trigger('nav.expanding');
          $timeout(function() {
            if (angular.isDefined($scope.preservedView)) {
              $scope.changeActiveView($scope.preservedView);
            }
            jQuery(document).trigger('nav.expanded');
          }, 350);
        }
      }
    };
    $scope.openNavigator = function(toggleBodyClass) {
      if ($scope.isCollapsed && !$scope.editMode) {
        $scope.toggleCollapse(toggleBodyClass, false);
      }
    };
    snCustomEvent.on('magellan_collapse.toggle', function() {
      $scope.toggleCollapse(true);
    });
    concourseNavigatorService.onChangeVisibility(function() {
      $timeout(function() {
        filterFavorites();
      });
    });
    loadData();

    function loadData() {
      magellan_Endpoint.Navigator.getApplicationsAndFavorites().then(function(result) {
        concourseNavigatorService.applications = result.applications;
        if (result.favorites) {
          magellan_FavoritesList.populate(result.favorites);
          $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
          $scope.data.currentFavorite = magellan_FavoritesList.currentFavorite;
        }
        if (result.history) {
          magellan_HistoryList.populate(result.history);
          $scope.data.historyList = magellan_HistoryList.historyList;
        }
        $scope.data.isLoading = false;
        filterFavorites();
        toggleNavPaneVisibility(result.applications);
      });
    }
    snCustomEvent.on('navigator.refresh', function() {
      loadData();
    });

    function filterFavorites() {
      magellan_FavoritesList.filter($scope.filterText);
      render();
    }

    function render() {
      $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
      if ($scope.filterText !== '') {
        $scope.activeView = VIEW_NAMES.Filtered;
        jQuery('#gsft_nav .nav-favorites-list .collapse').addClass("in").css("height", "auto");
      } else {
        if ($scope.activeView == VIEW_NAMES.Filtered) {
          $scope.activeView = $scope.defaultView;
        }
      }
    }

    function loadDefaultView() {
      userPreferences.getPreference(ActiveViewPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null')
          $scope.defaultView = resp;
      });
      userPreferences.getPreference(CollapsedNavPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null') {
          if (resp == "yes")
            $scope.toggleCollapse(true);
        }
      });
      return VIEW_NAMES.AllApps;
    }
    $scope.focusFilter = function() {
      if ($scope.isCollapsed) {
        $scope.toggleCollapse(true);
        $timeout(function() {
          angular.element('#filter').focus();
        }, 200);
      } else {
        $timeout(function() {
          angular.element('#filter').focus();
        });
      }
    };
    $scope.toggleEditMode = function() {
      if (animatingEditPane) {
        return;
      }
      animatingEditPane = true;
      setTimeout(function() {
        animatingEditPane = false;
      }, 410);
      if ($scope.editMode) {
        magellan_FavoritesList.update($scope.data.favoritesList);
        $scope.changeActiveView($scope.currentActiveView);
      } else {
        $scope.currentActiveView = $scope.activeView;
        $scope.changeActiveView('favorites');
      }
      $scope.editMode = !$scope.editMode;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    };
    $rootScope.$on('magellan_closeEditFavorites', function() {
      $scope.editMode = false;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    });
    $rootScope.$on('magellan_FavoritesList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });
    $rootScope.$on('magellan_HistoryList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });

    function _applyUtil($scope, f) {
      if (!$scope.$$phase) {
        $scope.$apply(f);
      } else {
        f();
      }
    }
    $rootScope.$on('applicationTree.rendered', function() {
      if (!$scope.navigatorLoaded) {
        _applyUtil($scope, function() {
          $scope.navigatorLoaded = true;
          $scope.activeView = $scope.defaultView;
          snCustomEvent.fire('nav.loaded');
        });
      }
    });
    $scope.$on('nav.toggleCollapse', function() {
      if (jQuery('.navpage-layout').hasClass('navpage-nav-collapsed')) {
        $scope.$apply(function() {
          $scope.toggleCollapse(false);
        })
      }
    });

    function toggleNavPaneVisibility(applications) {
      if (applications.length === 0)
        $scope.$emit('nav.emptyNav');
      else
        $scope.$emit('nav.notEmptyNav');
    }
    $scope.$on('nav.emptyNav', function() {
      angular.element('.navpage-layout').addClass('navpage-nav-hidden');
    });
    $scope.$on('nav.notEmptyNav', function() {
      angular.element('.navpage-layout').removeClass('navpage-nav-hidden');
    })
  });;
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
/*! RESOURCE: /scripts/app.magellan/directive.magellanNavigationFilter.js */
angular.module('Magellan').directive('magellanNavigationFilter', function(
      $rootScope,
      glideUrlBuilder,
      $window,
      snCustomEvent,
      $timeout,
      concourseNavigatorService
    ) {
      return {
        restrict: 'A',
        template: '',
        link: function(scope, element) {
            var selectedIndex = 0;
            var selectedElement = null;
            var shortcutCallback = null;
            var collection = [];
            var nav = $j('#nav_west_center');
            element.on('focus', function() {
              $timeout(function() {
                element.select();
              }, 10);
            });
            scope.clearHighlight = function() {
              if (selectedElement) {
                jQuery(selectedElement).removeClass('state-active');
              }
            };
            scope.filterText = '';
            scope.filterTextValue = function(newValue) {
              if (angular.isDefined(newValue)) {
                concourseNavigatorService.filterTerm = newValue;
                scope.filterText = newValue;
                clearShortcutPreview();
                if (handleNavFilterExtension(scope.filterText)) {
                  return;
                }
                handleShortcuts(scope.filterText);
              }
              return scope.filterText;
            };
            scope.handleEnterKeypress = function($event) {
              if (!selectedElement) {
                var $selected = $window.jQuery('#gsft_nav').find('.state-active');
                if ($selected.length) {
                  selectedElement = $selected.get(0);
                }
              }
              if (handleEnterKeypressEvent($event)) {
                reset();
              }
              handleShortcutCallback();
            };
            var DETECT_JAVASCRIPT = /^javascript:/;

            function handleEnterKeypressEvent($event) {
              if (!selectedElement || !selectedElement.href) {
                return false;
              }
              if (DETECT_JAVASCRIPT.test(selectedElement.href)) {
                $window.location.href = selectedElement.href;
                return true;
              } else {
                scope.navigate(selectedElement.href, selectedElement.getAttribute('target'));
                $event.preventDefault();
                return true;
              }
            }

            function handleShortcutCallback() {
              if (!shortcutCallback)
                return;
              shortcutCallback();
              scope.filterTextValue('');
              clearShortcutPreview();
            }

            function handleNavFilterExtension(val) {
              try {
                if (typeof $window.navFilterExtension === "function" && $window.navFilterExtension(val, msg))
                  return true;
              } catch (e) {
                jslog("Error in UI Script navFilterExtension - " + e);
              }
            }

            function handleShortcuts(filterText) {
              var tooltip = '';
              var table = '';
              shortcutCallback = null;
              if (filterText.length < 5)
                return;
              if (filterText.endsWith('.form')) {
                table = filterText.replace('.form', '').toLowerCase().replace(/ /g, '');
                tooltip = 'Press enter to open the ' + table + ' form';
                shortcutCallback = function() {
                  scope.navigate(glideUrlBuilder.getCancelableLink(table + '.do?sys_id=-1'));
                };
              } else if (filterText.endsWith('.list')) {
                table = filterText.replace('.list', '').toLowerCase().replace(/ /g, '');
                tooltip = 'Press enter to open the ' + table + ' list';
                shortcutCallback = function() {
                  scope.navigate(glideUrlBuilder.getCancelableLink(table + '_list.do'));
                };
              } else if (filterText.endsWith('.config')) {
                table = filterText.replace('.config', '').toLowerCase().replace(/ /g, '');
                tooltip = 'Press enter to open the ' + table + ' configuration';
                shortcutCallback = function() {
                  scope.navigate(glideUrlBuilder.getCancelableLink(buildTableConfigURL(table)));
                };
              } else if (filterText.endsWith('.FORM')) {
                table = filterText.replace('.FORM', '').toLowerCase().replace(/ /g, '');
                tooltip = 'Press enter to open the ' + table + ' form in a new window';
                shortcutCallback = function() {
                  $window.open(glideUrlBuilder.newGlideUrl(table + '.do?sys_id=-1').getURL());
                };
              } else if (filterText.endsWith('.LIST')) {
                table = filterText.replace('.LIST', '').toLowerCase().replace(/ /g, '');
                tooltip = 'Press enter to open the ' + table + ' list in a new window';
                shortcutCallback = function() {
                  $window.open(glideUrlBuilder.newGlideUrl(table + '_list.do').getURL());
                };
              } else if (filterText.endsWith('.CONFIG')) {
                table = filterText.replace('.CONFIG', '').toLowerCase().replace(/ /g, '');
                too