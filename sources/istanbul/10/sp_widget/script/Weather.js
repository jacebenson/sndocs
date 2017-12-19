data.enterLocMsg = gs.getMessage("Enter Location");

if (input) {
	var url = "https://query.yahooapis.com/v1/public/yql";
	var text = input.place;
	var parm = "select location,item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + text + "')";
	// call out to yahoo
	var ws = new GlideHTTPRequest(url);
	ws.addParameter("q", encodeURI(parm));
	ws.addParameter("format", "json");
	var response = ws.get();
	if (response) {			
		var response = JSON.parse(response.getBody());						
		if (response.query.results !== null) {
			data.errorMessage = false;
			data.channel = response.query.results.channel;	
		} else {			
			data.errorMessage = gs.getMessage("Can't find weather") + ": " + input.place;			
		}				
	} else {
		data.errorMessage = gs.getMessage("An error occurred while making the requested connection");
	}	
}