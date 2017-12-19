var g_tabs2Sections = null;
var g_tabs2List = null;

function tabs2Init() {
  var tabSW = new StopWatch();
  var f = document.forms[0];
  g_tabs2Sections = new GlideTabs2('tabs2_section', f, 1);
  f = gel('related_lists_wrapper');
  var button = $$(".tabs_toggle_button");
  if (!button && !g_tabs_print)
    return;
  g_tabs2List = new GlideTabs2('tabs2_list', f, 0);
  if (g_tabs_print) {
    g_tabs2Sections.deactivate();
    g_tabs2List.deactivate();
    return;
  }
  if (g_tabs_preference) {
    g_tabs2Sections.activate();
    g_tabs2List.activate();
  } else {
    g_tabs2Sections.deactivate();
    g_tabs2List.deactivate();
  }
  if (!g_tabs2Sections.hasTabs() && !g_tabs2List.hasTabs())
    tabs2ToggleDisable();
  tabSW.jslog("tabs initialized");
}

function tabs2ToggleDisable() {
  $$(".tabs_toggle_button").each(function(item) {
    item.remove();
  });
}

function tabs2Toggle() {
  g_tabs_preference = !g_tabs_preference;
  if (g_tabs_preference) {
    g_tabs2Sections.activate();
    g_tabs2List.activate();
    CustomEvent.fire('tabs.enable');
  } else {
    g_tabs2Sections.deactivate();
    g_tabs2List.deactivate();
    CustomEvent.fire('tabs.disable');
  }
  setPreference('tabbed.forms', g_tabs_preference);
}