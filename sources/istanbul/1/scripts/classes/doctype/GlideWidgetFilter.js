/*! RESOURCE: /scripts/classes/doctype/GlideWidgetFilter.js */
var GlideWidgetFilter = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, listName, query, pinned, saveFilterHidden) {
    $super(widgetID, listID);
    this.query = query;
    this.listName = listName;
    this.checkFilterEnabled();
    this.pinned = (pinned == 'true');
    this.openOnRefresh = false;
    if (!saveFilterHidden)
      this.saveFilterHidden = false;
    else
      this.saveFilterHidden = saveFilterHidden;
  },
  setOpenOnRefresh: function() {
    this.openOnRefresh = true;
  },
  toggleFilter: function() {
    if (!this._isFilterEnabled)
      return;
    var e = this._getFilterDiv();
    if (!e)
      return;
    if (e.getAttribute('gsft_empty') == 'true') {
      this._loadFilter(e);
      return;
    }
    var showFlag = e.style.display == "none";
    this._filterDisplay(showFlag);
  },
  togglePin: function() {
    this.pinned = !this.pinned;
    if (this.pinned)
      setPreference('filter.pinned.' + this.listName, 'true');
    else
      deletePreference('filter.pinned.' + this.listName);
    this._setPinned(this.pinned);
  },
  _setPinned: function() {
    var e = gel(this.listName + "_pin");
    if (!e)
      return;
    var msgs = new GwtMessage();
    if (this.pinned) {
      writeTitle(e, msgs.getMessage("Unpin the filters"));
      e.className = "toolbarImgActive btn btn-default active";
    } else {
      writeTitle(e, msgs.getMessage("Pin the filters"));
      e.className = "toolbarImgDisabled btn btn-default";
    }
  },
  isPinned: function() {
    return this.pinned;
  },
  _refresh: function(listTable, list, loadFlag) {
    if (loadFlag) {
      this._initEvents(list);
    } else
      this._updateBreadcrumbs();
    if (!this.isPinned()) {
      this._filterDisplay(false);
      if (this.openOnRefresh)
        this.toggleFilter();
    }
    this.openOnRefresh = false;
    var query = list.getQuery({
      orderby: true
    });
    if (query == this.query)
      return;
    var filter = getThing(list.tableName, list.listID + "gcond_filters");
    if (filter && filter.filterObject)
      filter.filterObject.setQueryAsync(query);
    this.query = query;
  },
  _updateBreadcrumbs: function() {
    var bc = this._getBreadcrumbsContainer();
    if (!bc)
      return;
    var bc_hidden = $(this.listID + "_breadcrumb_hidden");
    if (!bc_hidden)
      return;
    if (!bc_hidden.innerHTML)
      return;
    bc.innerHTML = bc_hidden.innerHTML;
    bc_hidden.innerHTML = "";
    if (window.opener != null)
      $j(window).resize();
  },
  _getBreadcrumbsContainer: function() {
    return $(this.listID + "_breadcrumb");
  },
  _filterDisplay: function(showFlag) {
    var e = this._getFilterDiv();
    if (!e)
      return;
    if (showFlag)
      showObject(e);
    else
      hideObject(e);
    e = gel(this.listID + "_filter_toggle_image");
    if (!e)
      return;
    this._changeFilterToggleIcon(e, showFlag);
    writeTitle(e, this._getFilterIconMessage());
    CustomEvent.fire('list.section.toggle');
  },
  _getFilterIconMessage: function() {
    if (!this._isFilterEnabled)
      return getMessage('This filter query cannot be edited');
    return getMessage('Show / hide filter');
  },
  _changeFilterToggleIcon: function(e, showFlag) {
    if (showFlag)
      e.src = "images/list_v2_filter_hide.gifx";
    else
      e.src = "images/list_v2_filter_reveal.gifx";
  },
  _loadFilter: function(targetDiv) {
    this._filterDisplay(true);
    targetDiv.setAttribute('gsft_empty', 'false');
    var list = GlideList2.get(this.listID);
    var ajax = new GlideAjax("AJAXJellyRunner", "AJAXJellyRunner.do");
    ajax.addParam("template", "list2_filter_partial.xml");
    ajax.addParam("sysparm_widget_id", this.widgetID);
    ajax.addParam("sysparm_list_id", this.listID);
    ajax.addParam("sysparm_list_name", this.listName);
    ajax.addParam("sysparm_query_encoded", list.getQuery({
      groupby: true,
      orderby: true
    }));
    ajax.addParam("sysparm_table", list.getTableName());
    ajax.addParam("sysparm_filter_query_prefix", list.filterQueryPrefix);
    ajax.addParam("sysparm_save_filter_hidden", this.saveFilterHidden);
    ajax.addParam("sysparm_view", list.getView());
    try {
      if (getTopWindow().Table.isCached(list.getTableName(), null))
        ajax.addParam("sysparm_want_metadata", "false");
      else
        ajax.addParam("sysparm_want_metadata", "true");
    } catch (e) {
      ajax.addParam("sysparm_want_metadata", "true");
    }
    var related = list.getRelated();
    if (related)
      ajax.addParam("sysparm_is_related_list", "true");
    ajax.addParam("sysparm_filter_pinned", this.pinned);
    list = null;
    ajax.getXML(this._loadFiltersResponse.bind(this), null, targetDiv);
  },
  _loadFiltersResponse: function(response, targetDiv) {
    var html = response.responseText;
    targetDiv.innerHTML = html;
    html.evalScripts(true);
    this._setPinned();
    var n = targetDiv.id.substring(0, targetDiv.id.length - "filterdiv".length);
    columnsGet(n);
    refreshFilter(n);
    _frameChanged();
    CustomEvent.fire('list.section.toggle');
  },
  _getFilterDiv: function() {
    return gel(this.listName + "filterdiv");
  },
  checkFilterEnabled: function() {
    var bc = this._getBreadcrumbsContainer();
    var filterEnabled = bc.select('input[id="fancy.' + this.listID + '.enable_filter"]');
    if (filterEnabled.length == 0 || filterEnabled[0].value != 'true')
      return;
    this._isFilterEnabled = true;
  },
  _getFilterToggle: function(list) {
    list = list || GlideList2.get(this.listID);
    return list.listContainer.select('a.list_filter_toggle');
  },
  _initEvents: function(list) {
    var a = this._getFilterToggle(list);
    if (a.length == 1) {
      if (!this._isFilterEnabled) {
        $j(a[0])
          .attr('aria-disabled', 'true')
          .attr('disabled', 'disabled')
      } else
        this._initFilterEvents(a[0]);
    }
    var span = list.listContainer.select('span.breadcrumb_container');
    if (span.length == 1)
      this._initBreadcrumbEvents(span[0]);
  },
  _initFilterEvents: function(a) {
    var self = this;
    a.observe('click', function(ev) {
      self.toggleFilter();
      ev.stop();
    });
  },
  _initBreadcrumbEvents: function(span) {
    span.on('mouseover', 'a.breadcrumb_separator', this._enterBreadcrumb.bind(this));
    span.on('mouseout', 'a.breadcrumb_separator', this._exitBreadcrumb.bind(this));
    span.on('click', 'a.breadcrumb_separator', this._runBreadcrumb.bind(this));
    span.on('click', 'a.breadcrumb_link', this._runBreadcrumb.bind(this));
    span.on('contextmenu', 'a.breadcrumb_link', this._onBreadcrumbContext.bind(this));
  },
  _enterBreadcrumb: function(evt) {
    evt.target.next().addClassName('breadcrumb_delete');
  },
  _exitBreadcrumb: function(evt) {
    evt.target.next().removeClassName('breadcrumb_delete');
  },
  _runBreadcrumb: function(evt) {
    var element = evt.target;
    var container = element.up('span.breadcrumb_container');
    var listID = container.readAttribute('list_id');
    var filter = element.readAttribute('filter');
    GlideList2.get(listID).setFilterAndRefresh(filter);
    evt.stop();
  },
  _onBreadcrumbContext: function(evt) {
    var element = evt.target;
    var container = element.up('span.breadcrumb_container');
    var list = GlideList2.get(container.readAttribute('list_id'));
    var filter = element.readAttribute('filter');
    var fixedQuery = list.getFixedQuery();
    if (fixedQuery)
      filter = fixedQuery + "^" + filter;
    var relatedQuery = list.getRelatedQuery();
    if (relatedQuery)
      filter = relatedQuery + "^" + filter;
    this._setBreadcrumbMenu(list.getTableName(), filter);
    contextShow(evt, 'context_breadcrumb_menu', -1, 0, 0);
    evt.stop();
  },
  _setBreadcrumbMenu: function(tableName, query) {
    var link = tableName + "_list.do?sysparm_query=" + encodeURIComponent(query);
    var msgs = new GwtMessage();
    var crumbMenu = new GwtContextMenu("context_breadcrumb_menu");
    crumbMenu.clear();
    crumbMenu.addURL(msgs.getMessage('Open new window'), link, "_blank", "open_new");
    var baseURL = document.baseURI || document.URL;
    if (baseURL && baseURL.match(/(.*)\/([^\/]+)/))
      baseURL = RegExp.$1 + "/";
    crumbMenu.addFunc(msgs.getMessage('Copy URL'), function() {
      copyToClipboard(baseURL + link);
    }, "copy_url");
    var item = crumbMenu.addFunc(msgs.getMessage('Copy query'), function() {
      copyToClipboard(query);
    }, "copy_query");
    if (!query)
      crumbMenu.setDisabled(item);
  },
  type: 'GlideWidgetFilter'
});;