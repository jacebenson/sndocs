var PACommonUtil = Class.create();
PACommonUtil.prototype = {
    initialize: function() {
    },
    type: 'PACommonUtil'
};
PACommonUtil.isPremiumEnabled = function(){
	return SNC.PAUtils.isPremium();
};