var GlideTabs2 = Class.create({
  initialize: function(className, parentElement, offset, tabClassPrefix) {
    this.tabs = [];
    this.tabIDs = [];
    this.className = className;
    if (parentElement == null)
      return;
    this.tabs = this.getChildNodesWithClass(parentElement, className);
    if (offset == 1)
      this.tabs.shift();
    CustomEvent.observe("form.loaded", this.markMandatoryTabs.bind(this));
    CustomEvent.observe("ui_policy.loaded", this.startCatchingMandatory.bind(this));
    CustomEvent.observe("change.handlers.run", this.showTabs.bind(this));
    CustomEvent.observe("change.handlers.run.all", this.showTabs.bind(this));
    CustomEvent.observe("partial.page.reload", this.updateTabs.bind(this));
    this.activated = false;
    this.tabDiv = gel(className);
    this.activeTab = -1;
    this.createTabs(tabClassPrefix);
    this.state = new GlideTabs2State(className + "_" + g_tabs_reference);
  },
  setActive: function(index) {
    if (index < 0 || index > this.tabs.length - 1)
      index = 0;
    var tab = this.tabs[index];
    var newHeight = $(tab).getHeight();
    var heightDifference = 0;
    if (this.activeTab != -1) {
      var previousTab = this.tabs[this.activeTab];
      this._bumpSpacer(newHeight);
      hide(previousTab);
      this.tabsTabs[this.activeTab].setActive(false);
    }
    show(tab);
    this.activeTab = index;
    this.state.set(index);
    this.tabsTabs[index].setActive(true);
  },
  isActivated: function() {
    return this.activated;
  },
  deactivate: function() {
    $(document.body).removeClassName('tabs_enabled');
    $(document.body).removeClassName('tabs_disabled');
    $(document.body).addClassName('tabs_disabled');
    if (this.tabs.length == 0)
      return;
    var count = this.tabsTabs.length;
    for (var i = 0; i < count; i++) {
      var tabsTab = this.tabsTabs[i];
      if (tabsTab.isVisible())
        show(this.tabs[i]);
    }
    hide(this.tabDiv);
    this.activated = false;
  },
  activate: function() {
    $(document.body).removeClassName('tabs_enabled');
    $(document.body).removeClassName('tabs_disabled');
    $(document.body).addClassName('tabs_enabled');
    if (this.tabs.length < 2) {
      this.deactivate();
      return;
    }
    show(this.tabDiv);
    this.hideAll();
    var index = this.state.get();
    if (index == null)
      index = 0;
    if (!this.tabsTabs[index] || !this.tabsTabs[index].isVisible()) {
      index = this._findFirstVisibleTab();
      if (index != -1)
        this.setActive(index);
    }
    if (index != -1)
      this.setActive(index);
    this.activated = true;
  },
  hideAll: function() {
    var tabs = this.tabs;
    for (var i = 0; i < tabs.length; i++)
      hide(tabs[i]);
  },
  hideTabByID: function(tabID) {
    var tabIndex = this.findTabIndexByID(tabID);
    if (tabIndex == -1)
      return;
    this.hideTab(tabIndex);
  },
  hideTab: function(index) {
    hide(this.tabs[index].firstChild);
    this.showTabs();
  },
  _findFirstVisibleTab: function() {
    var count = this.tabsTabs.length;
    for (var i = 0; i < count; i++) {
      var tabsTab = this.tabsTabs[i];
      if (tabsTab.isVisible()) {
        this.setActive(i);
        return i;
      }
    }
    return -1;
  },
  showAll: function() {
    var tabs = this.tabs;
    for (var i = 0; i < tabs.length; i++)
      show(tabs[i]);
  },
  showTabByID: function(tabID) {
    var tabIndex = this.findTabIndexByID(tabID);
    if (tabIndex == -1)
      return;
    this.showTab(tabIndex);
  },
  showTab: function(index) {
    show(this.tabs[index].firstChild);
    this.showTabs();
  },
  findTabIndexByID: function(tabID) {
    var count = this.tabIDs.length;
    for (var i = 0; i < count; i++) {
      if (this.tabIDs[i] == tabID)
        return i;
    }
    this.log("findTabIndexByID could not find " + tabID);
    return -1;
  },
  createTabs: function(tabClassPrefix) {
    var tabs = this.tabs;
    this.tabsTabs = new Array();
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var t = this._getCaption(tab)
      this.tabsTabs[i] = new GlideTabs2Tab(this, i, t, tabClassPrefix);
      var header = document.createElement('h3');
      var id = tab.getAttribute('id');
      this.tabIDs[i] = id;
      header.className = 'tab_header';
      if (isTextDirectionRTL()) {
        header.dir = 'rtl';
      }
      header.appendChild(this.tabsTabs[i].getElement());
      if (!this.tabDiv)
        continue;
      this.tabDiv.appendChild(header);
      var img = document.createElement('img');
      img.className = 'tab_spacer';
      img.src = 'images/s.gifx';
      img.width = '4';
      img.height = '24';
      this.tabDiv.appendChild(img);
    }
    this.showTabs();
  },
  showTabs: function() {
    for (var i = 0; i < this.tabs.length; i++) {
      var tab = this.tabs[i];
      var s = tab.firstChild;
      var displayed = s.style.display != 'none';
      this.tabsTabs[i].showTab(displayed);
    }
    this._setActiveTab();
  },
  updateTabs: function() {
    var tabs = this.tabs;
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var t = this._getCaption(tab)
      this.tabsTabs[i].updateCaption(t);
    }
  },
  _setActiveTab: function() {
    if (this.activeTab == -1)
      return;
    var currentTab = this.tabsTabs[this.activeTab];
    if (currentTab.isVisible())
      return;
    for (var i = 0; i < this.tabsTabs.length; i++) {
      var t = this.tabsTabs[i];
      if (!t.isVisible())
        continue;
      this.setActive(i);
      break;
    }
  },
  startCatchingMandatory: function() {
    this.markMandatoryTabs();
    CustomEvent.observe("mandatory.changed", this.markMandatoryTabs.bind(this));
  },
  markMandatoryTabs: function() {
    this.markAllTabsOK();
    if (typeof(g_form) == 'undefined')
      return;
    var missingFields = g_form.getMissingFields();
    for (var i = 0; i < missingFields.length; i++)
      this.markTabMandatoryByField(missingFields[i]);
  },
  markTabMandatoryByField: function(field) {
    var i = this.findTabIndex(field);
    if (i == -1)
      return;
    this.tabsTabs[i].markAsComplete(false);
  },
  findTabIndex: function(fieldName) {
    var answer = -1;
    if (typeof(g_form) == 'undefined')
      return;
    var element = g_form.getControl(fieldName);
    var tabSpan = findParentByTag(element, "span");
    while (tabSpan) {
      if (hasClassName(tabSpan, 'tabs2_section'))
        break;
      tabSpan = findParentByTag(tabSpan, "span");
    }
    for (i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i] == tabSpan) {
        answer = i;
        break;
      }
    }
    return answer;
  },
  markAllTabsOK: function() {
    for (var i = 0; i < this.tabsTabs.length; i++)
      this.tabsTabs[i].markAsComplete(true);
  },
  hasTabs: function() {
    return this.tabs.length > 1;
  },
  _bumpSpacer: function(newHeight) {
    var spacerDiv = gel('tabs2_spacer');
    if (!spacerDiv)
      return;
    var spacerHeight = spacerDiv.offsetHeight;
    if (newHeight < spacerHeight)
      newHeight = spacerHeight;
    spacerDiv.style.height = newHeight + "px";
    spacerDiv.style.minHeight = newHeight + "px";
  },
  _getCaption: function(tab) {
    var caption = tab.getAttribute('tab_caption');
    var rows = this._getRowCount(tab);
    if (!rows || rows == 0)
      return caption;
    var rows = formatNumber(rows);
    if (rows == 0)
      return caption;
    return caption + " (" + rows + ")";
  },
  _getRowCount: function(tab) {
    if (tab.firstChild && (tab.firstChild.tagName.toLowerCase() == "span") && tab.id && tab.id.endsWith("_tab")) {
      var rows = tab.getAttribute('tab_rows');
      if (!rows)
        return null;
      var span = tab.firstChild;
      if (!span)
        return null;
      var f;
      for (var i = 0; i < span.childNodes.length; i++) {
        f = span.childNodes[i];
        if (f.tagName.toLowerCase() == "form")
          break;
      }
      if (!f || !f[rows])
        return 0;
      return f[rows].value;
    }
    var id = tab.id.substring(0, tab.id.length - 5) + "_table";
    var tab = gel(id);
    if (tab)
      return tab.getAttribute('total_rows');
    return "";
  },
  getChildNodesWithClass: function(p, className) {
    var children = p.childNodes;
    var answer = [];
    for (var i = 0, nodes = 0, n = children.length; i < n; i++) {
      var node = children[i];
      if (hasClassName(node, className))
        answer.push(node);
    }
    return answer;
  },
  log: function(msg) {
    jslog("GlideTabs2 " + msg);
  },
  type: 'GlideTabs2'
});