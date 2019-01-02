/**
 * JavaScript utility functions.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var JSUtil = Class.create();

/**
 * Returns a map (Object) that is the union of all the given maps.
 */
JSUtil.union = function(maps) {
    var result = {};
    for (var i = 0; i < arguments.length; i++) {
        var map = arguments[i];
        for (var name in map)
            result[name] = map[name];
    }
    return result;
};

/**
 * Removes entries from the given map.  The second argument defines what will be removed.  If it 
 * is an array, it is treated as an array of names to remove.  If it is an object, the names of
 * its properties are the names to remove.  Otherwise, it is coerced to a string as the name of
 * the single item to remove.
 */
JSUtil.removeFromMap = function(map, names) {
    var nms;
    if (names instanceof Array)
        nms = names;
    else if (names instanceof Object) {
        nms = [];
        for (var name in names)
            nms.push(name);
    }
    else
        nms = ['' + names];

    for (var i = 0; i < nms.length; i++) {
        if (nms[i] in map)
           delete map[nms[i]];
    }
};
 
/*
 *  Returns true if item is defined but has no properties or functions. (handy for associative arrays)
 */
JSUtil.isEmpty = function(item) {
    var result=false;
    if (JSUtil.notNil(item)) {
        result=true;
        for (var i in item) {
            result=false;
            break;
        }
    }
    return result;
};


/*
 * Returns true if the given item is not null and is not undefined.
 */
JSUtil.has = function(item) {
    return (item != null) && (typeof item != 'undefined');
};

/*
 * Returns true if the given item is null or is undefined (the logical inverse of .has(), above).
 */
JSUtil.doesNotHave = function(item) {
    return !JSUtil.has(item);
};

/*
 * Returns true if the given item is null, undefined, or evaluates to the empty string.
 */
JSUtil.nil = function(item) {
    if (JSUtil.isJavaObject(item))
        return GlideJSUtil.isNilJavaObject(item);

    return (item == null) || (typeof item == 'undefined') || ('' == '' + item);
};

/*
 * Returns true if the given item exists and is not empty (the logical inverse of .nil(), above).
 */
JSUtil.notNil = function(item) {
    return !JSUtil.nil(item);
};

/*
 * Returns the Rhino global object.
 */
JSUtil.getGlobal = function(){
  return (function(){
    return this;
    }).call(null);
};

/*
 * Returns true if the given item is a member of the given class.  For JavaScript objects, this method behaves exactly
 * like the JavaScript operator "instanceof".  However, this method (unlike the JavaScript operator) also tests Java
 * objects.
 * 
 * item: the object to be tested.
 * klass: the class to be tested (for Java objects, must be the complete class name, like "java.util.ArrayList").
 */
JSUtil.instance_of = function(item, klass) {
	
	if (JSUtil._isString(klass)) {
		item = GlideRhinoHelper.getNativeFromRhino(item);
		if (JSUtil.isJavaObject(item))		
			return GlideJSUtil.isInstanceOf(item, klass);
		
		return false;  
	}
	
	return item instanceof klass;
};

JSUtil._isString = function(val) {
	return (typeof val == 'string' || val instanceof String);
};

/*
 * Returns the type of the given value as a string, as follows:
 *   'null'     if the given value is null or undefined
 *   'string'   if the given value is a primitive string or a String wrapper instance
 *   'number'   if the given value is a primitive number or a Number wrapper instance
 *   'boolean'  if the given value is a primitive boolean or a Boolean wrapper instance
 *   'function' if the given value is a function
 *   'object'   otherwise (including if it is a Java object)
 * 
 * See also: typeOf() which returns these or for Objects implented with 'type:' (such as 
 *           Script Includes that use our default boilerplate), this returns that type
 *           which is intended to be the Javascript 'className' of the object.  
 */
JSUtil.type_of = function(value) {
    if (value == null)
        return 'null';
    
    if (JSUtil.isJavaObject(value))
        return 'object';
        
    var t = typeof value;
    if ((t == 'string') || (t == 'number') || (t == 'boolean') || (t == 'function'))
        return t;
        
    if ((value instanceof String) || ('' + value.constructor).match(/^function String\(\)/))
        return 'string';
        
    if (value instanceof Number)
        return 'number';
        
    if (value instanceof Boolean)
        return 'boolean';
        
    return 'object';
};


