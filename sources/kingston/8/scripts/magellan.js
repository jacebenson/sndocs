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

  function _shouldSkip(evt) {
    if (!evt) {
      return;
    }
    var keyCode = evt.keyCode || evt.which;
    if (keyCode === 9) {
      return true;
    }
    var evtWhitelist = [1, 13, 49];
    return (keyCode && evtWhitelist.indexOf(keyCode) === -1);
  }
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
  $('.magellan_navigator').on('click keypress', '.nav-favorite-module', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
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
  $('.magellan_navigator').on('click keypress', '.nav-favorite-app', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var $this = $(this);
    if ($this.hasClass('icon-star-empty')) {
      var id = $this.data('id');
      var title = $this.data('favorite-title');
      $this.addClass('state-overwrite');
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
      $this.removeClass('state-overwrite');
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
  $('.magellan_navigator').on('click keypress', '.nav-edit-app', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var id = $(this).data('id');
    window.open('/sys_app_application.do?sysparm_clear_stack=true&sys_id=' + id, 'gsft_main');
  });
  $('.magellan_navigator').on('click keypress', '.nav-edit-module', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
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
    var favoriteTitle = ": " + $el.attr('data-favorite-title')
    if (isFavorite) {
      $el.addClass('state-overwrite');
      $el.removeClass('icon-star-empty')
        .addClass('icon-star')
        .attr({
          'data-dynamic-title': MESSAGES.remove_from_favorites,
          'aria-label': MESSAGES.remove_from_favorites + favoriteTitle
        });
    } else {
      $el.removeClass('state-overwrite');
      $el.removeClass('icon-star')
        .addClass('icon-star-empty')
        .attr({
          'data-dynamic-title': MESSAGES.add_to_favorites,
          'aria-label': MESSAGES.add_to_favorites + favoriteTitle
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