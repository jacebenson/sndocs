/*! RESOURCE: /scripts/doctype/navigator.js */
$j(function($) {
  'use strict';
  $(document).on("click", "LABEL.nav_menu", function() {
    var id = $(this).attr('for');
    var input = $('#' + id);
    id = "menu." + id + ".expanded";
    setTimeout(function() {
      if (input.prop('checked'))
        setPreference(id, "true");
      else
        deletePreference(id);
    }, 0);
  });
  $('input[type=checkbox]').each(function() {
    var self = $(this);
    var appContainer = $('#app_' + this.id);
    if (self.prop('checked'))
      appContainer.addClass('opened');
    self.change(function() {
      var el = $(this);
      if (el.prop('checked')) {
        appContainer.addClass('opened');
      } else
        appContainer.removeClass('opened');
    });
  });
  var previousTerm = '';
  var highlighted_mod;
  var f = $("#filter");
  f.on("keyup", function(evt) {
    navFilterKeyUp(this.value, '', evt)
  });
  f.on("focus", function(evt) {
    navFilterFocus(this, '', evt)
  });
  f.on("blur", function(evt) {
    navFilterBlur(this, '', evt)
  });
  $("#nav_filter_controls").on("click", function(evt) {
    resetNavFilter();
    navFilterKeyUp('', '');
  });

  function navFilterBlur(input, msg) {
    unhighlightModule();
    var val = input.value;
    if (!val)
      previousTerm = '';
  }

  function navFilterFocus(input, msg) {
    var val = input.value;
    if (!val || (val === msg)) {
      input.value = '';
      previousTerm = '';
    } else
      previousTerm = val;
    setTimeout(function() {
      input.select();
    }, 10);
  }

  function navFilterKeyUp(val, msg, evt) {
    if (val === msg)
      val = '';
    var s = $("#nav_filter_controls")[0];
    if (!val || val === '')
      s.style.visibility = "hidden";
    else
      s.style.visibility = "visible";
    if (evt && val !== '') {
      if (evt.keyCode === 40) {
        if (!highlighted_mod)
          focusFirstVisibleModule();
        else
          focusNextVisibleModule(highlighted_mod);
        return;
      }
      if (evt.keyCode === 38) {
        if (highlighted_mod)
          focusPreviousVisibleModule(highlighted_mod);
        return;
      }
      if (evt.keyCode === 13) {
        if (highlighted_mod)
          runModule(highlighted_mod, evt.shiftKey);
        return;
      }
      if (evt.keyCode === 27) {
        if (val === previousTerm)
          previousTerm = '';
        restoreFilterText(msg);
        return;
      }
    }
    unhighlightModule();
    var win = getTopWindow();
    try {
      if (typeof win.navFilterExtension === "function" && win.navFilterExtension(val, msg))
        return;
    } catch (e) {
      jslog("Error in UI Script navFilterExtension - " + e);
    }
    win = win.$('gsft_main');
    if (!win)
      win = {};
    if (val.endsWith('.form')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = getCancelableLink(val.replace('.form', '.do?sys_id=-1'));
    } else if (val.endsWith('.list')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = getCancelableLink(val.replace('.list', '_list.do'));
    } else if (val.endsWith('.FORM')) {
      val = val.replace(/ /g, '');
      restoreFilterText(msg);
      var url = new GlideURL(val.toLowerCase().replace('.form', '.do?sys_id=-1'));
      window.open(url.getURL());
    } else if (val.endsWith('.LIST')) {
      val = val.replace(/ /g, '');
      restoreFilterText(msg);
      var url = new GlideURL(val.toLowerCase().replace('.list', '_list.do'));
      window.open(url.getURL());
    } else if (val.endsWith('_list.do')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = val;
    } else if (val.endsWith('.do')) {
      restoreFilterText(msg);
      val = val.toLowerCase().replace(/ /g, '');
      win.src = val + "?sys_id=-1";
    } else {
      GwtNavFilter.filter(val, jQuery('#navigator_favorite_switcher').hasClass('icon-star'));
      if (val === '')
        unhighlightModule();
      else
        focusFirstVisibleModule();
    }
  }
  CustomEvent.observe("favorites.toggle", function() {
    if (f.val())
      navFilterKeyUp(f.val());
  });

  function unhighlightModule() {
    if (highlighted_mod) {
      gel(highlighted_mod).style.backgroundColor = "";
      highlighted_mod = undefined;
    }
  }

  function focusFirstVisibleModule() {
    var mods = document.getElementsByTagName("li");
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (mod.getAttribute("name") !== "nav.module" || mod.getAttribute("moduletype") === "MENU_LIST" || mod.getAttribute("moduletype") === "SEPARATOR")
        continue;
      if (mod.style.display !== "none") {
        highlightMod(mod);
        highlighted_mod = mod.id;
        break;
      }
    }
  }

  function focusNextVisibleModule(hl) {
    var mods = document.getElementsByTagName("li");
    var found = false;
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!found && mod.id === hl) {
        found = true;
        continue;
      }
      if (!found)
        continue;
      if (mod.getAttribute("name") !== "nav.module" || mod.getAttribute("moduletype") === "MENU_LIST" || mod.getAttribute("moduletype") === "SEPARATOR")
        continue;
      if (mod.style.display !== "none") {
        if (hl !== "")
          gel(hl).style.backgroundColor = "";
        highlightMod(mod);
        highlighted_mod = mod.id;
        break;
      }
    }
  }

  function focusPreviousVisibleModule(hl) {
    var mods = document.getElementsByTagName("li");
    var foundhighlighted = false;
    var foundcandidate = false;
    var candidate;
    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!foundhighlighted && mod.id !== hl &&
        mod.getAttribute("name") === "nav.module" &&
        mod.getAttribute("moduletype") !== "MENU_LIST" &&
        mod.getAttribute("moduletype") !== "SEPARATOR" &&
        mod.style.display !== "none") {
        candidate = mod;
        foundcandidate = true;
      }
      if (!foundhighlighted && mod.id === hl) {
        foundhighlighted = true;
        if (foundcandidate) {
          highlightMod(candidate);
          highlighted_mod = candidate.id;
        } else
          highlighted_mod = undefined;
        gel(hl).style.backgroundColor = "";
        break;
      }
    }
  }

  function highlightMod(mod) {
    var td = mod.firstChild;
    if (typeof g_mod_highlight_color !== "undefined")
      mod.style.backgroundColor = g_mod_highlight_color;
    else
      mod.style.backgroundColor = "#eee";
  }

  function runModule(hl, newWindow) {
    var $mod = $(gel(hl));
    var a = $mod.find('A')[0];
    var target = a.getAttribute("target");
    var cancelable = a.getAttribute("data-cancelable");
    var href = a.getAttribute('href');
    if (newWindow)
      target = "_blank";
    if (cancelable === 'true')
      href = getCancelableLink(href);
    if (target === "" || target === "gsft_main") {
      var mod = $mod[0];
      mod.style.backgroundColor = "";
      highlighted_mod = undefined;
      var win = getTopWindow();
      win = win.$('gsft_main');
      if (!win)
        win = {};
      win.src = href;
    } else
      window.open(href);
  }

  function getCancelableLink(link) {
    if (g_cancelPreviousTransaction) {
      var nextChar = link.indexOf('?') > -1 ? '&' : '?';
      link += nextChar + "sysparm_cancelable=true";
    }
    return link;
  }

  function restoreFilterText(msg) {
    var f = gel('filter');
    if (previousTerm !== "") {
      f.value = previousTerm;
      navFilterKeyUp(previousTerm, msg);
    } else {
      previousTerm = '';
      f.value = '';
      navFilterKeyUp('', msg);
    }
  }

  function resetNavFilter() {
    var e = gel('filter');
    e.value = e.defaultValue;
    var s = gel('nav_filter_controls');
    s.style.visibility = "hidden";
    previousTerm = "";
  }
});
$j(function($) {
  "use strict";
  $(window).bind('collapse_all', function() {
    switchCheckedState(false);
    setUserPrefAllCollapsed();
  });
  $(window).bind('expand_all', function() {
    switchCheckedState(true);
    setUserPrefAllExpanded();
  });
  $(window).bind('toggle_auto_favorite', function() {
    toggleAutoFavorite();
  });

  function switchCheckedState(checked) {
    var t = $(".nav-wrapper input[type=checkbox]:not(#perspectives)").each(function() {
      $(this).prop('checked', checked);
      $(this).trigger('change');
    });
  }

  function setUserPrefAllExpanded() {
    var menuItems = getAllMenuItems();
    if (menuItems.length)
      batchSetPreference(menuItems.join('=true;') + '=true');
  }

  function setUserPrefAllCollapsed() {
    var menuItems = getAllMenuItems();
    if (menuItems.length)
      batchDeletePreference(menuItems.join(';'));
  }

  function getAllMenuItems() {
    return $.map($('label.nav_menu').not('#div\\.perspectives'), function(elem) {
      return 'menu.' + $(elem).attr('for') + '.expanded';
    });
  }

  function toggleAutoFavorite() {
    window.autoSaveFavoritePreference = !window.autoSaveFavoritePreference;
    setPreference('glide.ui.nav.auto_favorite', window.autoSaveFavoritePreference.toString());
  }
  document.on('click', 'img.section_toggle, span.section_toggle', function(evt, element) {
    var id = element.getAttribute("data-id");
    var e = $('#app_' + id);
    var ex = e[0].getAttribute('data-open');
    ex = ex === 'true';
    ex = !ex;
    e[0].setAttribute('data-open', ex);
    e.css({
      visibility: '',
      display: '',
      height: ''
    });
    var img = $j("#img_" + id);
    if (ex)
      img.addClass(img.attr('data-expanded')).removeClass(img.attr('data-collapsed'));
    else
      img.addClass(img.attr('data-collapsed')).removeClass(img.attr('data-expanded'));
    setPreference("collapse.section." + id, (!ex).toString());
  });
  CustomEvent.fire('nav.loaded');
  if (g_cancelPreviousTransaction) {
    document.on('click', '.menu[data-cancelable="true"]', function(evt, element) {
      if (!evt.isLeftClick())
        return;
      setTimeout(function(origValue) {
        this.setAttribute('href', origValue);
      }.bind(element, element.getAttribute('href')), 10);
      var nextChar = element.href.indexOf('?') > -1 ? '&' : '?';
      element.href += nextChar + "sysparm_cancelable=true";
    });
  }
  if (window.g_accessibility) {
    $('input[type=checkbox]').each(function(index, el) {
      $(el).focus(function() {
        var id = $(this).attr('id');
        $(document.getElementById('div.' + id)).addClass('focus');
      }).blur(function() {
        var id = $(this).attr('id');
        $(document.getElementById('div.' + id)).removeClass('focus');
      }).keypress(function(e) {
        if (e.which !== 13)
          return;
        var prop = $(this).prop('checked');
        $(this).prop('checked', !prop);
        $(this).trigger('change');
      });
    });
  }
  if (typeof g_ck !== 'undefined')
    CustomEvent.observe("ck_updated", function(ck) {
      g_ck = ck;
    });
  runAfterAllLoaded();

  function batchSetPreference(valueStr, func) {
    var u = getActiveUser();
    if (u) {
      var values = valueStr.split(';');
      var value = [];
      for (var i = 0; i < values.length; i++) {
        value = values[i].split('=');
        u.setPreference(value[0], value[1]);
      }
    }
    var url = new GlideAjax('UserPreference');
    url.addParam('sysparm_type', 'batch_set');
    url.addParam('sysparm_value', valueStr);
    url.getXML(func);
  }

  function batchDeletePreference(nameStr) {
    var u = getActiveUser();
    if (u) {
      var names = nameStr.split(';');
      for (var i = 0; i < names.length; i++) {
        u.deletePreference(names[i]);
      }
    }
    var url = new GlideAjax('UserPreference');
    url.addParam('sysparm_type', 'batch_delete');
    url.addParam('sysparm_value', nameStr);
    url.getXML();
  }
});;