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