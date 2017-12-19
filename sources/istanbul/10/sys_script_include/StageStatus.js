var StageStatus = Class.create();
StageStatus.prototype = {
    initialize: function(json) {
		if ( typeof (json) == 'undefined') {
			this.value = "";
			this.visited = [];
			return;
		}
		var deserialized = new JSON().decode(json);
		
		for ( var x in deserialized )
			this[x] = deserialized[x];
    },
	
	toString1 : function() {
		var s = new JSON().encode(this);
		
		return s;
	},
	
	getValue : function() {
		return this.value;
	},
	
	getVisited : function() {
		return this.visited;
	},
	
	setValue : function(v) {
		this.value = v;
	},
	
	setVisited : function(vi) {
		this.visited = vi;
	},
	
	addVist : function(vis) {
		if ( visited.indexOf(vis) == -1 )
			return;
		
		visited.push(vis);
	},
	
    type: 'StageStatus'
};