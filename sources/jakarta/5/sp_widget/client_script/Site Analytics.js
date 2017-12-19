function($rootScope, $location, $scope) {
	/**
	*
	* Go to the Header widget and add this to the template: 
	* <widget id="widget-site-analytics" options="{trackingid: 'UA-XXXXX-Y'}"></widget>
	* 
	*/

	var c = this;

	if (c.data.options.trackingid) {
		ga.create('create', c.data.options.trackingid, c.options.cookieDomain | 'auto');
	}

	function track() {
		var page = '';
		if (c.data.options.trackingid) {
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
	}

	track();

	$rootScope.$on('$locationChangeSuccess', track);
}