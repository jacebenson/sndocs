function($rootScope, $location, $scope) {
	/**
	* Go to the Header widget and add this to the template: <sp-widget widget="data.siteAnalytics"></sp-widget>
	* And this in the Server Script: data.siteAnalytics = $sp.getWidget('widget-site-analytics', {trackingId: 'UA-XXXXX-Y', cookieDomain: 'auto'});
	* update the TrackingId value.
	*/

	var c = this;

	if (c.params.trackingId) {
		ga.create('create', c.params.trackingId, c.params.cookieDomain | 'auto');
	}

	function track() {
		var page = '';
		if (c.params.trackingId) {
			var params = $location.search();

			if (params.id) {
				page = '/' + params.id;
				delete params.id;
			} else {
				page = '/index';
			}

			var qs = $.param(params);
			if (qs.length > 0) {
				page += '/?' + qs;
			}

			ga('send', 'pageview', page);
		}
	};

	track();

	$rootScope.$on('$locationChangeSuccess', track);
}