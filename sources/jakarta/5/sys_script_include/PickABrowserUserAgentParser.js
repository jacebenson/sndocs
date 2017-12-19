gs.include('ClientTestRunnerBrowserInfo');
var PickABrowserUserAgentParser = Class.create();
PickABrowserUserAgentParser.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	/**
	 * Customized function to parse the user agent string.
	 * @returns clientTestRunnerBrowserInfo object 
	 * that contains name, version, osName and osVersion
	 * {browserName: 'Chrome', version: '32', osName: 'Mac OS X', osVersion: '10_10_5'}
	 * return null to fallback to the OOB user agent parsing
	 */
	parseUserAgent: function(userAgent) {
		return null;
	},
	type: 'PickABrowserUserAgentParser'
});