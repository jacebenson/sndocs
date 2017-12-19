var GoogleMapsHelper = Class.create();

GoogleMapsHelper.google_queueRequest = function(address, record) {
	var request = new GlideRecord("sys_geocoding_request");
	request.initialize();
	request.setNewGuid();
	request.address = address;
	request.record_table = record.getRecordClassName();
	request.record = record.sys_id;
	request.insert();
};

GoogleMapsHelper.google_getLatLong = function(addr) {
	var geo_auto = "google.maps.geocoding.automation";
	var gl = new GSLog("google.maps.logging", "GoogleMapsHelper.google_getLatLong");
	var url = "https://maps.googleapis.com/maps/api/geocode/json";
	var query = "address=" + addr + "&sensor=false&client=" + gs.getProperty("google.maps.client");
	var parms = new String(query).replaceAll(" ", "+");
	var url_to_sign = "/maps/api/geocode/json?" + parms;


	gl.logDebug("signing url: " + url_to_sign);
	var signature = GoogleMaps.generateSignature(url_to_sign);
	gl.logDebug("signature: " + signature);

	parms += "&signature=" + signature;

	var lat = 0,
		lng = 0;

	//Prevent automation from using geocoding license unless explicitly turned on
	if (gs.getProperty("glide.test_instance", "false") == "true") {
		gl.logDebug("Determined this is an instance used for automation. Checking if we should use proceed with geocoding");
		//This is an automation instance
		if (gs.getProperty(geo_auto, "false") == "false") {
			gl.logDebug(geo_auto + " is undefined or set to false. Not geocoding");
			//If the geocoding automation flag is set to true, then perform normal geocoding
			return [lat, lng];
		}
		gl.logDebug(geo_auto + " was set to true. Making geocoding request");
	}
	gl.logDebug("Making geocoding request");
	var ws = new HTTPAdaptor(url);
	var jsonOutput = ws.doGet(parms);

	try {
		var output = new JSONParser().parse(jsonOutput); 
		if (output.status == "OK") {
			lat = output['results'][0]['geometry']['location']['lat'];
			lng = output['results'][0]['geometry']['location']['lng'];
		} else if (output.status == "ZERO_RESULTS") {
			gl.logWarning("Unable to find address: " + addr);
		} else {
			gl.logErr("Unknown response: " + jsonOutput);
		}
	} catch (err) {
		gl.logErr("Geocoding error: " + jsonOutput);
	}

	return [lat, lng];
};