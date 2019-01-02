serviceOutageDetails();

function serviceOutageDetails() {
	var notes = new GlideRecord("m2m_sp_status_subscription");
	notes.addQuery("cmdb_ci_service", current.cmdb_ci);
	notes.query();
	while (notes.next()) {
		gs.eventQueue("outage.details.notif", current, notes.getValue('sys_user'), current.cmdb_ci.getDisplayValue());
	}
}