var SNSubscriptionUtils = Class.create();

SNSubscriptionUtils.prototype = {
    initialize: function() {
    },
	
	isOverAlloc: function(licenseGR) {
		if (licenseGR.allocated === 'N/A')
			return false;
		
		var alloc = parseInt(licenseGR.allocated);
		var count = parseInt(licenseGR.count);
		
		if (alloc > count)
			return true;
		
		return false;
	},
	
	allocExceedsThresh: function(licenseGR) {
		if (licenseGR.allocated === 'N/A')
			return false;
		
		var alloc = parseInt(licenseGR.allocated);
		var count = parseInt(licenseGR.count);
				
		if ( count > 0 && 
			(alloc *100/count) >= parseInt(gs.getProperty('subscription.used.thresh', 90)) &&
		     alloc <= count )
			return true;
		
		return false;
	},
	
	isUnderThresh: function(licenseGR) {
		if (licenseGR.allocated === 'N/A')
			return false;
		
		var alloc = parseInt(licenseGR.allocated);
		var count = parseInt(licenseGR.count);
		
		if (count == 0) 
			return true;
			
		if (count > 0 && 
			(alloc *100/count) < parseInt(gs.getProperty('subscription.used.thresh', 90)) )
			return true;
			
		return false;
	},

    type: 'SNSubscriptionUtils'
};