/**
 * Returns the type of the given value.  
 * 
 * If 'x' is JavaObject, then this is the class name,
 *
 * If 'x' is a JavaScript object from a JS Class (like our Script Include boilerplate) 
 * then this is the value of the 'type' property which is meant to be the JavaScript
 * class name,
 *
 * If 'x' is a JavaScript Array, then this returns 'array',
 *
 * If 'x' is a JavaScript Date, this returns 'date'
 *
 * Otherwise this returns the JavaScript type: string, number, boolean or object as per 
 * the type_of method (above).
 *
 * See Also: type_of
 */
JSUtil.typeOf = function(x) {
	if (typeof x === 'undefined')
		return 'undefined';

	if (x instanceof Array)
		return "array";
	
	if (x instanceof Date)
		return "date";
	
	var t = JSUtil.type_of(x);
	
	if (t === 'object' && !JSUtil.isJavaObject(x) && typeof(x.type) === 'string')
		return x.type;
	
	return t;
}
	

/*
 * Returns true if the given value is an instance of a Java object.
 */
JSUtil.isJavaObject = function(value) {
   if (value == null)
	   return false;
  
   if (value instanceof Packages.java.lang.Object)
	   return true;
		
   return SNC.JSUtil.isJavaObject(value);
};

/*
 * Coerces the given item to a boolean.  If the given item is a boolean, it is passed through.  Non-zero numbers return true.  Null or
 * undefined returns false.  Strings return true only if exactly equal to 'true'.  
 */
JSUtil.toBoolean = function(item) {
    if (!JSUtil.has(item))
        return false;
        
    if (typeof item == 'boolean')
        return item;
        
    if (typeof item == 'number')
        return item != 0;
        
    if ((typeof item == 'string') || ((typeof item == 'object') && (item instanceof String)))
        return item == 'true';
        
    // if we get here then we've got either a non-String object or a function; always return true for these...
    return true;
};

/*
 * Returns the value in a boolean GlideRecord field.
 */
JSUtil.getBooleanValue = function(gr, field) {
    var val = gr.getValue(field);
    return (val == 'true') || (val == '1');
};

/**
 * Determines whether a value exists within an object or not.
 * @param {} container The haystack to search within.
 * @param {} value The expected needle value to compare against.
 * @param boolean|undefined compareByIdentity If true, uses === for comparison; == otherwise.
 * @return True if value exists in container, False otherwise.
 */
JSUtil.contains = function(container, value, compareByIdentity) {
	if (compareByIdentity) {
		// identity
		for (var key in container) {
			if (container[key] === value)
				return true;             
		}
	} else {
		// equality
		for (var key in container) {
			if (container[key] == value)
				return true;             
		}	
	}
	
    return false;
};

/*
 * Returns true if the two given values are equivalent, and optionally logs any differences.  The two
 * values may be any value - JavaScript primitives or objects.  Objects of classes Object, Array, Date,
 * String, Boolean, and Number are all compared correctly and (as necessary) recursively.  Note that 
 * comparand types much match exactly - for the purposes of this comparison, 'abc' does NOT match
 * new String('abc').  If differences are logged, they may be retrieved from JSUtil.areEqualLog.
 */
