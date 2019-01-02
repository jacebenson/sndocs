/*! RESOURCE: /scripts/classes/doctype/js_includes_listv2_doctype.js */
/*! RESOURCE: /scripts/classes/doctype/GlideList2.js */
var GlideList2 = Class.create(GwtObservable, {
  initialize: function(listID, tableName, query) {
    GwtObservable.prototype.initialize.call(this);
    this.filterQueryPrefix = "";
    this.listContainer = $(listID + "_list");
    this.listDiv = $(listID);
    this.listID = listID;
    this.listName = listID;
    this.properties = "";
    GlideLists2[this.listID] = this;
    this.lastChecked = null;
    this.title = "";
    this.view = "";
    this.filter = "";
    this.parentTable = "";
    this.related = "";
    this.listControlID = "-1";
    this.embedded = false;
    this.orderBy = [];
    this.groupBy = [];
    this.orderBySet = false;
    this.sortBy = "";
    this.sortDir = "";
    this.refreshPage = false;
    this.firstRow = 1;
    this.lastRow = 20;
    this.rowsPerPage = 20;
    this.totalRows = 0;
    this.grandTotalRows = 0;
    this.submitValues = {};
    this.doNotSubmitParams = {};
    this.fields = "";
    this.tableName = tableName;
    this.table = null;
    this.referringURL = "";
    this.titleMenu = new GlideMenu(this.listID, 'titleMenu');
    this.headerMenu = new GlideMenu(this.listID, 'headerMenu');
    this.rowMenu = new GlideMenu(this.listID, 'rowMenu');
    this.userList = false;
    this.onclickFunc = this.click.bindAsEventListener(this);
    this.ondblclickFunc = this.dblClick.bindAsEventListener(this);
    this.printFunc = this.onPrint.bind(this);
    this._initMessageBus();
    this._parseQuery(query, false, true);
    if (this.isHierarchical()) {
      var columnHeader = $("hdr_" + this.listID);
      var columnHeaderPref = columnHeader.getAttribute("data-show_column_header");
      if (columnHeader.visible() && !columnHeaderPref)
        this.toggleColumnHeader();
      else if (!columnHeader.visible() && columnHeaderPref)
        this.toggleColumnHeader();
    }
  },
  isHierarchical: function() {
    return $(this.listID).hasClassName("hierarchical");
  },
  destroy: function() {
    this.handlePrint(false);
    this._clear();
    this.listContainer = null;
    this.listDiv = null;
    this.titleMenu.destroy();
    this.titleMenu = null;
    this.headerMenu.destroy();
    this.headerMenu = null;
    this.rowMenu.destroy();
    this.rowMenu = null;
    this.form = null;
  },
  getQuery: function(options) {
    options = options || {};
    var q = [];
    if (options.fixed || options.all) {
      var fq = this.submitValues['sysparm_fixed_query'];
      if (fq)
        q.push(fq);
    }
    if (this.filter)
      q.push(this.filter);
    if ((options.orderby || options.all) && this.orderBy.length > 0)
      if (this.orderBySet)
        q.push(this.orderBy.join('^'));
    if ((options.groupby || options.all) && this.groupBy.length > 0)
      q.push(this.groupBy.join('^'));
    for (var i = 0; i < q.length; i++) {
      if (q[i].indexOf('^') === 0) {
        q[i] = q[i].substring(1);
      }
    }
    return q.join('^');
  },
  getRelatedQuery: function() {
    if (!this.getRelated())
      return null;
    return this.getSubmitValue('sysparm_collection_key') + "=" + this.getSubmitValue('sysparm_collectionID');
  },
  getFixedQuery: function() {
    return this.submitValues['sysparm_fixed_query'] + '';
  },
  getGroupBy: function() {
    return this.groupBy.join(",");
  },
  getHeaderCell: function(fieldName) {
    if (!this.table)
      return null;
    return this.table.down('th.list_header_cell[name="' + this._stripFieldName(fieldName) + '"]');
  },
  getRow: function(sysId) {
    if (!this.table)
      return null;
    return this.table.down('tr.list_row[sys_id="' + sysId + '"]');
  },
  getCell: function(sysId, fieldName) {
    var tr = this.getRow(sysId);
    if (!tr)
      return null;
    var ndx = this.fieldNdxs[this._stripFieldName(fieldName)];
    if (ndx == null)
      return null;
    return tr.cells[ndx];
  },
  getChecked: function() {
    var ids = [];
    var chks = this._getCheckboxes();
    for (var i = 0; i < chks.length; i++) {
      var chk = chks[i];
      if (chk.type != "checkbox")
        continue;
      if (!chk.checked)
        continue;
      ids.push($(chk).up('tr').getAttribute("sys_id"));
    }
    this.checkedIds = ids.join(",");
    return this.checkedIds;
  },
  getContainer: function() {
    return this.listContainer;
  },
  getContainerFrame: function() {
    return window.self.frameElement;
  },
  _stripFieldName: function(fieldName) {
    if (fieldName.startsWith(this.tableName + '.'))
      return fieldName.substring(this.tableName.length + 1);
    return fieldName;
  },
  loaded: function() {
    this._initList();
    if (this.fireEvent("list.loaded", this.table, this) === false)
      return false;
    if (CustomEvent.fire("list.loaded", this.table, this) === false)
      return false;
    if (this.getRelated() && this.titleMenu && GlideList2.listsMap)
      this.setupRelatedListContextMenuItems();
    else {
      var otherListsSpan = $(this.listID + "_other_lists_span");
      if (otherListsSpan && otherListsSpan.visible())
        otherListsSpan.toggle();
    }
    this.listDiv.on('mouseover', 'tr.list_row', function(ev, el) {
      this._addHoveredRowHighlight(el);
    }.bind(this));
    this.listDiv.on('mouseout', 'tr.list_row', function(ev, el) {
      this._removeHoveredRowHighlight(el);
    }.bind(this));
    this._restoreColumnHeaderToggleState();
    if (this.isHierarchical())
      GwtListEditor.forPage._prepareTable(this.table, "click");
    CustomEvent.observe('list.select_row', function(payload) {
      var sysId = payload.sys_Id;
      var table = payload.table;
      this._highlightSelectedRow(table, sysId);
    }.bind(this));
    this._fireListReady();
    return this.onLoad();
  },
  setupRelatedListContextMenuItems: function() {
    var listID, i, glideList;
    var relatedParentSysId = $(this.listID + "_table").up("tr.list_hierarchical_hdr").previousSiblings()[0].getAttribute("sys_id");
    var currentRelatedList = this.getCurrentRelatedList();
    var listElems = GlideList2.listsMap[relatedParentSysId];
    var hasLists = false;
    if (listElems && listElems.length > 1) {
      hasLists = true;
      for (i = 0; i < listElems.length; i++) {
        listID = listElems[i].select(".list_div")[0].getAttribute("id");
        if (typeof GlideList2.get(listID) === 'undefined') {
          hasLists = false;
        }
      }
    }
    if (hasLists) {
      for (i = 0; i < listElems.length; i++) {
        listID = listElems[i].select(".list_div")[0].getAttribute("id");
        var otherListsSpan = $(listID + "_other_lists_span");
        if (otherListsSpan) {
          if (!otherListsSpan.visible())
            otherListsSpan.toggle();
          otherListsSpan.update(" [1 " + getMessage("of") + " " +
            listElems.length + " " + getMessage("Lists") + "]");
        }
      }
      this.titleMenu.increaseItemsOrder(listElems.length + 2);
      var title = "<span style='font-weight: bold'>" + getMessage("Related Lists") + "</span>";
      this.titleMenu.addItem(this.listID, '', title, 'label', '', 0);
      var total = $(gel(this.listID + "_table")).getAttribute("total_rows");
      title = "<span style='color: #888'>&nbsp;&nbsp;" + this.getTitle() + " (" + total + ")</span>";
      this.titleMenu.addItem(this.listID, '', title, 'action', '', 1);
      var count = 2;
      for (i = 0; i < listElems.length; i++) {
        listID = listElems[i].select(".list_div")[0].getAttribute("id");
        if (listID != this.listID) {
          total = $(gel(listID + "_table")).getAttribute("total_rows");
          title = GlideList2.get(listID).getTitle() + " (" + total + ")";
          var onClick = "GlideList2.get('" + listID + "').relatedListSwitch('" + this.listContainer.getAttribute("id") + "');";
          this.titleMenu.addItem(listID, '', "&nbsp;&nbsp;" + title, 'action', onClick, count);
          count++;
        }
      }
      this.titleMenu.addItem(this.listID + "_line2", '', '', 'line', '', count);
      var foundMatch = false;
      for (i = 0; i < listElems.length; i++) {
        listID = listElems[i].select(".list_div")[0].getAttribute("id");
        glideList = GlideList2.get(listID);
        var currentRelatedListName = $(listID + "_table").getAttribute("hier_list_name");
        if (currentRelatedList == currentRelatedListName)
          foundMatch = true;
      }
      if (foundMatch) {
        var alreadyDisplayingARelatedList = false;
        for (i = 0; i < listElems.length; i++) {
          listID = listElems[i].select(".list_div")[0].getAttribute("id");
          glideList = GlideList2.get(listID);
          var currentRelatedListName = $(listID + "_table").getAttribute("hier_list_name");
          if (currentRelatedList != currentRelatedListName || alreadyDisplayingARelatedList) {
            if (listElems[i].visible())
              listElems[i].toggle();
          } else if (currentRelatedList == currentRelatedListName && !alreadyDisplayingARelatedList) {
            if (!listElems[i].visible())
              listElems[i].toggle();
            alreadyDisplayingARelatedList = true;
          }
        }
      } else {
        if (!listElems[0].visible())
          listElems[0].toggle();
      }
    } else {
      if (listElems && listElems.length == 1 && !listElems[0].visible())
        listElems[0].toggle();
      var otherListsSpan = $(this.listID + "_other_lists_span");
      if (otherListsSpan && otherListsSpan.visible())
        otherListsSpan.toggle();
    }
  },
  relatedListSwitch: function(otherListElemID) {
    $(otherListElemID).toggle();
    this.listContainer.toggle();
    this.setCurrentRelatedList();
  },
  click: function(ev) {
    var element = this._getCellFromEvent(ev, "click");
    if (!element)
      return;
    return this.onClick(element, ev);
  },
  dblClick: function(ev) {
    var element = this._getCellFromEvent(ev, "dblclick");
    if (!element)
      return;
    return this.onDblClick(element, ev);
  },
  clickTitle: function(ev) {
    if (this.titleMenu.isEmpty())
      return;
    var variables = {};
    variables['g_list'] = this;
    this.titleMenu.showContextMenu(ev, "context_list_title", variables);
    CustomEvent.fire('list.title.clicked', this.table, this);
  },
  hdrCellClick: function(th, ev) {
    if (this.fireEvent("hdrcell.click", this, th, ev) === false)
      return false;
    this.onHdrCellClick(th, ev);
  },
  hdrCellContextMenu: function(th, ev) {
    if (ev.ctrlKey)
      return;
    if (this.headerMenu.isEmpty())
      return;
    if (this.fireEvent("hdrcell.contextmenu", this, th, ev) === false) {
      ev.stop();
      return false;
    }
    var ret = this.onHdrCellContextMenu(th, ev);
    ev.stop();
    return ret;
  },
  rowContextMenu: function(element, ev) {
    if (ev.ctrlKey)
      return;
    if (this.rowMenu.isEmpty())
      return;
    element = this._getCellFromEvent(ev);
    if (!element)
      return;
    if (this.fireEvent("cell.contextmenu", this, element, ev) === false) {
      ev.stop();
      return false;
    }
    var ret = this.onRowContextMenu(element, ev);
    ev.stop();
    return ret;
  },
  allChecked: function(chk) {
    var checked = chk.checked;
    if (this.fireEvent("all.checked", this, chk, checked) === false)
      return false;
    return this.onAllChecked(chk, checked);
  },
  rowChecked: function(chk, ev) {
    var checked = chk.checked;
    if (this.fireEvent("row.checked", this, checked, ev) === false) {
      ev.stop();
      return false;
    }
    return this.onRowChecked(chk, checked, ev);
  },
  handlePrint: function(flag) {
    if (flag)
      CustomEvent.observe("print", this.printFunc);
    else
      CustomEvent.un("print", this.printFunc);
  },
  onPrint: function(maxRows) {
    maxRows = parseInt(maxRows, 10);
    if (isNaN(maxRows) || maxRows < 1)
      maxRows = 5000;
    if (this.totalRows > parseInt(maxRows)) {
      if (!confirm(getMessage("Printing large lists may affect system performance. Continue?")))
        return false;
    }
    var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
    if (isChrome && isMacintosh)
      features = "";
    var href = window.location.href;
    var parts = href.split('?');
    var url = parts[0];
    href = [];
    if (parts.length > 1) {
      parts = parts[1].split("&");
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].startsWith("sysparm_query="))
          continue;
        if (parts[i].startsWith("sysparm_media="))
          continue;
        if (parts[i].startsWith("sysparm_stack="))
          continue;
        href.push(parts[i]);
      }
    }
    href.push("sysparm_stack=no");
    var veryLargeNumber = "999999999";
    href.push("sysparm_force_row_count=" + veryLargeNumber);
    href.push("sysparm_media=print");
    href.push("sysparm_query=" + this.getQuery({
      all: true
    }));
    win = window.open(url + "?" + href.join("&"), "Printer_friendly_format", features);
    win.focus();
    return false;
  },
  onLoad: function() {
    return;
  },
  onClick: function(element, ev) {
    return;
  },
  onDblClick: function(element, ev) {
    return;
  },
  onHdrCellClick: function(element, ev) {
    var sortable = (element.getAttribute('sortable') == "true");
    if (!sortable)
      return;
    var field = element.getAttribute('name');
    var dir = element.getAttribute('sort_dir');
    var type = element.getAttribute('glide_type');
    dir = this._toggleSortDir(dir, type);
    if (dir == "DESC")
      this.sortDescending(field);
    else
      this.sort(field);
  },
  onHdrCellContextMenu: function(element, ev) {
    var variables = {};
    variables['g_list'] = this;
    variables['g_fieldName'] = element.getAttribute('name');
    variables['g_fieldLabel'] = element.getAttribute('glide_label');
    variables['g_sysId'] = '';
    variables['rowSysId'] = '';
    this.headerMenu.showContextMenu(getEvent(ev), "context_list_header", variables);
    return false;
  },
  onRowContextMenu: function(element, ev) {
    var variables = {};
    variables['g_list'] = this;
    variables['g_fieldName'] = this._getFieldName(element);
    variables['g_fieldLabel'] = element.getAttribute('glide_label');
    variables['g_sysId'] = element.parentNode.getAttribute('sys_id');
    variables['rowSysId'] = variables['g_sysId'];
    this.rowMenu.showContextMenu(getEvent(ev), "context_list_row", variables);
    return false;
  },
  _getFieldName: function(element) {
    var row = element.parentNode;
    if (hasClassName(row, 'list_row_detail')) {
      var fqName = row.getAttribute('data-detail-row');
      var period = fqName.indexOf('.');
      return fqName.substring(period + 1);
    }
    return this.fieldNames[element.cellIndex];
  },
  onAllChecked: function(chk, checked) {
    this.lastChecked = null;
    var chks = this._getCheckboxes();
    for (var i = 0; i < chks.length; i++)
      chks[i].checked = checked;
  },
  onRowChecked: function(chk, checked, ev) {
    var checking = chk.checked;
    if (!checking) {
      this._setTheAllCheckbox(false);
      this.lastChecked = null;
      return;
    }
    var cBoxes = this._getCheckboxes();
    if (ev.shiftKey && this.lastChecked != chk) {
      var start = -1;
      var end = -1;
      for (var i = 0; i < cBoxes.length; i++) {
        var cBox = cBoxes[i];
        if (cBox == this.lastChecked)
          start = i;
        if (cBox == chk)
          end = i;
      }
      if (start > -1 && end > -1) {
        if (start > end) {
          var t = start;
          start = end;
          end = t;
        }
        for (var i = start; i < end; i++) {
          cBoxes[i].checked = true;
          CustomEvent.fire("list_checkbox_autochecked", cBoxes[i]);
        }
      }
    }
    this.lastChecked = chk;
    var allChecked = true;
    for (var i = 0; i < cBoxes.length; i++) {
      if (!cBoxes[i].checked) {
        allChecked = false;
        break;
      }
    }
    if (allChecked)
      this._setTheAllCheckbox(true);
    return false;
  },
  _getCheckboxes: function() {
    return document.getElementsByName('check_' + this.listID);
  },
  _setTheAllCheckbox: function(flag) {
    var chk = $('allcheck_' + this.listID);
    if (!chk)
      return;
    chk.checked = flag;
  },
  _isCell: function(element) {
    if (!element)
      return false;
    if (element.tagName.toLowerCase() != "td")
      return false;
    return hasClassName(element, "vt");
  },
  _getCellFromEvent: function(ev, eventName) {
    ev = getEvent(ev);
    var element = this._getSrcElement(ev);
    if (!element)
      return null;
    if (element.tagName.toLowerCase() != "td")
      element = findParentByTag(element, "td");
    if (!this._isCell(element))
      return null;
    if (this.fireEvent("cell." + eventName, element, ev) === false)
      return null;
    return element;
  },
  _getSrcElement: function(ev) {
    if (ev)
      return getSrcElement(ev);
    return null;
  },
  setSubmitValue: function(n, v) {
    this.submitValues[n] = v;
  },
  getSubmitValue: function(n) {
    var v = this.submitValues[n];
    if (!v)
      return '';
    return v;
  },
  getOrderBy: function() {
    if (this.orderBy.length == 0)
      return "";
    var field = this.orderBy[0].substring(7);
    if (field.startsWith("DESC"))
      field = field.substring(4);
    return field;
  },
  getListName: function() {
    return this.listName;
  },
  setListName: function(n) {
    this.listName = n;
  },
  setUserList: function(b) {
    this.userList = b;
  },
  isUserList: function() {
    return this.userList;
  },
  getTitle: function() {
    if (!this.title)
      return this.tableName;
    return this.title;
  },
  setTitle: function(title) {
    this.title = title;
  },
  getView: function() {
    return this.view;
  },
  setView: function(view) {
    this.view = view;
  },
  setProperties: function(properties) {
    this.properties = properties;
  },
  getReferringURL: function() {
    return this.referringURL || (window.location.pathname + window.location.search);
  },
  setReferringURL: function(url) {
    this.referringURL = url;
  },
  getTableName: function() {
    return this.tableName;
  },
  getParentTable: function() {
    if (!this.parentTable)
      return "";
    return this.parentTable;
  },
  getRelated: function() {
    return this.related;
  },
  setRelated: function(parentTable, related) {
    this.parentTable = parentTable;
    this.related = related;
  },
  getListControlID: function() {
    return this.listControlID;
  },
  setListControlID: function(id) {
    this.listControlID = id;
  },
  isEmbedded: function() {
    return this.embedded;
  },
  setEmbedded: function(flag) {
    this.embedded = !!flag;
  },
  addFilter: function(filter) {
    if (this.filter) {
      var parts = this.filter.split("^NQ");
      this.filter = '';
      for (var i = 0; i < parts.length; i++) {
        if (this.filter != '')
          this.filter += "^NQ";
        this.filter += (parts[i] + "^" + filter);
      }
    } else
      this.filter = filter;
  },
  setFilter: function(filter, saveOrderBy, saveGroupBy) {
    this._parseQuery(filter, saveOrderBy, saveGroupBy);
  },
  setFilterAndRefresh: function(filter) {
    this._parseQuery(filter, true, true);
    var parms = this._getRefreshParms(filter);
    this.refreshWithOrderBy(1, parms);
  },
  setDefaultFilter: function(filter) {
    this.setFilter(filter);
    var parms = this._getRefreshParms(filter, true);
    this.refresh(1, parms);
  },
  _getRefreshParms: function(filter, setAsDefaultFlag) {
    var parms = {};
    var related = this.getRelated();
    if (related) {
      var parentSysId = this.getSubmitValue('sysparm_collectionID');
      var key = this.getParentTable() + "." + parentSysId + "." + related;
      var n = 'sysparm_list_filter';
      if (setAsDefaultFlag)
        n += '_default';
      parms[n] = key + "=" + filter;
    }
    return parms;
  },
  setOrderBy: function(orderBy) {
    if (!orderBy) {
      this.orderBy = [];
      return;
    }
    this.orderBy = orderBy.split('^');
    for (var i = 0; i < this.orderBy.length; i++) {
      if (!this.orderBy[i].startsWith('ORDERBY'))
        this.orderBy[i] = 'ORDERBY' + this.orderBy[i];
    }
  },
  setGroupBy: function(groupBy) {
    if (!groupBy) {
      this.groupBy = [];
      return;
    }
    this.groupBy = groupBy.split('^');
    for (var i = 0; i < this.groupBy.length; i++) {
      if (!this.groupBy[i].startsWith('GROUPBY'))
        this.groupBy[i] = 'GROUPBY' + this.groupBy[i];
    }
  },
  setFirstRow: function(rowNum) {
    if (isNaN(rowNum))
      this.firstRow = 1;
    else
      this.firstRow = parseInt(rowNum, 10);
  },
  setRowsPerPage: function(rows) {
    if (isNaN(rows))
      this.rowsPerPage = 20;
    else
      this.rowsPerPage = parseInt(rows, 10);
    var params = {};
    params['sysparm_userpref_rowcount'] = rows;
    this._refreshAjax(1, params);
  },
  setFields: function(fields) {
    var numLeftCells = 1;
    this.fields = fields;
    this.fieldNdxs = {};
    this.fieldNames = [];
    this.fieldNames.push('');
    this.fieldNames.push('');
    numLeftCells = 2;
    var names = this.fields.split(",");
    for (var i = 0; i < names.length; i++) {
      this.fieldNdxs[names[i]] = i + numLeftCells;
      this.fieldNames.push(names[i]);
    }
  },
  toggleList: function() {
    var collapsed = this.toggleListNoPref();
    var prefName = "collapse." + this.listName;
    if (collapsed)
      setPreference(prefName, 'true');
    else
      deletePreference(prefName);
    return !collapsed;
  },
  toggleListNoPref: function() {
    toggleDivDisplay(this.listID + "_collapsed");
    var listDiv = toggleDivDisplayAndReturn(this.listID + "_expanded");
    if (!listDiv)
      return false;
    return listDiv.style.display == "none";
  },
  showHideList: function(showFlag) {
    var e = $(this.listID + "_expanded");
    if (!e)
      return;
    var shown = e.style.display != "none";
    if ((!shown && showFlag) || (shown && !showFlag))
      this.toggleList();
  },
  toggleGroups: function() {
    var a = this._getGroupToggler();
    if (!a)
      return;
    var expand = (a.getAttribute('data-expanded') != 'true');
    this.showHideGroups(expand);
  },
  showHideGroups: function(showFlag) {
    var a = this._getGroupToggler();
    if (!a)
      return;
    a.setAttribute('data-expanded', showFlag + "");
    var img = a.down('img');
    var rows = this.table.rows;
    var len = rows.length;
    var listField = this.getGroupBy().substring(7);
    var groups = new Array();
    for (var i = 0; i < len; i++) {
      var aRow = rows[i];
      if (aRow.getAttribute("group_row") != "true")
        continue;
      var id = aRow.id;
      var value = id.substring(5 + this.listID.length);
      groups.push(value);
      var state = aRow.getAttribute("collapsed");
      if ("never" === state)
        continue;
      var shown = (state != "true");
      if ((!shown && showFlag) || (shown && !showFlag))
        this._toggleGroup(this.table, aRow);
    }
    if (img) {
      if (showFlag)
        img.src = "images/list_th_down.gifx";
      else
        img.src = "images/list_th_right.gifx";
    }
    if (this.listID == this.listName)
      this._sendGroupPreference(listField, showFlag, true, groups);
  },
  toggleGroup: function(el) {
    var row = findParentByTag(el, "TR");
    if (!row)
      return;
    var table = findParentByTag(row, "TABLE");
    if (!table)
      return;
    var shown = this._toggleGroup(table, row);
    if (this.listID == this.listName) {
      var id = row.id;
      var value = id.substring(5 + this.listID.length);
      var colmn = row.getAttribute('groupField');
      var tmp = this.listID;
      this.listID = this.listID + '_' + colmn;
      this._sendGroupPreference(value, shown);
      this.listID = tmp;
    }
    CustomEvent.fire('list.section.toggle', this.table, this);
    return shown;
  },
  _getGroupToggler: function() {
    var elements = this.listDiv.select('a.list_group_toggle');
    if (elements.length == 0)
      return null;
    return elements[0];
  },
  _toggleGroup: function(table, row) {
    var shown = row.getAttribute("collapsed") != "true";
    shown = !shown;
    this._showHideGroup(table, row, shown);
    return shown;
  },
  _showHideGroup: function(table, row, showFlag) {
    var collapsed = !showFlag;
    this._showHideImage(row.id + "_group_toggle_image", showFlag);
    row.setAttribute("collapsed", collapsed + '');
    var priorCalc = null;
    var rows = table.rows;
    var len = rows.length;
    for (var i = row.rowIndex + 1; i < len; i++) {
      var aRow = $(rows[i]);
      if (aRow.getAttribute("group_row") == "true")
        break;
      if (aRow.hasClassName('calculationLine')) {
        if (priorCalc)
          break;
        priorCalc = aRow;
      }
      if (collapsed)
        aRow.style.display = "none";
      else
        aRow.style.display = "";
    }
    _frameChanged();
  },
  _showHideImage: function(id, show) {
    var img = $(id);
    if (!img)
      return;
    if (show) {
      img.src = "images/list_v2_heir_reveal.gifx";
      img.className = img.className.replace(/\bcollapsedGroup\b/, '');
    } else {
      img.src = "images/list_v2_heir_hide.gifx";
      img.className += " collapsedGroup";
    }
    if (show) {
      img.removeClassName('icon-vcr-right');
      img.addClassName('icon-vcr-down');
    } else {
      img.removeClassName('icon-vcr-down');
      img.addClassName('icon-vcr-right');
    }
  },
  _sendGroupPreference: function(groupValue, showFlag, allFlag, groups) {
    var ajax = new GlideAjax("AJAXListGrouping");
    ajax.addParam("list_id", this.listID);
    ajax.addParam("expanded", showFlag + '');
    ajax.addParam("value", groupValue);
    ajax.addParam("all", allFlag);
    if (groups)
      ajax.addParam("groups", groups)
    ajax.getXML();
  },
  toggleHierarchy: function(img, rowId, parentTable, parentSysId) {
    var row = $(rowId);
    if (!row)
      return;
    if (row.getAttribute("hierarchical") == "not_loaded") {
      row.setAttribute("hierarchical", "loaded");
      this._showHideImage(img, true);
      this._showHideHierarchy(row, true);
      this.toggleHierarchyLoadList(row, parentTable, parentSysId);
      return;
    }
    var shown = row.getAttribute("collapsed") != "true";
    shown = !shown;
    this._showHideImage(img, shown);
    this._showHideHierarchy(row, shown);
    CustomEvent.fire('list.section.toggle', this.table, this);
    return shown;
  },
  toggleHierarchyLoadList: function(row, parentTable, parentSysId) {
    this.loadList(row.firstChild, parentTable, parentSysId, "list2_hierarchical.xml", "hierarchical");
  },
  _showHideHierarchy: function(row, showFlag) {
    var collapsed = !showFlag;
    row.setAttribute("collapsed", collapsed + '');
    if (collapsed)
      row.style.display = "none";
    else
      row.style.display = "";
  },
  loadList: function(el, parentTable, parentSysId, template, listCss) {
    var ajax = new GlideAjax("AJAXJellyRunner", "AJAXJellyRunner.do");
    ajax.addParam("template", template);
    ajax.addParam('sysparm_collection', parentTable);
    ajax.addParam('sysparm_sys_id', parentSysId);
    ajax.addParam('sysparm_view', this.getView());
    if (listCss)
      ajax.addParam('sysparm_list_css', listCss);
    ajax.addParam('sys_hint_nocache', 'true');
    ajax.addParam('sysparm_stack', 'no');
    ajax.addParam('twoPhase', 'true');
    var domain = gel('sysparm_domain');
    if (domain)
      ajax.addParam('sysparm_domain', domain.value);
    el.innerHTML = GlideList2.LOADING_MSG;
    ajax.getXML(this._loadListResponse.bind(this), null, [el, parentSysId]);
  },
  _loadListResponse: function(response, args) {
    var el = args[0];
    var parentSysId = args[1];
    var html = this._getListBody(response.responseText);
    el.innerHTML = html;
    html.evalScripts(true);
    if (!GlideList2.listsMap)
      GlideList2.listsMap = {};
    var elemList = $(el).select(".tabs2_list");
    GlideList2.listsMap[parentSysId] = elemList;
  },
  actionWithSysId: function(actionId, actionName, sysId) {
    this._action(actionId, actionName, [sysId]);
  },
  action: function(actionId, actionName, allowedCheckedIds) {
    this._action(actionId, actionName, allowedCheckedIds);
  },
  _action: function(actionId, actionName, ids) {
    if (this._isSubmitted())
      return false;
    if (!ids)
      this.getChecked();
    else
      this.checkedIds = ids;
    this._createForm();
    this.addToForm('sysparm_referring_url', this.referringURL);
    this.addToForm('sysparm_query', this.getQuery({
      groupby: true
    }));
    this.addToForm('sysparm_view', this.getView());
    if (actionId)
      this.addToForm('sys_action', actionId);
    else
      this.addToForm('sys_action', actionName);
    this.doNotSubmitParams['sysparm_record_scope'] = actionName == 'sysverb_new';
    if (ids != null)
      this.addToForm('sysparm_checked_items', ids);
    else
      this.addToForm('sysparm_checked_items', this.checkedIds);
    if (this._runHandlers(actionId, actionName) === false) {
      this._cleanup();
      return false;
    }
    this._submitForm();
    this._cleanup();
    return false;
  },
  addToForm: function(n, v) {
    this.formElements[n] = v;
  },
  _isSubmitted: function() {
    return g_submitted;
  },
  _createForm: function() {
    this.formElements = {};
    this.formElements['sys_target'] = this.tableName;
    this.formElements['sys_action'] = '';
    this.formElements['sys_is_list'] = 'true';
    this.formElements['sysparm_checked_items'] = this.checkedIds;
    if (typeof g_ck != 'undefined' && g_ck != "")
      this.formElements['sysparm_ck'] = g_ck;
    this.form = $("form_" + this.listID);
    if (this.form)
      rel(this.form);
    this.form = cel("form", this.listDiv);
    this.form.id = "form_" + this.listID;
    this.form.method = "POST";
    this.form.action = this.tableName + "_list.do";
    return;
  },
  _runHandlers: function(actionId, actionName) {
    return CustomEvent.fire("list.handler", this, actionId, actionName);
  },
  submit: function(parms) {
    if (this._isSubmitted())
      return false;
    this._createForm();
    this.addToForm('sysparm_query', this.getQuery({
      groupby: true
    }));
    for (var n in parms)
      this.addToForm(n, parms[n]);
    this._submitForm();
    this._cleanup();
    return false;
  },
  _submitForm: function(method) {
    for (var n in this.submitValues) {
      if (this.doNotSubmitParams[n])
        continue;
      this.addToForm(n, this.submitValues[n]);
    }
    for (var n in this.formElements) {
      var v = this.formElements[n];
      if (!v)
        v = '';
      var opt = document.createElement('input');
      opt.type = "HIDDEN";
      opt.name = n;
      opt.id = n;
      opt.value = v;
      this.form.appendChild(opt);
    }
    g_list = this;
    g_submitted = true;
    try {
      if (method)
        this.form.method = method;
      this.form.submit();
    } catch (ex) {}
  },
  _cleanup: function() {
    this.formElements = {};
    g_submitted = false;
  },
  sort: function(field) {
    this._sort(field, "");
  },
  sortDescending: function(field) {
    this._sort(field, "DESC");
  },
  refresh: function(firstRow, additionalParms) {
    this._refresh(firstRow, additionalParms, false);
  },
  refreshWithOrderBy: function(firstRow, additionalParms) {
    this._refresh(firstRow, additionalParms, true);
  },
  _refresh: function(firstRow, additionalParms, includeOrderBy) {
    if (this.refreshPage)
      this._refreshPage(firstRow, additionalParms, includeOrderBy);
    else
      this._refreshAjax(firstRow, additionalParms, includeOrderBy);
  },
  _refreshPage: function(firstRow, additionalParms, includeOrderBy) {
    if (typeof firstRow != "undefined")
      this.firstRow = this._validateFirstRow(firstRow);
    var url = new GlideURL(this.tableName + "_list.do");
    url.addParam('sysparm_query', this.getQuery({
      orderby: includeOrderBy,
      groupby: true
    }));
    url.addParam('sysparm_first_row', this.firstRow);
    url.addParam('sysparm_view', this.view);
    var q = this.submitValues['sysparm_fixed_query'];
    if (q)
      url.addParam('sysparm_fixed_query', q);
    var css = this.submitValues['sysparm_list_css'];
    if (css)
      url.addParam('sysparm_list_css', css);
    var queryNoDomain = this.submitValues['sysparm_query_no_domain'];
    if (queryNoDomain)
      url.addParam('sysparm_query_no_domain', queryNoDomain);
    var s = url.getURL(additionalParms);
    window.location.href = s;
    if (window.GwtListEditor && GwtListEditor.forPage && !GwtListEditor.forPage.isDirty())
      this._showLoading();
  },
  _refreshAjax: function(firstRow, additionalParms, includeOrderBy) {
    this._showLoading();
    if (this.isHierarchical())
      if ($(this.listName + "filterdiv"))
        $(this.listName + "filterdiv").setAttribute("gsft_empty", "true");
    if (typeof firstRow != "undefined")
      this.firstRow = this._validateFirstRow(firstRow);
    var ajax = new GlideAjax('', this.tableName + '_list.do');
    for (var n in this.submitValues)
      ajax.addParam(n, this.submitValues[n]);
    var query = this.getQuery({
      orderby: includeOrderBy,
      groupby: true
    });
    ajax.addParam('sysparm_view', this.view);
    ajax.addParam('sysparm_query', query);
    ajax.addParam('sysparm_first_row', this.firstRow);
    ajax.addParam('stackparm_sysparm_first_row', this.firstRow);
    ajax.addParam('sysparm_properties', this.properties);
    ajax.addParam('sysparm_refresh', 'true');
    ajax.addParam('sys_hint_nocache', 'true');
    ajax.addParam('sysparm_stack', 'no');
    ajax.addParam('sysparm_list_type', (this.isHierarchical() ? "hierarchical" : ""));
    ajax.setErrorCallback(this._errorResponse.bind(this));
    ajax.getXML(this._refreshResponse.bind(this), additionalParms);
  },
  _refreshResponse: function(response) {
    this._hideLoading();
    CustomEvent.fire('partial.page.savePreviousEditor', this.table, this);
    var e = $(this.listID);
    e = e.down("table");
    e = e.parentNode;
    var html = this._getListBody(response.responseText);
    e.innerHTML = html;
    this._initList();
    html.evalScripts(true);
    var nav = $("list_nav_" + this.listID);
    var canHideNav = $(this.table).getAttribute("can_hide_nav") == "true";
    if (this.totalRows == 0 && canHideNav) {
      if (nav && nav.visible())
        nav.toggle();
    } else {
      if (nav && !nav.visible())
        nav.toggle();
      this._restoreColumnHeaderToggleState();
    }
    var groupedTotalRowsElem = $(this.listID + "_total_grouped_rows_count");
    if (groupedTotalRowsElem)
      $(this.listID + "_total_grouped_rows_count").update($(this.listID + "_table").getAttribute("grand_total_rows"));
    this.fireEvent('partial.page.reload', this.table, this);
    CustomEvent.fire('partial.page.reload', this.table, this);
    this._fireListReady();
    _frameChanged();
    CustomEvent.fire('list_content_changed');
  },
  _errorResponse: function(response) {
    this._hideLoading();
  },
  _getListBody: function(text) {
    var startPos = text.indexOf(GlideList2.LIST_BODY_START);
    if (startPos == -1)
      return "";
    startPos += GlideList2.LIST_BODY_START.length;
    var endPos = text.indexOf(GlideList2.LIST_BODY_END);
    if (startPos == -1 || endPos == -1 || startPos >= endPos)
      return "";
    return text.substring(startPos, endPos);
  },
  _sort: function(field, dir) {
    var parms = {};
    this.setOrderBy(dir + field);
    parms['sysparm_userpref.' + this.tableName + '.db.order'] = field;
    parms['sysparm_userpref.' + this.tableName + '.db.order.direction'] = dir;
    CustomEvent.fire('list.sort.fired', this.table, this);
    this._refreshAjax(1, parms);
  },
  _setRowCounts: function() {
    this.firstRow = this._getAttributeInt(this.table, "first_row", 1);
    this.lastRow = this._getAttributeInt(this.table, "last_row", 0);
    this.rowsPerPage = this._getAttributeInt(this.table, "rows_per_page", 20);
    this.totalRows = this._getAttributeInt(this.table, "total_rows", 0);
    this.grandTotalRows = this._getAttributeInt(this.table, "grand_total_rows", 0);
    var e = $(this.listID + "_collapsed_title");
    if (!e)
      return;
    if (this.totalRows == 0)
      e.innerHTML = this.getTitle();
    else
      e.innerHTML = this.getTitle() + " (" + this.totalRows + ")";
  },
  _clear: function() {
    this.lastChecked = null;
    this.table = null;
    if (this.loadingDiv)
      this.loadingDiv = null;
  },
  _getAttributeInt: function(e, n, defaultValue) {
    if (!e)
      return defaultValue;
    var v = e.getAttribute(n);
    if (isNaN(v))
      return defaultValue;
    return parseInt(v);
  },
  _initList: function() {
    this.table = $(this.listID + "_table");
    this.table.onclick = this.onclickFunc;
    this.table.ondblclick = this.ondblclickFunc;
    this._updateQuery();
    this._setRowCounts();
    this._setSortIndicator();
    CustomEvent.fire('list2_init', this);
  },
  _getRowRecord: function(el) {
    var tr = el.up('tr');
    return {
      sysId: tr.readAttribute('sys_id'),
      target: tr.readAttribute('record_class')
    };
  },
  _parseQuery: function(queryString, saveOrderBy, saveGroupBy) {
    queryString = queryString || "";
    var q = this._separateIntoTerms(queryString);
    var filter = [];
    var orderBy = [];
    var groupBy = [];
    for (var i = 0; i < q.length; i++) {
      var term = q[i];
      if (term == "EQ")
        continue;
      if (term.indexOf("ORDERBY") == 0) {
        if (saveOrderBy)
          orderBy.push(term);
        this.orderBySet = true;
        continue;
      }
      if (term.indexOf("GROUPBY") == 0) {
        if (saveGroupBy)
          groupBy.push(term);
        continue;
      }
      term = this._escapeEmbeddedQueryTermSeparator(term);
      filter.push(term);
    }
    this.filter = filter.join("^");
    if (saveOrderBy)
      this.setOrderBy(orderBy.join('^'));
    if (saveGroupBy)
      this.setGroupBy(groupBy.join('^'));
  },
  _escapeEmbeddedQueryTermSeparator: function(s) {
    s = s.replace(/(\w)\^(\w)/g, "$1^^$2");
    return s;
  },
  _separateIntoTerms: function(queryString) {
    var terms = [];
    var startIndex = 0;
    while (queryString.substring(startIndex).length > 0) {
      var separatorIndex = queryString.indexOf("^", startIndex);
      if (separatorIndex == -1) {
        terms.push(queryString.substring(startIndex));
        break;
      } else if (separatorIndex == queryString.length - 1) {
        terms.push(queryString.substring(startIndex, separatorIndex));
        break;
      }
      if (separatorIndex < queryString.length - 1) {
        while (queryString.charAt(separatorIndex + 1) == '^') {
          separatorIndex = queryString.indexOf('^', separatorIndex + 2);
        }
        if (separatorIndex == -1)
          separatorIndex = queryString.length;
        var term = queryString.substring(startIndex, separatorIndex);
        term = term.replace(/\^\^/g, "^");
        terms.push(term);
        if (++separatorIndex > queryString.length)
          separatorIndex = queryString.length;
        startIndex = separatorIndex;
      }
    }
    return terms;
  },
  _updateQuery: function() {
    var q = this.table.getAttribute('query');
    if (!q)
      q = "";
    this._parseQuery(q);
  },
  _setSortIndicator: function() {
    this.sortBy = this.table.getAttribute('sort');
    if (!this.sortBy)
      return;
    if (this.sortBy.startsWith(this.tableName + "."))
      this.sortBy = this.sortBy.substring(this.tableName.length + 1);
    this.sortDir = this.table.getAttribute('sort_dir');
    if (!this.sortDir)
      this.sortDir = "";
    var e = this.getHeaderCell(this.sortBy);
    if (!e)
      return;
    var sortable = (e.getAttribute('sortable') == "true");
    if (!sortable)
      return;
    e.setAttribute('sort_dir', this.sortDir);
    var img = $(e).down('img');
    var span = $(e).down('span.sort-icon').down('i');
    if (this.sortDir == "ASC") {
      span.removeClassName('icon-vcr-down');
      span.addClassName('icon-vcr-up');
    } else {
      span.removeClassName('icon-vcr-up');
      span.addClassName('icon-vcr-down');
    }
    span.style.visibility = "visible";
  },
  _toggleSortDir: function(dir, type) {
    if (dir == "ASC")
      return "DESC";
    if (dir == "DESC")
      return "ASC";
    if (dateTypes[type])
      return "DESC";
    return "ASC";
  },
  _validateFirstRow: function(row) {
    if (isNaN(row))
      return 1;
    row = parseInt(row, 10);
    if (row > this.totalRows)
      row = (this.totalRows - this.rowsPerPage) + 1;
    if (row < 1)
      row = 1;
    return row;
  },
  _showLoading: function() {
    if (!this.listContainer)
      return;
    var b = getBounds(this.listContainer, false);
    if (!this.loadingDiv) {
      this.loadingDiv = cel("div");
      addChild(this.loadingDiv);
    }
    this.loadingDiv.className = "list_loading";
    this.loadingDiv.style.top = b.top;
    this.loadingDiv.style.left = b.left;
    this.loadingDiv.style.width = b.width;
    this.loadingDiv.style.height = b.height;
    showObject(this.loadingDiv);
  },
  _hideLoading: function() {
    if (!this.loadingDiv)
      return;
    hideObject(this.loadingDiv);
  },
  toggleColumnHeader: function() {
    var columnHeader = $("hdr_" + this.listID);
    setPreference("show.column.header", !columnHeader.visible());
    columnHeader.toggle();
    columnHeader.setAttribute('data-show_column_header', columnHeader.visible() ? '' : 'false');
    GlideList2.listHeaderVisibility["hdr_" + this.listID] = columnHeader.visible();
  },
  _restoreColumnHeaderToggleState: function() {
    var columnHeader = $("hdr_" + this.listID);
    if (!(typeof GlideList2.listHeaderVisibility["hdr_" + this.listID] == "undefined")) {
      if (columnHeader.visible() && !GlideList2.listHeaderVisibility["hdr_" + this.listID])
        this.toggleColumnHeader();
      else if (!columnHeader.visible() && GlideList2.listHeaderVisibility["hdr_" + this.listID])
        this.toggleColumnHeader();
    }
  },
  setCurrentRelatedList: function() {
    var relatedParentRecordClass = $(this.listID + "_table").getAttribute("parent_table");
    var relatedListName = $(this.listID + "_table").getAttribute("hier_list_name");
    setPreference("selected.related.list." + relatedParentRecordClass, relatedListName);
  },
  getCurrentRelatedList: function() {
    var relatedParentRecordClass = $(this.listID + "_table").getAttribute("parent_table");
    return getPreference("selected.related.list." + relatedParentRecordClass);
  },
  listMechanicClick: function(element) {
    window.g_table = element.getAttribute('data-table');
    window.g_list_parent_id = element.getAttribute('data-parent-id');
    window.g_list_parent = element.getAttribute('data-parent-table');
    window.g_list_view = element.getAttribute('data-view');
    window.g_list_relationship = element.getAttribute('data-relationship');
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var g = new dialogClass('list_mechanic');
    g.setTitle(element.getAttribute('data-title'));
    g.render();
    g.on('bodyrendered', function() {
      _frameChanged();
    });
  },
  setChannelDiscriminator: function(discriminator) {
    this.channelName = 'list';
    if (typeof discriminator === "string")
      this.channelName += '-' + discriminator;
    this._initMessageBus();
  },
  _initMessageBus: function() {
    if (typeof this.messageBus === 'object' && this.messageBus)
      this.messageBus.destroy();
    this.messageBus = null;
    if (!NOW.MessageBus)
      return;
    this.messageBus = NOW.MessageBus.channel(this.channelName || 'list');
    this.messageBus.subscribe('list.switch', this._onMessageSwitch.bind(this));
    this.messageBus.subscribe('list.refresh', function() {
      this._refreshAjax(undefined, undefined, true);
    }.bind(this));
    this.messageBus.subscribe('record.highlight.select', function(payload) {
      var table = payload.table;
      var sysId = payload.record.sys_id;
      this._highlightSelectedRow(table, sysId);
    }.bind(this));
    this.messageBus.subscribe('record.highlight.unselect', function(payload) {
      this._highlightSelectedRow();
    }.bind(this));
    this.messageBus.subscribe('record.highlight.hover', function(payload) {
      var sysId = payload.record.sys_id;
      var el = window.$$('tr[sys_id="' + sysId + '"]');
      if (el[0])
        this._addHoveredRowHighlight(el[0]);
    }.bind(this));
    this.messageBus.subscribe('record.highlight.unhover', function(payload) {
      this._removeHoveredRowHighlight();
    }.bind(this));
  },
  _publishMessage: function(topic, payload) {
    if (this.messageBus)
      this.messageBus.publish(topic, payload);
  },
  _addHoveredRowHighlight: function(el) {
    el.addClassName('hover');
    var id = el.getAttribute("id");
    if (id) {
      var hierRow = $("hier_" + id);
      if (hierRow)
        hierRow.addClassName('hoverHier');
      var sysId = id.substr(id.lastIndexOf('_') + 1);
      this._publishMessage('record.highlight.hovered', {
        table: this.tableName,
        record: {
          sys_id: sysId
        }
      })
    }
  },
  _removeHoveredRowHighlight: function(el) {
    window.$$('.list_row.hover').each(function(elem) {
      elem.removeClassName('hover');
      var id = el.getAttribute("id");
      if (id) {
        var hierRow = $("hier_" + id);
        if (hierRow)
          hierRow.removeClassName('hoverHier');
        var sysId = id.substr(id.lastIndexOf('_') + 1);
        this._publishMessage('record.highlight.unhovered', {
          table: this.tableName,
          record: {
            sys_id: sysId
          }
        })
      }
    }.bind(this));
    window.$$('.hoverHier').each(function(elem) {
      elem.removeClassName('hoverHier');
    });
  },
  _highlightSelectedRow: function(table, sysId) {
    var self = this;
    var LIST_ITEM_SELECTED_CLASS = 'ui11_list_item_selected';
    clearHighlight();
    if (this.tableName !== table)
      return;
    highlightRow(sysId);
    this._publishMessage('record.highlight.selected', {
      table: table,
      record: {
        sys_id: sysId
      }
    });

    function highlightRow(sysId) {
      var e = $j('tr[sys_id="' + sysId + '"]');
      if (e.length) {
        e.addClass(LIST_ITEM_SELECTED_CLASS);
      } else {
        window.$$('a[sys_id="' + sysId + '"]').each(function(elem) {
          elem.up('td').addClassName(LIST_ITEM_SELECTED_CLASS);
        });
      }
    }

    function clearHighlight() {
      var e = $j('.' + LIST_ITEM_SELECTED_CLASS);
      e.removeClass(LIST_ITEM_SELECTED_CLASS);
      $j.each(e, function(index, elem) {
        var sysId = elem.getAttribute("sys_id");
        self._publishMessage('record.highlight.unselected', {
          table: table,
          record: {
            sys_id: sysId
          }
        });
      })
    }
  },
  _onMessageSwitch: function(data) {
    if (data.table != this.tableName)
      return;
    if (data.filter)
      this.setFilter(data.filter, true, true);
    var desiredFirstRow = this.firstRow;
    if (data.page)
      desiredFirstRow = data.page * this.rowsPerPage + 1;
    this.refreshWithOrderBy(desiredFirstRow);
  },
  _fireListReady: function() {
    this._publishMessage('list.ready', {
      table: this.getTableName(),
      filter: this.getQuery(),
      view: this.getView(),
      records: this._getRecords()
    });
  },
  _getRecords: function() {
    var records = [];
    this.table.select('tr.list_row').each(function(el) {
      var id = el.getAttribute('sys_id');
      records.push({
        sys_id: id
      });
    });
    return records;
  },
  type: 'GlideList2'
});
GlideList2.listHeaderVisibility = {};;
/*! RESOURCE: /scripts/classes/GlideList2Statics.js */
var GlideLists2 = {};
GlideList2.LIST_BODY_START = "<!--LIST_BODY_START-->";
GlideList2.LIST_BODY_END = "<!--LIST_BODY_END-->";
GlideList2.LOADING_MSG = "<div class='list_loading_div'>Loading...<img src='images/ajax-loader.gifx' alt='Loading...' style='padding-left: 2px;'></div>";
GlideList2.unload = function() {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    list.destroy();
    GlideLists2[id] = null;
  }
  g_list = null;
  GlideLists2 = {};
  CustomEvent.un("print.grouped.headers", GlideList2.breakGroupHeader);
}
GlideList2.get = function(idOrElement) {
  if (typeof idOrElement == 'string')
    return GlideLists2[idOrElement];
  return GlideList2._getByElement(idOrElement);
}
GlideList2.getIdByElement = function(element) {
  element = $(element);
  if (!element)
    return null;
  var div = element;
  do {
    div = findParentByTag(div, 'div');
    if (!div)
      break;
    var type = getAttributeValue(div, "type");
    if (type == "list_div")
      break;
  } while (div);
  if (!div)
    return null;
  return div.id;
}
GlideList2.getByName = function(name) {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    if (list.getListName() == name)
      return list;
  }
  return null;
}
GlideList2.getListsForTable = function(table) {
  var lists = [];
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    if (list.getTableName() == table)
      lists.push(list);
  }
  return lists;
}
GlideList2._getByElement = function(element) {
  var id = this.getIdByElement(element);
  if (!id)
    return null;
  return GlideLists2[id];
}
GlideList2.breakGroupHeader = function(checkedFlag) {
  var breakStyle = "auto";
  if (checkedFlag)
    breakStyle = "always";
  var tds = document.getElementsByTagName("td");
  var len = tds.length;
  var first = true;
  for (var i = 0; i < len; i++) {
    var td = tds[i];
    if (getAttributeValue(td, "group_row_td") != "true")
      continue;
    if (first)
      first = false;
    else
      td.style.pageBreakBefore = breakStyle;
  }
  return false;
}
GlideList2.toggleAll = function(expandFlag) {
  for (var id in GlideLists2) {
    var list = GlideLists2[id];
    list.showHideList(expandFlag);
  }
}
GlideList2.updateCellContents = function(cell, data) {
  $(cell).setStyle({
    backgroundColor: '',
    cssText: data.getAttribute('style')
  });
  var work = document.createElement('div');
  cell.innerHTML = '';
  for (var child = data.firstChild; child; child = child.nextSibling) {
    work.innerHTML = getXMLString(child);
    if (work.firstChild !== null)
      cell.appendChild(work.firstChild);
  }
  cell.innerHTML.evalScripts(true);
  cell.removeClassName('list_edit_dirty');
  CustomEvent.fire("list_cell_changed", cell);
};
/*! RESOURCE: /scripts/classes/GlideList2Handlers.js */
var GlideList2NewHandler = Class.create();
GlideList2NewHandler.prototype = {
  initialize: function() {
    CustomEvent.observe("list.handler", this.process.bind(this));
  },
  process: function(list, actionId, actionName) {
    if (actionName == "sysverb_new")
      list.addToForm("sys_id", "-1");
    return true;
  },
  type: 'GlideList2NewHandler'
};
var GlideList2ChecksHandler = Class.create();
GlideList2ChecksHandler.prototype = {
  initialize: function() {
    CustomEvent.observe("list.handler", this.process.bind(this));
  },
  process: function(list, actionId, actionName) {
    if (!actionName.startsWith("sysverb")) {
      var keys = ['No records selected', 'Delete the selected item?', 'Delete these', 'items?'];
      var msgs = getMessages(keys);
      if (list.checkedIds == '') {
        alert(msgs["No records selected"]);
        return false;
      }
      if (actionName == "delete_checked") {
        var items = list.checkedIds.split(",");
        if (items.length == 1) {
          if (!confirm(msgs["Delete the selected item?"]))
            return false;
        } else if (items.length > 0) {
          if (!confirm(msgs["Delete these"] + " " + items.length + " " + msgs["items?"]))
            return false;
        }
      }
    }
    list.addToForm('sysparm_checked_items', list.checkedIds);
    return true;
  },
  type: 'GlideList2ChecksHandler'
};
var GlideList2SecurityHandler = Class.create();
GlideList2SecurityHandler.prototype = {
  initialize: function() {
    CustomEvent.observe("list.handler", this.process.bind(this));
  },
  process: function(list, actionId, actionName) {
    var element = null;
    if (actionId)
      element = $(actionId);
    if (!element)
      element = $(actionName);
    if (element) {
      var gsftc = element.getAttribute('gsft_condition');
      if (gsftc != null && gsftc != 'true')
        return;
    }
    if (list.checkedIds.length == 0)
      return true;
    var sysIds = list.checkedIds;
    var ajax = new GlideAjax("AJAXActionSecurity");
    ajax.addParam("sys_target", list.getTableName());
    ajax.addParam("sys_action", actionId);
    ajax.addParam("sysparm_checked_items", sysIds);
    ajax.addParam("sysparm_view", list.getView());
    ajax.addParam("sysparm_query", list.getSubmitValue("sysparm_fixed_query"));
    ajax.addParam("sysparm_referring_url", list.getReferringURL());
    ajax.addParam("sys_is_related_list", list.getSubmitValue("sys_is_related_list"));
    ajax.addParam("sysparm_collection_related_file", list.getSubmitValue("sysparm_collection_related_file"));
    ajax.addParam("sysparm_collection_key", list.getSubmitValue("sysparm_collection_key"));
    ajax.addParam("sysparm_collection_relationship", list.getSubmitValue("sysparm_collection_relationship"));
    ajax.addParam("sysparm_target", list.getTableName());
    var xml = ajax.getXMLWait();
    var answer = {};
    var root = xml.getElementsByTagName("action_" + actionId)[0];
    var keys = root.childNodes;
    var validIds = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var id = key.getAttribute('sys_id');
      if (key.getAttribute('can_execute') == 'true')
        validIds.push(id);
    }
    if (validIds.length == sysIds.length)
      return true;
    if (validIds.length == 0) {
      var m = new GwtMessage().getMessage('Security does not allow the execution of that action against the specified record');
      if (validIds.length > 1)
        m = m + 's';
      alert(m);
      return false;
    }
    var sysIds = sysIds.split(',');
    if (validIds.length != sysIds.length) {
      var m = new GwtMessage().getMessage('Security allows the execution of that action against {0} of {1} records. Proceed?', validIds.length, sysIds.length);
      list.addToForm('sysparm_checked_items', validIds.join(','));
      return confirm(m);
    }
    return true;
  },
  type: 'GlideList2SecurityHandler'
};;
/*! RESOURCE: /scripts/classes/GlideListWidget.js */
var GlideListWidget = Class.create();
GlideListWidget.prototype = {
  initialize: function(widgetID, listID) {
    this.widgetID = widgetID;
    this.listID = listID;
    GlideListWidgets[this.widgetID] = this;
    CustomEvent.observe('list.loaded', this.refresh.bind(this));
    CustomEvent.observe('partial.page.reload', this.refreshPartial.bind(this));
  },
  refresh: function(listTable, list) {
    if (!list || !list.listID)
      return;
    if (list.listID != this.listID)
      return;
    this._refresh(listTable, list, true);
  },
  refreshPartial: function(listTable, list) {
    if (!list || !list.listID)
      return;
    if (list.listID != this.listID)
      return;
    this._refresh(listTable, list, false);
  },
  _refresh: function(listTable, list, isInitialLoad) {},
  _getElement: function(n) {
    return $(this.widgetID + "_" + n);
  },
  _getValue: function(n) {
    var e = this._getElement(n);
    if (!e)
      return "";
    return e.value;
  },
  _setValue: function(n, v) {
    var e = this._getElement(n);
    if (!e)
      return;
    e.value = v;
  },
  _setInner: function(n, v) {
    var e = this._getElement(n);
    if (!e)
      return;
    e.innerHTML = v;
  },
  type: 'GlideListWidget'
}
var GlideListWidgets = {};
GlideListWidget.get = function(id) {
  return GlideListWidgets[id];
};
/*! RESOURCE: /scripts/classes/GlideWidgetVCR.js */
var GlideWidgetVCR = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID) {
    $super(widgetID, listID);
    this.backAllowed = false;
    this.nextAllowed = false;
    this._initEvents();
    CustomEvent.observe("list_v2.orderby.update", this._updateOrderBy.bind(this));
  },
  gotoAction: function(ev, el) {
    ev.preventDefault();
    var action = el.name.substring(4);
    if (!this.backAllowed && ((action == 'first') || (action == 'back')))
      return;
    if (!this.nextAllowed && ((action == 'next') || (action == 'last')))
      return;
    var list = GlideList2.get(this.listID);
    var row;
    if (action == 'first')
      row = 1;
    else if (action == 'back')
      row = list.firstRow - list.rowsPerPage;
    else if (action == 'next')
      row = list.firstRow + list.rowsPerPage;
    else if (action == 'last')
      row = (list.totalRows + 1) - list.rowsPerPage;
    else
      return;
    list._refreshAjax(row, {}, true);
  },
  gotoRow: function(ev) {
    ev = getEvent(ev);
    if (!ev || ev.keyCode != 13)
      return;
    ev.stop();
    var row = this._getElement('first_row').value;
    if (isNaN(row))
      row = 1;
    var list = GlideList2.get(this.listID);
    list._refreshAjax(row, {}, true);
  },
  _initEvents: function() {
    this.span = $(this.widgetID + "_vcr");
    if (!this.span)
      return;
    this.span.on('click', "[data-nav=true]", this.gotoAction.bind(this));
    var input = this.span.getElementsByTagName("INPUT")[0];
    $(input).observe('keypress', this.gotoRow.bind(this));
  },
  _refresh: function(listTable, list) {
    if (this.span.innerHTML == "")
      this.span = $(this.widgetID + "_vcr");
    if (list.totalRows == 0) {
      this._setVisible(false);
      this._setRepVisible(false);
    } else if (list.totalRows <= list.rowsPerPage && GlideList2.get(this.listID).isHierarchical()) {
      this._setVisible(false);
      if (this._setRepVisible(true, list.totalRows))
        this._setInner('rep_total_rows', list.totalRows);
    } else {
      this._setVisible(true);
      this._setRepVisible(false);
      this.backAllowed = (list.firstRow > 1);
      this.nextAllowed = (list.lastRow < list.totalRows);
      this._setRowNumbers(list);
      var images = $(this.span).select("[data-nav=true]");
      if (images && images.length) {
        this._setAction(images[0], this.backAllowed);
        this._setAction(images[1], this.backAllowed);
        this._setAction(images[2], this.nextAllowed);
        this._setAction(images[3], this.nextAllowed);
      }
    }
  },
  _setRowNumbers: function(list) {
    var lastRow = $(this.widgetID + '_last_row'),
      totalRows = $(this.widgetID + '_total_rows'),
      firstRow = $(this.widgetID + '_first_row');
    if (lastRow)
      lastRow.innerHTML = list.lastRow;
    if (totalRows)
      totalRows.innerHTML = list.totalRows;
    if (firstRow)
      firstRow.value = list.firstRow;
  },
  _setAction: function(img, allowed) {
    if (img.tagName.toLowerCase() == "img") {
      if (allowed) {
        img.addClassName("pointerhand");
        this._removeDis(img);
      } else {
        img.removeClassName("pointerhand");
        this._addDis(img);
      }
    } else {
      if (!allowed)
        img.addClassName("tab_button_disabled");
      else
        img.removeClassName("tab_button_disabled");
    }
  },
  _removeDis: function(img) {
    var src = img.src;
    if (src.indexOf('_dis.gifx') != -1)
      img.src = src.replace(/\_dis\.gifx/i, ".gifx");
  },
  _addDis: function(img) {
    var src = img.src;
    if (src.indexOf('_dis.gifx') == -1)
      img.src = src.replace(/\.gifx/i, "_dis.gifx");
  },
  _setVisible: function(flag) {
    var e = this.span;
    if (!e)
      return;
    if ((flag && !e.visible()) || (!flag && e.visible()))
      e.toggle();
  },
  _setRepVisible: function(flag, total_rows) {
    var e = $(this.widgetID + "_rep_vcr");
    if (!e)
      return false;
    if ((flag && !e.visible()) || (!flag && e.visible()))
      e.toggle();
    if (!flag)
      return true;
    var showPlural = false;
    var showSingular = false;
    if (total_rows > 1)
      showPlural = flag;
    else
      showSingular = flag;
    var e = $(this.widgetID + "_rep_plural_label");
    if (e)
      if ((showPlural && !e.visible()) || (!showPlural && e.visible()))
        e.toggle();
    var e = $(this.widgetID + "_rep_singular_label");
    if (e)
      if ((showSingular && !e.visible()) || (!showSingular && e.visible()))
        e.toggle();
    return true;
  },
  _updateOrderBy: function(orderBy) {
    var list = GlideList2.get(this.listID);
    if (list)
      list.setOrderBy(orderBy);
  },
  type: 'GlideWidgetVCR'
});;
/*! RESOURCE: /scripts/classes/GlideWidgetActions.js */
var GlideWidgetActions = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, ofText) {
    $super(widgetID, listID);
    this.ofText = ofText;
    this.securityActions = {};
  },
  _refresh: function(listTable, list) {
    this.securityActions = {};
    list._setTheAllCheckbox(false);
  },
  actionCheck: function(select) {
    if (select.getAttribute('gsft_sec_check') == 'true')
      return;
    select.setAttribute('gsft_sec_check', 'true');
    var actions = [];
    var sysIds = [];
    var list = GlideList2.get(this.listID);
    var checkedIds = list.getChecked();
    if (checkedIds)
      sysIds = checkedIds.split(",");
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      if (getAttributeValue(opt, 'gsft_is_action') != 'true')
        continue;
      if (this._checkAction(opt, sysIds))
        actions.push(opt);
    }
    if (actions.length > 0) {
      var actionIds = [];
      for (var i = 0; i < actions.length; i++)
        actionIds.push(actions[i].id);
      this._canExecute(actionIds, sysIds, list.tableName);
      for (var i = 0; i < actions.length; i++) {
        var opt = actions[i];
        var validIds = this.securityActions[opt.id];
        opt.style.color = "";
        if (!validIds || (validIds.length == 0)) {
          opt.style.color = '#777';
          opt.disabled = true;
        } else if (validIds.length == sysIds.length) {
          opt.disabled = false;
          opt.innerHTML = getAttributeValue(opt, 'gsft_base_label');
          opt.setAttribute('gsft_allow', '');
        } else {
          opt.disabled = false;
          opt.innerHTML = getAttributeValue(opt, 'gsft_base_label') + ' (' + validIds.length + ' ' + this.ofText + ' ' + sysIds.length + ')';
          opt.setAttribute('gsft_allow', validIds.join(','));
        }
      }
    }
    select.focus();
  },
  _checkAction: function(opt, sysIds) {
    if (sysIds.length == 0) {
      opt.disabled = true;
      opt.innerHTML = getAttributeValue(opt, 'gsft_base_label');
      opt.style.color = '#777';
      return false;
    }
    if (getAttributeValue(opt, 'gsft_check_condition') != 'true') {
      opt.disabled = false;
      opt.style.color = '';
      return false;
    }
    return true;
  },
  _canExecute: function(actionIds, sysIds, tableName) {
    var ajax = new GlideAjax("AJAXActionSecurity");
    ajax.addParam("sys_target", tableName);
    ajax.addParam("sys_action", actionIds.join(","));
    ajax.addParam("sysparm_checked_items", sysIds.join(','));
    var xml = ajax.getXMLWait();
    var answer = {};
    for (var n = 0; n < actionIds.length; n++) {
      var actionId = actionIds[n];
      var root = xml.getElementsByTagName("action_" + actionId)[0];
      var keys = root.childNodes;
      this.securityActions[actionId] = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var id = key.getAttribute('sys_id');
        if (key.getAttribute('can_execute') == 'true')
          this.securityActions[actionId].push(id);
      }
    }
  },
  runAction: function(select) {
    var opt = getSelectedOption(select);
    if (!opt)
      return false;
    if (opt.id == 'ignore' || (!opt.value && !opt.text))
      return false;
    if (opt.disabled)
      return false;
    var list = GlideList2.get(this.listID);
    if (!list)
      return false;
    var id = opt.id;
    var name = getAttributeValue(opt, 'action_name');
    if (!name)
      name = id;
    if (getAttributeValue(opt, 'client') == 'true') {
      g_list = list;
      var href = getAttributeValue(opt, 'href');
      eval(href);
      g_list = null;
    } else {
      var ids = opt.getAttribute('gsft_allow');
      list.action(id, name, ids);
    }
    return false;
  },
  type: 'GlideWidgetActions'
});;
/*! RESOURCE: /scripts/classes/GlideWidgetSearch.js */
var GlideWidgetSearch = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, focusOnRefresh) {
    $super(widgetID, listID);
    this.field = "";
    this.focusOnRefresh = (focusOnRefresh == 'true');
    this._initEvents();
  },
  _refresh: function(listTable, list, isInitialLoad) {
    var field = list.sortBy;
    if (!field)
      field = 'zztextsearchyy';
    this._setSelect(field);
    this._setTitle();
    this._clearText();
    if (this.focusOnRefresh) {
      var e = this._getElement("text");
      try {
        e.focus();
      } catch (er) {}
    }
  },
  _initEvents: function() {
    this._getElement('select').observe('change', this._setTitle.bind(this));
    var text = this._getElement('text');
    text.observe('keypress', this.searchKeyPress.bind(this));
    var a = text.nextSibling;
    var spn = text.previousSibling;
    if (spn && spn.tagName.toUpperCase() == "SPAN")
      $(spn).observe('click', this.search.bind(this));
    while (a && a.tagName.toUpperCase() != "A")
      a = a.nextSibling;
    if (!a)
      return;
    var a = $(a);
    a.observe('click', this.search.bind(this));
  },
  searchKeyPress: function(ev) {
    if (!ev || ev.keyCode != 13)
      return;
    return this.search(ev);
  },
  search: function(ev) {
    var select = new Select(this._getElement('select'));
    var value = this._getValue("text");
    if (!value)
      return;
    ev.stop();
    var field = select.getValue();
    var list = GlideList2.get(this.listID);
    var parms = {};
    parms['sysparm_goto_query'] = value;
    parms['sysparm_goto_field'] = field;
    parms['sys_target'] = list.tableName;
    parms['sysparm_userpref.' + list.tableName + '.db.order'] = field;
    parms['sysparm_query'] = list.getQuery({
      groupby: true
    });
    CustomEvent.fire('list_v2.orderby.update', field);
    this._clearText();
    list.refresh(1, parms);
  },
  setTitle: function() {
    this._setTitle();
  },
  _clearText: function() {
    this._setValue('text', '');
  },
  _setSelect: function(field) {
    var select = new Select(this._getElement('select'));
    if (select.contains(field))
      select.selectValue(field);
  },
  _setTitle: function() {
    var opt = getSelectedOption(this._getElement('select'));
    if (!opt) {
      this._setInner('title', new GwtMessage().getMessage('Go to'));
      return;
    }
    if (opt.value == 'zztextsearchyy')
      this._setInner('title', new GwtMessage().getMessage('Search'));
    else
      this._setInner('title', new GwtMessage().getMessage('Go to'));
  },
  type: 'GlideWidgetSearch'
});;
/*! RESOURCE: /scripts/classes/GlideWidgetHideOnEmpty.js */
var GlideWidgetHideOnEmpty = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID) {
    $super(widgetID, listID);
  },
  _refresh: function() {
    var list = GlideList2.get(this.listID);
    var empty = (list.totalRows == 0);
    var elements = list.listContainer.select('.list_hide_empty');
    for (var i = 0; i < elements.length; i++) {
      if (empty)
        elements[i].hide();
      else
        elements[i].show();
    }
  },
  type: 'GlideWidgetHideOnEmpty'
});;
/*! RESOURCE: /scripts/classes/GlideList2FilterUtil.js */
function runFilterV2Lists(name, filter) {
  var list = GlideList2.get(name);
  if (!list) {
    list = GlideList2.getByName(name);
  }
  if (list) {
    var groupBy = list.getGroupBy();
    if (groupBy)
      filter += "^" + groupBy;
    list.setFilterAndRefresh(filter);
  }
}
GlideList2.saveFilter = function(listID, listName) {
  var list = GlideList2.get(listID);
  var siname = gel('save_filter_name');
  if (!siname || !siname.value || siname.value.length <= 0) {
    var msg = getMessage("Enter a name to use for saving the filter");
    alert(msg);
    siname.focus();
    return;
  }
  var filter = getFilter(listName);
  var visibility = getFilterVisibility();
  var groupBy = list.getGroupBy();
  if (groupBy)
    filter += "^" + groupBy;
  var parms = {};
  parms['filter_visible'] = visibility;
  parms['save_filter_query'] = filter;
  parms['save_filter_name'] = siname.value;
  parms['sys_target'] = list.getTableName();
  parms['sys_action'] = 'sysverb_save_filter';
  list.submit(parms);
}
GlideList2.setDefaultFilter = function(listID, listName) {
  var filter = getFilter(listName, false);
  GlideList2.get(listID).setDefaultFilter(filter);
};
/*! RESOURCE: /scripts/classes/GlideList2InitEvents.js */
function glideList2InitEvents() {
  document.body.on('click', 'a[data-type="list2_top_title"], button[data-type="list2_top_title"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).clickTitle(evt);
    evt.stop();
  });
  document.body.on('contextmenu', '.list_nav_top', function(evt, element) {
    if (!element.hasAttribute('data-list_id'))
      return;
    if (evt.ctrlKey)
      return;
    if (evt.target.tagName.toLowerCase() === 'input')
      return;
    GlideList2.get(element.getAttribute('data-list_id')).clickTitle(evt);
    evt.stop();
  });
  document.body.on('click', 'a[data-type="list2_toggle"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).toggleList();
    evt.stop();
  });
  if (isDoctype()) {
    $j('input[data-type="list2_checkbox"] + label.checkbox-label').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var input = $j(e.target).parent()[0].querySelector('input');
      input.checked = !input.checked;
      GlideList2.get(input.getAttribute('data-list_id')).rowChecked(input, e);
      $j(input).change();
    });
  } else {
    document.body.on('click', 'input[data-type="list2_checkbox"], label[data-type="list2_checkbox"]', function(evt, element) {
      GlideList2.get(element.getAttribute('data-list_id')).rowChecked(element, evt);
      evt.stopPropagation();
    });
  }
  document.body.on('click', 'input[data-type="list2_all_checkbox"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).allChecked(element);
    evt.stopPropagation();
  });
  document.body.on('click', 'a[data-type="list2_group_toggle"]', function(evt, element) {
    var toggleIcon = element.childNodes[0];
    if (toggleIcon && toggleIcon.className.indexOf('collapsedGroup') > -1)
      toggleIcon.className = toggleIcon.className.replace(/\bcollapsedGroup\b/, '');
    else
      toggleIcon.className += 'collapsedGroup';
    GlideList2.get(element.getAttribute('data-list_id')).toggleGroups();
    evt.stop();
  });
  document.body.on('click', 'img[data-type="list2_delete_row"], i[data-type="list2_delete_row"]', function(evt, element) {
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    editListWithFormDeleteRow(row.sysId, gl.listID);
  });
  document.body.on('click', 'img[data-type="list2_hier"], i[data-type="list2_hier"]', function(evt, element) {
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    gl.toggleHierarchy(element, 'hier_row_' + gl.listID + '_' + row.sysId, row.target, row.sysId);
    evt.stop();
  });
  document.on('mouseover', 'img[data-type="list2_popup"], a[data-type="list2_popup"]', function(evt, element) {
    var gl = GlideList2.get(element.getAttribute('data-list_id'));
    var row = gl._getRowRecord(element);
    popListDiv(evt, row.target, row.sysId, gl.view, 600);
    evt.stop();
  });
  document.on('mouseout', 'img[data-type="list2_popup"], a[data-type="list2_popup"]', function(evt, element) {
    lockPopup(evt);
    evt.stop();
  });
  document.body.on('click', 'a[data-type="list2_hdrcell"]', function(evt, element) {
    element = element.up("TH");
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellClick(element, evt);
    evt.stop();
  });
  document.body.on('contextmenu', 'th[data-type="list2_hdrcell"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
  });
  document.body.on('click', 'a.list_header_context', function(evt, element) {
    element = element.parentElement;
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
    evt.stop();
  });
  document.body.on('click', 'i.list_header_context', function(evt, element) {
    element = element.parentElement.parentElement;
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
    evt.stop();
  });
  document.body.on('click', 'span[data-type="list2_hdrcell"]', list2Context);

  function list2Context(evt, element) {
    element = element.up("th");
    GlideList2.get(element.getAttribute('data-list_id')).hdrCellContextMenu(element, evt);
  }
  document.body.on('contextmenu', 'tr[data-type="list2_row"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).rowContextMenu(element, evt);
  });
  document.body.on('click', 'a[data-type="list_mechanic2_open"], i[data-type="list_mechanic2_open"]', function(evt, element) {
    GlideList2.get(element.getAttribute('data-list_id')).listMechanicClick(element);
    evt.stop();
  });
  document.body.on('click', 'a.linked, a.web, a.kb_link, a.report_link, .list_decoration > a', function(evt, el) {
    if (!evt.shiftKey)
      return;
    var url = new GlideURL(el.getAttribute('href'));
    var table = url.getContextPath().split('.do')[0];
    var sys_id = url.getParam('sys_id');
    var view = url.getParam('sysparm_view');
    popForm(evt, table, sys_id, view);
    evt.stop();
  })
}
if (!window['g_isGlideList2InitEvents']) {
  addAfterPageLoadedEvent(glideList2InitEvents);
  window.g_isGlideList2InitEvents = true;
};
/*! RESOURCE: /scripts/GlideListEditorMessaging.js */
(function() {
  "use strict";
  window.GlideListEditorMessaging = Class.create({
    initialize: function(gle) {
      if (!NOW || !NOW.MessageBus)
        return;
      this._recordMessage = NOW.messaging.record;
      this._pendingNewRecords = [];
      this._pendingSavedRecords = {};
      this._listEditor = gle;
      this._registerEvents(gle);
    },
    _registerEvents: function() {
      this._listEditor.tableController.observe(
        'glide:list_v2.edit.save', this._messageListEdit.bind(this));
      this._listEditor.tableController.observe(
        'glide:list_v2.edit.cells_changed', this._messageCellsChanged.bind(this));
      this._listEditor.tableController.observe(
        'glide:list_v2.edit.row_added', this._messageRowAdded.bind(this));
      this._listEditor.tableController.observe(
        'glide:list_v2.edit.changes_saved', this._messageRowSaved.bind(this));
      this._listEditor.tableController.observe(
        'glide:list_v2.edit.rows_deleted', this._messageRowDeleted.bind(this));
    },
    _messageListEdit: function() {
      if (this._listEditor.hasChanges()) {
        var modifiedRecords = this._listEditor.cellEditor.changes.getModifiedRecords();
        for (var i in modifiedRecords) {
          if (!modifiedRecords.hasOwnProperty(i) || i == '-1')
            continue;
          this._pendingSavedRecords[i] = this._getRecordChanges(modifiedRecords[i]);
        }
      }
    },
    _messageCellsChanged: function(evt) {
      var edits = this._listEditor.savePolicy.getEdits(evt);
      for (var i = 0; i < edits.length; i++) {
        var recordSysId = edits[i][0];
        if (this._isPendingNewRecord(recordSysId))
          continue;
        var savedRecord = this._pendingSavedRecords[recordSysId];
        if (!savedRecord)
          savedRecord = this._getRecordChanges(this._listEditor.cellEditor.changes.get(recordSysId));
      }
    },
    _messageRowAdded: function(evt) {
      var recordSysId = evt.memo.sys_id;
      this._pendingNewRecords.push(recordSysId);
    },
    _messageRowSaved: function(evt) {
      var recordTableName = this._getTableName();
      for (var i = 0; i < evt.memo.saves.length; i++) {
        var recordSysId = evt.memo.saves[i];
        if (this._isPendingNewRecord(recordSysId)) {
          this._recordMessage.created(
            recordTableName, {
              sys_id: recordSysId
            }, {
              name: 'list',
              list_id: evt.memo.listId
            }
          );
          var pendingIndex = this._pendingNewRecords.indexOf(recordSysId);
          this._pendingNewRecords.splice(pendingIndex, 1);
        } else {
          var savedRecord = this._pendingSavedRecords[recordSysId];
          if (!savedRecord)
            return;
          this._recordMessage.updated(
            recordTableName, {
              sys_id: recordSysId
            },
            savedRecord.changes, {
              name: 'list',
              list_id: evt.memo.listId
            }
          );
          delete this._pendingNewRecords[recordSysId];
        }
      }
    },
    _messageRowDeleted: function(evt) {
      var recordTableName = this._getTableName();
      for (var i = 0; i < evt.memo.deletes; i++) {
        var recordSysId = evt.memo.deletes[i];
        this._recordMessage.deleted(
          recordTableName, {
            sys_id: recordSysId
          }, {
            name: 'list',
            list_id: evt.memo.listId
          }
        );
      }
    },
    _isPendingNewRecord: function(id) {
      return this._pendingNewRecords.indexOf(id) != -1;
    },
    _getRecordChanges: function(modifiedRecord) {
      return {
        changes: this._getFieldChanges(modifiedRecord)
      }
    },
    _getFieldChanges: function(modifiedRecord) {
      var fields = modifiedRecord.getFields();
      var changes = {};
      for (var f in fields) {
        if (!fields.hasOwnProperty(f))
          continue;
        var field = fields[f];
        changes[f] = {
          current: {
            value: field.value,
            displayValue: field.renderValue
          },
          previous: {
            value: field.originalValue,
            displayValue: field.originalDisplay
          }
        };
      }
      return changes;
    },
    _getTableName: function() {
      return this._listEditor.tableController.tableName;
    },
    toString: function() {
      return 'GlideListEditorMessaging';
    }
  })
})();;
/*! RESOURCE: /scripts/classes/doctype/fixedHeaders.js */
CustomEvent.observe('list2_init', function(list2) {
  if (typeof $j == 'undefined')
    return;
  if (list2.getRelated() || window.g_form)
    return;
  if ($j('BODY').hasClass('non_standard_lists'))
    return;
  var enableStickyColumns = false;
  var numColsSticky = 2;
  var tableId = document.getElementById(list2.listID);
  var $cloneTable;

  function cloneHeader() {
    $j("#clone_table").remove();
    if (enableStickyColumns) {
      $j("#clone_table_columns").remove();
      $j("#clone_column_headers").remove();
    }
    var $origHeader = $j('thead', tableId).first();
    var $pageHeader = $j('nav.list_nav_top.list_nav').first();
    var pageHeaderHeight = $pageHeader.outerHeight();
    $pageHeader.css({
      'position': 'fixed',
      'width': '100%',
      'top': 0,
      'z-index': 10
    });
    var navbar = $j('nav.navbar');
    var navbarMarginTop = navbar.outerHeight() + parseInt(navbar.css('padding-bottom')) - parseInt(navbar.css('border-bottom-width'));
    $j('.list_nav_spacer').css({
      marginTop: navbarMarginTop,
      'display': 'block'
    });
    var $header = $origHeader.first().clone();
    var $originalTable = $j($j('table', tableId)[0].cloneNode(false));
    $originalTable.empty();
    $originalTable.removeClass('list_table list_header_search');
    $originalTable.attr('id', 'table_clone');
    $originalTable.append($header);
    $cloneTable = $j($j(tableId)[0].cloneNode(false));
    $cloneTable.empty();
    $cloneTable.append($originalTable);
    $cloneTable.attr('id', 'clone_table');
    $cloneTable.removeClass("list_table").addClass('list_table_clone');
    $cloneTable.css({
      'position': 'fixed',
      'width': $j(tableId).width(),
      'display': 'none',
      'top': pageHeaderHeight,
      'z-index': 10
    });
    $j(".list_v2").first().prepend($cloneTable);
    var originalHeaders = $j('thead th', tableId);
    var cloneHeaders = $j('#clone_table thead th');
    var widths = [];
    addAfterPageLoadedEvent(function() {
      $j.each(originalHeaders, function() {
        widths.push($j(this).outerWidth());
      });
      $j.each(cloneHeaders, function(index, value) {
        $j(this).css({
          'width': widths[index]
        });
      });
    });
    if (enableStickyColumns) {
      var curCol = 0;
      var rowHeights = [];
      var $cloneTableColumns = $j(tableId).clone();
      var $cloneOfClone = $cloneTable.clone();
      var $tableBody = $($cloneTableColumns).find('tbody');
      $cloneOfClone.attr('id', 'clone_column_headers');
      $cloneOfClone.css({
        "z-index": 1000
      });
      $cloneOfClone.find('thead').find('th').each(function() {
        curCol = curCol + 1;
        if (curCol > numColsSticky) {
          $j(this).remove();
        }
      });
      curCol = 0;
      $j(".list_v2").first().prepend($cloneOfClone);
      $cloneTableColumns.find('thead').find('tr').find('th').each(function() {
        curCol = curCol + 1;
        if (curCol > numColsSticky) {
          $j(this).remove();
        }
      });
      curCol = 0;
      $j(tableId).find('tbody').find('tr').each(function() {
        rowHeights.push($j(this).outerHeight());
      });
      $tableBody.find("tr").each(function(index) {
        $j(this).css('height', rowHeights[index]);
        $j(this).find('td').each(function() {
          curCol = curCol + 1;
          if (curCol > numColsSticky) {
            $j(this).remove();
          }
        });
        curCol = 0;
      });
      $cloneTableColumns.css({
        'position': 'absolute'
      });
      $cloneTableColumns.attr('id', 'clone_table_columns');
      $j(".list_v2").prepend($cloneTableColumns);
    }
  }

  function checkPosition() {
    var $table = $j(tableId);
    if (!$table.length) {
      return;
    }
    var scrollLeft = $j(document).scrollLeft();
    var margin = parseInt($j("body").css('margin-left'));
    var listHeaderSpacerHeight = $j('.list_nav_spacer').offset().top;
    var scrollTop = $j(window).scrollTop();
    var offset = $table.offset();
    var tableTop = offset.top - listHeaderSpacerHeight;
    if (g_text_direction == "rtl") {
      $cloneTable.css({
        "right": margin + scrollLeft
      });
    } else {
      $cloneTable.css({
        "left": -scrollLeft + margin
      });
    }
    if (enableStickyColumns) {
      var $columns = $j("#clone_table_columns");
      var $columnHeaders = $j("#clone_column_headers");
      $columns.css({
        "left": offset.left,
        "top": offset.top
      });
      if (scrollLeft > offset.left) {
        $columns.css("left", scrollLeft);
        $columnHeaders.css("left", 0);
      }
    }
    if ((scrollTop > tableTop)) {
      $cloneTable.css('display', 'block');
      if (enableStickyColumns) {
        $columnHeaders.css('display', 'block');
      }
    } else {
      $cloneTable.css('display', 'none');
      if (enableStickyColumns) {
        $columnHeaders.css('display', 'none');
      }
    }
  }
  var eventSet = false;
  var cloneTimeout;

  function reclone(event) {
    clearTimeout(cloneTimeout);
    cloneTimeout = setTimeout(function() {
      var sw = new StopWatch();
      cloneHeader();
      checkPosition();
      if (!eventSet)
        $j(window).scroll(checkPosition).trigger("scroll");
      eventSet = true;
      sw.jslog("Reclone headers");
    }, 100);
  }
  CustomEvent.observe('list.loaded', reclone);
  CustomEvent.observe('list2_init', reclone);
  CustomEvent.observe('listheadersearch.show_hide', reclone);
  CustomEvent.observe('compact', reclone);
  $j(window).load(reclone);
  $j(window).resize(reclone);
});;
/*! RESOURCE: /scripts/classes/doctype/GlideHeaderSearch.js */
$j(function($) {
  'use strict';
  var keyEvents = isMSIE9 || isMSIE10 ? "keydown" : "keyup"
  $(document).on(keyEvents, "INPUT.list_header_search", function(evt) {
    $(this).addClass('modified');
    var choiceType = $(this).closest('[data-choice]').attr('data-choice');
    var isReference = $(this).closest('[data-glide-type="reference"]').length > 0;
    if (!isReference && (choiceType == '1' || choiceType == '3')) {
      parseChoice($(this).closest('[data-choice]'));
    }
    if (evt.keyCode != 13)
      return;
    evt.preventDefault();
    submitHeaderSearch(this);
  });

  function submitHeaderSearch(el) {
    var $table = $(el).closest('table.list_table');
    if ($table.data('choice_query_active')) {
      $table.data('choice_query_submit_onresponse', true);
      return;
    }
    var listID = $table.attr('data-list_id');
    var list = GlideList2.get(listID);
    var query = getQueryFromTable($table);
    var extraParms = {
      sysparm_choice_query_raw: getRawChoiceQuery($table),
      sysparm_list_header_search: true
    };
    list.setFilter(query);
    list.refresh(1, extraParms);
  }

  function parseChoice($el) {
    var $table = $el.closest('table.list_table');
    var table = $table.attr('glide_table');
    var field = $el.attr('name');
    var $input = $el.find('input.list_header_search.modified');
    var value = $input.val();
    if (!value) {
      $input.data('choice_query', null);
      return;
    }
    $table.data('choice_query_active', true);
    var term = buildTerm(field, value)
    var partialTerm = term.operator + term.value;
    translateChoiceListQuery(table, field, partialTerm, function onSuccess(values) {
      term.operator = 'IN';
      term.value = values.join(',');
      $input.data('choice_query', term);
      submitIfNecessary($table);
    }, function onError() {
      submitIfNecessary($table);
    });
  }

  function submitIfNecessary($table) {
    $table.data('choice_query_active', false);
    if ($table.data('choice_query_submit_onresponse'))
      submitHeaderSearch($table);
  }

  function getRawChoiceQuery($table) {
    var query = [];
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var choiceType = el.getAttribute('data-choice');
      var isReference = el.getAttribute('data-glide-type') == "reference";
      if (isReference || (choiceType != '1' && choiceType != '3'))
        return;
      var field = el.getAttribute('name');
      var $input = $(el).find('input.list_header_search');
      if (!$input.val())
        return;
      var term = buildTerm(field, $input.val())
      query.push(term.field + term.operator + term.value);
    });
    return query.join('^');
  }

  function loadFromTables() {
    $('TABLE.list_table').each(function(index, table) {
      var $table = $(table);
      var query = $table.attr('query');
      if (!query)
        return;
      if (query.indexOf('^NQ') != -1 || query.indexOf('^OR') != -1) {
        var orMatches = query.match(/\^OR/g) !== null ? query.match(/\^OR/g).length : 0;
        var orderByMatches = query.match(/\^ORDERBY/g) !== null ? query.match(/\^ORDERBY/g).length : 0;
        if (orMatches != orderByMatches || query.indexOf('^NQ') != -1) {
          $j($table).find('button.list_header_search_toggle').attr('disabled', true);
          $table.addClass('list_header_search_disabled');
        }
      }
      var listID = $table.attr('data-list_id');
      var enc = new GlideEncodedQuery(listID, query);
      enc.partsXML = loadXML($table.attr('parsed_query'));
      enc.terms = [];
      enc.parseXML();
      var parts = enc.getTerms();
      var encChoice = new GlideEncodedQuery(listID, $table.attr('choice_query'));
      encChoice.partsXML = loadXML($table.attr('parsed_choice_query'));
      encChoice.terms = [];
      encChoice.parseXML();
      parts = parts.concat(encChoice.getTerms());
      var hasHeaderQueries = false;
      var hasGotoQuery = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var value = p.displayValue || p.value;
        if (value && value.indexOf('javascript:') == 0) {
          p.script = true;
          continue;
        }
        if (p.Goto == 'true')
          hasGotoQuery = true;
        if (setInputValue($table, p.field, buildDisplayValue(p.operator, value)))
          hasHeaderQueries = true;
      }
      showHeaderSearchRow($table, hasHeaderQueries, hasGotoQuery);
      disableUnsupportedFields($table);
      $table.data('g_enc_query', enc);
      if ($table.hasClass('list_header_search_disabled') && $table.hasClass('list_header_search'))
        $table.removeClass('list_header_search');
    });
  }

  function setInputValue($table, field, value) {
    if (!value)
      return false;
    var columnInput = $table.find('.list_header_search_row td[name="' + field + '"] input');
    if (columnInput.length == 0 && field.indexOf('.') > -1) {
      var lastDot = field.lastIndexOf('.');
      var refField = field.substring(0, lastDot);
      var refFieldDisplay = field.substring(lastDot + 1);
      columnInput = $table.find('.list_header_search_row ' +
        'td[name=\'' + refField + '\']' +
        '[data-glide-type=reference]' +
        '[data-glide-reference-name=' + refFieldDisplay + ']' +
        ' input');
    }
    columnInput.val(value);
    return columnInput.length > 0;
  }

  function getQueryFromTable($table) {
    var enc_query = $table.data('g_enc_query');
    var terms = enc_query ? enc_query.getTerms() : [];
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var field = el.getAttribute('name');
      var type = el.getAttribute('data-glide-type');
      var baseField = "";
      var reference_name = el.getAttribute('data-glide-reference-name');
      if (reference_name) {
        baseField = field;
        field = field + '.' + reference_name;
      }
      var $input = $(el).find('input.list_header_search.modified');
      if ($input.length === 0)
        return;
      var value = $input.val() || '';
      var newTerm;
      var choiceQuery = $input.data('choice_query');
      if (choiceQuery)
        newTerm = choiceQuery;
      else
        newTerm = buildTerm(field, value);
      var found = false;
      for (var i = terms.length - 1; i >= 0; i--) {
        if ((terms[i].field == newTerm.field || terms[i].field == baseField) &&
          terms[i].script !== true) {
          found = true;
          if (newTerm.value || value)
            terms[i] = newTerm;
          else
            terms.splice(i, 1);
          break;
        }
      }
      if (!found && value)
        terms.push(newTerm);
    });
    var query = "";
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t.field)
        continue;
      query += '^' + t.field + t.operator + t.value;
    }
    return query;
  }

  function buildTerm(field, value) {
    var operator = 'STARTSWITH';
    if (value.indexOf('*') == 0 || value.indexOf('.') == 0) {
      operator = 'LIKE';
      value = value.substring(1);
    } else if (value.indexOf('=') == 0) {
      operator = '=';
      value = value.substring(1);
    } else if (value.indexOf('!=') == 0) {
      operator = '!=';
      value = value.substring(2);
    } else if (value.indexOf('%') == 0) {
      if (value.charAt(value.length - 1) == '%') {
        operator = 'LIKE';
        value = value.substring(1, value.length - 1);
      } else {
        operator = 'ENDSWITH';
        value = value.substring(1);
      }
    } else if (value.charAt(value.length - 1) == '%') {
      operator = 'STARTSWITH';
      value = value.substring(0, value.length - 1);
    } else if (value.indexOf('!*') == 0) {
      operator = 'NOT LIKE';
      value = value.substring(2);
    }
    return {
      field: field,
      operator: operator,
      value: value
    }
  }

  function buildDisplayValue(operator, value) {
    switch (operator) {
      case 'LIKE':
        return '*' + value;
      case 'STARTSWITH':
        return value;
      case 'NOT LIKE':
        return '!*' + value;
      case 'ENDSWITH':
        return '%' + value;
      case '=':
      case '!=':
        return operator + value;
    }
    return '';
  }
  $(document).on("click", "button.list_header_search_toggle", function(evt) {
    var $table = $(this).closest('TABLE')
    if ($table.hasClass('list_header_search_disabled'))
      return;
    var isActive;
    if ($table.hasClass('list_header_search')) {
      isActive = false;
      $table.removeClass('list_header_search');
    } else {
      isActive = true;
      disableUnsupportedFields($table);
      $table.addClass('list_header_search');
    }
    if (canUseListSearchPreference())
      setPreference('glide.ui.list_header_search.open', isActive);
    CustomEvent.fire('listheadersearch.show_hide');
    _frameChanged();
    evt.preventDefault();
  })

  function translateChoiceListQuery(table, field, filter, callback, callbackError) {
    $.ajax({
      url: 'xmlhttp.do?sysparm_processor=com.glide.ui.ChoiceListSearchProcessor',
      data: {
        table: table,
        field: field,
        filter: filter
      },
      headers: {
        'X-UserToken': window.g_ck
      },
      success: function(response) {
        if (response) {
          var responseJSON = JSON.parse(response.documentElement.getAttribute('answer'));
          callback.call(null, responseJSON.result);
        } else {
          callbackError.call(null);
        }
      },
      error: function() {
        callbackError.call(null);
      }
    })
  }

  function showHeaderSearchRow($table, hasHeaderQueries, hasGoto) {
    if (window.g_report)
      return;
    var preferenceValue = $table.find('tr.list_header_search_row').attr('data-open-onload') == 'true' &&
      canUseListSearchPreference();
    if (preferenceValue) {
      $table.addClass('list_header_search');
      CustomEvent.fire('listheadersearch.show_hide');
      return;
    }
    var cameFromNavigator = location.search.indexOf('sysparm_userpref_module=') != -1;
    if (cameFromNavigator)
      return;
    var onLoadShowSearch = $table.attr('data-search-show') == 'true';
    var openWithGoto = $table.find('tr.list_header_search_row').attr('data-open-ongoto') == 'true';
    if ((onLoadShowSearch && hasHeaderQueries) || (hasGoto && openWithGoto))
      $table.addClass('list_header_search');
  }

  function disableUnsupportedFields($table) {
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var type = el.getAttribute('data-glide-type');
      if (type == 'user_roles' || type == 'glide_list' || type == 'related_tags' || type == 'sys_class_name')
        $(el).find('input.list_header_search').prop('disabled', true);
    })
  }

  function canUseListSearchPreference() {
    return !window.g_form;
  }
  loadFromTables();
  CustomEvent.observe('partial.page.reload', loadFromTables);
});;
/*! RESOURCE: /scripts/classes/doctype/GlideWidgetFilter.js */
var GlideWidgetFilter = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, listName, query, pinned, saveFilterHidden) {
    $super(widgetID, listID);
    this.query = query;
    this.listName = listName;
    this.pinned = pinned;
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
    var bc = $(this.listID + "_breadcrumb");
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
    writeTitle(e, new GwtMessage().getMessage("Show / hide filter"));
    CustomEvent.fire('list.section.toggle');
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
  _initEvents: function(list) {
    var a = list.listContainer.select('a.list_filter_toggle');
    if (a.length == 1)
      this._initFilterEvents(a[0]);
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
/*! RESOURCE: /scripts/classes/doctype/streamButton.js */
$j(function($) {
  "use strict";
  var closeButtonPadding = 32;
  $('.list_stream_button').click(function() {
    var table = $('table.list_table[data-list_id]');
    var listid = table.attr('data-list_id');
    var query = table.attr('query');
    query = encodeURIComponent(query);
    var url = "$stream.do?sysparm_table=" + listid + "&sysparm_nostack=yes&sysparm_query=" + query;
    var target = 'parent';
    if (shouldUseFormPane())
      target = 'form_pane';
    url += "&sysparm_link_target=" + target;
    createStreamReader(url);
  });
  $(document).on('click', '.form_stream_button', function() {
    var url = "$stream.do?sysparm_table=" + g_form.getTableName();
    url += "&sysparm_sys_id=" + g_form.getUniqueValue();
    url += "&sysparm_stack=no";
    createStreamReader(url);
  });

  function shouldUseFormPane() {
    try {
      if (self == top)
        return false;
      if (window.top.g_navManager)
        return !!window.top.g_navManager.options.formTarget;
    } catch (e) {}
    return false;
  }

  function createStreamReader(url) {
    if ($('.list_stream_reader').length)
      return;
    var frame = '	<iframe src="' + url + '" id="list_stream_reader_frame"></iframe>';
    var $div = $('<div class="list_stream_reader">' +
      '<div class="list_stream_plank_header">' +
      '<span class="list_stream_reader_close"><i class="icon-double-chevron-right"></i></span><span>' + getMessage('Activity Stream') + '</span>' +
      '</div>' +
      frame +
      '</div>');
    $('body').append($div);
    $('#list_stream_reader_frame').bind('load', function() {
      if (NOW.compact) {
        $(this).contents().find('html').addClass('compact');
      }
      CustomEvent.observe('compact', function(newValue) {
        var method = newValue ? 'addClass' : 'removeClass';
        $('#list_stream_reader_frame').contents()
          .find('html')[method]('compact');
      })
    });
    resizeStreamReader($div);
    $(window).bind('resize.streamreader', function() {
      unfreezeTableWidth();
      if ($div.parent().length === 0) {
        $(window).unbind('resize.streamreader');
        return;
      }
      resizeStreamReader($div);
    })
  }

  function resizeStreamReader($div) {
    freezeTableWidth();
    var $body = $('body');
    var width = $div.outerWidth() + closeButtonPadding;
    $body.css({
      'padding-right': width,
      'position': 'absolute'
    });
    var top = 50;
    if (typeof g_form == 'undefined')
      top = $('.list_nav_spacer').offset().top;
    else
      top = $('.section_header_content_no_scroll').offset().top;
    $div.css('top', top);
    if ("ontouchstart" in window) {
      $div.css('absolute');
      window.scrollTo(0, top);
    }
  }
  $('body').on('click', '.list_stream_reader_close', function() {
    var $readerDiv = $(this).closest('.list_stream_reader');
    closeStreamReader($readerDiv);
  });

  function closeStreamReader($readerDiv) {
    unfreezeTableWidth();
    $readerDiv.remove();
    var $body = $('body');
    $body.css({
      'position': '',
      'padding-right': 0
    });
  }

  function freezeTableWidth() {
    $('table.list_table').each(function(index, el) {
      var $el = $(el);
      var width = $el.width();
      $el.css('width', width);
    })
  }

  function unfreezeTableWidth() {
    $('table.list_table').each(function(index, el) {
      $(el).css('width', '');
    })
  }
});;
/*! RESOURCE: /scripts/sn/common/messaging/deprecated/NOW.messaging.js */
(function(global) {
  "use strict";
  global.NOW = global.NOW || {};
  var messaging = global.NOW.messaging = global.NOW.messaging || {};
  messaging.snCustomEventAdapter = function(snCustomEvent, snTopicRegistrar, snDate, snUuid) {
    var busId = snUuid.generate();
    return {
      channel: function(channelName) {
        var topicRegistrations = snTopicRegistrar.create();
        var fireCall = 'fireAll';
        snCustomEvent.on(channelName, function(envelope) {
          var topic = envelope.topic;
          topicRegistrations.subscribersTo(topic).forEach(function(subscription) {
            subscription.callback(envelope.data, envelope);
          });
        });
        return {
          publish: function(topic, payload) {
            if (!topic)
              throw "'topic' argument must be supplied to publish";
            snCustomEvent[fireCall](channelName, envelope(topic, payload));
          },
          subscribe: function(topic, callback) {
            if (!topic)
              throw "'topic' argument must be supplied to subscribe";
            if (!callback)
              throw "'callback' argument must be supplied to subscribe";
            var sub = subscription(topic, callback);
            topicRegistrations.registerSubscriber(sub);
            return sub;
          },
          unsubscribe: function(subscription) {
            if (!subscription)
              throw "'subscription' argument must be supplied to unsubscribe";
            return topicRegistrations.deregisterSubscriber(subscription);
          },
          destroy: function() {
            topicRegistrations = null;
            snCustomEvent.un(channelName);
          }
        };

        function subscription(topic, callback) {
          return {
            get topic() {
              return topic
            },
            get callback() {
              return callback
            }
          }
        }

        function envelope(topic, payload) {
          return {
            channel: channelName,
            topic: topic,
            data: payload,
            timestamp: snDate.now(),
            messageId: snUuid.generate(),
            busId: busId
          }
        }
      }
    };
  };
  messaging.snTopicRegistrar = function() {
    var validTopicRegex = /^(\w+\.)*(\w+)$/;

    function validateSubscription(subscription) {
      if (!subscription)
        throw new Error("Subscription argument is required");
      if (!subscription.topic || !subscription.callback)
        throw new Error("Subscription argument must be a valid subscription");
    }

    function validateTopic(topic) {
      if (!topic)
        throw new Error("Topic argument is required");
      if (!validTopicRegex.test(topic))
        throw new Error("Invalid topic name: " + topic);
    }

    function regexForBinding(binding) {
      binding = binding.split('.').map(function(segment) {
        if (segment === '')
          throw new Error("Empty segment not allowed in topic binding: " + binding);
        if (segment === '*')
          return '[^.]+';
        if (segment === '#')
          return '(\\b.*\\b)?';
        if (segment.match(/\W/))
          throw new Error("Segments may only contain wildcards or word characters: " + binding + ' [' + segment + ']');
        return segment;
      }).join('\\.');
      return new RegExp('^' + binding + '$');
    }
    return {
      create: function() {
        var registrations = {};
        var bindingRegExps = {};
        return {
          registerSubscriber: function(subscription) {
            validateSubscription(subscription);
            if (!registrations[subscription.topic])
              registrations[subscription.topic] = [];
            registrations[subscription.topic].push(subscription);
            bindingRegExps[subscription.topic] = regexForBinding(subscription.topic);
            return subscription;
          },
          deregisterSubscriber: function(toRemove) {
            validateSubscription(toRemove);
            var topic = toRemove.topic;
            var regs = registrations[topic];
            if (regs) {
              registrations[topic] = regs.filter(function(subscription) {
                return subscription !== toRemove;
              });
              if (registrations[topic].length === 0) {
                delete registrations[topic];
                delete bindingRegExps[topic];
              }
            }
          },
          subscribersTo: function(topic) {
            validateTopic(topic);
            var bindings = Object.keys(registrations);
            return bindings.reduce(function(memo, binding) {
              var regex = bindingRegExps[binding];
              if (regex.test(topic))
                return memo.concat(registrations[binding]);
              return memo;
            }, []);
          }
        }
      }
    }
  };
  messaging.snDate = function() {
    return {
      now: function() {
        return new Date();
      }
    }
  };
  messaging.snUuid = function() {
    return {
      generate: function() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
      }
    };
  };
  global.NOW.MessageBus =
    messaging.snCustomEventAdapter(CustomEvent, messaging.snTopicRegistrar(), messaging.snDate(), messaging.snUuid());
})(this);;
/*! RESOURCE: /scripts/sn/common/messaging/deprecated/NOW.messaging.record.js */
(function(global) {
  "use strict";
  if (typeof global.NOW === 'undefined' || typeof global.NOW.messaging === 'undefined') {
    console.error("Messaging API not defined, skipping creating of record messaging API");
    return;
  }
  var messaging = global.NOW.messaging = global.NOW.messaging || {};
  messaging.record = messaging.record || (function() {
    var recordChannel = global.NOW.MessageBus.channel('record');

    function basePayload(table, record, source) {
      return {
        table: table,
        record: record,
        source: source
      }
    }
    return {
      created: function(tableName, record, source) {
        recordChannel.publish('record.created', basePayload(tableName, record, source));
      },
      updated: function(tableName, record, changes, source) {
        var payload = basePayload(tableName, record, source);
        payload.changes = changes;
        recordChannel.publish('record.updated.field', payload);
      },
      deleted: function(tableName, record, source) {
        recordChannel.publish('record.deleted', basePayload(tableName, record, source));
      },
      commentAdded: function(tableName, record, comment, source) {
        var payload = basePayload(tableName, record, source);
        payload.comment = comment;
        recordChannel.publish('record.updated.comment.added', payload);
      }
    };
  })();
})(this);;
/*! RESOURCE: /scripts/classes/timeAgo.js */
$j(function($) {
  'use strict';
  var ATTR = 'timeago';
  var TA_ATTRS = 'timeago-attrs';
  var EMPTY = 'sn-timeago-empty-msg';
  var settings = {
    allowFuture: true,
    strings: {}
  };
  updateMessages();
  findElements();
  setInterval(findElements, 30 * 1000);
  CustomEvent.observe('list_content_changed', findElements);
  CustomEvent.observe('date_field_changed', function(payload) {
    updateFormElement(payload.id, payload.dateString);
  });

  function findElements(root) {
    var elements = (root || document).querySelectorAll('[' + ATTR + ']');
    var i = elements.length;
    while (i--)
      updateElement(elements[i]);
  }

  function updateFormElement(id, dateString) {
    var element = document.getElementById(id);
    if (element) {
      if (g_user_date_time_format) {
        var int = getDateFromFormat(dateString, g_user_date_time_format);
        int = convertTimezone(int, false);
        dateString = new Date(int).toISOString().split('.')[0].replace('T', ' ');
      }
      element.setAttribute(ATTR, dateString);
      element.setAttribute('title', dateString);
      updateElement(element, true);
    }
  }

  function updateMessages() {
    var msgs = getMessages([
      'prefix_ago',
      'prefix_from now',
      'suffix_ago',
      'suffix_from now',
      'just now',
      'less than a minute',
      'about a minute',
      '%d minutes',
      'about an hour',
      'about %d hours',
      'a day',
      '%d days',
      'about a month',
      '%d months',
      'about a year',
      '%d years',
      '(empty)'
    ]);
    settings.strings = {
      prefixAgo: msgs['prefix_ago'],
      prefixFromNow: msgs['prefix_from now'],
      suffixAgo: msgs['suffix_ago'],
      suffixFromNow: msgs["suffix_from now"],
      justNow: msgs["just now"],
      seconds: msgs["less than a minute"],
      minute: msgs["about a minute"],
      minutes: msgs["%d minutes"],
      hour: msgs["about an hour"],
      hours: msgs["about %d hours"],
      day: msgs["a day"],
      days: msgs["%d days"],
      month: msgs["about a month"],
      months: msgs["%d months"],
      year: msgs["about a year"],
      years: msgs["%d years"],
      wordSeparator: msgs["timeago_number_separator"],
      numbers: [],
      empty: msgs["(empty)"]
    };
  }

  function allowFuture(bool) {
    settings.allowFuture = bool;
  }

  function toWords(distanceMillis) {
    var $l = settings.strings;
    var seconds = Math.abs(distanceMillis) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;
    if (seconds < 45)
      prefix = suffix = '';
    if (settings.allowFuture) {
      if (distanceMillis < 0) {
        prefix = $l.prefixFromNow;
        suffix = $l.suffixFromNow;
      }
    }

    function substitute(stringOrFunction, number) {
      var string = isFunction(stringOrFunction) ?
        stringOrFunction(number, distanceMillis) : stringOrFunction;
      var value = ($l.numbers && $l.numbers[number]) || number;
      return string.replace(/%d/i, value);
    }
    var words = seconds < 45 && (distanceMillis >= 0 || !settings.allowFuture) && substitute($l.justNow, Math.round(seconds)) ||
      seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
      seconds < 90 && substitute($l.minute, 1) ||
      minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
      minutes < 90 && substitute($l.hour, 1) ||
      hours < 24 && substitute($l.hours, Math.round(hours)) ||
      hours < 42 && substitute($l.day, 1) ||
      days < 30 && substitute($l.days, Math.ceil(days)) ||
      days < 45 && substitute($l.month, 1) ||
      days < 365 && substitute($l.months, Math.round(days / 30)) ||
      years < 1.5 && substitute($l.year, 1) ||
      substitute($l.years, Math.round(years));
    var separator = $l.wordSeparator === undefined ? " " : $l.wordSeparator;
    return [prefix, words, suffix].join(separator).trim();
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isNumber(value) {
    return typeof value === 'number';
  }

  function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
  }

  function isNull(value) {
    return (value === null || value === '' || typeof value === 'undefined')
  }

  function getEmptyMessage(element) {
    var attr = element.getAttribute(EMPTY);
    if (attr)
      return attr;
    return settings.strings.empty;
  }

  function parse(iso8601) {
    if (isDate(iso8601))
      return iso8601;
    if (isNull(iso8601))
      return null;
    if (isNumber(iso8601))
      return parseInt(iso8601, 10);
    return new Date(parseDateString(iso8601));
  }

  function parseDateString(iso8601) {
    var s = iso8601.trim();
    s = s.replace(/\.\d+/, "");
    s = s.replace(/-/, "/").replace(/-/, "/");
    s = s.replace(/T/, " ").replace(/Z/, " UTC");
    s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
    return s;
  }

  function updateElement(element, isLocalTime) {
    var value = element.getAttribute(ATTR);
    var time = parse(value);
    if (!isDate(time) || isNaN(time.getTime())) {
      return element.innerHTML = isNull(value) ? getEmptyMessage(element) : value;
    }
    var timeInWords = isLocalTime ? timeFromNow(time) : correctedTimeFromNow(time);
    var attrToSet = element.getAttribute(TA_ATTRS);
    if (attrToSet == 'title' && element.hasAttribute('data-original-title'))
      element.setAttribute('data-original-title', timeInWords);
    else
      element.setAttribute(attrToSet, timeInWords);
    if (element.hasClassName('date-timeago'))
      element.innerHTML = timeInWords;
  }

  function updateInterval(diff) {
    diff = Math.abs(diff);
    var SEC = 1000;
    var MIN = 60 * SEC;
    var HR = 60 * MIN;
    if (diff < MIN)
      return 2 * SEC;
    if (diff < (30 * MIN))
      return 12 * SEC;
    if (diff < HR)
      return MIN;
    if (diff < (8 * HR))
      return 20 * MIN;
    return 24 * HR;
  }

  function correctedTimeFromNow(date) {
    var isUserRecordTZ = typeof g_tz_user_offset == 'undefined' ? true : g_tz_user_offset;
    var offset = isUserRecordTZ ? new Date().getTimezoneOffset() * 60000 - Math.abs(g_tz_offset) : 0;
    return timeBetween(Date.now() + offset, addTimeZone(date));
  }

  function timeFromNow(date) {
    return timeBetween(Date.now(), date);
  }

  function timeBetween(date1, date2) {
    return toWords(date1 - date2);
  }

  function convertTimezone(date, toUTC) {
    var timeZoneCorrection = (typeof g_tz_offset === 'number') ? Math.abs(g_tz_offset) : new Date().getTimezoneOffset() * 60000;
    if (toUTC)
      return date + timeZoneCorrection;
    else
      return date - timeZoneCorrection;
  }

  function removeTimeZone(time) {
    return convertTimezone(time, true);
  }

  function addTimeZone(time) {
    return convertTimezone(time, false);
  }

  function setTimeagoValue(id, date) {
    if (isDate(date))
      date = date.toISOString();
    var element = document.querySelector(id) || document.getElementById(id);
    if (element)
      element.setAttribute(ATTR, date);
    updateElement(element);
  }
});;;