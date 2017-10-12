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
        if (fieldName && fieldName.startsWith(this.tableName + '.'))
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
          a.setAttribute