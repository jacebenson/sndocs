data.subscribedMsg = gs.getMessage("Subscribed to updates");

data.categories = [];
var svs = new GlideRecord("cmdb_ci_service");
svs.addQuery("sys_class_name", "cmdb_ci_service");
svs.setLimit(options.number_of_services || 250);
svs.orderBy("category");
svs.orderBy("name");
svs.query();
var currentCategory = "-";
var catIndex = -1;
while (svs.next()) {
	var cat = svs.getValue("category");
	if (cat != currentCategory) {
		catIndex++;
		currentCategory = cat;
		data.categories[catIndex] = {};
		data.categories[catIndex].name = cat;
		data.categories[catIndex].label = svs.getDisplayValue("category");
		if (data.categories[catIndex].label == "")
			data.categories[catIndex].label = gs.getMessage("Service");
		data.categories[catIndex].services = [];
	}
	var svc = {};
	svc.sys_id = svs.getUniqueValue();
	svc.name = svs.getDisplayValue();
	svc.subscribed = isSubscribed(svc.sys_id);
	var outs = [];
	for (var i = 0; i <= 4; i++) {
		var out = new GlideAggregate("cmdb_ci_outage");
		out.addQuery("cmdb_ci", svs.getUniqueValue());
		out.addQuery("end", ">=", gs.daysAgoStart(i));
		out.addQuery("begin", "<=", gs.daysAgoEnd(i));
		out.addAggregate('COUNT', 'type');
		out.query();
		var svcOutageDay = {};
		svcOutageDay.count = 0;

		while (out.next()) {
			var type = out.type;
			var typeCount = out.getAggregate('COUNT', 'type');
			svcOutageDay[type] = typeCount;
			svcOutageDay.count += typeCount;
		}
		svcOutageDay.icon = "fa-check-circle";		
		svcOutageDay.msg = gs.getMessage("{0} - no outage - ", svc.name);
		if (svcOutageDay.count > 1) {
			svcOutageDay.icon = "fa-plus-circle";
			svcOutageDay.msg = gs.getMessage("{0} - multiple issues - ", svc.name);
		} else if (svcOutageDay.outage > 0) {
			svcOutageDay.icon = "fa-exclamation-circle";			
			svcOutageDay.msg = gs.getMessage("{0} - outage - ", svc.name);
		} else if (svcOutageDay.degradation > 0) {
			svcOutageDay.icon = "fa-minus-circle";		
			svcOutageDay.msg = gs.getMessage("{0} - degradation of service - ", svc.name);
		} else if (svcOutageDay.planned > 0) {
			svcOutageDay.icon = "fa-info-circle";			
			svcOutageDay.msg = gs.getMessage("{0} - planned maintenance - ", svc.name);
		}
		outs.push(svcOutageDay);
	}
	svc.outages = outs;
	data.categories[catIndex].services.push(svc);
}
data.dates = [];
for (var i = 5; i > 0; i--)
	data.dates.push(new GlideDateTime(gs.daysAgo(i - 1)).getLocalDate().getDisplayValueInternal());

function isSubscribed(id) {
	var subs = new GlideRecord("m2m_sp_status_subscription");
	subs.addQuery("sys_user", gs.getUserID());
	subs.addQuery("cmdb_ci_service", id);
	subs.query();
	return subs.hasNext();
}