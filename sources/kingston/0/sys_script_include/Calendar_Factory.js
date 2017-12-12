var Calendar_Factory = Class.create();
Calendar_Factory.prototype = {
    initialize: function() {
    },
	getWrapperType: function(resourceName, params) {
	    switch (resourceName + "") {
	        case "CALENDAR":
				return new Calendar_BaseFactory().getWrapperType(resourceName);
		}
	},
    type: 'Calendar_Factory'
};