/*! RESOURCE: /scripts/doctype/js_includes_home_doctype.js */
/*! RESOURCE: /scripts/switchmenu.js */
var ignoreNextSwitch = false;
Event.observe(window, 'load', function() {
  var t = $(window.document.body);
  t.on("click", ".app_menu_div", onNavClick);
  t.on("click", "a.menu", onModuleClick);
  t.on("click", "a.menulabel", onModuleClick);
  CustomEvent.observe('navigator.expand.all', navExpandAll);
  CustomEvent.observe('navigator.collapse.all', navCollapseAll);
})

function onNavClick(event, element) {
  var t = element.getAttribute("appid");
  switchMenu(t);
}

function switchMenu(id) {
  var el = gel(id);
  var effect = true;
  if (el.noEffect)
    effect = false;
  if (!window['Rico'])
    effect = false;
  var arrowImage = gel("img." + id);
  if (el.style.display != "block") {
    if (!effect) {
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.height = "auto";
    } else {
      var div = gel("div." + el.id);
      var allowExpansion = (div.offsetTop - document.body.scrollTop + (div.offsetHeight * 2)) > document.body.clientHeight;
      el.setAttribute('allowExpansion', allowExpansion.toString());
      expandEffect(el, null, null, menuExpandCallback, menuExpandCallback);
    }
    arrowImage.src = "images/arrows_collapse_sm.gifx?v=2";
    arrowImage.alt = g_appCollapseMsg;
    setPreference("menu." + id + ".expanded", "true");
    var topWin = getTopWindow();
    if (topWin['toggleCollapseIcon'])
      topWin.toggleCollapseIcon('collapse_apps', 'expand_apps');
    CustomEvent.fire('navmenu.expanded', id);
  } else {
    if (ignoreNextSwitch == false) {
      if (!effect)
        el.style.display = "none";
      else
        collapseEffect(el);
      arrowImage.src = "images/arrows_expand_sm.gifx?v=2";
      arrowImage.alt = g_appExpandMsg;
      deletePreference("menu." + id + ".expanded");
    }
    CustomEvent.fire('navmenu.collapsed', id);
  }
  ignoreNextSwitch = false;
}

function menuExpandCallback(el) {
  if (getAttributeValue(el, 'allowExpansion') != 'true')
    return;
  var id = el.id;
  var div = gel("div." + id);
  var h = el.clientHeight + (el.offsetTop - div.offsetTop);
  if ((div.offsetTop + h) > document.body.clientHeight) {
    var scrollTop = (div.offsetTop + h) - document.body.clientHeight;
    if (scrollTop > div.offsetTop)
      scrollTop = div.offsetTop;
    if (scrollTop > document.body.scrollTop)
      document.body.scrollTop = scrollTop;
    else
      el.setAttribute('allowExpansion', 'false');
  } else
    el.setAttribute('allowExpansion', 'false');
}
var g_lastAppLink;

function onModuleClick(event, element) {
  if (g_lastAppLink)
    g_lastAppLink.style.fontWeight = "";
  element.style.fontWeight = "bold";
  g_lastAppLink = element;
}

function ignoreSwitch() {
  ignoreNextSwitch = true;
}

function navExpandAll() {
  var tags = $$('.app_menu_div');
  for (var i = 0; i < tags.length; i++) {
    var div = tags[i];
    var scid = div.getAttribute("appid");
    if (scid && div.style.display != "none") {
      var subMenu = $(scid);
      if (subMenu.style.display == "none") {
        subMenu.noEffect = true;
        switchMenu(scid);
        subMenu.noEffect = false;
      }
    }
  }
}

function navCollapseAll() {
  var tags = $$('.app_menu_div');
  for (var i = 0; i < tags.length; i++) {
    var div = tags[i];
    var scid = div.getAttribute("appid");
    if (scid) {
      var subMenu = $(scid);
      if (subMenu.style.display == "block") {
        subMenu.noEffect = true;
        switchMenu(scid);
        subMenu.noEffect = false;
      }
    }
  }
};
/*! RESOURCE: /scripts/home.js */
var SECTIONS = "com.glide.ui.portal.RenderSections";
var LAYOUTS = "com.glideapp.home.RenderLayouts";
var LAYOUT_PREVIEW = "com.glideapp.home.LayoutPreview";

function addHomeContent(anchor) {
  var t = anchor.getAttribute('gsft_label');
  var a = anchor.getAttribute('gsft_active_section');
  var pageID = glideGrid.getProperty('sys_id');
  sectionDialog({
    renderer: SECTIONS,
    title: t,
    page_id: pageID,
    pinned: true,
    lazy_load: true,
    active_section: a
  });
}

function changeHomeLayout(t) {
  var pageID = glideGrid.getProperty('sys_id');
  sectionDialog({
    renderer: LAYOUTS,
    title: t,
    page_id: pageID,
    pinned: true
  });
}

function previewLayout(el) {
  var selected = el.options[el.selectedIndex];
  var id = selected.value;
  previewLayoutID(id);
}

function previewLayoutID(id, mode) {
  gel('render_layout_preview').innerHTML = '';
  var ajax = new GlideAjax(LAYOUT_PREVIEW);
  ajax.addParam("name", id);
  if (mode)
    ajax.addParam("mode", mode);
  ajax.getXMLAnswer(previewLayoutResponse);
}

function previewLayoutResponse(answer) {
  gel('render_layout_preview').innerHTML = answer;
  if (window.gWindow !== undefined)
    gWindow.onResize();
}

function sectionDialog(preferences) {
  var renderer = preferences['renderer'];
  var title = preferences['title'];
  var instance = new Date().getTime();
  instance *= 10;
  instance += g_instanceNum++;
  gWindow = new GlideDialogWindow(renderer);
  gWindow.setTitle(title.escapeHTML());
  gWindow.setPreferences(preferences);
  gWindow.setAriaLabel(new GwtMessage().getMessage("Add Content"));
  gWindow.render();
}

function addContent(preferences, where) {
  generateSection(preferences, where, glideGrid.isReadOnly());
  glideGrid.save();
}
g_instanceNum = 0;

function generateSection(preferences, column, readOnly, previewMode, cid) {
  var renderer = preferences['renderer'];
  var instance = new Date().getTime();
  instance *= 10;
  instance += g_instanceNum++;
  if (cid)
    instance = cid;
  var uniqueID = renderer + (renderer == SECTIONS ? "" : "_" + instance);
  if (typeof glideGrid != 'undefined' && glideGrid.isReadOnly())
    readOnly = true;
  var gWindow;
  if (column == null || typeof column == "string")
    gWindow = new GlideGridWindow(uniqueID, readOnly);
  else
    gWindow = new GlideWindow(uniqueID, readOnly);
  var title = preferences['title'];
  var titleLink = preferences['title_link'];
  var titleLinkClass = preferences['title_link_class'];
  var gm = new GwtMessage();
  if (!gm.isDefaultLanguage())
    title = gm.getMessage(title);
  if (typeof titleLink != "undefined" && titleLink.length > 0 && typeof titleLinkClass != "undefined" && titleLinkClass.length > 0) {
    gWindow.setTitle("<a href='" + titleLink + "' onmousedown='Event.stop(event); return false;' class='" + titleLinkClass + "'>" + title.escapeHTML() + "</a>");
  } else {
    gWindow.setTitle(title.escapeHTML());
  }
  gWindow.setPreferences(preferences);
  setMedia(gWindow, previewMode);
  if (gWindow.type() == "GlideGridWindow") {
    var topToBottom = true;
    if (cid)
      topToBottom = false;
    gWindow.attachGrid(glideGrid, column, topToBottom);
  } else {
    if (column != document.body)
      gWindow.setPosition("relative");
    gWindow.insert(column);
  }
  if (cid) {
    var body = compiled["window_" + cid];
    body = body.replace(/\t/g, "");
    body = body.replace(/\r/g, "");
    body = body.replace(/\n+/g, "\n");
    body = body.replace(/%27/g, "'");
    body = body.replace(/%3c/g, "<");
    body = body.replace(/%3e/g, ">");
    body = body.replace(/&amp;/g, "&");
    gWindow.setBody(body, true);
    body.evalScripts(true);
  } else
    gWindow.render();
}

function setMedia(gWindow, previewMode) {
  if (isPrinting())
    gWindow.setPreference('media', 'print');
  else if (previewMode)
    gWindow.setPreference('media', 'preview');
  else
    gWindow.removePreference('media');
}

function mainGel(id) {
  var main = top.frames['gsft_main'];
  return main.document.getElementById(id);
}

function savePortalLayout(afterFunction) {
  var theGrid = this;
  var ajax = new GlideAjax("HomeLayout");
  ajax.addParam("sysparm_type", "set");
  ajax.addParam("sysparm_view", theGrid.getProperty('view'));
  ajax.addParam("sysparm_value", theGrid.getDescribingText());
  ajax.addParam("sysparm_name", theGrid.getProperty('sys_id'));
  ajax.addParam("sysparm_chars", theGrid.getProperty('instance_id'));
  ajax.addParam("current_page_id", theGrid.getProperty('current_page_id'));
  ajax.getXML(checkForNew);
}

function checkForNew(request) {
  var xml = request.responseXML;
  var created = xml.documentElement.getAttribute("sysparm_created");
  if (created == "true") {
    var uid = xml.documentElement.getAttribute("sysparm_name");
    glideGrid.setProperty('sys_id', uid);
    var tel = gel('home_title');
    tel.readOnly = false;
    tel.value = new GwtMessage().getMessage("My ") + tel.value;
    saveTitle(tel.value, '');
    showHomeDelete();
    appendHomeMenu(uid, tel.value);
  }
}

function saveTitle(title, view) {
  var ajax = new GlideAjax("HomeLayout");
  ajax.addParam("sysparm_type", "title");
  ajax.addParam("sysparm_view", view);
  ajax.addParam("sysparm_value", title);
  ajax.addParam("sysparm_name", glideGrid.getProperty('sys_id'));
  ajax.getXML(doNothing);
}

function setRendererAttribute(s, r) {
  s.items = r;
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function expandRenderers(select, inputDiv) {
  if (select.options.selectedIndex == -1) {
    showPreview();
    return;
  }
  var item = select.options[select.options.selectedIndex].value;
  closeChildren(select);
  var items = select.items;
  var nitems = items[item];
  if (nitems['hasMore']) {
    var renderer = nitems['hasMore'];
    delete nitems['hasMore'];
    nitems['loading'] = renderer;
    showMessage(select, new GwtMessage().getMessage('Loading...'));
    var additionalArgs = {};
    additionalArgs.select = select;
    additionalArgs.inputDiv = inputDiv;
    additionalArgs.selectedIndex = select.options.selectedIndex;
    var ajax = new GlideAjax("HomeSection");
    ajax.addParam("sysparm_renderer", renderer);
    ajax.setErrorCallback(errorLoading);
    ajax.getXML(loadSections, null, additionalArgs);
  } else if (nitems['loading']) {
    showMessage(select, new GwtMessage().getMessage('Loading...'));
  } else if (nitems['renderer']) {
    nitems['current_page'] = gel('current_page').value;
    showPreview(nitems);
  } else {
    var parentDiv = document.createElement("div");
    parentDiv.className = inputDiv.parentNode.className;
    document.body.appendChild(parentDiv);
    insertAfter(inputDiv.parentNode, parentDiv);
    var newInputDiv = document.createElement("div");
    newInputDiv.className = inputDiv.className;
    parentDiv.appendChild(newInputDiv);
    var ns = document.createElement("select");
    ns.className = select.className;
    ns.size = select.size;
    ns.no_sort = select.no_sort;
    if (select.getAttribute("aria-label"))
      ns.setAttribute("aria-label", new GwtMessage().getMessage("Select Widgets in ") + item);
    ns.onchange = function() {
      expandRenderers(ns, newInputDiv);
    };
    parentDiv.appendChild(ns);
    select.childRenderer = ns;
    select.childInput = newInputDiv;
    var newInputSpan = document.createElement("span");
    newInputSpan.className = inputDiv.childNodes[0].className;
    parentDiv.appendChild(newInputSpan);
    newInputDiv.insertBefore(newInputSpan, null);
    var input = inputDiv.childNodes[1];
    var newInput = document.createElement("input");
    newInput.className = input.className;
    newInput.autocomplete = input.autocomplete;
    newInput.type = input.type;
    newInput.onkeyup = function() {
      filterSection(newInput, ns)
    };
    if (input.getAttribute("aria-label"))
      newInput.setAttribute("aria-label", new GwtMessage().getMessage("Filter Widgets in ") + item);
    if (input.getAttribute("role"))
      newInput.setAttribute("role", input.getAttribute("role"));
    parentDiv.appendChild(newInput);
    newInputDiv.insertBefore(newInput, null);
    for (av in nitems) {
      var option = addOption(ns, av, av, false, av);
    }
    setRendererAttribute(ns, nitems);
    sortSelect(ns);
    ns.allOptions = new Array();
    for (var i = 0; i < ns.options.length; i++)
      ns.allOptions[i] = ns.options[i].value;
    ns.options.selectedIndex = 0;
    ns.onchange();
  }
}

function filterSection(input, select) {
  var text = input.value;
  var oldValue = null;
  if (select.selectedIndex != -1 && select.options[select.selectedIndex])
    oldValue = select.options[select.selectedIndex].value;
  select.options.length = 0;
  var options = select.allOptions;
  var selectedIndex = 0;
  var found = false;
  for (var i = 0; i < options.length; i++) {
    if (options[i].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
      if (oldValue === options[i]) {
        selectedIndex = select.options.length;
        found = true;
      }
      addOption(select, options[i], options[i], false, options[i]);
    }
  }
  select.selectedIndex = selectedIndex;
  if (!found)
    select.onchange();
}

function showMessage(select, msg) {
  closeChildren(select);
  var selectParent = select.parentNode;
  var newParentDiv = document.createElement("div");
  newParentDiv.className = select.parentNode.className;
  document.body.appendChild(newParentDiv);
  if (selectParent.parentNode)
    selectParent.parentNode.insertBefore(newParentDiv, null);
  var ns = document.createElement("p");
  ns.className = select.className;
  ns.innerHTML = msg;
  newParentDiv.appendChild(ns);
  select.childRenderer = ns;
}

function errorLoading(response, additionalArgs) {
  var select = additionalArgs.select;
  var active = (additionalArgs.selectedIndex == select.options.selectedIndex);
  var items = select.items;
  var nitems = items[select.options[additionalArgs.selectedIndex].value];
  var renderer = nitems['loading'];
  delete nitems['loading'];
  nitems['hasMore'] = renderer;
  if (active == true)
    showMessage(select, new GwtMessage().getMessage('An error has occurred'));
}

function loadSections(response, additionalArgs) {
  var item;
  try {
    item = response.responseXML.documentElement.firstChild;
    item.hasChildNodes();
  } catch (e) {
    errorLoading(response, additionalArgs);
    return;
  }
  var select = additionalArgs.select;
  var active = (additionalArgs.selectedIndex == select.options.selectedIndex);
  if (active == true)
    closeChildren(select);
  var items = select.items;
  var nitems = items[select.options[additionalArgs.selectedIndex].value];
  if (item.hasChildNodes())
    for (var i = 0; i < item.childNodes.length; i++)
      addSections(item.childNodes[i], nitems);
  delete nitems['loading'];
  if (active == true)
    expandRenderers(select, additionalArgs.inputDiv);
}

function addSections(item, nitems) {
  if (item.hasChildNodes()) {
    nitems[item.getAttribute("name")] = {};
    for (var i = 0; i < item.childNodes.length; i++)
      addSections(item.childNodes[i], nitems[item.getAttribute("name")]);
  } else {
    nitems[item.getAttribute("name")] = item.getAttribute("json").evalJSON();
  }
}

function closeChildren(select) {
  var s = select.childRenderer;
  var inputDiv = select.childInput;
  if (s) {
    closeChildren(s);
    if (s.parentNode) {
      var selectParent = s.parentNode;
      if (inputDiv) {
        selectParent.removeChild(inputDiv);
        select.childInput = null;
      }
      selectParent.removeChild(s);
      select.childRenderer = null;
      if (selectParent.parentNode)
        selectParent.parentNode.removeChild(selectParent);
    }
  }
}

function showPreview(props) {
  var rpSpot = $('render_preview');
  rpSpot.innerHTML = "";
  rpSpot.sectionProperties = props;
  if (props)
    generateSection(props, rpSpot, true, true);
}

function attachSection(where, edit) {
  var rpSpot = $('render_preview');
  if (rpSpot.sectionProperties) {
    rpSpot.sectionProperties['sysparm_edit_link'] = edit;
    addContent(rpSpot.sectionProperties, where);
    rpSpot.sectionProperties['sysparm_edit_link'] = 'false';
  }
}

function isPrinting() {
  if (window.location.search && window.location.search.indexOf("sysparm_media=print") > -1)
    return true;
  return false;
}

function redirectPage(id) {
  self.location = "home.do?sysparm_userpref_homepage=" + id;
}

function redirectToCanvas(id, isEditable) {
  self.location = "$canvas.do?sysparm_editable=" + isEditable + "&sysparm_pageid=" + id;
}

function showHomeDelete() {
  var d = gel('advanced_functions');
  d.style.display = "block";
}

function appendHomeMenu(value, label) {
  var ps = gel('page_selector');
  if (ps.options[1].id != "my_pages") {
    var o = addOptionAt(ps, "", "------------", 1);
    o.style.color = "gray";
  }
  addOptionAt(ps, value, label, 2);
}

function homeExport(view, dataDoctype) {
  var urlQueryParameters = '';
  if (typeof view === 'undefined')
    urlQueryParameters = getQueryStringFromUrl(true);
  else
    urlQueryParameters = 'sysparm_view=' + view + getQueryStringFromUrl(false);
  var dialog = new GwtWHTPScheduleDialog('/home.do?' + urlQueryParameters, dataDoctype);
  dialog.execute();
}

function getQueryStringFromUrl(includeSysParamViewIfExist) {
  var queryString = '&';
  var hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    if (includeSysParamViewIfExist || (hash[0] !== 'sysparm_view'))
      queryString += hash[0] + '=' + hash[1];
  }
  return queryString;
}
var g_timerID = '';
var g_refreshSeconds = -1;
var g_refresh;

function initRefresh(userRefreshValue) {
  g_refresh = userRefreshValue;
  if (g_refresh != 'off')
    g_refreshSeconds = g_refresh * 1;
  var el = gel("refresh_options");
  if (el) {
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value == g_refresh) {
        el.selectedIndex = i;
        break;
      }
    }
  } else {
    var el = gel("home-refresh-" + g_refresh);
    if (el)
      el.click();
  }
}

function beginRefresh() {
  if (g_refreshSeconds == -1)
    return;
  if (g_refreshSeconds == 0) {
    homeRefresh(true);
    return;
  }
  var minutes = Math.floor(g_refreshSeconds / 60);
  var seconds = g_refreshSeconds % 60;
  var message;
  if (minutes != 0)
    message = minutes + ":" + seconds;
  else
    message = seconds + " seconds";
  window.status = "Refreshing in: " + message;
  g_refreshSeconds--;
  g_timerID = setTimeout("beginRefresh()", 1000);
}

function onRefreshChange(select) {
  var index = select.selectedIndex;
  if (index == -1)
    return;
  var value = select.options[index].value;
  changeRefresh(value);
}

function onRadioRefreshChange(radio) {
  changeRefresh(radio.value);
}

function changeRefresh(value) {
  clearTimeout(g_timerID);
  if (value == 'off') {
    g_refreshSeconds = -1;
    window.status = 'Auto refresh off';
  } else {
    g_refreshSeconds = value * 1;
  }
  setPreference('home_refresh', value);
  beginRefresh();
}

function homeRefresh(isAutomaticRefresh) {
  window.status = "Refreshing";
  var url = new GlideURL(self.location.href);
  if (top.SNC) {
    for (var listener in top.SNC.channelListeners) {
      var lstnr = top.SNC.channelListeners[listener];
      lstnr.unsubscribe();
      delete top.SNC.channelListeners[listener];
    }
  }
  if (isAutomaticRefresh)
    url.addParam('sysparm_auto_request', 'true');
  self.location.replace(url.getURL());
}

function changePage(s) {
  var o = s.options[s.options.selectedIndex];
  var v = o.value;
  if (v == 'change_layout') {
    changeHomeLayout(o.text);
  } else if (v == '') {
    s.selectedIndex = 0;
  } else if (v == '_new_') {
    newPage();
  } else {
    redirectPage(v);
  }
}

function newPage() {
  var ajax = new GlideAjax("HomePageAjax");
  ajax.addParam("sysparm_name", "homeCreate");
  ajax.getXML(homeAjaxResponse);
}

function homeAjaxResponse(response) {
  var answer = response.responseXML.documentElement.getAttribute("answer");
  var type = response.responseXML.documentElement.getAttribute("sysparm_name");
  var isCreate = (type === "homeCreate");
  if (isCreate) {
    redirectPage(answer);
  } else {
    var deleteSuccess = (answer === "");
    if (deleteSuccess)
      redirectPage(answer);
  }
}

function saveColumns(columns) {
  var ajax = new GlideAjax("HomeLayout");
  ajax.addParam("sysparm_type", "columns");
  ajax.addParam("sysparm_view", glideGrid.getProperty('view'));
  ajax.addParam("sysparm_value", glideGrid.getDescribingText());
  ajax.addParam("sysparm_name", glideGrid.getProperty('sys_id'));
  ajax.addParam("sysparm_chars", columns);
  ajax.getXML(homeRefresh);
}
if (typeof $j !== 'undefined') {
  $j(function() {
    if ($j('#cog-wheel').popover) {
      $j('#cog-wheel').popover({
        trigger: 'manual',
        placement: 'bottom',
        html: true
      }).click(function(e) {
        e.preventDefault();
        $j(this).popover('show');
        $j('#buttons-group .popover').css('right', '5px').css('left', 'auto');
        var offset = $j('#cog-wheel').offset();
        var popoverArrow = $j("#buttons-group .popover.bottom .arrow");
        var offsetForPopoverArrow = {
          top: popoverArrow.offset().top,
          left: offset.left + 3
        };
        popoverArrow.offset(offsetForPopoverArrow);
      });
    }
  });
};
/*! RESOURCE: /scripts/classes/DashboardMessageHandler.js */
function DashboardMessageHandler(unique_id, callback) {
  this._filters = {};
  this._temporaryFilters = {};
  this._unique_id = unique_id;
  this.setCallback(callback);
  this._subscribeToEvents();
};
DashboardMessageHandler.prototype._subscribeToEvents = function() {
  this._addedCallback = this._dashboardFilterAdded.bind(this);
  this._addedGroupFilterCallback = this._dashboardGroupFilterAdded.bind(this);
  this._removedCallback = this._dashboardFilterRemoved.bind(this);
  this._removedGroupFilterCallback = this._dashboardGroupFilterRemoved.bind(this);
  this._publishGroupFilterCallback = this._dashboardGroupFilterPublished.bind(this);
  this._setGroupFiltersCallback = this._setGroupFilters.bind(this);
  this._filterPausedCallback = this._filterPaused.bind(this);
  this._filterResumedCallback = this._filterResumed.bind(this);
  if (window.SNC && SNC.canvas && SNC.canvas.eventbus) {
    SNC.canvas.eventbus.subscribe('dashboard_filter.added', this._addedCallback);
    SNC.canvas.eventbus.subscribe('dashboard_filter.removed', this._removedCallback);
  }
  CustomEvent.observe('dashboard_filter.filter_paused', this._filterPausedCallback);
  CustomEvent.observe('dashboard_filter.filter_resumed', this._filterResumedCallback);
  CustomEvent.observe('dashboard_filter.added', this._addedCallback);
  CustomEvent.observe('dashboard_group_filter.added', this._addedGroupFilterCallback);
  CustomEvent.observe('dashboard_filter.removed', this._removedCallback);
  CustomEvent.observe('dashboard_group_filter.removed', this._removedGroupFilterCallback);
  CustomEvent.observe('dashboard_group_filter.publish', this._publishGroupFilterCallback);
  CustomEvent.observe('dashboard_group_filter.setGroupFilters', this._setGroupFiltersCallback);
  addUnloadEvent(this._unsubscribeFromEvents.bind(this));
};
DashboardMessageHandler.prototype._filterPaused = function() {
  this._filterPause = true;
};
DashboardMessageHandler.prototype._filterResumed = function(config) {
  this._filterPause = false;
  this._filters = config.filters;
  if (typeof this._callback === "function") {
    this._showFilterIndicator();
    this._callback();
  }
};
DashboardMessageHandler.prototype._unsubscribeFromEvents = function() {
  CustomEvent.un('dashboard_filter.added', this._addedCallback);
  CustomEvent.un('dashboard_filter.removed', this._removedCallback);
  CustomEvent.un('dashboard_group_filter.added', this._addedGroupFilterCallback);
  CustomEvent.un('dashboard_group_filter.removed', this._removedGroupFilterCallback);
  CustomEvent.un('dashboard_group_filter.publish', this._publishGroupFilterCallback);
  CustomEvent.un('dashboard_group_filter.setGroupFilters', this._setGroupFiltersCallback);
  CustomEvent.un('dashboard_filter.filter_paused', this._filterPausedCallback);
  CustomEvent.un('dashboard_filter.filter_resumed', this._filterResumedCallback);
  if (window.SNC && SNC.canvas && SNC.canvas.eventbus) {
    SNC.canvas.eventbus.unsubscribe('dashboard_filter.added');
    SNC.canvas.eventbus.unsubscribe('dashboard_filter.removed');
  }
};
DashboardMessageHandler.prototype._dashboardFilterAdded = function(data, envelope) {
  if (data.id.substring(0, this._unique_id.length) == this._unique_id)
    return;
  this._filters[data.id] = data[data.id];
  if (typeof this._callback === "function" && !this._filterPause) {
    this._showFilterIndicator();
    this._callback();
  }
};
DashboardMessageHandler.prototype._dashboardGroupFilterAdded = function(data, envelope) {
  this._temporaryFilters[data.id] = this._temporaryFilters[data.id] || {};
  var filterMessage = data[data.id];

  function addGroupMessage(uniqueId, filterMessage) {
    for (var key in filterMessage) {
      this._temporaryFilters[uniqueId][key] = filterMessage[key];
    }
  }
  for (var key in filterMessage) {
    if (data.id === key) {
      addGroupMessage(data.id, filterMessage[key]);
    } else {
      this._temporaryFilters[data.id][key] = filterMessage[key];
    }
  }
};
DashboardMessageHandler.prototype._dashboardGroupFilterPublished = function(data, envelope) {
  if (this._temporaryFilters[data.id]) {
    this._filters[data.id] = JSON.parse(JSON.stringify(this._temporaryFilters[data.id]));
  } else {
    delete this._filters[data.id];
  }
  if (typeof this._callback === "function" && !this._filterPause) {
    this._showFilterIndicator();
    this._callback();
  }
};
DashboardMessageHandler.prototype._dashboardFilterRemoved = function(data, envelope) {
  if (data.id.substring(0, this._unique_id.length) == this._unique_id)
    return;
  delete this._filters[data.id];
  if (typeof this._callback === "function" && !this._filterPause) {
    this._callback();
  }
  this._showFilterIndicator();
};
DashboardMessageHandler.prototype._dashboardGroupFilterRemoved = function(data, envelope) {
  var filter = this._temporaryFilters[data.groupId];
  if (filter) {
    if (data.id) {
      delete this._temporaryFilters[data.groupId][data.id];
    } else {
      delete this._temporaryFilters[data.groupId]
    }
  }
};
DashboardMessageHandler.prototype.publishMessage = function(message) {
  var filterMessage = {};
  var id = message.id || this._unique_id;
  filterMessage[id] = message;
  filterMessage["id"] = id;
  CustomEvent.fire('dashboard_filter.added', filterMessage);
  return filterMessage;
};
DashboardMessageHandler.prototype.publishGroupMessage = function(message) {
  var filterMessage = {};
  var id = message.id || this._unique_id;
  filterMessage[id] = message;
  filterMessage["id"] = id;
  CustomEvent.fire('dashboard_group_filter.added', filterMessage);
  return this.getGroupFilterMessage(filterMessage);
};
DashboardMessageHandler.prototype.publishFilter = function(table, filter) {
  var filter_message = this.getFilterMessage(table, filter);
  this.publishMessage([filter_message]);
};
DashboardMessageHandler.prototype.publishGroupFilter = function(id) {
  CustomEvent.fire('dashboard_group_filter.publish', {
    id: id
  });
};
DashboardMessageHandler.prototype.removeFilter = function() {
  var filter_message = {};
  filter_message.id = this._unique_id;
  CustomEvent.fire('dashboard_filter.removed', filter_message);
};
DashboardMessageHandler.prototype.removeGroupFilter = function(groupConfigId, currentConfig) {
  var filter_message = {};
  filter_message.id = currentConfig.id;
  filter_message.groupId = groupConfigId;
  CustomEvent.fire('dashboard_group_filter.removed', filter_message);
};
DashboardMessageHandler.prototype.setCurrentFilters = function(data) {
  if (!data || data === '')
    return;
  var filterArray = typeof data === "object" ? data : JSON.parse(data);
  for (var index = 0; index < filterArray.length; index++) {
    var filter = filterArray[index];
    this._filters[filter.id] = filter[filter.id];
    if (Object.prototype.toString.call(filter[filter.id]) !== '[object Array]') {
      this._temporaryFilters[filter.id] = filter[filter.id];
    }
  }
  this._showFilterIndicator();
};
DashboardMessageHandler.prototype._setGroupFilters = function(data) {
  var filterArray = typeof data === "object" ? data : JSON.parse(data);
  for (var index = 0; index < filterArray.length; index++) {
    var filter = filterArray[index];
    this._filters[filter.id] = filter[filter.id];
    this._temporaryFilters[filter.id] = filter[filter.id];
  }
  this._showFilterIndicator();
};
DashboardMessageHandler.prototype.setGroupFilters = function(data) {
  if (!data || data === '')
    return;
  CustomEvent.fire('dashboard_group_filter.setGroupFilters', data);
};
DashboardMessageHandler.prototype.getCurrentFilters = function() {
  var filterArray = [];
  for (var filter in this._filters)
    filterArray.push(this._filters[filter]);
  return filterArray;
};
DashboardMessageHandler.prototype.getFilterMessage = function(table, filter) {
  var filter_message = {};
  filter_message.id = this._unique_id;
  filter_message.table = table;
  filter_message.filter = filter;
  return filter_message;
};
DashboardMessageHandler.prototype.getGroupFilterMessage = function(data) {
  var finalGroupMessage = this._filters[this._unique_id] || {};
  var filterMessage = data && data.hasOwnProperty("id") ? data[data.id] : {};
  for (var key in filterMessage) {
    finalGroupMessage[key] = filterMessage[key];
  }
  return finalGroupMessage
};
DashboardMessageHandler.prototype.setCallback = function(callback) {
  this._callback = callback;
};
DashboardMessageHandler.prototype.getClassName = function() {
  return "DashboardMessageHandler";
};
DashboardMessageHandler.prototype._showFilterIndicator = function() {
  if (!window.SNC || !SNC.canvas || !SNC.canvas.canvasUtils || !SNC.canvas.isGridCanvasActive) {
    return false;
  }
  var originalWidgetId = this._unique_id;
  var glideWindow = SNC.canvas.canvasUtils.getGlideWindow(originalWidgetId);
  if (glideWindow) {
    var currentFilters = this.getCurrentFilters();
    var doShow = currentFilters.length && glideWindow.preferences.filter_indicator === 'true';
    SNC.canvas.canvasUtils.displayFilterIndicator(originalWidgetId, doShow);
  }
};;
/*! RESOURCE: /scripts/classes/GwtGrid.js */
var GwtGrid = Class.create({
  initialize: function(id, viewName) {
    this.id = id;
    this._properties = new Object();
    this._readOnly = false;
    this._viewName = viewName;
    this._initDragZones();
    this._initDraggables();
    this.setSave(this._defaultSave);
  },
  add: function(gWindow, dropZoneID, topToBottom) {
    var id = gWindow.getID();
    var d = this.get(id);
    var zone;
    if (dropZoneID && this.getDragZoneByName(dropZoneID)) {
      zone = this.getDragZoneByName(dropZoneID);
    } else {
      zone = this.zones[1];
    }
    if (!d) {
      var spareDiv = this._getLastDiv(zone);
      spareDiv.id = id;
      spareDiv.style.position = "relative";
      spareDiv.style.marginBottom = gWindow.getLowerSpacing();
      if (this.getProperty("items.avoidPageBreakInside"))
        spareDiv.style.pageBreakInside = "avoid";
      spareDiv.setAttribute("dragpart", id);
      spareDiv.className += " drag_section_part glide-grid-block";
      spareDiv.gWindow = gWindow;
      spareDiv.appendChild(gWindow.getWindowDOM());
      gWindow.container = spareDiv;
      gWindow.setGrid(this);
      if (topToBottom)
        zone.insertBefore(spareDiv, zone.childNodes[0]);
      gWindow._enableDragging(spareDiv);
      zone.appendChild(cel("div"));
      return spareDiv;
    } else {
      alert("missing id:" + id);
    }
  },
  _getLastDiv: function(zone) {
    var nl = zone.childNodes;
    for (var i = 0; i < nl.length; i++)
      if (nl[i].id == 'lastdiv')
        return nl[i];
    return zone.childNodes[zone.childNodes.length - 1];
  },
  destroy: function() {
    for (var i = this.zones.length - 1; i >= 0; i--) {
      var ctd = this.zones[i];
      for (var z = 0; z < ctd.childNodes.length - 1; z++) {
        var ac = ctd.childNodes[z];
        if (ac.gWindow)
          ac.gWindow.release();
        ac.gWindow = null;
        ac = null;
      }
      ctd = this.zones[i] = null;
    }
  },
  get: function(id) {
    var draggables = this._getDraggables();
    for (var i = 0; i < draggables.length; i++) {
      var current = draggables[i];
      var dragid = current.getAttribute("dragpart");
      if (current && dragid && dragid.length > 0 && dragid == id)
        return current;
    }
  },
  getWindow: function(id) {
    var element = this.get(id);
    if (element)
      return element.gWindow;
  },
  getWindowByGaugeId: function(sys_id) {
    var draggables = this._getDraggables();
    for (var i = 0; i < draggables.length; i++) {
      var current = draggables[i];
      if (current && current.gWindow && current.gWindow.getPreference('sys_id') == sys_id)
        return current.gWindow;
    }
  },
  getDescribingXML: function() {
    var zones = this.getDragZones();
    var prefRoot = document.createElement("grid");
    for (var i = 0; i < zones.length; i++) {
      var column = document.createElement("dropzone");
      column.setAttribute("offset", i);
      column.setAttribute("name", zones[i].id);
      for (var z = 0; z < zones[i].childNodes.length - 1; z++) {
        var ac = zones[i].childNodes[z];
        if (!ac.gWindow)
          continue;
        var row = document.createElement("item");
        row.setAttribute("offset", z);
        var gWindow = ac.gWindow;
        var section = gWindow.getDescribingXML();
        row.appendChild(section);
        column.appendChild(row);
      }
      prefRoot.appendChild(column);
    }
    return prefRoot;
  },
  getDescribingText: function() {
    var gxml = document.createElement("gxml");
    var x = this.getDescribingXML();
    gxml.appendChild(x);
    return gxml.innerHTML;
  },
  getDragZones: function() {
    return this.zones;
  },
  getDragZoneByOffset: function(offset) {
    return this.zones[offset];
  },
  getDragZoneByName: function(id) {
    for (var i = 0; i < this.zones.length; i++) {
      if (this.zones[i].id == id) {
        return this.zones[i];
      }
    }
  },
  getDragZoneByNodeId: function(nodeId) {
    var zones = this.getDragZones();
    for (var i = 0; i < zones.length; i++) {
      var zone = zones[i];
      for (var z = 0; z < zone.childNodes.length - 1; z++) {
        var ac = zone.childNodes[z];
        var gWindow = ac.gWindow;
        if (!gWindow)
          continue;
        if (gWindow.getID() == nodeId)
          return zone;
      }
    }
    return "";
  },
  getID: function() {
    return this.id;
  },
  getLastMovedWindow: function(gWindow) {
    return this.lastMovedWindow;
  },
  getProperty: function(n) {
    if (typeof this._properties[n] == "undefined")
      return "";
    return this._properties[n];
  },
  getViewName: function() {
    return this._viewName;
  },
  isReadOnly: function() {
    return this._readOnly;
  },
  remove: function(gWindow) {
    var d = this.get(gWindow.getID());
    if (d) {
      gWindow.release();
      d.parentNode.removeChild(d);
      this.save();
    }
  },
  save: function(func) {
    if (this._saveFunction && !this._readOnly) {
      var saver = this._saveFunction.bind(this);
      saver(func);
    }
  },
  setLastMovedWindow: function(gWindow) {
    this.lastMovedWindow = gWindow;
  },
  setSave: function(saveFunction) {
    this._saveFunction = saveFunction;
  },
  setReadOnly: function(r) {
    this._readOnly = r;
    if (r == false) {
      this._initReadOnly();
      this._initDraggables();
      this._initAllDecorations();
    }
  },
  setProperty: function(n, v) {
    this._properties[n] = v;
  },
  setViewName: function(name) {
    this._viewName = name;
  },
  _createFloat: function(gd, x, y) {
    var dobj = gd.getDraggable();
    var dfloat = cel("div");
    dfloat.id = "floater";
    dfloat.style.opacity = 0.7;
    dfloat.style.filter = "alpha(opacity=70)";
    dfloat.style.border = "1px black dashed";
    dfloat.style.backgroundColor = "white";
    dfloat.style.width = dobj.offsetWidth + 'px';
    dfloat.style.height = dobj.offsetHeight + 'px';
    dfloat.style.position = "absolute";
    dfloat.style.top = (y - gd.getYDifference()) + 'px';
    dfloat.style.left = (x - gd.getXDifference()) + 'px';
    dfloat.style.zIndex = "500";
    gd.floatObj = dfloat;
    document.body.appendChild(dfloat);
  },
  _calculateMove: function(gd, x, y) {
    var dobj = gd.getDraggable();
    var cCell = null;
    var aLargeNumber = 100000000;
    for (var z = 0; z < this.zones.length; z++) {
      for (var i = 0; i < this.zones[z].childNodes.length; i++) {
        var draggable = this.zones[z].childNodes[i];
        if (draggable == dobj)
          continue;
        var ai = Math.sqrt(Math.pow(x - draggable.pagePosLeft, 2) + Math.pow(y - draggable.pagePosTop, 2));
        if (isNaN(ai))
          continue;
        if (ai <= aLargeNumber) {
          aLargeNumber = ai;
          cCell = draggable;
        }
      }
    }
    if (cCell == null)
      return;
    var dropZone = cCell.parentNode;
    var dropZoneRow = dropZone.parentNode.getAttribute("id");
    var restrictedRow = dobj.gWindow ? dobj.gWindow.getPreference('restrict_row') : "";
    if (dropZoneRow && restrictedRow && dropZoneRow != restrictedRow)
      return;
    if (dobj.nextSibling != cCell) {
      dropZone.insertBefore(dobj, cCell);
      dobj.parentNode.style.display = "none";
      dobj.parentNode.style.display = "";
      if (dobj.gWindow)
        dobj.gWindow.render();
    }
  },
  _defaultSave: function(afterFunction) {
    var zones = this.getDragZones();
    var id = this.getID();
    var savedString = "";
    for (var i = 0; i < zones.length; i++) {
      savedString += (i ? "," : "") + i + "=";
      for (var z = 0; z < zones[i].childNodes.length - 1; z++) {
        var ac = zones[i].childNodes[z];
        var sectionName = ac.getAttribute("dragpart");
        savedString += (z ? ":" : "") + sectionName;
      }
    }
    setPreference("grid." + id, savedString, afterFunction);
  },
  updateEditedWidget: function(zone, offset, realTime, showTitle, titleSize, titleAlign, showBorder, isPublisher, isSubscriber, widgetHeight, showFilterIndicator) {
    var zones = this.getDragZones();
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].id == zone) {
        var gWindow = zones[i].childNodes[offset].gWindow;
        gWindow.setTitleVisibility(showTitle);
        gWindow.setTitleAlign(titleAlign);
        gWindow.setTitleSize(titleSize);
        gWindow.setBorderVisibility(showBorder);
        gWindow.setPreference("real_time", realTime);
        gWindow.setPreference("show_title", showTitle);
        gWindow.setPreference("show_border", showBorder);
        gWindow.setPreference("title_size", titleSize);
        gWindow.setPreference("title_align", titleAlign);
        gWindow.setPreference("publisher_widget", isPublisher);
        gWindow.setPreference("subscriber_widget", isSubscriber);
        gWindow.setPreference("widget_height", widgetHeight);
        gWindow.setPreference("filter_indicator", showFilterIndicator);
        if (gWindow.definedHeight != widgetHeight && (gWindow.definedHeight || widgetHeight)) {
          if (!widgetHeight) {
            gWindow.removeHeight();
            gWindow.stick = false;
          } else {
            gWindow.setHeight(widgetHeight);
            gWindow.adjustBodySize();
            gWindow.stick = true;
          }
          gWindow.render();
        }
        if (gWindow.realTime !== realTime) {
          gWindow._toggleIndicator('real-time');
          gWindow.render();
        }
        break;
      }
    }
  },
  _floatBackAndDelete: function(gd, tTime, tMoves) {
    var baseObj = gd.getDraggable();
    var movenObj = gd.floatObj;
    var currentX = parseInt(movenObj.style.left);
    var currentY = parseInt(movenObj.style.top);
    var backX = (currentX - grabOffsetLeft(baseObj)) / tMoves;
    var backY = (currentY - grabOffsetTop(baseObj)) / tMoves;
    return setInterval(
      function() {
        if (tMoves < 1) {
          clearInterval(gd.floatIntv);
          gd.floatObj.parentNode.removeChild(gd.floatObj);
          return;
        }
        tMoves--;
        currentX -= backX;
        currentY -= backY;
        movenObj.style.left = parseInt(currentX) + "px";
        movenObj.style.top = parseInt(currentY) + "px"
      }, tTime / tMoves)
  },
  _getDraggables: function() {
    var draggables = new Array();
    for (var i = 0; i < this.zones.length; i++) {
      var ctd = this.zones[i];
      for (var z = 0; z < ctd.childNodes.length - 1; z++) {
        var dragItem = ctd.childNodes[z];
        if (dragItem.gWindow)
          draggables.push(ctd.childNodes[z]);
      }
    }
    return draggables;
  },
  _initDraggables: function() {
    var draggables = this._getDraggables();
    for (var z = 0; z < draggables.length; z++) {
      var tRoot = draggables[z];
      var gWindow = tRoot.gWindow;
      gWindow._enableDragging(tRoot);
    }
  },
  _initAllDecorations: function() {
    var zones = this.getDragZones();
    for (var i = 0; i < zones.length; i++) {
      for (var z = 0; z < zones[i].childNodes.length - 1; z++) {
        var ac = zones[i].childNodes[z];
        var gWindow = ac.gWindow;
        gWindow.initDecorations();
      }
    }
  },
  _initDragZones: function() {
    this.zones = new Array();
    var tableGrid = gel(this.id);
    if (!tableGrid) {
      alert("Unable to find table: " + this.id);
      return;
    }
    var things = $$('[dragging="true"]', '[dropzone="true"]');
    for (var tdn = 0; tdn < things.length; tdn++) {
      var ctd = things[tdn];
      this._initZone(ctd);
      this.zones.push(ctd);
    }
  },
  _initZone: function(dropZone) {
    var kids = dropZone.getElementsByTagName("div");
    for (var i = 0; i < kids.length; i++)
      if (kids[i].id == 'lastdiv')
        return;
    var lastDiv = cel("DIV");
    lastDiv.name = "lastdiv";
    lastDiv.style.width = "100%";
    dropZone.appendChild(lastDiv);
  },
  _initReadOnly: function() {
    var zones = this.getDragZones();
    for (var i = 0; i < zones.length; i++) {
      for (var z = 0; z < zones[i].childNodes.length - 1; z++) {
        var ac = zones[i].childNodes[z];
        var gWindow = ac.gWindow;
        gWindow.setReadOnly(this.isReadOnly());
      }
    }
  },
  _removeFloat: function(gd) {
    gd.floatIntv = this._floatBackAndDelete(gd, 150, 15);
  },
  _setPagePos: function(obj) {
    for (var z = 0; z < this.zones.length; z++) {
      var myHeight = 0;
      for (var i = 0; i < this.zones[z].childNodes.length; i++) {
        var draggable = this.zones[z].childNodes[i];
        if (draggable == obj)
          myHeight = draggable.offsetHeight;
        draggable.pagePosLeft = grabOffsetLeft(draggable);
        draggable.pagePosTop = grabOffsetTop(draggable) - myHeight;
      }
    }
    obj.origNextSibling = obj.nextSibling;
  },
  placeHolder: function() {}
});
var GlideGridWindow = Class.create(GlideWindow, {
  initialize: function(id, readOnly) {
    this.divMode = true;
    this.stick = false;
    GlideWindow.prototype.initialize.call(this, id, readOnly);
    if (top.SNC && top.SNC.isAccessibilityEnabled) {
      this.setClassName("drag_section isAccessibilityEnabled");
    } else {
      this.setClassName("drag_section");
    }
  },
  attachGrid: function(grid, column, topToBottom) {
    if (!this.getGrid())
      this.setGrid(grid);
    this._addGridDecorations();
    grid.add(this, column, topToBottom);
  },
  dragStart: function(gd, x, y) {
    this.getGrid()._setPagePos(gd.getDraggable());
    this.getGrid()._createFloat(gd, x, y);
  },
  dragging: function(gd, x, y) {
    gd.floatObj.style.left = x + 'px';
    gd.floatObj.style.top = y + 'px';
    this.getGrid()._calculateMove(gd, x, y)
  },
  dragEnd: function(gd) {
    this.getGrid()._removeFloat(gd);
    if (gd.getDraggable().nextSibling != gd.getDraggable().origNextSibling) {
      this.getGrid().setLastMovedWindow(this);
      this.getGrid().save();
    }
  },
  destroy: function() {
    if (this._dashboardMessageHandler)
      this._dashboardMessageHandler._unsubscribeFromEvents();
    delete this._dashboardMessageHandler;
    if (this.getGrid())
      this.getGrid().remove(this);
  },
  getGrid: function() {
    return this.grid;
  },
  setGrid: function(glideGrid) {
    this.grid = glideGrid;
  },
  _addGridDecorations: function() {
    if (!this.getGrid().getProperty("items.refreshable"))
      return;
    this.addFunctionDecoration("images/refresh_small.gifx", 'Refresh',
      function() {
        var gWindow = $(this.gWindow);
        gWindow.refresh();
      });
  },
  setBody: function($super, body, noEvaluate, setAlt) {
    $super(body, noEvaluate, setAlt);
    this.addStylings();
    this._addDashboardFiltering();
  },
  _draw: function(id) {
    var e = cel("DIV");
    e.style.overflow = "hidden";
    e.appendChild(this._drawTitle(id));
    e.appendChild(this._drawRightDecorations());
    e.appendChild(this._drawBody(id));
    e.appendChild(this._drawOverlay());
    e.id = "window." + id;
    this.window = e;
    this.window.className = this.windowClass;
    this.window.gWindow = this;
  },
  _drawTitle: function(id) {
    var dragTableHeader = cel("TABLE");
    var dragTableHeaderBody = cel("TBODY");
    dragTableHeader.className = "drag_section_header";
    dragTableHeader.setAttribute('role', 'presentation');
    dragTableHeader.style.width = "100%";
    this.header = dragTableHeader;
    var dragTableHeaderTR = cel("TR");
    var self = this;
    dragTableHeaderTR.appendChild(this._drawIndicator('icon-filter', 'filter-indicator-' + id, 'Follow interactive filter'));
    dragTableHeaderTR.appendChild(this._drawIndicator('icon-activity-circle', 'real-time-indicator-' + id, 'Real-time'));
    var leftDecorations = cel("TD");
    leftDecorations.style.display = "none";
    leftDecorations.style.top = "0px";
    leftDecorations.style.left = "0px";
    leftDecorations.style.verticalAlign = "top";
    leftDecorations.style.whiteSpace = "nowrap";
    this.leftDecorations = leftDecorations;
    dragTableHeaderTR.appendChild(leftDecorations);
    var dragTableHeaderTD = cel("TD");
    dragTableHeaderTD.className = "drag_section_movearea";
    dragTableHeaderTD.style.verticalAlign = "top";
    dragTableHeaderTD.style.padding = "5px";
    dragTableHeaderTD.id = id + "_header";
    dragTableHeaderTD.setAttribute('role', 'heading');
    dragTableHeaderTD.setAttribute("tabindex", "0");
    this.title = dragTableHeaderTD;
    dragTableHeaderTR.appendChild(dragTableHeaderTD);
    var headerDebugTD = cel("TD");
    headerDebugTD.className = "drag_section_debug";
    headerDebugTD.id = id + "_debug";
    this.debugTD = headerDebugTD;
    dragTableHeaderTR.appendChild(headerDebugTD);
    dragTableHeaderBody.appendChild(dragTableHeaderTR);
    dragTableHeader.appendChild(dragTableHeaderBody);
    if (!this.divMode) {
      baseTD.appendChild(dragTableHeader);
      baseTR.appendChild(baseTD);
    }
    dragTableHeaderTD = null;
    dragTableHeaderTR = null;
    dragTableHeaderBody = null;
    dragTableHeader = null;
    leftDecorations = null;
    if (!isMSIE6 && !isMSIE7 && !isMSIE8 && !isMSIE9)
      setTimeout(function() {
        if (self.getPreference("can_real_time") === "true")
          self._toggleIndicator('real-time');
      }, 100);
    return this.header;
  },
  _drawRightDecorations: function() {
    var rightDecorations = cel("div");
    rightDecorations.className = "header_decorations";
    rightDecorations.style.top = "5px";
    rightDecorations.style.right = "5px";
    rightDecorations.style.verticalAlign = "top";
    rightDecorations.style.whiteSpace = "nowrap";
    rightDecorations.style.textAlign = "right";
    rightDecorations.style.position = "absolute";
    rightDecorations.style.background = "white";
    rightDecorations.style.zIndex = 1025;
    this.rightDecorations = rightDecorations;
    return rightDecorations;
  },
  _drawOverlay: function() {
    var overlay = cel("div");
    overlay.className = "home_loading_overlay";
    overlay.style.display = "none";
    var container = cel("div");
    container.className = "home_loading_container";
    var icon = cel("div");
    if (document.documentElement.getAttribute('data-doctype') == 'true') {
      icon.className = "home_loading_indicator icon-loading";
    } else {
      var img = cel("img");
      img.src = "images/loading_anim2.gifx";
      icon.appendChild(img);
    }
    container.appendChild(icon);
    var message = cel("h1");
    message.className = "home_loading_message";
    container.appendChild(message);
    overlay.appendChild(container);
    this.overlay = overlay;
    this.overlayMessage = message;
    return overlay;
  },
  _stickyDimensions: function() {
    if (this.window.offsetHeight < 100)
      this.setHeight(100);
    else
      this.setHeight(this.window.offsetHeight);
    if (this.stick)
      this.adjustBodySize();
  },
  _unStickyDimensions: function() {
    if (!this.stick)
      this.removeHeight();
  },
  showLoading: function(msg, stickSize) {
    if (typeof unstickSize !== "undefined")
      this.stick = stickSize;
    this._stickyDimensions();
    if (typeof msg == "undefined")
      this.overlayMessage.innerHTML = new GwtMessage().getMessage('Loading...');
    else
      this.overlayMessage.innerHTML = msg;
    this.overlay.style.display = "block";
  },
  hideLoading: function() {
    this._unStickyDimensions();
    this.overlay.style.display = "none";
  },
  addStylings: function() {
    if (this.getPreference("show_title") && this.getPreference("show_title") === "false")
      this.setTitleVisibility(false);
    else {
      if (this.getPreference("title_align"))
        this.setTitleAlign(this.getPreference("title_align"));
      if (this.getPreference("title_size"))
        this.setTitleSize(this.getPreference("title_size"));
      if (this.getPreference("title_font"))
        this.setTitleFont(this.getPreference("title_font"));
      if (this.getPreference("title_color"))
        this.setTitleColor(this.getPreference("title_color"));
      if (this.getPreference("show_header_border") === "true")
        this.setHeaderBorderVisibility(true);
      if (this.getPreference("header_border_width"))
        this.setHeaderBorderWidth(this.getPreference("header_border_width"));
      if (this.getPreference("header_border_color"))
        this.setHeaderBorderColor(this.getPreference("header_border_color"));
      if (this.getPreference("header_background_color"))
        this.setHeaderBackgroundColor(this.getPreference("header_background_color"));
    }
    if (this.getPreference("show_border") && this.getPreference("show_border") === "false")
      this.setBorderVisibility(false);
    else {
      if (this.getPreference("border_width"))
        this.setBorderWidth(this.getPreference("border_width"));
      if (this.getPreference("border_color"))
        this.setBorderColor(this.getPreference("border_color"));
    }
    if (this.getPreference("widget_height") && !(window.SNC && window.SNC.canvas && window.SNC.canvas.layoutJson)) {
      this.setHeight(this.getPreference("widget_height"));
      this.adjustBodySize();
      this.stick = true;
    }
  },
  showWidgetDescription: function(window, sys_id) {
    gWindow = new GlideDialogWindow(window);
    gWindow.setTitle("<h4 class='modal-header modal-title'>" + new GwtMessage().getMessage('Widget Description') + "</h4>");
    gWindow.setPreference("sys_id", sys_id);
    gWindow.setWidth("385");
    gWindow.render();
  },
  editWidgetStyles: function() {
    var z = getZoneAndOffset(this.window);
    if (!z) {
      alert("Cannot customize this widget");
      return;
    }
    var zoneAndOffset = z.split("^");
    gWindow = new GlideDialogWindow("widget_style_editor");
    gWindow.setTitle("<h4 class='modal-header modal-title'>" + new GwtMessage().getMessage('Edit Widget') + "</h4>");
    gWindow.setPreference("real_time", (this.getPreference("real_time") === "true") ? true : false);
    gWindow.setPreference("is_using_database_view", (this.getPreference("is_using_database_view") === "true") ? true : false);
    gWindow.setPreference("show_title", !this.getPreference("show_title") || this.getPreference("show_title") === "true");
    gWindow.setPreference("title_align", this.getPreference("title_align") ? this.getPreference("title_align") : "left");
    gWindow.setPreference("title_size", this.getPreference("title_size") ? this.getPreference("title_size") : "10pt");
    gWindow.setPreference("title_font", this.getPreference("title_font") ? this.getPreference("title_font") : "Arial");
    gWindow.setPreference("title_color_id", this.getPreference("title_color_id"));
    gWindow.setPreference("show_header_border", this.getPreference("show_header_border") === "true");
    gWindow.setPreference("header_border_width", this.getPreference("header_border_width") ? this.getPreference("header_border_width") : "1px");
    gWindow.setPreference("header_border_color_id", this.getPreference("header_border_color_id"));
    gWindow.setPreference("header_background_color_id", this.getPreference("header_background_color_id"));
    gWindow.setPreference("show_border", !this.getPreference("show_border") || this.getPreference("show_border") === "true");
    gWindow.setPreference("border_width", this.getPreference("border_width") ? this.getPreference("border_width") : "1px");
    gWindow.setPreference("border_color_id", this.getPreference("border_color_id"));
    gWindow.setPreference("publisher_widget", this.getPreference("publisher_widget"));
    gWindow.setPreference("subscriber_widget", this.getPreference("subscriber_widget"));
    gWindow.setPreference("widget_height", this.getPreference("widget_height"));
    gWindow.setPreference("zone", zoneAndOffset[0]);
    gWindow.setPreference("offset", zoneAndOffset[1]);
    gWindow.setPreference("view", this.grid.getProperty("view"));
    gWindow.setPreference("portal_page_id", this.grid.getProperty('sys_id'));
    gWindow.setPreference("can_publish", this.getPreference("can_publish"));
    gWindow.setPreference("can_subscribe", this.getPreference("can_subscribe"));
    gWindow.setPreference("can_real_time", this.getPreference("can_real_time"));
    gWindow.setPreference("filter_indicator", this.getPreference("filter_indicator"));
    gWindow.setWidth("385");
    gWindow.setPreference("focusTrap", true);
    gWindow.render();
  },
  _addDashboardFiltering: function() {
    if (this._dashboardMessageHandler == undefined && this.getPreference("subscriber_widget") === "true")
      this._dashboardMessageHandler = new DashboardMessageHandler(this.getPreference("sys_id"));
  },
  getDashboardMessageHandler: function() {
    return this._dashboardMessageHandler;
  },
  overwriteRefresh: function(overwrite) {
    this._refreshOverwrite = overwrite;
  },
  enableDashboardMessageHandlerForCanvas: function() {
    this._addDashboardFiltering();
  },
  isRefreshOverridden: function() {
    return typeof this._dashboardMessageHandler !== 'undefined' && this._dashboardMessageHandler != null &&
      this._dashboardMessageHandler && this._refreshOverwrite != undefined &&
      typeof this._refreshOverwrite === "function";
  },
  refresh: function() {
    if (this._refreshOverwrite != undefined && typeof(this._refreshOverwrite) == "function") {
      if (!isMSIE6 && !isMSIE7 && !isMSIE8 && !isMSIE9 && this.getPreference("can_real_time") === "true")
        this._toggleIndicator('real-time');
      this._refreshOverwrite(this);
    } else {
      this.showLoading();
      this.on('bodyrendered', function() {
        this.hideLoading();
      });
      this.render();
    }
  },
  type: function() {
    return "GlideGridWindow";
  }
});;
/*! RESOURCE: /scripts/classes/doctype/doctype_homeOverrides.js */
GlideWindow.prototype.addFunctionFontIcon = function(icon, altText, onClick, side) {
  var a = cel('a');
  a.title = getMessage(altText);
  a.onclick = onClick;
  a.className = "home-icon " + icon;
  a.href = "javascript:void(0)";
  a.setAttribute("aria-label", a.title);
  a.setAttribute("role", "button");
  a.setAttribute("tabindex", "0");
  this.addDecoration(a, side);
};
GlideDecoration.prototype.attachEdit = function(window) {
  var an = cel('a');
  an.title = getMessage('Edit Widget');
  an.className = 'home-icon icon-edit';
  an.setAttribute("aria-label", an.title);
  an.setAttribute("role", "button");
  an.setAttribute("tabindex", "0");
  if (this.editLink.indexOf('javascript:') == 0) {
    var toEval = this.editLink.substring('javascript:'.length);
    toEval = "var f = function(e) { if (!e) { e = event;}; " + toEval + "}";
    eval(toEval);
    an.onclick = f;
  } else
    an.href = this.editLink;
  window.addDecoration(an, this.left);
};
GlideGridWindow.prototype._addGridDecorations = function() {
  if (this.preferences.help_text_window && this.preferences.help_text_window.length > 0) {
    this.addFunctionFontIcon('icon-help', 'Widget Description', function() {
      this.showWidgetDescription(this.preferences.help_text_window, this.preferences.sys_id);
    }.bind(this));
  }
  if (!this.isReadOnly()) {
    this.addFunctionFontIcon('icon-cog', 'Edit Widget Preferences',
      function() {
        this.editWidgetStyles();
      }.bind(this));
  }
  if (this.getGrid().getProperty("items.refreshable"))
    this.addFunctionFontIcon('icon-refresh', 'Refresh Widget',
      function() {
        this.refresh();
      }.bind(this));
};
GlideWindow.prototype.initDecorations = function() {
  if (!this.isReadOnly()) {
    this.closeDecoration = this.addFunctionFontIcon("icon-cross-circle", 'Close', this._onCloseClicked.bind(this));
  }
};;
/*! RESOURCE: /scripts/js_includes_catalog.js */
/*! RESOURCE: /scripts/catalog.js */
var pagingTimerHandle = null;
var g_formDirtyFocus = false;
addLoadEvent(function() {
  document.body.onmousedown = dirtyPageFocus;
});

function dirtyPageFocus() {
  jslog("Page focus is dirty");
  g_formDirtyFocus = true;
  document.body.onmousedown = null;
}

function catIsDoctype() {
  var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
  return isDoctype;
}

function openVariableDebugger() {
  if (typeof g_form !== 'undefined') {
    var modal = new GlideModal('variable_cs_log');
    modal.setTitle(getMessage('Variable Action Logger'));
    modal.setSize('modal-lg');
    modal.render();
  }
}

function openVariableSQLDebugger(id) {
  if (typeof g_form !== 'undefined') {
    var modal = new GlideModal('variable_sql_debug');
    modal.setTitle(getMessage('Variable SQL Debugger'));
    modal.setSize('modal-lg');
    modal.setPreference('catItemSysId', id);
    modal.render();
  }
}

function clickItemLink(elem, event, id) {
  var target = event.target || event.srcElement;
  if (target.tagName && target.tagName.toLowerCase() == "a" && target.href)
    return true;
  if (elem != target && target.up("a.service_catalog"))
    return true;
  if (typeof $(target).up("#item_link_" + id) != "undefined")
    return false;
  var link = $("item_link_" + id);
  var href = link.href;
  var target = link.target;
  if (target == "_blank")
    window.open(href);
  else
    document.location.href = href;
  Event.stop(event);
  return false;
}

function clickItemBreadcrumbLink(event, openTop) {
  var target = event.target || event.srcElement;
  var href = $(target).href;
  if (typeof href == "undefined" || !href) {
    var anchor = $(target).up("a");
    if (anchor)
      href = anchor.href;
  }
  if (href) {
    if (!openTop)
      document.location.href = href;
    else
      top.location.href = href;
  }
  Event.stop(event);
  return false;
}

function gotoRowBrowse(category, element, page, catalog, catalog_view) {
  if (gel(element.id + "_orig").value == element.value)
    return;
  if (pagingTimerHandle != null)
    clearTimeout(pagingTimerHandle);
  timerHandle = setTimeout("_gotoRowBrowse('" + category + "','" + element.value + "','" + page + "','" + catalog + "','" + catalog_view + "')", 1000);
}

function _gotoRowBrowse(category, row, page, catalog, catalog_view) {
  if (page != null && page.length > 0)
    document.location.href = page + ".do?sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
  else
    document.location.href = "com.glideapp.servicecatalog_category_view.do?sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
}

function gotoRowSearch(category, term, ck, element, page, catalog, catalog_view) {
  if (gel(element.id + "_orig").value == element.value)
    return;
  if (pagingTimerHandle != null)
    clearTimeout(pagingTimerHandle);
  timerHandle = setTimeout("_gotoRowSearch('" + category + "', '" + term + "', '" + ck + "', '" + element.value + "', '" + page + "','" + catalog + "','" + catalog_view + "')", 1000);
}

function _gotoRowSearch(category, term, ck, row, page, catalog, catalog_view) {
  if (page != null && page.length > 0)
    document.location.href = page + ".do?sysparm_search=" + term + "&sysparm_ck=" + ck + "&sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
  else
    document.location.href = "catalog_find.do?sysparm_search=" + term + "&sysparm_ck=" + ck + "&sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
}

function _getVcrIconClass() {
  var iconClass = "icon-vcr-right";
  var htmlElement = $j("html");
  if (htmlElement && htmlElement.hasClass('rtl'))
    iconClass = "icon-vcr-left";
  return iconClass;
}

function _toggleElement(element) {
  if (!element || !element.toggle)
    return;
  element.toggle();
}

function _toggleIcon(element, strIconClassA, strIconClassB) {
  if (!element)
    return;
  if (element.hasClassName(strIconClassA)) {
    element.removeClassName(strIconClassA);
    element.addClassName(strIconClassB);
  } else {
    element.removeClassName(strIconClassB);
    element.addClassName(strIconClassA);
  }
}

function toggleVariableSet(id) {
  var img = gel('img_' + id);
  if (!img)
    return;
  var src = img.src;
  var display = '';
  if (src.indexOf('reveal') > -1) {
    img.src = "images/filter_hide.gifx";
    img.at = getMessage('Expand');
    display = 'none';
  } else {
    img.src = "images/filter_reveal.gifx";
    img.alt = getMessage('Collapse');
  }
  var setRow = gel('row_' + id);
  setRow.style.display = display;
  _frameChanged();
}

function toggleVariableContainer(id) {
  var container = $j('#container_row_' + id);
  var button = $j('#img_' + id);
  var row = $('question_container_' + id);
  if (!container || !row)
    return false;
  row.toggleClassName('state-closed');
  if (button.hasClass('container-open')) {
    button.removeClass('container-open');
    button.addClass('container-close');
    button.attr('aria-expanded', false);
  } else {
    button.removeClass('container-close');
    button.addClass('container-open');
    button.attr('aria-expanded', true);
  }
  container.slideToggle();
  _frameChanged();
  return false;
}

function expandCollapseAllSets(expand) {
  var rows = $(document.body).select('.variable_set_row');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var toggle = false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(row.id.substring(4));
  }
}

function toggleHelp(elementId) {
  if (catIsDoctype()) {
    var name = elementId.replace('sys_orginal.', '');
    name = name.replace('ni.VE', '');
    var elementIdTokenized = name.split(':');
    var sysId;
    if (elementIdTokenized.length > 1)
      sysId = elementIdTokenized[1];
    else
      sysId = name;
    if (sysId.length > 32) {
      sysId = sysId.substring(0, 32);
    }
    var ele = $('question_help_IO_' + sysId + '_toggle');
    if (ele) {
      toggleVariableHelpText(ele);
    } else {
      ele = $('question_help_ni_VE' + sysId + '_toggle');
      if (ele)
        toggleVariableHelpText(ele);
      else
        this._toggleHelpNonDocType(elementId);
    }
  } else {
    this._toggleHelpNonDocType(elementId);
  }
  _frameChanged();
}

function _toggleHelpNonDocType(name) {
  var wrapper = $('help_' + name + '_wrapper');
  var image = $('img.help_' + name + '_wrapper');
  if (wrapper.style.display == "block" || wrapper.style.display == "") {
    wrapper.style.display = "none";
    image.src = "images/filter_hide16.gifx";
  } else {
    wrapper.style.display = "block";
    image.src = "images/filter_reveal16.gifx";
  }
  image.alt = getMessage("Display / Hide");
}

function toggleVariableHelpTextKeyEvent(event) {
  var e = event || window.event;
  var code = e.which || e.keyCode;
  if (code === 32 || code === 13) {
    e.preventDefault();
    toggleVariableHelpText(e.target);
  }
}

function toggleVariableHelpText(element) {
  if (!element)
    return;
  _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
  $j("#" + element.id + "_value").slideToggle();
  var expanded = (element.getAttribute("aria-expanded") === "true");
  element.setAttribute("aria-expanded", !expanded);
  _frameChanged();
}

function showItemPreview(element, id, isSearch) {
  if (element && !isSearch) {
    _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
    _toggleElement($("detail_" + id));
    _toggleElement($("short_desc_" + id));
  } else {
    _toggleElement($("search_detail_" + id));
    _toggleElement($("full_detail_" + id));
  }
  if (element && element.hasClassName("icon-vcr-right")) {
    element.parentNode.setAttribute('aria-expanded', false);
    CustomEvent.fire("frame.resized.smaller");
  } else {
    element.parentNode.setAttribute('aria-expanded', true);
    _frameChanged();
  }
}

function toggleDetail(elem, id, expandMsg, collapseMsg, textDirection) {
  if (elem) {
    if (collapseMsg == elem.getAttribute("toggle_state")) {
      elem.setAttribute("toggle_state", expandMsg);
      elem.alt = expandMsg;
      if (textDirection != "rtl")
        elem.src = './images/list_th_right.gifx';
      else
        elem.src = './images/list_th_left.gifx';
    } else {
      elem.setAttribute("toggle_state", collapseMsg);
      elem.alt = collapseMsg;
      elem.src = "./images/list_th_down.gifx";
    }
    _toggleElement($("detail_" + id));
  } else {
    _toggleElement($("search_detail_" + id));
    _toggleElement($("full_detail_" + id));
  }
  _frameChanged();
}

function toggleVariableSummary(name) {
  $j('#help_' + name + '_wrapper').slideToggle();
  var image = $('img.help_' + name + '_wrapper');
  _toggleIcon(image, "icon-vcr-down", _getVcrIconClass());
  _frameChanged();
}

function toggleCategories(element) {
  if (!element)
    return;
  _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
  _toggleElement($("additional_categories"));
  _frameChanged();
}

function toggleMoreInfo(name) {
  var helpTextElement = $('question_help_text_' + name);
  if (!helpTextElement)
    return;
  var element = helpTextElement.next();
  if (element) {
    if (element.hasClassName("question_help_active")) {
      element.removeClassName("question_help_active");
      helpTextElement.hide();
    } else {
      element.addClassName("question_help_active");
      helpTextElement.show();
    }
  }
}

function processBreadCrumbOver(elem) {
  if (typeof elem != "undefined" && typeof elem.nextSiblings == "function") {
    elem.up("li").nextSiblings().each(function(elem) {
      var childElem = elem.childElements()[0];
      if (childElem.tagName.toLowerCase() == 'a' || childElem.tagName.toLowerCase() == 'span') {
        childElem.addClassName("caption_link_remove_catalog");
      }
    });
  }
}

function processBreadCrumbOut(elem) {
  if (typeof elem != "undefined" && typeof elem.nextSiblings == "function") {
    elem.up("li").nextSiblings().each(function(elem) {
      var childElem = elem.childElements()[0];
      if (childElem.tagName.toLowerCase() == 'a' || childElem.tagName.toLowerCase() == 'span') {
        childElem.removeClassName("caption_link_remove_catalog");
      }
    });
  }
}

function processChevronOver(elem) {
  elem.nextSiblings().each(function(elem) {
    if (elem.tagName.toLowerCase() == 'a') {
      elem.addClassName("caption_link_remove_catalog");
    }
  });
}

function processChevronOut(elem) {
  elem.nextSiblings().each(function(elem) {
    if (elem.tagName.toLowerCase() == 'a') {
      elem.removeClassName("caption_link_remove_catalog");
    }
  });
}

function setReferenceLink(questionName) {
  var variable = $(questionName);
  if (!variable)
    return;
  var linkElement = $(questionName + "LINK");
  if (!linkElement)
    return;
  linkElement.style.display = (variable.value == "") ? "none" : "";
}

function catalogTextSearch(e) {
  if (e != null && e.keyCode != 13)
    return;
  var f = document.forms['search_form'];
  if (!f['onsubmit'] || f.onsubmit())
    f.submit();
}

function superLink(inputname) {
  var superinput = gel(inputname);
  var sys_id = superinput.value;
  var url = "sys_user.do?sys_id=" + sys_id;
  var frame = top.gsft_main;
  if (!frame)
    frame = top;
  frame.location = url;
}

function saveCartAttachment(sys_id) {
  saveAttachment("sc_cart", sys_id)
}
var checkoutSubmitted = false;

function checkout(control, form) {
  if (checkoutSubmitted)
    return;
  gsftSubmit(control, form, 'sysverb_insert');
  checkoutSubmitted = g_submitted;
}
var guideSubmitted = false;

function guideNext(item) {
  if (guideSubmitted)
    return;
  guideSubmitted = true;
  var m = g_form.catalogOnSubmit();
  if (!m) {
    guideSubmitted = false;
    return;
  }
  var action = "init_guide";
  var guide = gel('sysparm_guide').value;
  if (guide != item)
    action = 'next_guide';
  guideSubmit(action, item);
}

function disableGuideButtons(disable) {
  if (gel('prev_page'))
    gel('prev_page').disabled = disable;
  if (gel('prev_tab'))
    gel('prev_tab').disabled = disable;
  if (gel('next_tab'))
    gel('next_tab').disabled = disable;
  if (gel('next_page'))
    gel('next_page').disabled = disable;
  if (gel('prev_page_footer'))
    gel('prev_page_footer').disabled = disable;
  if (gel('prev_tab_footer'))
    gel('prev_tab_footer').disabled = disable;
  if (gel('next_tab_footer'))
    gel('next_tab_footer').disabled = disable;
  if (gel('next_page_footer'))
    gel('next_page_footer').disabled = disable;
}

function guideSubmit(action, item) {
  if (action === 'next_guide')
    disableGuideButtons(true);
  var active = gel('sysparm_active').value;
  var edit = gel('sysparm_cart_edit').value;
  var guide = gel('sysparm_guide').value;
  var catalog = gel('sysparm_catalog').value;
  var catalog_view = gel('sysparm_catalog_view').value;
  var hint = gel('sysparm_processing_hint').value;
  var parent_id = gel('sysparm_parent_sys_id') ? gel('sysparm_parent_sys_id').value : '';
  var parent_table_name = gel('sysparm_parent_table') ? gel('sysparm_parent_table').value : '';
  var view_name = gel('sysparm_view') ? gel('sysparm_view').value : '';
  hint = equalsHtmlToHex(hint);
  var quantity = 1;
  if (gel('quantity'))
    quantity = gel('quantity').value;
  var form = addForm();
  form.action = "service_catalog.do";
  form.name = "service_catalog.do";
  form.id = "service_catalog.do";
  form.method = "POST";
  addInput(form, "HIDDEN", "sysparm_action", action);
  addInput(form, "HIDDEN", "sysparm_id", item);
  addInput(form, "HIDDEN", "sysparm_guide", guide);
  addInput(form, "HIDDEN", "sysparm_active", active);
  addInput(form, "HIDDEN", "sysparm_cart_edit", edit);
  addInput(form, "HIDDEN", "sysparm_quantity", quantity);
  addInput(form, "HIDDEN", "sysparm_processing_hint", hint);
  addInput(form, "HIDDEN", "sysparm_catalog", catalog);
  addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
  addInput(form, "HIDDEN", "sysparm_parent_sys_id", parent_id);
  addInput(form, "HIDDEN", "sysparm_parent_table", parent_table_name);
  addInput(form, "HIDDEN", "sysparm_view", view_name);
  addSequence(form);
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addInputToForm(form);
  if (g_form) {
    g_form.submitted = true;
    g_form.modified = false;
  }
  form.submit();
  if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
    GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'Order Guide', 'Submit Guide');
  }
}

function equalsHtmlToHex(value) {
  if (!value)
    return;
  value = value.replace('&#61;', '%3d');
  value = value.replace('=', '%3d');
  return value;
}

function addSequence(form) {
  var s = gel('variable_sequence');
  var seq = '';
  if (s)
    seq = s.value;
  addInput(form, "HIDDEN", "variable_sequence1", seq);
}

function guidePrevious(item) {
  var action = "previous_guide";
  guideSubmit(action, item);
}

function contextCatalogHeader(e, sys_id) {
  var name = "context_catalog_header";
  menuTable = "VARIABLE_catalog_header";
  menuField = "not_important";
  rowSysId = sys_id;
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('sysparm_sys_id', sys_id);
    contextMenu.display(e);
  }
  return false;
}

function saveAndNavigate(target) {
  var m = g_form.catalogOnSubmit(true);
  if (!m) {
    return;
  }
  saveAndNavigateNoValidate(target);
}

function saveAndNavigateNoValidate(target, currentTab) {
  var action = "nav_guide";
  var active = gel('sysparm_active').value;
  var edit = gel('sysparm_cart_edit').value;
  var guide = gel('sysparm_guide').value;
  var item = gel('current_item').value;
  var quan = gel('quantity');
  var catalog = gel('sysparm_catalog').value;
  var catalog_view = gel('sysparm_catalog_view').value;
  var hint = equalsHtmlToHex(gel('sysparm_processing_hint').value);
  var parent_id = gel('sysparm_parent_sys_id') ? gel('sysparm_parent_sys_id').value : '';
  var parent_table_name = gel('sysparm_parent_table') ? gel('sysparm_parent_table').value : '';
  var view_name = gel('sysparm_view') ? gel('sysparm_view').value : '';
  var form = addForm();
  form.action = "service_catalog.do";
  form.name = "service_catalog.do";
  form.id = "service_catalog.do";
  form.method = "POST";
  var m = g_form.getMissingFields();
  if (m && m.length > 0) {
    var tabs = g_form.getCompleteTabs().split(",");
    if (tabs && tabs.length > 0)
      g_form.addIncompleteTab(currentTab);
  }
  addInput(form, "HIDDEN", "sysparm_complete_tabs", g_form.getCompleteTabs());
  addInput(form, "HIDDEN", "sysparm_incomplete_tabs", g_form.getIncompleteTabs());
  addInput(form, "HIDDEN", "sysparm_action", action);
  addInput(form, "HIDDEN", "sysparm_target", target);
  addInput(form, "HIDDEN", "sysparm_id", item);
  addInput(form, "HIDDEN", "sysparm_guide", guide);
  addInput(form, "HIDDEN", "sysparm_active", active);
  addInput(form, "HIDDEN", "sysparm_cart_edit", edit);
  addInput(form, "HIDDEN", "sysparm_processing_hint", hint);
  addInput(form, "HIDDEN", "sysparm_catalog", catalog);
  addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
  addInput(form, "HIDDEN", "sysparm_parent_sys_id", parent_id);
  addInput(form, "HIDDEN", "sysparm_parent_table", parent_table_name);
  addInput(form, "HIDDEN", "sysparm_view", view_name);
  if (quan)
    addInput(form, "HIDDEN", "sysparm_quantity", quan.value);
  addSequence(form);
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addInputToForm(form);
  if (g_form) {
    g_form.submitted = true;
    g_form.modified = false;
  }
  form.submit();
}

function saveCatAttachment(item_sys_id, tableName) {
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addAttachment(item_sys_id, tableName, true);
}

function variableOnChange(variableName) {
  var form = g_form;
  if (window.g_sc_form)
    form = g_sc_form;
  if (form.hideFieldMsg)
    form.hideFieldMsg(variableName, true);
  doCatOnChange(variableName);
  var original = gel('sys_original.' + variableName);
  if (original)
    form.fieldChanged(variableName, original.value != form.getValue(variableName));
  else
    form.fieldChanged(variableName, true);
  if (form.notifyCatLabelChange) {
    form.notifyCatLabelChange(variableName);
    if (form.hasPricingImplications(variableName)) {
      if (orderItemWidget && orderItemWidget.g_cart)
        orderItemWidget.calcPrice();
      else
        calcPrice();
    }
  }
  if (form.getTableName() == "sc_item_variable_assignment")
    form.setValue("value", form.getValue(variableName));
}

function doCatOnChange(variableName) {
  var prettyName = resolvePrettyNameMap(variableName);
  for (var x = 0; x < g_event_handlers.length; x++) {
    var handler = g_event_handlers[x];
    var vName = handler.fieldName;
    if (vName == variableName || vName == prettyName) {
      var original = gel('sys_original.' + variableName);
      var oValue = 'unknown';
      if (original)
        oValue = original.value;
      var nValue = g_form.getValue(variableName);
      var eChanged = g_form.getControl(variableName);
      var realFunction = handler.handler;
      CustomEvent.fire('glide_optics_inspect_put_cs_context', handler.handlerName, 'change');
      realFunction.call(this, eChanged, oValue, nValue, false);
      CustomEvent.fire('glide_optics_inspect_pop_cs_context', handler.handlerName, 'change');
    }
  }
}

function resolvePrettyNameMap(variableName) {
  var prettyName = variableName;
  for (var i = 0; i < g_form.nameMap.length; i++) {
    var entry = g_form.nameMap[i];
    if (variableName == entry.realName) {
      prettyName = "variables." + entry.prettyName;
      break;
    }
    if (variableName == "ni.VE" + entry.realName || variableName == "ni.QS" + entry.realName.substring(3)) {
      prettyName = "variables." + entry.prettyName;
      break;
    }
  }
  return prettyName;
}

function orderStatusBack() {
  var found = false;
  $$('.ui_notification').each(function(elem) {
    if (elem.readAttribute('data-attr-table') && history.length > 3) {
      history.go(-3);
      found = true;
    }
  });
  if (!found)
    history.go(-1);
}

function catalogLightWeightReferenceLink(inputName, tableName, addOnRefClick) {
  if (typeof(addOnRefClick) != "undefined" && addOnRefClick) {
    if (typeof(g_cart) == "undefined")
      g_cart = new SCCartV2();
    g_cart.showReferenceForm(inputName, tableName);
    return;
  }
  if (lightWeightReferenceLink)
    lightWeightReferenceLink(inputName, tableName);
}

function preventSubmitIfFormDirty(event) {
  if (window['g_form']) {
    if (!g_form.submitted && g_form.modified && g_showDirtyFormWarning) {
      event.returnValue = "Prevent submit";
      return "Prevent submit";
    }
  }
}
var catalogHistory = {
  sendRequest: function(postString, callback, url, type, completedCallback) {
    var headers = {
      Accept: 'application/json'
    }
    if (typeof g_ck != 'undefined')
      headers['X-UserToken'] = g_ck;
    jQuery.ajax({
      method: type,
      type: type,
      url: url,
      contentType: 'application/json',
      headers: headers,
      data: postString
    }).done(function(response) {
      if (type == 'DELETE' || (type != 'DELETE' && response && response.result))
        callback(response);
      if (completedCallback)
        completedCallback();
    }).fail(function() {
      if (completedCallback)
        completedCallback();
    });
  },
  setHistory: function(title, url) {
    if (typeof JSON == 'undefined' || !JSON)
      return;
    var postString = JSON.stringify({
      navigator_history: {
        url: url,
        title: title
      }
    });
    this.sendRequest(postString, function(data) {
      CustomEvent.fireTop('magellanNavigator.historyAdded', {
        history: data.result.navigatorHistory
      });
      CustomEvent.fireUp('magellanNavigator.permalink.set', {
        title: title,
        relativePath: url
      });
    }, '/api/now/ui/history', 'POST')
  },
  getPageUrl: function() {
    return window.location.href.substr(window.location.href.indexOf(window.location.pathname));
  },
  requests: [],
  updateFavoriteKeyHandler: function(event, id, title, url) {
    var self = this;
    var e = event || window.event;
    var code = e.which || e.keyCode;
    if (code === 32 || code === 13) {
      e.preventDefault();
      self.updateFavorite(id, title, url);
    }
  },
  updateFavorite: function(id, title, url) {
    if (this.requests.length > 3)
      return;
    this.requests.push({
      id: id,
      title: title,
      url: url
    });
    if (!this.processing)
      this.processRequests();
  },
  processRequests: function() {
    var self = this;
    if (this.requests.length == 0) {
      this.processing = false;
      return;
    }
    this.processing = true;
    var request = this.requests[0];
    var id = request.id;
    var title = request.title;
    var favoriteURL = request.url;
    var elem = $(id);
    var dataID = elem.getAttribute("data-id");
    var completedCallback = function() {
      setTimeout(function() {
        self.requests.splice(0, 1);
        self.processRequests();
      }, 100);
    }
    var addCallback = function(data) {
      CustomEvent.fireAll('magellanNavigator:favoriteSaved', data.result.favorite);
      elem.setAttribute("data-id", data.result.favorite.id);
      elem.removeClassName('icon-star-empty');
      elem.addClassName('icon-star');
      elem.setAttribute('aria-pressed', true);
    }
    var removeCallback = function() {
      CustomEvent.fireAll('magellanNavigator:favoriteRemoved', dataID);
      elem.removeClassName('icon-star');
      elem.addClassName('icon-star-empty');
      elem.setAttribute('aria-pressed', false);
    }
    if (typeof JSON == 'undefined' || !JSON)
      return;
    if (elem.hasClassName('icon-star-empty')) {
      var url = '/api/now/ui/favorite';
      var postString = JSON.stringify({
        url: favoriteURL,
        title: title
      });
      self.sendRequest(postString, addCallback, url, 'POST', completedCallback);
    } else {
      var url = '/api/now/ui/favorite?id=' + dataID;
      var postString = JSON.stringify({
        id: dataID,
        group: false
      });
      self.sendRequest(postString, removeCallback, url, 'DELETE', completedCallback);
    }
  }
};
/*! RESOURCE: /scripts/classes/ServiceCatalogForm.js */
function getSCFormElement(tableName, fieldName, type, mandatory, reference, attributes, scope) {
  if (typeof g_sc_form != 'undefined') {
    var elem = g_sc_form.getGlideUIElement(fieldName);
    if (typeof elem != 'undefined')
      return elem;
  }
  return new GlideUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope);
}
var ServiceCatalogForm = Class.create(GlideForm, {
  initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
    this.classname = "ServiceCatalogForm";
    GlideForm.prototype.initialize.call(this, tableName, mandatory, checkMandatory, checkNumeric, checkInteger);
    this.onCatalogSubmit = new Array();
    this.rollbackContextId = "";
    this.actions = [];
    this.actionStack = [];
    this.allowSetDisplay = true;
  },
  _pushAction: function(action) {
    if (!action)
      return;
    var logActions = $('log_variable_actions');
    if (logActions && logActions.value === 'false')
      return;
    action.visible = true;
    action.endTime = new Date();
    if (g_form.actionStack.length > 0) {
      action.step = (g_form.actionStack[g_form.actionStack.length - 1].actions.length);
      g_form.actionStack[g_form.actionStack.length - 1].actions
        .push(action)
    } else {
      if (action.type == 'context') {
        action.step = (g_form.actions.length);
        g_form.actions.push(action);
      } else {
        var context = {
          actions: []
        };
        context.actions.push(action);
        g_form.actions.push(context);
      }
    }
  },
  addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
    var realName = this.resolveNameMap(fieldName);
    var control = this.getControl(this.removeCurrentPrefix(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    var opts = control.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == choiceValue) {
        control.remove(i);
        break;
      }
    var len = control.options.length;
    if (choiceIndex == undefined || choiceIndex < 0 || choiceIndex > len)
      choiceIndex = len;
    var newOption;
    if (typeof choiceValue == 'undefined')
      newOption = new Option(choiceLabel);
    else
      newOption = new Option(choiceLabel, choiceValue);
    var value = choiceValue;
    if (len > 0) {
      value = this.getValue(fieldName);
      control.options[len] = new Option('', '');
      for (var i = len; i > choiceIndex; i--) {
        control.options[i].text = control.options[i - 1].text;
        control.options[i].value = control.options[i - 1].value;
      }
    }
    control.options[choiceIndex] = newOption;
    var original = gel('sys_original.' + control.id);
    if (original) {
      if (original.value == choiceValue)
        this.setValue(fieldName, original.value);
    } else
      this.setValue(fieldName, value);
  },
  getActualName: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    return this.removeCurrentPrefix(realName);
  },
  clearOptions: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var control = this.getControl(this.removeCurrentPrefix(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    control.innerHTML = '';
  },
  fieldChanged: function(variableName, changeFlag) {
    if (!this._internalChange) {
      if (g_form && g_form !== this)
        g_form.fieldChanged(variableName, changeFlag);
      this.modified = changeFlag;
    }
  },
  getMissingFields: function(answer) {
    var self = this;
    answer = answer || [];
    var glideUIElements = this.elements;
    var visitedFields = new Array();
    for (var i = 0; i < glideUIElements.length; i++) {
      var fieldName = glideUIElements[i].fieldName;
      var glideUIElement = glideUIElements[i];
      if (fieldName && answer.indexOf(fieldName) == -1 && glideUIElement.mandatory) {
        if (visitedFields.indexOf('ni.' + fieldName) != -1)
          continue;
        if (this._isCheckbox(fieldName)) {
          if (this._isCheckboxGroupMandatory(fieldName, visitedFields))
            answer.push(fieldName);
        } else if (self.getControl(fieldName) && !$(fieldName).hasAttribute("container_id") && self._isMandatoryFieldEmpty(glideUIElement))
          answer.push(fieldName);
      }
    }
    return answer;
  },
  _setCatalogCheckBoxDisplay: function(id, d) {
    var nidot = gel('ni.' + id);
    if (!nidot)
      return false;
    var iotable = nidot.parentNode;
    while (!hasClassName(iotable, "io_table"))
      iotable = iotable.parentNode;
    if (hasClassName(iotable, "io_table")) {
      if (d != "none") {
        iotable.style.display = d;
        nidot.parentNode.style.display = d;
        var checkboxContainer;
        if (this._isDoctypeMode()) {
          checkboxContainer = nidot.parentNode;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer) {
            checkboxContainer.style.display = d;
            if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
              var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
              this._setParentContainerDisplay(parentContainerId, true);
            }
          }
        } else {
          checkboxContainer = iotable;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer) {
            checkboxContainer.style.display = d;
            if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
              var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
              this._setParentContainerDisplay(parentContainerId, true);
            }
          }
        }
        this._setCatalogSpacerDisplay(iotable, d);
      } else {
        var hideParent = true;
        var inputs = iotable.getElementsByTagName('input');
        for (var h = 0; h < inputs.length; h++) {
          if (inputs[h].id.indexOf('ni.') == 0 &&
            inputs[h].type != 'hidden' &&
            inputs[h].parentNode.style.display != "none" &&
            inputs[h].id != nidot.id) {
            hideParent = false;
          }
        }
        if (hideParent) {
          var checkboxContainer;
          if (this._isDoctypeMode()) {
            checkboxContainer = nidot.parentNode;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer) {
              checkboxContainer.style.display = d;
              if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
                var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
                this._setParentContainerDisplay(parentContainerId, true);
              }
            }
          } else {
            checkboxContainer = iotable;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer) {
              checkboxContainer.style.display = d;
              if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
                var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
                this._setParentContainerDisplay(parentContainerId, true);
              }
            } else
              iotable.style.display = d;
          }
        }
        nidot.parentNode.style.display = d;
      }
    }
    this.notifyCatLabelChange(id);
    return true;
  },
  _setCatalogSpacerDisplay: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.display = d;
  },
  _setCalalogCheckBoxLabelDisplay: function(id, d) {
    var label = gel('element.' + id);
    if (label)
      return false;
    label = gel('label_' + id);
    if (label && label.getAttribute("name") === "checkbox_container_label") {
      var container = label.parentNode;
      if (container && container.parentNode && container.parentNode.className.indexOf('is-required') != -1)
        return true;
      while (container && container.getAttribute("name") !== "checkbox_container")
        container = container.parentNode;
      if (container) {
        container.style.display = d;
        if (container.hasAttribute("parent_container_id") && container.getAttribute("parent_container_id")) {
          var parentContainerId = container.getAttribute("parent_container_id");
          this._setParentContainerDisplay(parentContainerId, true);
        }
        return true;
      }
    }
    return false;
  },
  setCatalogDisplay: function(id, d) {
    var id = this.resolveNameMap(id);
    if (this._setCatalogCheckBoxDisplay(id, d))
      return;
    if (this._setCalalogCheckBoxLabelDisplay(id, d))
      return;
    var label = gel('element.' + id);
    if (!label)
      label = gel(id + '_read_only');
    if (label) {
      label.style.display = d;
      if (label.hasAttribute("parent_container_id") && label.getAttribute("parent_container_id")) {
        var parentContainerId = label.getAttribute("parent_container_id");
        CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + parentContainerId));
        this._setParentContainerDisplay(parentContainerId, true);
        CustomEvent.fire('glide_optics_inspect_pop_context');
      }
    }
  },
  _setCatalogSpacerVisibility: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.visibility = d;
  },
  _setCatalogCheckBoxVisibility: function(id, d) {
    var nidot = gel('ni.' + id);
    if (!nidot)
      return false;
    var iotable = nidot.parentNode;
    while (!hasClassName(iotable, "io_table"))
      iotable = iotable.parentNode;
    if (hasClassName(iotable, "io_table")) {
      if (d != "hidden") {
        iotable.style.visibility = d;
        nidot.parentNode.style.visibility = d;
        if (this._isDoctypeMode()) {
          var checkboxContainer = nidot.parentNode;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer)
            checkboxContainer.style.visibility = d;
        }
        this._setCatalogSpacerVisibility(iotable, d);
      } else {
        var hideParent = true;
        var inputs = iotable.getElementsByTagName('input');
        for (var h = 0; h < inputs.length; h++) {
          if (inputs[h].id.indexOf('ni.') == 0 &&
            inputs[h].type != 'hidden' &&
            inputs[h].parentNode.style.visibility != "hidden" &&
            inputs[h].id != nidot.id) {
            hideParent = false;
          }
        }
        if (hideParent)
          if (this._isDoctypeMode()) {
            var checkboxContainer = nidot.parentNode;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer)
              checkboxContainer.style.visibility = d;
          }
        else
          iotable.style.visibility = d;
        nidot.parentNode.style.visibility = d;
      }
    }
    this.notifyCatLabelChange(id);
    return true;
  },
  _setCalalogCheckBoxLabelVisibility: function(id, d) {
    var label = gel('element.' + id);
    if (label)
      return false;
    label = gel('label_' + id);
    if (label && label.getAttribute("name") === "checkbox_container_label") {
      var container = label.parentNode;
      if (container && container.parentNode && container.parentNode.className.indexOf('is-required') != -1)
        return true;
      while (container && container.getAttribute("name") !== "checkbox_container")
        container = container.parentNode;
      if (container) {
        container.style.visibility = d;
        return true;
      }
    }
    return false;
  },
  setCatalogVisibility: function(id, d) {
    var id = this.resolveNameMap(id);
    if (this._setCatalogCheckBoxVisibility(id, d))
      return;
    if (this._setCalalogCheckBoxLabelVisibility(id, d))
      return;
    var label = gel('element.' + id);
    if (label)
      label.style.visibility = d;
    var help = gel('help_' + id + '_wrapper');
    if (help)
      help.style.visibility = d;
    var spacer = gel('spacer_' + id);
    if (spacer) {
      spacer.style.visibility = d;
    }
    if (this.getGlideUIElement(id) && this.getGlideUIElement(id).type == "glide_list") {
      var unlock = gel(id + '_unlock');
      if (unlock.style.visibility)
        unlock.style.visibility = d;
      var lock = gel(id + '_lock');
      if (lock.style.visibility)
        lock.style.visibility = d;
    }
  },
  removeCurrentPrefix: function(id) {
    return this.removeVariablesPrefix(GlideForm.prototype.removeCurrentPrefix.call(this, id));
  },
  removeVariablesPrefix: function(id) {
    var VARIABLES_PREFIX = "variables.";
    if (id.startsWith(VARIABLES_PREFIX))
      id = id.substring(VARIABLES_PREFIX.length);
    return id;
  },
  _cleanupName: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    fieldName = fieldName.split(':');
    if (fieldName.length != 2)
      return fieldName[0];
    fieldName = fieldName[1];
    return fieldName;
  },
  _setParentContainerDisplay: function(parentContainerId, cascade) {
    if (!parentContainerId)
      return;
    var containerVarEle;
    if (isDoctype()) {
      containerVarEle = $j('tr[parent_container_id="' + parentContainerId + '"]');
      if (!containerVarEle)
        containerVarEle = $j('div[parent_container_id="' + parentContainerId + '"]');
    } else
      containerVarEle = document.querySelectorAll('[parent_container_id="' + parentContainerId + '"]');
    if (!containerVarEle)
      return;
    var hideContainer = true;
    for (var i = containerVarEle.length - 1; i >= 0; i--) {
      var trEle = containerVarEle[i];
      if (trEle.style.display != "none") {
        hideContainer = false;
        break;
      }
    }
    if (typeof cascade == 'undefined')
      cascade = true;
    if (hideContainer)
      this.setContainerDisplay(parentContainerId, false, cascade);
    else
      this.setContainerDisplay(parentContainerId, true, cascade);
  },
  setContainerDisplay: function(fieldName, display, cascade) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var container = this.getContainer(fieldName);
    if (!container) {
      var containerVariable = gel(fieldName);
      if (!containerVariable)
        return false;
      fieldName = containerVariable.getAttribute('container_id');
      if (!fieldName)
        return false;
      container = this.getContainer(fieldName);
      if (!container)
        return false;
    }
    var d = (display == 'true' || display == true) ? '' : 'none';
    var showLog = true;
    if (container.style.display == 'none') {
      if (d == 'none') {
        if (cascade)
          showLog = false;
        if (!cascade && container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      } else {
        if (cascade && !container.hasAttribute("cascaded_display"))
          return;
        container.style.display = d;
        if (container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      }
    } else {
      if (d == 'none') {
        container.style.display = d;
        if (cascade)
          container.setAttribute('cascaded_display', 'true');
        else if (container.hasAttribute('cascaded_display'))
          container.removeAttribute('cascaded_display');
      } else {
        if (cascade)
          showLog = false;
      }
    }
    if (container.hasAttribute("parent_container_id") && container.getAttribute("parent_container_id")) {
      var parentContainerId = container.getAttribute("parent_container_id");
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + parentContainerId));
      this._setParentContainerDisplay(parentContainerId, cascade);
      CustomEvent.fire('glide_optics_inspect_pop_context');
    }
    _frameChanged();
    if (showLog)
      opticsLog(this.getTableName(), fieldName, " Display set to " + display);
    return true;
  },
  getContainer: function(f) {
    return gel('element.container_' + f) || gel('container_' + f);
  },
  setContainerVisibility: function(fieldName, visibility) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var container = this.getContainer(fieldName);
    if (!container) {
      var containerVariable = gel(fieldName);
      if (!containerVariable)
        return false;
      fieldName = containerVariable.getAttribute('container_id');
      if (!fieldName)
        return false;
      container = this.getContainer(fieldName);
      if (!container)
        return false;
    }
    var v = (visibility == 'true' || visibility == true) ? 'visible' : 'hidden';
    container.style.visibility = v;
    return true;
  },
  hideSection: function(fieldName) {
    this.hideReveal(fieldName, false);
  },
  revealSection: function(fieldName) {
    this.hideReveal(fieldName, true);
  },
  hideReveal: function(fieldName, expand) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var row = gel('row_' + fieldName);
    if (!row)
      return false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(fieldName);
  },
  setDisplay: function(id, display) {
    if (!this.allowSetDisplay) {
      jslog("setVisible is not supported on Multi-row set variables");
      return;
    }
    var displayValue = 'none';
    var parentClass = '';
    if (display == 'true' || display == true) {
      display = true;
      displayValue = '';
      parentClass = 'label';
    }
    var fieldValue = this.getValue(id);
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    if ((display != true) && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(fieldName)) {
      opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field display to " + display);
      return;
    }
    if (this.setContainerDisplay(id, display))
      return;
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's display to " + display);
      return;
    }
    this.setCatalogDisplay(id, displayValue);
    _frameChanged();
    opticsLog(this.getTableName(), fieldName, "Display set to " + display);
    return;
  },
  setVisible: function(id, visibility) {
    if (!this.allowSetDisplay) {
      jslog("setVisible is not supported on Multi-row set variables");
      return;
    }
    var v = (visibility == 'true' || visibility == true) ? 'visible' : 'hidden';
    var fieldValue = this.getValue(id);
    var ge = this.getGlideUIElement(id);
    if ((v != 'visible') && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
      opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field visibility to " + v);
      return;
    }
    if (this.setContainerVisibility(id, visibility))
      return;
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's visibility to " + v);
      return;
    }
    this.setCatalogVisibility(id, v);
    opticsLog(this.getTableName(), fieldName, "Visibility set to " + v);
    return;
  },
  _canSetDisplayFalseIfMandatory: function(id) {
    var fieldValue = this.getValue(id);
    var ge = this.getGlideUIElement(id);
    if (!ge)
      return true;
    else if (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page')
      return true;
    else if (this._isCheckbox(ge.fieldName))
      return this._isChecked(ge.fieldName);
    else if (ge.type == "container") {
      var control = this.getControl(id);
      var queryParameter = "";
      if (control && control.hasAttribute("container_id"))
        queryParameter = control.getAttribute("container_id");
      else
        return true;
      var parentElement = gel("element.container_" + queryParameter);
      if (parentElement) {
        var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + queryParameter + "' ]") : [];
        for (var i = 0; i < _vsChildren.length; i++) {
          var child_id = _vsChildren[i].id;
          if (child_id.startsWith("element.checkbox_container_")) {
            var checkboxEle = _vsChildren[i].querySelector("input[type=checkbox]");
            var checkboxId = checkboxEle.id.substr(3);
            if (this._calculateCheckboxMandatory(checkboxId) && !this._isChecked(checkboxId))
              return false;
            continue;
          } else if (child_id.startsWith("element.container_")) {
            child_id = child_id.substr("element.container_".length);
            var actualContainerControl = _vsChildren[i].querySelector('input[container_id="' + child_id + '"]');
            if (actualContainerControl)
              child_id = actualContainerControl.id;
            else
              continue;
          } else if (child_id.startsWith("element."))
            child_id = child_id.substr("element.".length);
          else
            continue;
          if (this.isMandatory(child_id) && !this._canSetDisplayFalseIfMandatory(child_id))
            return false;
        }
        return true;
      } else
        return true;
    } else
      return !fieldValue.blank();
  },
  isMandatory: function(fieldName) {
    var ge = this.getGlideUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page')
      return false;
    else if (ge.type == "container") {
      var control = this.getControl(fieldName);
      var queryParameter = "";
      if (control && control.hasAttribute("container_id"))
        queryParameter = control.getAttribute("container_id");
      else
        return false;
      var parentElement = gel("element.container_" + queryParameter);
      if (parentElement) {
        var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + queryParameter + "' ]") : [];
        for (var i = 0; i < _vsChildren.length; i++) {
          var child_id = _vsChildren[i].id;
          if (child_id.startsWith("element.checkbox_container_")) {
            var checkboxEle = _vsChildren[i].querySelector("input[type=checkbox]");
            var checkboxId = checkboxEle.id.substr(3);
            if (this._calculateCheckboxMandatory(checkboxId))
              return true;
            continue;
          } else if (child_id.startsWith("element.container_")) {
            child_id = child_id.substr("element.container_".length);
            var actualContainerControl = _vsChildren[i].querySelector('input[container_id="' + child_id + '"]');
            if (actualContainerControl)
              child_id = actualContainerControl.id;
            else
              continue;
          } else if (child_id.startsWith("element."))
            child_id = child_id.substr("element.".length);
          else
            continue;
          if (this.isMandatory(child_id))
            return true;
        }
      } else
        return false;
    }
    return ge.isMandatory();
  },
  setRequiredChecked: function(fieldName, required) {
    if (!this._isCheckbox(fieldName)) {
      jslog("Given variable is not of checkbox type");
      return;
    }
    this.setMandatory(fieldName, required);
  },
  setMandatory: function(fieldName, mandatory) {
    var ge = this.getGlideUIElement(fieldName);
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'checkbox_container' || ge.type == 'label' || ge.type == "sc_multi_row")) {
      opticsLog(this.getTableName(), fieldName, "Mandatory can't be set on " + ge.type + " variable");
      return;
    }
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    mandatory = (mandatory == 'true' || mandatory == true) ? true : false;
    var foundIt = this._setMandatory(this.elements, fieldName, mandatory);
    if (foundIt == false && g_form != null && window.g_sc_form && g_form != g_sc_form) {
      foundIt = this._setMandatory(g_form.elements, fieldName, mandatory);
    }
    opticsLog(this.getTableName(), fieldName, "Mandatory set to " + mandatory);
  },
  debounceMandatoryChanged: function() {
    var that = this;
    if (this.debounceMandatoryChangedTimeout) {
      clearTimeout(this.debounceMandatoryChangedTimeout);
    }
    this.debounceMandatoryChangedTimeout = setTimeout(function() {
      that.debounceMandatoryChangedTimeout = null;
      CustomEvent.fire("mandatory.changed");
    }, 300);
  },
  _setMandatory: function(elements, fieldName, mandatory) {
    var foundIt = false;
    var ge = this.getGlideUIElement(fieldName);
    for (var x = 0; x < elements.length; x++) {
      var thisElement = elements[x];
      var thisField = thisElement.fieldName;
      if (thisField == fieldName) {
        foundIt = true;
        thisElement.mandatory = mandatory;
        var thisElementDOM = this.getControl(fieldName);
        if (thisElementDOM && thisElementDOM.hasAttribute("container_id")) {
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Mandatory ' + mandatory + " on container " + g_form.resolveLabelNameMap(thisElementDOM.id));
          this._executeVariableSetChildren(thisElementDOM.id, "mandatory", mandatory);
          CustomEvent.fire('glide_optics_inspect_pop_context');
          return foundIt;
        }
        var curField = $('status.' + fieldName);
        if (curField)
          curField.setAttribute("mandatory", mandatory);
        var className = '';
        var classTitle = '';
        var realName = this.resolveNameMap(fieldName);
        var original = gel('sys_original.' + realName);
        var oValue = 'unknown';
        if (original)
          oValue = original.value;
        var nValue = this.getValue(fieldName);
        var isCheckboxVar = this._isCheckbox(fieldName);
        if (mandatory && (this._isFieldValueBlank(fieldName, nValue) || (isCheckboxVar && nValue == 'false'))) {
          this._setReadonly(fieldName, false, false, '');
          this.setDisplay(fieldName, true);
          var fieldTR = this._getFieldTR(fieldName);
          if (fieldTR && fieldTR.hasAttribute("parent_container_id") && fieldTR.getAttribute("parent_container_id")) {
            CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + fieldTR.getAttribute("parent_container_id")));
            this._setParentContainerDisplay(fieldTR.getAttribute("parent_container_id"), false);
            CustomEvent.fire('glide_optics_inspect_pop_context');
          }
        }
        if (isCheckboxVar) {
          mandatory = this._calculateCheckboxMandatory(fieldName);
        }
        var control = ge.getElement();
        if (control && control.getAttribute) {
          var dataType = control.getAttribute('data-type');
          if (dataType == 'sc_multi_row' && control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setMandatory == "function"))
            g_form.elementHandlers[control.id].setMandatory(mandatory);
        }
        if (mandatory && oValue != nValue) {
          className = "changed required-marker";
          classTitle = getMessage("Field value has changed")
        } else if (mandatory && !this._isFieldValueBlank(fieldName, nValue)) {
          className = "mandatory_populated required-marker";
          classTitle = isCheckboxVar ? getMessage('Required - preloaded with saved data') : getMessage('Mandatory - preloaded with saved data');
        } else if (mandatory) {
          className = 'mandatory required-marker';
          classTitle = isCheckboxVar ? getMessage('Required - must be checked before Submit') : getMessage('Mandatory - must be populated before Submit');
        }
        thisElementDOM.setAttribute("aria-required", mandatory);
        this.changeCatLabel(fieldName, className + ' label_description', classTitle);
        this.debounceMandatoryChanged();
        setMandatoryExplained();
      }
    }
    return foundIt;
  },
  _calculateCheckboxMandatory: function(fieldName) {
    var elements = this.elements;
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      for (var i = 0; i < checkboxes.length; i++)
        for (var j = 0; j < elements.length; j++)
          if (checkboxes[i].parentNode.style.display != 'none' && (('ni.' + elements[j].fieldName) == checkboxes[i].id) && elements[j].mandatory == true)
            return true;
    }
    return false;
  },
  _listCollectorMandatoryChild: function(fieldName, newFieldClassName) {
    var _mandateMarker = $('status.' + fieldName).parentElement;
    if (_mandateMarker) {
      _mandateMarker.removeClassName('is-prefilled');
      _mandateMarker.removeClassName('is-required');
      _mandateMarker.removeClassName('is-filled');
      _mandateMarker.addClassName(newFieldClassName);
    }
    var _formGroupElement = _mandateMarker.up('div.form-group');
    _formGroupElement.removeClassName('is-required');
    var _parentElement = document.getElementById('variable_' + fieldName);
    var _childForMandatory = _parentElement.querySelectorAll('.slushbucket-top');
    if (_childForMandatory && _childForMandatory.constructor.name === "NodeList" && _childForMandatory.length > 0) {
      _childForMandatory = _childForMandatory[1];
      return _childForMandatory;
    }
    return null;
  },
  _executeVariableSetChildren: function(containerId, operation, operationValue) {
    if (!(containerId && operation)) {
      return;
    }
    var queryParameter;
    if (containerId.indexOf("IO") != -1) {
      queryParameter = containerId.split(":")[1];
    } else if (containerId.indexOf("ni") != -1) {
      queryParameter = gel(containerId).getAttribute("container_id");
    }
    var parentElement = gel("element.container_" + (queryParameter));
    if (parentElement) {
      var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + (queryParameter) + "' ]") : [];
      for (var i = 0; i < _vsChildren.length; i++) {
        var _arrId = _vsChildren[i].id;
        var _actionElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
        if (_actionElement.indexOf("container_") != -1) {
          if (_actionElement.indexOf("checkbox_container_") != -1) {
            var checkboxes = _vsChildren[i].querySelectorAll("input[type=checkbox]");
            for (var k = 0; k < checkboxes.length; k++) {
              var _arrId = checkboxes[k].id;
              var currentElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
              if (operation == "mandatory") {
                this.setMandatory(currentElement, operationValue);
              } else if (operation == "readonly") {
                this.setReadonly(currentElement, operationValue);
              }
            }
            continue;
          }
          var fieldName = _actionElement.replace("container_", "IO:");
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting ' + operation + " " + operationValue + " on container " + g_form.resolveLabelNameMap(fieldName));
          this._executeVariableSetChildren(fieldName, operation, operationValue);
          CustomEvent.fire('glide_optics_inspect_pop_context');
          if (operation == 'mandatory' && operationValue && !this._canSetDisplayFalseIfMandatory(fieldName))
            this.setDisplay(fieldName, true);
          continue;
        }
        if (operation == "mandatory")
          this.setMandatory(_actionElement, operationValue);
        else if (operation == "readonly")
          this.setReadonly(_actionElement, operationValue);
      }
    } else {
      var parentElement = gel("variable_IO:" + queryParameter);
      if (!parentElement)
        parentElement = gel("element.checkbox_container_" + queryParameter);
      var checkboxes = parentElement ? parentElement.querySelectorAll("input[type=checkbox]") : [];
      for (var k = 0; k < checkboxes.length; k++) {
        var _arrId = checkboxes[k].id;
        var currentElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
        if (operation == "mandatory") {
          this.setMandatory(currentElement, operationValue);
        } else if (operation == "readonly") {
          this.setReadonly(currentElement, operationValue);
        }
      }
    }
  },
  _isChecked: function(fieldName) {
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      for (var i = 0; i < checkboxes.length; i++)
        if (checkboxes[i].parentNode.style.display != 'none' && checkboxes[i].checked == true)
          return true;
    }
    return false;
  },
  _isCheckbox: function(fieldName) {
    var niElem = $("ni." + this.resolveNameMap(this.removeCurrentPrefix(fieldName)));
    if (niElem && niElem.type == 'checkbox')
      return true;
    return false;
  },
  _isListCollector: function(fieldName) {
    var _name = $("variable_" + this.resolveNameMap(this.removeCurrentPrefix(fieldName)));
    if (_name && _name.getAttribute("type") == "list_collector") {
      return true;
    }
    return false;
  },
  _getCheckboxMandatoryElement: function(container, fieldName) {
    var label_field = this.getControl(fieldName);
    if (!label_field)
      return null;
    label_field = label_field.getAttribute("gsftContainer");
    var elem = $('label_' + label_field);
    if (elem)
      elem = $('variable_' + label_field)
    else
      elem = container.up('div.sc_checkbox');
    return elem;
  },
  _isFieldValueBlank: function(fieldName, value) {
    var ele = $(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    if (ele && ele.hasAttribute("container_id"))
      return false;
    else if (ge.type == 'sc_multi_row') {
      if (typeof value == 'undefined' || value.blank())
        return true;
      var value = JSON.parse(value);
      if (value.length > 0)
        return false;
      return true;
    }
    if (this._isCheckbox(fieldName))
      return this._isChecked(fieldName) ? false : true;
    else
      return value.blank();
  },
  changeCatLabel: function(fieldName, className, classTitle) {
    var d = $('status.' + fieldName);
    if (!d && this.getControl(fieldName))
      d = $('status.' + this.getControl(fieldName).getAttribute('gsftContainer'));
    if (d) {
      if (d.className == 'changed') {
        d.setAttribute("oclass", className);
      } else {
        d.setAttribute("oclass", '');
        d.className = className;
      }
      var s = $('section508.' + fieldName);
      if (s && typeof classTitle != 'undefined') {
        s.setAttribute('title', classTitle);
        s.setAttribute('alt', classTitle);
      }
      var t = $('status.button.' + fieldName);
      if (t && typeof classTitle != 'undefined') {
        t.setAttribute('title', classTitle);
        if (className.include('required-marker')) {
          t.setAttribute('style', 'padding-left: 3px;');
        } else {
          t.setAttribute('style', 'padding-left: 3px;display:none;');
        }
      }
      if (typeof classTitle != 'undefined')
        d.setAttribute('data-original-title', classTitle);
      var value = this.getValue(fieldName);
      var fieldClassName = '';
      var mandatory = false;
      if ((className.include("mandatory") || className.include("changed")) && className.include("required-marker") && className.include("label_description")) {
        if (this._isFieldValueBlank(fieldName, value))
          fieldClassName = 'is-required';
        else
          fieldClassName = 'is-filled';
        mandatory = true;
      } else if (className.include("mandatory_populated") && className.include("required-marker") && className.include("label_description")) {
        fieldClassName = 'is-prefilled';
        mandatory = true;
      }
      d.setAttribute('mandatory', mandatory + '');
      var container;
      if (this._isCheckbox(fieldName)) {
        container = this._getCheckboxMandatoryElement(d, fieldName);
      } else if (this._isListCollector(fieldName)) {
        container = this._listCollectorMandatoryChild(fieldName, fieldClassName);
      } else {
        container = d.up('.question_spacer');
        if (!container)
          container = d.up('div.form-group');
      }
      if (!container)
        container = d.up('tr');
      container.removeClassName('is-prefilled');
      container.removeClassName('is-required')
      container.removeClassName('is-filled');
      if (fieldClassName)
        container.addClassName(fieldClassName);
    }
  },
  getCatLabel: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var label = $('status.' + realName);
    if (label)
      return label;
    return label;
  },
  notifyCatLabelChange: function(fieldName) {
    var mandatory = false;
    var nValue = this.getValue(fieldName);
    var fType = this.getControl(fieldName).className;
    var isMultiRowField = false;
    var ge = this.getGlideUIElement(fieldName);
    if (ge.type == "sc_multi_row")
      isMultiRowField = true;
    var realName = this.resolveNameMap(fieldName);
    var original = gel('sys_original.' + realName);
    var oValue = 'unknown';
    if (original)
      oValue = original.value;
    var newClass = 'changed';
    var newFieldClassName = '';
    var oldClass = '';
    var sl = this.getCatLabel(fieldName);
    if (!sl) {
      var control = this.getControl(fieldName);
      if (!control)
        return;
      var container = control.getAttribute("gsftContainer");
      if (container)
        sl = $('status.' + container);
    }
    if (!sl)
      return;
    var isCheckboxVar = this._isCheckbox(fieldName);
    var isListCollectorVar = this._isListCollector(fieldName);
    if (isCheckboxVar)
      mandatory = this._calculateCheckboxMandatory(fieldName);
    else if (sl.getAttribute('mandatory') == 'true')
      mandatory = true;
    oldClass = sl.className;
    if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
      newClass = 'mandatory';
      newFieldClassName = 'is-required';
    } else if (mandatory && (fType.indexOf("cat_item_option") != -1 || fType.indexOf("questionSetWidget") != -1 || isMultiRowField)) {
      if (this._isFieldValueBlank(fieldName, nValue)) {
        newClass = 'mandatory';
        newFieldClassName = 'is-required';
      } else {
        if (nValue != oValue) {
          newClass = 'changed';
          newFieldClassName = 'is-filled';
        } else {
          newClass = 'mandatory_populated';
          newFieldClassName = 'is-prefilled';
        }
      }
    } else if (oValue == nValue)
      newClass = sl.getAttribute("oclass");
    sl.className = newClass + " required-marker label_description";
    if (newFieldClassName || isCheckboxVar || isListCollectorVar) {
      var elementContainer;
      if (isCheckboxVar) {
        elementContainer = this._getCheckboxMandatoryElement(sl, fieldName);
      } else if (isListCollectorVar) {
        elementContainer = this._listCollectorMandatoryChild(fieldName, newFieldClassName);
      } else {
        elementContainer = sl.up("div.form-group");
        if (!elementContainer)
          elementContainer = sl.up('.question_spacer');
      }
      if (!elementContainer)
        elementContainer = sl.up('tr');
      elementContainer.removeClassName('is-prefilled');
      elementContainer.removeClassName('is-required')
      elementContainer.removeClassName('is-filled');
      elementContainer.addClassName(newFieldClassName);
    }
    if (oldClass != newClass)
      sl.setAttribute("oclass", oldClass);
    this.debounceMandatoryChanged();
  },
  getHelpTextControl: function(variableName) {
    var realName = this.resolveNameMap(variableName);
    if (!realName)
      return;
    var ele;
    if (this._isDoctypeMode()) {
      if (realName.indexOf('ni.VE') == 0)
        realName = realName.replace('.', '_');
      if (realName.indexOf('IO:') == 0)
        realName = realName.replace(':', '_');
      ele = gel('question_help_' + realName + '_toggle_value');
    } else {
      ele = gel('help_' + realName + '_wrapper');
    }
    return ele;
  },
  onSubmit: function(skipMandatory) {
    var action = this.getActionName();
    if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete')
      return true;
    var rc = true;
    if (!skipMandatory)
      rc = this.mandatoryCheck();
    rc = rc && this.validate();
    return rc;
  },
  flashTab: function(tabElem, flash) {
    if (flash) {
      var touchScroll = $$("div.touch_scroll");
      if (touchScroll.size() > 0) {} else
        scrollTo(0, 0);
      var interval;
      var count = 0;
      var flip = false;
      interval = setInterval(function() {
        if (count > 4) {
          clearInterval(interval);
        } else {
          if (flip)
            tabElem.addClassName("tab_flash");
          else
            tabElem.removeClassName("tab_flash");
          count++;
          flip = !flip;
        }
      }, 500);
    }
  },
  firstRunComplete: false,
  completeTabs: "",
  incompleteTabs: "",
  removeTab: function(tabs, id) {
    var newTabs = '';
    var parts = tabs.split(",");
    for (var i = 0; i < parts.length; i++)
      if (parts[i] != id) {
        if (newTabs.length > 0)
          newTabs += ',';
        newTabs += parts[i];
      }
    return newTabs;
  },
  addCompleteTab: function(id) {
    if (this.completeTabs.indexOf(id) < 0) {
      if (this.completeTabs.length > 0)
        this.completeTabs += ",";
      this.completeTabs += id;
    }
    this.incompleteTabs = this.removeTab(this.incompleteTabs, id);
  },
  addIncompleteTab: function(id) {
    if (this.incompleteTabs.indexOf(id) < 0) {
      if (this.incompleteTabs.length > 0)
        this.incompleteTabs += ',';
      this.incompleteTabs += id;
    }
    this.completeTabs = this.removeTab(this.completeTabs, id);
  },
  getCompleteTabs: function() {
    return this.completeTabs || '';
  },
  getIncompleteTabs: function() {
    return this.incompleteTabs || '';
  },
  setCompleteTabs: function(val) {
    this.completeTabs = val || '';
  },
  setIncompleteTabs: function(val) {
    this.incompleteTabs = val || '';
  },
  checkTabForms: function(flash) {
    var rc = true;
    if (typeof tab_frames != "undefined") {
      for (var i = 0; i < tab_frames.length; i++) {
        var fr = tab_frames[i];
        var tabElem = $("tab_ref_" + fr);
        var result = false;
        if (this.completeTabs.indexOf(fr) > -1)
          result = true;
        else if (this.incompleteTabs.indexOf(fr) > -1)
          result = false;
        else {
          var frame = $("item_frame_" + fr);
          if (frame) {
            var form = frame.contentWindow.g_form;
            result = form.mandatoryCheck(true, false);
          }
        }
        if (result) {
          this.addCompleteTab(fr);
          tabElem.removeClassName("is-required");
          tabElem.firstDescendant().addClassName("not_mandatory");
          tabElem.firstDescendant().removeClassName("mandatory");
        } else {
          this.addIncompleteTab(fr);
          tabElem.addClassName("is-required");
          tabElem.firstDescendant().addClassName("mandatory");
          tabElem.firstDescendant().removeClassName("not_mandatory");
          rc = false;
          this.flashTab(tabElem, flash);
        }
      }
      if (rc == false && this.firstRunComplete) {
        g_form.addErrorMessage(getMessage('There are tabs containing mandatory fields that are not filled in'));
      }
      this.firstRunComplete = true;
    }
    return rc;
  },
  _isCheckboxGroupMandatory: function(fieldName, visitedFields) {
    var elements = this.elements;
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      var isMandatory = false;
      var isChecked = false;
      var containerLabel = null;
      for (var i = 0; i < checkboxes.length; i++) {
        visitedFields.push(checkboxes[i].id);
        if (checkboxes[i].parentNode.style.display == 'none')
          continue;
        if (checkboxes[i].checked == true)
          isChecked = true;
        if (!isMandatory) {
          for (var j = 0; j < elements.length; j++) {
            if (('ni.' + elements[j].fieldName) == checkboxes[i].id && elements[j].mandatory == true) {
              isMandatory = true;
              containerLabel = elements[j].fieldName;
              break;
            }
          }
        }
      }
      if (containerLabel)
        visitedFields.push('ni.' + $(containerLabel).getAttribute('gsftContainer'));
      return isMandatory && !isChecked;
    }
    return false;
  },
  mandatoryCheck: function(isHiddenForm, checkFrames) {
    if (!this.checkMandatory)
      return true;
    $(document.body).addClassName('form-submitted');
    var fa = this.elements;
    var rc = true;
    var fc = true;
    var ic = true;
    if (checkFrames)
      fc = this.checkTabForms(true);
    var incompleteFields = new Array();
    var invalidFields = new Array();
    var visitedFields = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      if (ed.type == "container")
        continue;
      if (ed.type == "masked") {
        var display = $('sys_display.' + ed.fieldName);
        var displayConfirm = $('sys_display_confirm.' + ed.fieldName);
        if (displayConfirm && display.value != displayConfirm.value) {
          ic = false;
          var widgetLabel = this.getLabelOf(ed.fieldName);
          var shortLabel = trim(widgetLabel + '');
          incompleteFields.push(shortLabel);
          continue;
        }
      }
      if (!ed.mandatory || visitedFields.indexOf('ni.' + ed.fieldName) != -1)
        continue;
      var widget = this.getControl(ed.fieldName);
      if (!widget)
        continue;
      var widgetValue = this.getValue(ed.fieldName);
      if ((this._isCheckbox(ed.fieldName) && this._isCheckboxGroupMandatory(ed.fieldName, visitedFields)) || this._isFieldValueBlank(ed.fieldName, widgetValue)) {
        var rowWidget = gel('sys_row');
        var row = 0;
        if (rowWidget)
          row = parseInt(rowWidget.value);
        if (row != -1) {
          if (this.mandatory == false) {
            widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
            widget = gel(widgetName);
            if (widget) {
              widgetValue = widget.value;
              if (widgetValue == null || widgetValue.blank())
                continue;
            }
          }
        }
        rc = false;
        var tryLabel = false;
        try {
          if (!isHiddenForm)
            widget.focus();
        } catch (e) {
          tryLabel = true;
        }
        if (tryLabel) {
          var displayWidget = this.getDisplayBox(ed.fieldName);
          if (displayWidget) {
            try {
              if (!isHiddenForm)
                displayWidget.focus();
            } catch (exception) {}
          }
        }
        var realName = this.resolveNameMap(ed.fieldName);
        var widgetLabel = this.getLabelOf(ed.fieldName);
        var shortLabel = trim(widgetLabel + '');
        invalidFields.push(shortLabel);
        labels.push('label_' + realName);
      }
    }
    var alertText1 = "";
    var alertText2 = "";
    if (!rc && !isHiddenForm)
      alertText1 = new GwtMessage().getMessage('The following mandatory fields are not filled in: {0}', invalidFields.join(', '));
    if (!ic && !isHiddenForm)
      alertText2 = new GwtMessage().getMessage('The following masked fields do not match: {0}', incompleteFields.join(', '));
    if (alertText1 != "" || alertText2 != "") {
      try {
        g_form.addErrorMessage(alertText1 + " " + alertText2);
      } catch (e) {}
    }
    if (!isHiddenForm) {
      for (var x = 0; x < labels.length; x++) {
        this.flash(labels[x], "#FFFACD", 0);
      }
    }
    return rc && fc && ic;
  },
  getControls: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    return document.getElementsByName(widgetName);
  },
  getControl: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return possibles[0];
    else {
      var widget;
      for (var x = 0; x < possibles.length; x++) {
        if (possibles[x].checked) {
          widget = possibles[x];
          break;
        }
      }
      if (!widget)
        widget = gel('sys_original.' + widgetName);
    }
    return widget;
  },
  getLabelOfCheckbox: function(fieldName) {
    var label_field = this.getControl(fieldName).getAttribute("gsftContainer");
    var elem = $('label_' + label_field);
    if (!elem)
      elem = $('variable_' + label_field)
    return elem;
  },
  getLabelOf: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    if (this._isCheckbox(fieldName)) {
      var label_field = this.getControl(fieldName).getAttribute("gsftContainer");
      var label = gel('label_' + label_field);
      if (label && label.firstChild) {
        if (label.firstChild.innerText)
          return label.firstChild.innerText;
        if (label.firstChild.textContent)
          return label.firstChild.textContent;
        if (label.firstChild.innerHTML)
          return label.firstChild.innerHTML;
      }
    }
    return this.resolveLabelNameMap(fieldName);
  },
  validate: function() {
    var fa = this.elements;
    var rc = true;
    var invalid = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      var widgetName = 'label_' + ed.fieldName;
      var widget = this.getControl(ed.fieldName);
      if (widget) {
        var widgetValue = widget.value;
        var validator = this.validators[ed.type];
        if (validator) {
          var isValid = validator.call(this, widgetValue);
          if (typeof isValid != 'undefined' && isValid != true) {
            if (labels.length == 0)
              widget.focus();
            var widgetLabel = this.getLabelOf(ed.fieldName);
            invalid.push(widgetLabel);
            labels.push(widgetName);
            rc = false;
          }
        }
      }
    }
    var theText = invalid.join(', ');
    theText = new GwtMessage().getMessage('The following fields contain invalid text: {0}', theText);
    if (!rc)
      g_form.addErrorMessage(theText);
    for (var x = 0; x < labels.length; x++) {
      this.flash(labels[x], "#FFFACD", 0);
    }
    return rc;
  },
  setValue: function(fieldName, value, displayValue, noOnChange) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var previousInternalChangeValue = this._internalChange;
    this._internalChange = true;
    var oldValue = this.getValue(fieldName);
    this.secretSetValue(fieldName, value, displayValue);
    var control = this.getControl(fieldName);
    if (control != null) {
      if (!noOnChange)
        triggerEvent(control, 'change');
      var id = control.getAttribute("id");
      if (id != null) {
        var niBox = this.getNiBox(id);
        if (niBox != null && niBox.getAttribute("type") == "checkbox") {
          if (!noOnChange)
            variableOnChange(id);
          this._internalChange = previousInternalChangeValue;
          this._opticsInspectorLog(fieldName, oldValue);
          return;
        }
        if (niBox.className != null && niBox.className.indexOf('htmlField') != -1) {
          this._setValue(fieldName, value, displayValue);
          this._internalChange = previousInternalChangeValue;
          this._opticsInspectorLog(fieldName, oldValue);
          return;
        }
      }
      var realName = this.resolveNameMap(fieldName);
      if (this.isRadioControl(realName)) {
        if (!noOnChange)
          variableOnChange(realName);
      }
      if (control.type == "textarea")
        $(control).fire('autosize.resize');
      this._opticsInspectorLog(fieldName, oldValue);
    }
    this._internalChange = previousInternalChangeValue;
  },
  getNiBox: function(fieldName) {
    var niName = 'ni.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      niName = 'ni.' + id;
    var niBox = gel(niName);
    if (niBox == null)
      niBox = gel('macro_' + id);
    if (niBox == null)
      niBox = gel(id);
    return niBox;
  },
  getDisplayBox: function(fieldName) {
    var dName = 'sys_display.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      dName = 'sys_display.' + id;
    var field = gel(dName);
    if (field)
      return field;
    dName = 'sys_display.' + fieldName;
    return gel(dName);
  },
  secretSetValue: function(fieldName, value, displayValue) {
    if (this.catalogSetValue(fieldName, value, displayValue))
      return;
    fieldName = this.removeCurrentPrefix(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    var control = this.getControl(fieldName);
    if (ge.type == 'masked') {
      this._setValueForMasked(fieldName, value, displayValue);
      return;
    }
    var readOnlyField = gel('sys_readonly.' + control.id);
    if (readOnlyField) {
      readOnlyField.innerHTML = displayValue;
    } else {
      readOnlyField = gel(control.id + "_label");
      if (readOnlyField) {
        readOnlyField.value = displayValue;
      }
    }
    if (control.options) {
      var options = control.options;
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value == value) {
          control.selectedIndex = i;
          break;
        }
      }
    } else if (control.type == 'hidden') {
      var nibox = this.getNiBox(fieldName);
      if (nibox && nibox.type == 'checkbox') {
        control.value = value;
        if (value == 'true')
          nibox.checked = 'true';
        else
          nibox.checked = null;
        return;
      }
      var question_data_type = control.getAttribute('data-type');
      if (question_data_type && (question_data_type == 'duration' || question_data_type == 'glide-list' || question_data_type == "sc_multi_row")) {
        if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setValue == "function"))
          g_form.elementHandlers[control.id].setValue(value, displayValue);
        return;
      }
      if (ge.type == 'list_collector' && value == "") {
        this._listCollectorClearValue(fieldName);
        return;
      }
      var displaybox = this.getDisplayBox(fieldName);
      if (displaybox) {
        if (typeof(displayValue) != 'undefined') {
          control.value = value;
          displaybox.value = displayValue;
          removeClassName(displaybox, 'ref_invalid');
          refFlipImage(displaybox, control.id);
          updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
          return;
        }
        control.value = value;
        if (value == null || value == '') {
          displaybox.value = '';
          removeClassName(displaybox, 'ref_invalid');
          refFlipImage(displaybox, control.id);
          return;
        }
        var ed = this.getGlideUIElement(fieldName);
        if (!ed)
          return;
        if (ed.type != 'reference')
          return;
        var refTable = ed.reference;
        if (!refTable)
          return;
        var ga = new GlideAjax('AjaxClientHelper');
        ga.addParam('sysparm_name', 'getDisplay');
        ga.addParam('sysparm_table', refTable);
        ga.addParam('sysparm_value', value);
        ga.getXMLWait();
        var displayValue = ga.getAnswer();
        displaybox.value = displayValue;
        refFlipImage(displaybox, control.id);
        updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
      }
    } else {
      control.value = value;
    }
  },
  _setValueForMasked: function(fieldName, value, displayValue) {
    var control = this.getControl(fieldName);
    var s = control.id;
    var isReadOnly = false;
    if (gel(s + '_read_only')) {
      return;
    }
    var displayBox = this.getDisplayBox(fieldName);
    control.value = value;
    if (displayBox) {
      displayBox.value = (displayValue == undefined) ? value : displayValue;
      triggerEvent(displayBox, 'change');
    }
    var confirmRow = $('sys_display_confirm.' + s);
    if (confirmRow) {
      confirmRow.value = displayBox.value;
    }
  },
  catalogSetValue: function(fieldName, value, displayValue) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return false;
    for (var x = 0; x < possibles.length; x++) {
      if (possibles[x].value == value) {
        possibles[x].checked = true;
      } else
        possibles[x].checked = false;
    }
    return true;
  },
  _listCollectorClearValue: function(fieldName) {
    var rightSlushbucket = gel(fieldName + "_select_1");
    var leftSlushbucket = gel(fieldName + "_select_0");
    if (rightSlushbucket.options.length > 0) {
      var sourceOptions = rightSlushbucket.options;
      var selectedIds = new Array();
      var index = 0;
      for (var i = 0; i < sourceOptions.length; i++) {
        selectedIds[index] = i;
        index++;
      }
      var label = new GwtMessage().getMessage('--None--');
      moveSelectedOptions(selectedIds, rightSlushbucket, leftSlushbucket, label, null, label, null, null, true);
    }
    return;
  },
  getGlideUIElement: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    for (var x = 0; x < this.elements.length; x++) {
      var thisElement = this.elements[x];
      if (thisElement.fieldName == fieldName)
        return thisElement;
    }
  },
  getReference: function(fieldName, callback) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(fieldName);
    if (!ed)
      return;
    if (ed.type != 'reference')
      return;
    var value = this.getValue(fieldName);
    var gr = new GlideRecord(ed.reference);
    if (!value)
      return gr;
    gr.addQuery('sys_id', value);
    if (callback) {
      var fn = function(gr) {
        gr.next();
        callback(gr)
      };
      gr.query(fn);
      return;
    }
    gr.query();
    gr.next();
    return gr;
  },
  hasPricingImplications: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(realName);
    if (ed && ed.attributes == 'priceCheck') {
      return true;
    }
    return false;
  },
  submit: function() {
    var theText = getMessage('The g_form.submit function has no meaning on a catlog item. Perhaps you mean g_form.addToCart() or g_form.orderNow() instead');
    g_form.addErrorMessage(theText);
    return;
  },
  flash: function(widgetName, color, count) {
    var row = null;
    var labels = new Array();
    var widget = gel(widgetName);
    if (widget)
      widget = widget.firstChild;
    else
      return;
    labels.push(widget);
    count = count + 1;
    originalColor = widget.style.backgroundColor;
    for (var x = 0; x < labels.length; x++) {
      var widget = labels[x];
      if (widget) {
        originalColor = widget.style.backgroundColor;
        widget.style.backgroundColor = color;
      }
    }
    if (count < 4) {
      if (widgetName.startsWith('label_ni.VE'))
        setTimeout('g_sc_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
      else
        setTimeout('g_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
    }
  },
  serialize: function(filterFunc) {
    if (typeof(g_cart) == 'undefined')
      g_cart = new SCCart();
    var cart = g_cart;
    var item = gel('sysparm_id');
    if (!item)
      item = gel('current_item');
    if (item)
      item = item.value;
    else
      item = 'none';
    var url = cart.generatePostString() + "&sysparm_id=" + encodeURIComponent(item);
    return url;
  },
  serializeChanged: function() {
    return this.serialize();
  },
  addToCart: function() {
    if (typeof(addToCart) == 'function')
      addToCart();
    else {
      var theText = getMessage('The add to cart function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  orderNow: function() {
    if (typeof(orderNow) == 'function')
      orderNow();
    else {
      var theText = getMessage('The order now function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  addCatalogSubmit: function(handler) {
    this.onCatalogSubmit.push(handler);
  },
  callCatalogSubmitHandlers: function() {
    for (var x = 0; x < this.onCatalogSubmit.length; x++) {
      var handler = this.onCatalogSubmit[x];
      var formFuncCalled = false;
      try {
        CustomEvent.fire('glide_optics_inspect_put_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncCalled = true;
        var returnvalue = handler.call(this);
        formFuncCalled = false;
        CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        if (returnvalue == false)
          return false;
      } catch (ex) {
        if (formFuncCalled)
          CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncError("onSubmit", func, ex);
        return false;
      }
    }
    return true;
  },
  catalogOnSubmit: function(ignoreFrames) {
    var rc = this.mandatoryCheck(false, !ignoreFrames);
    rc = rc && this.callCatalogSubmitHandlers() && this.onSubmit(true);
    return rc;
  },
  isRadioControl: function(fieldName) {
    var radios = document.getElementsByName(fieldName);
    if (radios && radios[0]) {
      var radio = $(radios[0]);
      if (radio && radio.readAttribute('type') && radio.readAttribute('type') === 'radio')
        return true;
    }
    var control = this.getControl(fieldName);
    return control && ((typeof control.hasClassName === "function") && control.hasClassName("radio"));
  },
  getRadioControlCheckedValue: function(fieldName) {
    fieldName = this.resolveNameMap(this.removeCurrentPrefix(fieldName));
    var radios = document.getElementsByName(fieldName)
    var val = '';
    if (radios.length > 0)
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked)
          val = radios[i].value;
      }
    return val;
  },
  getValue: function(fieldName) {
    if (this.isRadioControl(fieldName))
      return this.getRadioControlCheckedValue(fieldName);
    else if (this._isTinyMCEControl(fieldName))
      return this._getTinyMCEControlValue(fieldName);
    else {
      fieldName = this.removeCurrentPrefix(fieldName);
      var control = this.getControl(fieldName);
      if (!control)
        return '';
      return GlideForm.prototype._getValueFromControl.call(this, control);
    }
  },
  _dontFireOnChangeForClearValue: function() {
    return (typeof this.dontFireOnChangeForClearValue != 'undefined' && this.dontFireOnChangeForClearValue == 'true')
  },
  clearValue: function(fieldName) {
    var fieldId = this.resolveNameMap(this.removeCurrentPrefix(fieldName));
    var control = this.getControl(fieldId);
    if (!control)
      return;
    if (!control.options) {
      if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].clearValue == "function")) {
        g_form.elementHandlers[control.id].clearValue(this._dontFireOnChangeForClearValue());
        return;
      }
      this.setValue(fieldName, '', undefined, this._dontFireOnChangeForClearValue());
      return;
    }
    var selindex = control.selectedIndex;
    var oldValue = '';
    if (selindex != -1) {
      var option = control.options[selindex];
      oldValue = option.value;
      option.selected = false;
    }
    var options = control.options;
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var optval = option.value;
      if (optval == '') {
        option.selected = true;
        break;
      }
    }
    if (!this._dontFireOnChangeForClearValue())
      triggerEvent(control, 'change');
    this._opticsInspectorLog(fieldName, oldValue);
  },
  getAppliedFieldName: function(fieldName) {
    return this._getAppliedFieldName(fieldName);
  },
  getUniqueValue: function() {
    var elem = gel('sysparm_id') || gel('sysparm_active');
    if (elem)
      return elem.value;
    else
      return "";
  },
  _setReadonly: function(fieldName, disabled, isMandatory, fieldValue) {
    var platformCalled = false;
    disabled = (disabled == 'true' || disabled == true) ? true : false;
    isMandatory = (isMandatory == 'true' || isMandatory == true) ? true : false;
    fieldName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's ReadOnly to " + disabled);
      return;
    }
    var ge = this.getGlideUIElement(fieldName);
    var s = this.tableName + '.' + fieldName;
    if (typeof ge == "undefined" && this._formExists()) {
      var mapName = this.resolveNameMap(fieldName);
      for (var x = 0; x < g_form.elements.length; x++) {
        var thisElement = g_form.elements[x];
        var thisField = thisElement.fieldName;
        if (thisField == mapName) {
          ge = thisElement;
          s = mapName;
        }
      }
    }
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'checkbox_container' || ge.type == 'label')) {
      opticsLog(this.getTableName(), fieldName, "Readonly can't be set on " + ge.type + " variable");
      return;
    }
    if (control.hasAttribute("container_id")) {
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Readonly ' + disabled + " on container " + g_form.resolveLabelNameMap(control.id));
      this._executeVariableSetChildren(control.id, "readonly", disabled);
      CustomEvent.fire('glide_optics_inspect_pop_context');
      return;
    }
    if (this.isRadioControl(fieldName)) {
      var radioControls = this.getControls(fieldName);
      if (radioControls.length > 0) {
        if (disabled == this.isReadOnly(ge, radioControls[0]))
          return;
      }
    } else if (disabled == this.isReadOnly(ge, control))
      return;
    var lookup = gel('lookup.' + control.id);
    if (lookup)
      s = control.id;
    if (ge) {
      if (ge.type == "masked") {
        s = control.id;
        var confirmRow = $('sys_display.' + s + '.confirm_row');
        if (confirmRow) {
          if (disabled && (!isMandatory || fieldValue != ''))
            this._hideIfPresent(confirmRow);
          else
            this._showIfPresent(confirmRow);
        }
      }
      if (ge.type == 'reference') {
        if (lookup && disabled && (!isMandatory || fieldValue != ''))
          this._hideIfPresent(lookup);
        else if (lookup && !disabled)
          this._showIfPresent(lookup);
      }
      var possibles = this.getControls(fieldName);
      var processed = false;
      if (possibles && possibles.length > 0) {
        for (var i = 0; i < possibles.length; i++) {
          if (possibles[i].type == "radio") {
            GlideForm.prototype._setReadonly0.call(this, ge, possibles[i], s, fieldName, disabled, isMandatory, fieldValue);
            if (!(disabled && isMandatory && fieldValue == '') && !(possibles[i].getAttribute('gsftlocked') == 'true')) {
              if (!(isSafari || isChrome) && disabled)
                possibles[i].setAttribute("disabled", "true");
              else if (!(isSafari || isChrome) && !disabled)
                possibles[i].removeAttribute("disabled");
            }
            processed = true;
            platformCalled = true;
          }
        }
      }
      if (ge.type == "glide_list") {
        if (isMandatory != ge.isMandatory())
          isMandatory = ge.isMandatory();
        this._processReadOnlyGlideListVariable(control, fieldName, disabled, isMandatory, fieldValue);
        processed = true;
      }
      if (disabled && isMandatory && ((this._isCheckbox(fieldName) && fieldValue == 'false') || fieldValue.blank())) {
        opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field's ReadOnly to " + disabled);
        return;
      }
      var dataType = control.getAttribute("data-type");
      if (dataType == 'duration' || dataType == 'sc_multi_row') {
        if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setReadOnly == "function"))
          g_form.elementHandlers[control.id].setReadOnly(disabled);
        return;
      }
      if (!processed) {
        GlideForm.prototype._setReadonly0.call(this, ge, control, s, fieldName, disabled, isMandatory, fieldValue);
        platformCalled = true;
      }
      if (ge.type == "glide_date")
        this._displayDateSelector(control, !disabled);
      if (ge.type == "glide_date_time")
        this._displayDateSelector(control, !disabled);
      if (ge.type == 'sc_email') {
        var selector = $$('a[data-ref="' + control.id + '"]');
        if (selector)
          selector.invoke('writeAttribute', 'disabled', disabled);
      }
    }
    if (this._formExists()) {
      var df = g_form.disabledFields.length;
      g_form.disabledFields[df] = control;
    }
    if (control.getAttribute('slush') == 'true')
      this._processReadOnlySlush(control, fieldName, disabled);
    if (!platformCalled)
      opticsLog(this.getTableName(), fieldName, "ReadOnly set to " + disabled);
  },
  _displayDateSelector: function(control, display) {
    var selectId = "ni." + control.id + ".ui_policy_sensitive";
    if ($(selectId)) {
      if (this._isDoctypeMode())
        if (display)
          $(selectId).writeAttribute("disabled", false);
        else
          $(selectId).writeAttribute("disabled", true);
      else
      if (display)
        this._showIfPresent(selectId);
      else
        this._hideIfPresent(selectId);
    }
  },
  _getAppliedFieldName: function(fieldName) {
    for (var i = 0; i < this.nameMap.length; i++) {
      if (this.nameMap[i].prettyName == fieldName)
        return this.nameMap[i].realName;
      else if (this.nameMap[i].realName == fieldName)
        return this.nameMap[i].prettyName;
    }
    return fieldName;
  },
  _processReadOnlyGlideListVariable: function(control, fieldName, disabled, isMandatory, fieldValue) {
    var name = control.id;
    var element = gel(name + "_unlock");
    if (!element)
      return;
    if (disabled && (!isMandatory || fieldValue != '')) {
      lock(element, name, name + '_edit', name + '_nonedit', 'select_0' + name, name + '_nonedit');
      hideObject(element);
      var addMe = $("add_me_locked." + name)
      if (addMe)
        addMe.hide();
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    } else if (!disabled) {
      showObjectInlineBlock(element);
      toggleAddMe(name);
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    }
  },
  _processReadOnlySlush: function(control, fieldName, disabled) {
    if (!$(fieldName + "_select_1"))
      fieldName = this._getAppliedFieldName(fieldName);
    var leftOptionList = fieldName + "_select_0";
    var rightOptionList = fieldName + "_select_1";
    var recordPreviewTable = fieldName + 'recordpreview';
    var noFilter = control.getAttribute("nofilter");
    if (disabled) {
      this._unselectOptions(leftOptionList);
      var selectedRightOption = this._selectedOption(rightOptionList);
      if (selectedRightOption && typeof(selectedRightOption.value) != 'undefined' &&
        selectedRightOption.value != null &&
        selectedRightOption.value != '' &&
        selectedRightOption.value != '--None--') {
        showSelected(
          gel(rightOptionList),
          recordPreviewTable,
          this._retrieveTableName(fieldName));
      } else {
        this._hideIfPresent(recordPreviewTable);
      }
      $(rightOptionList).ondblclickOLD = $(rightOptionList).ondblclick;
      $(rightOptionList).ondblclick = "";
      this._hideIfPresent(leftOptionList);
      this._hideIfPresent(leftOptionList + "_title_row");
      this._hideIfPresent(leftOptionList + "_filter_row");
      this._hideIfPresent(leftOptionList + "_filters_row");
      this._hideIfPresent(leftOptionList + "_search_row");
      this._hideIfPresent(rightOptionList + "_search_row");
      this._hideIfPresent(leftOptionList + "_add_remove_container");
      this._hideIfPresent(leftOptionList + "_add_remove_message_table");
      this._hideDoctypeSlushBucket(fieldName);
    } else {
      if ($(fieldName + "_select_1").ondblclickOLD)
        $(fieldName + "_select_1").ondblclick = $(fieldName + "_select_1").ondblclickOLD;
      this._showIfPresent(recordPreviewTable);
      this._showIfPresent(leftOptionList);
      this._showIfPresent(leftOptionList + "_title_row");
      if (noFilter != "true") {
        this._showIfPresent(leftOptionList + "_filter_row");
        this._showIfPresent(leftOptionList + "_filters_row");
      }
      this._showIfPresent(leftOptionList + "_search_row");
      this._showIfPresent(rightOptionList + "_search_row");
      this._showIfPresent(leftOptionList + "_add_remove_container");
      this._showIfPresent(leftOptionList + "_add_remove_message_table");
      this._showDoctypeSlushBucket(fieldName);
    }
  },
  _retrieveTableName: function(fieldName) {
    var relatedTableNameFunction = fieldName +
      '_getMTOMRelatedTable();';
    var relatedTableNameDotFieldName = eval(relatedTableNameFunction);
    var tableName = relatedTableNameDotFieldName.split('.')[0];
    return tableName;
  },
  _selectedOption: function(optionsArray) {
    var selectedOption;
    var selectedOptionIndex = gel(optionsArray).selectedIndex;
    var cssOptionsSelector = '#' + optionsArray + ' option';
    if (selectedOptionIndex == -1 && $$(cssOptionsSelector)[0]) {
      selectedOption = $$(cssOptionsSelector)[0];
      selectedOption.selected = true;
      gel(optionsArray).selectedIndex = 0;
    } else {
      selectedOption = $$(cssOptionsSelector)[selectedOptionIndex];
    }
    return selectedOption;
  },
  _unselectOptions: function(optionsArray) {
    var cssOptionsSelector = '#' + optionsArray + ' option';
    var optionsArray = $$(cssOptionsSelector).each(function(ele, i) {
      return $(ele).selected = false;
    });
    gel(optionsArray).selectedIndex = -1;
  },
  _hideIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.hide(elem);
  },
  _getTinyMCEControlValue: function(fieldName) {
    if (this._isTinyMCEIncluded()) {
      var tinymceElement = tinymce.get(fieldName);
      if (tinymceElement && tinymceElement.initialized) {
        var value = tinymceElement.getContent({
          format: 'html'
        });
        if (value.indexOf('<body') == 0)
          return value.substring(value.indexOf('>') + 1).replace('</body>', '');
        else
          return value;
      }
    }
    return "";
  },
  _isTinyMCEIncluded: function() {
    return !!(typeof tinymce !== 'undefined' && tinymce !== undefined && tinymce !== null && tinymce);
  },
  _isTinyMCEControl: function(fieldName) {
    if (!this._isTinyMCEIncluded())
      return false;
    var tinymceElement = tinymce.get(fieldName);
    return !!(tinymceElement !== undefined && tinymceElement !== null && tinymceElement);
  },
  _isDoctypeMode: function() {
    if (typeof this.cachedDoctypeMode == 'undefined')
      !!(this.cachedDoctypeMode = (document.documentElement.getAttribute('data-doctype') == 'true'));
    return !!(this.cachedDoctypeMode);
  },
  _showIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.show(elem);
  },
  _formExists: function() {
    if (typeof g_form == 'undefined')
      return false;
    if (typeof g_sc_form == 'undefined')
      return false;
    return g_form != g_sc_form;
  },
  _hideDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].hide();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].hide();
          }
        }
      }
    }
  },
  _showDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].show();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].show();
          }
        }
      }
    }
  },
  refreshSlushbucket: function(fieldName) {
    var control = this.getControl(fieldName);
    if (control.getAttribute('slush') == 'true') {
      var fnName = fieldName;
      if (fnName.startsWith('variables.'))
        fnName = fnName.substring(10);
      else if (fnName.startsWith('variable_pool.'))
        fnName = fnName.substring(14);
      fnName += 'acRequest';
      if (typeof window[fnName] == 'function')
        window[fnName](null);
      else
        jslog("Ajaxcompleter for the variable, " + fieldName + ", was not found");
    }
  },
  _getFieldTR: function(control_name) {
    var control = this.getControl(control_name);
    var fieldTR = gel('element.' + control_name);
    if (!fieldTR) {
      if (control_name.startsWith("IO:"))
        fieldTR = this.getContainer(control_name.substr(3));
      else if (control_name.startsWith("ni.VE"))
        fieldTR = this.getContainer(control_name.substr(5));
      else
        fieldTR = this.getContainer(control_name);
    }
    if (!fieldTR && this._isCheckbox(control_name)) {
      var nidot = gel('ni.' + control_name);
      if (nidot) {
        while (nidot) {
          if (nidot.hasAttribute('name') && nidot.getAttribute('name') == 'checkbox_container')
            break;
          nidot = nidot.parentNode;
        }
        if (nidot)
          return nidot;
      }
      var gsftcontainer = gel(control.getAttribute("gsftcontainer"));
      if (gsftcontainer && gsftcontainer.hasAttribute("container_id"))
        fieldTR = gel('element.checkbox_container_' + gsftcontainer.getAttribute("container_id"));
    }
    return fieldTR;
  },
  isDisplayNone: function(ge, control) {
    var control_name = "";
    if (ge)
      control_name = ge.fieldName;
    if (!control_name && control)
      control_name = control.name;
    if (!control_name)
      return false;
    var fieldTR = this._getFieldTR(control_name);
    if (fieldTR) {
      if (fieldTR.style.display == 'none')
        return true;
      if (fieldTR.hasAttribute('parent_container_id')) {
        if (this._isParentDisplayNone(fieldTR.getAttribute('parent_container_id')))
          return true;
      }
    }
    return false;
  },
  _isParentDisplayNone: function(parentContainerId) {
    while (parentContainerId) {
      parentContainerEle = gel('element.container_' + parentContainerId);
      if (parentContainerEle && parentContainerEle.style.display == 'none')
        return true;
      parentContainerId = parentContainerEle.getAttribute('parent_container_id');
    }
    return false;
  },
  getRollbackContextId: function() {
    return this.rollbackContextId;
  },
  setRollbackContextId: function(rollbackContextId) {
    this.rollbackContextId = rollbackContextId;
  }
});;
/*! RESOURCE: /scripts/classes/ServiceCatalogForm17.js */
var ServiceCatalogForm17 = Class.create(ServiceCatalogForm, {
  initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
    this.classname = "ServiceCatalogForm17";
    GlideForm.prototype.initialize.call(this, tableName, mandatory, checkMandatory, checkNumeric, checkInteger);
    this.onCatalogSubmit = [];
    this.rollbackContextId = "";
    this.actions = [];
    this.actionStack = [];
    this.useNewForm = false;
    this.scUIElementMap = {};
    this.allowSetDisplay = true;
  },
  addSCUIElement: function(fieldId, ge) {
    this.scUIElementMap[fieldId] = ge;
  },
  getSCUIElement: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var fieldid = this.resolveNameMap(fieldName);
    if (this.scUIElementMap)
      return this.scUIElementMap[fieldid];
    return null;
  },
  getSCUIElements: function() {
    var scEleArr = [];
    for (var field in this.scUIElementMap) {
      scEleArr.push(this.scUIElementMap[field]);
    }
    this.scUIElements = scEleArr;
    return this.scUIElements;
  },
  _getBooleanValue: function(d) {
    d = "" + d;
    return (d == "true");
  },
  _pushAction: function(action) {
    if (!action)
      return;
    var logActions = $('log_variable_actions');
    if (logActions && logActions.value === 'false')
      return;
    action.visible = true;
    action.endTime = new Date();
    if (g_form.actionStack.length > 0) {
      action.step = (g_form.actionStack[g_form.actionStack.length - 1].actions.length);
      g_form.actionStack[g_form.actionStack.length - 1].actions
        .push(action);
    } else {
      if (action.type == 'context') {
        action.step = (g_form.actions.length);
        g_form.actions.push(action);
      } else {
        var context = {
          actions: []
        };
        context.actions.push(action);
        g_form.actions.push(context);
      }
    }
  },
  addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
    var realName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(this.resolveNameMap(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    var opts = control.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == choiceValue) {
        control.remove(i);
        break;
      }
    var len = control.options.length;
    if (choiceIndex == undefined)
      choiceIndex = len;
    if (choiceIndex < 0 || choiceIndex > len)
      choiceIndex = len;
    var newOption;
    if (typeof choiceValue == 'undefined')
      newOption = new Option(choiceLabel);
    else
      newOption = new Option(choiceLabel, choiceValue);
    var currentSelectedIndex = control.options.selectedIndex;
    var value = choiceValue;
    if (len > 0) {
      value = this.getValue(fieldName);
      control.options[len] = new Option('', '');
      for (var i = len; i > choiceIndex; i--) {
        control.options[i].text = control.options[i - 1].text;
        control.options[i].value = control.options[i - 1].value;
      }
    }
    control.options[choiceIndex] = newOption;
    if (len === 0)
      this.setValue(fieldName, value);
    else if (choiceIndex <= currentSelectedIndex)
      control.options.selectedIndex = currentSelectedIndex + 1;
  },
  getActualName: function(fieldName) {
    var realName = this.removeCurrentPrefix(fieldName);
    return this.resolveNameMap(realName);
  },
  clearOptions: function(fieldName) {
    var realName = this.removeCurrentPrefix(fieldName);
    realName = this.resolveNameMap(realName);
    var control = this.getControl(realName);
    if (!control)
      return;
    if (!control.options)
      return;
    control.innerHTML = '';
  },
  getMissingFields: function(answer) {
    if (!answer)
      answer = [];
    var scUIElements = this.getSCUIElements();
    for (var i = 0; i < scUIElements.length; i++) {
      var uiElement = scUIElements[i];
      var mandatory;
      if (uiElement.type == "checkbox" || uiElement.type == "checkbox_label")
        mandatory = this._isCheckboxGroupMandatory(uiElement.getID(), []);
      else
        mandatory = uiElement.isMandatory();
      if (mandatory && this._isFieldValueBlank(uiElement.getID(), this.getValue(uiElement.getID()))) {
        var id = uiElement.getID();
        if (uiElement.type == "checkbox")
          id = uiElement.isStandaloneCheckbox() ? uiElement.getID() : uiElement.getParentContainerId();
        if (uiElement.type == "checkbox_label")
          continue;
        if (answer.indexOf(id) > -1)
          continue;
        answer.push(id);
      }
    }
    return answer;
  },
  _allChildrenHidden: function(ge) {
    if (ge.type != 'container' && ge.type != 'checkbox_label')
      return false;
    var children = ge.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childGe = this.getSCUIElement(child);
      if (!childGe)
        continue;
      if (childGe.isVisible())
        return false;
    }
    return true;
  },
  _setCatalogCheckBoxDisplay: function(id, d) {
    var ge = this.getSCUIElement(id);
    if (!ge)
      return false;
    if (ge.type != 'checkbox')
      return false;
    d = this._getBooleanValue(d);
    var checkboxContainer = ge.getElementParentNode();
    checkboxContainer.style.display = d ? '' : 'none';
    if (ge.getParentContainerId())
      this._setParentContainerDisplay(ge.getParentContainerId(), true);
    this.notifyCatLabelChange(id);
    if (this._calculateCheckboxMandatory(ge.getParentContainerId()) && !this._isChecked(ge.getParentContainerId())) {
      if (this._isAllReadonly(ge.getParentContainerId())) {
        var children = this.getSCUIElement(ge.getParentContainerId()).getChildren();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var childGe = this.getSCUIElement(child);
          if (!childGe)
            continue;
          if (childGe.isVisible() && childGe.isReadOnly()) {
            this.setReadOnly(childGe.getID(), false);
          }
        }
      }
    }
    return true;
  },
  _isSingleCheckbox: function(ge) {
    if (ge.type != 'checkbox')
      return false;
    return ge.isStandaloneCheckbox();
  },
  _setCatalogSpacerDisplay: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.display = d;
  },
  _setCalalogCheckBoxLabelDisplay: function(id, d) {
    var ge = this.getSCUIElement(id);
    if (!ge || ge.type != "checkbox_label")
      return false;
    var container = ge.getElementParentNode();
    container.style.display = this._getBooleanValue(d) ? '' : 'none';
    if (ge.getParentContainerId()) {
      this._setParentContainerDisplay(ge.getParentContainerId(), true);
    }
    return true;
  },
  setCatalogDisplay: function(id, d) {
    id = this.removeCurrentPrefix(id);
    id = this.resolveNameMap(id);
    var ge = this.getSCUIElement(id);
    if (!ge)
      return;
    if (ge.type == "checkbox")
      return this._setCatalogCheckBoxDisplay(id, d);
    else if (ge.type == "checkbox_label")
      return this._setCalalogCheckBoxLabelDisplay(id, d);
    var parentNode = ge.getElementParentNode();
    if (parentNode)
      parentNode.style.display = this._getBooleanValue(d) ? '' : 'none';
    if (ge.getParentContainerId()) {
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap(ge.getParentContainerId()));
      this._setParentContainerDisplay(ge.getParentContainerId(), true);
      CustomEvent.fire('glide_optics_inspect_pop_context');
    }
    return;
  },
  removeCurrentPrefix: function(id) {
    return this.removeVariablesPrefix(GlideForm.prototype.removeCurrentPrefix.call(this, id));
  },
  removeVariablesPrefix: function(id) {
    var VARIABLES_PREFIX = "variables.";
    if (id && id.startsWith(VARIABLES_PREFIX))
      id = id.substring(VARIABLES_PREFIX.length);
    return id;
  },
  _cleanupName: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    fieldName = fieldName.split(':');
    if (fieldName.length != 2)
      return fieldName[0];
    fieldName = fieldName[1];
    return fieldName;
  },
  _isFieldVisible: function(ge) {
    if (ge.type == 'container' || ge.type == 'checkbox_label')
      return ge.isVisible() && !this._allChildrenHidden(ge);
    return ge.isVisible();
  },
  _setParentContainerDisplay: function(parentContainerId, cascade) {
    if (!parentContainerId)
      return;
    var ge = this.getSCUIElement(parentContainerId);
    if (!ge)
      return;
    var hideContainer = this._allChildrenHidden(ge);
    if (typeof cascade == 'undefined')
      cascade = true;
    this.setContainerDisplay(parentContainerId, !hideContainer, cascade);
    return;
  },
  setContainerDisplay: function(fieldName, display, cascade) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return;
    var container = ge.getElementParentNode();
    if (!container)
      return;
    var d = this._getBooleanValue(display) ? '' : 'none';
    var showLog = !(cascade && (container.style.display == d));
    if (container.style.display == 'none') {
      if (d == 'none') {
        if (!cascade && container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      } else {
        if (cascade && !container.hasAttribute("cascaded_display"))
          return;
        container.style.display = d;
        if (container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      }
    } else {
      if (d == 'none') {
        container.style.display = d;
        if (cascade)
          container.setAttribute('cascaded_display', 'true');
        else if (container.hasAttribute('cascaded_display'))
          container.removeAttribute('cascaded_display');
      }
    }
    if (ge.getParentContainerId()) {
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + ge.parentContainerId));
      this._setParentContainerDisplay(ge.getParentContainerId(), cascade);
      CustomEvent.fire('glide_optics_inspect_pop_context');
    }
    _frameChanged();
    if (showLog)
      opticsLog(this.getTableName(), fieldName, " Display set to " + display);
    return true;
  },
  getContainer: function(f) {
    var ge = this.getSCUIElement(f);
    if (!ge || ge.type != 'container')
      return "";
    return ge.getElementParentNode();
  },
  hideSection: function(fieldName) {
    this.hideReveal(fieldName, false);
  },
  revealSection: function(fieldName) {
    this.hideReveal(fieldName, true);
  },
  hideReveal: function(fieldName, expand) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var row = gel('row_' + fieldName);
    if (!row)
      return false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(fieldName);
  },
  setDisplay: function(id, display) {
    if (!this.allowSetDisplay) {
      jslog("setDisplay is not supported on Multi-row set variables");
      return;
    }
    var ge = this.getSCUIElement(id);
    if (!ge) {
      opticsLog(this.getTableName(), id, "Unable to set display on an invalid field");
      return false;
    }
    if (!this._getBooleanValue(display) && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
      opticsLog(this.getTableName(), id, "Unable to set blank mandatory field display to " + display);
      return;
    }
    if (ge.type == 'container')
      return this.setContainerDisplay(id, display);
    this.setCatalogDisplay(id, display);
    _frameChanged();
    opticsLog(this.getTableName(), id, "Display set to " + display);
    return;
  },
  _setCatalogCheckBoxVisibility: function(id, visibility) {
    var ge = this.getSCUIElement(id);
    if (!ge || ge.type != 'checkbox')
      return false;
    var checkboxContainer = ge.getElementParentNode();
    var v = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
    checkboxContainer.style.visibility = v;
    return true;
  },
  _setCalalogCheckBoxLabelVisibility: function(id, visibility) {
    var ge = this.getSCUIElement(id);
    if (!ge || ge.type != 'checkbox_label')
      return false;
    var v = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
    ge.getElementParentNode().style.visibility = v;
    return true;
  },
  setCatalogVisibility: function(id, visibility) {
    id = this.removeCurrentPrefix(id);
    id = this.resolveNameMap(id);
    var ge = this.getSCUIElement(id);
    if (!ge)
      return;
    if (ge.type == "checkbox")
      return this._setCatalogCheckBoxVisibility(id, visibility);
    else if (ge.type == "checkbox_label")
      return this._setCalalogCheckBoxLabelVisibility(id, visibility);
    var d = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
    var label = ge.getElementParentNode();
    if (label)
      label.style.visibility = d;
    var help = gel('help_' + id + '_wrapper');
    if (help)
      help.style.visibility = d;
    var spacer = gel('spacer_' + id);
    if (spacer)
      spacer.style.visibility = d;
    if (ge.type == "glide_list") {
      var unlock = gel(id + '_unlock');
      if (unlock.style.visibility)
        unlock.style.visibility = d;
      var lock = gel(id + '_lock');
      if (lock.style.visibility)
        lock.style.visibility = d;
    }
  },
  setContainerVisibility: function(id, visibility) {
    id = this.removeCurrentPrefix(id);
    id = this.resolveNameMap(id);
    var ge = this.getSCUIElement(id);
    if (!ge || ge.type != "container")
      return;
    var children = ge.getChildren();
    for (var i = 0; i < children.length; i++) {
      var childGe = this.getSCUIElement(children[i]);
      if (!childGe)
        continue;
      if (childGe.type == "checkbox_label") {
        var checkboxes = childGe.getChildren();
        for (var j = 0; j < checkboxes.length; j++)
          this.setVisible(checkboxes[j], visibility);
      } else
        this.setVisible(children[i], visibility);
    }
  },
  setVisible: function(id, visibility) {
    if (!this.allowSetDisplay) {
      jslog("setVisible is not supported on Multi-row set variables");
      return;
    }
    visibility = this._getBooleanValue(visibility);
    var fieldValue = this.getValue(id);
    var ge = this.getSCUIElement(id);
    if (!ge) {
      opticsLog(this.getTableName(), id, "Unable to set invalid field's visibility to " + visibility);
      return;
    }
    if (!visibility && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
      opticsLog(this.getTableName(), id, "Unable to set blank mandatory field visibility to " + visibility);
      return;
    }
    if (ge.type == "container")
      return this.setContainerVisibility(id, visibility);
    this.setCatalogVisibility(id, visibility);
    opticsLog(this.getTableName(), id, "Visibility set to " + visibility);
    return;
  },
  _canSetDisplayFalseIfMandatory: function(id) {
    var ge = this.getSCUIElement(id);
    if (!ge)
      return false;
    if (ge.type == 'formatter' || ge.type == 'page' || ge.type == 'macro')
      return true;
    else if (ge.type == 'checkbox')
      return !ge.isFieldValueBlank();
    else if (ge.type == 'checkbox_label') {
      return this._isChecked(id);
    } else if (ge.type == 'container') {
      var children = ge.getChildren();
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!this._canSetDisplayFalseIfMandatory(child))
          return false;
      }
      return true;
    } else if (ge.type == 'sc_multi_row') {
      return !this._isFieldValueBlank(id, this.getValue(id));
    }
    var fieldValue = this.getValue(id);
    return !fieldValue.blank();
  },
  isMandatory: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == "checkbox")
      return this._calculateCheckboxMandatory(ge.getParentContainerId()) && !this._isChecked(ge.getParentContainerId());
    else if (ge.type == "checkbox_label")
      return this._calculateCheckboxMandatory(fieldName) && !this._isChecked(fieldName);
    else if (ge.type == "container") {
      var children = ge.getChildren();
      for (var j = 0; j < children.length; j++) {
        var childGe = this.getSCUIElement(children[j]);
        if (!childGe)
          continue;
        if (this.isMandatory(childGe.fieldName))
          return true;
      }
    }
    return ge.isMandatory();
  },
  setRequiredChecked: function(fieldName, required) {
    if (!this._isCheckbox(fieldName)) {
      jslog("Given variable is not of checkbox type");
      return;
    }
    this.setMandatory(fieldName, required);
  },
  setMandatory: function(fieldName, mandatory) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge || !ge.getElement()) {
      opticsLog(this.getTableName(), fieldName, "Unable to set mandatory on invalid field");
      return;
    }
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'label' || ge.type == "checkbox_label")) {
      opticsLog(this.getTableName(), fieldName, "Mandatory can't be set on " + ge.type + " variable");
      return;
    }
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    this._setMandatory(fieldName, mandatory);
    opticsLog(this.getTableName(), fieldName, "Mandatory set to " + mandatory);
    return;
  },
  debounceMandatoryChanged: function() {
    var that = this;
    if (this.debounceMandatoryChangedTimeout) {
      clearTimeout(this.debounceMandatoryChangedTimeout);
    }
    this.debounceMandatoryChangedTimeout = setTimeout(function() {
      that.debounceMandatoryChangedTimeout = null;
      CustomEvent.fire("mandatory.changed");
    }, 300);
  },
  _setContainerMandatory: function(ge, mandatory) {
    mandatory = this._getBooleanValue(mandatory);
    ge.mandatory = mandatory;
    CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Mandatory ' + mandatory + " on container " + g_form.resolveLabelNameMap(ge.getID()));
    if (!ge.isVisible() && mandatory && !this._canSetDisplayFalseIfMandatory(ge.getID()))
      this.setDisplay(ge.getID(), true);
    var children = ge.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childGe = this.getSCUIElement(child);
      if (!childGe)
        continue;
      if (childGe.type !== 'checkbox_label')
        this.setMandatory(child, mandatory);
      else {
        var checkBoxes = childGe.getChildren();
        for (var j = 0; j < checkBoxes.length; j++) {
          this.setMandatory(checkBoxes[j], mandatory);
        }
      }
    }
    CustomEvent.fire('glide_optics_inspect_pop_context');
    return true;
  },
  _setCheckboxLabelMandatory: function(ge, mandatory) {
    ge.mandatory = this._getBooleanValue(mandatory);
  },
  _setMandatory: function(fieldName, mandatory) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    mandatory = this._getBooleanValue(mandatory);
    var ge = this.getSCUIElement(fieldName);
    if (!ge || !ge.getElement())
      return;
    if (ge.type == 'container')
      return this._setContainerMandatory(ge, mandatory);
    var className = '';
    var classTitle = '';
    var original = ge.getOriginalControlElement();
    var oValue = 'unknown';
    if (original)
      oValue = original.value;
    var nValue = this.getValue(fieldName);
    if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
      if (ge.type == 'checkbox') {
        if (!ge.isChecked()) {
          this.setDisplay(ge.getID(), true);
          if (ge.getParentContainerId()) {
            CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap(ge.getParentContainerId()));
            this._setParentContainerDisplay(ge.getParentContainerId(), false);
            CustomEvent.fire('glide_optics_inspect_pop_context');
          }
        }
      } else {
        this.setDisplay(ge.getID(), true);
        if (ge.getParentContainerId()) {
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap(ge.getParentContainerId()));
          this._setParentContainerDisplay(ge.getParentContainerId(), false);
          CustomEvent.fire('glide_optics_inspect_pop_context');
        }
      }
      if (this.isReadOnly(ge, ge.getElement()) ||
        (ge.type == "radio" && ge.isReadonly()))
        this.setReadOnly(ge.getID(), false);
    }
    ge.mandatory = mandatory;
    var defaultGe = this.getGlideUIElement(fieldName);
    if (defaultGe)
      defaultGe.mandatory = mandatory;
    var curField = ge.getStatusElement();
    if (curField)
      curField.setAttribute("mandatory", mandatory);
    if (ge.getElement())
      ge.getElement().setAttribute("aria-required", mandatory);
    var isCheckboxVar = (ge.type == 'checkbox');
    if (isCheckboxVar) {
      mandatory = this._calculateCheckboxMandatory(ge.getID());
    }
    var control = ge.getElement();
    var dataType = control.getAttribute('data-type');
    if (dataType == 'sc_multi_row' && control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setMandatory == "function"))
      g_form.elementHandlers[control.id].setMandatory(mandatory);
    if (mandatory && oValue != nValue) {
      className = "changed required-marker";
      classTitle = getMessage("Field value has changed");
    } else if (mandatory && !this._isFieldValueBlank(ge.getID(), nValue)) {
      className = "mandatory_populated required-marker";
      classTitle = isCheckboxVar ? getMessage('Required - preloaded with saved data') : getMessage('Mandatory - preloaded with saved data');
    } else if (mandatory) {
      className = 'mandatory required-marker';
      classTitle = isCheckboxVar ? getMessage('Required - must be checked before Submit') : getMessage('Mandatory - must be populated before Submit');
    }
    this.changeCatLabel(fieldName, className + ' label_description', classTitle);
    this.debounceMandatoryChanged();
    setMandatoryExplained();
  },
  _calculateCheckboxMandatory: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'checkbox')
      ge = this.getSCUIElement(ge.getParentContainerId());
    if (!ge)
      return false;
    var children = ge.getChildren();
    for (var i = 0; i < children.length; i++) {
      var childGe = this.getSCUIElement(children[i]);
      if (!childGe)
        continue;
      if (childGe.isVisible() && childGe.isMandatory())
        return true;
    }
    return false;
  },
  _listCollectorMandatoryChild: function(fieldName, newFieldClassName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return null;
    var _mandateMarker = ge.getStatusElement().parentElement;
    if (_mandateMarker) {
      _mandateMarker.removeClassName('is-prefilled');
      _mandateMarker.removeClassName('is-required');
      _mandateMarker.removeClassName('is-filled');
      _mandateMarker.addClassName(newFieldClassName);
    }
    var _formGroupElement = _mandateMarker.up('div.form-group');
    _formGroupElement.removeClassName('is-required');
    var _parentElement = document.getElementById('variable_' + fieldName);
    var _childForMandatory = _parentElement.querySelectorAll('.slushbucket-top');
    if (_childForMandatory && _childForMandatory.constructor.name === "NodeList" && _childForMandatory.length > 0) {
      _childForMandatory = _childForMandatory[1];
      return _childForMandatory;
    }
    return null;
  },
  _isAllReadonly: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'checkbox_label') {
      var children = ge.getChildren();
      var readonly = children.length > 0 ? false : true;
      for (var i = 0; i < children.length; i++) {
        var childGe = this.getSCUIElement(children[i]);
        if (!childGe)
          continue;
        if (childGe.isVisible() && !childGe.isReadonly())
          readonly = true;
      }
      return !readonly;
    } else if (ge.type === 'checkbox')
      return this._isAllReadonly(ge.getParentContainerId());
    return false;
  },
  _isChecked: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'checkbox_label') {
      var children = ge.getChildren();
      for (var i = 0; i < children.length; i++) {
        var childGe = this.getSCUIElement(children[i]);
        if (!childGe)
          continue;
        if (childGe.isVisible() && childGe.isChecked())
          return true;
      }
      return false;
    } else if (ge.type === 'checkbox')
      return this._isChecked(ge.getParentContainerId());
    return false;
  },
  _isCheckbox: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    return (ge && ge.type == 'checkbox');
  },
  _isListCollector: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    return (ge && ge.type == 'list_collector');
  },
  _getCheckboxMandatoryElement: function(container, fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge || (ge.type != "checkbox" && ge.type != "checkbox_label"))
      return null;
    if (ge.type == "checkbox")
      return this._getCheckboxMandatoryElement(null, ge.getParentContainerId());
    return ge.getMandatoryElement();
  },
  _isFieldValueBlank: function(fieldName, value) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge || ge.type == 'container' || ge.type == 'formatter')
      return false;
    else if (ge.type == 'sc_multi_row') {
      if (typeof value == 'undefined' || value.blank())
        return true;
      var value = JSON.parse(value);
      if (value.length > 0)
        return false;
      return true;
    } else if (ge.type == 'checkbox')
      return this._isFieldValueBlank(ge.getParentContainerId(), value);
    else if (ge.type == "checkbox_label") {
      var children = ge.getChildren();
      for (var i = 0; i < children.length; i++) {
        var childGe = this.getSCUIElement(children[i]);
        if (!childGe)
          continue;
        if (childGe.isChecked() && childGe.isVisible())
          return false;
      }
      return true;
    } else {
      if (typeof value == 'undefined')
        return ge.isFieldValueBlank();
      return value.blank();
    }
  },
  changeCatLabel: function(fieldName, className, classTitle) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return;
    d = ge.getStatusElement();
    if (!d)
      return;
    if (d.className == 'changed')
      d.setAttribute("oclass", className);
    else {
      d.setAttribute("oclass", '');
      d.className = className;
    }
    var s = $('section508.' + fieldName);
    if (s && typeof classTitle != 'undefined') {
      s.setAttribute('title', classTitle);
      s.setAttribute('alt', classTitle);
    }
    var t = ge.getStatusTooltipElement();
    if (t && typeof classTitle != 'undefined') {
      t.setAttribute('title', classTitle);
      if (className.include('required-marker')) {
        t.setAttribute('style', 'padding-left: 3px;');
      } else {
        t.setAttribute('style', 'padding-left: 3px;display:none;');
      }
    }
    if (typeof classTitle != 'undefined' && !t)
      d.setAttribute('title', classTitle);
    var value = this.getValue(fieldName);
    var fieldClassName = '';
    var mandatory = false;
    if ((className.include("mandatory") || className.include("changed")) && className.include("required-marker") && className.include("label_description")) {
      if (this._isFieldValueBlank(fieldName, value))
        fieldClassName = 'is-required';
      else
        fieldClassName = 'is-filled';
      mandatory = true;
    } else if (className.include("mandatory_populated") && className.include("required-marker") && className.include("label_description")) {
      fieldClassName = 'is-prefilled';
      mandatory = true;
    }
    d.setAttribute('mandatory', mandatory + '');
    var container;
    if (ge.type == 'checkbox') {
      container = this._getCheckboxMandatoryElement(d, fieldName);
    } else if (this._isListCollector(fieldName)) {
      container = this._listCollectorMandatoryChild(fieldName, fieldClassName);
    } else {
      container = d.up('.question_spacer');
      if (!container)
        container = d.up('div.form-group');
    }
    if (!container)
      container = d.up('tr');
    container.removeClassName('is-prefilled');
    container.removeClassName('is-required');
    container.removeClassName('is-filled');
    if (fieldClassName)
      container.addClassName(fieldClassName);
  },
  getCatLabel: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return null;
    return ge.getStatusElement();
  },
  notifyCatLabelChange: function(fieldName) {
    var mandatory = false;
    var nValue = this.getValue(fieldName);
    var fType = this.getControl(fieldName).className;
    var isMultiRowField = false;
    var ge = this.getGlideUIElement(fieldName);
    if (ge.type == "sc_multi_row")
      isMultiRowField = true;
    var realName = this.removeCurrentPrefix(fieldName);
    realName = this.resolveNameMap(realName);
    var original = gel('sys_original.' + realName);
    var oValue = 'unknown';
    if (original)
      oValue = original.value;
    var newClass = 'changed';
    var newFieldClassName = '';
    var oldClass = '';
    var sl = this.getCatLabel(fieldName);
    if (!sl) {
      var control = this.getControl(fieldName);
      if (!control)
        return;
      var container = control.getAttribute("gsftContainer");
      if (container)
        sl = $('status.' + container);
    }
    if (!sl)
      return;
    var isCheckboxVar = this._isCheckbox(fieldName);
    var isListCollectorVar = this._isListCollector(fieldName);
    if (isCheckboxVar) {
      mandatory = this._calculateCheckboxMandatory(fieldName);
    } else if (sl.getAttribute('mandatory') == 'true')
      mandatory = true;
    oldClass = sl.className;
    if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
      newClass = 'mandatory';
      newFieldClassName = 'is-required';
    } else if (mandatory && (fType.indexOf("cat_item_option") != -1 || fType.indexOf("questionSetWidget") != -1 || isMultiRowField)) {
      if (this._isFieldValueBlank(fieldName, nValue)) {
        newClass = 'mandatory';
        newFieldClassName = 'is-required';
      } else {
        if (nValue != oValue) {
          newClass = 'changed';
          newFieldClassName = 'is-filled';
        } else {
          newClass = 'mandatory_populated';
          newFieldClassName = 'is-prefilled';
        }
      }
    } else if (oValue == nValue)
      newClass = sl.getAttribute("oclass");
    sl.className = newClass + " required-marker label_description";
    if (newFieldClassName || isCheckboxVar || isListCollectorVar) {
      var elementContainer;
      if (isCheckboxVar) {
        elementContainer = this._getCheckboxMandatoryElement(sl, fieldName);
      } else if (isListCollectorVar) {
        elementContainer = this._listCollectorMandatoryChild(fieldName, newFieldClassName);
      } else {
        elementContainer = sl.up("div.form-group");
        if (!elementContainer)
          elementContainer = sl.up('.question_spacer');
      }
      if (!elementContainer)
        elementContainer = sl.up('tr');
      elementContainer.removeClassName('is-prefilled');
      elementContainer.removeClassName('is-required');
      elementContainer.removeClassName('is-filled');
      elementContainer.addClassName(newFieldClassName);
    }
    if (oldClass != newClass)
      sl.setAttribute("oclass", oldClass);
    this.debounceMandatoryChanged();
  },
  getHelpTextControl: function(variableName) {
    var ge = this.getSCUIElement(variableName);
    if (!ge)
      return null;
    return ge.getHelpTextControl();
  },
  onSubmit: function(skipMandatory) {
    var action = this.getActionName();
    if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete')
      return true;
    var rc = true;
    if (!skipMandatory)
      rc = this.mandatoryCheck();
    rc = rc && this.validate();
    return rc;
  },
  flashTab: function(tabElem, flash) {
    if (flash) {
      var touchScroll = $$("div.touch_scroll");
      if (touchScroll.size() > 0) {} else
        scrollTo(0, 0);
      var interval;
      var count = 0;
      var flip = false;
      interval = setInterval(function() {
        if (count > 4) {
          clearInterval(interval);
        } else {
          if (flip)
            tabElem.addClassName("tab_flash");
          else
            tabElem.removeClassName("tab_flash");
          count++;
          flip = !flip;
        }
      }, 500);
    }
  },
  firstRunComplete: false,
  completeTabs: "",
  incompleteTabs: "",
  removeTab: function(tabs, id) {
    var newTabs = '';
    var parts = tabs.split(",");
    for (var i = 0; i < parts.length; i++)
      if (parts[i] != id) {
        if (newTabs.length > 0)
          newTabs += ',';
        newTabs += parts[i];
      }
    return newTabs;
  },
  addCompleteTab: function(id) {
    if (this.completeTabs.indexOf(id) < 0) {
      if (this.completeTabs.length > 0)
        this.completeTabs += ",";
      this.completeTabs += id;
    }
    this.incompleteTabs = this.removeTab(this.incompleteTabs, id);
  },
  addIncompleteTab: function(id) {
    if (this.incompleteTabs.indexOf(id) < 0) {
      if (this.incompleteTabs.length > 0)
        this.incompleteTabs += ',';
      this.incompleteTabs += id;
    }
    this.completeTabs = this.removeTab(this.completeTabs, id);
  },
  getCompleteTabs: function() {
    return this.completeTabs || '';
  },
  getIncompleteTabs: function() {
    return this.incompleteTabs || '';
  },
  setCompleteTabs: function(val) {
    this.completeTabs = val || '';
  },
  setIncompleteTabs: function(val) {
    this.incompleteTabs = val || '';
  },
  checkTabForms: function(flash) {
    var rc = true;
    if (typeof tab_frames != "undefined") {
      for (var i = 0; i < tab_frames.length; i++) {
        var fr = tab_frames[i];
        var tabElem = $("tab_ref_" + fr);
        var result = false;
        if (this.completeTabs.indexOf(fr) > -1)
          result = true;
        else if (this.incompleteTabs.indexOf(fr) > -1)
          result = false;
        else {
          var frame = $("item_frame_" + fr);
          if (frame) {
            var form = frame.contentWindow.g_form;
            result = form.mandatoryCheck(true, false);
          }
        }
        if (result) {
          this.addCompleteTab(fr);
          tabElem.removeClassName("is-required");
          tabElem.firstDescendant().addClassName("not_mandatory");
          tabElem.firstDescendant().removeClassName("mandatory");
        } else {
          this.addIncompleteTab(fr);
          tabElem.addClassName("is-required");
          tabElem.firstDescendant().addClassName("mandatory");
          tabElem.firstDescendant().removeClassName("not_mandatory");
          rc = false;
          this.flashTab(tabElem, flash);
        }
      }
      if (rc == false && this.firstRunComplete) {
        g_form.addErrorMessage(getMessage('There are tabs containing mandatory fields that are not filled in'));
      }
      this.firstRunComplete = true;
    }
    return rc;
  },
  _isCheckboxGroupMandatory: function(fieldName, visitedFields) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'checkbox')
      return this._isCheckboxGroupMandatory(ge.getParentContainerId(), visitedFields);
    else {
      var children = ge.getChildren();
      if (visitedFields) {
        visitedFields.push(ge.getID());
        children.forEach(function(child) {
          visitedFields.push(child);
        });
      }
      var containsMandatoryCheckbox = false
      for (var i = 0; i < children.length; i++) {
        var childGe = this.getSCUIElement(children[i]);
        if (!childGe)
          continue;
        if (childGe.isMandatory())
          containsMandatoryCheckbox = true;
        if (childGe.isChecked())
          return false;
      }
      return containsMandatoryCheckbox;
    }
  },
  mandatoryCheck: function(isHiddenForm, checkFrames) {
    if (!this.checkMandatory)
      return true;
    $(document.body).addClassName('form-submitted');
    var fa = this.elements;
    var rc = true;
    var fc = true;
    var ic = true;
    if (checkFrames)
      fc = this.checkTabForms(true);
    var incompleteFields = new Array();
    var invalidFields = new Array();
    var visitedFields = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      if (ed.type == "container")
        continue;
      if (ed.type == "masked") {
        var display = $('sys_display.' + ed.fieldName);
        var displayConfirm = $('sys_display_confirm.' + ed.fieldName);
        if (displayConfirm && display.value != displayConfirm.value) {
          ic = false;
          var widgetLabel = this.getLabelOf(ed.fieldName);
          var shortLabel = trim(widgetLabel + '');
          incompleteFields.push(shortLabel);
          continue;
        }
      }
      if (!this.isMandatory(ed.fieldName) || visitedFields.indexOf(ed.fieldName) != -1)
        continue;
      var widget = this.getControl(ed.fieldName);
      if (!widget)
        continue;
      var widgetValue = this.getValue(ed.fieldName);
      if ((this._isCheckbox(ed.fieldName) && this._isCheckboxGroupMandatory(ed.fieldName, visitedFields)) || this._isFieldValueBlank(ed.fieldName, widgetValue)) {
        var rowWidget = gel('sys_row');
        var row = 0;
        if (rowWidget)
          row = parseInt(rowWidget.value);
        if (row != -1) {
          if (this.mandatory == false) {
            widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
            widget = gel(widgetName);
            if (widget) {
              widgetValue = widget.value;
              if (widgetValue == null || widgetValue.blank())
                continue;
            }
          }
        }
        rc = false;
        var tryLabel = false;
        try {
          if (!isHiddenForm)
            widget.focus();
        } catch (e) {
          tryLabel = true;
        }
        if (tryLabel) {
          var displayWidget = this.getDisplayBox(ed.fieldName);
          if (displayWidget) {
            try {
              if (!isHiddenForm)
                displayWidget.focus();
            } catch (exception) {}
          }
        }
        var realName = this.resolveNameMap(ed.fieldName);
        var widgetLabel = this.getLabelOf(ed.fieldName);
        var shortLabel = trim(widgetLabel + '');
        invalidFields.push(shortLabel);
        labels.push('label_' + realName);
      }
    }
    var alertText1 = "";
    var alertText2 = "";
    if (!rc && !isHiddenForm)
      alertText1 = new GwtMessage().getMessage('The following mandatory fields are not filled in: {0}', invalidFields.join(', '));
    if (!ic && !isHiddenForm)
      alertText2 = new GwtMessage().getMessage('The following masked fields do not match: {0}', incompleteFields.join(', '));
    if (alertText1 != "" || alertText2 != "") {
      try {
        g_form.addErrorMessage(alertText1 + " " + alertText2);
      } catch (e) {}
    }
    if (!isHiddenForm) {
      for (var x = 0; x < labels.length; x++) {
        this.flash(labels[x], "#FFFACD", 0);
      }
    }
    return rc && fc && ic;
  },
  getControls: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    return document.getElementsByName(widgetName);
  },
  getControl: function(fieldName) {
    var ge = this.getSCUIElement(fieldName);
    if (!ge)
      return gel(fieldName);
    return ge.getElement();
  },
  validate: function() {
    var fa = this.elements;
    var rc = true;
    var invalid = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      var widgetName = 'label_' + ed.fieldName;
      var widget = this.getControl(ed.fieldName);
      if (widget) {
        var widgetValue = widget.value;
        var validator = this.validators[ed.type];
        if (validator) {
          var isValid = validator.call(this, widgetValue);
          if (typeof isValid != 'undefined' && isValid != true) {
            if (labels.length == 0)
              widget.focus();
            var widgetLabel = this.getLabelOf(ed.fieldName);
            invalid.push(widgetLabel);
            labels.push(widgetName);
            rc = false;
          }
        }
        if (ed.type == 'reference' && ed.isInvalid) {
          var widgetLabel = this.getLabelOf(ed.fieldName);
          invalid.push(widgetLabel);
          labels.push(widgetName);
          rc = false;
        }
      }
    }
    var theText = invalid.join(', ');
    theText = new GwtMessage().getMessage('The following fields contain invalid text: {0}', theText);
    if (!rc)
      g_form.addErrorMessage(theText);
    for (var x = 0; x < labels.length; x++) {
      this.flash(labels[x], "#FFFACD", 0);
    }
    return rc;
  },
  setValue: function(fieldName, value, displayValue, noOnChange) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var scElement = this.getSCUIElement(fieldName);
    if (!scElement || !scElement.getElement())
      return;
    var previousInternalChangeValue = this._internalChange;
    this._internalChange = true;
    var oldValue = this.getValue(fieldName);
    this.secretSetValue(fieldName, value, displayValue);
    var control = this.getControl(fieldName);
    if (control !== null) {
      if (!noOnChange)
        triggerEvent(control, 'change');
      switch (scElement.type) {
        case "html":
          this._setValue(fieldName, value, displayValue);
          break;
        case "checkbox":
        case "radio":
          if (!noOnChange)
            variableOnChange(scElement.id);
          break;
        case "textarea":
          $(control).fire('autosize.resize');
          break;
      }
      this._opticsInspectorLog(fieldName, oldValue);
    }
    this._internalChange = previousInternalChangeValue;
  },
  getNiBox: function(fieldName) {
    var scEle = this.getSCUIElement(fieldName);
    if (!scEle || !scEle.getElement())
      return null;
    return scEle.getNiBox();
  },
  getDisplayBox: function(fieldName) {
    var scEle = this.getSCUIElement(fieldName);
    if (!scEle || !scEle.getElement())
      return null;
    return scEle.getDisplayBox();
  },
  secretSetValue: function(fieldName, value, displayValue) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    if (this.catalogSetValue(fieldName, value, displayValue))
      return;
    var ge = this.getGlideUIElement(fieldName);
    if (!ge || !this.getControl(fieldName))
      return;
    if (ge.type == 'masked') {
      this._setValueForMasked(fieldName, value, displayValue);
      return;
    }
    var control = this.getControl(fieldName);
    var readOnlyField = gel('sys_readonly.' + control.id);
    if (readOnlyField) {
      readOnlyField.innerHTML = displayValue;
    } else {
      readOnlyField = gel(control.id + "_label");
      if (readOnlyField) {
        readOnlyField.value = displayValue;
      }
    }
    var scElement = this.getSCUIElement(fieldName);
    if (!scElement)
      return;
    if (scElement.type == 'checkbox') {
      scElement.setChecked(this._getBooleanValue(value));
      return;
    }
    if (control.options) {
      var options = control.options;
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value == value) {
          control.selectedIndex = i;
          break;
        }
      }
    } else if (control.type == 'hidden') {
      if ((scElement.type == 'glide_duration') || (scElement.type == 'glide_list') || scElement.type == 'sc_multi_row') {
        if (scElement.id && g_form.elementHandlers[scElement.id] && (typeof g_form.elementHandlers[scElement.id].setValue == "function"))
          g_form.elementHandlers[scElement.id].setValue(value, displayValue);
        return;
      }
      if (scElement.type == 'list_collector' && value == "") {
        var name = resolvePrettyNameMap(fieldName);
        var prettyName = this.removeVariablesPrefix(name);
        scElement.listCollectorClearValue(prettyName);
        return;
      }
      var displaybox = scElement.getDisplayBox();
      if (!displaybox)
        return;
      if (typeof(displayValue) != 'undefined') {
        control.value = value;
        displaybox.value = displayValue;
        removeClassName(displaybox, 'ref_invalid');
        refFlipImage(displaybox, control.id);
        updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
        return;
      }
      control.value = value;
      if (value == null || value == '') {
        displaybox.value = '';
        removeClassName(displaybox, 'ref_invalid');
        ge.isInvalid = false;
        refFlipImage(displaybox, control.id);
        return;
      }
      if (scElement.type != 'reference')
        return;
      displayValue = scElement.getDisplayValue(value);
      displaybox.value = displayValue;
      refFlipImage(displaybox, scElement.getID());
      updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
    } else
      control.value = value;
  },
  catalogSetValue: function(fieldName, value, displayValue) {
    var scEle = this.getSCUIElement(fieldName);
    if (!scEle)
      return false;
    if (scEle.type != 'radio')
      return false;
    var possibles = scEle.getOptions();
    for (var x = 0; x < possibles.length; x++) {
      if (possibles[x].value == value) {
        possibles[x].checked = true;
      } else
        possibles[x].checked = false;
    }
    return true;
  },
  getGlideUIElement: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    for (var x = 0; x < this.elements.length; x++) {
      var thisElement = this.elements[x];
      if (thisElement.fieldName == fieldName)
        return thisElement;
    }
  },
  getReference: function(fieldName, callback) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var ed = this.getSCUIElement(fieldName);
    if (!ed)
      return;
    if (ed.type != 'reference')
      return;
    var value = this.getValue(fieldName);
    return ed.getReference(value, callback);
  },
  hasPricingImplications: function(fieldName) {
    var ed = this.getSCUIElement(fieldName);
    if (ed && ed.attributes == 'priceCheck')
      return true;
    return false;
  },
  submit: function() {
    var theText = getMessage('The g_form.submit function has no meaning on a catlog item. Perhaps you mean g_form.addToCart() or g_form.orderNow() instead');
    g_form.addErrorMessage(theText);
    return;
  },
  flash: function(widgetName, color, count) {
    var row = null;
    var labels = [];
    var widget = gel(widgetName);
    if (widget)
      widget = widget.firstChild;
    else
      return;
    labels.push(widget);
    count = count + 1;
    var originalColor = widget.style.backgroundColor;
    for (var x = 0; x < labels.length; x++) {
      widget = labels[x];
      if (widget) {
        originalColor = widget.style.backgroundColor;
        widget.style.backgroundColor = color;
      }
    }
    if (count < 4) {
      if (widgetName.startsWith('label_ni.VE'))
        setTimeout('g_sc_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
      else
        setTimeout('g_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
    }
  },
  serialize: function(filterFunc) {
    if (typeof(g_cart) == 'undefined')
      g_cart = new SCCart();
    var cart = g_cart;
    var item = gel('sysparm_id');
    if (!item)
      item = gel('current_item');
    if (item)
      item = item.value;
    else
      item = 'none';
    var url = cart.generatePostString() + "&sysparm_id=" + encodeURIComponent(item);
    return url;
  },
  serializeChanged: function() {
    return this.serialize();
  },
  addToCart: function() {
    if (typeof(addToCart) == 'function')
      addToCart();
    else {
      var theText = getMessage('The add to cart function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  orderNow: function() {
    if (typeof(orderNow) == 'function')
      orderNow();
    else {
      var theText = getMessage('The order now function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  addCatalogSubmit: function(handler) {
    this.onCatalogSubmit.push(handler);
  },
  callCatalogSubmitHandlers: function() {
    for (var x = 0; x < this.onCatalogSubmit.length; x++) {
      var handler = this.onCatalogSubmit[x];
      var formFuncCalled = false;
      try {
        CustomEvent.fire('glide_optics_inspect_put_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncCalled = true;
        var returnvalue = handler.call(this);
        formFuncCalled = false;
        CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        if (returnvalue == false)
          return false;
      } catch (ex) {
        if (formFuncCalled)
          CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncError("onSubmit", func, ex);
        return false;
      }
    }
    return true;
  },
  catalogOnSubmit: function(ignoreFrames) {
    var rc = this.mandatoryCheck(false, !ignoreFrames);
    rc = rc && this.callCatalogSubmitHandlers() && this.onSubmit(true);
    return rc;
  },
  isRadioControl: function(fieldName) {
    var scEle = this.getSCUIElement(fieldName);
    if (scEle)
      return (scEle.type == 'radio');
    return false;
  },
  getRadioControlCheckedValue: function(fieldName) {
    var scEle = this.getSCUIElement(fieldName);
    if (!scEle)
      return "";
    return scEle.getValue();
  },
  getValue: function(fieldName) {
    if (this.isRadioControl(fieldName))
      return this.getRadioControlCheckedValue(fieldName);
    else if (this._isTinyMCEControl(fieldName))
      return this._getTinyMCEControlValue(fieldName);
    else {
      fieldName = this.removeCurrentPrefix(fieldName);
      var ge = this.getSCUIElement(fieldName);
      if (ge) {
        if (ge.type == "container" || ge.type == "checkbox_label")
          return "";
      }
      var control = this.getControl(fieldName);
      if (!control)
        return '';
      return GlideForm.prototype._getValueFromControl.call(this, control);
    }
  },
  getAppliedFieldName: function(fieldName) {
    return this._getAppliedFieldName(fieldName);
  },
  getUniqueValue: function() {
    var elem = gel('sysparm_id') || gel('sysparm_active');
    if (elem)
      return elem.value;
    else
      return "";
  },
  _setContainerReadonly: function(ge, disabled) {
    var children = ge.getChildren();
    for (var i = 0; i < children.length; i++) {
      var childGe = this.getSCUIElement(children[i]);
      if (!childGe)
        continue;
      if (childGe.type == 'checkbox_label') {
        var checkboxes = childGe.getChildren();
        for (var j = 0; j < checkboxes.length; j++) {
          this.setReadOnly(checkboxes[j], disabled);
        }
      } else
        this.setReadOnly(children[i], disabled);
    }
  },
  _setReadonly: function(fieldName, disabled, isMandatory, fieldValue) {
    var platformCalled = false;
    disabled = this._getBooleanValue(disabled);
    isMandatory = this._getBooleanValue(isMandatory);
    fieldName = this.removeCurrentPrefix(fieldName);
    var s = this.tableName + '.' + fieldName;
    var ge = this.getSCUIElement(fieldName);
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'label' || ge.type == 'checkbox_label')) {
      opticsLog(this.getTableName(), fieldName, "Readonly can't be set on " + ge.type + " variable");
      return;
    }
    if (!ge || !ge.getElement()) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's ReadOnly to " + disabled);
      return;
    }
    if (ge.type == 'container') {
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Readonly ' + disabled + " on container " + g_form.resolveLabelNameMap(ge.id));
      this._setContainerReadonly(ge, disabled);
      CustomEvent.fire('glide_optics_inspect_pop_context');
      return;
    }
    if (disabled == (this.isReadOnly(ge, ge.getElement()) ||
        (ge.type == "radio" && ge.isReadOnly())))
      return;
    var control = ge.getElement();
    var lookup = gel('lookup.' + control.id);
    if (lookup)
      s = control.id;
    if (ge) {
      if (ge.type == "masked") {
        s = control.id;
        var confirmRow = $('sys_display.' + s + '.confirm_row');
        if (confirmRow) {
          if (disabled && (!isMandatory || fieldValue != ''))
            this._hideIfPresent(confirmRow);
          else
            this._showIfPresent(confirmRow);
        }
      }
      if (ge.type == 'reference') {
        if (lookup && disabled && (!isMandatory || fieldValue != ''))
          this._hideIfPresent(lookup);
        else if (lookup && !disabled)
          this._showIfPresent(lookup);
      }
      var processed = false;
      if (ge.type == 'radio') {
        var scEle = this.getSCUIElement(fieldName);
        if (!scEle)
          return;
        var possibles = scEle.getOptions();
        for (var k = 0; k < possibles.length; k++) {
          if (possibles[k].type == "radio") {
            GlideForm.prototype._setReadonly0.call(this, this.getGlideUIElement(fieldName), possibles[k], s, fieldName, disabled, isMandatory, fieldValue);
            if (!(disabled && isMandatory && fieldValue == '') && !(possibles[k].getAttribute('gsftlocked') == 'true')) {
              if (!(isSafari || isChrome) && disabled)
                possibles[k].setAttribute("disabled", "true");
              else if (!(isSafari || isChrome) && !disabled)
                possibles[k].removeAttribute("disabled");
            }
            processed = true;
            platformCalled = true;
          }
        }
        scEle.readonly = disabled;
      }
      if (ge.type == "glide_list") {
        this._processReadOnlyGlideListVariable(control, fieldName, disabled, isMandatory, fieldValue);
        processed = true;
      }
      if (disabled && isMandatory) {
        if ((this._isCheckbox(fieldName) && fieldValue == 'false') ||
          this._isFieldValueBlank(fieldName, fieldValue)) {
          opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field's ReadOnly to " + disabled);
          return;
        }
      }
      var dataType = control.getAttribute("data-type");
      if (dataType == 'duration' || dataType == 'sc_multi_row') {
        if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setReadOnly == "function"))
          g_form.elementHandlers[control.id].setReadOnly(disabled);
        return;
      }
      if (!processed) {
        GlideForm.prototype._setReadonly0.call(this, this.getGlideUIElement(fieldName), control, s, fieldName, disabled, isMandatory, fieldValue);
        platformCalled = true;
      }
      if (ge.type == "glide_date")
        this._displayDateSelector(control, !disabled);
      if (ge.type == "glide_date_time")
        this._displayDateSelector(control, !disabled);
      if (ge.type == 'sc_email') {
        var selector = $$('a[data-ref="' + control.id + '"]');
        if (selector)
          selector.invoke('writeAttribute', 'disabled', disabled);
      }
    }
    if (this._formExists()) {
      var df = g_form.disabledFields.length;
      g_form.disabledFields[df] = control;
    }
    if (control.getAttribute('slush') == 'true')
      this._processReadOnlySlush(control, fieldName, disabled);
    if (!platformCalled)
      opticsLog(this.getTableName(), fieldName, "ReadOnly set to " + disabled);
  },
  _displayDateSelector: function(control, display) {
    var selectId = "ni." + control.id + ".ui_policy_sensitive";
    if ($(selectId)) {
      if (this._isDoctypeMode())
        if (display)
          $(selectId).writeAttribute("disabled", false);
        else
          $(selectId).writeAttribute("disabled", true);
      else
      if (display)
        this._showIfPresent(selectId);
      else
        this._hideIfPresent(selectId);
    }
  },
  _getAppliedFieldName: function(fieldName) {
    for (var i = 0; i < this.nameMap.length; i++) {
      if (this.nameMap[i].prettyName == fieldName)
        return this.nameMap[i].realName;
      else if (this.nameMap[i].realName == fieldName)
        return this.nameMap[i].prettyName;
    }
    return fieldName;
  },
  _processReadOnlyGlideListVariable: function(control, fieldName, disabled, isMandatory, fieldValue) {
    var name = control.id;
    var element = gel(name + "_unlock");
    if (!element)
      return;
    if (disabled && (!isMandatory || fieldValue != '')) {
      control.setAttribute("readonly", "readonly");
      lock(element, name, name + '_edit', name + '_nonedit', 'select_0' + name, name + '_nonedit');
      hideObject(element);
      var addMe = $("add_me_locked." + name)
      if (addMe)
        addMe.hide();
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    } else if (!disabled) {
      showObjectInlineBlock(element);
      toggleAddMe(name);
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    }
  },
  _processReadOnlySlush: function(control, fieldName, disabled) {
    if (!$(fieldName + "_select_1"))
      fieldName = this._getAppliedFieldName(fieldName);
    var leftOptionList = fieldName + "_select_0";
    var rightOptionList = fieldName + "_select_1";
    var recordPreviewTable = fieldName + 'recordpreview';
    var noFilter = control.getAttribute("nofilter");
    if (disabled) {
      this._unselectOptions(leftOptionList);
      var selectedRightOption = this._selectedOption(rightOptionList);
      if (selectedRightOption && typeof(selectedRightOption.value) != 'undefined' &&
        selectedRightOption.value != null &&
        selectedRightOption.value != '' &&
        selectedRightOption.value != '--None--') {
        showSelected(
          gel(rightOptionList),
          recordPreviewTable,
          this._retrieveTableName(fieldName));
      } else {
        this._hideIfPresent(recordPreviewTable);
      }
      $(rightOptionList).ondblclickOLD = $(rightOptionList).ondblclick;
      $(rightOptionList).ondblclick = "";
      this._hideIfPresent(leftOptionList);
      this._hideIfPresent(leftOptionList + "_title_row");
      this._hideIfPresent(leftOptionList + "_filter_row");
      this._hideIfPresent(leftOptionList + "_filters_row");
      this._hideIfPresent(leftOptionList + "_search_row");
      this._hideIfPresent(rightOptionList + "_search_row");
      this._hideIfPresent(leftOptionList + "_add_remove_container");
      this._hideIfPresent(leftOptionList + "_add_remove_message_table");
      this._hideDoctypeSlushBucket(fieldName);
    } else {
      if ($(fieldName + "_select_1").ondblclickOLD)
        $(fieldName + "_select_1").ondblclick = $(fieldName + "_select_1").ondblclickOLD;
      this._showIfPresent(recordPreviewTable);
      this._showIfPresent(leftOptionList);
      this._showIfPresent(leftOptionList + "_title_row");
      if (noFilter != "true") {
        this._showIfPresent(leftOptionList + "_filter_row");
        this._showIfPresent(leftOptionList + "_filters_row");
      }
      this._showIfPresent(leftOptionList + "_search_row");
      this._showIfPresent(rightOptionList + "_search_row");
      this._showIfPresent(leftOptionList + "_add_remove_container");
      this._showIfPresent(leftOptionList + "_add_remove_message_table");
      this._showDoctypeSlushBucket(fieldName);
    }
  },
  _retrieveTableName: function(fieldName) {
    var relatedTableNameFunction = fieldName +
      '_getMTOMRelatedTable();';
    var relatedTableNameDotFieldName = eval(relatedTableNameFunction);
    var tableName = relatedTableNameDotFieldName.split('.')[0];
    return tableName;
  },
  _selectedOption: function(optionsArray) {
    var selectedOption;
    var selectedOptionIndex = gel(optionsArray).selectedIndex;
    var cssOptionsSelector = '#' + optionsArray + ' option';
    if (selectedOptionIndex == -1 && $$(cssOptionsSelector)[0]) {
      selectedOption = $$(cssOptionsSelector)[0];
      selectedOption.selected = true;
      gel(optionsArray).selectedIndex = 0;
    } else {
      selectedOption = $$(cssOptionsSelector)[selectedOptionIndex];
    }
    return selectedOption;
  },
  _unselectOptions: function(optionsArray) {
    var cssOptionsSelector = '#' + optionsArray + ' option';
    var optionsArray = $$(cssOptionsSelector).each(function(ele, i) {
      return $(ele).selected = false;
    });
    gel(optionsArray).selectedIndex = -1;
  },
  _hideIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.hide(elem);
  },
  _getTinyMCEControlValue: function(fieldName) {
    if (this._isTinyMCEIncluded()) {
      var tinymceElement = tinymce.get(fieldName);
      if (tinymceElement && tinymceElement.initialized) {
        var value = tinymceElement.getContent({
          format: 'html'
        });
        if (value.indexOf('<body') == 0)
          return value.substring(value.indexOf('>') + 1).replace('</body>', '');
        else
          return value;
      }
    }
    return "";
  },
  _isTinyMCEIncluded: function() {
    return !!(typeof tinymce !== 'undefined' && tinymce !== undefined && tinymce !== null && tinymce);
  },
  _isTinyMCEControl: function(fieldName) {
    if (!this._isTinyMCEIncluded())
      return false;
    var tinymceElement = tinymce.get(fieldName);
    return !!(tinymceElement !== undefined && tinymceElement !== null && tinymceElement);
  },
  _isDoctypeMode: function() {
    if (typeof this.cachedDoctypeMode == 'undefined')
      !!(this.cachedDoctypeMode = (document.documentElement.getAttribute('data-doctype') == 'true'));
    return !!(this.cachedDoctypeMode);
  },
  _showIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.show(elem);
  },
  _formExists: function() {
    if (typeof g_form == 'undefined')
      return false;
    if (typeof g_sc_form == 'undefined')
      return false;
    return g_form != g_sc_form;
  },
  _hideDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].hide();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].hide();
          }
        }
      }
    }
  },
  _showDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].show();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].show();
          }
        }
      }
    }
  },
  refreshSlushbucket: function(fieldName) {
    var control = this.getControl(fieldName);
    if (control.getAttribute('slush') == 'true') {
      var fnName = fieldName;
      if (fnName.startsWith('variables.'))
        fnName = fnName.substring(10);
      else if (fnName.startsWith('variable_pool.'))
        fnName = fnName.substring(14);
      fnName += 'acRequest';
      if (typeof window[fnName] == 'function')
        window[fnName](null);
      else
        jslog("Ajaxcompleter for the variable, " + fieldName + ", was not found");
    }
  },
  _getFieldTR: function(control_name) {
    var ge = this.getSCUIElement(control_name);
    if (ge)
      return ge.getElementParentNode();
    return null;
  },
  isDisplayNone: function(ge, control) {
    var control_name = "";
    if (ge)
      control_name = ge.fieldName;
    if (!control_name && control)
      control_name = control.name;
    if (!control_name)
      return false;
    var ge = this.getSCUIElement(control_name);
    if (ge && !ge.isVisible())
      return true;
    if (ge && ge.getParentContainerId() && this._isParentDisplayNone(ge.getParentContainerId()))
      return true;
    return false;
  },
  _isParentDisplayNone: function(parentContainerId) {
    var ge = this.getSCUIElement(parentContainerId);
    while (ge) {
      if (!ge.isVisible())
        return true;
      ge = this.getSCUIElement(ge.getParentContainerId());
      if (!ge)
        break;
    }
    return false;
  },
  _reParentCatalogVariableElements: function() {
    var scUIElements = this.getSCUIElements();
    for (var i = 0; i < scUIElements.length; i++) {
      var ge = scUIElements[i];
      if (ge.type == "checkbox_label" || ge.type == "container") {
        var children = ge.getChildren();
        for (var j = 0; j < children.length; j++) {
          var child = this.getSCUIElement(children[j]);
          if (child)
            child.setParentContainerId(ge.getID());
        }
      }
    }
  },
  isEditableField: function(ge, control) {
    if (ge) {
      if (ge.type == 'formatter' || ge.type == 'page' ||
        ge.type == 'macro' || ge.type == 'container' ||
        ge.type == 'checkbox_label' ||
        ge.type == 'checkbox_container' || ge.type == 'label')
        return false;
    }
    if (!this.isVisible(ge, control))
      return false;
    if (this.isReadOnly(ge, control))
      return false;
    if (this.isDisplayNone(ge, control))
      return false;
    return true;
  },
  getRollbackContextId: function() {
    return this.rollbackContextId;
  },
  setRollbackContextId: function(rollbackContextId) {
    this.rollbackContextId = rollbackContextId;
  }
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableUIElement.js */
var SCVariableUIElement = Class.create(GlideUIElement, {
  NIBOX: "nibox",
  DISPLAY_BOX: "display_box",
  initialize: function(tableName, fieldName, type, mandatory, reference, attributes, scope, id) {
    GlideUIElement.prototype.initialize.call(this, tableName, fieldName, type, mandatory, reference, attributes, scope);
    this.ENABLE_CHILD_WALKING = true;
    this.parentContainerId = "";
    this.cache_nodes = true;
    this.id = id;
  },
  getID: function() {
    return this.id;
  },
  setNamerPrefix: function(prefix) {
    this.namerPrefix = prefix;
  },
  setParentContainerId: function(id) {
    if (id && id.indexOf(this.namerPrefix) !== 0)
      id = this.namerPrefix + id;
    this.parentContainerId = id;
  },
  getChildElementById: function(id) {
    if (this.cache_nodes && this.fetchedNodes[id])
      return this.fetchedNodes[id];
    var element = this.getChildElementById0(id);
    if (!element)
      element = gel('sys_original.' + id);
    if (element)
      this.fetchedNodes[id] = element;
    return element;
  },
  getElementParentNode: function() {
    if (!this.elementFetched) {
      this.elementParentNode = gel('element.' + this.getID());
      if (!this.elementParentNode) {
        this.elementParentNode = gel(this.getID() + "_read_only");
        if (this.elementParentNode)
          this.isReadonlyField = true;
      }
      this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  getParentContainerId: function() {
    if (!this.parentContainerId) {
      var tr = this.getElementParentNode();
      if (tr && tr.hasAttribute("parent_container_id")) {
        this.parent_container_fetched = true;
        this.parentContainerId = tr.getAttribute("parent_container_id");
      }
    }
    return this.parentContainerId || "";
  },
  getElementControl: function() {
    if (this.fetchedNodes.control)
      return fetchedNodes.control;
  },
  setElementControl: function(controlEle) {
    this.fetchedNodes.control = controlEle;
  },
  getLabel: function() {
    var labelEle = this.getChildElementById('label_' + this.getID());
    if (labelEle) {
      var text = '';
      if (label.firstChild) {
        if (label.firstChild.innerText)
          text = label.firstChild.innerText;
        else if (label.firstChild.textContent)
          text = label.firstChild.textContent;
        else if (label.firstChild.innerHTML)
          text = label.firstChild.innerHTML;
        else
          text = '';
      }
      return text;
    }
    return "";
  },
  getHelpTextControl: function() {
    var id = this.getID();
    if (id.indexOf(".") > -1)
      id = id.replace('.', '_');
    else if (id.indexOf(":") > -1)
      id = id.replace(":", "_");
    var ele = this.getChildElementById('question_help_' + id + '_toggle_value');
    return ele;
  },
  getNiBox: function() {
    if (this.fetchedNodes[this.NIBOX])
      return this.fetchedNodes[this.NIBOX];
    var niBox = gel(this.getID());
    this.fetchedNodes = niBox;
    return niBox;
  },
  getDisplayBox: function() {
    if (this.fetchedNodes[this.DISPLAY_BOX])
      return this.fetchedNodes[this.DISPLAY_BOX];
    var dBox = gel('sys_display.' + this.getID());
    this.fetchedNodes[this.DISPLAY_BOX] = dBox;
    return dBox;
  },
  getOriginalControlElement: function() {
    return this.getChildElementById("sys_original." + this.getID());
  },
  isVisible: function() {
    var displayNode = this.getElementParentNode();
    if (!displayNode) {
      jslog("Cannot find parent element with id: " + this.getID());
      return false;
    }
    return (displayNode.style.display != 'none' && displayNode.style.visibility != 'hidden');
  },
  isFieldValueBlank: function() {
    var control = this.getElement();
    if (!control)
      return true;
    return control.value.blank();
  },
  hasValue: function() {
    return this.isFieldValueBlank();
  },
  isReadOnly: function() {
    if (this.isReadonlyField)
      return true;
    var ele = this.getElement();
    return ele.hasAttribute("readonly") || ele.hasAttribute("disabled");
  },
  isReadonly: function() {
    return this.isReadOnly();
  },
  getStatusTooltipElement: function() {
    return this.getChildElementById('status.button.' + this.getID());
  },
  type: 'SCVariableUIElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableCheckboxElement.js */
var SCVariableCheckboxElement = Class.create(SCVariableUIElement, {
  PARENT_CHECKBOX_CONTAINER: "parent_checkbox_container",
  MANDATORY_CHECKBOX_ELEMENT: "mandatory_checkbox_element",
  initialize: function() {
    SCVariableUIElement.prototype.initialize.apply(this, arguments);
    this.type = "checkbox";
    this.containerId = "";
  },
  setContainerId: function(container_id) {
    this.containerId = container_id;
  },
  getCheckboxContainerElement: function() {
    if (this.checkboxContainerElement)
      return this.checkboxContainerElement;
    var parentId = this.getParentContainerId();
    var labelControl = gel(parentId);
    if (!labelControl)
      return "";
    if (labelControl.hasAttribute("container_id") && labelControl.getAttribute("container_id")) {
      var containerId = labelControl.getAttribute("container_id");
      this.checkboxContainerElement = gel('element.checkbox_container_' + containerId);
      return this.checkboxContainerElement;
    }
    return "";
  },
  getMandatoryElement: function() {
    if (!this.mandatory_element_fetched) {
      var gsftContainer = this.getElement().getAttribute("gsftContainer");
      this[this.MANDATORY_CHECKBOX_ELEMENT] = gel("variable_" + gsftContainer);
      this.mandatory_element_fetched = true;
    }
    return this[this.MANDATORY_CHECKBOX_ELEMENT];
  },
  getParentContainerId: function() {
    if (this.parentContainerId)
      return this.parentContainerId;
    var element = this.getElement();
    var labelId;
    if (element && element.hasAttribute('gsftContainer'))
      labelId = element.getAttribute('gsftContainer');
    var labelEle = gel(labelId);
    if (!labelEle)
      return "";
    this.parentContainerId = labelId.startsWith(this.namerPrefix) ? labelId : (this.namerPrefix + labelId);
    return this.parentContainerId;
  },
  getElementParentNode: function() {
    if (!this.elementFetched) {
      var controlEle = gel("ni." + this.getID());
      while (controlEle) {
        if (controlEle.className.indexOf("sc_checkbox") > -1)
          break;
        controlEle = controlEle.parentNode;
      }
      if (!controlEle)
        return "";
      this.elementParentNode = controlEle;
      this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  isStandaloneCheckbox: function() {
    if (typeof this.standaloneCheckbox == 'undefined') {
      var control = this.getElement();
      var gsftContainer = control.getAttribute("gsftContainer");
      var labelEle = this.getChildElementById("label_" + gsftContainer);
      if (labelEle)
        this.standaloneCheckbox = false;
      else
        this.standaloneCheckbox = true;
    }
    return this.standaloneCheckbox;
  },
  isFieldValueBlank: function() {
    if (!this.getElement())
      return false;
    var val = "" + this.getElement().value;
    return (val != "true");
  },
  isChecked: function() {
    return !this.isFieldValueBlank();
  },
  getNiBox: function() {
    if (this.fetchedNodes[this.NIBOX])
      return this.fetchedNodes[this.NIBOX];
    var niName = 'ni.' + this.getID();
    var niBox = gel(niName);
    this.fetchedNodes[this.NIBOX] = niBox;
    return niBox;
  },
  getStatusElement: function() {
    var statusEle = this.getChildElementById('status.' + this.getID());
    if (!statusEle)
      statusEle = this.getChildElementById('status.' + this.getElement().getAttribute('gsftContainer'));
    return statusEle;
  },
  setChecked: function(isChecked) {
    var nibox = this.getNiBox(this.id);
    var element = this.getElement();
    if (element)
      element.value = isChecked ? "true" : "false";
    if (nibox)
      nibox.checked = isChecked ? true : null;
    return;
  },
  getStatusTooltipElement: function() {
    var statusEle = this.getChildElementById('status.button.' + this.getID());
    if (!statusEle)
      statusEle = this.getChildElementById('status.button.' + this.getElement().getAttribute('gsftContainer'));
    return statusEle;
  },
  type: 'SCVariableCheckboxElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableContainerElement.js */
var SCVariableContainerElement = Class.create(SCVariableUIElement, {
  initialize: function() {
    SCVariableUIElement.prototype.initialize.apply(this, arguments);
    this.type = "container";
    this.children = [];
  },
  getElementParentNode: function() {
    if (!this.elementFetched) {
      var tr = gel('element.container_' + this.getID());
      if (!tr) {
        var control = gel(this.getID());
        if (!control)
          return;
        var container_id = control.getAttribute("container_id");
        tr = gel('element.container_' + container_id);
      }
      if (!tr) {
        jslog("Couldn't parent node for : " + this.id);
        return "";
      }
      this.elementParentNode = tr;
      this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  getChildren: function() {
    return this.children;
  },
  addChild: function(childId) {
    this.children.push(childId);
  },
  isFieldValueBlank: function() {
    return false;
  },
  isVisible: function() {
    return (this.getElementParentNode().style.display === '');
  },
  isCascadedDisplay: function() {
    return this.getElementParentNode().hasAttribute('cascaded_display');
  },
  type: 'SCVariableContainerElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableCheckboxLabelElement.js */
var SCVariableCheckboxLabelElement = Class.create(SCVariableContainerElement, {
  PARENT_CHECKBOX_CONTAINER: "parent_checkbox_container",
  initialize: function() {
    SCVariableContainerElement.prototype.initialize.apply(this, arguments);
    this.type = "checkbox_label";
    this.containerId = "";
    this.singleCheckbox = false;
  },
  setContainerId: function(container_id) {
    this.containerId = container_id;
  },
  evaluateContainerId: function() {
    var child = this.children[0];
    var childControl = gel(child);
    if (!childControl)
      return;
    var childControlId = childControl.getAttribute("gsftContainer");
    this.gsftContainerId = childControlId;
    var elem = gel('label_' + childControlId);
    if (!elem)
      this.singleCheckbox = true;
    childControl = gel(childControlId);
    if (!childControl)
      return;
    this.containerId = childControl.getAttribute("container_id");
  },
  getMandatoryElement: function() {
    if (!this.mandatory_element_fetched) {
      if (!this.containerId)
        this.evaluateContainerId();
      if (this.singleCheckbox) {
        var mandatoryEle = gel("variable_" + this.gsftContainerId);
        mandatoryElements = mandatoryEle.getElementsByClassName("sc_checkbox");
        if (mandatoryElements && mandatoryElements.length > 0)
          this[this.MANDATORY_CHECKBOX_ELEMENT] = mandatoryElements[0];
      } else
        this[this.MANDATORY_CHECKBOX_ELEMENT] = gel("variable_" + this.getID());
    }
    return this[this.MANDATORY_CHECKBOX_ELEMENT];
  },
  getElementParentNode: function() {
    if (!this.elementFetched) {
      if (!this.containerId)
        this.evaluateContainerId();
      this.elementParentNode = gel('element.checkbox_container_' + this.containerId);
      if (this.elementParentNode)
        this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  getChildren: function() {
    return this.children;
  },
  isReadOnly: function() {
    return true;
  },
  isFieldValueBlank: function() {
    return false;
  },
  type: 'SCVariableCheckboxLabelElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableFormatterElement.js */
var SCVariableFormatterElement = Class.create(SCVariableUIElement, {
  initialize: function(tableName, fieldName, type, mandatory, reference, attributes, scope, id) {
    SCVariableUIElement.prototype.initialize.call(this, tableName, fieldName, type, mandatory, reference, attributes, scope, id);
  },
  isMandatory: function() {
    return false;
  },
  isFieldValueBlank: function() {
    return false;
  },
  type: 'SCVariableFormatterElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableUIMacroElement.js */
var SCVariableUIMacroElement = Class.create(SCVariableUIElement, {
  getElementParentNode: function() {
    if (!this.elementFetched) {
      var id = this.getID();
      if (this.namerPrefix !== "ni.VE")
        id = this.getID().substring(this.namerPrefix.length);
      this.elementParentNode = gel('container_' + id);
      if (!this.elementParentNode)
        return SCVariableUIElement.prototype.getElementParentNode.call(this);
      this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  getNiBox: function() {
    if (this.fetchedNodes[this.NIBOX])
      return this.fetchedNodes[this.NIBOX];
    var niBox = gel('macro_' + this.getID());
    this.fetchedNodes[this.NIBOX] = niBox;
    return niBox;
  },
  getChildElementById0: function(id) {
    return SCVariableUIElement.prototype.getChildElementById0.call(this, 'macro_' + id);
  },
  isMandatory: function() {
    return false;
  },
  isFieldValueBlank: function() {
    return false;
  }
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableRadioElement.js */
var SCVariableRadioElement = Class.create(SCVariableUIElement, {
  cacheOptions: false,
  getOptions: function() {
    if (this.cacheOptions && this.fetchedRadioOptions)
      return this.radioOptions;
    var optionsArr = document.getElementsByName(this.getID());
    this.fetchedRadioOptions = true;
    this.radioOptions = optionsArr;
    return optionsArr;
  },
  getValue: function() {
    var radios = this.getOptions();
    var val = '';
    if (radios.length > 0) {
      if (radios.length == 1 && !radios[0].hasAttribute('checked')) {
        val = radios[0].value;
      } else {
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked)
            val = radios[i].value;
        }
      }
    }
    return val;
  },
  getElement: function() {
    var widget;
    var radios = this.getOptions();
    for (var x = 0; x < radios.length; x++) {
      if (radios[x].checked) {
        widget = radios[x];
        break;
      }
    }
    if (!widget)
      widget = gel('sys_original.' + this.getID());
    return widget;
  },
  isReadOnly: function() {
    if (this.isReadonlyField)
      return true;
    return !!this.readonly;
  }
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableReferenceElement.js */
var SCVariableReferenceElement = Class.create(SCVariableUIElement, {
  getDisplayValue: function(value) {
    if (!value)
      return "";
    var ga = new GlideAjax('AjaxClientHelper');
    ga.addParam('sysparm_name', 'getDisplay');
    ga.addParam('sysparm_table', this.reference);
    ga.addParam('sysparm_value', value);
    ga.getXMLWait();
    return ga.getAnswer();
  },
  getReference: function(value, callback) {
    var gr = new GlideRecord(this.reference);
    if (!value)
      return gr;
    gr.addQuery('sys_id', value);
    if (callback) {
      var fn = function(gr) {
        gr.next();
        callback(gr);
      };
      gr.query(fn);
      return;
    }
    gr.query();
    gr.next();
    return gr;
  },
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableTableVarElement.js */
var SCVariableTableVarElement = Class.create(SCVariableContainerElement, {
  initialize: function() {
    SCVariableContainerElement.prototype.initialize.apply(this, arguments);
    this.type = "sc_table";
  },
  getValue: function() {
    var tableQuestion = window.tableQuestionCache[this.getID()];
    if (tableQuestion)
      return tableQuestion.getValue();
    return "";
  },
  type: 'SCVariableTableVarElement'
});;
/*! RESOURCE: /scripts/classes/catalog/SCVariableListCollectorElement.js */
var SCVariableListCollectorElement = Class.create(SCVariableUIElement, {
  listCollectorClearValue: function(prettyName) {
    var rightSlushbucket = gel(prettyName + "_select_1");
    var leftSlushbucket = gel(prettyName + "_select_0");
    if (rightSlushbucket.options.length > 0) {
      var sourceOptions = rightSlushbucket.options;
      var selectedIds = new Array();
      var index = 0;
      for (var i = 0; i < sourceOptions.length; i++) {
        selectedIds[index] = i;
        index++;
      }
      var label = new GwtMessage().getMessage('--None--');
      moveSelectedOptions(selectedIds, rightSlushbucket, leftSlushbucket, label, null, label, null, null, true);
    }
    return;
  },
});;
/*! RESOURCE: /scripts/classes/catalog/SCUIElementFactory.js */
var SCUIElementFactory = Class.create();
SCUIElementFactory.createUIElement = function(tableName, fieldName, type, mandatory, reference, attributes, scope, id) {
  switch (type) {
    case "boolean":
      return new SCVariableCheckboxElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "checkbox_container":
      return new SCVariableCheckboxLabelElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "container":
      return new SCVariableContainerElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "formatter":
      return new SCVariableFormatterElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "macro":
      return new SCVariableUIMacroElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "reference":
      return new SCVariableReferenceElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "radio":
      return new SCVariableRadioElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "sc_table":
      return new SCVariableTableVarElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    case "list_collector":
      return new SCVariableListCollectorElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
    default:
      return new SCVariableUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope, id);
  }
};;
/*! RESOURCE: /scripts/classes/GwtTable.js */
var GwtTable = Class.create({
  initialize: function(parent) {
    this.type = 'GwtTable';
    this.name = 'GwtTable';
    this.dragger = null;
    this.htmlElement = cel("TABLE");
    this.body = cel("TBODY", this.htmlElement);
    this.row = null;
    if (parent)
      parent.appendChild(this.htmlElement);
  },
  addRow: function() {
    this.row = cel("TR", this.body);
    for (var i = 0; i < arguments.length; i++) {
      var t = arguments[i];
      var td = cel("TD", this.row);
      td.innerHTML = t;
    }
  },
  addRowWithClassName: function() {
    this.row = cel("TR", this.body);
    for (var i = 1; i < arguments.length; i++) {
      var t = arguments[i];
      var td = cel("TD", this.row);
      td.className = arguments[0];
      td.innerHTML = t;
    }
  },
  addTD: function(element) {
    var td = cel("TD", this.row);
    td.appendChild(element);
  },
  addCellsWithClassName: function() {
    for (var i = 1; i < arguments.length; i++) {
      var t = arguments[i];
      var td = cel("TD", this.row);
      td.className = arguments[0];
      td.innerHTML = t;
    }
  },
  setRowClassName: function(className) {
    this.row.className = className;
  },
  addSpanCell: function() {
    var td = cel("TD", this.row);
    td.colSpan = arguments[0]
    return td;
  }
});;
/*! RESOURCE: /scripts/sc_cart.js */
var SCCart = Class.create();
SCCart.prototype = {
  initialize: function() {
    this.htmlElement = null;
    this.fAction = "service_catalog.do";
    this.processor = "com.glideapp.servicecatalog.CartAjaxProcessor";
    this.urlPrefix = "xmlhttp.do?sysparm_processor=" + this.processor;
    this.showCart = true;
    this.enhanceLabels = false;
    this.price_subtotal = 0.0;
    this.recurring_price_subtotal = 0.0;
    this.recurring_frequency_subtotal = "";
  },
  enhanceOptionLabels: function(item) {
    price = new CatalogPricing(item, this);
    price.enhanceLabels();
  },
  attachWindow: function(qtyName, cartName, windowTitle) {
    var w = new GlideWindow('adder', true);
    w.setClassName('sc_cart_window');
    w.setPosition("relative");
    w.setSize(200, 10);
    w.setTitle(windowTitle);
    var qty = gel(qtyName);
    qty.style.display = '';
    w.setBody(qty);
    w.insert(gel(cartName));
    var cartWindow = gel("window.adder");
    if (cartWindow) {
      cartWindow.setAttribute("role", "region");
      cartWindow.setAttribute("aria-label", windowTitle);
    }
  },
  setCartVisible: function(showCart) {
    this.showCart = showCart;
  },
  addCartContent: function() {},
  order: function(item, quantity, sc_cart_item_id, catalog_id, catalog_view, cart_name) {
    this._postAction(null, quantity, item, "order", sc_cart_item_id, catalog_id, catalog_view, cart_name);
  },
  orderUpdate: function(cart_item, quantity) {
    var item_id = gel("sysparm_id").value;
    this._postAction(cart_item, quantity, item_id, "update_proceed");
  },
  add: function(item, quantity, itemId) {
    var url = this.urlPrefix + "&sysparm_action=" + "add" +
      "&sysparm_id=" + item +
      "&sysparm_quantity=" + quantity +
      "&sysparm_item_guid=" + itemId;
    var hint = gel('sysparm_processing_hint');
    if (hint && hint.value)
      url += "&sysparm_processing_hint=" + equalsHtmlToHex(hint.value);
    var special_instructions = gel("sysparm_special_instructions");
    if (special_instructions) {
      special_instructions = special_instructions.value;
      url += '&sysparm_special_instructions=' + special_instructions;
    }
    var location = gel("sysparm_location");
    if (location) {
      location = location.value;
      url += '&sysparm_location=' + location;
    }
    var req_for = gel("sysparm_requested_for");
    if (req_for) {
      req_for = req_for.value;
      url += '&sysparm_requested_for=' + req_for;
    }
    if (g_form) {
      g_form.submitted = true;
      g_form.modified = false;
    }
    var postString = this.generatePostString();
    serverRequestPost(url, postString, this._addResponse.bind(this));
  },
  _addResponse: function(response) {
    CustomEvent.fire("catalog_cart_changed", response);
  },
  generatePostString: function() {
    var postString = "";
    var optionsElements = $(document.body).select(".cat_item_option");
    postString = this.generatePostStringOptions(postString, optionsElements);
    optionsElements = $(document.body).select(".questionSetWidget")
    postString = this.generatePostStringOptions(postString, optionsElements);
    return postString;
  },
  generatePostStringOptions: function(postString, optionsElements) {
    var seq = 0;
    for (i = 0; i < optionsElements.length; i++) {
      var element = optionsElements[i];
      var n = element.name;
      if ("variable_sequence" == n) {
        seq++;
        n = n + seq;
      }
      if (element.type == "radio" && (postString.indexOf(n + '=') == -1)) {
        var selectedEl = $(document.body).querySelector("input[name='" + n + "']:checked");
        var selVal = selectedEl ? selectedEl.value : '';
        postString += n + "=" + encodeURIComponent(selVal) + "&";
        jslog(n + " = " + selVal);
      } else if (element.type != "radio") {
        postString += n + "=" + encodeURIComponent(element.value) + "&";
        jslog(n + " = " + element.value);
      }
    }
    if (window.tableVariableCache) {
      for (var tableVariableId in window.tableVariableCache) {
        var tableVariable = window.tableVariableCache[tableVariableId];
        postString += tableVariable.getNameSpace() + tableVariableId + "=" + encodeURIComponent(tableVariable.serialize()) + "&";
      }
    }
    return postString;
  },
  recalcPrice: function(item, quantity) {
    price = new CatalogPricing(item, this);
    price.refreshCart(quantity, this.enhanceLabels);
  },
  edit: function(cart_item, quantity) {
    var item_id = $F("sysparm_id");
    this._postAction(cart_item, quantity, item_id, "update");
  },
  addAttachment: function(item_sys_id, tableName, allowAttachment) {
    saveAttachment(tableName, item_sys_id, allowAttachment);
  },
  showReferenceForm: function(inputName, tableName) {
    if (!g_form.catalogOnSubmit())
      return;
    var quantity = 1;
    var quan_widget = gel("quantity");
    if (quan_widget)
      quantity = quan_widget.value;
    var item_id = $F("sysparm_id");
    var ref_sys_id = gel(inputName).value;
    var form = this.initForm();
    addInput(form, "HIDDEN", "sysparm_table", tableName);
    addInput(form, "HIDDEN", "sysparm_ref_lookup", ref_sys_id);
    addInput(form, "HIDDEN", "sysparm_action", "show_reference");
    addInput(form, "HIDDEN", "sysparm_quantity", quantity);
    addInput(form, "HIDDEN", "sysparm_id", item_id);
    var hint = gel('sysparm_processing_hint');
    if (hint && hint.value)
      addInput(form, "HIDDEN", "sysparm_processing_hint", hint.value);
    this.addInputToForm(form);
    form.submit();
  },
  _postAction: function(cart_item, quantity, item_id, action, sc_cart_item_id, catalog_id, catalog_view, cart_name) {
    var form = this.initForm();
    addInput(form, "HIDDEN", "sysparm_action", action);
    if (cart_item)
      addInput(form, "HIDDEN", "sysparm_cart_id", cart_item);
    addInput(form, "HIDDEN", "sysparm_quantity", quantity);
    addInput(form, "HIDDEN", "sysparm_id", item_id);
    addInput(form, "HIDDEN", "sysparm_catalog", catalog_id);
    addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
    if (!cart_name)
      cart_name = '';
    addInput(form, "HIDDEN", "sysparm_cart_name", cart_name);
    var hint = gel('sysparm_processing_hint');
    if (hint && hint.value)
      addInput(form, "HIDDEN", "sysparm_processing_hint", hint.value);
    if (sc_cart_item_id)
      addInput(form, "HIDDEN", "sysparm_item_guid", sc_cart_item_id);
    var special_instructions = gel("sysparm_special_instructions");
    if (special_instructions)
      addInput(form, "HIDDEN", "sysparm_special_instructions", special_instructions.value);
    var location = gel("sysparm_location");
    if (location)
      addInput(form, "HIDDEN", "sysparm_location", location.value);
    var req_for = gel("sysparm_requested_for");
    if (req_for)
      addInput(form, "HIDDEN", "sysparm_requested_for", req_for.value);
    this.addInputToForm(form);
    if (g_form) {
      g_form.submitted = true;
      g_form.modified = false;
    }
    form.submit();
  },
  addInputToForm: function(form) {
    jslog("addInputToForm");
    var optionsElements = $(document.body).select(".cat_item_option:not(.ignore)");
    var seq = 0;
    for (i = 0; i < optionsElements.length; i++) {
      var element = optionsElements[i];
      var n = element.name;
      if (n != null && n != "") {
        if ("variable_sequence" == n) {
          seq++;
          n = n + seq;
        }
        if (element.type == "radio") {
          var selectedEl = $(document.body).querySelector("input[name='" + n + "']:checked");
          var selVal = selectedEl ? selectedEl.value : '';
          addInput(form, "HIDDEN", n, selVal);
        } else if (element.type != "radio")
          addInput(form, "HIDDEN", n, element.value);
      }
    }
    if (window.tableVariableCache) {
      for (var tableVariableId in window.tableVariableCache) {
        var tableVariable = window.tableVariableCache[tableVariableId];
        addInput(form, "HIDDEN", tableVariable.getNameSpace() + tableVariableId, tableVariable.serialize());
      }
    }
  },
  getWithBackButton: function() {
    if (!this.showCart)
      return;
    var i = new CartItemList(this);
    i.create();
    i.get();
  },
  getWithoutBackButton: function() {
    if (!this.showCart)
      return;
    var cartItemList = new CartItemList(this);
    cartItemList.create();
    cartItemList.backbutton = false;
    cartItemList.get();
  },
  _changed: function() {
    var args = new Object();
    args['html'] = gel("cart").innerHTML;
    args['window'] = window;
    CustomEvent.fireTop('cart.loaded', args);
  },
  initForm: function() {
    var form = addForm();
    form.action = this.fAction;
    form.name = this.fAction;
    form.id = this.fAction;
    form.method = "POST";
    return form;
  },
  setContentElement: function(htmlElement) {
    this.htmlElement = $(htmlElement);
  },
  setQuantity: function(qty) {
    var quantity_widget = gel("quantity");
    if (quantity_widget) {
      quantity_widget.value = qty;
      quantity.onchange();
    } else
      console.log("Quantity widget not found. Cannot set quantity");
  },
  getQuantity: function() {
    var quantity = 1;
    var quan_widget = gel("quantity");
    if (quan_widget)
      quantity = quan_widget.value;
    return quantity;
  }
};;
/*! RESOURCE: /scripts/section.js */
function expandCollapseAllSections(expandFlag) {
  var spans = document.getElementsByTagName('span');
  for (var i = 0; i < spans.length; i++) {
    if (spans[i].id.substr(0, 8) != "section.")
      continue;
    var id = spans[i].id.substring(8);
    var state = collapsedState(id);
    if (state == expandFlag)
      toggleSectionDisplay(id);
  }
  CustomEvent.fire('toggle.sections', expandFlag);
}

function collapsedState(sectionName) {
  var el = $(sectionName);
  if (el)
    return (el.style.display == "none");
}

function setCollapseAllIcons(action, sectionID) {
  var exp = gel('img.' + sectionID + '_expandall');
  var col = gel('img.' + sectionID + '_collapseall');
  if (!exp || !col)
    return;
  if (action == "expand") {
    exp.style.display = "none";
    col.style.display = "inline";
    return;
  }
  exp.style.display = "inline";
  col.style.display = "none";
}

function toggleSectionDisplay(id, imagePrefix, sectionID) {
  var collapsed = collapsedState(id);
  setPreference("collapse.section." + id, !collapsed, null);
  hideReveal(id, imagePrefix);
  toggleDivDisplay(id + '_spacer');
  if (collapsed) {
    CustomEvent.fire("section.expanded", id);
    setCollapseAllIcons("expand", sectionID);
  }
};
/*! RESOURCE: /scripts/CatalogPricing.js */
var priceReceiveCounter = 0;
var priceSendCounter = 0;
var CatalogPricing = Class.create();
CatalogPricing.prototype = {
  initialize: function(cat_item_id, cart) {
    this.cat_item_id = cat_item_id;
    this.xml = getXMLIsland('pricing_' + cat_item_id);
    this.variables = [];
    this._initPriceVars();
    this.messenger = new GwtMessage();
    this.labels = true;
    this.cart = cart;
  },
  _initPriceVars: function() {
    if (!this.xml)
      return;
    var allVars = this.xml.getElementsByTagName('variable');
    for (var i = 0; i < allVars.length; i++) {
      var v = allVars[i];
      var longName = v.getAttribute('id');
      var name = longName.substring('price_of_'.length);
      if (g_form.hasPricingImplications(name))
        this.variables.push(v);
    }
  },
  enhanceLabels: function() {
    this._getAllPrices();
  },
  refreshCart: function(quantity, labels) {
    this.disableOrderThisControls();
    priceReceiveCounter += 1;
    if (typeof(labels) != 'undefined')
      this.labels = labels;
    if (this.priceSendCounter > 1000000)
      priceSendCounter = 0;
    priceSendCounter++;
    var counter = priceSendCounter;
    var self = this;
    setTimeout(function() {
      if (counter != priceSendCounter)
        return;
      var ga = new GlideAjax("CartAjaxProcessor");
      ga.addParam('sysparm_action', 'price');
      ga.addParam('sysparm_quantity', quantity);
      ga.addParam('sysparm_id', self.cat_item_id);
      ga.addEncodedString(g_cart.generatePostString());
      ga.setErrorCallback(self._priceResponseError.bind(self));
      ga.getXML(self._priceResponse.bind(self), null, priceReceiveCounter);
    }, 200)
  },
  _enhanceLabels: function(priceMap) {
    var msg = ['lowercase_add', 'lowercase_subtract'];
    var answer = this.messenger.getMessages(msg);
    this.add = answer['lowercase_add'];
    this.subtract = answer['lowercase_subtract'];
    for (var i = 0; i < this.variables.length; i++) {
      var v = this.variables[i];
      var longName = v.getAttribute('id');
      var name = longName.substring('price_of_'.length);
      var realThing = document.getElementsByName(name);
      if (realThing) {
        for (var j = 0; j < realThing.length; j++) {
          if (realThing[j].type == 'radio')
            this._enhanceRadio(realThing[j], v, priceMap)
          else if (realThing[j].options)
            this._enhanceSelect(realThing[j], v, priceMap);
        }
      }
      realThing = document.getElementsByName("ni." + name);
      if (realThing) {
        for (var j = 0; j < realThing.length; j++) {
          if (realThing[j].type == 'checkbox')
            this._enhanceCheckbox(name, v, priceMap)
        }
      }
    }
  },
  _adjustPrice: function(price) {
    if (price && price.endsWith(".0"))
      price = price.substring(0, price.length - 2);
    if (price && price.endsWith(".00"))
      price = price.substring(0, price.length - 3);
    return price;
  },
  _enhanceCheckbox: function(name, v, priceMap) {
    var node = v.childNodes[0];
    var recurringFrequency = node.getAttribute('recurring_frequency');
    var recurringPrice = node.getAttribute('recurring_price');
    var price = node.getAttribute('price');
    price = parseFloat(price);
    price = Math.round(price * 100.0) / 100.0;
    recurringPrice = parseFloat(recurringPrice);
    recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
    var label = node.getAttribute('base_label');
    var displayCurrency = node.getAttribute('display_currency');
    var displayCurrencyRp = node.getAttribute('display_currency_rp');
    if (displayCurrencyRp == '' || displayCurrencyRp == null)
      displayCurrencyRp = displayCurrency;
    var realThing = $("ni." + name + "_label");
    if (realThing) {
      var checkbox = document.getElementsByName("ni." + name)[0];
      var displayPrice = priceMap[displayCurrency + "_" + price];
      var displayRecurringPrice = priceMap[displayCurrencyRp + "_" + recurringPrice];
      var mod1 = "";
      var mod2 = "";
      if (checkbox.checked + "" == "true") {
        if (parseFloat(price) > 0)
          mod1 = this.messenger.getMessage("has added {0}", displayPrice);
        if (parseFloat(recurringPrice) > 0 && recurringFrequency != '')
          mod2 = this.messenger.getMessage("has added {0} {1}", displayRecurringPrice, recurringFrequency);
      } else {
        if (parseFloat(price) > 0)
          mod1 = this.messenger.getMessage("will add {0}", displayPrice);
        if (parseFloat(recurringPrice) > 0 && recurringFrequency != '')
          mod2 = this.messenger.getMessage("will add {0} {1}", displayRecurringPrice, recurringFrequency);
      }
      var mod = '';
      if (mod1 != '')
        mod += mod1;
      if (mod1 != '' && mod2 != '')
        mod += ' | ';
      if (mod2 != '')
        mod += mod2;
      if (mod != '')
        realThing.update(label + ' [ ' + mod + ' ]');
      else
        realThing.update(label);
    }
  },
  _enhanceSelect: function(select, v, priceMap) {
    for (var i = 0; i < select.options.length; i++) {
      var recurringFrequency = v.childNodes[0].getAttribute('recurring_frequency');
      var option = select.options[i];
      var price = this._priceOfVar(v, option.value);
      var currentPrice = this._currentPriceOf(select.name);
      price = price - currentPrice;
      price = Math.round(price * 100.0) / 100.0;
      var recurringPrice = this._recurringPriceOfVar(v, option.value);
      var currentRecurringPrice = this._currentRecurringPriceOf(select.name);
      recurringPrice = recurringPrice - currentRecurringPrice;
      recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
      var baseLabel = this._labelOfVar(v, option.value);
      if (!baseLabel)
        continue;
      var pt = this._attributeOfVar(v, option.value, 'display_currency');
      var ptRp = this._attributeOfVar(v, option.value, 'display_currency_rp');
      if (ptRp == '' || ptRp == null)
        ptRp = pt;
      var pt1 = this._getPriceToken(price, pt);
      var pt2 = this._getPriceToken(recurringPrice, ptRp);
      var enhancement1 = this._getEnhancement(price, priceMap, pt1);
      var enhancement2 = this._getEnhancement(recurringPrice, priceMap, pt2, recurringFrequency);
      var enhancements = '';
      if (enhancement1 != '')
        enhancements += enhancement1;
      if (enhancement1 != '' && enhancement2 != '')
        enhancements += ' | ';
      if (enhancement2 != '')
        enhancements += enhancement2;
      if (enhancements != '')
        option.text = baseLabel + ' [' + enhancements + ']';
      else
        option.text = baseLabel;
    }
    if ($j && $j(select)) {
      var jSelect = $j(select);
      if (jSelect.hasClass('select2') && jSelect.select2)
        jSelect.select2();
    }
  },
  _enhanceRadio: function(radio, v, priceMap) {
    var recurringFrequency = v.childNodes[0].getAttribute('recurring_frequency');
    var l = radio.nextSibling;
    var value = radio.value;
    var price = this._priceOfVar(v, value);
    var currentPrice = this._currentPriceOf(radio.name);
    price = price - currentPrice;
    price = Math.round(price * 100.0) / 100.0;
    var recurringPrice = this._recurringPriceOfVar(v, value);
    var currentRecurringPrice = this._currentRecurringPriceOf(radio.name);
    recurringPrice = recurringPrice - currentRecurringPrice;
    recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
    var baseLabel = this._labelOfVar(v, value);
    if (!baseLabel)
      return;
    var pt = this._attributeOfVar(v, value, 'display_currency');
    var ptRp = this._attributeOfVar(v, value, 'display_currency_rp');
    if (ptRp == '' || ptRp == null)
      ptRp = pt;
    var pt1 = this._getPriceToken(price, pt);
    var pt2 = this._getPriceToken(recurringPrice, ptRp);
    var enhancement1 = this._getEnhancement(price, priceMap, pt1);
    var enhancement2 = this._getEnhancement(recurringPrice, priceMap, pt2, recurringFrequency);
    var enhancements = '';
    if (enhancement1 != '')
      enhancements += enhancement1;
    if (enhancement1 != '' && enhancement2 != '')
      enhancements += ' | ';
    if (enhancement2 != '')
      enhancements += enhancement2;
    var update = '';
    if (enhancements != '')
      update = baseLabel + ' [' + enhancements + ']';
    else
      update = baseLabel;
    l.innerHTML = update;
  },
  _getEnhancement: function(price, priceMap, priceToken, recurringFrequency) {
    if (price == 0 || recurringFrequency == '')
      return '';
    var term = this.add;
    if (price < 0)
      term = this.subtract;
    if (term != '' && term != null)
      term += ' ';
    var nicePrice = priceMap[priceToken];
    if (!nicePrice) {
      if (console.error)
        console.error(this.messenger.getMessage('No response received from server'));
      else
        g_form.addErrorMessage(this.messenger.getMessage('No response received from server'));
      return "";
    }
    if (nicePrice.indexOf("(") == 0)
      nicePrice = nicePrice.substring(1, nicePrice.length - 1);
    if (recurringFrequency != null)
      return term + nicePrice + ' ' + recurringFrequency;
    else
      return term + nicePrice;
  },
  _getAllPrices: function() {
    var cf = new CurrencyFormat(this._enhanceLabels.bind(this), this.cat_item_id);
    if (this.fillFormat(cf))
      cf.formatPrices();
  },
  fillFormat: function(cf) {
    var epp = new Object();
    var doIt = false;
    for (var i = 0; i < this.variables.length; i++) {
      var costs = this.variables[i].childNodes;
      var vName = this.variables[i].getAttribute('id');
      vName = vName.substring('price_of_'.length);
      var currentPrice = this._currentPriceOf(vName);
      var currentRecurringPrice = this._currentRecurringPriceOf(vName);
      for (var j = 0; j < costs.length; j++) {
        var price = costs[j].getAttribute('price');
        var recurringPrice = costs[j].getAttribute('recurring_price');
        price = parseFloat(price);
        price = price - currentPrice;
        price = Math.round(price * 100.0) / 100.0;
        recurringPrice = parseFloat(recurringPrice);
        recurringPrice = recurringPrice - currentRecurringPrice;
        recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
        Math.abs(price);
        Math.abs(recurringPrice);
        var sc = costs[j].getAttribute('session_currency');
        var dc = costs[j].getAttribute('display_currency');
        var dc_rp = costs[j].getAttribute('display_currency_rp');
        if (dc_rp == null || dc_rp == '')
          dc_rp = dc;
        var pt = this._getPriceToken(price, dc);
        cf.addPrice(pt, sc + ';' + price);
        pt = this._getPriceToken(recurringPrice, dc_rp);
        cf.addPrice(pt, sc + ';' + recurringPrice);
        doIt = true;
      }
    }
    return doIt;
  },
  _processPrice: function(cf, price) {
    price = parseFloat(price);
    price = price - currentPrice;
    price = Math.round(price * 100.0) / 100.0;
    Math.abs(price);
    var sc = costs[j].getAttribute('session_currency');
    var dc = costs[j].getAttribute('display_currency');
    var pt = this._getPriceToken(price, dc);
    cf.addPrice(pt, sc + ';' + price);
  },
  _getPriceToken: function(price, displayCurrency) {
    var answer = price;
    if (displayCurrency)
      answer = displayCurrency + '_' + price;
    return answer;
  },
  _currentPriceOf: function(vName) {
    var realThing = document.getElementsByName(vName);
    if (!realThing)
      return 0;
    for (var i = 0; i < realThing.length; i++) {
      if (realThing[i].type == 'radio' && realThing[i].checked)
        return this._priceOf(vName, realThing[i].value);
      else if (realThing[i].options) {
        if (realThing[i].selectedIndex != '-1')
          return this._priceOf(vName, realThing[i].options[realThing[i].selectedIndex].value);
      }
    }
    return 0;
  },
  _currentRecurringPriceOf: function(vName) {
    var realThing = document.getElementsByName(vName);
    if (!realThing)
      return 0;
    for (var i = 0; i < realThing.length; i++) {
      if (realThing[i].type == 'radio' && realThing[i].checked)
        return this._recurringPriceOf(vName, realThing[i].value);
      else if (realThing[i].options) {
        if (realThing[i].selectedIndex != '-1')
          return this._recurringPriceOf(vName, realThing[i].options[realThing[i].selectedIndex].value);
      }
    }
    return 0;
  },
  disableOrderThisControls: function() {
    $$(".order_buttons .text_cell").each(function(elem) {
      elem.addClassName("disabled_order_button");
    });
  },
  enableOrderThisControls: function() {
    $$(".order_buttons .text_cell").each(function(elem) {
      elem.removeClassName("disabled_order_button");
    });
  },
  _priceResponseError: function(request, counter) {
    if (priceReceiveCounter != counter)
      return;
    this.enableOrderThisControls();
  },
  _priceResponse: function(response, counter) {
    if (priceReceiveCounter != counter)
      return;
    this.enableOrderThisControls();
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    if (items.length > 0) {
      var a = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].getAttribute("show_price") == "true")
          a = true;
      }
      for (var i = 0; i < items.length; i++) {
        var s = items[i].getAttribute("show_price");
        var p = items[i].getAttribute("display_price");
        var t = items[i].getAttribute("display_total");
        var r = items[i].getAttribute("recurring_price") == "true";
        this._setTotals(s, p, t, r, a);
        this._updateCartPriceVariables(items[i].getAttribute("total"), r);
      }
    }
    var cf = new CurrencyFormat(this._updateCart.bind(this));
    this.fillFormat(cf);
    cf.formatPrices();
  },
  _priceOf: function(name, value) {
    var test = 'price_of_' + name;
    for (var i = 0; i < this.variables.length; i++) {
      if (this.variables[i].getAttribute('id') != test)
        continue;
      return this._priceOfVar(this.variables[i], value);
    }
    return 0;
  },
  _recurringPriceOf: function(name, value) {
    var test = 'price_of_' + name;
    for (var i = 0; i < this.variables.length; i++) {
      if (this.variables[i].getAttribute('id') != test)
        continue;
      return this._recurringPriceOfVar(this.variables[i], value);
    }
    return 0;
  },
  _priceOfVar: function(v, value) {
    var p = this._attributeOfVar(v, value, 'price');
    if (isNaN(parseFloat(p)))
      return 0
    else
      return parseFloat(p);
  },
  _recurringPriceOfVar: function(v, value) {
    var p = this._attributeOfVar(v, value, 'recurring_price');
    if (isNaN(parseFloat(p)))
      return 0
    else
      return parseFloat(p);
  },
  _checkMap: function(v) {
    if (!this.optionMap)
      this.optionMap = {};
    if (!this.optionMap[v.id])
      this.optionMap[v.id] = {};
    var options = v.getElementsByTagName('cost');
    for (var n = 0; n < options.length; n++)
      this.optionMap[v.id][options[n].getAttribute('value')] = options[n];
  },
  _attributeOfVar: function(v, value, attribute) {
    this._checkMap(v);
    if (this.optionMap[v.id] && this.optionMap[v.id][value])
      return this.optionMap[v.id][value].getAttribute(attribute);
    return null;
  },
  _labelOfVar: function(v, value) {
    this._checkMap(v);
    if (this.optionMap[v.id] && this.optionMap[v.id][value])
      return this.optionMap[v.id][value].getAttribute('base_label');
    return 0;
  },
  _updateCartPriceVariables: function(total, recurring) {
    if (!total)
      total = 0.0;
    if (recurring)
      this.cart.recurring_price_subtotal = total;
    else
      this.cart.price_subtotal = total;
  },
  _setTotals: function(show_price, display_price, total, recurring, any) {
    var style = "none";
    if (show_price == "true")
      style = "";
    var label_style = "none";
    if (show_price == "true" || any)
      label_style = "";
    var prefix = "";
    if (recurring)
      prefix = "recurring_";
    var price_label_span = gel('price_label_span');
    if (price_label_span) {
      price_label_span.style.display = label_style;
      var price_span = gel(prefix + 'price_span');
      if (price_span) {
        if (recurring)
          price_span.innerHTML = '+ ' + display_price;
        else
          price_span.innerHTML = display_price;
        price_span.style.display = style;
        if (recurring) {
          var freqLabel = gel("recurring_frequency_span");
          if (freqLabel)
            freqLabel.style.display = style;
          var recurringTable = $("recurring_price_table");
          if (recurringTable)
            recurringTable.style.display = style;
        }
      }
    }
    var total_label_span = gel('price_subtotal_label_span');
    if (total_label_span) {
      total_label_span.style.display = label_style;
      var total_span = gel(prefix + 'price_subtotal_span');
      if (total_span) {
        if (recurring)
          total_span.innerHTML = '+ ' + total;
        else
          total_span.innerHTML = total;
        total_span.style.display = style;
        if (recurring) {
          var freqLabel = gel("recurring_frequency_subtotal_span");
          if (freqLabel)
            freqLabel.style.display = style;
          var recurringTable = $("recurring_price_subtotal_table");
          if (recurringTable)
            recurringTable.style.display = style;
        }
      }
    }
  },
  _updateCart: function(responseMap) {
    if (this.labels)
      this._enhanceLabels(responseMap);
    this.cart._changed();
  }
};
/*! RESOURCE: /scripts/currency_format.js */
var CurrencyFormat = Class.create();
CurrencyFormat.prototype = {
  _PROCESSOR: "com.glideapp.servicecatalog.CurrencyAjaxProcessor",
  initialize: function(callBack) {
    this._callBack = callBack;
    this._map = new Object();
  },
  addPrice: function(key, value) {
    this._map[key] = value + '';
  },
  formatPrices: function() {
    var ajax = new GlideAjax(this._PROCESSOR);
    ajax.addParam("sysparm_action", "calcprice");
    for (key in this._map)
      ajax.addParam("sysparm_price_" + key, this._map[key]);
    ajax.getXML(this.handleResponse.bind(this));
  },
  handleResponse: function(request) {
    responseMap = new Object();
    var xml = request.responseXML;
    if (xml) {
      for (key in this._map) {
        var items = xml.getElementsByTagName("sysparm_price_" + key);
        if (items.length == 1) {
          var price = items[0].getAttribute("price");
          responseMap[key] = price;
        }
      }
      this._callBack.call(this, responseMap);
    }
  }
};
/*! RESOURCE: /scripts/CatalogReferenceChoice.js */
var CatalogReferenceChoice = Class.create(AJAXReferenceChoice, {
  initialize: function(element, reference, dependentReference, refQualElements, targetTable) {
    if (!element)
      element = gel('sys_original.' + reference);
    AJAXReferenceCompleter.prototype.initialize.call(this, element, reference, dependentReference, refQualElements, targetTable);
  },
  addSysParms: function() {
    var sp = "sysparm_processor=LookupSelectProcessor" +
      "&sysparm_name=" + this.elementName +
      "&sysparm_timer=" + this.timer +
      "&sysparm_max=" + this.max +
      "&sysparm_chars=" + encodeText(this.searchChars);
    return sp;
  },
  ajaxResponse: function(response) {
    var e = response.responseXML.documentElement;
    var vn = e.getAttribute("variable_name");
    var v = e.getAttribute("variable");
    if (isMSIE && gel('sysparm_id')) {
      var island = getXMLIsland('pricing_' + gel('sysparm_id').value);
      if (island) {
        var vars = island.getElementsByTagName('variable');
        for (var i = 0; i < vars.length; i++) {
          if (vars[i].getAttribute('id') == vn) {
            var xml = loadXML(v);
            var root = xml.documentElement;
            var p = vars[i].parentNode;
            p.removeChild(vars[i]);
            p.appendChild(root.cloneNode(true));
            gel('pricing_' + gel('sysparm_id').value).innerHTML = island.xml;
          }
        }
      }
    } else {
      var t = gel(vn);
      if (t)
        t.outerHTML = v;
    }
    if ("true" == e.getAttribute("radio"))
      if (isDoctype())
        this._updateRadioDoctype(e);
      else
        this._updateRadio(e);
    else
    if (isDoctype())
      this._updateSelectDoctype(e);
    else
      this._updateSelect(e);
  },
  addRefQualValues: function() {
    if (this.refQualElements) {
      var form = g_form;
      if (typeof g_sc_form != 'undefined')
        form = g_sc_form
      return "&" + form.serializeChanged();
    } else
      return "";
  },
  _updateSelectDoctype: function(element) {
    var updatedSelect = element.getAttribute("options");
    var selectId = element.getAttribute("sysparm_name");
    if (!updatedSelect || !selectId)
      return;
    var currentSelect = $(selectId);
    if (!currentSelect)
      return;
    g_form.clearOptions(selectId);
    var optionsFragment = document.createRange()
      .createContextualFragment(updatedSelect);
    var selectElement = optionsFragment
      .querySelector("select");
    var inputElement = optionsFragment
      .querySelector("input");
    if (selectElement) {
      var newOptions = selectElement
        .querySelectorAll('option');
      for (var optionIndex = 0; newOptions &&
        optionIndex < newOptions.length; optionIndex++) {
        var option = newOptions.item(optionIndex);
        currentSelect.appendChild(option);
      }
    }
    if (inputElement) {
      g_form.setValue(selectId, inputElement.value);
    }
    currentSelect = $(selectId);
    if (!currentSelect)
      return;
    this.element = currentSelect;
    this.element.onchange.call(this.element);
  },
  _updateSelect: function(element) {
    var options = element.getAttribute("options");
    var td = findParentByTag(this.element, 'td');
    if (!td)
      return;
    td.innerHTML = options;
    this.element = td.getElementsByTagName("select")[0];
    this.element.onchange.call(this.element);
  },
  _updateRadioDoctype: function(element) {
    var options = element.getAttribute("options");
    var fieldSet = findParentByTag(this.element, "fieldset");
    if (!fieldSet)
      return;
    fieldSet.innerHTML = options;
    this._invokeClickOnChecked(fieldSet);
  },
  _updateRadio: function(element) {
    var options = element.getAttribute("options");
    var t = findParentByTag(this.element, 'table');
    var td = findParentByTag(t, "td");
    if (!td)
      return;
    td.innerHTML = options;
    this._invokeClickOnChecked(td);
  },
  _invokeClickOnChecked: function(element) {
    var inputs = $(element).select(".cat_item_option");
    for (var i = 0; i < inputs.length; i++) {
      var element = inputs[i];
      if (element.checked) {
        this.element = element;
        this.element.onclick.call(this.element);
        return;
      }
    }
  },
  getKeyElement: function() {
    if (this.keyElement)
      return this.keyElement;
    return this.element;
  }
});;
/*! RESOURCE: /scripts/CartItemList.js */
var CartItemList = Class.create();
CartItemList.prototype = {
  initialize: function(cart) {
    this.processor = "com.glideapp.servicecatalog.CartAjaxProcessor";
    this.urlPrefix = "xmlhttp.do?sysparm_processor=" + this.processor;
    this.bStart = "<table><tr><td>";
    this.bMid = "</td><td class=\"text_cell\">";
    this.bEnd = "</td></tr></table>";
    this.backbutton = true;
    this.cart = cart;
    this._setOptions();
    var gwt = new GwtMessage();
    var values = ["Shopping Cart", "Empty", "Edit Cart", "Continue Shopping", "Proceed to Checkout", "Save and Checkout"];
    this.answer = gwt.getMessages(values);
    CustomEvent.observe("catalog_cart_changed", this._cartResponse.bind(this));
  },
  _setOptions: function() {
    this.backbutton = true;
    var no_checkout = gel('sysparm_no_checkout');
    var no_proceed_checkout = gel('no_proceed_checkout');
    this.no_checkout = no_checkout && no_checkout.value == 'true';
    this.no_proceed_checkout = no_proceed_checkout && no_proceed_checkout.value == 'true';
    this.show_proceed = !(this.no_checkout || this.no_proceed_checkout);
  },
  create: function() {
    var w = new GlideWindow('cartContent', true);
    w.setClassName('sc_cart_window');
    this.cartBody = w.getBody();
    w.setPosition("relative");
    w.setSize(200, 10);
    var shoppingCartTitle = this.answer["Shopping Cart"];
    if (typeof shoppingCartTitle == 'undefined')
      shoppingCartTitle = "";
    w.setTitle("<span id='shopping_cart_title'>" + shoppingCartTitle + "</span>");
    w.setBody("<div class='sc_cart_empty_message'>" + this.answer["Empty"] + "</div>");
    w.insert(gel('cart'));
  },
  get: function() {
    serverRequest(this.urlPrefix, this._cartResponse.bind(this));
  },
  notify: function(event, response) {
    if (event == 'cart_change')
      this._cartResponse(response);
  },
  _updateCart: function(update) {
    if (this.cartBody)
      this.cartBody.innerHTML = update;
    else
      $$("div[id^=cart]").each(function(elem) {
        elem.innerHTML = update;
      })
  },
  _appendCart: function(child) {
    if (this.cartBody)
      this.cartBody.appendChild(child);
    else
      $$("div[id^=cart]").each(function(elem) {
        elem.appendChild($(child).clone(true));
      })
  },
  _cartResponse: function(request) {
    if (typeof g_form !== 'undefined')
      g_form.submitted = false;
    var xml = request.responseXML;
    this._updateCart("");
    var gwt = new GwtMessage();
    var restyle = xml.getElementsByTagName("restyle")[0].getAttribute("value") == "true";
    var subtotal = xml.getElementsByTagName("subtotal");
    var hasprice = subtotal[0].getAttribute("has_price");
    var subtotalText = subtotal[0].getAttribute("text");
    var subtotalPrice = subtotal[0].getAttribute("price");
    var useCartLayout = xml.getElementsByTagName("use_cart_layout")[0].getAttribute("layout") == "true";
    var items = xml.getElementsByTagName("item");
    if (items.length < 1) {
      this._updateCart("<div class='sc_cart_empty_message'>" + this.answer["Empty"] + "</div>");
      this._afterChange();
      return;
    }
    var catItem = xml.getElementsByTagName("cat_item");
    if (catItem.length > 0) {
      var itemGuid = catItem[0].getAttribute("item_guid");
      var itemParm = gel("sysparm_item_guid");
      if (itemParm)
        itemParm.value = itemGuid;
      var attachmentParm = gel("sysparm_attachment_cart_id");
      if (attachmentParm)
        attachmentParm.value = itemGuid;
    }
    var table = new GwtTable();
    table.htmlElement.style.width = "100%";
    table.htmlElement.setAttribute("role", "presentation");
    for (var i = 0; i < items.length; i++) {
      var q = items[i].getAttribute("quantity");
      var d = items[i].getAttribute("description");
      var p = items[i].getAttribute("price");
      var r = items[i].getAttribute("recurring_price");
      var f = items[i].getAttribute("recurring_frequency");
      table.addRowWithClassName("sc_cart_cell", q, d);
      if (p != null)
        table.addCellsWithClassName("sc_cart_cell_right", p);
      if (r != null && f != null && f != '') {
        if (p != null) {
          table.addRowWithClassName("");
          table.row.appendChild(document.createElement('td'));
          var rpCol = document.createElement('td');
          var rpColText = document.createTextNode('+ ' + r + ' ' + f);
          rpCol.className = "sc_cart_cell_smaller sc_cart_cell_smaller_right";
          rpCol.colSpan = 2;
          rpCol.appendChild(rpColText);
          table.row.appendChild(rpCol);
        } else
          table.addRowWithClassName("sc_cart_cell_right sc_cart_cell_smaller", '', '+ ' + r + ' ' + f);
      }
    }
    this._appendCart(table.htmlElement);
    var table = new GwtTable();
    table.htmlElement.style.width = "100%";
    if (hasprice == 'true') {
      table.addRowWithClassName("");
      table.setRowClassName("sc_cart_subtotal_row");
      var horizontalRule = document.createElement("hr");
      var tableCol = document.createElement('td');
      tableCol.colSpan = 3;
      tableCol.appendChild(horizontalRule)
      table.row.appendChild(tableCol);
      table.addRowWithClassName("sc_cart_cell_total");
      var subtotalCell = table.addSpanCell(2);
      var subtotalNode = document.createTextNode(subtotalText)
      subtotalCell.appendChild(subtotalNode);
      subtotalCell.className = "sc_cart_cell sc_cart_cell_total";
      table.addCellsWithClassName("sc_cart_cell_total_right", subtotalPrice);
    }
    this._appendCart(table.htmlElement);
    var catalog = "";
    var urlSuffix = "";
    if (gel("sysparm_catalog")) {
      catalog = gel("sysparm_catalog").value;
      urlSuffix += "sysparm_catalog=" + catalog;
    }
    var catalog_view = "";
    if (gel("sysparm_catalog_view")) {
      catalog_view = gel("sysparm_catalog_view").value;
      if (urlSuffix)
        urlSuffix += "&";
      urlSuffix += "sysparm_catalog_view=" + catalog_view;
    }
    var buttonRow = cel("tr");
    buttonRow.setAttribute("role", "navigation");
    buttonRow.setAttribute("aria-labelledby", "cartContent_header");
    buttonRow.className = "sc_cart_buttons";
    if (isMSIE7)
      buttonRow.style.display = "block";
    else
      buttonRow.style.display = "table-row";
    this.buttonCell = cel("td");
    this.buttonCell.colSpan = "3";
    buttonRow.appendChild(this.buttonCell);
    table.body.appendChild(buttonRow);
    var editCartUrl = useCartLayout ? "window.location='com.glideapp.servicecatalog_cart_view_v2.do?" : "window.location='com.glideapp.servicecatalog_cart_view.do?";
    editCartUrl += urlSuffix + "'";
    this._generateButton('request_catalog_button_with_icon btn btn-default', 'catalog_cart_edit_button', '#', editCartUrl, this.answer["Edit Cart"], "images/button_arrow_rt.gifx", this.answer["Edit Cart"], restyle);
    if (this.show_proceed) {
      if (this.editID) {
        this._generateButton('request_catalog_button_with_icon btn btn-default', 'catalog_cart_save_checkout', '#', "proceedCheckout('" + this.editID + "')", this.answer["Save and Checkout"], "images/button_arrow_rt.gifx", this.answer["Save and Checkout"], restyle);
      } else {
        var gurl = new GlideURL("service_catalog.do");
        gurl.addParam('sysparm_action', 'checkout');
        if (catalog)
          gurl.addParam('sysparm_catalog', catalog);
        if (catalog_view)
          gurl.addParam('sysparm_catalog_view', catalog_view);
        gurl.addToken();
        this._generateButton('request_catalog_button_with_icon btn btn-primary', 'catalog_cart_proceed_checkout', '#', "if(typeof g_form !== 'undefined' && !g_form.modified) this.onclick='';window.location='" + gurl.getURL() + "'", this.answer["Proceed to Checkout"], 'images/button_arrow_rt.gifx', this.answer["Proceed to Checkout"], restyle);
      }
    }
    if (this.backbutton) {
      var cartBackButtonOnClickAction = "window.history.back()";
      var target = "window";
      var targetKey = "BROWSING_CONTEXT_TARGET";
      if ($(targetKey) != undefined && $(targetKey) != null && $(targetKey).value != null)
        target = $(targetKey).value;
      var urlKey = "BROWSING_CONTEXT_CATEGORY_SYSID";
      if ($(urlKey) != undefined && $(urlKey) != null && $(urlKey).value != null)
        cartBackButtonOnClickAction = target + ".location=\'" + $(urlKey).value + "\';";
      this._generateButton('request_catalog_button_with_icon btn btn-default', 'catalog_cart_continue_shopping', '#', cartBackButtonOnClickAction, this.answer["Continue Shopping"], 'images/button_arrow_lt.gifx', this.answer["Continue Shopping"], restyle);
    }
    this._afterChange();
  },
  _generateButton: function(clazz, id, href, onclick, title, img, label, restyle) {
    if (restyle) {
      var button = cel("button");
      button.type = "button";
      button.className = clazz;
      button.id = id;
      button.onclick = function() {
        eval(onclick);
        return false;
      }
      button.title = title;
      button.innerHTML = label;
      this.buttonCell.appendChild(button);
    } else {
      var span = cel("div");
      span.className += "catalog_button_container";
      span.innerHTML = "<a class='" + clazz + "' id='" + id + "' href='" + href + "' onclick=\"" + onclick + "\"  title='" + title + "'>" + this.bStart + "<img src='" + img + "' />" + this.bMid + label + this.bEnd + "</a>";
      this.buttonCell.appendChild(span);
    }
  },
  _afterChange: function() {
    if (this.cart)
      this.cart._changed();
    if (typeof jQuery != 'undefined') {
      if (jQuery('.cat-btn').tooltip) {
        jQuery('.cat-btn').tooltip()
          .on('hide.bs.tooltip', function(e) {
            e.preventDefault();
            jQuery('div.tooltip').hide();
          });
      }
    }
    _frameChanged();
  },
  initForm: function() {
    var form = addForm();
    form.action = this.fAction;
    form.name = this.fAction;
    form.id = this.fAction;
    form.method = "POST";
    return form;
  },
  setContentElement: function(cartBody) {
    this.cartBody = $(cartBody);
  }
};;
/*! RESOURCE: /scripts/CartProxy.js */
var CartProxy = Class.create();
CartProxy.prototype = {
  initialize: function(id) {
    this.target = id;
    CustomEvent.observe('cart.loaded', this.onCartChange.bind(this));
    CustomEvent.observe('cart.edit', this.onCartEdit.bind(this));
  },
  proxy: function(html, win) {
    this.targetWindow = win;
    gel(this.target).innerHTML = html;
    this._cleanup();
  },
  reload: function() {
    gel(this.target).innerHTML = "";
  },
  onCartEdit: function() {
    this.reload();
  },
  onCartChange: function(args) {
    var html = args['html'];
    var win = args['window'];
    if (win == window)
      return;
    this.proxy(html, win);
  },
  _cleanup: function() {
    var quanThere = this.targetWindow.gel("quantity");
    if (quanThere)
      gel("quantity").selectedIndex = quanThere.selectedIndex;
    var shopping = gel('catalog_cart_continue_shopping');
    if (shopping)
      shopping.style.display = "none";
    var pc = gel('catalog_cart_proceed_checkout');
    if (pc) {
      pc.onclick = function() {
        proceedCheckout()
      }
      pc.removeAttribute("href");
    }
    var edit = gel('catalog_cart_edit_button');
    if (edit)
      edit.onclick = function() {
        editCart()
      };
  }
};

function addToCart() {
  if (window.g_cart_proxy)
    window.g_cart_proxy.targetWindow.addToCart();
}

function orderEdit() {
  if (window.g_cart_proxy)
    window.g_cart_proxy.targetWindow.orderEdit();
}

function orderNow() {
  if (window.g_cart_proxy)
    window.g_cart_proxy.targetWindow.orderNow();
}

function proceedCheckout() {
  if (window.g_cart_proxy) {
    var targetWin = window.g_cart_proxy.targetWindow;
    targetWin.gel('catalog_cart_proceed_checkout').onclick();
  }
}

function editCart() {
  if (window.g_cart_proxy) {
    var targetWin = window.g_cart_proxy.targetWindow;
    targetWin.gel('catalog_cart_edit_button').onclick();
  }
}

function calcPrice() {
  if (window.g_cart_proxy) {
    var quan = g_cart_proxy.targetWindow.gel("quantity");
    quan.selectedIndex = gel("quantity").selectedIndex;
    g_cart_proxy.targetWindow.calcPrice();
  }
};
/*! RESOURCE: /scripts/CartV2/SCCartModel.js */
var SCCartModel = Class.create()
SCCartModel.prototype = {
  initialize: function(cart_name) {
    this.htmlElement = null;
    this.fAction = "service_catalog.do";
    this.processor = "CartAjaxProcessorV2";
    this.urlPrefix = "xmlhttp.do?sysparm_processor=" + this.processor;
    this.showCart = false;
    this.cart_name = cart_name || '';
    this.price_subtotal = "";
    this.recurring_price_subtotal = "";
    this.recurring_frequency_subtotal = "";
  },
  setCartVisible: function(showCart) {
    this.showCart = showCart;
  },
  order: function(item, quantity, sc_cart_item_id, catalog_id, catalog_view, cart_name, wish_list_item_id) {
    this._postAction(null, quantity, item, "order", sc_cart_item_id,
      catalog_id, catalog_view, cart_name, null, wish_list_item_id);
  },
  orderUpdate: function(item_id, cart_item_id, quantity) {
    this._postAction(cart_item, quantity, item_id, "update_proceed");
  },
  addCartContent: function() {},
  add: function(params, doThisWhenItemAddedToCart) {
    var url = this.urlPrefix;
    Object.keys(params).forEach(function(key) {
      if (key.startsWith('sysparm_'))
        url += '&' + key + '=' + params[key];
    });
    url += this._addParams();
    var postString = "";
    if (params.variables) {
      Object.keys(params.variables).forEach(function(key) {
        if (params.variables[key].type !== "textarea")
          postString += key + '=' + encodeURIComponent(params.variables[key].value) + '&';
        else
          postString += key + '=' + params.variables[key].value + '&';
      });
    }
    serverRequestPost(url, postString, doThisWhenItemAddedToCart);
  },
  addItemToCart: function(params, doThisWhenItemAddedToCart) {
    var url = this.urlPrefix;
    Object.keys(params).forEach(function(key) {
      if (key.startsWith('sysparm_'))
        url += '&' + key + '=' + params[key];
    });
    url += this._addParams();
    var postString = "";
    if (params.variables) {
      Object.keys(params.variables).forEach(function(key) {
        if (params.variables[key].type !== "textarea")
          postString += key + '=' + encodeURIComponent(params.variables[key].value) + '&';
        else
          postString += key + '=' + params.variables[key].value + '&';
      });
    }
    serverRequestPost(url, postString, doThisWhenItemAddedToCart);
  },
  getCartContents: function(doThisWhenCartLoaded) {
    if (!this.showCart)
      return;
    var url = this.urlPrefix;
    url += this._addParams();
    url += this._addHint();
    serverRequest(url, function() {
      doThisWhenCartLoaded();
    });
  },
  addAttachment: function(item_sys_id, tableName, allowAttachment) {
    saveAttachment(tableName, item_sys_id, allowAttachment);
  },
  edit: function(item_id, cart_item, quantity) {
    this._postAction(cart_item, quantity, item_id, "update");
  },
  getVariables: function(optionsElements, serialize) {
    if (!optionsElements)
      optionsElements = $(document.body).select(".cat_item_option:not(.ignore)");
    var seq = 0;
    var variables = {};
    var targetVal;
    for (i = 0; i < optionsElements.length; i++) {
      var element = optionsElements[i];
      var n = element.name;
      if (n != null && n != "") {
        if ("variable_sequence" == n) {
          seq++;
          n = n + seq;
        }
        if (variables.hasOwnProperty(n))
          continue;
        var variableDetails = {
          value: '',
          type: element.type
        };
        if (element.type == "radio") {
          var selectedEl = $(document.body).querySelector("input[name='" + n + "']:checked");
          variableDetails.value = selectedEl ? selectedEl.value : '';
        } else if (serialize && element.type === "textarea" && !element.hasClassName("htmlField")) {
          var serializeVal = element.serialize();
          variableDetails.value = serializeVal.substring(serializeVal.indexOf("=") + 1);
        } else if (element.type != "radio")
          variableDetails.value = element.value;
        if (element.hasClassName("htmlField"))
          variableDetails.type = "htmlField";
        variables[n] = variableDetails;
      }
    }
    if (window.tableVariableCache) {
      for (var tableVariableId in window.tableVariableCache) {
        var tableVariable = window.tableVariableCache[tableVariableId];
        var variableDetails = {
          value: '',
          type: 'sc_table'
        };
        variableDetails.value = tableVariable.serialize();
        variables[tableVariable.getNameSpace() + tableVariableId] = variableDetails;
      }
    }
    return variables;
  },
  _addParam: function(name) {
    var value = gel(name);
    if (value && value.value)
      return "&" + name + "=" + equalsHtmlToHex(value.value);
    return '';
  },
  _addParams: function() {
    var ret = this._addParam('sysparm_processing_hint');
    ret += this._addParam('sysparm_catalog');
    ret += this._addParam('sysparm_catalog_view');
    ret += this._addParam('sysparm_link_parent');
    ret += this._addParam('sysparm_parent_sys_id');
    ret += this._addParam('sysparm_parent_table');
    ret += this._addParam('sysparm_view');
    return ret;
  },
  initForm: function() {
    var form = addForm();
    form.action = this.fAction;
    form.name = this.fAction;
    form.id = this.fAction;
    form.method = "POST";
    return form;
  },
  _addVariablesToForm: function(form, variables) {
    var that = this;
    Object.keys(variables).forEach(function(key) {
      addInput(form, "HIDDEN", key, variables[key].value);
    });
  },
  _postAction: function(cart_item, quantity, item_id, action,
    sc_cart_item_id, catalog_id, catalog_view, cart_name, variables, wish_list_item_id) {
    var form = this.initForm();
    addInput(form, "HIDDEN", "sysparm_action", action);
    if (cart_item)
      addInput(form, "HIDDEN", "sysparm_cart_id", cart_item);
    addInput(form, "HIDDEN", "sysparm_quantity", quantity);
    addInput(form, "HIDDEN", "sysparm_id", item_id);
    addInput(form, "HIDDEN", "sysparm_catalog", catalog_id);
    addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
    if (cart_name)
      addInput(form, "HIDDEN", "sysparm_cart_name", cart_name);
    else
      addInput(form, "HIDDEN", "sysparm_cart_name", this.cart_name);
    var hint = gel('sysparm_processing_hint');
    if (hint && hint.value)
      addInput(form, "HIDDEN", "sysparm_processing_hint", hint.value);
    if (sc_cart_item_id)
      addInput(form, "HIDDEN", "sysparm_item_guid", sc_cart_item_id);
    if (wish_list_item_id)
      addInput(form, "HIDDEN", "sysparm_wish_list_item_id", wish_list_item_id);
    var special_instructions = gel("sysparm_special_instructions");
    if (special_instructions)
      addInput(form, "HIDDEN", "sysparm_special_instructions", special_instructions.value);
    var location = gel("sysparm_location");
    if (location)
      addInput(form, "HIDDEN", "sysparm_location", location.value);
    var req_for = gel("sysparm_requested_for");
    if (req_for)
      addInput(form, "HIDDEN", "sysparm_requested_for", req_for.value);
    var contact_type = gel("sysparm_contact_type");
    if (contact_type)
      addInput(form, "HIDDEN", "sysparm_contact_type", contact_type.value);
    var parent_id = gel("sysparm_parent_sys_id");
    if (parent_id)
      addInput(form, "HIDDEN", "sysparm_parent_sys_id", parent_id.value);
    var parent_table_name = gel("sysparm_parent_table");
    if (parent_table_name)
      addInput(form, "HIDDEN", "sysparm_parent_table", parent_table_name.value);
    var view_name = gel("sysparm_view");
    if (view_name)
      addInput(form, "HIDDEN", "sysparm_view", view_name.value);
    this._addATFParamsToForm(form);
    if (!variables)
      variables = this.getVariables(null, false);
    this._addVariablesToForm(form, variables);
    form.submit();
  },
  _addATFParamsToForm: function(form) {
    var atfParams = ["sysparm_atf_step_sys_id", "sysparm_atf_test_result_sys_id", "sysparm_atf_debug", "sysparm_rollback_context_id", "sysparm_from_atf_test_runner"];
    for (var i = 0; i < atfParams.length; i++) {
      var param = atfParams[i];
      if (gel(param))
        addInput(form, "HIDDEN", param, gel(param).value);
    }
  },
  setContentElement: function(htmlElement) {
    this.htmlElement = $(htmlElement);
  },
  setQuantity: function(qty) {
    var quantity_widget = gel("quantity");
    if (quantity_widget) {
      quantity_widget.value = qty;
      quantity.onchange();
    } else
      console.log("Quantity widget not found. Cannot set quantity");
  },
  getQuantity: function() {
    var quantity = 1;
    var quan_widget = gel("quantity");
    if (quan_widget)
      quantity = $('quantity').getValue();
    return quantity;
  },
  getSubtotal: function() {
    return this.price_subtotal;
  },
  getRecurringPrice: function() {
    return this.recurring_price_subtotal;
  },
  getRecurringPriceFrequency: function() {
    return this.recurring_frequency_subtotal;
  }
};
/*! RESOURCE: /scripts/CartV2/SCSavedItemsCart.js */
var SCSavedItemsCart = Class.create(SCCartModel, {});;
/*! RESOURCE: /scripts/CartV2/SavedItems.js */
var SavedCartItems = Class.create();
SavedCartItems.prototype = {
  initialize: function() {
    this.g_cart = new SCSavedItemsCart('saved_items');
    CustomEvent.observe("save_item_cart_changed", this.updateCart.bind(this));
  },
  loadCart: function() {
    this.g_cart.setCartVisible(true);
    this.g_cart.getCartContents(this.updateCart);
    this.g_cart.setCartVisible(false);
  },
  updateCart: function(response) {},
  _buildItemParams: function() {
    var params = {};
    var guid;
    var item_guid = gel("sysparm_item_guid");
    if (item_guid)
      guid = item_guid.value;
    var attachParam = gel('sysparm_attachment_cart_id');
    if (attachParam)
      params.sysparm_attachment_cart_id = attachParam.value;
    if (guid == "")
      return;
    item_guid.value = "";
    this._removeAttachmentList();
    params.sysparm_id = $("sysparm_id").getValue();
    params.sysparm_quantity = this.getQuantity();
    params.sysparm_item_guid = guid;
    params.sysparm_cart_name = this.g_cart.cart_name;
    params.variables = this.g_cart.getVariables();
    return params;
  },
  saveItemForLater: function() {
    var params = this._buildItemParams();
    params.sysparm_action = 'save_item_for_later';
    this._setFormSubmitted(true, false);
    this.g_cart.addItemToCart(params, this._navigateAfterWishListadd);
    if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
      GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'CartV2', 'Add to WishList');
    }
  },
  updateSavedItem: function() {
    var params = this._buildItemParams();
    var cart_item_id = gel("sysparm_cart_item_id");
    if (cart_item_id)
      params.sysparm_cart_item_id = cart_item_id.value;
    params.sysparm_action = 'update_saved_item';
    this._setFormSubmitted(true, false);
    this.g_cart.addItemToCart(params, this._navigateAfterWishListadd);
  },
  saveProducerForLater: function() {
    var params = this._buildItemParams();
    params.sysparm_action = 'save_item_for_later';
    this._setFormSubmitted(true, false);
    this.g_cart.addItemToCart(params, this._navigateAfterWishListadd);
    if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
      GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'CartV2', 'Save Producer for later');
    }
  },
  _setFormSubmitted: function(submitted, modified) {
    if (g_form) {
      g_form.submitted = submitted;
      g_form.modified = modified;
    }
  },
  _removeAttachmentList: function() {
    var attachmentList = gel("header_attachment_list");
    if (attachmentList) {
      var count = attachmentList.childNodes.length;
      while (count > 1) {
        count--;
        var node = attachmentList.childNodes[count];
        rel(node);
      }
      var listLabel = gel("header_attachment_list_label");
      listLabel.style.display = "none";
      var attachmentsLine = gel("header_attachment_line");
      attachmentsLine.style.display = "none";
      var spanNodes = $(listLabel).select("span");
      if (spanNodes && spanNodes.length != 0)
        spanNodes[0].update("");
    }
  },
  _navigateAfterWishListadd: function(response) {
    var xml = response.responseXML;
    var sc_cart_items = xml.getElementsByTagName("sc_cart_items")[0];
    var g_dialog = new GlideModal("add_to_wish_list_dialog", true, 320);
    g_dialog.setPreference("wish_list_items_count", sc_cart_items.getAttribute("item_count"));
    g_dialog.setPreference("item_name", sc_cart_items.getAttribute("item_name"));
    g_dialog.setPreference("action", sc_cart_items.getAttribute("action"));
    g_dialog.render();
  },
  getQuantity: function() {
    return this.g_cart.getQuantity();
  }
};
/*! RESOURCE: /scripts/CartV2/CartItems.js */
var CartItems = Class.create();
CartItems.prototype = {
  initialize: function() {
    this.g_cart = new SCCartV2();
    this.processor = "CartAjaxProcessorV2";
    this.urlPrefix = "xmlhttp.do?sysparm_processor=" + this.processor;
    CustomEvent.observe("catalog_cart_changed", this._cartResponse.bind(this));
    this._afterChange();
  },
  tableRowStyle: function() {
    if (isMSIE6 || isMSIE7)
      return 'block';
    return 'table-row';
  }(),
  get: function() {
    var url = this.urlPrefix + "&" + this.g_cart._addParams();
    serverRequest(url, this._cartResponse.bind(this));
  },
  scCartOnRender: function(showShoppingCart) {
    this.showShoppingCart = showShoppingCart;
    if (showShoppingCart != 'true') {
      $$('#sc_cart_item_list').each(function(el) {
        el.setStyle({
          'display': 'none'
        });
      });
    } else {
      $$('#sc_cart_item_list').each(function(el) {
        var style = isMSIE7 ? "block" : "table";
        el.setStyle({
          'display': style
        });
      });
    }
  },
  hideCog: function() {
    try {
      if ($('sc_cart_window') &&
        $('sc_cart_window').up('.drag_section') &&
        $('sc_cart_window').up('.drag_section').down('.header_decorations') &&
        $('sc_cart_window').up('.drag_section').down('.header_decorations').down('.home-icon.icon-cog'))
        $('sc_cart_window').up('.drag_section').down('.header_decorations').down('.home-icon.icon-cog').hide();
    } catch (e) {}
  },
  _cartResponse: function(request) {
    if (typeof g_form !== 'undefined')
      g_form.submitted = false;
    var xml = request.responseXML;
    var catItem = xml.getElementsByTagName("cat_item");
    if (catItem.length > 0) {
      var itemGuid = catItem[0].getAttribute("item_guid");
      var itemParm = gel("sysparm_item_guid");
      if (itemParm)
        itemParm.value = itemGuid;
      var attachmentParm = gel("sysparm_attachment_cart_id");
      if (attachmentParm)
        attachmentParm.value = itemGuid;
    }
    var content = xml.getElementsByTagName("markup")[0].getAttribute("content");
    var temp = cel("table");
    $(temp).update(content);
    var container = $('sc_cart_window');
    if (!container)
      container = $('sc_cart_item_list');
    container.update(temp.innerHTML);
    this._afterChange();
  },
  _afterChange: function() {
    var args = {};
    if ($("sc_cart_contents"))
      args['html'] = $("sc_cart_contents").innerHTML;
    args['window'] = window;
    args['original_id'] = "sc_cart_contents";
    CustomEvent.fireTop('cart.loaded', args);
    if (typeof jQuery != 'undefined') {
      if (jQuery('.cat-btn').tooltip) {
        jQuery('.cat-btn').tooltip()
          .on('hide.bs.tooltip', function(e) {
            e.preventDefault();
            jQuery('div.tooltip').hide();
          });
      }
    }
    _frameChanged();
  }
};;
/*! RESOURCE: /scripts/CartV2/OrderItem.js */
var OrderItem = Class.create();
OrderItem.prototype = {
  g_cart: null,
  initialize: function() {
    this.g_cart = new SCCartV2();
    g_cart = this.g_cart;
    this._populatePricesForCart();
  },
  _populatePricesForCart: function() {
    if ($('price_subtotal_display'))
      this.g_cart.price_subtotal = $('price_subtotal_display').value;
    if ($('recurring_price_subtotal_display'))
      this.g_cart.recurring_price_subtotal = $('recurring_price_subtotal_display').value;
    if ($('recurring_frequency_subtotal_value'))
      this.g_cart.recurring_frequency_subtotal = $('recurring_frequency_subtotal_value').value;
  },
  scOrderItemOnRender: function(showOrderItem) {
    this.showOrderItem = showOrderItem;
    if (showOrderItem != 'true')
      this.hideQuantity();
    this.g_cart.addCartContent();
    if ($('cart_edit'))
      this.g_cart.editID = $('cart_edit').getValue();
    if (this.g_cart.editID && this.g_cart.editID.length > 0)
      this.calcPrice();
  },
  hideQuantity: function() {
    if ($('qty') && $('qty').hasClassName('sc_cart_window'))
      $('qty').setStyle({
        'display': 'none'
      });
  },
  scOrderItemGuideOnRender: function(showOrderItemGuide) {
    this.showOrderItem = showOrderItemGuide;
    if (showOrderItemGuide != 'true')
      this.hideQuantity();
    this.g_cart.addCartContent();
    this.calcPrice();
  },
  addSavedItemToCart: function() {
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    var guid;
    var item_guid = gel("sysparm_item_guid");
    if (item_guid)
      guid = item_guid.value;
    if (guid == "")
      return;
    item_guid.value = "";
    var params = {};
    var variables;
    params.sysparm_action = "add_saved_item_to_cart";
    params.sysparm_quantity = this.getQuantity();
    params.sysparm_cart_name = "";
    params.sysparm_item_guid = guid;
    var item_id = gel("sysparm_id");
    if (item_id)
      params.sysparm_id = item_id.value;
    var cart_item_id = gel("sysparm_cart_item_id");
    if (cart_item_id)
      params.sysparm_cart_item_id = cart_item_id.value;
    var special_instructions = gel("sysparm_special_instructions");
    if (special_instructions)
      params.sysparm_special_instructions = special_instructions.value;
    var location = gel("sysparm_location");
    if (location)
      params.sysparm_location = location.value;
    var req_for = gel("sysparm_requested_for");
    if (req_for)
      params.sysparm_requested_for = req_for.value;
    var optionsElements = $(document.body).select(".cat_item_option");
    variables = this.g_cart.getVariables(optionsElements);
    optionsElements = $(document.body).select(".questionSetWidget")
    var expertVars = this.g_cart.getVariables(optionsElements);
    for (key in expertVars) {
      if (expertVars.hasOwnProperty(key))
        variables[key] = expertVars[key];
    }
    params.variables = variables;
    this._setFormSubmitted(true, false);
    this.g_cart.addItemToCart(params, this._afterAddToCartWishListItem.bind(this));
  },
  _afterAddToCartWishListItem: function(response) {
    var xml = response.responseXML;
    var cart_item = xml.getElementsByTagName("cat_item")[0];
    var g_dialog = new GlideModal("add_to_wish_list_dialog", true, 320);
    g_dialog.setPreference("wish_list_items_count", cart_item.getAttribute("item_count"));
    g_dialog.setPreference("item_name", cart_item.getAttribute("item_name"));
    g_dialog.setPreference("action", cart_item.getAttribute("action"));
    g_dialog.render();
  },
  addToCart: function() {
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    var guid;
    var item_guid = gel("sysparm_item_guid");
    if (item_guid)
      guid = item_guid.value;
    if (guid == "")
      return;
    item_guid.value = "";
    this._removeAttachmentList();
    this._setFormSubmitted(true, false);
    this.g_cart.add($("sysparm_id").getValue(), this.getQuantity(), guid);
    if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
      GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'CartV2', 'Add to Cart');
    }
  },
  _setFormSubmitted: function(submitted, modified) {
    if (g_form) {
      g_form.submitted = submitted;
      g_form.modified = modified;
    }
  },
  _removeAttachmentList: function() {
    var attachmentList = gel("header_attachment_list");
    if (attachmentList) {
      var count = attachmentList.childNodes.length;
      while (count > 1) {
        count--;
        var node = attachmentList.childNodes[count];
        rel(node);
      }
      var listLabel = gel("header_attachment_list_label");
      listLabel.style.display = "none";
      var attachmentsLine = gel("header_attachment_line");
      attachmentsLine.style.display = "none";
      var spanNodes = $(listLabel).select("span");
      if (spanNodes && spanNodes.length != 0)
        spanNodes[0].update("");
    }
  },
  _order: function(orderButtonId) {
    gel(orderButtonId).onclick = "";
    var orderParams = {};
    var item_guid = gel("sysparm_item_guid");
    if (item_guid)
      item_guid = item_guid.value
    var catalog_guid = gel("sysparm_catalog");
    if (catalog_guid)
      catalog_guid = catalog_guid.value
    var catalog_view = gel("sysparm_catalog_view");
    if (catalog_view)
      catalog_view = catalog_view.value;
    orderParams.cartItem = item_guid;
    orderParams.catalog = catalog_guid;
    orderParams.catalogView = catalog_view;
    orderParams.catItem = $("sysparm_id").getValue();
    orderParams.quantity = this.getQuantity();
    return orderParams;
  },
  orderNow: function(isNewOrderNow, isWishListItem) {
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    var orderParams = this._order("oi_order_now_button");
    if (isNewOrderNow == 'true')
      orderParams.cartName = "cart_" + orderParams.catItem;
    else
      orderParams.cartName = "";
    if (isWishListItem && isWishListItem == 'true') {
      var wishListItemId = gel("sysparm_cart_item_id");
      if (wishListItemId)
        orderParams.wish_list_item_id = wishListItemId.value;
    }
    this._setFormSubmitted(true, false);
    this.g_cart.order(orderParams.catItem, orderParams.quantity,
      orderParams.cartItem, orderParams.catalog,
      orderParams.catalogView, orderParams.cartName,
      orderParams.wish_list_item_id);
    if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
      GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'CartV2', 'Order Now');
    }
  },
  orderItem: function(isWishListItem) {
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    var orderParams = this._order("oi_order_item_button");
    orderParams.cartName = orderParams.cartItem + "_" + orderParams.quantity;
    if (isWishListItem && isWishListItem == 'true') {
      var wishListItemId = gel("sysparm_cart_item_id");
      if (wishListItemId)
        orderParams.wish_list_item_id = wishListItemId.value;
    }
    this._setFormSubmitted(true, false);
    this.g_cart.order(orderParams.catItem, orderParams.quantity,
      orderParams.cartItem, orderParams.catalog,
      orderParams.catalogView, orderParams.cartName,
      orderParams.wish_list_item_id);
  },
  calcPrice: function() {
    this.g_cart.recalcPrice($("sysparm_id").getValue(), this.getQuantity());
  },
  orderEdit: function(target) {
    if (!target)
      target = $('cart_edit').getValue();
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    this._setFormSubmitted(true, false);
    this.g_cart.edit(target, this.getQuantity());
  },
  proceedCheckout: function(target) {
    var m = g_form.catalogOnSubmit();
    if (!m)
      return;
    this._setFormSubmitted(true, false);
    this.g_cart.orderUpdate(target, this.getQuantity());
  },
  getQuantity: function() {
    return this.g_cart.getQuantity();
  }
};;
/*! RESOURCE: /scripts/CartV2/SCCartV2.js */
var SCCartV2 = Class.create(SCCartModel, {
  initialize: function() {
    SCCartModel.prototype.initialize.call(this);
    this.showCart = true;
    this.enhanceLabels = false;
  },
  enhanceOptionLabels: function(item) {
    price = new CatalogPricingV2(item, this);
    price.enhanceLabels();
  },
  orderUpdate: function(cart_item_id, quantity) {
    var item_id = gel("sysparm_id").value;
    this._postAction(cart_item, quantity, item_id, "update_proceed");
  },
  add: function(item, quantity, itemId, cartName) {
    var params = {};
    var variables;
    params.sysparm_action = "add";
    params.sysparm_id = item;
    params.sysparm_quantity = quantity;
    params.sysparm_item_guid = itemId;
    params.sysparm_cart_name = cartName || this._addParam("sysparm_cart_name").slice("&sysparm_cart_name".length);
    var special_instructions = gel("sysparm_special_instructions");
    if (special_instructions)
      params.sysparm_special_instructions = special_instructions.value;
    var location = gel("sysparm_location");
    if (location)
      params.sysparm_location = location.value;
    var req_for = gel("sysparm_requested_for");
    if (req_for)
      params.sysparm_requested_for = req_for.value;
    var optionsElements = $(document.body).select(".cat_item_option");
    variables = this.getVariables(optionsElements, true);
    optionsElements = $(document.body).select(".questionSetWidget")
    var expertVars = this.getVariables(optionsElements, true);
    for (key in expertVars) {
      if (expertVars.hasOwnProperty(key))
        variables[key] = expertVars[key];
    }
    params.variables = variables;
    this.addItemToCart(params, this._addResponse);
  },
  _addResponse: function(response) {
    CustomEvent.fire("catalog_cart_changed", response);
  },
  generatePostString: function() {
    var postString = "";
    var optionsElements = $(document.body).select(".cat_item_option");
    postString = this.generatePostStringOptions(postString, optionsElements);
    optionsElements = $(document.body).select(".questionSetWidget")
    postString = this.generatePostStringOptions(postString, optionsElements);
    return postString;
  },
  generatePostStringOptions: function(postString, optionsElements) {
    var seq = 0;
    for (i = 0; i < optionsElements.length; i++) {
      var element = optionsElements[i];
      var n = element.name;
      if ("variable_sequence" == n) {
        seq++;
        n = n + seq;
      }
      if (element.type == "radio" && (postString.indexOf(n + '=') == -1)) {
        var selectedEl = $(document.body).querySelector("input[name='" + n + "']:checked");
        var selVal = selectedEl ? selectedEl.value : '';
        postString += n + "=" + encodeURIComponent(selVal) + "&";
        jslog(n + " = " + selVal);
      } else if (element.type != "radio") {
        postString += n + "=" + encodeURIComponent(element.value) + "&";
        jslog(n + " = " + element.value);
      }
    }
    return postString;
  },
  recalcPrice: function(item, quantity) {
    price = new CatalogPricingV2(item, this);
    price.refreshCart(quantity, this.enhanceLabels);
  },
  edit: function(cart_item, quantity) {
    var item_id = $F("sysparm_id");
    if (item_id)
      this._postAction(cart_item, quantity, item_id, "update");
    else
      jslog('Item Id not found to edit the cart item');
  },
  showReferenceForm: function(inputName, tableName) {
    if (!g_form.catalogOnSubmit())
      return;
    var quantity = 1;
    var quan_widget = gel("quantity");
    if (quan_widget)
      quantity = quan_widget.value;
    var item_id = $F("sysparm_id");
    var ref_sys_id = gel(inputName).value;
    var form = this.initForm();
    addInput(form, "HIDDEN", "sysparm_table", tableName);
    addInput(form, "HIDDEN", "sysparm_ref_lookup", ref_sys_id);
    addInput(form, "HIDDEN", "sysparm_action", "show_reference");
    addInput(form, "HIDDEN", "sysparm_quantity", quantity);
    addInput(form, "HIDDEN", "sysparm_id", item_id);
    var hint = gel('sysparm_processing_hint');
    if (hint && hint.value)
      addInput(form, "HIDDEN", "sysparm_processing_hint", hint.value);
    this.addInputToForm(form);
    form.submit();
  },
  addInputToForm: function(form) {
    jslog("addInputToForm");
    var that = this;
    var variables = this.getVariables(null, false);
    Object.keys(variables).forEach(function(key) {
      addInput(form, "HIDDEN", key, variables[key].value)
    })
  },
  getCartContents: function() {
    SCCartModel.prototype.getCartContents.call(this, this._changed);
  },
  _changed: function() {
    var args = new Object();
    if (!gel("sc_cart_contents"))
      return;
    args['html'] = gel("sc_cart_contents").innerHTML;
    args['window'] = window;
    CustomEvent.fireTop('cart.loaded', args);
  },
  checkoutComplete: function() {
    CustomEvent.fireTop('cart.edit');
  }
});;
/*! RESOURCE: /scripts/CartV2/CartProxyV2.js */
var CartProxyV2 = Class.create();
CartProxyV2.prototype = {
  initialize: function(id) {
    this.target = id;
    CustomEvent.observe('cart.loaded', this.onCartChange.bind(this));
    CustomEvent.observe('cart.edit', this.onCartEdit.bind(this));
  },
  proxy: function(html, win) {
    this.targetWindow = win;
    gel(this.target).innerHTML = html;
    var displayStyle = 'table';
    if (isMSIE6 || isMSIE7)
      displayStyle = 'block';
    if (window.g_cart_proxy && window.g_cart_proxy.targetWindow.document.cartItemsWidget && window.g_cart_proxy.targetWindow.document.cartItemsWidget.showShoppingCart == 'true')
      $(this.target).select('#sc_cart_item_list')[0].setStyle({
        'display': displayStyle
      });
    if (window.g_cart_proxy && window.g_cart_proxy.targetWindow.orderItemWidget.showOrderItem == 'true')
      $(this.target).select('#qty')[0].setStyle({
        'display': displayStyle
      });
    this._cleanup();
  },
  reload: function() {
    gel(this.target).innerHTML = "";
  },
  onCartEdit: function() {
    this.reload();
  },
  onCartChange: function(args) {
    var html = args['html'];
    var win = args['window'];
    if (win == window)
      return;
    this.proxy(html, win);
  },
  _cleanup: function() {
    var qtyThere = this.targetWindow.gel("quantity");
    if (qtyThere)
      gel("quantity").selectedIndex = qtyThere.selectedIndex;
    var shopping = gel('catalog_cart_continue_shopping');
    if (shopping)
      shopping.style.display = "none";
    var pc = gel('catalog_cart_proceed_checkout');
    if (pc) {
      pc.onclick = function() {
        orderItemWidget.proceedCheckout()
      }
      pc.removeAttribute("href");
    }
    var edit = gel('catalog_cart_edit_button');
    if (edit)
      edit.onclick = function() {
        orderItemWidget.editCart()
      };
  }
};
var orderItemWidget = {
  addToCart: function() {
    if (window.g_cart_proxy)
      window.g_cart_proxy.targetWindow.orderItemWidget.addToCart();
  },
  orderEdit: function() {
    if (window.g_cart_proxy)
      window.g_cart_proxy.targetWindow.orderItemWidget.orderEdit();
  },
  orderNow: function() {
    if (window.g_cart_proxy)
      window.g_cart_proxy.targetWindow.orderItemWidget.orderNow();
  },
  proceedCheckout: function() {
    if (window.g_cart_proxy) {
      var targetWin = window.g_cart_proxy.targetWindow;
      targetWin.gel('catalog_cart_proceed_checkout').onclick();
    }
  },
  editCart: function() {
    if (window.g_cart_proxy) {
      var targetWin = window.g_cart_proxy.targetWindow;
      targetWin.gel('catalog_cart_edit_button').onclick();
    }
  },
  calcPrice: function() {
    if (window.g_cart_proxy) {
      var quan = g_cart_proxy.targetWindow.gel("quantity");
      quan.selectedIndex = gel("quantity").selectedIndex;
      g_cart_proxy.targetWindow.orderItemWidget.calcPrice();
    }
  }
};
/*! RESOURCE: /scripts/CartV2/CatalogPricingV2.js */
var priceReceiveCounter = 0;
var priceSendCounter = 0;
var CatalogPricingV2 = Class.create();
CatalogPricingV2.prototype = {
  initialize: function(cat_item_id, cart) {
    this.cat_item_id = cat_item_id;
    this.xml = getXMLIsland('pricing_' + cat_item_id);
    this.variables = [];
    this._initPriceVars();
    this.messenger = new GwtMessage();
    this.labels = true;
    this.cart = cart;
  },
  _initPriceVars: function() {
    if (!this.xml)
      return;
    var allVars = this.xml.getElementsByTagName('variable');
    for (var i = 0; i < allVars.length; i++) {
      var v = allVars[i];
      var longName = v.getAttribute('id');
      var name = longName.substring('price_of_'.length);
      if (g_form.hasPricingImplications(name))
        this.variables.push(v);
    }
  },
  enhanceLabels: function() {
    this._getAllPrices();
  },
  refreshCart: function(quantity, labels) {
    this.disableOrderThisControls();
    priceReceiveCounter += 1;
    if (typeof(labels) != 'undefined')
      this.labels = labels;
    if (this.priceSendCounter > 1000000)
      priceSendCounter = 0;
    priceSendCounter++;
    var counter = priceSendCounter;
    var self = this;
    setTimeout(function() {
      if (counter != priceSendCounter)
        return;
      var ga = new GlideAjax("CartAjaxProcessorV2");
      if (!$('sysparm_guide'))
        ga.addParam('sysparm_action', 'order_item');
      else
        ga.addParam('sysparm_action', 'this_item_order_guide');
      ga.addParam('sysparm_quantity', quantity);
      ga.addParam('sysparm_id', self.cat_item_id);
      var postString = self.cart.generatePostString();
      if (window.tableVariableCache) {
        for (var tableVariableId in window.tableVariableCache) {
          var tableVariable = window.tableVariableCache[tableVariableId];
          var n = tableVariable.getNameSpace() + tableVariableId;
          postString += n + "=" + encodeURIComponent(tableVariable.serialize()) + "&";
        }
      }
      ga.addEncodedString(postString);
      ga.setErrorCallback(self._priceResponseError.bind(self));
      ga.getXML(self._priceResponse.bind(self), null, priceReceiveCounter);
    }, 200)
  },
  _enhanceLabels: function(priceMap) {
    var msg = ['lowercase_add', 'lowercase_subtract'];
    var answer = this.messenger.getMessages(msg);
    this.add = answer['lowercase_add'];
    this.subtract = answer['lowercase_subtract'];
    for (var i = 0; i < this.variables.length; i++) {
      var v = this.variables[i];
      var longName = v.getAttribute('id');
      var name = longName.substring('price_of_'.length);
      var realThing = document.getElementsByName(name);
      if (realThing) {
        for (var j = 0; j < realThing.length; j++) {
          if (realThing[j].type == 'radio')
            this._enhanceRadio(realThing[j], v, priceMap)
          else if (realThing[j].options)
            this._enhanceSelect(realThing[j], v, priceMap);
        }
      }
      realThing = document.getElementsByName("ni." + name);
      if (realThing) {
        for (var j = 0; j < realThing.length; j++) {
          if (realThing[j].type == 'checkbox')
            this._enhanceCheckbox(name, v, priceMap)
        }
      }
    }
  },
  _adjustPrice: function(price) {
    if (price && price.endsWith(".0"))
      price = price.substring(0, price.length - 2);
    if (price && price.endsWith(".00"))
      price = price.substring(0, price.length - 3);
    return price;
  },
  _enhanceCheckbox: function(name, v, priceMap) {
    var node = v.childNodes[0];
    var recurringFrequency = node.getAttribute('recurring_frequency');
    var recurringPrice = node.getAttribute('recurring_price');
    var price = node.getAttribute('price');
    price = parseFloat(price);
    price = Math.round(price * 100.0) / 100.0;
    recurringPrice = parseFloat(recurringPrice);
    recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
    var label = node.getAttribute('base_label');
    var displayCurrency = node.getAttribute('display_currency');
    var displayCurrencyRp = node.getAttribute('display_currency_rp');
    if (displayCurrencyRp == '' || displayCurrencyRp == null)
      displayCurrencyRp = displayCurrency;
    var realThing = $("ni." + name + "_label");
    if (realThing) {
      var checkbox = document.getElementsByName("ni." + name)[0];
      var displayPrice = priceMap[displayCurrency + "_" + price];
      var displayRecurringPrice = priceMap[displayCurrencyRp + "_" + recurringPrice];
      var mod1 = "";
      var mod2 = "";
      if (checkbox.checked + "" == "true") {
        if (parseFloat(price) > 0)
          mod1 = this.messenger.getMessage("has added {0}", displayPrice);
        if (parseFloat(recurringPrice) > 0 && recurringFrequency != '')
          mod2 = this.messenger.getMessage("has added {0} {1}", displayRecurringPrice, recurringFrequency);
      } else {
        if (parseFloat(price) > 0)
          mod1 = this.messenger.getMessage("will add {0}", displayPrice);
        if (parseFloat(recurringPrice) > 0 && recurringFrequency != '')
          mod2 = this.messenger.getMessage("will add {0} {1}", displayRecurringPrice, recurringFrequency);
      }
      var mod = '';
      if (mod1 != '')
        mod += mod1;
      if (mod1 != '' && mod2 != '')
        mod += ' | ';
      if (mod2 != '')
        mod += mod2;
      if (mod != '')
        realThing.update(label + ' [ ' + mod + ' ]');
      else
        realThing.update(label);
    }
  },
  _enhanceSelect: function(select, v, priceMap) {
    for (var i = 0; i < select.options.length; i++) {
      var recurringFrequency = v.childNodes[0].getAttribute('recurring_frequency');
      var option = select.options[i];
      var price = this._priceOfVar(v, option.value);
      var currentPrice = this._currentPriceOf(select.name);
      price = price - currentPrice;
      price = Math.round(price * 100.0) / 100.0;
      var recurringPrice = this._recurringPriceOfVar(v, option.value);
      var currentRecurringPrice = this._currentRecurringPriceOf(select.name);
      recurringPrice = recurringPrice - currentRecurringPrice;
      recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
      var baseLabel = this._labelOfVar(v, option.value);
      if (!baseLabel)
        continue;
      var pt = this._attributeOfVar(v, option.value, 'display_currency');
      var ptRp = this._attributeOfVar(v, option.value, 'display_currency_rp');
      if (ptRp == '' || ptRp == null)
        ptRp = pt;
      var pt1 = this._getPriceToken(price, pt);
      var pt2 = this._getPriceToken(recurringPrice, ptRp);
      var enhancement1 = this._getEnhancement(price, priceMap, pt1);
      var enhancement2 = this._getEnhancement(recurringPrice, priceMap, pt2, recurringFrequency);
      var enhancements = '';
      if (enhancement1 != '')
        enhancements += enhancement1;
      if (enhancement1 != '' && enhancement2 != '')
        enhancements += ' | ';
      if (enhancement2 != '')
        enhancements += enhancement2;
      if (enhancements != '')
        option.text = baseLabel + ' [' + enhancements + ']';
      else
        option.text = baseLabel;
    }
    if ($j && $j(select)) {
      var jSelect = $j(select);
      if (jSelect.hasClass('select2') && jSelect.select2)
        jSelect.select2();
    }
  },
  _enhanceRadio: function(radio, v, priceMap) {
    var recurringFrequency = v.childNodes[0].getAttribute('recurring_frequency');
    var l = radio.nextSibling;
    var value = radio.value;
    var price = this._priceOfVar(v, value);
    var currentPrice = this._currentPriceOf(radio.name);
    price = price - currentPrice;
    price = Math.round(price * 100.0) / 100.0;
    var recurringPrice = this._recurringPriceOfVar(v, value);
    var currentRecurringPrice = this._currentRecurringPriceOf(radio.name);
    recurringPrice = recurringPrice - currentRecurringPrice;
    recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
    var baseLabel = this._labelOfVar(v, value);
    if (!baseLabel)
      return;
    var pt = this._attributeOfVar(v, value, 'display_currency');
    var ptRp = this._attributeOfVar(v, value, 'display_currency_rp');
    if (ptRp == '' || ptRp == null)
      ptRp = pt;
    var pt1 = this._getPriceToken(price, pt);
    var pt2 = this._getPriceToken(recurringPrice, ptRp);
    var enhancement1 = this._getEnhancement(price, priceMap, pt1);
    var enhancement2 = this._getEnhancement(recurringPrice, priceMap, pt2, recurringFrequency);
    var enhancements = '';
    if (enhancement1 != '')
      enhancements += enhancement1;
    if (enhancement1 != '' && enhancement2 != '')
      enhancements += ' | ';
    if (enhancement2 != '')
      enhancements += enhancement2;
    var update = '';
    if (enhancements != '')
      update = baseLabel + ' [' + enhancements + ']';
    else
      update = baseLabel;
    l.innerHTML = update;
  },
  _getEnhancement: function(price, priceMap, priceToken, recurringFrequency) {
    if (price == 0 || recurringFrequency == '')
      return '';
    var term = this.add;
    if (price < 0)
      term = this.subtract;
    if (term != '' && term != null)
      term += ' ';
    var nicePrice = priceMap[priceToken];
    if (!nicePrice) {
      if (console.error)
        console.error(this.messenger.getMessage('No response received from server'));
      else
        g_form.addErrorMessage(this.messenger.getMessage('No response received from server'));
      return "";
    }
    if (nicePrice.indexOf("(") == 0)
      nicePrice = nicePrice.substring(1, nicePrice.length - 1);
    if (recurringFrequency != null)
      return term + nicePrice + ' ' + recurringFrequency;
    else
      return term + nicePrice;
  },
  _getAllPrices: function() {
    var cf = new CurrencyFormat(this._enhanceLabels.bind(this), this.cat_item_id);
    if (this.fillFormat(cf))
      cf.formatPrices();
  },
  fillFormat: function(cf) {
    var epp = new Object();
    var doIt = false;
    for (var i = 0; i < this.variables.length; i++) {
      var costs = this.variables[i].childNodes;
      var vName = this.variables[i].getAttribute('id');
      vName = vName.substring('price_of_'.length);
      var currentPrice = this._currentPriceOf(vName);
      var currentRecurringPrice = this._currentRecurringPriceOf(vName);
      for (var j = 0; j < costs.length; j++) {
        var price = costs[j].getAttribute('price');
        var recurringPrice = costs[j].getAttribute('recurring_price');
        price = parseFloat(price);
        price = price - currentPrice;
        price = Math.round(price * 100.0) / 100.0;
        recurringPrice = parseFloat(recurringPrice);
        recurringPrice = recurringPrice - currentRecurringPrice;
        recurringPrice = Math.round(recurringPrice * 100.0) / 100.0;
        Math.abs(price);
        Math.abs(recurringPrice);
        var sc = costs[j].getAttribute('session_currency');
        var dc = costs[j].getAttribute('display_currency');
        var dc_rp = costs[j].getAttribute('display_currency_rp');
        if (dc_rp == null || dc_rp == '')
          dc_rp = dc;
        var pt = this._getPriceToken(price, dc);
        cf.addPrice(pt, sc + ';' + price);
        pt = this._getPriceToken(recurringPrice, dc_rp);
        cf.addPrice(pt, sc + ';' + recurringPrice);
        doIt = true;
      }
    }
    return doIt;
  },
  _processPrice: function(cf, price) {
    price = parseFloat(price);
    price = price - currentPrice;
    price = Math.round(price * 100.0) / 100.0;
    Math.abs(price);
    var sc = costs[j].getAttribute('session_currency');
    var dc = costs[j].getAttribute('display_currency');
    var pt = this._getPriceToken(price, dc);
    cf.addPrice(pt, sc + ';' + price);
  },
  _getPriceToken: function(price, displayCurrency) {
    var answer = price;
    if (displayCurrency)
      answer = displayCurrency + '_' + price;
    return answer;
  },
  _currentPriceOf: function(vName) {
    var realThing = document.getElementsByName(vName);
    if (!realThing)
      return 0;
    for (var i = 0; i < realThing.length; i++) {
      if (realThing[i].type == 'radio' && realThing[i].checked)
        return this._priceOf(vName, realThing[i].value);
      else if (realThing[i].options) {
        if (realThing[i].selectedIndex != '-1')
          return this._priceOf(vName, realThing[i].options[realThing[i].selectedIndex].value);
      }
    }
    return 0;
  },
  _currentRecurringPriceOf: function(vName) {
    var realThing = document.getElementsByName(vName);
    if (!realThing)
      return 0;
    for (var i = 0; i < realThing.length; i++) {
      if (realThing[i].type == 'radio' && realThing[i].checked)
        return this._recurringPriceOf(vName, realThing[i].value);
      else if (realThing[i].options) {
        if (realThing[i].selectedIndex != '-1')
          return this._recurringPriceOf(vName, realThing[i].options[realThing[i].selectedIndex].value);
      }
    }
    return 0;
  },
  disableOrderThisControls: function() {
    $$(".order_buttons .text_cell").each(function(elem) {
      elem.addClassName("disabled_order_button");
    });
  },
  enableOrderThisControls: function() {
    $$(".order_buttons .text_cell").each(function(elem) {
      elem.removeClassName("disabled_order_button");
    });
  },
  _priceResponseError: function(request, counter) {
    if (priceReceiveCounter != counter)
      return;
    this.enableOrderThisControls();
  },
  _priceResponse: function(response, counter) {
    var self = this;
    if (!response.responseXML.getElementsByTagName("item"))
      return;
    if (priceReceiveCounter != counter)
      return;
    self.enableOrderThisControls();
    var items = response.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var itemObject = items[i].getAttribute("values").evalJSON();
      if ($('price_span'))
        $('price_span').update(itemObject.display_price);
      if ($('recurring_price_span'))
        $('recurring_price_span').update((self._isNegativePrice(itemObject.display_recurring_price) ? '' : '+ ') + itemObject.display_recurring_price);
      if ($('price_subtotal_span'))
        $('price_subtotal_span').update(itemObject.display_subtotal);
      else if ($('price_subtotal_span'))
        $('price_subtotal_span').update('');
      if ($('recurring_price_subtotal_span'))
        $('recurring_price_subtotal_span').update((self._isNegativePrice(itemObject.display_subtotal_recurring_price) ? '' : '+ ') + itemObject.display_subtotal_recurring_price);
      if ($('recurring_frequency_subtotal_span'))
        $('recurring_frequency_subtotal_span').update(itemObject.recurring_frequency);
      if (itemObject.show_order_item_widget == 'true') {
        if ($('qty') && $('qty').hasClassName('sc_cart_window') && $('qty').getStyle('display') == 'none') {
          $('qty').setStyle({
            'display': 'inline'
          });
        }
      } else {
        if ($('qty') && $('qty').hasClassName('sc_cart_window') && $('qty').getStyle('display') != 'none' && !($('sc_delivery_time_label_cell')) && !($('oi_update_cart_button'))) {
          $('qty').setStyle({
            'display': 'none'
          });
        }
      }
      self._displayPriceData(itemObject.show_item_prices == 'true', 'price_label_span');
      self._displayPriceData(itemObject.show_price == 'true', 'price_span');
      self._displayPriceData(itemObject.show_recurring_price == 'true', 'recurring_price');
      self._displayPriceData(itemObject.show_subtotal_price == 'true', 'subtotal_price');
      self._displayPriceData(itemObject.show_subtotal_price == 'true', 'price_subtotal_label_span');
      self._displayPriceData(itemObject.show_subtotal_price == 'true', 'price_subtotal_span');
      self._displayPriceData(itemObject.show_subtotal_price == 'false', 'price_subtotal_label_span subtotal_rev_price');
      self._displayPriceData(itemObject.show_recurring_subtotal_price == 'true', 'recurring_subtotal_price');
      self._displayPriceData(itemObject.show_subtotal_price == 'true' || itemObject.show_recurring_subtotal_price == 'true', 'item_subtotal');
      this.cart.price_subtotal = itemObject.display_subtotal;
      this.cart.recurring_price_subtotal = itemObject.display_subtotal_recurring_price;
      if ($('price_subtotal_value'))
        $('price_subtotal_value').value = itemObject.subtotal_price_value;
      if ($('price_subtotal_display'))
        $('price_subtotal_display').value = itemObject.display_subtotal;
      if ($('recurring_price_subtotal_value'))
        $('recurring_price_subtotal_value').value = itemObject.subtotal_recurring_price_value;
      if ($('recurring_price_subtotal_display'))
        $('recurring_price_subtotal_display').value = itemObject.display_subtotal_recurring_price;
    }
    var cf = new CurrencyFormat(this._updateCart.bind(this));
    this.fillFormat(cf);
    cf.formatPrices();
  },
  _displayPriceData: function(showPriceData, priceSpan) {
    if (showPriceData && $(priceSpan) && $(priceSpan).getStyle('display') == 'none') {
      $(priceSpan).setStyle({
        'display': ''
      });
    } else if (!showPriceData && $(priceSpan) && $(priceSpan).getStyle('display') != 'none') {
      $(priceSpan).setStyle({
        'display': 'none'
      });
    }
  },
  _isNegativePrice: function(price) {
    var firstChar = price.substring(0, 1);
    if (firstChar == '-' || firstChar == '(') {
      return true;
    }
    return false;
  },
  _priceOf: function(name, value) {
    var test = 'price_of_' + name;
    for (var i = 0; i < this.variables.length; i++) {
      if (this.variables[i].getAttribute('id') != test)
        continue;
      return this._priceOfVar(this.variables[i], value);
    }
    return 0;
  },
  _recurringPriceOf: function(name, value) {
    var test = 'price_of_' + name;
    for (var i = 0; i < this.variables.length; i++) {
      if (this.variables[i].getAttribute('id') != test)
        continue;
      return this._recurringPriceOfVar(this.variables[i], value);
    }
    return 0;
  },
  _priceOfVar: function(v, value) {
    var p = this._attributeOfVar(v, value, 'price');
    if (isNaN(parseFloat(p)))
      return 0
    else
      return parseFloat(p);
  },
  _recurringPriceOfVar: function(v, value) {
    var p = this._attributeOfVar(v, value, 'recurring_price');
    if (isNaN(parseFloat(p)))
      return 0
    else
      return parseFloat(p);
  },
  _checkMap: function(v) {
    if (!this.optionMap)
      this.optionMap = {};
    if (!this.optionMap[v.id])
      this.optionMap[v.id] = {};
    var options = v.getElementsByTagName('cost');
    for (var n = 0; n < options.length; n++)
      this.optionMap[v.id][options[n].getAttribute('value')] = options[n];
  },
  _attributeOfVar: function(v, value, attribute) {
    this._checkMap(v);
    if (this.optionMap[v.id] && this.optionMap[v.id][value])
      return this.optionMap[v.id][value].getAttribute(attribute);
    return null;
  },
  _labelOfVar: function(v, value) {
    this._checkMap(v);
    if (this.optionMap[v.id] && this.optionMap[v.id][value])
      return this.optionMap[v.id][value].getAttribute('base_label');
    return 0;
  },
  _updateCart: function(responseMap) {
    if (this.labels)
      this._enhanceLabels(responseMap);
    this.cart._changed();
  }
};;;