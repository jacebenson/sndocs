openSyncResults();

function openSyncResults() {
	var sysId = g_request.getParameter("sys_id");
	var table = g_request.getParameter("table");
	var record = new GlideRecord(table);
	record.setVerboseWarnings(false);
	if (!record.isValid() || !record.get(sysId) || !record.canRead())
		{
		gs.addInfoMessage(gs.getMessage("No changes found"));
		g_response.sendRedirect("hub_client.do");
	}
	g_response.sendRedirect(table + ".do?sys_id=" + sysId);
}