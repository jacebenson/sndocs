(function() {
	data.monthTranslations = {
		'Jan': gs.getMessage("Jan"),
		'Feb': gs.getMessage("Feb"),
		'Mar': gs.getMessage("Mar"),
		'Apr': gs.getMessage("Apr"),
		'May': gs.getMessage("May"),
		'Jun': gs.getMessage("Jun"),
		'Jul': gs.getMessage("Jul"),
		'Aug': gs.getMessage("Aug"),
		'Sep': gs.getMessage("Sep"),
		'Oct': gs.getMessage("Oct"),
		'Nov': gs.getMessage("Nov"),
		'Dec': gs.getMessage("Dec")
	};

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
		svc.safeName = GlideStringUtil.escapeHTML(svc.name);
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
			svcOutageDay.msg = gs.getMessage("{0} - no outage", svc.safeName);
			if (svcOutageDay.count > 1) {
				svcOutageDay.icon = "fa-plus-circle";
				svcOutageDay.msg = gs.getMessage("{0} - multiple issues", svc.safeName);
			} else if (svcOutageDay.outage > 0) {
				svcOutageDay.icon = "fa-exclamation-circle";
				svcOutageDay.msg = gs.getMessage("{0} - outage", svc.safeName);
			} else if (svcOutageDay.degradation > 0) {
				svcOutageDay.icon = "fa-minus-circle";
				svcOutageDay.msg = gs.getMessage("{0} - degradation of service", svc.safeName);
			} else if (svcOutageDay.planned > 0) {
				svcOutageDay.icon = "fa-info-circle";
				svcOutageDay.msg = gs.getMessage("{0} - planned maintenance", svc.safeName);
			}
			outs.push(svcOutageDay);
		}
		svc.outages = outs;
		data.categories[catIndex].services.push(svc);
	}
	data.dates = [];
	for (var i = 5; i > 0; i--) {
		var d = new GlideDate();
		d.subtract(1000 * 3600 * 24 * (i - 1));
		data.dates.push(d.getDisplayValueInternal());
	}

	function isSubscribed(id) {
		var subs = new GlideRecord("m2m_sp_status_subscription");
		subs.addQuery("sys_user", gs.getUserID());
		subs.addQuery("cmdb_ci_service", id);
		subs.query();
		return subs.hasNext();
	}
})();