/**
 * Only add methods here that are safe to apply to all objects extending General
 * 
 * 
 * 
 * @author SERVICE-NOW\walter.brame
 */
var General = Class.create();
General.STATICS = {};
General.STATICS.DEBUG = '';
General.STATICS.DEBUG_ARG = 'debug';
General.STATICS.PROP = 'general.application.debug';
General.prototype = {
	initialize : function() { // this function won't be executed because only init is called from GeneralForm
		this.initDebug(General
				.getProperty(General.STATICS.PROP + this.getType()));
		this.init.apply(this, arguments);
	},
	
	init : function() {	
		var args2 = {};
		for ( var i = 0; i < arguments.length; i += 1) {
			var args = arguments[i];
			for ( var arg in args) {		
				if (args.hasOwnProperty(arg)) {
					if (!args2[this.getType()]) {
						args2[this.getType()] = {};
					}
					args2[this.getType()][arg] = args[arg];
					// The default behavior is to assign whatever is passed in
					// but special cases can be handled here
					if (arg == General.STATICS.DEBUG_ARG) {
						var deb = args[arg];
						this.initDebug(deb); // Caller controlled debug
					} else {
						this[arg] = args[arg];     // args.value are set to the args.key, referring to your original construction();
					}
				}
			}
		}

		if (this.debug.level >= 3) {
			for ( var arg2 in args2) {
				if (args2.hasOwnProperty(arg2)) {
					this.debug.log(3, 'INIT: ' + arg2);
					var args1 = args2[arg2];
					for ( var arg1 in args1) {
						if (args1.hasOwnProperty(arg1)) {
							this.debug.log(3, 'ARG: ' + arg1 + ' = '
									+ args1[arg1]);
						}
					}
				}
			}
		}
	},

	// The Class has an existing debugger object in OFF mode on initialize and
	// it
	// may be turned ON here with a (optional) prefix
	initDebug : function(deb) {
		this.debug = new GeneralDebug(this.getType(), null, 0);
		// A system property is always used to control the debugger default.
		// This makes it so debug can always be provided at any time even for
		// any existing callers that do not turn the debugger ON.
		if (deb) {
			if (deb.prefix) {
				this.debug.setMessagePrefix(deb.prefix);
			}
			if (deb.level) {
				this.debug.setDebugLevel(deb.level);
			}
		}
	},

	getDebugLevel : function() {
		return this.debug.level;
	},

	getType : function() {
		var ret = null;
		if (this.type) {
			ret = this.type;
		}
		return ret;
	},

	type : 'General'
};

/**
 * This will return a system property as normal but we can operate on it here
 * and create different types of results based on storing data in system
 * properties differently. Basically making this a system property processor.
 * 
 * <pre>
 * var p = GeneralForm.getProperty('my.properties');
 * 
 * for ( var name in p) {
 * 	gs.print(name + ' = ' + p[name]);
 * }
 * </pre>
 * 
 * @param systemProperty
 * @returns {}
 */
General.getProperty = function(systemProperty) {
	var property = gs.getProperty(systemProperty, null);
	var ret = null;
	if (property) {
		// If this is a property list
		if (property.indexOf(',') != -1) {
			ret = {};
			var propertyList = property.split(',');
			for ( var i = 0; i < propertyList.length; i += 1) {
				var prop = propertyList[i];
				var propSplit = prop.split(':');
				ret[propSplit[0]] = propSplit[1];
			}
		} else {
			ret = property;
		}
	}
	return ret;
};

General.startDebug = function(debug) {
	if (!debug
			|| (debug && ((!debug.level) || (debug.level && debug.level == 0)))) {
		return new GeneralDebug(this.getType(), null, 1);
	}
};