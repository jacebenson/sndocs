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