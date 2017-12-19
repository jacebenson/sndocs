var CTIEvaluator = Class.create();

CTIEvaluator.prototype = {

	initialize: function(expression, args) {
		this.expression = expression;
		this.map = new Packages.java.util.HashMap();
		for (var prop in args) {
			this.map.put(prop, args[prop]);
		}
	},
	
	/**
	 *	Evaluates the expression passed to the CTIEvaluator constructor
	 *	in the global scope, using temporary global variables in the supplied map.
	 *	Returns whatever object is created by the expression which was evaluated.
	 **/
	evaluate: function() {

		var ret = new GlideEvaluator().evaluateStringWithGlobals(this.expression, this.map);
		
		// If we got a string back, it will be wrapped as a NativeJavaObject because GlideEvaluator
		// is an ordinary Java class, not a Rhino ScriptableObject class like GlideRecord for example.
		// So coerce the value to a normal string before returning it.
		
		if (ret instanceof String)
			ret = ret + '';
		
		return ret;
	},
	
	expression: '',
	map: null,

	type: 'CTIEvaluator'
};