JSUtil.areEqualLog = '';
JSUtil.areEqual = function(val1, val2, logDiff) {
    JSUtil.areEqualLog = '';
    if (typeof val1 != typeof val2) {
        log('Different type: ' + val1 + ' (' + typeof val1 + ') and ' + val2 + ' (' + typeof val2 + ')');
        return false;
    }
    
    // if we have two undefineds, we're good...
    if (typeof val1 == 'undefined')
        return true;
    
    // handle the awkward case of null...
    if ((val1 === null) || (val2 === null)) {
        if (val1 === val2)
            return true;
        
        log('Null and ' + ((val1 === null) ? typeof val2 : typeof val1));
        return false;
    }
    
    // if we've got a primitive type, directly compare...
    if (!(val1 instanceof Object)) {
        if (val1 === val2)
            return true;
        
        log('Different primitive ' + typeof val1 + ' values: ' + val1 + ' and ' + val2);
        return false;
    }
    
    // make sure we've got a object types here...
    if (typeof val1 != 'object') {
        log('Unexpected type: ' + typeof val1);
        return false;
    }
    
    // handle any Java objects passed in...
    if (isJavaObject(val1) || isJavaObject(val2)) {
        if (isJavaObjectVal1() && isJavaObject(val2)) {
            if (val1.equals(val2))
                return true;
            
            log('Different Java objects');
        }
        log('Java object and JavaScript object');
        return false;
    }
    
    // make sure we've got two JavaScript objects of the same type...
    var vc1 = val1.constructor.name;
    var vc2 = val2.constructor.name;
    if (vc1 != vc2) {
        log('Different JavaScript object types: ' + val1.constructor.name + ' and ' + val2.constructor.name);
        return false;
    }
    
    // handle case of two JavaScript objects in the same class that return primitives for valueOf()...
    if ((vc1 == 'Boolean') || (vc1 == 'Date') || (vc1 == 'Number') || (vc1 == 'String')) {
        if (val1.valueOf() == val2.valueOf())
            return true;
        
        log('Different ' + vc1 + ' primitive wrapper values: ' + val1.valueOf() + ' and ' + val2.valueOf());
        return false;
    }
    
    // if we've got two arrays, compare recursively element by element...
    if (val1.constructor.name == 'Array') {
        // we'd better be the same size!
        if (val1.length != val2.length) {
            log('Different array lengths: ' + val1.length + ' and ' + val2.length);
            return false;
        }
        
        // compare all our elements, in order...
        for (var i = 0; i < val1.length; i++) {
            if (JSUtil.areEqual(val1[i], val2[i], logDiff))
                continue;
            
            log('Different array element values: ' + val1[i] + ' and ' + val2[i]);
            return false;
        }
        return true;
    }
    
    // if we've got two objects, compare elements recursively and check for leftovers...
    if (val1.constructor.name == 'Object') {
        // collect all the property names in val2...
        var vp2 = {};
        for (var vn2 in val2)
            vp2[vn2] = true;
        
        // see if we have exactly the same properties in val1...
        for (var vn1 in val1) {
            if (vp2[vn1]) {
                delete vp2[vn1];
                continue;
            }
            
            log('Different properties');
            return false;
        }
        for (var vn2 in vp2) {
            log('Different properties');
            return false;
        }
        
        // ok, we have the same properties - but do they have the same values?
        for (var vn1 in val1) {
            if (JSUtil.areEqual(val1[vn1], val2[vn1], logDiff))
                continue;
            
            log('Properties have different values');
            return false;
        }
        return true;
    }
    
    // if we get here, then we've got two objects of unknown object types...
    log('Unknown object type: ' + val1.constructor.name);
    return false;
    
    function log(msg) {
        if (!logDiff)
            return;
        
        JSUtil.areEqualLog += msg;
        JSUtil.areEqualLog += '\n';
    }
};

/*
 * Logs all the properties (recursively) in the given object: name, type, and value.  The optional second parameter is a name for the logged object.
 */
JSUtil.logObject = function(obj, name) {
    gs.log(JSUtil.describeObject(obj, name));
};

/*
 * Returns a string that recursively describes all the properties in the given object: name, type, and value.  
 * The optional second parameter is a name for the logged object.
 */
JSUtil.describeObject = function(obj, name) {
    var result = [];
    result.push('Log Object' + ((name) ? ': ' + name : ''));
    if ((typeof(obj) != 'object' && typeof(obj) != 'string') || obj == null)
        result.push('  null, undefined, or not an object: ' + typeof(obj) );
    else
        JSUtil._describeObject(obj, null, '  ', 0, result);
    return result.join('\n');
};

/*
 * Internal recursive object description string builder.
 */
JSUtil._describeObject = function(obj, name, lead, level, result) {
    if (level > 25) {
        result.push(lead + '<<< exceeded 25 recursion levels, ignoring any deeper levels >>>');
        return;
    }
	
    var ns = (name == null) ? '' : name + ': ';
    var value = obj;
    var type = JSUtil.type_of(value);
    if (type == 'function') {
        result.push(lead + ns + type);
        return;
    }
    else if (type != 'object') {
        result.push(lead + ns + type + ' = ' + value);
        return;
    }

    if (value instanceof Array) {
        result.push(lead + ns + 'Array of ' + value.length + ' elements');
        for (var i = 0; i < value.length; i++)
            JSUtil._describeObject(value[i], '[' + i + ']', lead + '  ', level + 1, result);
    }
    else {
        if (JSUtil.isJavaObject(obj)) {
			var klassName = GlideJSUtil.getJavaClassName(obj);
            result.push(lead + ns + 'Java Object: ' + klassName + ' = ' + obj);
        }
        else if (obj instanceof GlideRecord) {
            var rec = (!gs.nil(obj.getDisplayValue())) ? '@ ' + obj.getDisplayValue() : '';
            result.push(lead + ns + 'GlideRecord(\'' + obj.getTableName() + '\') ' + rec);
        }
        else {
 		   if (typeof obj.explainLock == 'function') {  // is this a GlideElement of some kind?
                var nm = obj.getName();
                var vl = obj.getDisplayValue();
                result.push(lead + ns + 'GlideElement (or child class): ' + nm + ' = ' + vl);
		    } else
                result.push(lead + ns + 'Object');
            for (var nmo in obj)
                JSUtil._describeObject(obj[nmo], nmo, '  ' + lead, level + 1, result);
        }
    }
};

