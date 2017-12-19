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
    if ($module.parent().hasClass('separator-children')) {
      $module.parent().parent().attr('hasFavorites', 'true');
    } else {
      $module.parent().attr('hasFavorites', 'true');
    }
    $module.children(".navigator-favorite-star").removeClass("icon-star-empty").addClass("icon-star");
  }
  $(document).on("click", ".navigator-favorite-star", function() {
    toggleFavorite($(this));
    if (inFavoritesMode) {
      $(this).parent().hide();
    }
  });
  $(document).on("click", ".navigator .nav_menu_header", function() {
    var $fav = $(this).prev('.navigator-favorite-star');
    if ($fav.hasClass("icon-star") || !window.autoSaveFavoritePreference) {
      return;
    }
    toggleFavorite($fav);
  });
  $("#navigator_favorite_switcher").click(function() {
    inFavoritesMode = !inFavoritesMode;
    if (inFavoritesMode) {
      favoritesMode(true);
      $(this).removeClass("icon-star-empty").addClass("icon-star");
    } else {
      favoritesMode(false);
      $(this).removeClass("icon-star").addClass("icon-star-empty");
    }
    CustomEvent.fire("favorites.toggle");
  });
  CustomEvent.observe("favorites.show", function() {
    favoritesMode(true);
  });

  function favoritesMode(active) {
    if (active) {
      $(".app_module[modulename='separator']").hide();
    } else {
      $(".app_module[modulename='separator']").show();
      $(".app_module").show();
    }
    var group = $(".nav-app.nav-app[hasFavorites]");
    $.each(group, function() {
      if ($(this).attr("hasFavorites") == "true") {
        if (active) {
          $(this).children().each(function() {
            if ($(this).hasClass("separator-children")) {
              $(this).attr('data-open', 'true');
            }
            $(".icon-star-empty", $(this)).parent().hide();
          });
          $(this).addClass("opened");
        } else {
          $(this).children().each(function() {
            $(".icon-star-empty", $(this)).parent().show();
          });
        }
        return true;
      }
      var id = $(this).attr('id');
      var appId = id.substring(id.indexOf("_", 0) + 1, id.length);
      if (active) {
        $(document.getElementById("div." + appId)).hide();
        $("#app_" + appId).hide();
        $("#" + appId).hide();
      } else {
        $(document.getElementById("div." + appId)).show();
        $("#app_" + appId).show()
        $("#" + appId).show();
      }
    });
  }

  function toggleFavorite($element) {
    var $fav = $element;
    var $app = $fav.parents(".submenu");
    if ($fav.hasClass('icon-star-empty')) {
      $fav.removeClass('icon-star-empty').addClass('icon-star');
      $app.attr("hasFavorites", "true");
    } else {
      $fav.removeClass('icon-star').addClass('icon-star-empty');
      $app.attr("hasFavorites", "false");
      $app.children().each(function() {
        if ($(".navigator-favorite-star", this).hasClass("icon-star")) {
          $app.attr("hasFavorites", "true");
          return false;
        }
      });
    }
    saveFavorites();
  }

  function saveFavorites() {
    var ids = [];
    $(".navigator-favorite-star.icon-star").each(function() {
      ids.push($(this).parent().attr("moduleid"));
    });
    setPreference("ng.navigator_favorites", JSON.stringify(ids));
  }
});