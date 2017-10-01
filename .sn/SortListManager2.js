/*! RESOURCE: /scripts/classes/sort/SortListManager2.js */
var SortListManager = Class.create({
    initialize: function(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
        this.overrideEventHandlers = overrideEventHandlers;
        this.container = container;
        this.listElem = listElem;
        this.tableID = tableID;
        this.targets = targets;
        this.invalidTargets = invalidTargets;
        this.dragEnabledChecker = dragEnabledChecker;
        this.dragEnabledDetails = {};
        this._getDragEnabledDetails();
        this.rowDisabledCallback = rowDisabledCallback;
        this.processRows();
    },
    _getDragEnabledDetails: function() {
        if (!this.dragEnabledChecker)
            return;
        var dragEnabledDetails = {};
        var sysIDs = this._getSysIDs();
        if (sysIDs.length > 0) {
            var IDsParam = "";
            for (var i = 0; i < sysIDs.length; i++)
                IDsParam += sysIDs[i] + ",";
            var result = null;
            if (this.dragEnabledChecker && this.dragEnabledChecker.length > 0) {
                var ga;
                eval("ga = new GlideAjax('" + this.dragEnabledChecker + "')");
                ga.addParam('sysparm_name', 'isDragEnabledForItems');
                ga.addParam('sysparm_drag_item_ids', IDsParam);
                ga.getXMLWait();
                result = ga.getAnswer();
            }
            if (!result || result == "not_recognised") {
                for (var i = 0; i < sysIDs.length; i++)
                    this.dragEnabledDetails[sysIDs[i]] = [true];
            } else {
                var tokens = result.split("|");
                for (var i = 0; i < tokens.length; i++)
                    if (tokens[i].length > 0) {
                        var details = tokens[i].split(",");
                        this.dragEnabledDetails[details[0]] = [(details[1] == "true"), details[2]];
                    }
            }
        }
    },
    _getSysIDs: function() {
        var sysIDs = [];
        if (!this.listElem)
            this.listElem = $(this.tableID + "_table");
        if (this.listElem) {
            var elems = $(this.listElem).childElements();
            for (var i = 0; i < elems.length; i++)
                if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
                    var row = elems[i].down("tr");
                    while (row) {
                        var sysID = $(row).getAttribute("sys_id");
                        if (sysID)
                            sysIDs[sysIDs.length] = sysID;
                        row = row.next();
                    }
                }
        }
        return sysIDs;
    },
    setValues: function(targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
        this.overrideEventHandlers = overrideEventHandlers;
        this.container = container;
        if (!$(this.tableID + "_table"))
            this.listElem = $(this.tableID);
        else
            this.listElem = $(this.tableID + "_table");
        this.targets = targets;
        this.invalidTargets = invalidTargets;
        this.dragEnabledChecker = dragEnabledChecker;
        this.rowDisabledCallback = rowDisabledCallback;
        this.dragEnabledDetails = {};
        this._getDragEnabledDetails();
        this.processRows();
    },
    processListRow: function(item) {
        var sysID = $(item).getAttribute("sys_id");
        var recordClass = $(item).getAttribute("record_class");
        if (this.targets && this.targets.length > 0) {
            if (!this.dragEnabledChecker || (this.dragEnabledDetails[sysID] && this.dragEnabledDetails[sysID][0])) {
                var dragCell = ListDraggableRow.createDragCell(item, true);
                var row = this.createListDraggableRow(item, dragCell, this.targets, sysID, recordClass, this.tableID, this.invalidTargets);
                if (this.currentGroupRow)
                    this.currentGroupRow.addChildDraggableRow(row);
                if (this.rowDisabledCallback && this.rowDisabledCallback(sysID))
                    row.disable();
                else
                    row.enable();
            } else {
                if (this.dragEnabledDetails[sysID])
                    item.dragCellTitle = this.dragEnabledDetails[sysID][1];
                $(item).addClassName("disabledDragRow");
                ListDraggableRow.createDragCell(item, false);
            }
        }
        this.extraListRowProcessing(item);
    },
    createListDraggableRow: function(item, dragCell, targets, sysID, recordClass, tableID, invalidTargets) {
        return new ListDraggableRow(item, dragCell, targets, sysID, recordClass, tableID, invalidTargets, this.createDraggable.bind(this));
    },
    createDraggable: function(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets) {
        return new SortDraggable(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, true, "white", this.container, this.overrideEventHandlers);
    },
    processGroupRow: function(item) {
        this.extraGroupRowProcessing(item);
    },
    extraListRowProcessing: function(item) {},
    extraGroupRowProcessing: function(item) {},
    processHeaderRow: function(item) {
        return;
    },
    processRows: function() {
        var manager = this;
        if (!this.listElem)
            return;
        var elems = $(this.listElem).childElements();
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].tagName == "tbody" || elems[i].tagName == "TBODY") {
                var row = elems[i].down("tr");
                while (row) {
                    if (row.hasClassName("list_row"))
                        manager.processListRow(row);
                    else if (row.hasClassName("list_group"))
                        manager.processGroupRow(row);
                    else if (row.hasClassName("list_header"))
                        manager.processHeaderRow(row);
                    row = row.next();
                }
            }
        }
    }
});
SortListManager.removeListManager = function(listElem, tableID) {
    if (!tableID && listElem)
        tableID = $(listElem).getAttribute("tableID");
    if (!SortListManager.managers)
        return
    if (tableID && SortListManager.managers[tableID])
        delete SortListManager.managers[tableID];
}
SortListManager.createListManager = function(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers) {
    if (!listElem)
        listElem = $(tableID + "_table");
    if (!tableID && listElem)
        tableID = $(listElem).getAttribute("tableID");
    if (!SortListManager.managers)
        SortListManager.managers = {};
    if (!SortListManager.managers[tableID])
        SortListManager.managers[tableID] = new SortListManager(listElem, tableID, targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers);
    else
        SortListManager.managers[tableID].setValues(targets, invalidTargets, dragEnabledChecker, rowDisabledCallback, container, overrideEventHandlers);
    return SortListManager.managers[tableID];
};