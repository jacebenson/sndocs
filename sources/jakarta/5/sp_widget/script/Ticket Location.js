(function() {
	data.askingMsg = gs.getMessage("Asking browser for location");
	data.notEnabledMsg = gs.getMessage("Location Services not enabled");
	data.notDeterminedMsg = gs.getMessage("Location could not be determined");
	data.enableMsg = gs.getMessage("Enable 'Location Services' in Settings for Location Check In");
	data.fetchingMapMsg = gs.getMessage("Fetching map...");
	data.youAreHereMsg = gs.getMessage("You are here");

	var gr = $sp.getRecord();
	if (gr == null)
		return;

	data.canRead = gr.canRead();
	data.canWrite = gr.canWrite();
	data.table = gr.getTableName();
	data.sys_id = gr.getUniqueValue();
	var folks = [];

	if (input) {
		// add comment w/ checkin address
		if (typeof input.address != "undefined" && input.address != "") {
			gr.comments = gs.getMessage("Checked in from {0}", input.address);
			gr.update();
		}

		// insert GEO Checkin record
		if (typeof input.geodata != "undefined" && input.geodata != {}) {
			var geo = new GlideRecord("sys_user_geo_location");
			geo.latitude = input.geodata.latitude;
			geo.longitude = input.geodata.longitude;
			geo.address = input.geodata.address;
			geo.sys_user = input.geodata.sys_user;
			geo.insert();
		}

		// find nearby users
		var loc = new GlideRecord("sys_user_geo_location");
		loc.addQuery("latitude", "<=", input.maxLat);
		loc.addQuery("latitude", ">=", input.minLat);
		loc.addQuery("longitude", "<=", input.maxLon);
		loc.addQuery("longitude", ">=", input.minLon);
		loc.addQuery("sys_user", "!=", gs.getUserID());
		loc.query();
		var idx = 0;
		while (loc.next()) {
			var u = {};
			u.lat = loc.latitude.toString();
			u.lon = loc.longitude.toString();
			u.name = loc.sys_user.getDisplayValue();
			folks.push(u);
		}
	}
	data.others = folks;
	data.user = gs.getUserID();
})();