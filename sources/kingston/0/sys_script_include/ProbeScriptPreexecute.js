var ProbeScriptPreexecute = Class.create();
ProbeScriptPreexecute.prototype = {
    initialize: function(probe) {
		this.probe = probe;
		this.init();
	},
	
	// Override these methods in classes that extend this one
	init: function() {},
	run: function() {},

    type: 'ProbeScriptPreexecute'
};