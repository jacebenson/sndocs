/*! RESOURCE: /scripts/classes/listDrag/ListDraggableRow2.js */
var ListDraggableRow = Class.create({
      initialize: function(item, dragItem, targets, sys_id, record_class, table, invalidTargets, createFunc) {
        var dr = this;
        this.dragItem = dragItem;
        var topProxyElem = $(cel('table'));
        topProxyElem.cellPadding = "0";
        topProxyElem.cellSpacing = "0";
        var tableBody = $(cel('tbody'));
        var bottomProxyElem = $(cel('tr'));
        tableBody.appendChild(bottomProxyElem);
        topProxyElem.appendChild(tableBody);
        if (!createFunc)
          createFunc = this.createDraggable;
        this.dr = createFunc(item, dragItem, this.dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, true, "white");
        this.sysId = sys_id;
        this.dr.dr = this;
        item.dr = this;
        this.table = table;
        this.recordClass = record_class;
        this._addHandler(item, "click", this.handleClick.bind(this));
        this._addHandler(item, "dblclick", this.handleDblClick.bind(this));
      },
      dragClickFunction: function(e) {
        ListSelectManager.getInstance().selectItem(this.dr, true, e);
      },
      createDraggable: function(item, dragItem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets) {
          return new Draggable(item, dragItem, dr