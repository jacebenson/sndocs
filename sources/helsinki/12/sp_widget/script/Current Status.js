// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
var outage = new GlideRecord("cmdb_ci_outage");
outage.addQuery("cmdb_ci.sys_class_name", "cmdb_ci_service");
outage.addQuery("begin", "<=", gs.nowNoTZ());
outage.addQuery("end", ">=", gs.nowNoTZ()).addOrCondition("end", "=", "NULL");
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
	out.details = outage.getValue("details");
	out.ci = outage.cmdb_ci.getDisplayValue();
	out.serviceID = outage.getValue("cmdb_ci");
	out.begin = outage.begin.getDisplayValue();
	data.outages.push(out);
	data.outageIDs += "," + outage.getUniqueValue();
}