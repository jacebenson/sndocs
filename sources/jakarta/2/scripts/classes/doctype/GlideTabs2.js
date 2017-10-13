/*! RESOURCE: /scripts/classes/doctype/GlideTabs2.js */
var GlideTabs2 = Class.create({
  initialize: function(className, parentElement, offset, tabClassPrefix, isPreloaded) {
    this._timeout = null;
    this._lastIndex = null;
    this.tabs = [];
    this.tabIDs = [];
    this.tabNames = [];
    this.isHidable = [];
    this.className = className;
    if (parentElement == null)
      return;
    this.parentElement = parentElement;
    this.isFormTabs = window.g_form && parentElement == g_form.getFormElement();
    this.tabs = this.getChildNodesWithClass(parentElement, className);
    if (offset == 1)
      this.tabs.shift();
    if (this.isFormTabs) {
      CustomEvent.observe("form.loaded", this.markMandatoryTabs.bind(this));
      CustomEvent.observe("ui_policy.loaded", this.startCatchingMandatory.bind(this));
      var initialIndex = parseInt($j('#tabs2_section').attr('data-initial-tab-index'), 10);
      this._lastIndex = isNaN(initialIndex) ? 0 : initialIndex;
    }
    CustomEvent.observe("change.handlers.run", this.showTabs.bind(this));
    CustomEvent.observe("change.handlers.run.all", this.showTabs.bind(this));
    if (className !== 'tabs2_list' || !window.NOW.g_relatedLists)
      CustomEvent.observe("partial.page.reload", this.updateTabs.bind(this));
    this.activated = false;
    this.tabDiv = gel(className);
    this.activeTab = -1;
    this.createTabs(tabClassPrefix, isPreloaded);
    this.state = new GlideTabs2State(className + "_" + g_tabs_reference);
    if (this.tabDiv) {
      $j(this.tabDiv).attr('role', 'tablist').on('keydown', this, this.handleKeydown);
      setTimeout(function(tabDiv) {
        $j(tabDiv.getElementsByClassName('tabs2_tab')).not('.tabs2_active').attr('tabindex', -1);
      }, 0, this.tabDiv);
    }
  },
  handleKeydown: function(e) {
    var self = e.data;
    if (e.which == 37) {
      var newIndex = (self.activeTab - 1 + self.tabsTabs.length) % self.tabsTabs.length;
      var loopCount = 0;
      while (self.tabsTabs[newIndex].element.style['display'] == 'none' && loopCount < self.tabsTabs.length) {
        newIndex = (newIndex - 1 + self.tabsTabs.length) % self.tabsTabs.length;
        loopCount++;
      }
      self.setActive(newIndex);
    } else if (e.which == 39) {
      var newIndex = (self.activeTab + 1 + self.tabsTabs.length) % self.tabsTabs.length;
      var loopCount = 0;
      while (self.tabsTabs[newIndex].element.style['display'] == 'none' && loopCount < self.tabsTabs.length) {
        newIndex = (newIndex + 1 + self.tabsTabs.length) % self.tabsTabs.length;
        loopCount++;
      }
      self.setActive(newIndex);
    }
    var activeTab = $j(this.getElementsByClassName('tabs2_active')[0]);
    activeTab.attr('tabindex', 0);
    activeTab.focus();
    $j(this.getElementsByClassName('tabs2_tab')).not('.tabs2_active').attr('tabindex', -1);
  },
  setActive: function(index) {
    if (index < 0 || index > this.tabs.length - 1)
      index = 0;
    var tab = this.tabs[index];
    if (this.activeTab != -1) {
      var previousTab = this.tabs[this.activeTab];
      setTimeout(function() {
        var newHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
        this._bumpSpacer(newHeight);
      }.bind(this));
      hide(previousTab);
      this.tabsTabs[this.activeTab].setActive(false);
    }
    show(tab);
    this.activeTab = parseInt(index, 10);
    this.state.set(this.activeTab);
    if (this.isFormTabs && this._lastIndex !== this.activeTab && this.tabsTabs[this._lastIndex]) {
      $j(this.tabsTabs[this._lastIndex].element).removeClass('tabs2_active');
      this.setFormTabIndex();
    }
    this.tabsTabs[index].setActive(true);
  },
  isActivated: function() {
    return this.activated;
  },
  setFormTabIndex: function() {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(function() {
      this._lastIndex = this.activeTab;
      setPreference('tabs2.section.' + g_form.getTableName(), this.activeTab);
    }.bind(this), 2000);
  },
  deactivate: function() {
    removeClassName(this.parentElement, 'tabs_enabled');
    removeClassName(this.parentElement, 'tabs_disabled');
    addClassName(this.parentElement, 'tabs_disabled');
    if (this.tabs.length == 0)
      return;
    if (isDoctype) {
      for (var i = 0; i < this.tabs.length; i++)
        $(this.tabs[i]).removeClassName("tab_section");
    }
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
    if (this.className === "tabs2_vars")
      return;
    removeClassName(this.parentElement, 'tabs_enabled');
    removeClassName(this.parentElement, 'tabs_disabled');
    addClassName(this.parentElement, 'tabs_enabled');
    if (this.tabs.length < 2) {
      this.deactivate();
      return;
    }
    if (isDoctype) {
      for (var i = 0; i < this.tabs.length; i++)
        $(this.tabs[i]).addClassName("tab_section");
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
  hideTabByName: function(name) {
    var tabIndex = this.findTabIndexByName(name);
    if (tabIndex == -1)
      return;
    this.hideTab(tabIndex);
  },
  hideTab: function(index) {
    if (this.isHidable[index] === true) {
      hide(this.tabs[index].firstChild);
      this.showTabs();
    }
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
  showTabByName: function(name) {
    var tabIndex = this.findTabIndexByName(name);
    if (tabIndex == -1)
      return;
    this.showTab(tabIndex);
  },
  isVisible: function(index) {
    var visibility = this.tabs[index].firstChild.style.display;
    return !(visibility == 'none');
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
  findTabIndexByName: function(tabName) {
    var index = this.tabNames.indexOf(tabName);
    if (index === -1)
      this.log("findTabIndexByName could not find " + tabName);
    return index;
  },
  createTabs: function(tabClassPrefix, isPreloaded) {
    var tabs = this.tabs;
    this.tabsTabs = [];
    for (var i = 0, n = tabs.length, tab, title, name; i < n; i++) {
      tab = tabs[i];
      title = this._getCaption(tab);
      name = tab.getAttribute('tab_caption_raw');
      this.tabsTabs[i] = new GlideTabs2Tab(this, i, title, tabClassPrefix, isPreloaded);
      this.tabIDs[i] = tab.getAttribute('id');
      this.isHidable[i] = true;
      if (name) {
        this.tabNames[i] = name.toLowerCase().replace(" ", "_").replace(/[^0-9a-z_]/gi, "");
      } else {
        this.tabNames[i] = tab.getAttribute('tab_list_name_raw');
      }
      if (!isPreloaded) {
        var header = isDoctype ? cel('span') : cel('h3');
        header.className = 'tab_header';
        if (isTextDirectionRTL()) {
          header.dir = 'rtl';
        }
        header.appendChild(this.tabsTabs[i].getElement());
        if (!this.tabDiv) {
          continue;
        }
        this.tabDiv.appendChild(header);
        var img = cel('img');
        img.className = 'tab_spacer';
        img.src = 'images/s.gifx';
        img.width = '4';
        img.height = '24';
        this.tabDiv.appendChild(img);
      }
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
    this.isHidable[i] = false;
    if (!this.isVisible(i))
      this.showTab(i);
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
    for (var i = 0; i < this.tabsTabs.length; i++) {
      this.isHidable[i] = true;
      this.tabsTabs[i].markAsComplete(true);
    }
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
    return new GwtMessage().getMessage("{0} ({1})", caption, rows);
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
});;