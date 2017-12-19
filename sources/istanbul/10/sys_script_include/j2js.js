/*
 * If the given value is a Java object that can be converted to an equivalent JavaScript object, that conversion is performed and
 * the result is returned.  Otherwise the original Java object is returned.
 * 
 * The specific conversions performed (in the order they are checked):
 *   -- Java Strings     -> JavaScript strings
 *   -- Java Booleans    -> JavaScript booleans
 *   -- Java Integers    -> JavaScript numbers
 *   -- Java Longs       -> JavaScript numbers
 *   -- Java Doubles     -> JavaScript numbers
 *   -- Java Bytes       -> JavaScript numbers
 *   -- Java Floats      -> JavaScript numbers
 *   -- Java Shorts      -> JavaScript numbers
 *   -- Java Characters  -> JavaScript numbers
 *   -- Java arrays      -> JavaScript Arrays with order preserved
 *   -- Java Lists       -> JavaScript Arrays with order preserved
 *   -- Java Maps        -> JavaScript Objects with the key/value pairs translated into property/value pairs
 *   -- Java Sets        -> JavaScript Arrays in arbitrary order
 *   
 * Note that the conversions are performed recursively on the elements of arrays, lists, or collections. For example, given a Java ArrayList of
 * ArrayLists of Strings, this will return a JavaScript Array of Arrays of strings.
 */
j2js = function(val) {
    if (!isJavaObject(val))
        return val;
		
	val = GlideRhinoHelper.getNativeFromRhino(val);
	
	var klassName = '' + GlideJSUtil.getJavaClassName(val);
    
    // if it's one of our simple classes, take the funky and run...
    var func = $__j2js_conversion_map[klassName];
    if (func)
        return func(val);
       
    // if it's an array, handle it...
	if (GlideJSUtil.isJavaArray(val))
		return handleArray(val);
 
    // not a simple class or an array, so now let's see if it's a collection type we can deal with...
	if (val instanceof Packages.java.util.List)
		return handleList(val);

	if (val instanceof Packages.java.util.Map)
		return handleMap(val);

	if (val instanceof Packages.java.util.Set)
		return handleSet(val);

    // it's not something we can morph, so return the original Java object...
    return val;
        
	function handleArray(val) {
        var result = [];
        var len = Packages.java.lang.reflect.Array.getLength(val);
        for (var i = 0; i < len; i++)
            result.push(j2js(Packages.java.lang.reflect.Array.get(val, i)));
        return result;
    }
    
	function handleList(val) {
        var result = [];
        for (var i = 0; i < val.size(); i++)
            result.push(j2js(val.get(i)));
        return result;
    }
    
	function handleMap(val) {
        var result = {};
        var it = val.keySet().iterator();
        while (it.hasNext()) {
            var key = it.next();
            var jsKey = j2js(key);
            var jsVal = j2js(val.get(key));
            result[jsKey] = jsVal;
        }
        return result;
    }
    
	function handleSet(val) {
        var result = [];
        var it = val.iterator();
        while (it.hasNext())
            result.push(j2js(it.next()));
        return result;
    }
}

$__j2js_conversion_map = {
    'java.lang.Boolean': function(val) {
        return val.booleanValue();
    },
    
    'java.lang.String': function(val) {
        return '' + val;
    },
    
    'java.lang.Integer': function(val) {
        return val.intValue();
    },
    
    'java.lang.Long': function(val) {
        return val.longValue();
    },
    
    'java.lang.Double': function(val) {
        return val.doubleValue();
    },
    
    'java.lang.Byte': function(val) {
        return val.byteValue();
    },
    
    'java.lang.Float': function(val) {
        return val.floatValue();
    },
    
    'java.lang.Character': function(val) {
        return val.charValue();
    },
    
    'java.lang.Short': function(val) {
        return val.shortValue();
    }
}