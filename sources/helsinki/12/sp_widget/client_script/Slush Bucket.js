function() {
	var c = this;

	// Not currently used, just an example
	
	c.all = [];
	c.all.push({"label":"One","sys_id":"12349"});
	c.all.push({"label":"Two","sys_id":"12358"});
	c.all.push({"label":"Three","sys_id":"12367"});
	c.all.push({"label":"Four","sys_id":"12346"});
	c.all.push({"label":"Five","sys_id":"12355"});
	c.all.push({"label":"Six","sys_id":"12364"});
	c.all.push({"label":"Seven","sys_id":"12343"});
	c.all.push({"label":"Eight","sys_id":"12352"});
	c.all.push({"label":"Nine","sys_id":"12361"});
	c.all.push({"label":"Ten","sys_id":"12340"});
	c.all.push({"label":"Eleven","sys_id":"12352"});
	c.all.push({"label":"Twelve","sys_id":"12363"});
	c.all.push({"label":"Thirteen","sys_id":"12344"});
	c.all.push({"label":"Fourteen","sys_id":"12359"});
	c.all.push({"label":"Fifteen","sys_id":"12366"});

	c.selected = [];

	c.update = function() {
		console.log(c.selected);
	}

}