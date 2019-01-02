// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
var outage = new GlideRecord("cmdb_ci_outage");
outage.addQuery("begin", "<=", gs.daysAgoStart(-5));
outage.addQuery("end", ">=", gs.nowNoTZ());
outage.addQuery("type", "planned");
data.service = (input && input.service) || $sp.getParameter("service");
if (!GlideStringUtil.nil(data.service)) {
  outage.addQuery("cmdb_ci", data.service);
	var serviceGR = new GlideRecord("cmdb_ci_service");
	if (serviceGR.get(data.service))
		data.serviceDisplay = serviceGR.getDisplayValue();
}
outage.query();
data.outages = [];
data.outageIDs = "";
while (outage.next()) {
	var out = {};
	out.typeDisplay = outage.type.getDisplayValue();
	out.type = outage.getValue("type");
	out.ci = outage.cmdb_ci.getDisplayValue();
	out.begin = outage.begin.getDisplayValue();
	out.end = outage.end.getDisplayValue();
	out.serviceID = outage.getValue("cmdb_ci");
	data.outages.push(out);
	data.outageIDs += "," + outage.getUniqueValue();
}