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
          window.g_tabs2L