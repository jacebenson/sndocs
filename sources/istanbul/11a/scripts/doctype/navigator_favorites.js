/*! RESOURCE: /scripts/doctype/navigator_favorites.js */
$j(function($) {
  'use strict';
  var favoritesPreference = window.favoritesPreference;
  var inFavoritesMode = false;
  $(".nav-app.submenu").each(function() {
    if ($(this).attr('id') != "app_perspectives") {
      $(this).attr("hasFavorites", "false");
    }
  });
  for (var i = 0; i < favoritesPreference.length; i++) {
    var $module = $(document.getElementById('module.' + favoritesPreference[i]));
    $module.parents('.nav-app.submenu').attr('hasFavorites', 'true');
    $module.children(".navigator-favorite-star").removeClass("icon-star-empty").addClass("icon-star").attr('aria-pressed', 'true');
  }
  $(document).on("click", ".navigator-favorite-star", function() {
    toggleFavorite($(this));
    if (inFavoritesMode) {
      $(this).parent().hide();
    }
  });
  $(document).on("click", ".navigator .nav_menu_header", function() {
    var $fav = $(this).prev('.navigator-favorite-star');
    if ($fav.hasClass("icon-star") || !window.autoSaveFavoritePreference)
      return;
    toggleFavorite($fav);
  });
  $("#navigator_favorite_switcher").click(function() {
    inFavoritesMode = !inFavoritesMode;
    if (inFavoritesMode) {
      favoritesMode(true);
      $(this).removeClass("icon-star-empty").addClass("icon-star").attr('aria-pressed', 'true');
    } else {
      favoritesMode(false);
      $(this).removeClass("icon-star").addClass("icon-star-empty").attr('aria-pressed', 'false');
    }
    CustomEvent.fire("favorites.toggle");
  });
  CustomEvent.observe("favorites.show", function() {
    favoritesMode(true);
  });

  function favoritesMode(active) {
    if (active) {
      $("body.navigator").attr("favorites_mode", true);
      $(".app_module[modulename='separator']").hide();
    } else {
      $("body.navigator").attr("favorites_mode", false);
      $(".app_module[modulename='separator']").show();
      $(".app_module").show();
    }
    var group = $(".nav-app[hasFavorites]");
    $.each(group, function() {
      var $app = $(this);
      if ($app.attr("hasFavorites") === "true") {
        if (active) {
          $app.children().each(function() {
            var $module = $(this);
            if ($module.attr('moduletype') == 'SEPARATOR') {
              $module.show();
              $module.children('.section_toggle, hr').hide();
              $module.children('ul.separator-children').attr('data-open', 'true');
            }
            $(".icon-star-empty", $module).parent().hide();
          });
          $app.addClass("opened");
        } else {
          $app.children().each(function() {
            var $module = $(this);
            $(".icon-star-empty", $module).parent().show();
            $module.children(".section_toggle, hr").show();
          });
        }
        return true;
      }
      var id = $app.attr('id');
      var appId = id.substring(id.indexOf("_", 0) + 1, id.length);
      var selector = '#app_' + appId + ', #' + appId + ', #div\\.' + appId;
      $(selector)[(active ? 'hide' : 'show')]();
    });
  }

  function toggleFavorite($element) {
    var $fav = $element;
    var $app = $fav.parents(".submenu");
    var module = $element.parent().attr("moduleid");
    var index = favoritesPreference.indexOf(module);
    if ($fav.hasClass('icon-star-empty')) {
      $fav.removeClass('icon-star-empty').addClass('icon-star').attr('aria-pressed', 'true');
      $app.attr("hasFavorites", "true");
      if (index == -1)
        favoritesPreference.push(module);
    } else {
      $fav.removeClass('icon-star').addClass('icon-star-empty').attr('aria-pressed', 'false');
      $app.attr("hasFavorites", "false");
      $app.children().each(function() {
        if ($(".navigator-favorite-star", this).hasClass("icon-star")) {
          $app.attr("hasFavorites", "true");
          return false;
        }
      });
      if (index != -1)
        favoritesPreference.splice(index, 1);
    }
    setPreference("ng.navigator_favorites", JSON.stringify(favoritesPreference));
  }
});;