if (typeof input != "undefined") {
	if (input.action == "subscribe") {
		var sub = new GlideRecord("m2m_sp_status_subscription");
		sub.addQuery("sys_user", gs.getUserID());
		sub.addQuery("cmdb_ci_service", input.serviceID);
		sub.query();
		if (!sub.next()) {
			sub.sys_user = gs.getUserID();
			sub.cmdb_ci_service = input.serviceID;
			sub.insert();
		}
	}
	else if (input.action == "unsubscribe") {
		var sub = new GlideRecord("m2m_sp_status_subscription");
		sub.addQuery("sys_user", gs.getUserID());
		sub.addQuery("cmdb_ci_service", input.serviceID);
		sub.query();
		while (sub.next())
			sub.deleteRecord();
	}	
}

data.serviceID = (input && input.serviceID) || $sp.getParameter("service");
var service = new GlideRecord("cmdb_ci_service");
if (service.get(data.serviceID)) {
	var sub = new GlideRecord("m2m_sp_status_subscription");
	sub.addQuery("sys_user", gs.getUserID());
	sub.addQuery("cmdb_ci_service", data.serviceID);
	sub.query();
	data.subscriber = sub.hasNext();
} else
	data.serviceID = null;

data.loggedIn = gs.isLoggedIn();