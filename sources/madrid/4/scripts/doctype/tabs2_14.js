/*! RESOURCE: /scripts/doctype/tabs2_14.js */
(function() {
  "use strict";
  window.g_tabs2Sections = null;
  window.g_tabs2List = null;

  function tabs2Init() {
    initFormTabs();
  }

  function initFormTabs() {
    var f = document.forms[0];
    window.g_tabs2Sections = new GlideTabs2('tabs2_section', f, 1, undefined, true);
    initTabs(window.g_tabs2Sections);
    initVariablesTabs();
  }

  function initRelatedListTabs() {
    var f = $j('#related_lists_wrapper')[0];
    window.g_tabs2List = new GlideTabs2('tabs2_list', f, 0);
    initTabs(window.g_tabs2List);
    for (var i = 0; i < hiddenOnLoad.length; i++)
      hideTab(hiddenOnLoad[i]);
    for (var i = 0; i < showOnLoad.length; i++)
      showTab(showOnLoad[i]);
    showOnLoad = [];
    hiddenOnLoad = [];
  }

  function initVariablesTabs() {
    var f = $j('[id^="var_container"]');
    for (var i = 0, l = f.length; l > i; i++) {
      var varTabs = new GlideTabs2("tabs2_vars", f[i], 0);
      initTabs(varTabs);
      varTabs.deactivate();
    }
  }

  function initTabs(tabSet) {
    if (window.g_tabs_print) {
      tabSet.deactivate();
      return;
    }
    if (window.g_tabs_preference)
      tabSet.activate();
    else
      tabSet.deactivate();
    if (!hasTabs(window.g_tabs2Sections) && !hasTabs(window.g_tabs2List))
      tabs2ToggleDisable();
  }

  function hasTabs(tabSet) {
    if (tabSet === null)
      return true;
    return tabSet.hasTabs();
  }

  function tabs2ToggleDisable() {}

  function tabs2Toggle() {
    window.g_tabs_preference = !window.g_tabs_preference;
    CustomEvent.fireAll('tabbed', window.g_tabs_preference);
  }
  CustomEvent.observe('tabbed', function(trueFalse) {
    window.NOW.tabbed = trueFalse;
    window.g_tabs_preference = window.NOW.tabbed;
    setPreference('tabbed.forms', window.g_tabs_preference);
    setTabbed();
  })

  function setTabbed() {
    if (window.g_tabs_preference) {
      window.g_tabs2Sections.activate();
      if (window.g_tabs2List)
        window.g_tabs2List.activate();
      CustomEvent.fire('tabs.enable');
    } else {
      window.g_tabs2Sections.deactivate();
      if (window.g_tabs2List)
        window.g_tabs2List.deactivate();
      CustomEvent.fire('tabs.disable');
    }
  }
  window.tabs2Init = tabs2Init;
  window.tabs2Toggle = tabs2Toggle;
  CustomEvent.observe('related_lists.ready', initRelatedListTabs);
  var hiddenOnLoad = [];
  var showOnLoad = [];
  CustomEvent.observe('related_lists.show', function(listTableName) {
    if (window.NOW.g_relatedLists) {
      if (!window.NOW.g_relatedLists.loaded) {
        showOnLoad.push(listTableName);
        return;
      }
    }
    if (!window.g_tabs2List) {
      if (showOnLoad.indexOf(listTableName) == -1)
        showOnLoad.push(listTableName);
      return;
    }
    showTab(listTableName);
  });
  CustomEvent.observe('related_lists.hide', function(listTableName) {
    if (window.NOW.g_relatedLists) {
      if (!window.NOW.g_relatedLists.loaded) {
        hiddenOnLoad.push(listTableName);
        return;
      }
    }
    if (!window.g_tabs2List) {
      if (hiddenOnLoad.indexOf(listTableName) == -1)
        hiddenOnLoad.push(listTableName);
      return;
    }
    hideTab(listTableName);
  });

  function showTab(listTableName) {
    var relatedListID = g_form._getRelatedListID(listTableName);
    window.g_tabs2List.showTabByID(relatedListID);
    if (!window.g_tabs2List.isActivated())
      show(relatedListID);
    formatLastTabRoundedBorder();
    if (window.NOW.g_relatedLists)
      if (window.NOW.g_relatedLists.loaded)
        CustomEvent.fire('calculate_fixed_headers');
  }

  function hideTab(listTableName) {
    var relatedListID = g_form._getRelatedListID(listTableName);
    window.g_tabs2List.hideTabByID(relatedListID);
    if (!g_tabs2List.isActivated())
      hide(relatedListID);
    formatLastTabRoundedBorder();
  }

  function formatLastTabRoundedBorder() {
    $j('.tabs2_strip .tabs2_tab:visible').removeClass('last_tab_closure');
    $j('.tabs2_strip .tabs2_tab:visible:last').addClass('last_tab_closure');
  }
})();;