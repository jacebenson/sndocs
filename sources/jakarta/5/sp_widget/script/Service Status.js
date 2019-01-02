// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.systemStatusBreadcrumb = gs.getMessage("System Status");
data.service = $sp.getParameter("service");
var service = new GlideRecord("cmdb_ci_service");
if (service.get(data.service))
  data.serviceDisplay = service.getDisplayValue();
else
	(data.service = null);
data.days = [];
for (var i = 89; i >= 0; i--) {
  var day = {};
  day.date = new GlideDateTime(gs.daysAgo(i)).getLocalDate().getDisplayValue();
  var out = new GlideAggregate("cmdb_ci_outage");
  out.addQuery("cmdb_ci", service.getUniqueValue());
  out.addQuery("end", ">=", gs.daysAgoStart(i));
  out.addQuery("begin", "<=", gs.daysAgoEnd(i));
  out.addAggregate('COUNT', 'type');
  out.query();
  day.count = 0;

  while (out.next()) {
    var type = out.type;
    var typeCount = out.getAggregate('COUNT', 'type');
    day[type] = typeCount;
    day.count += typeCount;
  }
  day.msg = gs.getMessage("No issues");
  day.color = "#5cb85c";
  if (day.count > 1) {
    day.msg = gs.getMessage("Multiple issues");
    day.color = "#6E4CDD";
  } else if (day.outage > 0) {
    day.msg = gs.getMessage("Outage");
    day.color = "#BB0000";
  } else if (day.degradation > 0) {
    day.msg = gs.getMessage("Service degradation");
    day.color = "#f0ad4e";
  } else if (day.planned > 0) {
    day.msg = gs.getMessage("Planned maintenance");
    day.color = "#5bc0de";
  }
  data.days.push(day);
}