var Calendar_BaseFactory = Class.create();
Calendar_BaseFactory.prototype = {
    initialize: function() {
    },
	getWrapperType: function(resourceName, params) {
		switch (resourceName + "") {
			case "CALENDAR":
				return new CalendarRESTHelper();
		}
	},
    type: 'Calendar_BaseFactory'
};