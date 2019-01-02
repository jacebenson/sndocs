function onLoad() {
	// Noop
}

addTopRenderEvent(function () {
	if (window.processChartDataResponse) {
		// Patching chart code to know when we get the response.
		// After we get the response we will know if the chart has data or not.
		var orgiProcessChartDataResponse = window.processChartDataResponse;
		window.processChartDataResponse = function(resp, args) {
			var chartDataNotAvailable = resp.STATUS != 'SUCCESS';
			var ret = orgiProcessChartDataResponse.call(this, resp, args);

			if (chartDataNotAvailable) {
				var chart = gel(args.chart_container_id);
				var parent = chart.parentNode;
				while (parent) {
					if (parent.nodeName.toLowerCase() === 'tr') { // Works for UI11 to 16
						hide(parent);
						break;
					}
					parent = parent.parentNode;
				}
			}
			return ret;
		};
	}
});