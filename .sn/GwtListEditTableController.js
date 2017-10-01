/*! RESOURCE: /scripts/GwtListEditTableController.js */
var GwtListEditTableController = Class.create({
    MSGS: [
        'New rows'
    ],
    initialize: function(tableElementDOM) {
        this.tableElementDOM = $(tableElementDOM);
        this._initMeta();
        this._updateTableData();
        this.msgs = getMessages(this.MSGS);
    },
    isForTable: function(tableDOM) {
        return tableDOM === this.tableElementDOM;
    },
    removeExistingRow: function(sysId) {
        this.changes.remove(sysId);
    },
    addExistingRow: function(sysId) {
        if (!this.changes.has(sysId)) {
            var record = this.changes.addRecord(sysId, "add_existing");
            this.changes.addToAggregates(record);
        }
    },
    addRow: function(sysId) {
        if (!this.changes.has(sysId)) {
            var record = this.changes.addRecord(sysId, "add");
            this.changes.addToAggregates(record);
        }
    },
    updateTable: function(tableElementDOM) {
        var tableName = tableElementDOM.getAttribute('glide_table');
        if (tableName !== this.tableName)
            jslog("New table name " + tableName + " does not match existing table name " + this.tableName);
        this.tableElementDOM = $(tableElementDOM);
        this._updateTableData();
    },
    unLoadTable: function(tableElementDOM) {
        if (tableElementDOM !== this.tableElementDOM)
            jslog("Unloaded table does not match current table " + this.tableName);
    },
    exportXml: function(elem) {
        elem.setAttribute("table", this.tableName);
        elem.setAttribute("field", this.relatedField);
        elem.setAttribute("query", this.query);
    },
    _initMeta: function() {
        this.tableName = this.getAttribute('glide_table');
        this.listID = this.getAttribute('glide_list_edit_id') + '';
        if (!GwtListEditTableController.controllers)
            GwtListEditTableController.controllers = {};
        GwtListEditTableController.controllers[this.listID] = this;
        this.listEditType = this.getAttribute('glide_list_edit_type') + '';
        this.relatedField = this.getAttribute('glide_list_field') + '';
        this.query = this.getAttribute('glide_list_query') + '';
        this.rowCount = new Number(this.getAttribute('total_rows'));
        this.insertRow = this._getBooleanAttribute('glide_list_edit_insert_row');
        this.canCreate = this._getBooleanAttribute('glide_list_can_create');
        this.canDelete = this._getBooleanAttribute('glide_list_can_delete');
        this.hasHierarchy = this._getBooleanAttribute('glide_list_has_hierarchy');
        this.hasHeader = this._getBooleanAttribute('glide_list_has_header');
        this.omitLinks = this._getBooleanAttribute('glide_list_omit_links');
        this.hasActions = this.getAttribute('glide_list_has_actions') == 'false' ? false : true;
        this.groupFields = this._getGroupFields();
        if (this.rowCount == 0 && "save_with_form" == this.listEditType && !this.hasHeader)
            this.insertRow = false;
        var prefixLength = this.tableName.length + 1;
        this.fields = [];
        this.firstField = null;
        var cellIndexOffset = this._getHeaderOffset();
        var cells = [];
        if (this.tableElementDOM && this.tableElementDOM.rows && this.tableElementDOM.rows.length > 0 && this.tableElementDOM.rows[0].cells) {
            cells = this.tableElementDOM.rows[0].cells;
        }
        this.headers = [];
        this.headersByName = {};
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (hasClassName(cell, "column_head") || hasClassName(cell, "list_header_cell")) {
                var fieldName = cell.getAttribute('glide_field');
                var type = cell.getAttribute('glide_type');
                if (type == 'composite_field') {
                    var compositeField = cell.getAttribute('name');
                    var compositeFirstField = cell.getAttribute('composite_edit_field');
                    var fieldPos = i + cellIndexOffset;
                    fieldName = this.getFqFieldName(compositeFirstField);
                    cell.setAttribute('glide_field', fieldName);
                    if (window['GlideCompositeField'])
                        new GlideCompositeField(this, fieldPos, compositeField, compositeFirstField);
                }
                if (fieldName) {
                    this.fields.push(fieldName.substring(prefixLength));
                    this.headers[i + cellIndexOffset] = fieldName;
                    this.headersByName[fieldName] = i + cellIndexOffset;
                    if (!this.firstField)
                        this.firstField = fieldName;
                }
            }
        }
    },
    _getHeaderOffset: function() {
        return 0;
    },
    _updateTableData: function() {
        this._updateSysIdToRowMapping();
        this._configureFocus();
        this.observe('glide:list_v2.edit.changes_saved', this._handleChangesSaved.bind(this));
        this.groupSeparator = null;
    },
    _updateSysIdToRowMapping: function() {
        var rows = this.tableElementDOM.rows;
        this.listRows = [];
        for (var i = 0, n = rows.length; i < n; i++) {
            var row = rows[i];
            if (!hasClassName(row, 'list_row') && !hasClassName(row, 'list_row_detail'))
                continue;
            this.listRows.push(row);
        }
        this.lastRecordRow = 0;
        this.sysIds = [];
        this.sysIdsToRows = {};
        var rowCount = this.getRowCount();
        for (var i = 0; i < rowCount; i++) {
            var sysId = this.getSysID(i);
            if (sysId) {
                if (this.sysIdsToRows.hasOwnProperty(sysId))
                    continue;
                this.sysIdsToRows[sysId] = i;
                this.sysIds.push(sysId);
                this.lastRecordRow = i;
            }
        }
    },
    buildCellSelector: function() {
        return new GwtListEditGridSelector(this.tableElementDOM);
    },
    getAttribute: function(name) {
        return this.tableElementDOM.getAttribute(name);
    },
    _configureFocus: function() {
        this.tableElementDOM.setStyle({
            outline: "none"
        });
        this.tableElementDOM.hideFocus = true;
    },
    _getBooleanAttribute: function(attrName) {
        return "true" === this.getAttribute(attrName);
    },
    getFields: function() {
        return this.fields;
    },
    getNameFromColumn: function(colNdx) {
        return this.headers[colNdx];
    },
    getCell: function(sysId, fieldName) {
        return this.getFqField(sysId, this.getFqFieldName(fieldName));
    },
    getFqFieldName: function(fieldName) {
        return this.tableName + "." + fieldName;
    },
    getFqField: function(sysId, fqFieldName) {
        var col = this.headersByName[fqFieldName];
        if (!col) {
            var row = this.tableElementDOM.select('tr[data-detail-row="' + fqFieldName + '"][sys_id=' + sysId + ']');
            if (row.length > 0)
                return $(row[0].cells[0]);
            return null;
        }
        var row = this.getRow(sysId);
        if (!row)
            return null;
        return $(row.cells[col]);
    },
    getRowCount: function() {
        return this.tableElementDOM.rows.length;
    },
    getRow: function(sysId) {
        var rowNdx = this.sysIdsToRows[sysId];
        if (!rowNdx)
            return null;
        return this.getRowByNdx(rowNdx);
    },
    getRowByNdx: function(rowNdx) {
        return this.tableElementDOM.rows[rowNdx];
    },
    getCellByNdx: function(rowNdx, cellNdx) {
        var row = this.getRowByNdx(rowNdx);
        if (!row)
            return null;
        return $(row.cells[cellNdx]);
    },
    getSysID: function(rowNdx) {
        var row = this.getRowByNdx(rowNdx);
        if (!row)
            return null;
        return row.getAttribute('sys_id');
    },
    getRelatedSysID: function() {
        if (!this.relatedField || this.relatedField == "null")
            return null;
        var indexOfSysId = this.query.indexOf(this.relatedField + "=") + this.relatedField.length + 1;
        return this.query.substring(indexOfSysId, indexOfSysId + 32);
    },
    _insertFinalBodyRow: function() {
        var body = this.tableElementDOM.tBodies[0];
        var result = body.insertRow(this._getInsertRow(body));
        return $(result);
    },
    _getInsertRow: function(body) {
        var rows = body.rows;
        for (var i = rows.length; i > 0; i--) {
            var row = $(rows[i - 1]);
            if (row.hasClassName('aggregate'))
                continue;
            var aggMsg = row.down('td.aggregate_message');
            if (aggMsg)
                continue;
            if (row.hasClassName('calculationLine'))
                return i - 1;
            return i;
        }
        return 0;
    },
    _getRowCss: function(tr) {
        if (this.listEditType != "save_with_form")
            return "list_unsaved";
        if ((tr.rowIndex % 2) == 0)
            return "list_even";
        return "list_odd";
    },
    deleteRow: function(sysId) {
        var rowNdx = this.sysIdsToRows[sysId];
        this.tableElementDOM.deleteRow(rowNdx);
        this._updateSysIdToRowMapping();
    },
    isHierarchical: function() {
        return this.tableElementDOM.hasClassName("hierarchical");
    },
    getListRows: function() {
        return this.listRows;
    },
    getRowByCell: function(cell) {
        return $(cell).up('tr.list_row, tr.list_row_detail');
    },
    getSysIdByCell: function(cell) {
        return this.getRowByCell(cell).getAttribute('sys_id');
    },
    buildRow: function(sysId) {
        var row = this.getRowByNdx(this.lastRecordRow);
        var cellCnt = 0;
        for (var i = 0; i < row.cells.length; i++)
            cellCnt += row.cells[i].colSpan;
        this._ensureGroupSeparator(sysId);
        var tr = this._insertFinalBodyRow();
        tr.id = sysId;
        tr.setAttribute('sys_id', sysId);
        tr.setAttribute('record_class', this.tableName);
        addClassName(tr, this._getRowCss(tr));
        addClassName(tr, 'list_row');
        var decor = this._buildDecorationCell(tr);
        for (var i = 1; i < cellCnt; i++) {
            var td = tr.insertCell(i);
            td.innerHTML = "&nbsp;";
            var fname = this.getNameFromColumn(i);
            if (fname) {
                addClassName(td, "vt");
            }
        }
        if (this.lastRecordRow == 0) {
            var tdExtra = $(tr.insertCell(i));
            tdExtra.writeAttribute('class', 'vt');
            tdExtra.writeAttribute('style', 'padding: 0;');
        }
        GwtListEditTableController.addClassToRow(tr, "list_add");
        this._updateSysIdToRowMapping();
        if (this.hasShowableHierarchy())
            this._buildHierarchyRow(sysId);
        return row;
    },
    _buildDecorationCell: function(tr) {
        var td = $(tr.insertCell(0));
        td.writeAttribute('class', 'list_decoration_cell');
        if (!this._isDoctype()) {
            var style = 'padding-top: 3px; padding-bottom: 3px;';
            if (this._isGrouped() && this.hasHierarchy)
                style = 'padding-left: 20px;' + style;
            else
                style = 'padding-left: 2px;' + style;
            td.writeAttribute('style', style);
        } else {
            td.className += ' col-control col-small col-center';
        }
        if (!this._isDoctype())
            return td;
    },
    _isDoctype: function() {
        return document.documentElement.getAttribute('data-doctype') == 'true';
    },
    _buildHierarchyRow: function(sysId) {
        var tr = this._insertFinalBodyRow();
        tr.setAttribute('hierarchical', 'not_loaded');
        tr.setAttribute('style', 'display: none');
        tr.setAttribute('collapsed', 'true');
        tr.setAttribute('id', 'hier_row_' + this.listID + '_' + sysId);
        var td = tr.insertCell(0);
        td.setAttribute('colspan', '99');
        addClassName(td, 'list_hierarchical_hdr');
        return tr;
    },
    needsInsertRow: function() {
        if (this.tableElementDOM.select(".list_unsaved") != 0)
            return false;
        if (this.tableElementDOM.select(".list_edit_new_row") != 0)
            return false;
        if (typeof isTablet != 'undefined' && isTablet)
            return false;
        return this.insertRow;
    },
    fire: function(evt, info) {
        if (!info.listId)
            jslog('Event ' + evt + ' fired with no listId');
        if (info.listId !== this.listID)
            jslog('Event ' + evt + ' fired for unknown list ' + info.listId);
        this.tableElementDOM.fire(evt, info);
    },
    fireCellsChanged: function(edits) {
        var info = {
            listId: this.listID,
            edits: edits
        };
        this.fire('glide:list_v2.edit.cells_changed', info);
    },
    fireFocusMoved: function(toRow, toCol) {
        var info = {
            listId: this.listID,
            toRow: toRow,
            toCol: toCol
        };
        this.fire('glide:list_v2.edit.focus_moved', info);
    },
    observe: function(evt, callback) {
        this.tableElementDOM.observe(evt, callback);
    },
    observeOnBody: function(evt, callback) {
        this.tableElementDOM.down('tbody').observe(evt, callback);
    },
    stopObserving: function(evt, callback) {
        this.tableElementDOM.stopObserving(evt, callback);
    },
    stopObservingOnBody: function(evt, callback) {
        this.tableElementDOM.down('tbody').stopObserving(evt, callback);
    },
    hasDeferredChanges: function() {
        if ('save_with_form' === this.listEditType)
            return true;
        if ('save_by_row' === this.listEditType)
            return true;
        return false;
    },
    isFormUI: function() {
        if ('save_with_form' === this.listEditType)
            return true;
        return false;
    },
    canEdit: function() {
        return ('disabled' !== this.listEditType);
    },
    buildSavePolicy: function(type) {
        if ("save_with_form" === this.listEditType)
            return new GwtListEditSavePolicy.SaveWithForm(this.listID);
        if ("save_by_row" === this.listEditType)
            return new GwtListEditSavePolicy.SaveByRow(this);
        return new GwtListEditSavePolicy.CellEdit(this.listID);
    },
    focus: function() {
        if (this.tableElementDOM.setActive)
            this.tableElementDOM.setActive();
        else
            this.tableElementDOM.focus();
    },
    focusBody: function() {
        var el = this.tableElementDOM.down('tbody');
        if (el.setActive)
            el.setActive();
        else
            el.focus();
    },
    getDecorationCell: function(sysId) {
        var row = this.getRow(sysId);
        if (!row)
            return null;
        return row.cells[0];
    },
    _handleChangesSaved: function(evt) {
        if (evt.memo.listId !== this.listID)
            return;
        if (!this.insertRow)
            return;
        if ("save_with_form" === this.listEditType)
            return;
        if (this.needsInsertRow && (this.listRows.length === 1))
            this._showListActions();
        else if (this.listRows.length === 2) {
            this._showListActions();
        }
    },
    _showListActions: function() {
        var container = $(this.listID + '_expanded');
        if (!container)
            return;
        var navTables = container.select('table.list_nav_bottom');
        if (1 !== navTables.length)
            return;
        var spans = navTables[0].select('span.list_hide_empty');
        for (var i = 0; i < spans.length; i++) {
            spans[i].show();
        }
    },
    getRecordPos: function(row) {
        return this.getListRows().indexOf(row) + 1;
    },
    getRecordIndex: function(recPos) {
        var rows = this.getListRows();
        var extra = recPos - rows.length
        if (rows.length > 0 && extra > 0) {
            var lastNdx = rows[rows.length - 1].rowIndex;
            if (this.hasHierarchy)
                return lastNdx + extra + extra;
            return lastNdx + extra;
        }
        var row = this.getRowByPos(recPos);
        if (row)
            return row.rowIndex;
        return 0;
    },
    getRowByPos: function(recPos) {
        if (recPos < 1)
            return null;
        var rows = this.getListRows();
        if (recPos > rows.length)
            return null;
        return rows[recPos - 1];
    },
    getCellByPos: function(recPos, cellNdx) {
        var row = this.getRowByPos(recPos);
        if (!row)
            return null;
        if (hasClassName(row, 'list_row_detail'))
            return $(row.cells[0]);
        return $(row.cells[cellNdx]);
    },
    getSysIDByPos: function(recPos) {
        var row = this.getRowByPos(recPos);
        if (!row)
            return null;
        return row.getAttribute('sys_id');
    },
    getFieldElement: function(fieldName) {
        return TableElement.get(this.getFqFieldName(fieldName));
    },
    isFirstField: function(fieldName) {
        var fqFieldName = this.getFqFieldName(fieldName);
        return this.firstField === fqFieldName;
    },
    _getGroupFields: function() {
        var GROUP_BY = "GROUPBY";
        var groupBy = [];
        var query = this.getAttribute('glide_list_query') + '';
        var terms = query.split('^');
        for (var i = 0; i < terms.length; i++) {
            var term = terms[i];
            if (0 === term.indexOf(GROUP_BY))
                groupBy.push(term.substring(GROUP_BY.length));
        }
        if (0 === groupBy.length)
            return null;
        return groupBy.join(',');
    },
    _isGrouped: function() {
        return (null !== this.groupFields);
    },
    _ensureGroupSeparator: function(sysId) {
        if (!this._isGrouped())
            return;
        if (null !== this.groupSeparator)
            return;
        this.groupSeparator = this._buildGroupSeparator(sysId);
    },
    _buildGroupSeparator: function(sysId) {
        var tr = this._insertFinalBodyRow();
        addClassName(tr, 'list_group');
        tr.setAttribute('group_row', 'true');
        tr.setAttribute('collapsed', 'never');
        tr.setAttribute('id', 'row_' + this.listID + '_' + sysId);
        tr.setAttribute('groupfield', this.groupFields);
        var td = $(tr.insertCell(0));
        addClassName(td, 'list_group');
        td.setAttribute('colSpan', '99');
        td.setAttribute('group_row_td', 'true');
        td.setAttribute('style', 'page-break-before: auto;');
        var o = {
            newRows: this.msgs['New rows']
        };
        td.insert(GwtListEditTableController.Templates.NEW_ROWS.evaluate(o));
        return tr;
    },
    hasShowableHierarchy: function() {
        if (this._isGrouped())
            return false;
        return this.hasHierarchy;
    },
    getNextRowByPos: function(fromPos) {
        var limit = this.getListRows().length;
        var ndx = fromPos + 1;
        while (ndx <= limit) {
            var row = this.getRowByPos(ndx);
            if (row && row.style.display != 'none')
                return ndx;
            ndx++;
        }
        return null;
    },
    getPrevRowByPos: function(fromPos) {
        var ndx = fromPos - 1;
        while (ndx > 0) {
            var row = this.getRowByPos(ndx);
            if (row && row.style.display != 'none')
                return ndx;
            ndx--;
        }
        return null;
    },
    openContextMenu: function(element, ev) {
        var list = GlideLists2[this.listID];
        if (!list)
            return;
        list.rowContextMenu(element, ev);
    },
    setCaption: function(mode) {
        var caption = this.tableElementDOM.down('caption');
        if (caption.firstChild)
            caption.removeChild(caption.firstChild);
        var newElement = document.createElement('span');
        newElement.innerText = caption.getAttribute('data-' + mode + '-label');
        newElement.className = "hidden";
        caption.appendChild(newElement);
        newElement.className = "";
    },
    toString: function() {
        return 'GwtListEditTableController';
    }
});
GwtListEditTableController.showImage = function(element, imageSrc) {
    var left = getOffset(element, "offsetLeft");
    var top = getOffset(element, "offsetTop");
    var w = element.offsetWidth;
    var h = element.offsetHeight;
    left += w - 11;
    top += h - 11;
    var img = cel('img');
    img.src = imageSrc;
    img.alt = '';
    img.style.position = 'absolute';
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    addChild(img);
    return img;
};
GwtListEditTableController.addClassToRow = function(tr, className) {
    addClassName(tr, className);
    var cells = tr.cells;
    for (var i = 1; i < cells.length; i++)
        addClassName(cells[i], className);
};
GwtListEditTableController.removeClassFromRow = function(tr, className) {
    removeClassName(tr, className);
    var cells = tr.cells;
    for (var i = 0; i < cells.length; i++)
        removeClassName(cells[i], className);
};
GwtListEditTableController.Templates = {
    NEW_ROWS: new Template(
        '<span class="list_group">#{newRows}</span>'
    )
};;