/*
 * NOTE: between this banner and the following banner, several string literals are specified in an odd way: by the contatenation of a single
 *       character ('&') and the remainder of the HTML entity (such as 'amp;').  This method was employed to avoid having the entities translated 
 *       into the equivalent characters when the script include is edited in the instance.
 */
JSUtil.AMP     = /\&/g;
JSUtil.GT      = /\>/g;
JSUtil.LT      = /\</g;
JSUtil.QT      = /\"/g;
JSUtil.AMP_ENT = new RegExp( '\\&' + 'amp;',  'g' );
JSUtil.GT_ENT  = new RegExp( '\\&' + 'gt;',   'g' );
JSUtil.LT_ENT  = new RegExp( '\\&' + 'lt;',   'g' );
JSUtil.QT_ENT  = new RegExp( '\\&' + 'quot;', 'g' );

JSUtil.escapeText = function(text) {

    var ampRegex = new SNC.Regex('/&/');
    var ltRegex = new SNC.Regex('/</');
    var gtRegex = new SNC.Regex('/>/');

    var result = ampRegex.replaceAll('' + text, '&' + 'amp;');
    result = ltRegex.replaceAll(result, '&' + 'lt;');
    return gtRegex.replaceAll(result, '&' + 'gt;');

};

JSUtil.unescapeText = function(text) {

    var ampRegex = new SNC.Regex('/&' + 'amp;/');
    var ltRegex = new SNC.Regex('/&' + 'lt;/');
    var gtRegex = new SNC.Regex('/&' + 'gt;/');

    var result = ampRegex.replaceAll('' + text, '&');
    result = ltRegex.replaceAll(result, '<');
    return gtRegex.replaceAll(result, '>');

};

JSUtil.escapeAttr = function(attr) {
    var result = ('' + attr).replace(JSUtil.AMP, '&' + 'amp;');
    return result.replace(JSUtil.QT, '&' + 'quot;');
};

JSUtil.unescapeAttr = function(attr) {
    var result = ('' + attr).replace(JSUtil.QT_ENT, '"');
    return result.replace(JSUtil.AMP_ENT, '&');
};


/** Render an expanded/evaluted string from a string that may contain one
 *  or more Javascript expressions, each wrapped in a dolloar-braces 
 *  delimiter pattern. 
 *
 *     'The timeis:${newGlideDateTime()}'
 *
 *  will displaythecurrenttime.
 *
 *  When used in specific contexts, such as inside a workflow context
 *  certain global variables might be usable such as 'current' or 'workflow':
 *
 *      'WF State:${context.state},rec:${current.sys_id}'
 *  
 *  and content can be substituted into data from various Javascripts:
 *
 *      <CREATED>${newGlideDateTime()}</CREATED>
 * 
 *  WARNING: This is used heavily by workflows.  If this is changed, then 
 *           be sure to run all workflow tests. Test Log Message activity
 *           with ${workflow.variables.somevariable} and similar usages.
 */
JSUtil.strEval = function(str) {
	var s = new String(str);
	
	// if the entire string is within a ${} return the eval of it
	// to allow getting an object back from this method
	//
	if (s.startsWith("${") && s.endsWith("}") && (s.indexOf("${", 2) == -1))
		return eval(s.substring(2, s.length - 1));
	
	// also replace anything with ${something} to eval(something)
	//
	s = s.replace( /\$\{\s*(.*?)\s*\}/g, function(str, p1) {
		return (eval(p1) || "")
	});
	if (s.indexOf('javascript:') == 0)
		s = eval(s.substring(11));
	return s;
};

/*
 * End of odd string construction...
 */

JSUtil.prototype = {
    type: "JSUtil"
};