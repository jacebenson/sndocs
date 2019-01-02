function ($timeout) {
	var c = this;
	c.darkness = "";
	if (!c.options.c_color || !c.options.c_color.length)
		c.options.c_color = 'red';
	
	var z = c.options.zone || "America/Los_Angeles"
	c.date = moment().tz(z);
	c.majors = new Array(12);
	c.minors = new Array(60); 
	(function tick() {
		c.date = new moment().tz(z);
		var t = c.date.hours();
		c.darkness = "";
		if (t > 17)
			c.darkness = "evening";
		if (t > 19)
			c.darkness = "night";
		if (t < 5)
			c.darkness = "night";
		
		$timeout(tick, 1000);
	})();
}