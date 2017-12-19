ScriptLoader.getScripts([ '/scripts/SLARepairClient.js' ], function() {});
function repair() {
    var slaClient = new SLARepairClient();
    slaClient.callback = function(response) {
		g_navigation.reloadWindow();
    };
    slaClient.repairBySysId(g_form.getTableName(), g_form.getUniqueValue());
}
