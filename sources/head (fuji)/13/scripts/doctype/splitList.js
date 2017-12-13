/*! RESOURCE: /scripts/doctype/splitList.js */
$j(function($) {
  "use strict";
  window.SplitList = {
    init: function(table, sys_id, view) {
      var tables = Object.keys(GlideLists2);
      if (tables.length > 1)
        return null;
      var list = GlideList2.get(tables[0])
      var tableData = this._getTableData(list);
      if (!tableData)
        return;
      window.g_splitlist = {
        label: $j('.list_title').first().text(),
        hasNew: $j('#sysverb_new').length > 0,
        newLabel: $j('#sysverb_new').first().text(),
        table: table,
        initRecord: sys_id,
        view: view,
        list: list,
        data: tableData
      };
      ScriptLoader.getScripts('scripts/classes/doctype/app.splitList/js_includes_splitlist.js', function() {
        var listEl = $('<sn-splitlist/>');
        listEl.appendTo('body');
        angular.bootstrap(listEl, ['sn.splitList']);
      })
      var self = this;
      CustomEvent.observe('partial.page.reload', function(table, list) {
        if (!window.g_splitlist)
          return;
        var newData = self._getTableData(list);
        CustomEvent.fire('splitlist.new_data', newData);
      })
    },
    _getTableData: function(list) {
      var listContainer = list.getContainer();
      var listData = [];
      $('tbody tr.list_row[sys_id]:not(.list_unsaved)', listContainer).each(function(index, el) {
        var $el = $(el);
        var sys_id = $el.attr('sys_id');
        var titleValue = $el.attr('data-title-value');
        var firstColumn = $el.find('td:not(.list_decoration_cell)').first().text();
        if (firstColumn == titleValue)
          firstColumn = "";
        var rowData = {
          title_value: titleValue,
          first_column: firstColumn,
          updated_on: $el.attr('data-updated-on')
        };
        var decorations = $el.find('.list2_cell_background').first();
        listData.push({
          decoration_color: decorations.css('background-color'),
          sys_id: sys_id,
          data: rowData
        })
      });
      return listData;
    },
    destroy: function() {
      $('sn-splitlist').remove();
    }
  }
  CustomEvent.observe('splitlist.destroy', SplitList.destroy);
});