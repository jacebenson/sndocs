/*! RESOURCE: /scripts/magellan.CreateFavoriteModal.js */
MagellanCreateFavorites = (function(options, $) {
  var $modal = $("div#createFavoritesModal");
  var $form = $modal.find('form[name=create_favorite_form]');
  var form = $form[0];
  var $preview = $modal.find('#favorite_preview');
  var historyCount = 0;
  var historyMaxCount = 5;
  if (options && options.navColors) {
    createColorPicker();
  } else {
    $modal.find('#icon_colors').addClass('hidden');
  }
  if (options && options.navIcons) {
    createIconPicker();
  } else {
    $modal.find('#icon_picker').addClass('hidden');
  }
  $('body').on('click', '.show-create-favorite-modal', function(evt) {
    evt.preventDefault();
    var button = $(this);
    var data = getData(button);
    clearFormData();
    if (data) {
      updateFormData(data);
    }
    if (getMagellanFavoriteList()) {
      checkIfFavorited(getMagellanFavoriteList());
      $modal.modal();
    } else {
      var fUrl = form.url.value || getPageUrl();
      fUrl = cleanUrl(fUrl);
      var headers = {
        Accept: 'application/json'
      };
      if (typeof g_ck != 'undefined') {
        headers['X-UserToken'] = g_ck;
      }
      $.ajax({
        url: '/api/now/ui/favorite/url',
        data: JSON.stringify({
          url: fUrl
        }),
        type: 'POST',
        contentType: 'application/json',
        headers: headers,
      }).done(function(response) {
        if (response && response.result && response.result.favorite) {
          updateFromFavorite(response.result.favorite);
        }
        $modal.modal();
      });
    }
  });
  $modal.on('click', '#icon_colors a', function() {
    var $this = $(this);
    var color = $this.data('color');
    updateSelectedColor(color, $this);
  });
  $modal.on('click', '#icon_picker a', function() {
    var $this = $(this);
    var icon = $this.data('icon');
    updateSelectedIcon(icon, $this);
  });
  $form.on('focus', '[name=title]', function() {
    $form.find('[name=title]').removeClass('error');
  });
  $form.on('submit', function(evt) {
    evt.preventDefault();
    if (!form.title.value) {
      showTitleError();
      return false;
    }
    var url = form.url.value || getPageUrl();
    url = cleanUrl(url)
    var formData = {
      title: form.title.value,
      url: url,
      icon: form.icon.value,
      color: form.color.value,
      windowName: form.window_name.value,
      id: form.id.value
    };
    var headers = {
      Accept: 'application/json'
    };
    if (typeof g_ck != 'undefined') {
      headers['X-UserToken'] = g_ck;
    }
    $.ajax({
      url: '/api/now/ui/favorite',
      type: 'POST',
      contentType: 'application/json',
      headers: headers,
      data: JSON.stringify(formData)
    }).done(function(response) {
      if (response && response.result && response.result.favorite) {
        CustomEvent.fireAll('magellanNavigator:favoriteSaved', response.result.favorite)
        $modal.modal('hide');
      }
    });
  });

  function showTitleError() {
    $form.find('[name=title]').addClass('error');
  }

  function getData(button) {
    var data;
    var attr = ['url', 'title', 'icon', 'color', 'window_name', 'description'];
    for (var i = 0; i < attr.length; i++) {
      var prop = button.attr('data-' + attr[i]);
      if (prop) {
        if (!data) {
          data = {};
        }
        data[attr[i]] = prop;
      }
    }
    return data;
  }

  function getPageUrl() {
    return window.location.href.substr(window.location.href.indexOf(window.location.pathname));
  }

  function updateFormData(data) {
    if (data.title) {
      form.title.value = data.title;
    }
    if (data.url) {
      form.url.value = data.url;
    }
    if (data.window_name) {
      form.window_name.value = data.window_name;
    }
    if (data.icon) {
      updateSelectedIcon(data.icon);
    } else if (options.navIcons && options.navIcons.length) {
      updateSelectedIcon(options.navIcons[0]);
    }
    if (data.color) {
      updateSelectedColor(data.color);
    } else if (options.navColors && options.navColors.length) {
      updateSelectedColor(options.navColors[0]);
    }
  }

  function clearFormData() {
    form.url.value = '';
  }

  function cleanUrl(url) {
    if (url.indexOf('#') !== -1) {
      url = url.substring(0, url.indexOf('#'));
    }
    if (url.indexOf('?') !== -1) {
      var contextPath = url.substring(0, url.indexOf('?'))
      var search = url.substring(url.indexOf('?') + 1);
      var params = search.split('&');
      var cleanParams = [];
      for (var i = 0; i < params.length; i++) {
        var prop = params[i].substring(0, params[i].indexOf('='));
        var value = params[i].substring(params[i].indexOf('=') + 1);
        cleanParams.push(prop + '=' + encodeURIComponent(decodeURIComponent(value)).replace(/\%3A/g, ':'));
      }
      url = contextPath + '?' + cleanParams.join('&');
    }
    return url;
  }

  function updateSelectedColor(color, selector) {
    $('#icon_colors a').removeClass('selected').removeClass('icon-check');
    if (!selector) {
      selector = $('#icon_colors a[data-color=' + color + ']');
    }
    selector.addClass('selected').addClass('icon-check');
    $('.icon-picker').removeClass().addClass('icon-picker color-' + color);
    $preview.removeClass().addClass('color-' + color);
    form.color.value = color;
  }

  function updateSelectedIcon(icon, selector) {
    $('#icon_picker a').removeClass('selected');
    if (!selector) {
      selector = $('#icon_picker a[data-icon=' + icon + ']');
    }
    selector.addClass('selected');
    $preview.find('span').removeClass().addClass('icon-' + icon);
    form.icon.value = icon;
  }

  function createColorPicker() {
    var colors = options.navColors;
    var container = $('<div>');
    for (var i = 0; i < colors.length; i++) {
      var a = $('<a>');
      a.addClass('color-bg-' + colors[i]);
      a.attr('data-color', colors[i]);
      a.attr('href', 'javascript:void(0)');
      container.append(a);
    }
    $modal.find('#icon_colors').html(container.html());
  }

  function createIconPicker() {
    var icons = options.navIcons;
    var container = $('<div>');
    for (var i = 0; i < icons.length; i++) {
      var a = $('<a>');
      a.addClass('icon-' + icons[i]);
      a.attr('data-icon', icons[i]);
      a.attr('href', 'javascript:void(0)');
      container.append(a);
    }
    $modal.find('#icon_picker').html(container.html());
  }

  function checkIfFavorited(list) {
    var isFavorite = false;
    var url = form.url.value || getPageUrl();
    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (sameUrl(list[i].url, url)) {
          updateFromFavorite(list[i]);
          break;
        }
        if (list[i].favorites) {
          for (var j = 0; j < list[i].favorites.length; j++) {
            if (sameUrl(list[i].favorites[j].url, url)) {
              updateFromFavorite(list[i].favorites[j]);
              break;
            }
          }
        }
      }
    }
  }

  function updateFromFavorite(favorite) {
    form.title.value = favorite.title;
    form.id.value = favorite.id;
    updateSelectedColor(favorite.color);
    updateSelectedIcon(favorite.icon);
  }

  function getMagellanFavoriteList() {
    if (window.top.Magellan && window.top.Magellan.current) {
      return window.top.Magellan.current;
    }
  }

  function sameUrl(a, b) {
    var key, keys, paramsA, paramsB;
    var blackList = options.paramBlacklist;
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    a = a.replace('/', '');
    b = b.replace('/', '');
    paramsA = getParams(a);
    paramsB = getParams(b);
    keys = Object.keys($.extend({}, paramsA, paramsB));
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      if (blackList && blackList.indexOf(key) != -1) {
        continue;
      }
      if (paramsA[key] == paramsB[key]) {
        continue;
      }
      return false;
    }
    var contextPathA = (a.indexOf('?') !== -1) ? a.slice(0, a.indexOf('?')) : a;
    var contextPathB = (b.indexOf('?') !== -1) ? b.slice(0, b.indexOf('?')) : b;
    return contextPathA === contextPathB;
  }

  function getParams(url) {
    params = {};
    var p = url.substring(url.indexOf('?') + 1);
    p = p.split('&');
    for (var i = 0; i < p.length; i++) {
      var pos = p[i].indexOf('=');
      params[p[i].substring(0, pos)] = encodeURIComponent(decodeURIComponent(p[i].substring(pos + 1))).replace(/\%3A/g, ':');
    }
    return params;
  }

  function collectPageHistory() {
    $(function() {
      sendPageHistory();
    });
  }
  collectPageHistory();

  function sendPageHistory() {
    var button = $('a.show-create-favorite-modal');
    if (button && button.length) {
      var data = getData(button);
      var url = cleanUrl(getPageUrl());
      var title = '';
      if (data) {
        if (data.url) {
          url = data.url
        }
        if (data.title) {
          title = data.title;
        }
        if (data.description) {
          description = data.description;
        }
      }
      url = cleanUrl(url);
      var isTable = false;
      var number = '';
      var pageData = {
        navigator_history: {
          title: title,
          description: description,
          url: url,
          number: number,
          isTable: isTable
        }
      }
      sendHistory(pageData);
    } else {
      if (historyCount < historyMaxCount) {
        historyCount += 1;
        setTimeout(function() {
          sendPageHistory();
        }, 1000);
      }
    }
  }
  CustomEvent.observe('magellanNavigator.sendHistoryEvent', function(data) {
    setTimeout(function() {
      sendHistory(data);
    }, 5000)
  });
  CustomEvent.observe('magellanNavigator.addFavoriteEvent', function(data) {
    addFavorite(data);
  });

  function sendHistory(data) {
    if (typeof data == 'undefined') {
      return;
    }
    if (!data.url) {
      data['url'] = cleanUrl(getPageUrl());
    }
    historyData = {
      navigator_history: data
    };
    var headers = {
      Accept: 'application/json'
    };
    if (typeof g_ck != 'undefined') {
      headers['X-UserToken'] = g_ck;
    }
    $.ajax({
      type: 'POST',
      url: '/api/now/ui/history',
      headers: headers,
      contentType: 'application/json',
      data: JSON.stringify(historyData)
    }).done(function(response) {
      if (response && response.result && response.result.navigatorHistory) {
        CustomEvent.fireTop('magellanNavigator.historyAdded', {
          history: response.result.navigatorHistory
        });
      }
    });
  }

  function addFavorite(data) {
    clearFormData();
    if (data) {
      updateFormData(data);
    }
    if (getMagellanFavoriteList()) {
      checkIfFavorited(getMagellanFavoriteList());
      $modal.modal();
    } else {
      var fUrl = form.url.value || getPageUrl();
      fUrl = cleanUrl(fUrl);
      var headers = {
        Accept: 'application/json'
      };
      if (typeof g_ck != 'undefined') {
        headers['X-UserToken'] = g_ck;
      }
      $.ajax({
        url: '/api/now/ui/favorite/url',
        data: JSON.stringify({
          url: fUrl
        }),
        type: 'POST',
        contentType: 'application/json',
        headers: headers,
      }).done(function(response) {
        if (response && response.result && response.result.favorite) {
          updateFromFavorite(response.result.favorite);
        }
        $modal.modal();
      });
    }
  }
  return {
    addFavorite: addFavorite,
    sendHistory: sendHistory
  }
})(MagellanCreateFavorites, jQuery);;