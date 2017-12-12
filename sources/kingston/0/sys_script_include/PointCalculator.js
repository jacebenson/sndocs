var PointCalculator = Class.create();
PointCalculator.prototype = {
	
    initialize: function(userGR) {
		this.user = userGR;
    },
	
	syncPointsToUserRecord: function() {
		this.user.points = this.calculate(); 
		this.user.update(); 
	}, 
	
	calculate: function() {
		var userID = this.user.getUniqueValue(); 
		var gaPoints = new GlideAggregate('x_snc_slack_points_point');
		gaPoints.addQuery('target', userID); 
		gaPoints.addAggregate('COUNT');
		gaPoints.query();
		if (gaPoints.next()) {
			var points = gaPoints.getAggregate('COUNT'); 
			return points; 
		} else {
			return 0;
		}
	},

    type: 'PointCalculator'
};