/*
 * Returns true if the given value is an instance of a Java object (as opposed to a JavaScript primitive, 
 * JavaScript object, null, or undefined).
 */
isJavaObject = function(val) {
   if (val == null)
	   return false;
  
   if (val instanceof Packages.java.lang.Object)
	   return true;
	
   return GlideJSUtil.isJavaObject(val, val.constructor)
}