ScriptLoader.getScripts([ '/scripts/SLARepairClient.js' ], function() {});
function repairFiltered() {
    var slaClient = new SLARepairClient();
    var tableName = g_list.getTableName();
    slaClient.callback = function() {
        GlideList2.get(tableName).refreshWithOrderBy();
    };
    slaClient.repairByFilter(tableName, g_list.getQuery());
}
