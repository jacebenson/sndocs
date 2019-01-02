// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.outages = [];
data.service = (input && input.service) || $sp.getParameter("service");
if (data.service) {
	var svc = new GlideRecord("cmdb_ci_service");
	if (!svc.get(data.service))
		data.service = null;
	data.serviceName = svc.getDisplayValue();
	var outs = new GlideRecord("cmdb_ci_outage");
	outs.orderByDesc("begin");
	outs.addQuery("cmdb_ci", data.service);
	outs.addNotNullQuery("begin");
	outs.addNotNullQuery("end");
	outs.addQuery("end", "<=", gs.nowNoTZ());
	outs.setLimit(100);
	outs.query();
	while (outs.next()) {
		var out = {};
		out.type = outs.type.getDisplayValue();
		out.typeValue = outs.getValue("type");
		out.beginDisplay = outs.begin.getDisplayValue();
		out.beginValue = outs.getValue("begin");
		out.duration = outs.duration.getDisplayValue();
		data.outages.push(out);
	}
}