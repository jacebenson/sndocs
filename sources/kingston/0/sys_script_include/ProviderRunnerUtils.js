var ProviderRunnerUtils = Class.create();
ProviderRunnerUtils.prototype = {
    initialize: function() {
    },

	canProviderSupportRunner: function(current) {
		return SNC.ProviderRunner.canProviderSupportRunner(current);
	},
	
    type: 'ProviderRunnerUtils'
};